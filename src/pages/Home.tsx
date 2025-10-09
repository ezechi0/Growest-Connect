import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Target, Shield, Zap, CheckCircle2, TrendingUp, Globe, Lock } from "lucide-react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section professionnel */}
      <section className="relative bg-gradient-to-b from-primary/5 via-background to-background overflow-hidden">
        {/* Effet de grille subtil */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
        
        <div className="container mx-auto px-4 py-24 md:py-32 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge de confiance */}
            <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm font-medium">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Plateforme sécurisée et vérifiée
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
              Connectez vos projets aux meilleurs investisseurs
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-10 leading-relaxed max-w-3xl mx-auto font-light">
              Growest Connect est la plateforme de référence qui met en relation entrepreneurs et investisseurs 
              de manière sécurisée, transparente et efficace.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button size="lg" className="text-lg px-8 h-14 shadow-lg hover:shadow-xl transition-all" asChild>
                <Link to="/auth">
                  Commencer gratuitement
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 h-14 border-2" asChild>
                <Link to="/projects">Explorer les projets</Link>
              </Button>
            </div>
            
            {/* Stats de confiance */}
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto pt-8 border-t">
              <div>
                <div className="text-3xl font-bold text-primary mb-1">10K+</div>
                <div className="text-sm text-muted-foreground">Utilisateurs actifs</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary mb-1">500+</div>
                <div className="text-sm text-muted-foreground">Projets financés</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary mb-1">€2M+</div>
                <div className="text-sm text-muted-foreground">Investis</div>
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
          <Card className="group hover:shadow-xl transition-all duration-300 border-2">
            <CardHeader>
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <Target className="w-7 h-7 text-primary" />
              </div>
              <CardTitle className="text-2xl mb-3">Matching intelligent</CardTitle>
              <CardDescription className="text-base leading-relaxed">
                Notre algorithme de matching met en relation les projets et investisseurs selon leurs critères, secteurs d'activité et objectifs.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 border-2">
            <CardHeader>
              <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                <Shield className="w-7 h-7 text-accent" />
              </div>
              <CardTitle className="text-2xl mb-3">Vérification rigoureuse</CardTitle>
              <CardDescription className="text-base leading-relaxed">
                Tous les utilisateurs sont vérifiés via notre processus KYC. Investissez et levez des fonds en toute confiance.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 border-2">
            <CardHeader>
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <Lock className="w-7 h-7 text-primary" />
              </div>
              <CardTitle className="text-2xl mb-3">Paiements sécurisés</CardTitle>
              <CardDescription className="text-base leading-relaxed">
                Intégration Paystack avec cryptage SSL. Vos transactions sont protégées et conformes aux normes internationales.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Section témoignages de confiance */}
      <section className="bg-muted/30 py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Ils nous font confiance
            </h2>
            <p className="text-muted-foreground text-lg">
              Des entrepreneurs et investisseurs du monde entier
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="border-2">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-xl">
                    A
                  </div>
                  <div>
                    <div className="font-semibold">Amadou Diallo</div>
                    <div className="text-sm text-muted-foreground">Entrepreneur, Sénégal</div>
                  </div>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  "Growest Connect m'a permis de lever 150K€ en seulement 2 mois. La plateforme est professionnelle et les investisseurs sont sérieux."
                </p>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center text-white font-bold text-xl">
                    S
                  </div>
                  <div>
                    <div className="font-semibold">Sophie Martin</div>
                    <div className="text-sm text-muted-foreground">Investisseuse, France</div>
                  </div>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  "Une plateforme fiable avec des projets vérifiés. J'ai investi dans 5 startups prometteuses grâce à leur système de matching."
                </p>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-xl">
                    K
                  </div>
                  <div>
                    <div className="font-semibold">Kofi Mensah</div>
                    <div className="text-sm text-muted-foreground">Entrepreneur, Ghana</div>
                  </div>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  "Interface intuitive, processus transparent. Growest Connect facilite vraiment la mise en relation avec les bons investisseurs."
                </p>
              </CardContent>
            </Card>
          </div>
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

      {/* CTA Section professionnelle */}
      <section className="relative bg-gradient-to-br from-primary via-primary to-accent overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#fff1_1px,transparent_1px),linear-gradient(to_bottom,#fff1_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        
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