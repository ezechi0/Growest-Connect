import { useState, useEffect } from "react";
import { SubscriptionPlans } from "@/components/premium/SubscriptionPlans";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, Star, Shield, TrendingUp, Users, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Premium = () => {
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        setUserProfile(profile);
      }
      setLoading(false);
    };

    getUser();
  }, []);

  const features = [
    {
      icon: Star,
      title: "Matching IA Intelligent",
      description: "Notre algorithme d'IA analyse vos préférences pour vous recommander les projets parfaits.",
    },
    {
      icon: TrendingUp,
      title: "Analytiques Avancées",
      description: "Suivez vos performances d'investissement avec des rapports détaillés et des insights.",
    },
    {
      icon: MessageSquare,
      title: "Messagerie Illimitée",
      description: "Échangez sans limite avec les porteurs de projets et autres investisseurs.",
    },
    {
      icon: Shield,
      title: "Vérification KYC",
      description: "Profil vérifié avec badge premium pour plus de crédibilité.",
    },
    {
      icon: Users,
      title: "Réseau Premium",
      description: "Accès exclusif à des événements et à un réseau d'investisseurs qualifiés.",
    },
    {
      icon: Zap,
      title: "Support Prioritaire",
      description: "Assistance rapide et personnalisée pour tous vos besoins.",
    },
  ];

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto p-6 space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-6 py-12">
          <Badge className="mb-4" variant="secondary">
            🚀 Passez au niveau supérieur
          </Badge>
          
          <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
            Débloquez tout le potentiel
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
              d'Invest Connect
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Accédez aux fonctionnalités avancées, au matching IA intelligent et 
            à un réseau premium d'investisseurs et entrepreneurs.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="border-border/50 hover:border-primary/20 transition-all duration-300 hover:shadow-lg">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Subscription Plans */}
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Choisissez votre plan
            </h2>
            <p className="text-muted-foreground">
              Des solutions adaptées à tous vos besoins d'investissement
            </p>
          </div>

          <SubscriptionPlans 
            currentPlan="basic"
            userEmail={user?.email}
            userId={user?.id}
          />
        </div>

        {/* CTA Section */}
        <div className="text-center py-12">
          <Card className="max-w-2xl mx-auto border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-foreground mb-4">
                Prêt à transformer vos investissements ?
              </h3>
              <p className="text-muted-foreground mb-6">
                Rejoignez plus de 1000+ investisseurs qui utilisent déjà nos outils avancés 
                pour faire les meilleurs choix d'investissement.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Badge variant="secondary" className="text-sm px-4 py-2">
                  ✅ Essai gratuit 14 jours
                </Badge>
                <Badge variant="secondary" className="text-sm px-4 py-2">
                  ✅ Annulation à tout moment
                </Badge>
                <Badge variant="secondary" className="text-sm px-4 py-2">
                  ✅ Support 24/7
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Premium;