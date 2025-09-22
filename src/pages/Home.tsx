import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Target, Users, Zap } from "lucide-react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-foreground mb-6">
            Connectez Vos <span className="text-primary">Projets</span> Aux{" "}
            <span className="text-accent">Investisseurs</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            La plateforme mobile SaaS qui révolutionne le financement participatif en Afrique.
            Présentez vos projets innovants et trouvez les investisseurs qui croient en votre vision.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8" asChild>
              <Link to="/auth">
                Commencer Maintenant <ArrowRight className="ml-2" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8" asChild>
              <Link to="/projects">Découvrir les Projets</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Pourquoi Choisir Invest Connect ?
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Une solution complète pour connecter porteurs de projets et investisseurs
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <Target className="w-12 h-12 text-primary mx-auto mb-4" />
              <CardTitle>Matching Intelligent</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Notre IA connecte automatiquement les projets aux investisseurs selon leurs critères et préférences.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <Users className="w-12 h-12 text-accent mx-auto mb-4" />
              <CardTitle>Réseau Vérifié</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Tous nos utilisateurs sont vérifiés via notre système KYC pour garantir la sécurité des transactions.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <Zap className="w-12 h-12 text-primary mx-auto mb-4" />
              <CardTitle>Plateforme Sécurisée</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Messagerie cryptée, paiements sécurisés et protection complète de vos données.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-primary-foreground mb-4">
            Prêt à Transformer Votre Idée en Réalité ?
          </h2>
          <p className="text-primary-foreground/90 text-lg mb-8 max-w-2xl mx-auto">
            Rejoignez des milliers d'entrepreneurs et d'investisseurs qui utilisent Invest Connect
          </p>
          <Button size="lg" variant="secondary" className="text-lg px-8" asChild>
            <Link to="/auth">
              Créer Mon Compte Gratuit
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Home;