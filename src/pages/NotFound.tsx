import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Home, Search, Zap } from "lucide-react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="min-h-screen hero-gradient flex items-center justify-center p-4 relative overflow-hidden">
      {/* Effets de fond animés */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-64 h-64 bg-white/10 rounded-full filter blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-white/5 rounded-full filter blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/3 w-96 h-96 bg-white/5 rounded-full filter blur-3xl animate-float" style={{animationDelay: '4s'}}></div>
      </div>

      <div className="w-full max-w-2xl relative z-10">
        <Card className="neo-card border-0 shadow-2xl backdrop-blur-xl bg-white/95 animate-scale-in text-center">
          <CardHeader className="pb-6">
            <div className="w-24 h-24 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <Zap className="w-12 h-12 text-white" />
            </div>
            <CardTitle className="text-6xl font-bold gradient-text mb-4">404</CardTitle>
            <CardDescription className="text-2xl font-semibold text-foreground">
              🚀 Oops ! Cette page s'est envolée vers l'espace !
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-8">
            <p className="text-lg text-muted-foreground leading-relaxed">
              Il semblerait que cette page ait été aspirée par un trou noir technologique. 
              <br />
              Mais ne t'inquiète pas, on va te ramener à la base ! 🛸
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-8 py-4 primary-gradient hover:scale-105 transition-all duration-300 shadow-lg" asChild>
                <Link to="/">
                  <Home className="w-5 h-5 mr-2" />
                  🏠 Retour à l'Accueil
                </Link>
              </Button>
              
              <Button size="lg" variant="outline" className="text-lg px-8 py-4 hover:scale-105 transition-all duration-300" asChild>
                <Link to="/projects">
                  <Search className="w-5 h-5 mr-2" />
                  🔍 Explorer les Projets
                </Link>
              </Button>
            </div>
            
            <div className="pt-6 border-t">
              <p className="text-sm text-muted-foreground mb-4">
                💡 Suggestions pour continuer ton aventure :
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <Link to="/dashboard" className="flex items-center p-3 rounded-lg hover:bg-secondary/50 transition-colors">
                  📊 Tableau de bord
                </Link>
                <Link to="/premium" className="flex items-center p-3 rounded-lg hover:bg-secondary/50 transition-colors">
                  👑 Découvrir Premium
                </Link>
                <Link to="/profile" className="flex items-center p-3 rounded-lg hover:bg-secondary/50 transition-colors">
                  👤 Mon Profil
                </Link>
                <Link to="/auth" className="flex items-center p-3 rounded-lg hover:bg-secondary/50 transition-colors">
                  🚪 Connexion
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="text-center mt-8 p-6 bg-white/10 backdrop-blur-md rounded-2xl animate-fade-in" style={{animationDelay: '0.5s'}}>
          <p className="text-white/90 text-base leading-relaxed">
            🎉 Besoin d'aide ? Rejoins notre{" "}
            <span className="font-bold text-yellow-300">Discord communautaire</span> pour obtenir du support instantané !
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;