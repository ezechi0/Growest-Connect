import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  MessageSquare, 
  DollarSign, 
  Target,
  Calendar,
  Activity,
  Crown,
  Eye,
  Heart,
  FileText
} from "lucide-react";

interface ProjectStats {
  id: string;
  title: string;
  description: string;
  funding_goal: number;
  current_funding: number;
  status: string;
  created_at: string;
  sector: string;
  location: string;
  views?: number;
  favorites?: number;
  messages?: number;
  investors?: number;
}

interface EntrepreneurDashboardProps {
  userId: string;
}

export const EntrepreneurDashboard = ({ userId }: EntrepreneurDashboardProps) => {
  const [projects, setProjects] = useState<ProjectStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalStats, setTotalStats] = useState({
    totalFunding: 0,
    totalInvestors: 0,
    totalViews: 0,
    totalFavorites: 0,
    activeConnections: 0,
    fundingProgress: 0,
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchEntrepreneurData();
  }, [userId]);

  const fetchEntrepreneurData = async () => {
    try {
      setLoading(true);

      // Fetch projects with related stats
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select(`
          *,
          project_favorites(count),
          conversations(count),
          transactions(investor_id, status)
        `)
        .eq('owner_id', userId);

      if (projectsError) throw projectsError;

      // Process project stats
      const enrichedProjects = await Promise.all(
        (projectsData || []).map(async (project) => {
          // Count unique investors
          const uniqueInvestors = new Set(
            project.transactions
              ?.filter(t => t.status === 'completed')
              ?.map(t => t.investor_id) || []
          ).size;

          return {
            ...project,
            views: Math.floor(Math.random() * 500) + 50, // Placeholder
            favorites: project.project_favorites?.length || 0,
            messages: project.conversations?.length || 0,
            investors: uniqueInvestors,
          };
        })
      );

      setProjects(enrichedProjects);

      // Calculate total stats
      const totalFunding = enrichedProjects.reduce((sum, p) => sum + (p.current_funding || 0), 0);
      const totalGoals = enrichedProjects.reduce((sum, p) => sum + (p.funding_goal || 0), 0);
      const totalInvestors = enrichedProjects.reduce((sum, p) => sum + (p.investors || 0), 0);
      const totalViews = enrichedProjects.reduce((sum, p) => sum + (p.views || 0), 0);
      const totalFavorites = enrichedProjects.reduce((sum, p) => sum + (p.favorites || 0), 0);
      const activeConnections = enrichedProjects.reduce((sum, p) => sum + (p.messages || 0), 0);

      setTotalStats({
        totalFunding,
        totalInvestors,
        totalViews,
        totalFavorites,
        activeConnections,
        fundingProgress: totalGoals > 0 ? Math.round((totalFunding / totalGoals) * 100) : 0,
      });

    } catch (error) {
      console.error('Error fetching entrepreneur data:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const ProjectCard = ({ project }: { project: ProjectStats }) => (
    <Card className="hover:shadow-md transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold">{project.title}</CardTitle>
            <CardDescription className="text-sm mt-1">
              {project.sector} • {project.location}
            </CardDescription>
          </div>
          <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
            {project.status === 'active' ? 'Actif' : 'Inactif'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {project.description}
        </p>
        
        {/* Funding Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Objectif: {project.funding_goal.toLocaleString()}€</span>
            <span className="text-accent font-medium">
              {Math.round((project.current_funding / project.funding_goal) * 100)}%
            </span>
          </div>
          <Progress 
            value={(project.current_funding / project.funding_goal) * 100} 
            className="h-2"
          />
          <p className="text-xs text-muted-foreground">
            {project.current_funding.toLocaleString()}€ levés
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-2 pt-2 border-t">
          <div className="text-center">
            <div className="text-lg font-bold text-primary">{project.investors}</div>
            <p className="text-xs text-muted-foreground">Investisseurs</p>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-primary">{project.views}</div>
            <p className="text-xs text-muted-foreground">Vues</p>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-primary">{project.favorites}</div>
            <p className="text-xs text-muted-foreground">Favoris</p>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-primary">{project.messages}</div>
            <p className="text-xs text-muted-foreground">Messages</p>
          </div>
        </div>
        
        <Button 
          onClick={() => navigate(`/project-detail/${project.id}`)} 
          className="w-full"
          size="sm"
        >
          Voir le projet
        </Button>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary">Tableau de Bord Entrepreneur</h1>
          <p className="text-muted-foreground">
            Suivez la performance de vos projets et votre croissance
          </p>
        </div>
        <Button onClick={() => navigate('/premium')} className="bg-accent hover:bg-accent/90">
          <Crown className="w-4 h-4 mr-2" />
          Passer Premium
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4 text-accent" />
              <p className="text-sm font-medium text-muted-foreground">Projets</p>
            </div>
            <div className="mt-2">
              <p className="text-2xl font-bold text-foreground">{projects.length}</p>
              <p className="text-xs text-accent">publiés</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-accent" />
              <p className="text-sm font-medium text-muted-foreground">Financement</p>
            </div>
            <div className="mt-2">
              <p className="text-2xl font-bold text-foreground">{totalStats.totalFunding.toLocaleString()}€</p>
              <p className="text-xs text-accent">levés</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-accent" />
              <p className="text-sm font-medium text-muted-foreground">Investisseurs</p>
            </div>
            <div className="mt-2">
              <p className="text-2xl font-bold text-foreground">{totalStats.totalInvestors}</p>
              <p className="text-xs text-accent">uniques</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Eye className="h-4 w-4 text-accent" />
              <p className="text-sm font-medium text-muted-foreground">Vues</p>
            </div>
            <div className="mt-2">
              <p className="text-2xl font-bold text-foreground">{totalStats.totalViews}</p>
              <p className="text-xs text-accent">ce mois</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Heart className="h-4 w-4 text-accent" />
              <p className="text-sm font-medium text-muted-foreground">Favoris</p>
            </div>
            <div className="mt-2">
              <p className="text-2xl font-bold text-foreground">{totalStats.totalFavorites}</p>
              <p className="text-xs text-accent">total</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-accent" />
              <p className="text-sm font-medium text-muted-foreground">Progression</p>
            </div>
            <div className="mt-2">
              <p className="text-2xl font-bold text-foreground">{totalStats.fundingProgress}%</p>
              <p className="text-xs text-accent">moyenne</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full lg:w-[500px] grid-cols-4">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="projects">Mes Projets</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Progression Globale
                </CardTitle>
                <CardDescription>
                  Avancement moyen de vos objectifs de financement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-accent mb-2">
                      {totalStats.fundingProgress}%
                    </div>
                    <p className="text-muted-foreground">des objectifs atteints</p>
                  </div>
                  <Progress value={totalStats.fundingProgress} className="h-3" />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{totalStats.totalFunding.toLocaleString()}€ levés</span>
                    <span>{projects.reduce((sum, p) => sum + p.funding_goal, 0).toLocaleString()}€ objectif</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Activité Récente
                </CardTitle>
                <CardDescription>
                  Dernières interactions avec vos projets
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {projects.slice(0, 3).map((project) => (
                    <div key={project.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{project.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {project.investors} investisseurs • {project.messages} messages
                        </p>
                      </div>
                      <Badge variant="outline">
                        {Math.round((project.current_funding / project.funding_goal) * 100)}%
                      </Badge>
                    </div>
                  ))}
                  {projects.length === 0 && (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Aucun projet publié</p>
                      <Button 
                        onClick={() => navigate('/create-project')} 
                        className="mt-4"
                      >
                        Créer mon premier projet
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="projects" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Mes Projets ({projects.length})</h2>
            <Button onClick={() => navigate('/create-project')}>
              <BarChart3 className="w-4 h-4 mr-2" />
              Nouveau Projet
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>

          {projects.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucun projet publié</h3>
              <p className="text-muted-foreground mb-6">
                Commencez par créer votre premier projet pour attirer des investisseurs
              </p>
              <Button onClick={() => navigate('/create-project')}>
                Créer mon premier projet
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Financière</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Financement Total</span>
                    <span className="font-bold">{totalStats.totalFunding.toLocaleString()}€</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Investisseurs Uniques</span>
                    <span className="font-bold">{totalStats.totalInvestors}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ticket Moyen</span>
                    <span className="font-bold">
                      {totalStats.totalInvestors > 0 
                        ? Math.round(totalStats.totalFunding / totalStats.totalInvestors).toLocaleString()
                        : 0}€
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Engagement Communauté</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Vues Totales</span>
                    <span className="font-bold">{totalStats.totalViews}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Favoris</span>
                    <span className="font-bold">{totalStats.totalFavorites}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Conversations</span>
                    <span className="font-bold">{totalStats.activeConnections}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-accent" />
                Analytics Avancées - Premium
              </CardTitle>
              <CardDescription>
                Accédez à des analyses détaillées de vos performances
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Crown className="h-16 w-16 text-accent mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Fonctionnalité Premium</h3>
                <p className="text-muted-foreground mb-6">
                  Débloquez des analytics détaillées, des insights sur vos investisseurs, 
                  et des recommandations personnalisées pour optimiser vos campagnes.
                </p>
                <Button onClick={() => navigate('/premium')}>
                  Passer Premium
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};