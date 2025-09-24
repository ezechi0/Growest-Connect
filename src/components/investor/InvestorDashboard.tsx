import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Users, DollarSign, Target, Search, Filter, Star, MapPin, Heart, Activity, Crown, Briefcase, PieChart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

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

interface Investment {
  id: string;
  project_id: string;
  amount: number;
  status: string;
  created_at: string;
  projects: {
    title: string;
    sector: string;
    current_funding: number;
    funding_goal: number;
    profiles: {
      full_name: string;
      company: string;
    };
  };
}

interface Favorite {
  id: string;
  project_id: string;
  created_at: string;
  projects: {
    title: string;
    sector: string;
    location: string;
    current_funding: number;
    funding_goal: number;
    profiles: {
      full_name: string;
      company: string;
    };
  };
}

interface InvestorDashboardProps {
  userId?: string;
  isPremium?: boolean;
}

export const InvestorDashboard = ({ userId, isPremium = false }: InvestorDashboardProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [aiMatches, setAiMatches] = useState<Project[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sectorFilter, setSectorFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [portfolioStats, setPortfolioStats] = useState({
    totalInvested: 0,
    totalProjects: 0,
    averageROI: 0,
    totalValue: 0,
  });

  const stats = [
    {
      title: "Investissements",
      value: `${portfolioStats.totalInvested.toLocaleString()}€`,
      change: `${investments.length} projets`,
      icon: DollarSign,
    },
    {
      title: "Portfolio",
      value: `${portfolioStats.totalProjects}`,
      change: `+${Math.round(portfolioStats.averageROI)}% ROI moyen`,
      icon: Briefcase,
    },
    {
      title: "Favoris",
      value: `${favorites.length}`,
      change: "projets suivis",
      icon: Heart,
    },
    {
      title: "Valeur Portfolio",
      value: `${portfolioStats.totalValue.toLocaleString()}€`,
      change: "estimation",
      icon: TrendingUp,
    },
  ];

  const sectors = [
    "Technologie", "Santé", "Finance", "Éducation", "E-commerce", 
    "Énergie", "Agriculture", "Transport", "Immobilier", "Autre"
  ];

  useEffect(() => {
    fetchProjects();
    if (userId) {
      fetchInvestments();
      fetchFavorites();
      if (isPremium) {
        fetchAIMatches();
      }
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

  const fetchInvestments = async () => {
    if (!userId) return;
    
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          projects!inner(
            title,
            sector,
            current_funding,
            funding_goal,
            profiles!projects_owner_id_fkey(full_name, company)
          )
        `)
        .eq('investor_id', userId)
        .eq('status', 'completed')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setInvestments(data || []);
      
      // Calculate portfolio stats
      const totalInvested = (data || []).reduce((sum, inv) => sum + inv.amount, 0);
      const uniqueProjects = new Set((data || []).map(inv => inv.project_id)).size;
      
      // Mock ROI calculation (should be based on real performance data)
      const averageROI = Math.random() * 20 + 5; // 5-25% mock ROI
      const totalValue = totalInvested * (1 + averageROI / 100);

      setPortfolioStats({
        totalInvested,
        totalProjects: uniqueProjects,
        averageROI,
        totalValue,
      });

    } catch (error: any) {
      console.error('Error fetching investments:', error);
    }
  };

  const fetchFavorites = async () => {
    if (!userId) return;
    
    try {
      const { data, error } = await supabase
        .from('project_favorites')
        .select(`
          *,
          projects!inner(
            title,
            sector,
            location,
            current_funding,
            funding_goal,
            profiles!projects_owner_id_fkey(full_name, company)
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFavorites(data || []);
    } catch (error: any) {
      console.error('Error fetching favorites:', error);
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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="discover">Découvrir</TabsTrigger>
          <TabsTrigger value="matches" disabled={!isPremium}>
            Matching IA {!isPremium && "🔒"}
          </TabsTrigger>
          <TabsTrigger value="portfolio">Mon Portfolio</TabsTrigger>
          <TabsTrigger value="favorites">Favoris</TabsTrigger>
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
                    Recommandations Personnalisées
                  </CardTitle>
                  <CardDescription>
                    Projets sélectionnés en fonction de votre profil et préférences
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
                  Accédez au matching intelligent pour découvrir les projets parfaits pour vous.
                </p>
                <Button>Passer au Premium</Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="portfolio" className="space-y-4">
          {/* Portfolio Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Performance du Portfolio
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Investissement Total</span>
                    <span className="font-bold">{portfolioStats.totalInvested.toLocaleString()}€</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Valeur Estimée</span>
                    <span className="font-bold text-green-600">{portfolioStats.totalValue.toLocaleString()}€</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ROI Moyen</span>
                    <span className="font-bold text-accent">+{portfolioStats.averageROI.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Projets Financés</span>
                    <span className="font-bold">{portfolioStats.totalProjects}</span>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-2">Progression</p>
                  <Progress 
                    value={Math.min((portfolioStats.totalValue / portfolioStats.totalInvested) * 100, 150)} 
                    className="h-3" 
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Répartition par Secteur
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Calculate sector distribution */}
                  {Object.entries(
                    investments.reduce((acc, inv) => {
                      const sector = inv.projects.sector;
                      acc[sector] = (acc[sector] || 0) + inv.amount;
                      return acc;
                    }, {} as Record<string, number>)
                  ).map(([sector, amount]) => (
                    <div key={sector} className="flex items-center justify-between">
                      <span className="text-sm">{sector}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-muted rounded-full h-2">
                          <div 
                            className="bg-accent h-2 rounded-full"
                            style={{ 
                              width: `${(amount / portfolioStats.totalInvested) * 100}%` 
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium">
                          {((amount / portfolioStats.totalInvested) * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  ))}
                  {investments.length === 0 && (
                    <p className="text-muted-foreground text-center py-4">
                      Aucun investissement encore
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Investment History */}
          <Card>
            <CardHeader>
              <CardTitle>Historique des Investissements</CardTitle>
              <CardDescription>Vos investissements récents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {investments.map((investment) => (
                  <div key={investment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div>
                          <h4 className="font-medium">{investment.projects.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            par {investment.projects.profiles.full_name} • {investment.projects.profiles.company}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(investment.created_at).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        <Badge variant="outline">{investment.projects.sector}</Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">{investment.amount.toLocaleString()}€</p>
                      <p className="text-sm text-muted-foreground">
                        {Math.round((investment.projects.current_funding / investment.projects.funding_goal) * 100)}% financé
                      </p>
                    </div>
                  </div>
                ))}
                
                {investments.length === 0 && (
                  <div className="text-center py-8">
                    <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Aucun investissement encore</p>
                    <p className="text-sm text-muted-foreground">
                      Explorez les projets pour commencer votre portfolio
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="favorites" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Mes Favoris ({favorites.length})
              </CardTitle>
              <CardDescription>
                Projets que vous suivez avec intérêt
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {favorites.map((favorite) => (
                  <Card key={favorite.id} className="hover:shadow-md transition-all duration-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg font-semibold">
                        {favorite.projects.title}
                      </CardTitle>
                      <CardDescription className="text-sm">
                        par {favorite.projects.profiles.full_name} • {favorite.projects.profiles.company}
                      </CardDescription>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline">{favorite.projects.sector}</Badge>
                        <Badge variant="outline" className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {favorite.projects.location}
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Objectif: {favorite.projects.funding_goal.toLocaleString()}€</span>
                          <span className="text-accent font-medium">
                            {Math.round((favorite.projects.current_funding / favorite.projects.funding_goal) * 100)}%
                          </span>
                        </div>
                        <Progress 
                          value={(favorite.projects.current_funding / favorite.projects.funding_goal) * 100} 
                          className="h-2"
                        />
                      </div>
                      
                      <div className="flex gap-2">
                        <Button className="flex-1" size="sm">
                          Voir le projet
                        </Button>
                        <Button variant="outline" size="sm">
                          <Heart className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {favorites.length === 0 && (
                <div className="text-center py-8">
                  <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Aucun projet en favoris</p>
                  <p className="text-sm text-muted-foreground">
                    Explorez les projets et ajoutez ceux qui vous intéressent
                  </p>
                  <Button 
                    onClick={() => window.location.hash = '#discover'} 
                    className="mt-4"
                  >
                    Découvrir des projets
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};