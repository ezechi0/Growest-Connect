import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PremiumPlans } from "@/components/PremiumPlans";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Crown, TrendingUp, Users, BarChart3, Star, Zap } from "lucide-react";

const premiumFeatures = [
  {
    icon: <TrendingUp className="h-8 w-8 text-accent" />,
    title: "Visibilité Renforcée",
    description: "Vos projets apparaissent en priorité dans les résultats de recherche des investisseurs."
  },
  {
    icon: <Users className="h-8 w-8 text-accent" />,
    title: "Accès Investisseurs Premium",
    description: "Consultez les profils complets et les critères d'investissement détaillés."
  },
  {
    icon: <BarChart3 className="h-8 w-8 text-accent" />,
    title: "Analytics Avancées",
    description: "Statistiques détaillées sur les vues, interactions et performance de vos projets."
  },
  {
    icon: <Star className="h-8 w-8 text-accent" />,
    title: "Matching IA Premium",
    description: "Algorithme avancé pour identifier les investisseurs les plus compatibles."
  },
  {
    icon: <Zap className="h-8 w-8 text-accent" />,
    title: "Support Prioritaire",
    description: "Assistance dédiée et réponse rapide à toutes vos questions."
  },
];

export default function Premium() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    getUser();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Crown className="h-12 w-12 text-accent mx-auto mb-4" />
            <CardTitle>Accès Premium Requis</CardTitle>
            <CardDescription>
              Vous devez être connecté pour accéder aux plans premium.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5">
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <Crown className="h-16 w-16 text-accent" />
          </div>
          <h1 className="text-4xl font-bold text-primary mb-4">
            Débloquez votre Potentiel Premium
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Accédez aux fonctionnalités avancées d'Invest Connect et maximisez 
            vos chances de trouver les investisseurs parfaits pour vos projets.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {premiumFeatures.map((feature, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  {feature.icon}
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pricing Plans */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary mb-4">
              Choisissez votre Plan Premium
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Sélectionnez l'abonnement qui correspond le mieux à vos besoins 
              et commencez à développer votre réseau d'investisseurs.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <PremiumPlans 
              userEmail={user.email || ""} 
              userId={user.id} 
            />
          </div>
        </div>

        {/* Success Stories */}
        <Card className="bg-gradient-to-r from-accent/10 to-primary/10 border-accent/20">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-primary">
              Rejoignez plus de 500+ entrepreneurs premium
            </CardTitle>
            <CardDescription className="text-lg">
              Qui ont déjà levé plus de 2 milliards NGN grâce à Invest Connect Premium
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-accent mb-2">85%</div>
                <p className="text-muted-foreground">de taux de matching réussi</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-accent mb-2">3x</div>
                <p className="text-muted-foreground">plus de visibilité</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-accent mb-2">30j</div>
                <p className="text-muted-foreground">temps moyen pour lever des fonds</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}