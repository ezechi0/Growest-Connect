import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { seedTestData, clearTestData } from '@/utils/seedData';
import { 
  Database, 
  Trash2, 
  CheckCircle, 
  AlertCircle, 
  Users, 
  FolderPlus,
  TrendingUp,
  Heart,
  MessageSquare
} from 'lucide-react';

export const DataSeeder: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [lastSeedResult, setLastSeedResult] = useState<any>(null);
  const { toast } = useToast();

  const handleSeedData = async () => {
    setLoading(true);
    setProgress(0);

    try {
      // Simulation du progrès
      const progressSteps = [
        { step: 20, message: 'Création des profils investisseurs...' },
        { step: 40, message: 'Création des profils entrepreneurs...' },
        { step: 60, message: 'Chargement des projets...' },
        { step: 80, message: 'Ajout des interactions...' },
        { step: 100, message: 'Finalisation...' }
      ];

      for (const { step, message } of progressSteps) {
        setProgress(step);
        toast({
          title: "Chargement en cours",
          description: message,
        });
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      const result = await seedTestData();
      setLastSeedResult(result.data);

      toast({
        title: "✅ Données de test chargées",
        description: `${result.data.investors} investisseurs, ${result.data.projects} projets créés avec succès.`,
      });

    } catch (error: any) {
      console.error('Erreur lors du chargement:', error);
      toast({
        title: "❌ Erreur lors du chargement",
        description: error.message || "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  const handleClearData = async () => {
    setClearing(true);

    try {
      await clearTestData();
      setLastSeedResult(null);

      toast({
        title: "✅ Données nettoyées",
        description: "Toutes les données de test ont été supprimées.",
      });

    } catch (error: any) {
      console.error('Erreur lors du nettoyage:', error);
      toast({
        title: "❌ Erreur lors du nettoyage", 
        description: error.message || "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setClearing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Gestion des Données de Test
        </CardTitle>
        <CardDescription>
          Chargez des données fictives pour tester les fonctionnalités de la plateforme
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Actions principales */}
        <div className="flex gap-3">
          <Button 
            onClick={handleSeedData} 
            disabled={loading || clearing}
            className="flex items-center gap-2"
          >
            <FolderPlus className="h-4 w-4" />
            {loading ? 'Chargement...' : 'Charger les Données'}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleClearData} 
            disabled={loading || clearing}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            {clearing ? 'Nettoyage...' : 'Nettoyer'}
          </Button>
        </div>

        {/* Barre de progression */}
        {loading && (
          <div className="space-y-2">
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-muted-foreground text-center">
              {progress}% - Création des données de test...
            </p>
          </div>
        )}

        {/* Résultats du dernier chargement */}
        {lastSeedResult && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">Données de test chargées avec succès:</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {lastSeedResult.investors} Investisseurs
                  </Badge>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {lastSeedResult.entrepreneurs} Entrepreneurs
                  </Badge>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <FolderPlus className="h-3 w-3" />
                    {lastSeedResult.projects} Projets
                  </Badge>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    {lastSeedResult.interests} Intérêts
                  </Badge>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" />
                    {lastSeedResult.connections} Connexions
                  </Badge>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Heart className="h-3 w-3" />
                    {lastSeedResult.favorites} Favoris
                  </Badge>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Informations sur les données de test */}
        <div className="bg-muted/50 p-4 rounded-lg space-y-3">
          <h4 className="font-medium flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Contenu des Données de Test
          </h4>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium text-primary">👥 Profils Utilisateurs:</p>
              <ul className="mt-1 space-y-1 text-muted-foreground">
                <li>• 3 investisseurs (Capital Ventures, Innovation Fund, Global Angels)</li>
                <li>• 3 entrepreneurs (EcoTech, MedTech, AgriSmart)</li>
                <li>• Tous avec statut KYC approuvé</li>
              </ul>
            </div>
            <div>
              <p className="font-medium text-primary">🚀 Projets:</p>
              <ul className="mt-1 space-y-1 text-muted-foreground">
                <li>• EcoPackaging Revolution (250K€)</li>
                <li>• AI Health Diagnostics (500K€)</li>
                <li>• Smart Farm Network (180K€)</li>
                <li>• FinTech Mobile Solutions (300K€)</li>
              </ul>
            </div>
            <div>
              <p className="font-medium text-primary">💼 Interactions:</p>
              <ul className="mt-1 space-y-1 text-muted-foreground">
                <li>• Intérêts d'investissement exprimés</li>
                <li>• Demandes de connexion</li>
                <li>• Transactions complétées</li>
                <li>• Projets favoris</li>
              </ul>
            </div>
            <div>
              <p className="font-medium text-primary">💰 Secteurs Couverts:</p>
              <ul className="mt-1 space-y-1 text-muted-foreground">
                <li>• Technologie & Développement durable</li>
                <li>• Santé & Intelligence Artificielle</li>
                <li>• Agriculture & IoT</li>
                <li>• FinTech & Inclusion financière</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Avertissement */}
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Attention:</strong> Ces données sont fictives et destinées aux tests uniquement. 
            Utilisez la fonction "Nettoyer" avant le lancement en production.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};