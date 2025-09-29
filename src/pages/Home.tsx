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
              <h1 className="text-6xl md:text-8xl font-bold mb-8 leading-tight">
                🚀 Révolutionne Ton <span className="text-transparent bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 bg-clip-text animate-pulse">Future</span>
                <br />
                avec <span className="text-transparent bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 bg-clip-text animate-pulse">Growest</span>
              </h1>
              <p className="text-xl md:text-2xl text-white/90 mb-12 leading-relaxed max-w-4xl mx-auto font-medium">
                💫 La plateforme ultra-moderne qui connecte les visionnaires aux investisseurs
                <br className="hidden md:block" />
                🌟 Transforme tes rêves en empire, dès maintenant !
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-8 justify-center animate-slide-up" style={{animationDelay: '0.3s'}}>
              <Button size="lg" className="text-xl px-12 py-6 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold hover:scale-110 transition-all duration-300 shadow-2xl hover:shadow-yellow-500/50 neo-card animate-pulse" asChild>
                <Link to="/auth">
                  🎯 Devenir Légendaire <ArrowRight className="ml-2" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-xl px-12 py-6 border-2 border-white/40 text-white hover:bg-white/20 hover:scale-110 transition-all duration-300 backdrop-blur-lg glass-card font-bold" asChild>
                <Link to="/projects">🔍 Explorer l'Écosystème</Link>
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
            Une solution complète pour connecter porteurs de projets et investisseurs de manière sécurisée et efficace
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 relative z-10">
          <Card className="text-center hover-lift neo-card border-0 shadow-2xl animate-scale-in glow-effect" style={{animationDelay: '0.2s'}}>
            <CardHeader className="pb-4">
              <div className="w-20 h-20 primary-gradient rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl animate-float pulse-glow">
                <Target className="w-10 h-10 text-white" />
              </div>
              <CardTitle className="text-2xl mb-4 gradient-text">🎯 Matching IA Ultra-Précis</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base leading-relaxed font-medium">
                Notre IA révolutionnaire connecte automatiquement tes projets aux investisseurs parfaits. 
                Résultats garantis en moins de 24h ! 🚀
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover-lift neo-card border-0 shadow-2xl animate-scale-in glow-effect" style={{animationDelay: '0.4s'}}>
            <CardHeader className="pb-4">
              <div className="w-20 h-20 accent-gradient rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl animate-float pulse-glow">
                <Users className="w-10 h-10 text-white" />
              </div>
              <CardTitle className="text-2xl mb-4 gradient-text">🛡️ Réseau Elite Vérifié</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base leading-relaxed font-medium">
                Rejoins une communauté exclusive d'entrepreneurs et d'investisseurs vérifiés. 
                100% sécurisé, 0% arnaque ! 🔒
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover-lift neo-card border-0 shadow-2xl animate-scale-in glow-effect" style={{animationDelay: '0.6s'}}>
            <CardHeader className="pb-4">
              <div className="w-20 h-20 primary-gradient rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl animate-float pulse-glow">
                <Zap className="w-10 h-10 text-white" />
              </div>
              <CardTitle className="text-2xl mb-4 gradient-text">⚡ Sécurité Niveau NASA</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base leading-relaxed font-medium">
                Cryptage militaire, paiements ultra-sécurisés et protection maximale de tes données. 
                Ta réussite, notre obsession ! 🛡️
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
              <h2 className="text-5xl md:text-6xl font-bold text-white mb-8 leading-tight">
                🔥 Prêt à Devenir la <span className="text-transparent bg-gradient-to-r from-yellow-300 via-pink-400 to-purple-500 bg-clip-text animate-pulse">Légende</span> 
                <br />
                de Demain ? 🌟
              </h2>
              <p className="text-white/90 text-xl mb-12 max-w-3xl mx-auto leading-relaxed font-medium">
                💎 Rejoins + de 10,000 visionnaires qui utilisent Growest Connect pour bâtir l'empire africain de demain !
                <br />
                🚀 Ton succès commence ICI, MAINTENANT !
              </p>
              <div className="space-y-6">
                <Button size="lg" className="text-2xl px-16 py-6 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white font-black hover:scale-110 transition-all duration-300 shadow-2xl hover:shadow-purple-500/50 neo-card animate-bounce" asChild>
                  <Link to="/auth">
                    🎯 REJOINDRE L'ÉLITE GRATUIT
                  </Link>
                </Button>
                <p className="text-white/80 text-lg font-bold">💫 Gratuit à vie • Pas de CB • Résultats garantis 💫</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;