import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Target, Users, Zap } from "lucide-react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Hero Section avec gradient moderne */}
      <section className="relative hero-gradient">
        {/* Effet de particules en arrière-plan */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full mix-blend-multiply filter blur-xl animate-float"></div>
          <div className="absolute top-40 right-10 w-96 h-96 bg-accent/20 rounded-full mix-blend-multiply filter blur-xl animate-float" style={{animationDelay: '2s'}}></div>
          <div className="absolute -bottom-32 left-1/2 w-80 h-80 bg-primary/10 rounded-full mix-blend-multiply filter blur-xl animate-float" style={{animationDelay: '4s'}}></div>
        </div>
        
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="max-w-5xl mx-auto text-center text-white">
            <div className="animate-fade-in">
              <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
                Connectez Vos <span className="text-transparent bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text">Projets</span> Aux{" "}
                <span className="text-transparent bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text">Investisseurs</span>
              </h1>
              <p className="text-xl md:text-2xl text-white/90 mb-10 leading-relaxed max-w-4xl mx-auto">
                La plateforme mobile SaaS qui révolutionne le financement participatif en Afrique.
                <br className="hidden md:block" />
                Présentez vos projets innovants et trouvez les investisseurs qui croient en votre vision.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center animate-slide-up" style={{animationDelay: '0.3s'}}>
              <Button size="lg" className="text-lg px-10 py-4 bg-white text-primary hover:bg-gray-100 hover:scale-105 transition-all shadow-2xl hover-lift" asChild>
                <Link to="/auth">
                  Commencer Maintenant <ArrowRight className="ml-2" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-10 py-4 border-white/30 text-white hover:bg-white/10 hover:scale-105 transition-all backdrop-blur-sm" asChild>
                <Link to="/projects">Découvrir les Projets</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Vague décorative */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 320" className="w-full h-auto">
            <path fill="#ffffff" fillOpacity="1" d="M0,160L48,176C96,192,192,224,288,213.3C384,203,480,149,576,149.3C672,149,768,203,864,208C960,213,1056,171,1152,165.3C1248,160,1344,192,1392,208L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
      </section>

      {/* Features Section améliorée */}
      <section className="container mx-auto px-4 py-20 relative">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Pourquoi Choisir <span className="gradient-text">Growest Connect</span> ?
          </h2>
          <p className="text-muted-foreground text-xl max-w-3xl mx-auto leading-relaxed">
            Une solution complète pour connecter porteurs de projets et investisseurs avec des technologies de pointe
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 relative z-10">
          <Card className="text-center hover-lift card-gradient border-0 shadow-xl animate-scale-in" style={{animationDelay: '0.2s'}}>
            <CardHeader className="pb-4">
              <div className="w-16 h-16 primary-gradient rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Target className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl mb-4">Matching Intelligent</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base leading-relaxed">
                Notre IA connecte automatiquement les projets aux investisseurs selon leurs critères et préférences, maximisant les chances de succès.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover-lift card-gradient border-0 shadow-xl animate-scale-in" style={{animationDelay: '0.4s'}}>
            <CardHeader className="pb-4">
              <div className="w-16 h-16 accent-gradient rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Users className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl mb-4">Réseau Vérifié</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base leading-relaxed">
                Tous nos utilisateurs sont vérifiés via notre système KYC avancé pour garantir la sécurité et la crédibilité des transactions.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover-lift card-gradient border-0 shadow-xl animate-scale-in" style={{animationDelay: '0.6s'}}>
            <CardHeader className="pb-4">
              <div className="w-16 h-16 primary-gradient rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl mb-4">Plateforme Sécurisée</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base leading-relaxed">
                Messagerie cryptée, paiements sécurisés et protection complète de vos données avec les dernières technologies blockchain.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Cercles décoratifs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-accent/10 to-primary/10 rounded-full filter blur-3xl"></div>
      </section>

      {/* CTA Section moderne */}
      <section className="relative overflow-hidden">
        <div className="hero-gradient py-20">
          {/* Effets de fond animés */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-1/4 w-64 h-64 bg-white rounded-full filter blur-3xl animate-pulse-glow"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white/50 rounded-full filter blur-3xl animate-float"></div>
          </div>
          
          <div className="container mx-auto px-4 text-center relative z-10">
            <div className="max-w-4xl mx-auto animate-bounce-in">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                Prêt à Transformer Votre <span className="text-yellow-300">Idée</span> en <span className="text-green-300">Réalité</span> ?
              </h2>
              <p className="text-white/90 text-xl mb-10 max-w-3xl mx-auto leading-relaxed">
                Rejoignez des milliers d'entrepreneurs et d'investisseurs qui utilisent Growest Connect pour créer l'avenir de l'Afrique
              </p>
              <div className="space-y-4">
                <Button size="lg" className="text-xl px-12 py-4 bg-white text-primary hover:bg-gray-100 hover:scale-105 transition-all shadow-2xl hover-lift" asChild>
                  <Link to="/auth">
                    Créer Mon Compte Gratuit
                  </Link>
                </Button>
                <p className="text-white/70 text-sm">Gratuit pour toujours • Pas de carte de crédit requise</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;