import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, MapPin, Calendar, Euro, Search, Filter, Plus, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { InvestorCatalog } from "@/components/investor/InvestorCatalog";

interface Project {
  id: string;
  title: string;
  description: string;
  sector: string;
  location: string;
  funding_goal: number;
  current_funding: number;
  status: string;
  created_at: string;
  end_date?: string;
  profiles?: {
    full_name: string;
  };
}

const Projects = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSector, setSelectedSector] = useState("all");
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  
  const { user, isInvestor, isEntrepreneur } = useUserRole();
  const { toast } = useToast();
  const navigate = useNavigate();

  const sectors = ["all", "Agriculture", "Éducation", "Santé", "Énergie", "Fintech", "E-commerce", "Technologie", "Transport"];

  useEffect(() => {
    loadProjects();
    if (user && isInvestor()) {
      loadFavorites();
    }
  }, [user]);

  const loadProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          id,
          title,
          description,
          sector,
          location,
          funding_goal,
          current_funding,
          status,
          created_at,
          end_date,
          profiles:owner_id (
            full_name
          )
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

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

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSector = selectedSector === "all" || project.sector === selectedSector;
    return matchesSearch && matchesSector;
  });

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

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Chargement des projets...</p>
          </div>
        </div>
      </div>
    );
  }

  // Si l'utilisateur est un investisseur, afficher le catalogue spécialisé
  if (isInvestor()) {
    return <InvestorCatalog />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-primary/5 to-background py-12">
      <div className="container mx-auto px-4">
        {/* Header professionnel */}
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4 px-4 py-1.5">
            Catalogue de projets
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
            Découvrez les <span className="gradient-text">projets innovants</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Explorez une sélection de projets vérifiés et prometteurs qui transforment l'avenir entrepreneurial.
          </p>
          
          {isEntrepreneur() && (
            <Button 
              onClick={() => navigate('/create-project')}
              className="mt-6 px-6 py-3 shadow-md hover:shadow-lg transition-all"
              size="lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Créer un projet
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Rechercher un projet..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={selectedSector} onValueChange={setSelectedSector}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Tous les secteurs" />
              </SelectTrigger>
              <SelectContent>
                {sectors.map(sector => (
                  <SelectItem key={sector} value={sector}>
                    {sector === "all" ? "Tous les secteurs" : sector}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProjects.map(project => {
            const progress = calculateProgress(project.current_funding, project.funding_goal);
            const daysLeft = getDaysLeft(project.end_date);
            const isFavorited = favorites.has(project.id);
            
            return (
              <Card 
                key={project.id} 
                className="hover-lift border-2 shadow-lg transition-all duration-200 cursor-pointer hover:shadow-xl"
                onClick={() => navigate(`/project/${project.id}`)}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="text-4xl mb-2">{getSectorEmoji(project.sector)}</div>
                    {isInvestor() && (
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
                    )}
                  </div>
                  <CardTitle className="text-xl leading-tight">{project.title}</CardTitle>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 mr-1" />
                    {project.location}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground text-sm line-clamp-3">
                    {project.description}
                  </p>
                  
                  <Badge variant="secondary" className="w-fit">
                    {project.sector}
                  </Badge>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Objectif: €{project.funding_goal.toLocaleString()}
                      </span>
                      <span className="font-medium">
                        €{project.current_funding.toLocaleString()}
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
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/project/${project.id}`);
                      }}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Voir détails
                    </Button>
                    {isInvestor() && (
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/project/${project.id}`);
                        }}
                      >
                        <Euro className="w-4 h-4 mr-2" />
                        Investir
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredProjects.length === 0 && !loading && (
          <div className="text-center py-12">
            {projects.length === 0 ? (
              <div>
                <p className="text-muted-foreground text-lg mb-4">
                  Aucun projet actif pour le moment.
                </p>
                {isEntrepreneur() && (
                  <Button 
                    onClick={() => navigate('/create-project')}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Soyez le premier à créer un projet !
                  </Button>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground text-lg">
                Aucun projet ne correspond à vos critères de recherche.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Projects;