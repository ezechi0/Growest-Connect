import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Database, Brain, CreditCard, Github, Palette, Shield } from "lucide-react";

const tools = [
  {
    name: "Supabase",
    description: "Base de données PostgreSQL, authentification et RLS (Row Level Security) pour sécuriser les données utilisateurs",
    icon: Database,
    category: "Backend",
    features: ["Base de données", "Auth", "RLS", "Edge Functions"]
  },
  {
    name: "OpenAI API",
    description: "Intelligence artificielle pour le chatbot d'assistance et le matching intelligent entre investisseurs et projets",
    icon: Brain,
    category: "IA",
    features: ["Chatbot GPT-4o-mini", "Matching IA", "Recommendations"]
  },
  {
    name: "Paystack",
    description: "Plateforme de paiement africaine pour traiter les investissements et abonnements premium",
    icon: CreditCard,
    category: "Paiements",
    features: ["Paiements", "Abonnements", "Webhooks", "Multi-devises"]
  },
  {
    name: "GitHub",
    description: "Contrôle de version et collaboration pour le développement de la plateforme",
    icon: Github,
    category: "DevOps",
    features: ["Versionning", "CI/CD", "Collaboration", "Backup"]
  },
  {
    name: "Figma",
    description: "Design UI/UX et prototypage pour créer une expérience utilisateur optimale",
    icon: Palette,
    category: "Design",
    features: ["UI/UX Design", "Prototypage", "Collaboration Design"]
  },
  {
    name: "Security",
    description: "Sécurité renforcée avec RLS, authentification JWT et chiffrement des données sensibles",
    icon: Shield,
    category: "Sécurité",
    features: ["RLS", "JWT", "Chiffrement", "HTTPS"]
  }
];

const Tools = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/50 to-primary/5">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
            Outils & Technologies
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Growest Connect utilise les meilleures technologies pour offrir une plateforme 
            sécurisée, performante et intelligente
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tools.map((tool, index) => {
            const IconComponent = tool.icon;
            return (
              <Card 
                key={tool.name}
                className="group hover:shadow-xl transition-all duration-300 border-primary/10 hover:border-primary/30 bg-gradient-to-br from-background to-background/50"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-12 w-12 rounded-lg bg-gradient-primary flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    <Badge variant="secondary" className="bg-gradient-subtle">
                      {tool.category}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl mb-2">{tool.name}</CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    {tool.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-primary">Fonctionnalités clés :</h4>
                    <div className="flex flex-wrap gap-2">
                      {tool.features.map((feature) => (
                        <Badge 
                          key={feature} 
                          variant="outline" 
                          className="text-xs border-primary/20 hover:bg-primary/10"
                        >
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-16 text-center">
          <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20 max-w-4xl mx-auto">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-4 text-primary">
                Architecture Moderne & Sécurisée
              </h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Notre stack technologique a été soigneusement sélectionné pour garantir la sécurité, 
                la performance et la scalabilité de Growest Connect. Chaque outil joue un rôle essentiel 
                dans l'écosystème de la plateforme.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary mb-2">99.9%</div>
                  <div className="text-sm text-muted-foreground">Disponibilité</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary mb-2">&lt; 100ms</div>
                  <div className="text-sm text-muted-foreground">Temps de réponse</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary mb-2">100%</div>
                  <div className="text-sm text-muted-foreground">Sécurisé</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Tools;