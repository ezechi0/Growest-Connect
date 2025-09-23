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
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
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
          description: "Vérifiez votre email pour confirmer votre compte"
        });
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
    <div className="min-h-screen hero-gradient flex items-center justify-center p-4 relative overflow-hidden">
      {/* Effets de fond animés */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-64 h-64 bg-white/10 rounded-full filter blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-white/5 rounded-full filter blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/3 w-96 h-96 bg-white/5 rounded-full filter blur-3xl animate-float" style={{animationDelay: '4s'}}></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Back to home button */}
        <Button variant="ghost" className="mb-6 text-white/80 hover:text-white hover:bg-white/10 backdrop-blur-sm animate-fade-in" asChild>
          <Link to="/">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour à l'accueil
          </Link>
        </Button>

        {/* Logo/Title moderne */}
        <div className="text-center mb-10 animate-bounce-in">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl animate-float">
            <div className="w-10 h-10 bg-white rounded-lg"></div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">Growest Connect</h1>
          <p className="text-white/80 text-lg">
            Connectez vos projets aux investisseurs
          </p>
        </div>

        <Card className="card-gradient border-0 shadow-2xl backdrop-blur-md bg-white/95 animate-scale-in">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl mb-2">Rejoignez la révolution</CardTitle>
            <CardDescription className="text-lg">
              Créez votre compte ou connectez-vous pour transformer vos idées en réalité
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-secondary/50 h-12">
                <TabsTrigger value="signin" className="text-lg font-medium">Connexion</TabsTrigger>
                <TabsTrigger value="signup" className="text-lg font-medium">Inscription</TabsTrigger>
              </TabsList>
              
              {/* Sign In Tab moderne */}
              <TabsContent value="signin" className="space-y-6 mt-8">
                <div className="space-y-3">
                  <Label htmlFor="signin-email" className="text-base font-medium">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="votre.email@exemple.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="h-12 text-base border-0 bg-secondary/50 focus:bg-white transition-colors"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="signin-password" className="text-base font-medium">Mot de passe</Label>
                  <div className="relative">
                    <Input
                      id="signin-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Votre mot de passe"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      className="h-12 text-base border-0 bg-secondary/50 focus:bg-white transition-colors pr-12"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-primary/10"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <Button 
                  className="w-full h-12 text-lg primary-gradient border-0 shadow-lg hover:scale-105 transition-all" 
                  onClick={handleSignIn}
                  disabled={isLoading}
                >
                  {isLoading ? "Connexion..." : "Se connecter"}
                </Button>
                <div className="text-center">
                  <Button variant="link" className="text-base text-muted-foreground hover:text-primary">
                    Mot de passe oublié ?
                  </Button>
                </div>
              </TabsContent>

              {/* Sign Up Tab moderne */}
              <TabsContent value="signup" className="space-y-5 mt-8">
                <div className="grid grid-cols-1 gap-5">
                  <div className="space-y-3">
                    <Label htmlFor="fullname" className="text-base font-medium">Nom complet *</Label>
                    <Input
                      id="fullname"
                      placeholder="Votre nom complet"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange("fullName", e.target.value)}
                      className="h-12 text-base border-0 bg-secondary/50 focus:bg-white transition-colors"
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <Label htmlFor="signup-email" className="text-base font-medium">Email *</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="votre.email@exemple.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className="h-12 text-base border-0 bg-secondary/50 focus:bg-white transition-colors"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="usertype" className="text-base font-medium">Type d'utilisateur *</Label>
                    <Select value={formData.userType} onValueChange={(value) => handleInputChange("userType", value)}>
                      <SelectTrigger className="h-12 text-base border-0 bg-secondary/50 focus:bg-white">
                        <SelectValue placeholder="Sélectionnez votre profil" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="entrepreneur">🚀 Porteur de projet / Entrepreneur</SelectItem>
                        <SelectItem value="business_angel">👼 Business Angel</SelectItem>
                        <SelectItem value="vc">💼 Capital Risque (VC)</SelectItem>
                        <SelectItem value="institutional">🏛️ Investisseur Institutionnel</SelectItem>
                        <SelectItem value="bank">🏦 Banque</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="company" className="text-base font-medium">Entreprise / Organisation</Label>
                    <Input
                      id="company"
                      placeholder="Nom de votre entreprise (optionnel)"
                      value={formData.company}
                      onChange={(e) => handleInputChange("company", e.target.value)}
                      className="h-12 text-base border-0 bg-secondary/50 focus:bg-white transition-colors"
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <Label htmlFor="signup-password" className="text-base font-medium">Mot de passe *</Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Minimum 8 caractères"
                        value={formData.password}
                        onChange={(e) => handleInputChange("password", e.target.value)}
                        className="h-12 text-base border-0 bg-secondary/50 focus:bg-white transition-colors pr-12"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-primary/10"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="confirm-password" className="text-base font-medium">Confirmer le mot de passe *</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="Confirmez votre mot de passe"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                      className="h-12 text-base border-0 bg-secondary/50 focus:bg-white transition-colors"
                    />
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-4 bg-secondary/30 rounded-lg">
                  <Checkbox 
                    id="terms" 
                    checked={formData.acceptTerms}
                    onCheckedChange={(checked) => handleInputChange("acceptTerms", checked)}
                    className="mt-1"
                  />
                  <Label htmlFor="terms" className="text-sm leading-relaxed">
                    J'accepte les{" "}
                    <Button variant="link" className="p-0 h-auto text-primary font-medium underline">
                      conditions d'utilisation
                    </Button>{" "}
                    et la{" "}
                    <Button variant="link" className="p-0 h-auto text-primary font-medium underline">
                      politique de confidentialité
                    </Button>
                  </Label>
                </div>

                <Button 
                  className="w-full h-12 text-lg primary-gradient border-0 shadow-lg hover:scale-105 transition-all" 
                  onClick={handleSignUp}
                  disabled={isLoading}
                >
                  {isLoading ? "Création..." : "Créer mon compte gratuitement"}
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="text-center mt-8 p-6 bg-white/10 backdrop-blur-md rounded-2xl animate-fade-in" style={{animationDelay: '0.5s'}}>
          <p className="text-white/90 text-base leading-relaxed">
            🎉 En vous inscrivant, vous rejoignez une communauté de{" "}
            <span className="font-bold text-yellow-300">1000+ entrepreneurs</span> et{" "}
            <span className="font-bold text-green-300">investisseurs</span> à travers l'Afrique
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;