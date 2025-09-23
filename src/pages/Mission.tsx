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
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-8 leading-tight">
              Démocratiser l'Accès au <span className="gradient-text">Financement</span> en Afrique
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              Nous croyons que chaque idée innovante mérite sa chance. Notre mission est de créer un pont 
              magique entre les porteurs de projets visionnaires et les investisseurs qui partagent leur passion pour l'innovation.
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
                <span className="font-semibold text-lg">Innovation et excellence technologique</span>
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

        {/* PIP - Plan d'Implémentation Projet */}
        <div className="mb-20">
          <div className="text-center mb-16 animate-fade-in">
            <Badge className="mb-6 px-6 py-2 text-lg primary-gradient text-white border-0 shadow-lg" variant="secondary">
              Plan d'Implémentation
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Roadmap de Développement <span className="gradient-text">Growest Connect</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Développer et déployer une application mobile SaaS reliant investisseurs et fondateurs
            </p>
          </div>

          <div className="grid gap-6 max-w-6xl mx-auto">
            {/* Phase 1 */}
            <Card className="p-6 hover-lift card-gradient border-0 shadow-xl animate-slide-up" style={{animationDelay: '0.1s'}}>
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 primary-gradient rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold">1</span>
                  </div>
                  <CardTitle className="text-2xl">Phase 1 – Initialisation</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p>• Créer projet technique (ex. Lovable, backend + mobile app)</p>
                <p>• Configurer authentification avec rôles (fondateur/investisseur/admin)</p>
                <p>• Créer bases de données (users, projects, investments, messages, subscriptions)</p>
                <p>• Configurer stockage cloud pour pitch decks et vidéos</p>
              </CardContent>
            </Card>

            {/* Phase 2 */}
            <Card className="p-6 hover-lift card-gradient border-0 shadow-xl animate-slide-up" style={{animationDelay: '0.2s'}}>
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 accent-gradient rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold">2</span>
                  </div>
                  <CardTitle className="text-2xl">Phase 2 – Onboarding</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p>• Développer flux d'inscription avec KYC</p>
                <p>• Créer formulaires profils fondateurs et investisseurs</p>
                <p>• Développer back-office admin pour validation KYC</p>
              </CardContent>
            </Card>

            {/* Phase 3 */}
            <Card className="p-6 hover-lift card-gradient border-0 shadow-xl animate-slide-up" style={{animationDelay: '0.3s'}}>
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 primary-gradient rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold">3</span>
                  </div>
                  <CardTitle className="text-2xl">Phase 3 – Gestion des projets</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p>• Créer module d'ajout/édition projet</p>
                <p>• Implémenter workflow projet (soumis, approuvé, en ligne, financé/clos)</p>
                <p>• Relier projets aux fondateurs et aux investisseurs intéressés</p>
              </CardContent>
            </Card>

            {/* Phase 4 */}
            <Card className="p-6 hover-lift card-gradient border-0 shadow-xl animate-slide-up" style={{animationDelay: '0.4s'}}>
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 accent-gradient rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold">4</span>
                  </div>
                  <CardTitle className="text-2xl">Phase 4 – Expérience investisseur</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p>• Construire catalogue de projets filtrable</p>
                <p>• Créer fiches projet détaillées</p>
                <p>• Bouton d'action "Se connecter" → envoi de demande au fondateur</p>
              </CardContent>
            </Card>

            {/* Phase 5 */}
            <Card className="p-6 hover-lift card-gradient border-0 shadow-xl animate-slide-up" style={{animationDelay: '0.5s'}}>
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 primary-gradient rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold">5</span>
                  </div>
                  <CardTitle className="text-2xl">Phase 5 – Matching & Messagerie</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p>• Implémenter algorithme de matching (IA + filtres manuels)</p>
                <p>• Développer messagerie en temps réel (chat + pièces jointes sécurisées)</p>
                <p>• Ajouter notifications push pour nouveaux matchs et messages</p>
              </CardContent>
            </Card>

            {/* Phase 6 */}
            <Card className="p-6 hover-lift card-gradient border-0 shadow-xl animate-slide-up" style={{animationDelay: '0.6s'}}>
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 accent-gradient rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold">6</span>
                  </div>
                  <CardTitle className="text-2xl">Phase 6 – Transactions (via Paystack)</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p>• Intégrer Paystack pour paiements (cartes, mobile money, devises locales)</p>
                <p>• Mettre en place engagement financier et suivi via table investments</p>
                <p>• Générer reçus automatiques et gérer les payouts aux fondateurs validés</p>
              </CardContent>
            </Card>

            {/* Phase 7 */}
            <Card className="p-6 hover-lift card-gradient border-0 shadow-xl animate-slide-up" style={{animationDelay: '0.7s'}}>
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 primary-gradient rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold">7</span>
                  </div>
                  <CardTitle className="text-2xl">Phase 7 – Dashboards</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p>• Fondateur : suivi projets, progression financement, statistiques</p>
                <p>• Investisseur : suivi portefeuille, engagements, favoris</p>
                <p>• Admin : panel de validation (KYC, projets), gestion litiges, suivi paiements</p>
              </CardContent>
            </Card>

            {/* Phase 8 */}
            <Card className="p-6 hover-lift card-gradient border-0 shadow-xl animate-slide-up" style={{animationDelay: '0.8s'}}>
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 accent-gradient rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold">8</span>
                  </div>
                  <CardTitle className="text-2xl">Phase 8 – Tests & QA</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p>• Tests unitaires et fonctionnels : onboarding, KYC, création projet, matching, chat, paiement</p>
                <p>• Tests d'erreurs : paiement échoué, KYC rejeté, messagerie hors ligne</p>
              </CardContent>
            </Card>

            {/* Phase 9 */}
            <Card className="p-6 hover-lift card-gradient border-0 shadow-xl animate-slide-up" style={{animationDelay: '0.9s'}}>
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 primary-gradient rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold">9</span>
                  </div>
                  <CardTitle className="text-2xl">Phase 9 – Déploiement</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p>• Configurer serveurs et clés Paystack en production</p>
                <p>• Charger base test avec projets et investisseurs fictifs</p>
                <p>• Lancer MVP et monitorer l'usage (matches, paiements, taux de conversion)</p>
              </CardContent>
            </Card>

            {/* Phase 10 */}
            <Card className="p-6 hover-lift card-gradient border-0 shadow-xl animate-slide-up" style={{animationDelay: '1.0s'}}>
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 accent-gradient rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold">10</span>
                  </div>
                  <CardTitle className="text-2xl">Phase 10 – Version Premium</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p>• Intégrer Paystack Subscriptions pour abonnements récurrents</p>
                <p>• Créer plans : Premium Start (Fondateurs), Premium Capital (Investisseurs), Pro+ (Corporate)</p>
                <p>• Mettre en place badges Premium, section comparatif Free vs Premium</p>
                <p>• Gérer statuts d'abonnement (trial, actif, expiré, annulé)</p>
                <p>• Notifications push : confirmation, rappel avant expiration, renouvellement</p>
              </CardContent>
            </Card>
          </div>
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