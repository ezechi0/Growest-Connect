import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, Star, Zap, Crown, Users, TrendingUp, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PremiumPlansV2Props {
  userEmail: string;
  userId: string;
  userRole?: string;
  currentPlan?: string;
}

const plans = [
  {
    id: 'start',
    name: 'Premium Start',
    subtitle: 'Pour Fondateurs',
    price: 25000,
    originalPrice: 30000,
    period: 'mois',
    description: 'Boostez votre visibilité et trouvez des investisseurs',
    icon: Star,
    color: 'from-primary to-primary-light',
    popular: false,
    targetRole: 'entrepreneur',
    features: [
      'Visibilité renforcée des projets',
      'Accès complet aux profils investisseurs',
      'Matching IA avancé',
      'Statistiques détaillées',
      'Support prioritaire',
      'Badge Premium Start',
      'Notifications en temps réel',
      'Messagerie illimitée'
    ],
    limitations: []
  },
  {
    id: 'capital',
    name: 'Premium Capital',
    subtitle: 'Pour Investisseurs',
    price: 35000,
    originalPrice: 40000,
    period: 'mois',
    description: 'Découvrez les meilleures opportunités d\'investissement',
    icon: Zap,
    color: 'from-accent to-accent-light',
    popular: true,
    targetRole: 'investor',
    features: [
      'Accès anticipé aux nouveaux projets',
      'Filtres avancés et alertes personnalisées',
      'Rapports de due diligence détaillés',
      'Portfolio tracking avancé',
      'Connexion directe avec fondateurs',
      'Badge Premium Capital',
      'Analytics d\'investissement',
      'Support dédié',
      'Accès aux pitch rooms exclusives'
    ],
    limitations: []
  },
  {
    id: 'pro_plus',
    name: 'Pro+',
    subtitle: 'Pour Corporates',
    price: 99000,
    originalPrice: 120000,
    period: 'mois',
    description: 'Solution complète pour institutions et fonds',
    icon: Crown,
    color: 'from-amber-500 to-amber-600',
    popular: false,
    targetRole: 'admin',
    features: [
      'Toutes les fonctionnalités Premium',
      'Tableau de bord personnalisé',
      'API access complet',
      'White-label options',
      'Rapports institutionnels',
      'Gestionnaire de compte dédié',
      'Intégrations sur mesure',
      'KYC institutionnel avancé',
      'Multi-utilisateurs (jusqu\'à 10)',
      'Support 24/7',
      'Formation équipe',
      'Conformité réglementaire'
    ],
    limitations: []
  }
];

