import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";
import { PaystackButton } from "./PaystackButton";

const plans = [
  {
    name: "Premium Mensuel",
    price: 25000,
    period: "mois",
    description: "Accès complet aux fonctionnalités premium",
    features: [
      "Visibilité renforcée des projets",
      "Accès complet aux informations d'investisseurs",
      "Matching IA avancé",
      "Statistiques détaillées",
      "Support prioritaire",
      "Notifications en temps réel",
    ],
    popular: false,
  },
  {
    name: "Premium Annuel",
    price: 250000,
    period: "an",
    description: "2 mois offerts avec l'abonnement annuel",
    features: [
      "Toutes les fonctionnalités Premium Mensuel",
      "2 mois gratuits (économie de 50,000 NGN)",
      "Accès bêta aux nouvelles fonctionnalités",
      "Consultation gratuite avec un expert",
      "Rapport mensuel personnalisé",
    ],
    popular: true,
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
                ₦{plan.price.toLocaleString()}
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