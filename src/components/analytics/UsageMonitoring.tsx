import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  TrendingUp, 
  Users, 
  FolderPlus,
  ArrowUpRight,
  ArrowDownRight,
  Euro,
  MessageSquare,
  Heart,
  RefreshCw,
  Calendar,
  Target,
  Percent
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface AnalyticsData {
  totalUsers: number;
  totalProjects: number;
  totalInvestments: number;
  totalMatches: number;
  conversionRate: number;
  monthlyGrowth: number;
  recentActivity: any[];
  sectorDistribution: any[];
  investmentTrends: any[];
}

export const UsageMonitoring: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalUsers: 0,
    totalProjects: 0,
    totalInvestments: 0,
    totalMatches: 0,
    conversionRate: 0,
    monthlyGrowth: 0,
    recentActivity: [],
    sectorDistribution: [],
    investmentTrends: []
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  const fetchAnalytics = async () => {
    try {
      setRefreshing(true);

      // 1. Utilisateurs totaux
      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // 2. Projets totaux
      const { count: projectsCount } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true });

      // 3. Investissements totaux
      const { data: investments } = await supabase
        .from('transactions')
        .select('amount')
        .eq('status', 'completed');

      const totalInvestments = investments?.reduce((sum, inv) => sum + Number(inv.amount), 0) || 0;

      // 4. Matches totaux
      const { count: matchesCount } = await supabase
        .from('connection_requests')
        .select('*', { count: 'exact', head: true });

      // 5. Taux de conversion (connexions acceptées / demandes totales)
      const { count: acceptedCount } = await supabase
        .from('connection_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'accepted');

      const conversionRate = matchesCount ? (acceptedCount || 0) / matchesCount * 100 : 0;

      // 6. Distribution par secteur
      const { data: sectorData } = await supabase
        .from('projects')
        .select('sector');

      const sectorDistribution = sectorData?.reduce((acc: any[], project) => {
        const existing = acc.find(item => item.name === project.sector);
        if (existing) {
          existing.value += 1;
        } else {
          acc.push({ name: project.sector, value: 1 });
        }
        return acc;
      }, []) || [];

      // 7. Tendances d'investissement (30 derniers jours)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: recentInvestments } = await supabase
        .from('transactions')
        .select('amount, created_at')
        .eq('status', 'completed')
        .gte('created_at', thirtyDaysAgo.toISOString());

      // Grouper par semaine
      const investmentTrends = recentInvestments?.reduce((acc: any[], inv) => {
        const date = new Date(inv.created_at);
        const week = `Sem ${Math.ceil(date.getDate() / 7)}`;
        const existing = acc.find(item => item.week === week);
        if (existing) {
          existing.amount += Number(inv.amount);
        } else {
          acc.push({ week, amount: Number(inv.amount) });
        }
        return acc;
      }, []) || [];

      // 8. Activité récente
      const { data: recentActivity } = await supabase
        .from('projects')
        .select(`
          id,
          title,
          created_at,
          current_funding,
          funding_goal,
          profiles!projects_owner_id_fkey (
            full_name,
            company
          )
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      setAnalytics({
        totalUsers: usersCount || 0,
        totalProjects: projectsCount || 0,
        totalInvestments,
        totalMatches: matchesCount || 0,
        conversionRate,
        monthlyGrowth: 15.2, // Simulé pour la démo
        recentActivity: recentActivity || [],
        sectorDistribution,
        investmentTrends
      });

    } catch (error) {
      console.error('Erreur lors du chargement des analytics:', error);
      toast({
        title: "❌ Erreur",
        description: "Impossible de charger les données d'analyse",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin mr-2" />
        <span>Chargement des analytics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Monitoring d'Usage</h2>
          <p className="text-muted-foreground">Tableau de bord des performances de la plateforme</p>
        </div>
        <Button onClick={fetchAnalytics} disabled={refreshing} variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </div>

      {/* KPIs principaux */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Utilisateurs Total</p>
                <p className="text-2xl font-bold">{analytics.totalUsers}</p>
                <p className="text-xs text-green-600 flex items-center">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  +{analytics.monthlyGrowth}% ce mois
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Projets Actifs</p>
                <p className="text-2xl font-bold">{analytics.totalProjects}</p>
                <p className="text-xs text-green-600 flex items-center">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  Croissance stable
                </p>
              </div>
              <FolderPlus className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Volume Investi</p>
                <p className="text-2xl font-bold">{analytics.totalInvestments.toLocaleString()} FCFA</p>
                <p className="text-xs text-green-600 flex items-center">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  Performance forte
                </p>
              </div>
              <Euro className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Taux de Conversion</p>
                <p className="text-2xl font-bold">{analytics.conversionRate.toFixed(1)}%</p>
                <p className="text-xs text-blue-600 flex items-center">
                  <Target className="h-3 w-3 mr-1" />
                  Matches → Investissements
                </p>
              </div>
              <Percent className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques et détails */}
      <Tabs defaultValue="trends" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="trends">Tendances</TabsTrigger>
          <TabsTrigger value="sectors">Secteurs</TabsTrigger>
          <TabsTrigger value="activity">Activité Récente</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Évolution des Investissements (30 derniers jours)</CardTitle>
              <CardDescription>Volume d'investissements par semaine</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.investmentTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${Number(value).toLocaleString()} FCFA`, 'Montant']} />
                  <Line type="monotone" dataKey="amount" stroke="#8884d8" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sectors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Répartition par Secteur</CardTitle>
              <CardDescription>Distribution des projets par secteur d'activité</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analytics.sectorDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {analytics.sectorDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-3">
                  <h4 className="font-medium">Détail par Secteur</h4>
                  {analytics.sectorDistribution.map((sector, index) => (
                    <div key={sector.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="capitalize">{sector.name}</span>
                      </div>
                      <Badge variant="secondary">{sector.value} projets</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Activité Récente</CardTitle>
              <CardDescription>Derniers projets créés et leur progression</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.recentActivity.map((project) => (
                  <div key={project.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <h4 className="font-medium">{project.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        Par {project.profiles?.full_name} • {project.profiles?.company}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Créé le {new Date(project.created_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-sm font-medium">
                        {project.current_funding?.toLocaleString()} / {project.funding_goal?.toLocaleString()} FCFA
                      </p>
                      <Progress 
                        value={(project.current_funding / project.funding_goal) * 100} 
                        className="w-24 h-2"
                      />
                      <p className="text-xs text-muted-foreground">
                        {((project.current_funding / project.funding_goal) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Alertes et recommandations */}
      <Card>
        <CardHeader>
          <CardTitle>Recommandations</CardTitle>
          <CardDescription>Actions suggérées pour améliorer les performances</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900">Engagement Utilisateurs</h4>
              <p className="text-sm text-blue-700 mt-2">
                Taux de conversion à {analytics.conversionRate.toFixed(1)}%. 
                Objectif: atteindre 25% avec plus de fonctionnalités de matching.
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-900">Croissance Projets</h4>
              <p className="text-sm text-green-700 mt-2">
                {analytics.totalProjects} projets actifs. 
                Tendance positive, continuer les efforts d'acquisition.
              </p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <h4 className="font-medium text-yellow-900">Volume Investissements</h4>
              <p className="text-sm text-yellow-700 mt-2">
                {analytics.totalInvestments.toLocaleString()} FCFA investis. 
                Optimiser le processus de paiement pour augmenter les conversions.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};