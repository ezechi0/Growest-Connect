import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, Users, DollarSign, Target, Search, Filter, Star, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Project {
  id: string;
  title: string;
  description: string;
  sector: string;
  location: string;
  funding_goal: number;
  current_funding: number;
  owner_id: string;
  matchScore?: number;
  reasons?: string[];
  profiles?: {
    full_name: string;
    company: string;
  };
}

interface InvestorDashboardProps {
  userId?: string;
  isPremium?: boolean;
}

export const InvestorDashboard = ({ userId, isPremium = false }: InvestorDashboardProps) => {
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [aiMatches, setAiMatches] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sectorFilter, setSectorFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");

  const stats = [
    {
      title: "Projets suivis",
      value: "12",
      change: "+2 ce mois",
      icon: Target,
    },
    {
      title: "Investissements",
      value: "45,000€",
      change: "+15% vs mois dernier",
      icon: DollarSign,
    },
    {
      title: "ROI Moyen",
      value: "18.5%",
      change: "+3.2% vs portfolio",
      icon: TrendingUp,
    },
    {
      title: "Projets financés",
      value: "8",
      change: "3 en cours",
      icon: Users,
    },
  ];

  const sectors = [
    "Technologie", "Santé", "Finance", "Éducation", "E-commerce", 
    "Énergie", "Agriculture", "Transport", "Immobilier", "Autre"
  ];

  useEffect(() => {
    fetchProjects();
    if (isPremium && userId) {
      fetchAIMatches();
    }
  }, [userId, isPremium]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('projects')
        .select(`
          *,
          profiles!projects_owner_id_fkey(full_name, company)
        `)
        .eq('status', 'active');

      if (searchTerm) {
        query = query.ilike('title', `%${searchTerm}%`);
      }
      
      if (sectorFilter) {
        query = query.eq('sector', sectorFilter);
      }
      
      if (locationFilter) {
        query = query.ilike('location', `%${locationFilter}%`);
      }

      const { data, error } = await query.limit(isPremium ? 50 : 10);
      
      if (error) throw error;
      setProjects(data || []);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les projets.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAIMatches = async () => {
    if (!userId) return;
    
    try {
      const { data, error } = await supabase.functions.invoke('ai-matching', {
        body: {
          userId,
          userType: 'investor',
          preferences: {
            sectors: sectorFilter ? [sectorFilter] : undefined,
            location: locationFilter || undefined,
          },
        },
      });

      if (error) throw error;
      if (data.success) {
        setAiMatches(data.matches || []);
      }
    } catch (error: any) {
      console.error('AI matching error:', error);
    }
  };

  const ProjectCard = ({ project, showMatchScore = false }: { project: Project; showMatchScore?: boolean }) => (
    <Card className="hover:shadow-md transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-semibold">{project.title}</CardTitle>
            <CardDescription className="text-sm mt-1">
              par {project.profiles?.full_name} • {project.profiles?.company}
            </CardDescription>
          </div>
          {showMatchScore && project.matchScore && (
            <Badge variant="secondary" className="bg-accent/10 text-accent">
              {Math.round(project.matchScore)}% match
            </Badge>
          )}
        </div>
        
        <div className="flex gap-2 mt-2">
          <Badge variant="outline">{project.sector}</Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {project.location}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {project.description}
        </p>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Objectif: {project.funding_goal.toLocaleString()}€</span>
            <span className="text-accent font-medium">
              {Math.round((project.current_funding / project.funding_goal) * 100)}%
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-accent h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min((project.current_funding / project.funding_goal) * 100, 100)}%` }}
            />
          </div>
        </div>

        {showMatchScore && project.reasons && (
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Raisons du match:</p>
            <div className="space-y-1">
              {project.reasons.slice(0, 2).map((reason, index) => (
                <p key={index} className="text-xs text-muted-foreground flex items-center gap-1">
                  <Star className="h-3 w-3 text-accent" />
                  {reason}
                </p>
              ))}
            </div>
          </div>
        )}
        
        <Button className="w-full" size="sm">
          Voir le projet
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tableau de bord Investisseur</h1>
          <p className="text-muted-foreground">
            Découvrez les opportunités d'investissement qui vous correspondent
          </p>
        </div>
        {!isPremium && (
          <Badge variant="outline" className="text-xs">
            Version gratuite • Fonctionnalités limitées
          </Badge>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Icon className="h-4 w-4 text-accent" />
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                </div>
                <div className="mt-2">
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-accent">{stat.change}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content */}
      <Tabs defaultValue="discover" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="discover">Découvrir</TabsTrigger>
          <TabsTrigger value="matches" disabled={!isPremium}>
            Matching IA {!isPremium && "🔒"}
          </TabsTrigger>
          <TabsTrigger value="portfolio">Mon Portfolio</TabsTrigger>
        </TabsList>

        <TabsContent value="discover" className="space-y-4">
          {/* Search and Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Rechercher un projet..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
                <Select value={sectorFilter} onValueChange={setSectorFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Secteur" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tous les secteurs</SelectItem>
                    {sectors.map((sector) => (
                      <SelectItem key={sector} value={sector}>{sector}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Localisation"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="w-full md:w-48"
                />
                <Button onClick={fetchProjects} disabled={loading}>
                  <Search className="h-4 w-4 mr-2" />
                  Rechercher
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>

          {!isPremium && projects.length >= 10 && (
            <Card className="border-dashed border-accent/50">
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground mb-4">
                  Vous ne voyez que 10 projets. Passez au Premium pour voir tous les projets disponibles.
                </p>
                <Button>Passer au Premium</Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="matches" className="space-y-4">
          {isPremium ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-accent" />
                    Recommandations IA
                  </CardTitle>
                  <CardDescription>
                    Projets sélectionnés par notre IA en fonction de votre profil et préférences
                  </CardDescription>
                </CardHeader>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {aiMatches.map((project) => (
                  <ProjectCard key={project.id} project={project} showMatchScore />
                ))}
              </div>
            </>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <div className="mb-4">🔒</div>
                <h3 className="text-lg font-semibold mb-2">Fonctionnalité Premium</h3>
                <p className="text-muted-foreground mb-4">
                  Accédez au matching IA intelligent pour découvrir les projets parfaits pour vous.
                </p>
                <Button>Passer au Premium</Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="portfolio" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mon Portfolio</CardTitle>
              <CardDescription>Gérez vos investissements et suivez leurs performances</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Fonctionnalité à venir : suivi des investissements et performance du portfolio.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};