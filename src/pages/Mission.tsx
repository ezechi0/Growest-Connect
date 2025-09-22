import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Globe, Heart, TrendingUp, Shield, Users, Lightbulb, Target } from "lucide-react";

const Mission = () => {
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className="mb-4" variant="secondary">Notre Mission</Badge>
          <h1 className="text-4xl font-bold text-foreground mb-6">
            Démocratiser l'Accès au <span className="text-primary">Financement</span> en Afrique
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Nous croyons que chaque idée innovante mérite sa chance. Notre mission est de créer un pont 
            entre les porteurs de projets visionnaires et les investisseurs qui partagent leur passion pour l'innovation.
          </p>
        </div>

        {/* Vision Cards */}
        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          <Card className="p-6">
            <CardHeader className="pb-4">
              <Heart className="w-10 h-10 text-accent mb-3" />
              <CardTitle className="text-2xl">Notre Vision</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                Devenir la plateforme de référence pour le financement participatif en Afrique, 
                où innovation et investissement se rencontrent pour créer un avenir prospère.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Nous imaginons un écosystème où chaque entrepreneur africain peut accéder aux ressources 
                nécessaires pour transformer ses idées en entreprises florissantes.
              </p>
            </CardContent>
          </Card>

          <Card className="p-6">
            <CardHeader className="pb-4">
              <Target className="w-10 h-10 text-primary mb-3" />
              <CardTitle className="text-2xl">Nos Valeurs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <Shield className="w-5 h-5 text-accent" />
                <span className="font-medium">Transparence et sécurité</span>
              </div>
              <div className="flex items-center space-x-3">
                <Users className="w-5 h-5 text-accent" />
                <span className="font-medium">Inclusivité et accessibilité</span>
              </div>
              <div className="flex items-center space-x-3">
                <Lightbulb className="w-5 h-5 text-accent" />
                <span className="font-medium">Innovation et excellence</span>
              </div>
              <div className="flex items-center space-x-3">
                <Globe className="w-5 h-5 text-accent" />
                <span className="font-medium">Impact social positif</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Impact Section */}
        <div className="bg-secondary rounded-lg p-8 mb-16">
          <div className="text-center mb-8">
            <TrendingUp className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-foreground mb-4">Notre Impact</h2>
            <p className="text-muted-foreground text-lg">
              Ensemble, nous construisons l'avenir de l'entrepreneuriat africain
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary mb-2">500+</div>
              <div className="text-muted-foreground">Projets Financés</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-accent mb-2">€2.5M</div>
              <div className="text-muted-foreground">Fonds Levés</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">1000+</div>
              <div className="text-muted-foreground">Investisseurs Actifs</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-accent mb-2">15</div>
              <div className="text-muted-foreground">Pays Couverts</div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Rejoignez Notre Mouvement
          </h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
            Que vous soyez porteur de projet ou investisseur, vous avez un rôle à jouer dans cette révolution entrepreneuriale
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
              <div className="text-center">
                <Lightbulb className="w-8 h-8 text-primary mx-auto mb-2" />
                <h3 className="font-semibold mb-1">Porteur de Projet</h3>
                <p className="text-sm text-muted-foreground">Présentez votre innovation</p>
              </div>
            </Card>
            <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
              <div className="text-center">
                <TrendingUp className="w-8 h-8 text-accent mx-auto mb-2" />
                <h3 className="font-semibold mb-1">Investisseur</h3>
                <p className="text-sm text-muted-foreground">Découvrez les talents de demain</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Mission;