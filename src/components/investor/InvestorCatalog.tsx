import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Heart, MapPin, Calendar, Euro, Search, Filter, TrendingUp, Handshake, Star, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { ProjectInterestModal } from "@/components/projects/ProjectInterestModal";
import { ConnectionRequestModal } from "./ConnectionRequestModal";
import { formatCurrency } from "@/lib/currency";

interface Project {
  id: string;
  title: string;
  description: string;
  sector: string;
  location: string;
  funding_goal: number;
  current_funding: number;
  min_investment: number;
  max_investment?: number;
  expected_roi?: number;
  risk_level: string;
  stage: string;
  team_size?: number;
  status: string;
  created_at: string;
  end_date?: string;
  owner_id: string;
  profiles?: {
    full_name: string;
    company?: string;
  };
}

interface Filters {
  search: string;
  sector: string;
  location: string;
  stage: string;
  riskLevel: string;
  minInvestment: number[];
  maxFunding: number[];
  expectedROI: number[];
}

export const InvestorCatalog = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showInterestModal, setShowInterestModal] = useState(false);
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  
  const { user, isInvestor } = useUserRole();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [filters, setFilters] = useState<Filters>({
    search: "",
    sector: "all",
    location: "",
    stage: "all",
    riskLevel: "all",
    minInvestment: [1000],
    maxFunding: [1000000],
    expectedROI: [0]
  });

  const sectors = ["all", "Agriculture", "Éducation", "Santé", "Énergie", "Fintech", "E-commerce", "Technologie", "Transport"];
  const stages = ["all", "ideation", "prototype", "mvp", "early_stage", "growth", "mature"];
  const riskLevels = ["all", "low", "medium", "high"];

  useEffect(() => {
    loadProjects();
    if (user && isInvestor()) {
      loadFavorites();
    }
  }, [user, filters]);

  const loadProjects = async () => {
    try {
      let query = supabase
        .from('projects')
        .select(`
          *,
          profiles:owner_id (
            full_name,
            company
          )
        `)
        .eq('status', 'active');

      // Appliquer les filtres
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }
      
      if (filters.sector !== "all") {
        query = query.eq('sector', filters.sector);
      }
      
      if (filters.location) {
        query = query.ilike('location', `%${filters.location}%`);
      }
      
      if (filters.stage !== "all") {
        query = query.eq('stage', filters.stage);
      }
      
      if (filters.riskLevel !== "all") {
        query = query.eq('risk_level', filters.riskLevel);
      }

      // Filtres numériques
      query = query
        .gte('min_investment', filters.minInvestment[0])
        .lte('funding_goal', filters.maxFunding[0]);

      if (filters.expectedROI[0] > 0) {
        query = query.gte('expected_roi', filters.expectedROI[0]);
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      
      setProjects(data || []);
    } catch (error: any) {
      console.error('Error loading projects:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les projets",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadFavorites = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('project_favorites')
        .select('project_id')
        .eq('user_id', user.id);

      if (error) throw error;
      
      const favoriteIds = new Set(data?.map(f => f.project_id) || []);
      setFavorites(favoriteIds);
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const toggleFavorite = async (projectId: string) => {
    if (!user || !isInvestor()) {
      toast({
        title: "Connexion requise",
        description: "Connectez-vous en tant qu'investisseur pour ajouter aux favoris",
        variant: "destructive"
      });
      return;
    }

    try {
      if (favorites.has(projectId)) {
        await supabase
          .from('project_favorites')
          .delete()
          .eq('project_id', projectId)
          .eq('user_id', user.id);
        
        setFavorites(prev => {
          const newSet = new Set(prev);
          newSet.delete(projectId);
          return newSet;
        });
        
        toast({
          title: "Retiré des favoris",
          description: "Le projet a été retiré de vos favoris"
        });
      } else {
        await supabase
          .from('project_favorites')
          .insert({ project_id: projectId, user_id: user.id });
        
        setFavorites(prev => new Set(prev).add(projectId));
        
        toast({
          title: "Ajouté aux favoris",
          description: "Le projet a été ajouté à vos favoris"
        });
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur s'est produite",
        variant: "destructive"
      });
    }
  };

  const handleExpressInterest = (project: Project) => {
    setSelectedProject(project);
    setShowInterestModal(true);
  };

  const handleRequestConnection = (project: Project) => {
    setSelectedProject(project);
    setShowConnectionModal(true);
  };

  const updateFilter = (key: keyof Filters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const calculateProgress = (raised: number, goal: number) => {
    return Math.min((raised / goal) * 100, 100);
  };

  const getDaysLeft = (endDate?: string) => {
    if (!endDate) return null;
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const getSectorEmoji = (sector: string) => {
    const emojis: { [key: string]: string } = {
      'Agriculture': '🌱',
      'Éducation': '📚',
      'Santé': '🏥',
      'Énergie': '⚡',
      'Fintech': '💰',
      'E-commerce': '🛍️',
      'Technologie': '💻',
      'Transport': '🚗'
    };
    return emojis[sector] || '🚀';
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStageLabel = (stage: string) => {
    const labels: { [key: string]: string } = {
      'ideation': 'Idéation',
      'prototype': 'Prototype',
      'mvp': 'MVP',
      'early_stage': 'Démarrage',
      'growth': 'Croissance',
      'mature': 'Mature'
    };
    return labels[stage] || stage;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Chargement du catalogue investisseur...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Catalogue <span className="text-primary">Investisseur</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Découvrez des opportunités d'investissement personnalisées avec des filtres avancés
          </p>
        </div>

        {/* Filtres avancés */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtres Avancés
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Ligne 1: Recherche et sélecteurs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Rechercher..."
                  value={filters.search}
                  onChange={(e) => updateFilter('search', e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={filters.sector} onValueChange={(value) => updateFilter('sector', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Secteur" />
                </SelectTrigger>
                <SelectContent>
                  {sectors.map(sector => (
                    <SelectItem key={sector} value={sector}>
                      {sector === "all" ? "Tous les secteurs" : sector}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filters.stage} onValueChange={(value) => updateFilter('stage', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Stade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les stades</SelectItem>
                  {stages.slice(1).map(stage => (
                    <SelectItem key={stage} value={stage}>
                      {getStageLabel(stage)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filters.riskLevel} onValueChange={(value) => updateFilter('riskLevel', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Risque" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous niveaux</SelectItem>
                  <SelectItem value="low">Risque faible</SelectItem>
                  <SelectItem value="medium">Risque moyen</SelectItem>
                  <SelectItem value="high">Risque élevé</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Ligne 2: Sliders */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label>Investissement minimum: {formatCurrency(filters.minInvestment[0])}</Label>
                <Slider
                  value={filters.minInvestment}
                  onValueChange={(value) => updateFilter('minInvestment', value)}
                  max={100000}
                  min={500}
                  step={500}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label>Financement max: {formatCurrency(filters.maxFunding[0])}</Label>
                <Slider
                  value={filters.maxFunding}
                  onValueChange={(value) => updateFilter('maxFunding', value)}
                  max={5000000}
                  min={10000}
                  step={50000}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label>ROI attendu min: {filters.expectedROI[0]}%</Label>
                <Slider
                  value={filters.expectedROI}
                  onValueChange={(value) => updateFilter('expectedROI', value)}
                  max={50}
                  min={0}
                  step={5}
                  className="w-full"
                />
              </div>
            </div>

            <Input
              placeholder="Localisation"
              value={filters.location}
              onChange={(e) => updateFilter('location', e.target.value)}
            />
          </CardContent>
        </Card>

        {/* Résultats */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">
            {projects.length} projet{projects.length !== 1 ? 's' : ''} trouvé{projects.length !== 1 ? 's' : ''}
          </h2>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Star className="w-4 h-4" />
            {favorites.size} favori{favorites.size !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {projects.map(project => {
            const progress = calculateProgress(project.current_funding, project.funding_goal);
            const daysLeft = getDaysLeft(project.end_date);
            const isFavorited = favorites.has(project.id);
            
            return (
              <Card 
                key={project.id} 
                className="hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() => navigate(`/project/${project.id}`)}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="text-4xl mb-2">{getSectorEmoji(project.sector)}</div>
                    <div className="flex gap-2">
                      {project.expected_roi && (
                        <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                          ROI: {project.expected_roi}%
                        </Badge>
                      )}
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(project.id);
                        }}
                      >
                        <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current text-red-500' : ''}`} />
                      </Button>
                    </div>
                  </div>
                  <CardTitle className="text-xl leading-tight">{project.title}</CardTitle>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 mr-1" />
                    {project.location}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground text-sm line-clamp-2">
                    {project.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">{project.sector}</Badge>
                    <Badge variant="outline">{getStageLabel(project.stage)}</Badge>
                    <Badge className={`${getRiskColor(project.risk_level)} border`}>
                      {project.risk_level} risque
                    </Badge>
                  </div>

                  {/* Informations investissement */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-blue-700">Min. investissement:</span>
                      <span className="font-medium text-blue-900">{formatCurrency(project.min_investment)}</span>
                    </div>
                    {project.max_investment && (
                      <div className="flex justify-between text-sm">
                        <span className="text-blue-700">Max. investissement:</span>
                        <span className="font-medium text-blue-900">{formatCurrency(project.max_investment)}</span>
                      </div>
                    )}
                    {project.team_size && (
                      <div className="flex justify-between text-sm">
                        <span className="text-blue-700">Équipe:</span>
                        <span className="font-medium text-blue-900 flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {project.team_size} personnes
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Objectif: {formatCurrency(project.funding_goal)}
                      </span>
                      <span className="font-medium">
                        {formatCurrency(project.current_funding)}
                      </span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div 
                        className="bg-accent h-2 rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-accent font-medium">
                        {progress.toFixed(1)}% financé
                      </span>
                      {daysLeft !== null && (
                        <div className="flex items-center text-muted-foreground">
                          <Calendar className="w-4 h-4 mr-1" />
                          {daysLeft} jour{daysLeft !== 1 ? 's' : ''} restant{daysLeft !== 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t">
                    <p className="text-sm text-muted-foreground">
                      Par <span className="font-medium text-foreground">
                        {project.profiles?.full_name || 'Entrepreneur'}
                      </span>
                      {project.profiles?.company && (
                        <span className="text-muted-foreground"> • {project.profiles.company}</span>
                      )}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRequestConnection(project);
                      }}
                    >
                      <Handshake className="w-4 h-4 mr-2" />
                      Se connecter
                    </Button>
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleExpressInterest(project);
                      }}
                    >
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Exprimer intérêt
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {projects.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              Aucun projet ne correspond à vos critères de recherche.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Essayez d'ajuster vos filtres pour voir plus de résultats.
            </p>
          </div>
        )}

        {/* Modals */}
        {selectedProject && (
          <>
            <ProjectInterestModal
              isOpen={showInterestModal}
              onClose={() => setShowInterestModal(false)}
              project={selectedProject}
              onSuccess={() => {
                setShowInterestModal(false);
                setSelectedProject(null);
              }}
            />
            <ConnectionRequestModal
              isOpen={showConnectionModal}
              onClose={() => setShowConnectionModal(false)}
              project={selectedProject}
              onSuccess={() => {
                setShowConnectionModal(false);
                setSelectedProject(null);
              }}
            />
          </>
        )}
      </div>
    </div>
  );
};