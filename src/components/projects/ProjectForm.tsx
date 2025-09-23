import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';
import { FileUpload } from '../FileUpload';
import { 
  ArrowRight,
  ArrowLeft,
  Save,
  Upload,
  Building,
  Target,
  DollarSign,
  Users,
  TrendingUp,
  FileText,
  Image as ImageIcon
} from 'lucide-react';

interface ProjectData {
  title: string;
  description: string;
  sector: string;
  location: string;
  funding_goal: number;
  min_investment: number;
  max_investment: number;
  business_model: string;
  target_market: string;
  revenue_model: string;
  team_size: number;
  stage: string;
  risk_level: string;
  expected_roi: number;
  tags: string[];
  start_date?: string;
  end_date?: string;
  pitch_deck_url?: string;
  video_url?: string;
  images?: string[];
}

interface ProjectFormProps {
  projectId?: string;
  onSuccess?: (projectId: string) => void;
  onCancel?: () => void;
}

const SECTORS = [
  'Agriculture', 'Éducation', 'Santé', 'Fintech', 'E-commerce', 
  'Énergie', 'Transport', 'Immobilier', 'Tourisme', 'Manufacturing',
  'Services', 'Technologie', 'Environnement', 'Alimentation'
];

const STAGES = [
  'ideation', 'prototype', 'mvp', 'early_revenue', 'growth', 'expansion'
];

const RISK_LEVELS = ['low', 'medium', 'high'];

