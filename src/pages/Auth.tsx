import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, ArrowLeft, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    userType: "",
    company: "",
    acceptTerms: false
  });
  
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSignIn = async () => {
    if (!formData.email || !formData.password) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        toast({
          title: "Erreur de connexion",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Connexion réussie",
          description: "Bienvenue sur Growest Connect !"
        });
        navigate("/");
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur inattendue s'est produite",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!formData.email || !formData.password || !formData.fullName || !formData.userType) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas",
        variant: "destructive"
      });
      return;
    }

    if (!formData.acceptTerms) {
      toast({
        title: "Erreur",
        description: "Veuillez accepter les conditions d'utilisation",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth`,
          data: {
            full_name: formData.fullName,
            user_type: formData.userType,
            company: formData.company
          }
        }
      });

      if (error) {
        toast({
          title: "Erreur d'inscription",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Inscription réussie",
          description: "Redirection vers la finalisation de votre profil..."
        });
        // Redirection vers l'onboarding KYC après inscription
        setTimeout(() => {
          navigate('/kyc-onboarding');
        }, 2000);
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur inattendue s'est produite",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Grille de fond moderne */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_110%)]" />
      
      {/* Cercles décoratifs animés */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full filter blur-3xl opacity-50"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent/20 rounded-full filter blur-3xl opacity-50"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Back to home button */}
        <Button variant="ghost" className="mb-6 hover-lift" asChild>
          <Link to="/">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour à l'accueil
          </Link>
        </Button>

        {/* Logo/Title professionnel */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <TrendingUp className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Growest Connect
          </h1>
          <p className="text-muted-foreground text-base">
            Votre passerelle vers le succès entrepreneurial
          </p>
        </div>

        <Card className="border-2 shadow-2xl backdrop-blur-sm bg-card/95 hover:shadow-xl transition-all animate-scale-in">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-3xl mb-2">Bienvenue</CardTitle>
            <CardDescription className="text-base">
              Connectez-vous ou créez votre compte
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 h-11 bg-muted">
                <TabsTrigger value="signin" className="text-base font-medium">Connexion</TabsTrigger>
                <TabsTrigger value="signup" className="text-base font-medium">Inscription</TabsTrigger>
              </TabsList>
              
              {/* Sign In Tab professionnel */}
              <TabsContent value="signin" className="space-y-5 mt-6">
                <div className="space-y-2">
                  <Label htmlFor="signin-email" className="text-sm font-medium">Adresse email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="votre.email@exemple.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password" className="text-sm font-medium">Mot de passe</Label>
                  <div className="relative">
                    <Input
                      id="signin-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      className="h-11 pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9 p-0"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <Button 
                  className="w-full h-11 text-base font-medium shadow-md hover:shadow-lg transition-all" 
                  onClick={handleSignIn}
                  disabled={isLoading}
                >
                  {isLoading ? "Connexion en cours..." : "Se connecter"}
                </Button>
                <div className="text-center">
                  <Button variant="link" className="text-sm text-muted-foreground hover:text-primary p-0 h-auto">
                    Mot de passe oublié ?
                  </Button>
                </div>
              </TabsContent>

              {/* Sign Up Tab professionnel */}
              <TabsContent value="signup" className="space-y-4 mt-6">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullname" className="text-sm font-medium">Nom complet *</Label>
                    <Input
                      id="fullname"
                      placeholder="Jean Dupont"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange("fullName", e.target.value)}
                      className="h-11"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-sm font-medium">Adresse email *</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="jean.dupont@exemple.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="usertype" className="text-sm font-medium">Je suis *</Label>
                    <Select value={formData.userType} onValueChange={(value) => handleInputChange("userType", value)}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Sélectionnez votre profil" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="entrepreneur">Porteur de projet</SelectItem>
                        <SelectItem value="business_angel">Business Angel</SelectItem>
                        <SelectItem value="vc">Capital Risque (VC)</SelectItem>
                        <SelectItem value="institutional">Investisseur Institutionnel</SelectItem>
                        <SelectItem value="bank">Banque</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company" className="text-sm font-medium">Entreprise (optionnel)</Label>
                    <Input
                      id="company"
                      placeholder="Ma Startup"
                      value={formData.company}
                      onChange={(e) => handleInputChange("company", e.target.value)}
                      className="h-11"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-sm font-medium">Mot de passe *</Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Minimum 8 caractères"
                        value={formData.password}
                        onChange={(e) => handleInputChange("password", e.target.value)}
                        className="h-11 pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9 p-0"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password" className="text-sm font-medium">Confirmer *</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="Même mot de passe"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                      className="h-11"
                    />
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 bg-muted/50 rounded-lg border">
                  <Checkbox 
                    id="terms" 
                    checked={formData.acceptTerms}
                    onCheckedChange={(checked) => handleInputChange("acceptTerms", checked)}
                    className="mt-0.5"
                  />
                  <Label htmlFor="terms" className="text-xs leading-relaxed cursor-pointer">
                    J'accepte les{" "}
                    <span className="text-primary font-medium underline">conditions d'utilisation</span>
                    {" "}et la{" "}
                    <span className="text-primary font-medium underline">politique de confidentialité</span>
                  </Label>
                </div>

                <Button 
                  className="w-full h-11 text-base font-medium shadow-md hover:shadow-lg transition-all" 
                  onClick={handleSignUp}
                  disabled={isLoading}
                >
                  {isLoading ? "Création en cours..." : "Créer mon compte"}
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="text-center mt-6 p-4 bg-muted/30 backdrop-blur-sm rounded-xl border animate-fade-in">
          <p className="text-muted-foreground text-sm leading-relaxed">
            Plus de <span className="font-semibold text-primary">10 000 entrepreneurs</span> et investisseurs nous font confiance
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;