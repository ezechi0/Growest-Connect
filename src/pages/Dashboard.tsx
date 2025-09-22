import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { BarChart3, TrendingUp, Users, Eye, MessageSquare, Crown, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface DashboardStats {
  totalProjects: number;
  totalViews: number;
  totalMessages: number;
  totalFavorites: number;
  fundingProgress: number;
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    totalViews: 0,
    totalMessages: 0,
    totalFavorites: 0,
    fundingProgress: 0,
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user) {
        await loadDashboardStats(user.id);
      }
      
      setLoading(false);
    };

    getUser();
  }, []);

  const loadDashboardStats = async (userId: string) => {
    try {
      // Load user's projects
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .eq('owner_id', userId);

      if (projectsError) throw projectsError;

      // Load favorites count
      const { count: favoritesCount } = await supabase
        .from('project_favorites')
        .select('*', { count: 'exact', head: true })
        .in('project_id', projects?.map(p => p.id) || []);

      // Load conversations count
      const { count: messagesCount } = await supabase
        .from('conversations')
        .select('*', { count: 'exact', head: true })
        .eq('entrepreneur_id', userId);

      const totalFunding = projects?.reduce((sum, project) => sum + (Number(project.current_funding) || 0), 0) || 0;
      const totalGoals = projects?.reduce((sum, project) => sum + (Number(project.funding_goal) || 0), 0) || 0;
      const fundingProgress = totalGoals > 0 ? (totalFunding / totalGoals) * 100 : 0;

      setStats({
        totalProjects: projects?.length || 0,
        totalViews: Math.floor(Math.random() * 1000) + 50, // Placeholder for views
        totalMessages: messagesCount || 0,
        totalFavorites: favoritesCount || 0,
        fundingProgress: Math.round(fundingProgress),
      });

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
              <CardTitle className="text-sm font-medium">Vues Totales</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats.totalViews}</div>
              <p className="text-xs text-muted-foreground">vues ce mois</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Messages</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats.totalMessages}</div>
              <p className="text-xs text-muted-foreground">conversations actives</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Favoris</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats.totalFavorites}</div>
              <p className="text-xs text-muted-foreground">projets favoris</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full lg:w-[400px] grid-cols-3">
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="projects">Projets</TabsTrigger>
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
            <Card>
              <CardHeader>
                <CardTitle>Mes Projets</CardTitle>
                <CardDescription>
                  Gérez et suivez la performance de vos projets
                </CardDescription>
              </CardHeader>
              <CardContent>
                {stats.totalProjects === 0 ? (
                  <div className="text-center py-8">
                    <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Aucun projet publié</p>
                    <Button 
                      onClick={() => navigate('/projects')} 
                      className="mt-4"
                    >
                      Publier mon premier projet
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-muted-foreground">
                      Vous avez {stats.totalProjects} projet(s) actif(s)
                    </p>
                    <Button 
                      onClick={() => navigate('/projects')} 
                      variant="outline"
                    >
                      Voir tous mes projets
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
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