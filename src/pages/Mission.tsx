import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Globe, Heart, TrendingUp, Shield, Users, Lightbulb, Target } from "lucide-react";

const Mission = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-primary/5 to-background">
      <div className="container mx-auto px-4 py-16">
        {/* Header professionnel */}
        <div className="text-center mb-20">
          <Badge variant="secondary" className="mb-6 px-4 py-1.5">Notre Mission</Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
            Transformer l'<span className="gradient-text">écosystème entrepreneurial</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Nous mettons en relation entrepreneurs visionnaires et investisseurs engagés 
            pour créer un avenir économique prospère et durable.
          </p>
        </div>

        {/* Vision Cards professionnelles */}
        <div className="grid lg:grid-cols-2 gap-8 mb-20">
          <Card className="p-8 hover-lift border-2 shadow-lg transition-all">
            <CardHeader className="pb-4">
              <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center mb-4">
                <Heart className="w-7 h-7 text-accent" />
              </div>
              <CardTitle className="text-2xl mb-3">Notre Vision</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                Devenir la plateforme de référence pour le financement entrepreneurial, 
                où innovation et investissement se rencontrent pour créer un avenir prospère et durable.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Un écosystème où chaque entrepreneur peut accéder aux ressources 
                nécessaires pour transformer ses idées en entreprises qui changent le monde.
              </p>
            </CardContent>
          </Card>

          <Card className="p-8 hover-lift border-2 shadow-lg transition-all">
            <CardHeader className="pb-4">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                <Target className="w-7 h-7 text-primary" />
              </div>
              <CardTitle className="text-2xl mb-3">Nos Valeurs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <span className="font-medium">Transparence et sécurité</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-accent to-primary rounded-xl flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <span className="font-medium">Inclusivité et accessibilité</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center flex-shrink-0">
                  <Lightbulb className="w-5 h-5 text-white" />
                </div>
                <span className="font-medium">Innovation et excellence</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-accent to-primary rounded-xl flex items-center justify-center flex-shrink-0">
                  <Globe className="w-5 h-5 text-white" />
                </div>
                <span className="font-medium">Impact social durable</span>
              </div>
            </CardContent>
          </Card>
        </div>


        {/* Call to Action professionnel */}
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Rejoignez notre <span className="gradient-text">écosystème</span>
          </h2>
          <p className="text-muted-foreground text-lg mb-10 max-w-2xl mx-auto">
            Que vous soyez porteur de projet ou investisseur, participez à la transformation entrepreneuriale
          </p>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <Card className="p-8 hover-lift border-2 shadow-lg transition-all group cursor-pointer">
              <div className="text-center">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                  <Lightbulb className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Porteur de Projet</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Présentez votre projet et trouvez les investisseurs qui croient en votre vision
                </p>
              </div>
            </Card>
            
            <Card className="p-8 hover-lift border-2 shadow-lg transition-all group cursor-pointer">
              <div className="text-center">
                <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-accent/20 transition-colors">
                  <TrendingUp className="w-7 h-7 text-accent" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Investisseur</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Découvrez des opportunités d'investissement prometteuses et accompagnez les entrepreneurs
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Mission;