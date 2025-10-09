import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";
import { PaystackButton } from "./PaystackButton";

const plans = [
  {
    name: "Premium Test",
    price: 1000, // Prix test en FCFA
    period: "mois",
    description: "Version test complète",
    features: [
      "✨ Accès complet pendant 30 jours",
      "🚀 Visibilité maximale des projets",
      "🤝 Matching IA avancé",
      "📊 Analytics exclusifs",
      "💬 Support prioritaire 24/7",
      "🔔 Notifications premium",
      "🎯 Recommandations personnalisées",
    ],
    popular: true,
  },
  {
    name: "Premium Starter",
    price: 15000, // ~25€ en FCFA
    period: "mois",
    description: "Pour commencer son aventure",
    features: [
      "🔥 Toutes les fonctionnalités Premium Test",
      "💎 Badge exclusif",
      "📈 Statistiques avancées",
      "🎬 Vidéos pitch prioritaires",
      "🤖 Assistant IA personnel",
      "🌟 Profil vérifié",
    ],
    popular: false,
  },
];

interface PremiumPlansProps {
  userEmail: string;
  userId: string;
}

export const PremiumPlans = ({ userEmail, userId }: PremiumPlansProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {plans.map((plan) => (
        <Card key={plan.name} className={`relative ${plan.popular ? 'border-accent shadow-lg' : ''}`}>
          {plan.popular && (
            <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-accent text-accent-foreground">
              Plus populaire
            </Badge>
          )}
          
          <CardHeader className="text-center">
            <CardTitle className="text-xl font-bold text-primary">
              {plan.name}
            </CardTitle>
            <CardDescription>{plan.description}</CardDescription>
            <div className="mt-4">
              <span className="text-3xl font-bold text-foreground">
                {plan.price.toLocaleString()} FCFA
              </span>
              <span className="text-muted-foreground">/{plan.period}</span>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <ul className="space-y-2">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>

            <PaystackButton
              amount={plan.price}
              email={userEmail}
              investorId={userId}
              transactionType="subscription"
              planName={plan.name}
              variant="default"
            >
              S'abonner à {plan.name}
            </PaystackButton>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};