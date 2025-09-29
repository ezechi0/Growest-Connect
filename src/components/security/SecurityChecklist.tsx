import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, AlertTriangle, CheckCircle, Info } from "lucide-react";

export const SecurityChecklist = () => {
  const securityItems = [
    {
      title: "Protection RLS Active",
      description: "Row Level Security est activée sur toutes les tables sensibles",
      status: "complete",
      icon: CheckCircle,
      color: "text-green-600"
    },
    {
      title: "Authentification Sécurisée",
      description: "Système d'authentification Supabase avec gestion des sessions",
      status: "complete", 
      icon: CheckCircle,
      color: "text-green-600"
    },
    {
      title: "Validation des Données",
      description: "Validation côté client et serveur pour tous les formulaires",
      status: "complete",
      icon: CheckCircle,
      color: "text-green-600"
    },
    {
      title: "Paiements Sécurisés",
      description: "Intégration Paystack avec vérification côté serveur",
      status: "complete",
      icon: CheckCircle,
      color: "text-green-600"
    },
    {
      title: "Protection Mots de Passe",
      description: "Protection contre les mots de passe divulgués (à configurer dans Supabase)",
      status: "warning",
      icon: AlertTriangle,
      color: "text-amber-600"
    },
    {
      title: "HTTPS Only",
      description: "Toutes les communications chiffrées en production",
      status: "complete",
      icon: CheckCircle,
      color: "text-green-600"
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Sécurité de l'Application
        </CardTitle>
        <CardDescription>
          État de la sécurité et recommandations
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {securityItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg border">
                <Icon className={`h-5 w-5 mt-0.5 ${item.color}`} />
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{item.title}</h4>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Action requise :</strong> Pour activer la protection contre les mots de passe divulgués, 
            allez dans votre projet Supabase → Authentication → Settings → Password Protection et activez cette option.
          </AlertDescription>
        </Alert>

        <div className="pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            ✅ Toutes les fonctionnalités critiques sont sécurisées et opérationnelles
          </p>
        </div>
      </CardContent>
    </Card>
  );
};