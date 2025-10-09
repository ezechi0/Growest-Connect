import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Target, Shield, Zap, CheckCircle2, TrendingUp, Globe, Lock } from "lucide-react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section spectaculaire */}
      <section className="relative bg-gradient-to-b from-primary/10 via-accent/5 to-background overflow-hidden">
        {/* Grille moderne animée */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--primary)/0.05)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--primary)/0.05)_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,#000_60%,transparent_120%)]" />
        
        {/* Effets lumineux organiques */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-primary/20 to-accent/10 rounded-full filter blur-3xl opacity-70 animate-pulse" style={{ animationDuration: '8s' }}></div>
          <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-gradient-to-tl from-accent/20 to-primary/10 rounded-full filter blur-3xl opacity-70 animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }}></div>
        </div>
        
        {/* Bannière Beta */}
        <div className="bg-gradient-to-r from-primary to-accent py-2 relative">
          <div className="container mx-auto px-4 text-center">
            <p className="text-white text-sm font-medium">
              🎉 Version Beta • Aidez-nous à améliorer la plateforme avec vos retours
            </p>
          </div>
        </div>
        
        <div className="container mx-auto px-4 py-24 md:py-32 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge de confiance animé */}
            <div className="inline-flex items-center gap-2 mb-8 px-5 py-3 bg-gradient-to-r from-primary/10 to-accent/10 border-2 border-primary/20 rounded-full backdrop-blur-sm shadow-lg hover:shadow-xl transition-all group">
              <div className="relative">
                <CheckCircle2 className="w-5 h-5 text-primary animate-pulse" />
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-md group-hover:blur-lg transition-all"></div>
              </div>
              <span className="text-sm font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Plateforme certifiée et sécurisée
              </span>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-black mb-8 tracking-tighter leading-none">
              <span className="block bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent animate-fade-in">
                Investissez dans
              </span>
              <span className="block bg-gradient-to-r from-accent via-primary to-primary bg-clip-text text-transparent animate-fade-in" style={{ animationDelay: '0.2s' }}>
                la croissance
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-10 leading-relaxed max-w-3xl mx-auto font-light">
              Growest Connect est la plateforme de référence qui met en relation entrepreneurs et investisseurs 
              de manière sécurisée, transparente et efficace.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
              <Button 
                size="lg" 
                className="relative text-lg px-10 h-16 shadow-2xl hover:shadow-[0_0_40px_rgba(59,130,246,0.4)] transition-all group overflow-hidden" 
                asChild
              >
                <Link to="/auth" className="relative z-10">
                  <span className="relative z-10">Commencer gratuitement</span>
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform relative z-10" />
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-light to-primary opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg px-10 h-16 border-2 border-primary/30 hover:border-primary/60 hover:bg-primary/5 transition-all shadow-lg" 
                asChild
              >
                <Link to="/projects">Explorer les projets</Link>
              </Button>
            </div>
            
            {/* Stats de confiance améliorées */}
            <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto pt-12 border-t-2 border-primary/10">
              <div className="group hover:scale-110 transition-transform duration-300">
                <div className="text-4xl md:text-5xl font-black bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent mb-2 animate-fade-in">10K+</div>
                <div className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">Utilisateurs actifs</div>
              </div>
              <div className="group hover:scale-110 transition-transform duration-300" style={{ animationDelay: '0.1s' }}>
                <div className="text-4xl md:text-5xl font-black bg-gradient-to-br from-accent to-primary bg-clip-text text-transparent mb-2 animate-fade-in">500+</div>
                <div className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">Projets financés</div>
              </div>
              <div className="group hover:scale-110 transition-transform duration-300" style={{ animationDelay: '0.2s' }}>
                <div className="text-4xl md:text-5xl font-black bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent mb-2 animate-fade-in">€2M+</div>
                <div className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">Investis</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section professionnelle */}
      <section className="container mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Une plateforme pensée pour votre réussite
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Des fonctionnalités avancées pour faciliter vos échanges et sécuriser vos investissements
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 border-2 border-primary/20 hover:border-primary/40 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <CardHeader className="relative z-10">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
                <div className="relative w-16 h-16 bg-gradient-to-br from-primary to-primary-light rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                  <Target className="w-8 h-8 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl mb-3 group-hover:text-primary transition-colors">Matching intelligent</CardTitle>
              <CardDescription className="text-base leading-relaxed">
                Notre algorithme de matching met en relation les projets et investisseurs selon leurs critères, secteurs d'activité et objectifs.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 border-2 border-accent/20 hover:border-accent/40 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <CardHeader className="relative z-10">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-accent/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
                <div className="relative w-16 h-16 bg-gradient-to-br from-accent to-accent-light rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                  <Shield className="w-8 h-8 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl mb-3 group-hover:text-accent transition-colors">Vérification rigoureuse</CardTitle>
              <CardDescription className="text-base leading-relaxed">
                Tous les utilisateurs sont vérifiés via notre processus KYC. Investissez et levez des fonds en toute confiance.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 border-2 border-primary/20 hover:border-primary/40 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <CardHeader className="relative z-10">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
                <div className="relative w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                  <Lock className="w-8 h-8 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl mb-3 group-hover:text-primary transition-colors">Paiements sécurisés</CardTitle>
              <CardDescription className="text-base leading-relaxed">
                Intégration Paystack avec cryptage SSL. Vos transactions sont protégées et conformes aux normes internationales.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Section sécurité et confiance */}
      <section className="container mx-auto px-4 py-24">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Votre sécurité, notre priorité
            </h2>
            <p className="text-muted-foreground text-lg">
              Des standards de sécurité de niveau bancaire
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex gap-4 p-6 rounded-xl border-2 bg-card hover:shadow-lg transition-shadow">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Lock className="w-6 h-6 text-primary" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Cryptage SSL/TLS</h3>
                <p className="text-muted-foreground">Toutes vos données sont chiffrées de bout en bout avec les derniers standards de sécurité.</p>
              </div>
            </div>

            <div className="flex gap-4 p-6 rounded-xl border-2 bg-card hover:shadow-lg transition-shadow">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-accent" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Vérification KYC</h3>
                <p className="text-muted-foreground">Processus de vérification d'identité rigoureux pour garantir l'authenticité de tous les profils.</p>
              </div>
            </div>

            <div className="flex gap-4 p-6 rounded-xl border-2 bg-card hover:shadow-lg transition-shadow">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Conformité RGPD</h3>
                <p className="text-muted-foreground">Respect total de vos données personnelles selon les normes européennes les plus strictes.</p>
              </div>
            </div>

            <div className="flex gap-4 p-6 rounded-xl border-2 bg-card hover:shadow-lg transition-shadow">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Globe className="w-6 h-6 text-accent" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Paiements Paystack</h3>
                <p className="text-muted-foreground">Infrastructure de paiement certifiée PCI-DSS pour des transactions 100% sécurisées.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section spectaculaire */}
      <section className="relative bg-gradient-to-br from-primary via-primary to-accent overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#fff2_1px,transparent_1px),linear-gradient(to_bottom,#fff2_1px,transparent_1px)] bg-[size:3rem_3rem]" />
        
        {/* Effets lumineux */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 rounded-full filter blur-3xl animate-pulse" style={{ animationDuration: '4s' }}></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/20 rounded-full filter blur-3xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '1s' }}></div>
        </div>
        
        <div className="container mx-auto px-4 py-24 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Prêt à transformer votre vision en réalité ?
            </h2>
            <p className="text-white/90 text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
              Rejoignez des milliers d'entrepreneurs et investisseurs qui utilisent Growest Connect 
              pour créer des partenariats durables.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-10 h-14 bg-white text-primary hover:bg-white/90 shadow-xl" asChild>
                <Link to="/auth">
                  Créer un compte gratuit
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-10 h-14 border-2 border-white text-white hover:bg-white/10" asChild>
                <Link to="/mission">En savoir plus</Link>
              </Button>
            </div>
            <p className="text-white/70 text-sm mt-8">
              Aucune carte bancaire requise • Accès gratuit • Configuration en 2 minutes
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;