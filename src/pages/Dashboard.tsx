import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { BarChart3, TrendingUp, Users, Eye, MessageSquare, Crown, Star, DollarSign, Target, Calendar, Activity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { InvestorDashboard } from "@/components/investor/InvestorDashboard";

interface DashboardStats {
  totalProjects: number;
  totalViews: number;
  totalMessages: number;
  totalFavorites: number;
  fundingProgress: number;
  totalFunding: number;
  totalInvestors: number;
  activeConnections: number;
  monthlyGrowth: number;
}

interface Project {
  id: string;
  title: string;
  description: string;
  funding_goal: number;
  current_funding: number;
  status: string;
  created_at: string;
  sector: string;
  location: string;
}

export default function Dashboard() {
  const { user, profile, loading: roleLoading, isEntrepreneur, isInvestor, isAdmin } = useUserRole();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    totalViews: 0,
    totalMessages: 0,
    totalFavorites: 0,
    fundingProgress: 0,
    totalFunding: 0,
    totalInvestors: 0,
    activeConnections: 0,
    monthlyGrowth: 0,
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!roleLoading && user) {
      loadDashboardStats(user.id);
    }
    setLoading(roleLoading);
  }, [user, roleLoading]);

  const loadDashboardStats = async (userId: string) => {
    try {
      if (isEntrepreneur()) {
        // Load entrepreneur's projects
        const { data: projects, error: projectsError } = await supabase
          .from('projects')
          .select('*')
          .eq('owner_id', userId);

        if (projectsError) throw projectsError;
        setProjects(projects || []);

        // Load favorites count for entrepreneur's projects
        const { count: favoritesCount } = await supabase
          .from('project_favorites')
          .select('*', { count: 'exact', head: true })
          .in('project_id', projects?.map(p => p.id) || []);

        // Load conversations count
        const { count: messagesCount } = await supabase
          .from('conversations')
          .select('*', { count: 'exact', head: true })
          .eq('entrepreneur_id', userId);

        // Load unique investors count
        const { data: investments } = await supabase
          .from('transactions')
          .select('investor_id')
          .in('project_id', projects?.map(p => p.id) || [])
          .eq('status', 'completed');

        const uniqueInvestors = new Set(investments?.map(i => i.investor_id) || []).size;

        const totalFunding = projects?.reduce((sum, project) => sum + (Number(project.current_funding) || 0), 0) || 0;
        const totalGoals = projects?.reduce((sum, project) => sum + (Number(project.funding_goal) || 0), 0) || 0;
        const fundingProgress = totalGoals > 0 ? (totalFunding / totalGoals) * 100 : 0;

        setStats({
          totalProjects: projects?.length || 0,
          totalViews: Math.floor(Math.random() * 1000) + 50,
          totalMessages: messagesCount || 0,
          totalFavorites: favoritesCount || 0,
          fundingProgress: Math.round(fundingProgress),
          totalFunding,
          totalInvestors: uniqueInvestors,
          activeConnections: messagesCount || 0,
          monthlyGrowth: Math.round((totalFunding / Math.max(totalGoals, 1)) * 15),
        });
      }
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les statistiques",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <BarChart3 className="h-12 w-12 text-primary mx-auto mb-4" />
            <CardTitle>Connexion Requise</CardTitle>
            <CardDescription>
              Vous devez être connecté pour accéder au tableau de bord.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/auth')} className="w-full">
              Se connecter
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Route to appropriate dashboard based on user role
  if (isAdmin()) {
    return <AdminDashboard />;
  }

  if (isInvestor()) {
    return <InvestorDashboard userId={user.id} isPremium={false} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary">Tableau de Bord</h1>
            <p className="text-muted-foreground">
              Suivez la performance de vos projets et votre activité
            </p>
          </div>
          <Button onClick={() => navigate('/premium')} className="bg-accent hover:bg-accent/90">
            <Crown className="w-4 h-4 mr-2" />
            Passer Premium
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Projets Publiés</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats.totalProjects}</div>
              <p className="text-xs text-muted-foreground">projets actifs</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Financement Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats.totalFunding.toLocaleString()}€</div>
              <p className="text-xs text-muted-foreground">levés à ce jour</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Investisseurs</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats.totalInvestors}</div>
              <p className="text-xs text-muted-foreground">investisseurs uniques</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Connexions</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats.activeConnections}</div>
              <p className="text-xs text-muted-foreground">conversations actives</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Progression</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats.fundingProgress}%</div>
              <p className="text-xs text-muted-foreground">objectifs atteints</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full lg:w-[500px] grid-cols-4">
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="projects">Mes Projets</TabsTrigger>
            <TabsTrigger value="funding">Financement</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Progression du Financement</CardTitle>
                  <CardDescription>
                    Pourcentage moyen d'atteinte des objectifs
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progression</span>
                      <span>{stats.fundingProgress}%</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div 
                        className="bg-accent h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(stats.fundingProgress, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Fonctionnalités Premium</CardTitle>
                  <CardDescription>
                    Débloquez des fonctionnalités avancées
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Matching IA avancé</span>
                    <Badge variant="outline">Premium</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Analytics détaillées</span>
                    <Badge variant="outline">Premium</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Visibilité renforcée</span>
                    <Badge variant="outline">Premium</Badge>
                  </div>
                  <Button 
                    onClick={() => navigate('/premium')} 
                    className="w-full mt-4"
                    variant="outline"
                  >
                    Découvrir Premium
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="projects" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Statut des Projets
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {stats.totalProjects === 0 ? (
                    <div className="text-center py-8">
                      <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Aucun projet publié</p>
                      <Button 
                        onClick={() => navigate('/create-project')} 
                        className="mt-4"
                      >
                        Créer mon premier projet
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-accent/10 rounded-lg">
                          <div className="text-2xl font-bold text-primary">{stats.totalProjects}</div>
                          <p className="text-sm text-muted-foreground">Projets actifs</p>
                        </div>
                        <div className="text-center p-4 bg-green-100 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">{Math.round(stats.fundingProgress)}%</div>
                          <p className="text-sm text-muted-foreground">Progression moyenne</p>
                        </div>
                      </div>
                      <Button 
                        onClick={() => navigate('/projects')} 
                        variant="outline"
                        className="w-full"
                      >
                        Gérer mes projets
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Activité Récente
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {projects.slice(0, 3).map((project) => (
                      <div key={project.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{project.title}</p>
                          <p className="text-xs text-muted-foreground">{project.sector} • {project.location}</p>
                        </div>
                        <Badge variant="outline">
                          {Math.round((project.current_funding / project.funding_goal) * 100)}%
                        </Badge>
                      </div>
                    ))}
                    {projects.length === 0 && (
                      <p className="text-muted-foreground text-center py-4">Aucune activité récente</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="funding" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Performance Financière
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Financement Total</span>
                      <span className="font-bold">{stats.totalFunding.toLocaleString()}€</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Nombre d'Investisseurs</span>
                      <span className="font-bold">{stats.totalInvestors}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Progression Moyenne</span>
                      <span className="font-bold text-accent">{stats.fundingProgress}%</span>
                    </div>
                  </div>
                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground mb-2">Objectifs atteints</p>
                    <div className="w-full bg-muted rounded-full h-3">
                      <div 
                        className="bg-accent h-3 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(stats.fundingProgress, 100)}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Prochaines Échéances
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {projects.slice(0, 3).map((project) => (
                      <div key={project.id} className="p-3 border-l-4 border-accent bg-accent/5 rounded-r-lg">
                        <p className="font-medium text-sm">{project.title}</p>
                        <p className="text-xs text-muted-foreground">
                          Objectif: {project.funding_goal.toLocaleString()}€ • 
                          Restant: {(project.funding_goal - project.current_funding).toLocaleString()}€
                        </p>
                      </div>
                    ))}
                    {projects.length === 0 && (
                      <p className="text-muted-foreground text-center py-4">Aucun projet en cours</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Analytics Avancées</CardTitle>
                <CardDescription>
                  Fonctionnalité Premium - Analysez en détail la performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Crown className="h-12 w-12 text-accent mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    Débloquez des analytics détaillées avec Premium
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
    </div>
  );
}