export const PremiumPlansV2 = ({ userEmail, userId, userRole, currentPlan }: PremiumPlansV2Props) => {
  const [loading, setLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubscribe = async (planId: string, price: number) => {
    if (!userEmail || !userId) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour souscrire.",
        variant: "destructive",
      });
      return;
    }

    if (currentPlan === planId) {
      toast({
        title: "Plan actuel",
        description: "Vous utilisez déjà ce plan.",
      });
      return;
    }

    setLoading(planId);

    try {
      const { data, error } = await supabase.functions.invoke('paystack-payment', {
        body: {
          action: 'create_subscription',
          email: userEmail,
          amount: price,
          plan_code: planId,
          metadata: {
            user_id: userId,
            plan_type: planId,
            subscription_type: 'recurring'
          },
        },
      });

      if (error) throw error;

      if (data.success && data.authorization_url) {
        window.location.href = data.authorization_url;
        
        toast({
          title: "Redirection vers le paiement",
          description: "Vous allez être redirigé vers Paystack pour finaliser votre abonnement.",
        });
      } else {
        throw new Error(data.error || 'Erreur lors de l\'initialisation du paiement');
      }
    } catch (error: any) {
      console.error('Subscription error:', error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la souscription.",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  const getRecommendedPlan = () => {
    if (userRole === 'investor') return 'capital';
    if (userRole === 'admin') return 'pro_plus';
    return 'start';
  };

  const recommendedPlan = getRecommendedPlan();

  return (
    <div className="space-y-8">
      {/* Free vs Premium Comparison */}
      <Card className="bg-gradient-to-r from-muted/50 to-muted/30 border-dashed">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <TrendingUp className="h-5 w-5 text-accent" />
            Gratuit vs Premium
          </CardTitle>
          <CardDescription>
            Découvrez tout ce que vous débloquez avec un abonnement premium
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-muted-foreground">Plan Gratuit</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full" />
                  Accès limité aux projets (5/mois)
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full" />
                  Recherche basique
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full" />
                  5 messages/mois
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full" />
                  Support standard
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-accent">Plans Premium</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-accent" />
                  Accès illimité à tous les projets
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-accent" />
                  Matching IA avancé
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-accent" />
                  Messagerie illimitée
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-accent" />
                  Support prioritaire 24/7
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-accent" />
                  Analytics avancées
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-accent" />
                  Badge premium et visibilité renforcée
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Premium Plans */}
      <div className="grid lg:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const Icon = plan.icon;
          const isRecommended = plan.id === recommendedPlan;
          const isCurrentPlan = currentPlan === plan.id;
          const savings = Math.round(((plan.originalPrice - plan.price) / plan.originalPrice) * 100);
          
          return (
            <Card 
              key={plan.id} 
              className={`relative transition-all duration-300 hover:shadow-lg ${
                plan.popular ? 'border-accent shadow-md scale-105 ring-2 ring-accent/20' : ''
              } ${isCurrentPlan ? 'ring-2 ring-primary' : ''} ${
                isRecommended && !isCurrentPlan ? 'ring-2 ring-primary/30' : ''
              }`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-accent text-accent-foreground">
                  Le plus populaire
                </Badge>
              )}
              
              {isRecommended && !isCurrentPlan && (
                <Badge className="absolute -top-3 right-4 bg-primary text-primary-foreground">
                  Recommandé pour vous
                </Badge>
              )}

              {isCurrentPlan && (
                <Badge className="absolute -top-3 right-4 bg-secondary text-secondary-foreground">
                  Plan actuel
                </Badge>
              )}
              
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  <div className={`p-4 rounded-full bg-gradient-to-r ${plan.color} text-white shadow-lg`}>
                    <Icon className="h-8 w-8" />
                  </div>
                </div>
                
                <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                <Badge variant="outline" className="mx-auto w-fit text-xs">
                  {plan.subtitle}
                </Badge>
                <CardDescription className="text-sm mt-2">{plan.description}</CardDescription>
                
                <div className="mt-6 space-y-2">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-2xl text-muted-foreground line-through">
                      ₦{plan.originalPrice.toLocaleString()}
                    </span>
                    <Badge variant="destructive" className="text-xs">
                      -{savings}%
                    </Badge>
                  </div>
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold text-foreground">
                      ₦{plan.price.toLocaleString()}
                    </span>
                    <span className="text-muted-foreground text-sm ml-2">/{plan.period}</span>
                  </div>
                  <p className="text-xs text-accent font-medium">
                    Économisez ₦{(plan.originalPrice - plan.price).toLocaleString()}/mois
                  </p>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className="w-full"
                  variant={plan.popular ? "default" : isCurrentPlan ? "secondary" : "outline"}
                  disabled={loading === plan.id || isCurrentPlan}
                  onClick={() => handleSubscribe(plan.id, plan.price)}
                >
                  {loading === plan.id ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Traitement...
                    </div>
                  ) : isCurrentPlan ? (
                    "Plan actuel"
                  ) : (
                    `S'abonner à ${plan.name}`
                  )}
                </Button>

                {isRecommended && !isCurrentPlan && (
                  <p className="text-xs text-center text-primary font-medium">
                    ⭐ Recommandé selon votre profil
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Trust Indicators */}
      <Card className="bg-gradient-to-r from-primary/5 to-accent/5">
        <CardContent className="p-6">
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div className="flex flex-col items-center gap-2">
              <Shield className="h-8 w-8 text-accent" />
              <h4 className="font-semibold">Paiement Sécurisé</h4>
              <p className="text-sm text-muted-foreground">Cryptage SSL et Paystack certifié</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Users className="h-8 w-8 text-accent" />
              <h4 className="font-semibold">500+ Entrepreneurs</h4>
              <p className="text-sm text-muted-foreground">Nous font déjà confiance</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <TrendingUp className="h-8 w-8 text-accent" />
              <h4 className="font-semibold">₦2B+ Levés</h4>
              <p className="text-sm text-muted-foreground">Grâce à notre plateforme</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};