export const ProjectForm: React.FC<ProjectFormProps> = ({ 
  projectId, 
  onSuccess, 
  onCancel 
}) => {
  const { user, isEntrepreneur } = useUserRole();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProject, setIsLoadingProject] = useState(!!projectId);
  const { toast } = useToast();

  const [formData, setFormData] = useState<ProjectData>({
    title: '',
    description: '',
    sector: '',
    location: '',
    funding_goal: 50000,
    min_investment: 1000,
    max_investment: 0,
    business_model: '',
    target_market: '',
    revenue_model: '',
    team_size: 1,
    stage: 'ideation',
    risk_level: 'medium',
    expected_roi: 0,
    tags: [],
    images: []
  });

  const steps = [
    {
      title: 'Informations générales',
      description: 'Présentez votre projet',
      icon: Building
    },
    {
      title: 'Modèle économique',
      description: 'Décrivez votre business model',
      icon: Target
    },
    {
      title: 'Financement',
      description: 'Objectifs et conditions',
      icon: DollarSign
    },
    {
      title: 'Documents',
      description: 'Pitch deck et médias',
      icon: FileText
    }
  ];

  useEffect(() => {
    if (!isEntrepreneur()) {
      toast({
        title: "Accès refusé",
        description: "Seuls les entrepreneurs peuvent créer des projets",
        variant: "destructive"
      });
      onCancel?.();
      return;
    }

    if (projectId) {
      loadProject();
    }
  }, [projectId, isEntrepreneur]);

  const loadProject = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .eq('owner_id', user?.id)
        .single();

      if (error) throw error;

      if (data) {
        setFormData({
          title: data.title || '',
          description: data.description || '',
          sector: data.sector || '',
          location: data.location || '',
          funding_goal: data.funding_goal || 50000,
          min_investment: data.min_investment || 1000,
          max_investment: data.max_investment || 0,
          business_model: data.business_model || '',
          target_market: data.target_market || '',
          revenue_model: data.revenue_model || '',
          team_size: data.team_size || 1,
          stage: data.stage || 'ideation',
          risk_level: data.risk_level || 'medium',
          expected_roi: data.expected_roi || 0,
          tags: Array.isArray(data.tags) ? data.tags.filter((tag): tag is string => typeof tag === 'string') : [],
          start_date: data.start_date || '',
          end_date: data.end_date || '',
          pitch_deck_url: data.pitch_deck_url || '',
          video_url: data.video_url || '',
          images: Array.isArray(data.images) ? data.images.filter((img): img is string => typeof img === 'string') : []
        });
      }
    } catch (error) {
      console.error('Error loading project:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger le projet",
        variant: "destructive"
      });
    } finally {
      setIsLoadingProject(false);
    }
  };

  const handleInputChange = (field: keyof ProjectData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTagsChange = (tagsString: string) => {
    const tags = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    handleInputChange('tags', tags);
  };

  const handleFileUpload = (url: string, type: 'pitch_deck' | 'video' | 'image') => {
    if (type === 'pitch_deck') {
      handleInputChange('pitch_deck_url', url);
    } else if (type === 'video') {
      handleInputChange('video_url', url);
    } else if (type === 'image') {
      const currentImages = formData.images || [];
      handleInputChange('images', [...currentImages, url]);
    }
    
    toast({
      title: "Upload réussi",
      description: "Votre fichier a été téléchargé avec succès"
    });
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 0:
        return !!(formData.title && formData.description && formData.sector && formData.location);
      case 1:
        return !!(formData.business_model && formData.target_market);
      case 2:
        return formData.funding_goal > 0 && formData.min_investment > 0;
      case 3:
        return true; // Documents optionnels
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    } else {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handleSubmit = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const projectData = {
        ...formData,
        owner_id: user.id,
        status: 'draft',
        current_funding: 0,
        images: formData.images || [],
        documents: []
      };

      let result;
      if (projectId) {
        // Update existing project
        result = await supabase
          .from('projects')
          .update(projectData)
          .eq('id', projectId)
          .eq('owner_id', user.id)
          .select()
          .single();
      } else {
        // Create new project
        result = await supabase
          .from('projects')
          .insert([projectData])
          .select()
          .single();
      }

      if (result.error) throw result.error;

      toast({
        title: projectId ? "Projet modifié" : "Projet créé",
        description: `Votre projet a été ${projectId ? 'modifié' : 'créé'} avec succès`,
      });

      onSuccess?.(result.data.id);

    } catch (error: any) {
      console.error('Error saving project:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de sauvegarder le projet",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingProject) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Nom du projet *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Ex: AgriTech Solutions"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sector">Secteur d'activité *</Label>
                <Select value={formData.sector} onValueChange={(value) => handleInputChange('sector', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un secteur" />
                  </SelectTrigger>
                  <SelectContent>
                    {SECTORS.map(sector => (
                      <SelectItem key={sector} value={sector}>{sector}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Localisation *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="Ex: Dakar, Sénégal"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description du projet *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Décrivez votre projet, son impact et sa valeur ajoutée..."
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stage">Stade de développement</Label>
                <Select value={formData.stage} onValueChange={(value) => handleInputChange('stage', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ideation">Idéation</SelectItem>
                    <SelectItem value="prototype">Prototype</SelectItem>
                    <SelectItem value="mvp">MVP</SelectItem>
                    <SelectItem value="early_revenue">Premiers revenus</SelectItem>
                    <SelectItem value="growth">Croissance</SelectItem>
                    <SelectItem value="expansion">Expansion</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="team_size">Taille de l'équipe</Label>
                <Input
                  id="team_size"
                  type="number"
                  min="1"
                  value={formData.team_size}
                  onChange={(e) => handleInputChange('team_size', parseInt(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="risk_level">Niveau de risque</Label>
                <Select value={formData.risk_level} onValueChange={(value) => handleInputChange('risk_level', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Faible</SelectItem>
                    <SelectItem value="medium">Moyen</SelectItem>
                    <SelectItem value="high">Élevé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Mots-clés (séparés par des virgules)</Label>
              <Input
                id="tags"
                value={formData.tags.join(', ')}
                onChange={(e) => handleTagsChange(e.target.value)}
                placeholder="Ex: agriculture, technologie, innovation, durabilité"
              />
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="business_model">Modèle économique *</Label>
              <Textarea
                id="business_model"
                value={formData.business_model}
                onChange={(e) => handleInputChange('business_model', e.target.value)}
                placeholder="Comment votre entreprise génère-t-elle des revenus ?"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="target_market">Marché cible *</Label>
              <Textarea
                id="target_market"
                value={formData.target_market}
                onChange={(e) => handleInputChange('target_market', e.target.value)}
                placeholder="Qui sont vos clients cibles ? Quelle est la taille du marché ?"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="revenue_model">Modèle de revenus</Label>
              <Textarea
                id="revenue_model"
                value={formData.revenue_model}
                onChange={(e) => handleInputChange('revenue_model', e.target.value)}
                placeholder="Comment monétisez-vous votre solution ?"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expected_roi">ROI attendu (%)</Label>
              <Input
                id="expected_roi"
                type="number"
                min="0"
                max="1000"
                value={formData.expected_roi}
                onChange={(e) => handleInputChange('expected_roi', parseFloat(e.target.value))}
                placeholder="Ex: 25"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="funding_goal">Objectif de financement (€) *</Label>
                <Input
                  id="funding_goal"
                  type="number"
                  min="1000"
                  value={formData.funding_goal}
                  onChange={(e) => handleInputChange('funding_goal', parseInt(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="min_investment">Investissement minimum (€) *</Label>
                <Input
                  id="min_investment"
                  type="number"
                  min="100"
                  value={formData.min_investment}
                  onChange={(e) => handleInputChange('min_investment', parseInt(e.target.value))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_investment">Investissement maximum (€)</Label>
              <Input
                id="max_investment"
                type="number"
                value={formData.max_investment}
                onChange={(e) => handleInputChange('max_investment', parseInt(e.target.value))}
                placeholder="Laissez vide pour aucune limite"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">Date de début de campagne</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => handleInputChange('start_date', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">Date de fin de campagne</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => handleInputChange('end_date', e.target.value)}
                />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">💡 Conseil de financement</h4>
              <p className="text-sm text-blue-700">
                Un objectif de financement réaliste et bien justifié augmente vos chances de succès. 
                Assurez-vous d'avoir un plan d'utilisation détaillé des fonds.
              </p>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label className="text-base font-medium">Pitch Deck (PDF)</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Téléchargez votre présentation détaillée du projet
                </p>
                <FileUpload
                  bucketType="pitch-decks"
                  onUploadComplete={(url) => handleFileUpload(url, 'pitch_deck')}
                  acceptedTypes={['.pdf', '.ppt', '.pptx']}
                />
                {formData.pitch_deck_url && (
                  <p className="text-sm text-green-600 mt-2">✓ Pitch deck téléchargé</p>
                )}
              </div>

              <div>
                <Label className="text-base font-medium">Vidéo de présentation</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Une vidéo courte pour présenter votre projet (optionnel)
                </p>
                <FileUpload
                  bucketType="project-videos"
                  onUploadComplete={(url) => handleFileUpload(url, 'video')}
                  acceptedTypes={['.mp4', '.webm', '.mov']}
                />
                {formData.video_url && (
                  <p className="text-sm text-green-600 mt-2">✓ Vidéo téléchargée</p>
                )}
              </div>

              <div>
                <Label className="text-base font-medium">Images du projet</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Photos, captures d'écran, logos, etc.
                </p>
                <FileUpload
                  bucketType="project-images"
                  onUploadComplete={(url) => handleFileUpload(url, 'image')}
                  acceptedTypes={['.jpg', '.jpeg', '.png', '.webp']}
                />
                {formData.images && formData.images.length > 0 && (
                  <p className="text-sm text-green-600 mt-2">
                    ✓ {formData.images.length} image(s) téléchargée(s)
                  </p>
                )}
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-900 mb-2">📋 Prêt pour la soumission</h4>
              <p className="text-sm text-green-700">
                Votre projet sera soumis pour révision. Notre équipe l'examinera sous 48-72h 
                et vous contactera pour toute information complémentaire.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>
            {projectId ? 'Modifier le projet' : 'Créer un nouveau projet'}
          </CardTitle>
          <CardDescription>
            {projectId ? 'Modifiez les informations de votre projet' : 'Partagez votre vision entrepreneuriale avec notre communauté d\'investisseurs'}
          </CardDescription>
          
          <div className="space-y-4">
            <Progress value={progress} className="w-full" />
            <div className="flex justify-between text-sm">
              <span>Étape {currentStep + 1} sur {steps.length}</span>
              <span>{Math.round(progress)}% complété</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex items-center space-x-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    index <= currentStep 
                      ? 'border-primary bg-primary text-primary-foreground' 
                      : 'border-muted-foreground bg-muted text-muted-foreground'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-12 h-0.5 mx-2 ${
                      index < currentStep ? 'bg-primary' : 'bg-muted'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">{steps[currentStep].title}</h2>
            <p className="text-muted-foreground mb-6">{steps[currentStep].description}</p>
          </div>

          {renderStepContent()}

          <div className="flex justify-between pt-6">
            <Button
              variant="outline"
              onClick={currentStep === 0 ? onCancel : handlePrevious}
              disabled={isLoading}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {currentStep === 0 ? 'Annuler' : 'Précédent'}
            </Button>

            {currentStep < steps.length - 1 ? (
              <Button
                onClick={handleNext}
                disabled={!validateStep(currentStep) || isLoading}
              >
                Suivant
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                className="bg-primary hover:bg-primary/90"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                    Sauvegarde...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {projectId ? 'Modifier le projet' : 'Créer le projet'}
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};