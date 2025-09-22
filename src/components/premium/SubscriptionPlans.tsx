import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Zap, Crown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface SubscriptionPlansProps {
  currentPlan?: string;
  userEmail?: string;
  userId?: string;
}

const plans = [
  {
    id: 'basic',
    name: 'Gratuit',
    price: 0,
    period: '',
    description: 'Parfait pour découvrir la plateforme',
    icon: Star,
    features: [
      'Accès limité aux projets',
      'Recherche basique',
      'Messagerie limitée (5 messages/mois)',
      'Profil standard',
    ],
    limitations: [
      'Pas de matching IA',
      'Visibilité limitée',
    ],
    popular: false,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 29,
    period: '/mois',
    description: 'Pour les investisseurs et entrepreneurs sérieux',
    icon: Zap,
    features: [
      'Accès complet aux projets',
      'Matching IA intelligent',
      'Messagerie illimitée',
      'Profil premium avec badge',
      'Statistiques avancées',
      'Support prioritaire',
      'Notifications push personnalisées',
    ],
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 99,
    period: '/mois',
    description: 'Solution complète pour institutions',
    icon: Crown,
    features: [
      'Tout du plan Premium',
      'Tableau de bord personnalisé',
      'API Access',
      'Rapports détaillés',
      'KYC intégré',
      'Gestionnaire de compte dédié',
      'Intégrations sur mesure',
    ],
    popular: false,
  },
];

export const SubscriptionPlans = ({ currentPlan = 'basic', userEmail, userId }: SubscriptionPlansProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (planId: string, price: number) => {
    if (!userEmail || !userId) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour souscrire.",
        variant: "destructive",
      });
      return;
    }

    if (planId === 'basic') {
      toast({
        title: "Plan gratuit",
        description: "Vous utilisez déjà le plan gratuit.",
      });
      return;
    }

    setLoading(planId);

    try {
      const { data, error } = await supabase.functions.invoke('paystack-payment', {
        body: {
          email: userEmail,
          amount: price,
          plan: planId,
          metadata: {
            userId,
            planType: 'subscription',
          },
        },
      });

      if (error) throw error;

      if (data.success && data.authorization_url) {
        // Redirect to Paystack payment page
        window.open(data.authorization_url, '_blank');
        
        toast({
          title: "Redirection vers le paiement",
          description: "Vous allez être redirigé vers Paystack pour finaliser votre souscription.",
        });
      } else {
        throw new Error('Erreur lors de l\'initialisation du paiement');
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

  return (
    <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
      {plans.map((plan) => {
        const Icon = plan.icon;
        const isCurrentPlan = currentPlan === plan.id;
        
        return (
          <Card 
            key={plan.id} 
            className={`relative transition-all duration-300 hover:shadow-lg ${
              plan.popular ? 'border-primary shadow-md scale-105' : ''
            } ${isCurrentPlan ? 'ring-2 ring-accent' : ''}`}
          >
            {plan.popular && (
              <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground">
                Le plus populaire
              </Badge>
            )}
            
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <div className={`p-3 rounded-full ${
                  plan.popular ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                }`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
              
              <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
              <CardDescription className="text-sm">{plan.description}</CardDescription>
              
              <div className="mt-4">
                <span className="text-3xl font-bold text-foreground">
                  {plan.price === 0 ? 'Gratuit' : `${plan.price}€`}
                </span>
                {plan.period && (
                  <span className="text-muted-foreground text-sm">{plan.period}</span>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <ul className="space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-foreground">{feature}</span>
                  </li>
                ))}
                
                {plan.limitations?.map((limitation, index) => (
                  <li key={`limit-${index}`} className="flex items-start gap-3 opacity-60">
                    <span className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0">×</span>
                    <span className="text-sm text-muted-foreground line-through">{limitation}</span>
                  </li>
                ))}
              </ul>

              <Button
                className="w-full mt-6"
                variant={plan.popular ? "default" : isCurrentPlan ? "secondary" : "outline"}
                disabled={loading === plan.id || isCurrentPlan}
                onClick={() => handleSubscribe(plan.id, plan.price)}
              >
                {loading === plan.id ? (
                  "Traitement..."
                ) : isCurrentPlan ? (
                  "Plan actuel"
                ) : plan.price === 0 ? (
                  "Plan actuel"
                ) : (
                  `Souscrire à ${plan.name}`
                )}
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};