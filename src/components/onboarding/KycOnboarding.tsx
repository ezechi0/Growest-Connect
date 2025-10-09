import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';
import { FileUpload } from '../FileUpload';
import { 
  User, 
  Building, 
  MapPin, 
  Phone, 
  Globe, 
  FileText, 
  Upload,
  CheckCircle,
  ArrowRight,
  Shield
} from 'lucide-react';

interface KycStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

interface KycFormData {
  // Informations personnelles
  full_name: string;
  phone: string;
  location: string;
  bio: string;
  website: string;
  
  // Informations spécifiques
  company: string;
  investment_range?: string;
  investment_sectors?: string[];
  experience_years?: number;
  
  // Documents KYC
  kyc_document_url?: string;
}

export const KycOnboarding: React.FC = () => {
  const { user, profile, updateProfile } = useUserRole();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<KycFormData>({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    location: profile?.location || '',
    bio: profile?.bio || '',
    website: profile?.website || '',
    company: profile?.company || '',
  });

  const steps: KycStep[] = [
    {
      id: 'personal',
      title: 'Informations personnelles',
      description: 'Complétez vos informations de base',
      completed: false
    },
    {
      id: 'professional',
      title: 'Informations professionnelles',
      description: profile?.user_type === 'entrepreneur' ? 'Parlez-nous de votre entreprise' : 'Vos préférences d\'investissement',
      completed: false
    },
    {
      id: 'documents',
      title: 'Vérification d\'identité',
      description: 'Téléchargez vos documents d\'identité',
      completed: false
    },
    {
      id: 'review',
      title: 'Révision',
      description: 'Vérifiez vos informations avant soumission',
      completed: false
    }
  ];

  const handleInputChange = (field: keyof KycFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleDocumentUpload = (url: string) => {
    setFormData(prev => ({ ...prev, kyc_document_url: url }));
    toast({
      title: "Document téléchargé",
      description: "Votre document a été téléchargé avec succès"
    });
  };

  const handleSubmit = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const updates = {
        ...formData,
        kyc_status: 'under_review' as const,
        is_verified: false
      };

      const { error } = await updateProfile(updates);
      
      if (error) {
        throw new Error(error);
      }

      toast({
        title: "Profil soumis pour révision",
        description: "Votre demande KYC a été soumise. Nous vous contacterons sous 48h.",
        duration: 5000
      });

      // Redirection vers le dashboard
      window.location.href = '/dashboard';

    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Erreur",
        description: "Impossible de soumettre votre profil",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderPersonalInfoStep = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="full_name">Nom complet *</Label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => handleInputChange('full_name', e.target.value)}
              className="pl-10"
              placeholder="Votre nom complet"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Téléphone *</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="pl-10"
              placeholder="+221 77 123 45 67"
            />
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="location">Localisation *</Label>
        <div className="relative">
          <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
            className="pl-10"
            placeholder="Ville, Pays"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="website">Site web</Label>
        <div className="relative">
          <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="website"
            value={formData.website}
            onChange={(e) => handleInputChange('website', e.target.value)}
            className="pl-10"
            placeholder="https://votre-site.com"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Biographie *</Label>
        <Textarea
          id="bio"
          value={formData.bio}
          onChange={(e) => handleInputChange('bio', e.target.value)}
          placeholder="Parlez-nous de vous, votre expérience et vos objectifs..."
          rows={4}
        />
      </div>
    </div>
  );

  const renderProfessionalInfoStep = () => {
    if (profile?.user_type === 'entrepreneur') {
      return (
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="company">Nom de l'entreprise *</Label>
            <div className="relative">
              <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
                className="pl-10"
                placeholder="Nom de votre entreprise"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="experience_years">Années d'expérience</Label>
            <Select value={formData.experience_years?.toString()} onValueChange={(value) => handleInputChange('experience_years', parseInt(value))}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez votre expérience" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Moins d'1 an</SelectItem>
                <SelectItem value="2">1-2 ans</SelectItem>
                <SelectItem value="5">3-5 ans</SelectItem>
                <SelectItem value="10">5-10 ans</SelectItem>
                <SelectItem value="15">Plus de 10 ans</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      );
    } else {
      return (
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="investment_range">Montant d'investissement préféré</Label>
            <Select value={formData.investment_range} onValueChange={(value) => handleInputChange('investment_range', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez votre fourchette" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="500000-5000000">500,000 - 5,000,000 FCFA</SelectItem>
                <SelectItem value="5000000-25000000">5,000,000 - 25,000,000 FCFA</SelectItem>
                <SelectItem value="25000000-50000000">25,000,000 - 50,000,000 FCFA</SelectItem>
                <SelectItem value="50000000-250000000">50,000,000 - 250,000,000 FCFA</SelectItem>
                <SelectItem value="250000000+">Plus de 250,000,000 FCFA</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="company">Organisation/Fonds</Label>
            <div className="relative">
              <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
                className="pl-10"
                placeholder="Nom de votre organisation"
              />
            </div>
          </div>
        </div>
      );
    }
  };

  const renderDocumentsStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">Vérification d'identité</h3>
        <p className="text-muted-foreground mb-6">
          Téléchargez une copie de votre pièce d'identité (CNI, passeport) pour vérifier votre profil
        </p>
      </div>

      <FileUpload
        bucketType="kyc-documents"
        onUploadComplete={(url) => handleDocumentUpload(url)}
        acceptedTypes={["image/*", ".pdf"]}
        maxSizeMB={10}
      />

      {formData.kyc_document_url && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <span className="text-green-700">Document téléchargé avec succès</span>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Documents acceptés:</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Carte d'identité nationale</li>
          <li>• Passeport</li>
          <li>• Permis de conduire</li>
        </ul>
        <p className="text-xs text-blue-600 mt-2">
          Assurez-vous que le document est lisible et non expiré
        </p>
      </div>
    </div>
  );

  const renderReviewStep = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Révision de votre profil</h3>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Informations personnelles</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Nom:</span> {formData.full_name}
            </div>
            <div>
              <span className="font-medium">Téléphone:</span> {formData.phone}
            </div>
            <div>
              <span className="font-medium">Localisation:</span> {formData.location}
            </div>
            {formData.website && (
              <div>
                <span className="font-medium">Site web:</span> {formData.website}
              </div>
            )}
          </div>
          {formData.bio && (
            <div>
              <span className="font-medium">Biographie:</span>
              <p className="text-muted-foreground mt-1">{formData.bio}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Informations professionnelles</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {formData.company && (
            <div>
              <span className="font-medium">
                {profile?.user_type === 'entrepreneur' ? 'Entreprise' : 'Organisation'}:
              </span> {formData.company}
            </div>
          )}
          {formData.investment_range && (
            <div>
              <span className="font-medium">Montant d'investissement:</span> {formData.investment_range}
            </div>
          )}
          {formData.experience_years && (
            <div>
              <span className="font-medium">Expérience:</span> {formData.experience_years} années
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Statut de vérification</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            {formData.kyc_document_url ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-green-700">Document d'identité téléchargé</span>
              </>
            ) : (
              <>
                <FileText className="h-5 w-5 text-orange-600" />
                <span className="text-orange-700">Document manquant</span>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Finalisation de votre profil</h1>
          <p className="text-muted-foreground">
            Quelques étapes pour compléter votre inscription sur Growest Connect
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="space-y-4">
              <Progress value={progress} className="w-full" />
              <div className="flex justify-between text-sm">
                <span>Étape {currentStep + 1} sur {steps.length}</span>
                <span>{Math.round(progress)}% complété</span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">{steps[currentStep].title}</h2>
              <p className="text-muted-foreground">{steps[currentStep].description}</p>
            </div>

            {currentStep === 0 && renderPersonalInfoStep()}
            {currentStep === 1 && renderProfessionalInfoStep()}
            {currentStep === 2 && renderDocumentsStep()}
            {currentStep === 3 && renderReviewStep()}

            <div className="flex justify-between pt-6">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 0}
              >
                Précédent
              </Button>

              {currentStep < steps.length - 1 ? (
                <Button onClick={handleNext}>
                  Suivant
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={isLoading || !formData.kyc_document_url}
                  className="bg-primary hover:bg-primary/90"
                >
                  {isLoading ? 'Soumission...' : 'Soumettre pour révision'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};