import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Home, Search, Zap } from "lucide-react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Grille de fond moderne */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_110%)]" />
      
      {/* Cercles décoratifs */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-primary/10 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-accent/10 rounded-full filter blur-3xl"></div>
      </div>

      <div className="w-full max-w-2xl relative z-10">
        <Card className="border-2 shadow-2xl backdrop-blur-sm bg-card/95 animate-scale-in text-center">
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
              <Button size="lg" className="text-lg px-8 py-4 shadow-lg hover:shadow-xl transition-all" asChild>
                <Link to="/">
                  <Home className="w-5 h-5 mr-2" />
                  Retour à l'Accueil
                </Link>
              </Button>
              
              <Button size="lg" variant="outline" className="text-lg px-8 py-4 border-2 hover:shadow-lg transition-all" asChild>
                <Link to="/projects">
                  <Search className="w-5 h-5 mr-2" />
                  Explorer les Projets
                </Link>
              </Button>
            </div>
            
            <div className="pt-6 border-t">
              <p className="text-sm text-muted-foreground mb-4">
                Suggestions pour continuer :
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <Link to="/dashboard" className="flex items-center p-3 rounded-lg hover:bg-secondary transition-colors">
                  <span className="mr-2">📊</span> Tableau de bord
                </Link>
                <Link to="/mission" className="flex items-center p-3 rounded-lg hover:bg-secondary transition-colors">
                  <span className="mr-2">ℹ️</span> Notre Mission
                </Link>
                <Link to="/profile" className="flex items-center p-3 rounded-lg hover:bg-secondary transition-colors">
                  <span className="mr-2">👤</span> Mon Profil
                </Link>
                <Link to="/auth" className="flex items-center p-3 rounded-lg hover:bg-secondary transition-colors">
                  <span className="mr-2">🔐</span> Connexion
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="text-center mt-6 p-4 bg-muted/30 rounded-xl border animate-fade-in">
          <p className="text-muted-foreground text-sm leading-relaxed">
            Besoin d'aide ? Notre équipe est là pour vous accompagner
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;