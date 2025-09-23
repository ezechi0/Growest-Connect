import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';
import { 
  Sparkles, 
  TrendingUp, 
  Users, 
  MapPin, 
  Euro, 
  Star, 
  RefreshCw,
  Brain,
  Target,
  Zap,
  Clock,
  Award
} from 'lucide-react';

interface MatchPreferences {
  sectors: string[];
  location: string;
  fundingRange: [number, number];
  riskTolerance: string;
  investmentStyle: string;
  experience: string;
}

interface Match {
  id: string;
  title?: string;
  full_name?: string;
  description?: string;
  bio?: string;
  sector?: string;
  company?: string;
  location: string;
  funding_goal?: number;
  matchScore: number;
  reasons: string[];
  aiAnalyzed: boolean;
  profiles?: {
    full_name: string;
    company?: string;
  };
}

interface AdvancedMatchingProps {
  userId?: string;
  userType: 'investor' | 'entrepreneur';
}

export const AdvancedMatching: React.FC<AdvancedMatchingProps> = ({ userId, userType }) => {
  const { user } = useUserRole();
  const { toast } = useToast();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState<MatchPreferences>({
    sectors: [],
    location: '',
    fundingRange: [10000, 1000000],
    riskTolerance: 'medium',
    investmentStyle: 'balanced',
    experience: 'intermediate'
  });

  const currentUserId = userId || user?.id;

  const sectors = [
    'Agriculture', 'Éducation', 'Santé', 'Énergie', 'Fintech', 
    'E-commerce', 'Technologie', 'Transport', 'Immobilier', 'Autre'
  ];

  const runAdvancedMatching = async () => {
    if (!currentUserId) {
      toast({
        title: "Connexion requise",
        description: "Connectez-vous pour utiliser le matching avancé",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('advanced-matching', {
        body: {
          userId: currentUserId,
          userType,
          preferences
        }
      });

      if (error) throw error;

      if (data.success) {
        setMatches(data.matches || []);
        toast({
          title: "✨ Matching terminé",
          description: `${data.matches?.length || 0} résultats trouvés (${data.aiAnalyzed || 0} analysés par IA)`,
        });
      } else {
        throw new Error(data.error || 'Erreur lors du matching');
      }
    } catch (error: any) {
      console.error('Error running advanced matching:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'exécuter le matching",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = (key: keyof MatchPreferences, value: any) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 70) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (score >= 50) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 85) return <Award className="w-4 h-4" />;
    if (score >= 70) return <Star className="w-4 h-4" />;
    if (score >= 50) return <Target className="w-4 h-4" />;
    return <Clock className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-primary" />
            Matching IA Avancé
          </CardTitle>
          <CardDescription>
            Utilisez notre algorithme d'intelligence artificielle pour trouver les meilleurs {userType === 'investor' ? 'projets' : 'investisseurs'} qui correspondent à votre profil et préférences.
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="preferences" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="preferences">Préférences</TabsTrigger>
          <TabsTrigger value="results">Résultats ({matches.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Configurez vos préférences
              </CardTitle>
              <CardDescription>
                Plus vos préférences sont précises, plus les résultats seront pertinents
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Secteurs d'intérêt */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Secteurs d'intérêt</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {sectors.map(sector => (
                    <div key={sector} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={sector}
                        checked={preferences.sectors.includes(sector)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            updatePreference('sectors', [...preferences.sectors, sector]);
                          } else {
                            updatePreference('sectors', preferences.sectors.filter(s => s !== sector));
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor={sector} className="text-sm">{sector}</Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Localisation */}
              <div className="space-y-2">
                <Label htmlFor="location">Localisation préférée</Label>
                <Input
                  id="location"
                  value={preferences.location}
                  onChange={(e) => updatePreference('location', e.target.value)}
                  placeholder="ex: Paris, Dakar, Abidjan..."
                />
              </div>

              {userType === 'investor' && (
                <>
                  {/* Fourchette de financement */}
                  <div className="space-y-3">
                    <Label>
                      Fourchette de financement: €{preferences.fundingRange[0].toLocaleString()} - €{preferences.fundingRange[1].toLocaleString()}
                    </Label>
                    <div className="px-3">
                      <Slider
                        value={preferences.fundingRange}
                        onValueChange={(value) => updatePreference('fundingRange', value)}
                        max={5000000}
                        min={1000}
                        step={10000}
                        className="w-full"
                      />
                    </div>
                  </div>

                  {/* Tolérance au risque */}
                  <div className="space-y-2">
                    <Label>Tolérance au risque</Label>
                    <Select 
                      value={preferences.riskTolerance} 
                      onValueChange={(value) => updatePreference('riskTolerance', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">🛡️ Conservateur (risque faible)</SelectItem>
                        <SelectItem value="medium">⚖️ Équilibré (risque modéré)</SelectItem>
                        <SelectItem value="high">🚀 Agressif (risque élevé)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Style d'investissement */}
                  <div className="space-y-2">
                    <Label>Style d'investissement</Label>
                    <Select 
                      value={preferences.investmentStyle} 
                      onValueChange={(value) => updatePreference('investmentStyle', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hands-off">🏖️ Passif (mains libres)</SelectItem>
                        <SelectItem value="balanced">🤝 Équilibré (conseil occasionnel)</SelectItem>
                        <SelectItem value="hands-on">⚡ Actif (accompagnement rapproché)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Niveau d'expérience */}
                  <div className="space-y-2">
                    <Label>Niveau d'expérience</Label>
                    <Select 
                      value={preferences.experience} 
                      onValueChange={(value) => updatePreference('experience', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">🌱 Débutant</SelectItem>
                        <SelectItem value="intermediate">📈 Intermédiaire</SelectItem>
                        <SelectItem value="expert">🏆 Expert</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              <Button 
                onClick={runAdvancedMatching} 
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                size="lg"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                    Analyse en cours...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Lancer le matching IA
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          {matches.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Brain className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-medium mb-2">Aucun résultat</h3>
                <p className="text-muted-foreground mb-4">
                  Configurez vos préférences et lancez le matching IA pour découvrir vos meilleures opportunités.
                </p>
                <Button variant="outline" onClick={() => {
                  const elem = document.querySelector('[value="preferences"]') as HTMLElement;
                  elem?.click();
                }}>
                  Configurer mes préférences
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Statistiques */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-2xl font-bold">{matches.length}</p>
                        <p className="text-sm text-muted-foreground">Résultats totaux</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="text-2xl font-bold">
                          {matches.filter(m => m.matchScore >= 85).length}
                        </p>
                        <p className="text-sm text-muted-foreground">Excellents matches</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Brain className="w-5 h-5 text-purple-600" />
                      <div>
                        <p className="text-2xl font-bold">
                          {matches.filter(m => m.aiAnalyzed).length}
                        </p>
                        <p className="text-sm text-muted-foreground">Analysés par IA</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-orange-600" />
                      <div>
                        <p className="text-2xl font-bold">
                          {Math.round(matches.reduce((sum, m) => sum + m.matchScore, 0) / matches.length || 0)}%
                        </p>
                        <p className="text-sm text-muted-foreground">Score moyen</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Résultats */}
              <div className="grid gap-4">
                {matches.map((match) => (
                  <Card key={match.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-4">
                          <Avatar className="w-12 h-12">
                            <AvatarFallback>
                              {(match.title || match.full_name || 'M').charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold mb-1">
                              {match.title || match.full_name}
                            </h3>
                            {match.profiles?.company && (
                              <p className="text-sm text-muted-foreground mb-2">
                                {match.profiles.company}
                              </p>
                            )}
                            <div className="flex flex-wrap gap-2 mb-3">
                              {match.sector && (
                                <Badge variant="secondary">{match.sector}</Badge>
                              )}
                              <Badge variant="outline" className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {match.location}
                              </Badge>
                              {match.funding_goal && (
                                <Badge variant="outline" className="flex items-center gap-1">
                                  <Euro className="w-3 h-3" />
                                  {match.funding_goal.toLocaleString()}€
                                </Badge>
                              )}
                              {match.aiAnalyzed && (
                                <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                                  <Brain className="w-3 h-3 mr-1" />
                                  IA
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {(match.description || match.bio || '').substring(0, 150)}...
                            </p>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border ${getScoreColor(match.matchScore)}`}>
                            {getScoreIcon(match.matchScore)}
                            <span className="font-bold">{Math.round(match.matchScore)}%</span>
                          </div>
                        </div>
                      </div>

                      {/* Score visuel */}
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Compatibilité</span>
                          <span>{Math.round(match.matchScore)}%</span>
                        </div>
                        <Progress value={match.matchScore} className="h-2" />
                      </div>

                      {/* Raisons du match */}
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-muted-foreground">
                          Pourquoi ce match ?
                        </h4>
                        <div className="space-y-1">
                          {match.reasons.map((reason, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm">
                              <Star className="w-3 h-3 text-yellow-500" />
                              <span>{reason}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-2 mt-4">
                        <Button className="flex-1">
                          Voir le profil complet
                        </Button>
                        <Button variant="outline">
                          Se connecter
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};