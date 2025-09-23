import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';
import { ProjectInterestModal } from './ProjectInterestModal';
import { ConnectionRequestModal } from '@/components/investor/ConnectionRequestModal';
import { 
  MapPin, 
  Calendar, 
  Users, 
  TrendingUp, 
  Heart,
  Share2,
  MessageCircle,
  Handshake,
  ExternalLink,
  Building,
  Target,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Edit,
  Eye,
  Download
} from 'lucide-react';

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
  business_model: string;
  target_market: string;
  revenue_model?: string;
  team_size: number;
  stage: string;
  risk_level: string;
  expected_roi?: number;
  status: string;
  tags: string[];
  start_date?: string;
  end_date?: string;
  pitch_deck_url?: string;
  video_url?: string;
  images?: string[];
  created_at: string;
  owner_id: string;
  profiles?: {
    full_name: string;
    avatar_url?: string;
    bio?: string;
  };
}

interface ProjectDetailProps {
  projectId: string;
  onEdit?: () => void;
}

export const ProjectDetail: React.FC<ProjectDetailProps> = ({ 
  projectId, 
  onEdit 
}) => {
  const { user, isInvestor, isEntrepreneur, isKycApproved } = useUserRole();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showInterestModal, setShowInterestModal] = useState(false);
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [interestStats, setInterestStats] = useState({
    total_interests: 0,
    total_potential_investment: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    loadProject();
    if (user && isInvestor()) {
      checkFavoriteStatus();
    }
  }, [projectId, user]);

  const loadProject = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          profiles:owner_id (
            full_name,
            avatar_url,
            bio
          )
        `)
        .eq('id', projectId)
        .single();

      if (error) throw error;
      
      if (data) {
        const project = {
          ...data,
          images: Array.isArray(data.images) ? data.images.filter((img): img is string => typeof img === 'string') : []
        };
        setProject(project);
        
        // Charger les statistiques d'intérêt
        if (data.status === 'active') {
          loadInterestStats();
        }
      }

    } catch (error: any) {
      console.error('Error loading project:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger le projet",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadInterestStats = async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_project_interest_stats', { project_uuid: projectId });

      if (error) throw error;
      
      if (data && data.length > 0) {
        setInterestStats(data[0]);
      }
    } catch (error) {
      console.error('Error loading interest stats:', error);
    }
  };

  const checkFavoriteStatus = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('project_favorites')
        .select('id')
        .eq('project_id', projectId)
        .eq('user_id', user.id)
        .single();

      setIsFavorite(!!data);
    } catch (error) {
      // Pas d'erreur si pas de favori
    }
  };

  const toggleFavorite = async () => {
    if (!user || !isInvestor()) {
      toast({
        title: "Connexion requise",
        description: "Connectez-vous en tant qu'investisseur pour ajouter aux favoris",
        variant: "destructive"
      });
      return;
    }

    try {
      if (isFavorite) {
        await supabase
          .from('project_favorites')
          .delete()
          .eq('project_id', projectId)
          .eq('user_id', user.id);
        
        setIsFavorite(false);
        toast({
          title: "Retiré des favoris",
          description: "Le projet a été retiré de vos favoris"
        });
      } else {
        await supabase
          .from('project_favorites')
          .insert({ project_id: projectId, user_id: user.id });
        
        setIsFavorite(true);
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

  const handleShowInterest = () => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Connectez-vous pour exprimer votre intérêt",
        variant: "destructive"
      });
      return;
    }

    if (!isInvestor()) {
      toast({
        title: "Accès limité",
        description: "Seuls les investisseurs peuvent exprimer leur intérêt",
        variant: "destructive"
      });
      return;
    }

    if (!isKycApproved()) {
      toast({
        title: "Vérification requise",
        description: "Complétez votre vérification KYC pour exprimer votre intérêt",
        variant: "destructive"
      });
      return;
    }

    setShowInterestModal(true);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: 'Brouillon', variant: 'secondary' as const },
      submitted: { label: 'Soumis', variant: 'outline' as const },
      under_review: { label: 'En révision', variant: 'outline' as const },
      approved: { label: 'Approuvé', variant: 'default' as const },
      active: { label: 'Actif', variant: 'default' as const },
      funded: { label: 'Financé', variant: 'default' as const },
      closed: { label: 'Clos', variant: 'secondary' as const },
      rejected: { label: 'Rejeté', variant: 'destructive' as const }
    };

    return statusConfig[status as keyof typeof statusConfig] || { label: status, variant: 'outline' as const };
  };

  const getStageLabel = (stage: string) => {
    const stages = {
      ideation: 'Idéation',
      prototype: 'Prototype',
      mvp: 'MVP',
      early_revenue: 'Premiers revenus',
      growth: 'Croissance',
      expansion: 'Expansion'
    };
    return stages[stage as keyof typeof stages] || stage;
  };

  const getRiskLabel = (risk: string) => {
    const risks = {
      low: 'Faible',
      medium: 'Moyen',
      high: 'Élevé'
    };
    return risks[risk as keyof typeof risks] || risk;
  };

  const calculateProgress = () => {
    if (!project) return 0;
    return Math.min((project.current_funding / project.funding_goal) * 100, 100);
  };

  const canEdit = user && project && user.id === project.owner_id;
  const isOwner = user && project && user.id === project.owner_id;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground">Projet non trouvé</p>
      </div>
    );
  }

  const statusBadge = getStatusBadge(project.status);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{project.title}</h1>
                <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
              </div>
              
              <div className="flex items-center gap-4 text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {project.location}
                </div>
                <div className="flex items-center gap-1">
                  <Building className="w-4 h-4" />
                  {project.sector}
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  {getStageLabel(project.stage)}
                </div>
              </div>

              <p className="text-muted-foreground text-lg leading-relaxed">
                {project.description}
              </p>
            </div>

            <div className="flex items-center gap-2 ml-4">
              {canEdit && (
                <Button variant="outline" onClick={onEdit}>
                  <Edit className="w-4 h-4 mr-2" />
                  Modifier
                </Button>
              )}
              
              {!isOwner && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleFavorite}
                  >
                    <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current text-red-500' : ''}`} />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Share2 className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contenu principal */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Aperçu</TabsTrigger>
              <TabsTrigger value="business">Business</TabsTrigger>
              <TabsTrigger value="financials">Financier</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Description du projet</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="leading-relaxed">{project.description}</p>
                  
                  {project.tags && project.tags.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium mb-2">Mots-clés:</h4>
                      <div className="flex flex-wrap gap-2">
                        {project.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Équipe et développement</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-sm text-muted-foreground">Taille de l'équipe</Label>
                      <p className="font-medium">{project.team_size} personne(s)</p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Stade</Label>
                      <p className="font-medium">{getStageLabel(project.stage)}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Niveau de risque</Label>
                      <p className="font-medium flex items-center gap-1">
                        {project.risk_level === 'high' && <AlertTriangle className="w-4 h-4 text-orange-500" />}
                        {project.risk_level === 'low' && <CheckCircle className="w-4 h-4 text-green-500" />}
                        {getRiskLabel(project.risk_level)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="business" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Modèle économique</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="leading-relaxed">{project.business_model}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Marché cible</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="leading-relaxed">{project.target_market}</p>
                </CardContent>
              </Card>

              {project.revenue_model && (
                <Card>
                  <CardHeader>
                    <CardTitle>Modèle de revenus</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="leading-relaxed">{project.revenue_model}</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="financials" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Objectifs financiers</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm text-muted-foreground">Objectif de financement</Label>
                      <p className="text-2xl font-bold">€{project.funding_goal.toLocaleString()}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Investissement minimum</Label>
                      <p className="text-xl font-semibold">€{project.min_investment.toLocaleString()}</p>
                    </div>
                  </div>

                  {project.expected_roi && project.expected_roi > 0 && (
                    <div>
                      <Label className="text-sm text-muted-foreground">ROI attendu</Label>
                      <p className="text-xl font-semibold text-green-600">{project.expected_roi}%</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documents" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Documents du projet</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {project.pitch_deck_url && (
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                          <Download className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                          <p className="font-medium">Pitch Deck</p>
                          <p className="text-sm text-muted-foreground">Présentation détaillée du projet</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <a href={project.pitch_deck_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </Button>
                    </div>
                  )}

                  {project.video_url && (
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Eye className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">Vidéo de présentation</p>
                          <p className="text-sm text-muted-foreground">Présentation vidéo du projet</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <a href={project.video_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </Button>
                    </div>
                  )}

                  {(!project.pitch_deck_url && !project.video_url) && (
                    <p className="text-muted-foreground text-center py-6">
                      Aucun document disponible
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Progression du financement */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Financement
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>€{project.current_funding.toLocaleString()}</span>
                  <span>€{project.funding_goal.toLocaleString()}</span>
                </div>
                <Progress value={calculateProgress()} className="h-3" />
                <p className="text-sm text-muted-foreground mt-2">
                  {calculateProgress().toFixed(1)}% de l'objectif atteint
                </p>
              </div>

              {interestStats.total_interests > 0 && (
                <div className="pt-3 border-t">
                  <p className="text-sm font-medium">{interestStats.total_interests} investisseur(s) intéressé(s)</p>
                  <p className="text-sm text-muted-foreground">
                    €{interestStats.total_potential_investment.toLocaleString()} d'intérêt potentiel
                  </p>
                </div>
              )}

              {!isOwner && project.status === 'active' && isInvestor() && (
                <div className="flex gap-3">
                  <Button 
                    variant="outline"
                    onClick={() => setShowConnectionModal(true)}
                    className="flex-1"
                  >
                    <Handshake className="w-4 h-4 mr-2" />
                    Se connecter
                  </Button>
                  <Button 
                    className="flex-1" 
                    onClick={handleShowInterest}
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Exprimer intérêt
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Informations sur l'entrepreneur */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Porteur de projet
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 mb-3">
                <Avatar>
                  <AvatarImage src={project.profiles?.avatar_url} />
                  <AvatarFallback>
                    {project.profiles?.full_name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{project.profiles?.full_name}</p>
                  <p className="text-sm text-muted-foreground">Entrepreneur</p>
                </div>
              </div>
              
              {project.profiles?.bio && (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {project.profiles.bio}
                </p>
              )}

              {!isOwner && (
                <Button variant="outline" size="sm" className="w-full mt-3">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Contacter
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Dates importantes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Planning
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-sm text-muted-foreground">Créé le</Label>
                <p className="font-medium">
                  {new Date(project.created_at).toLocaleDateString('fr-FR')}
                </p>
              </div>
              
              {project.start_date && (
                <div>
                  <Label className="text-sm text-muted-foreground">Début de campagne</Label>
                  <p className="font-medium">
                    {new Date(project.start_date).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              )}
              
              {project.end_date && (
                <div>
                  <Label className="text-sm text-muted-foreground">Fin de campagne</Label>
                  <p className="font-medium">
                    {new Date(project.end_date).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modals */}
      <ProjectInterestModal
        isOpen={showInterestModal}
        onClose={() => setShowInterestModal(false)}
        project={project}
        onSuccess={() => {
          setShowInterestModal(false);
          loadInterestStats();
        }}
      />
      
      <ConnectionRequestModal
        isOpen={showConnectionModal}
        onClose={() => setShowConnectionModal(false)}
        project={project}
        onSuccess={() => setShowConnectionModal(false)}
      />
    </div>
  );
};