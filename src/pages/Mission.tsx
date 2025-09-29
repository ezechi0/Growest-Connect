import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Globe, Heart, TrendingUp, Shield, Users, Lightbulb, Target } from "lucide-react";

const Mission = () => {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <div className="container mx-auto px-4 py-12">
        {/* Header avec animations */}
        <div className="text-center mb-20 relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-96 h-96 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full filter blur-3xl animate-pulse-glow"></div>
          </div>
          
          <div className="relative z-10 animate-fade-in">
            <Badge className="mb-6 px-6 py-2 text-lg primary-gradient text-white border-0 shadow-lg" variant="secondary">Notre Mission</Badge>
            <h1 className="text-6xl md:text-7xl font-bold mb-8 leading-tight">
              🌍 Révolutionner l'<span className="gradient-text animate-pulse">Écosystème</span> 
              <br />
              Entrepreneurial Africain 🚀
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed font-medium">
              💫 Nous connectons les visionnaires aux capitaux pour créer la prochaine génération d'unicornes africaines !
              <br />
              🔥 Ensemble, transformons chaque rêve en empire économique !
            </p>
          </div>
        </div>

        {/* Vision Cards avec animations */}
        <div className="grid lg:grid-cols-2 gap-10 mb-20">
          <Card className="p-8 hover-lift card-gradient border-0 shadow-2xl animate-slide-up" style={{animationDelay: '0.2s'}}>
            <CardHeader className="pb-6">
              <div className="w-16 h-16 accent-gradient rounded-2xl flex items-center justify-center mb-6 shadow-lg animate-float">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-3xl mb-4">Notre Vision</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground leading-relaxed text-lg">
                Devenir la plateforme de référence pour le financement participatif en Afrique, 
                où innovation et investissement se rencontrent pour créer un avenir prospère et durable.
              </p>
              <p className="text-muted-foreground leading-relaxed text-lg">
                Nous imaginons un écosystème où chaque entrepreneur africain peut accéder aux ressources 
                nécessaires pour transformer ses rêves en entreprises qui changent le monde.
              </p>
            </CardContent>
          </Card>

          <Card className="p-8 hover-lift card-gradient border-0 shadow-2xl animate-slide-up" style={{animationDelay: '0.4s'}}>
            <CardHeader className="pb-6">
              <div className="w-16 h-16 primary-gradient rounded-2xl flex items-center justify-center mb-6 shadow-lg animate-float" style={{animationDelay: '1s'}}>
                <Target className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-3xl mb-4">Nos Valeurs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-4 group">
                <div className="w-10 h-10 bg-gradient-to-r from-accent to-primary rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <span className="font-semibold text-lg">Transparence et sécurité maximale</span>
              </div>
              <div className="flex items-center space-x-4 group">
                <div className="w-10 h-10 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <span className="font-semibold text-lg">Inclusivité et accessibilité pour tous</span>
              </div>
              <div className="flex items-center space-x-4 group">
                <div className="w-10 h-10 bg-gradient-to-r from-accent to-primary rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Lightbulb className="w-5 h-5 text-white" />
                </div>
                <span className="font-semibold text-lg">Innovation et excellence dans nos services</span>
              </div>
              <div className="flex items-center space-x-4 group">
                <div className="w-10 h-10 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Globe className="w-5 h-5 text-white" />
                </div>
                <span className="font-semibold text-lg">Impact social positif et durable</span>
              </div>
            </CardContent>
          </Card>
        </div>


        {/* Call to Action moderne */}
        <div className="text-center relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-80 h-80 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full filter blur-3xl"></div>
          </div>
          
          <div className="relative z-10 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
              Rejoignez Notre <span className="gradient-text">Révolution</span>
            </h2>
            <p className="text-muted-foreground text-xl mb-12 max-w-3xl mx-auto leading-relaxed">
              Que vous soyez porteur de projet ou investisseur, vous avez un rôle crucial à jouer dans cette transformation entrepreneuriale
            </p>
            
            <div className="flex flex-col md:flex-row gap-8 justify-center max-w-2xl mx-auto">
              <Card className="p-8 hover-lift card-gradient border-0 shadow-xl cursor-pointer group animate-slide-up" style={{animationDelay: '0.2s'}}>
                <div className="text-center">
                  <div className="w-16 h-16 primary-gradient rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform">
                    <Lightbulb className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-bold text-xl mb-3">Porteur de Projet</h3>
                  <p className="text-muted-foreground leading-relaxed">Présentez votre innovation au monde et trouvez les investisseurs parfaits</p>
                </div>
              </Card>
              
              <Card className="p-8 hover-lift card-gradient border-0 shadow-xl cursor-pointer group animate-slide-up" style={{animationDelay: '0.4s'}}>
                <div className="text-center">
                  <div className="w-16 h-16 accent-gradient rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform">
                    <TrendingUp className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-bold text-xl mb-3">Investisseur</h3>
                  <p className="text-muted-foreground leading-relaxed">Découvrez les talents de demain et investissez dans l'avenir de l'Afrique</p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Mission;