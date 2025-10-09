import { useState, useEffect } from "react";
import { useUserRole } from "@/hooks/useUserRole";
import { KycStatus } from "@/components/KycStatus";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Mail, 
  MapPin, 
  Phone, 
  Briefcase, 
  TrendingUp, 
  Heart,
  Settings,
  Edit,
  Camera,
  Star
} from "lucide-react";

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const { user, profile, loading, updateProfile } = useUserRole();
  const navigate = useNavigate();
  
  // Données utilisateur d'exemple - remplacé par les vraies données
  const [userProfile, setUserProfile] = useState({
    name: "Amina Diallo",
    email: "amina.diallo@email.com",
    phone: "+221 77 123 45 67",
    location: "Dakar, Sénégal",
    userType: "Porteur de projet",
    company: "AgriTech Solutions",
    bio: "Entrepreneure passionnée par l'innovation agricole en Afrique. Je développe des solutions technologiques pour améliorer la productivité des agriculteurs locaux.",
    website: "www.agritech-solutions.sn",
    experience: "5 ans d'expérience"
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
    if (profile) {
      setUserProfile({
        name: profile.full_name,
        email: user?.email || '',
        phone: profile.phone || '+221 77 123 45 67',
        location: profile.location || 'Dakar, Sénégal',
        userType: profile.user_type === 'entrepreneur' ? 'Porteur de projet' : 'Investisseur',
        company: profile.company || '',
        bio: profile.bio || '',
        website: profile.website || '',
        experience: '5 ans d\'expérience'
      });
    }
  }, [user, profile, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const myProjects = [
    {
      id: 1,
      title: "AgriTech Solutions",
      status: "En cours de financement",
      progress: 30,
      raised: 45000,
      goal: 150000,
      investors: 23
    }
  ];

  const favoriteProjects = [
    {
      id: 2,
      title: "EduConnect",
      sector: "Éducation",
      progress: 77,
      location: "Abidjan, CI"
    },
    {
      id: 3,
      title: "HealthCare Mobile", 
      sector: "Santé",
      progress: 9,
      location: "Bamako, Mali"
    }
  ];

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="relative">
                <Avatar className="w-24 h-24">
                  <AvatarImage src="" />
                  <AvatarFallback className="text-2xl">
                    {userProfile.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <Button 
                  size="sm" 
                  variant="secondary"
                  className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
                >
                  <Camera className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-bold text-foreground">{userProfile.name}</h1>
                    <Badge variant="secondary" className="mt-2">
                      {userProfile.userType}
                    </Badge>
                    {userProfile.company && (
                      <p className="text-muted-foreground mt-1 flex items-center">
                        <Briefcase className="w-4 h-4 mr-2" />
                        {userProfile.company}
                      </p>
                    )}
                  </div>
                  <Button 
                    variant={isEditing ? "default" : "outline"}
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    {isEditing ? "Sauvegarder" : "Modifier"}
                  </Button>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4 mt-4 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 mr-2" />
                    {userProfile.email}
                  </div>
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 mr-2" />
                    {userProfile.phone}
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    {userProfile.location}
                  </div>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 mr-2" />
                    {userProfile.experience}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* KYC Status */}
        <KycStatus />

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Aperçu</TabsTrigger>
            <TabsTrigger value="projects">Mes Projets</TabsTrigger>
            <TabsTrigger value="favorites">Favoris</TabsTrigger>
            <TabsTrigger value="settings">Paramètres</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>À propos</CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="bio">Biographie</Label>
                      <textarea 
                        id="bio"
                        className="w-full mt-2 p-3 border rounded-md resize-none h-24"
                        value={userProfile.bio}
                        onChange={(e) => setUserProfile({...userProfile, bio: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="website">Site web</Label>
                      <Input 
                        id="website"
                        value={userProfile.website}
                        onChange={(e) => setUserProfile({...userProfile, website: e.target.value})}
                        className="mt-2"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-muted-foreground leading-relaxed">{userProfile.bio}</p>
                    {userProfile.website && (
                      <div>
                        <Label className="text-sm font-medium">Site web</Label>
                        <p className="text-primary hover:underline cursor-pointer mt-1">
                          {userProfile.website}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Statistics */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="text-center">
                <CardContent className="p-6">
                  <TrendingUp className="w-8 h-8 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold">1</div>
                  <div className="text-sm text-muted-foreground">Projet actif</div>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="p-6">
                  <User className="w-8 h-8 text-accent mx-auto mb-2" />
                  <div className="text-2xl font-bold">23</div>
                  <div className="text-sm text-muted-foreground">Investisseurs</div>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="p-6">
                  <Heart className="w-8 h-8 text-destructive mx-auto mb-2" />
                  <div className="text-2xl font-bold">2</div>
                  <div className="text-sm text-muted-foreground">Projets suivis</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* My Projects Tab */}
          <TabsContent value="projects" className="space-y-6">
            {myProjects.map(project => (
              <Card key={project.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{project.title}</CardTitle>
                      <Badge variant="outline" className="mt-2">{project.status}</Badge>
                    </div>
                <Button variant="outline" size="sm" onClick={() => navigate(`/project/${project.id}`)}>
                  Gérer
                </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-sm text-muted-foreground">Progression</Label>
                      <div className="flex items-center mt-1">
                        <div className="flex-1 bg-secondary rounded-full h-2 mr-3">
                          <div 
                            className="bg-accent h-2 rounded-full"
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{project.progress}%</span>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Fonds levés</Label>
                      <div className="text-lg font-semibold">€{project.raised.toLocaleString()}</div>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Investisseurs</Label>
                      <div className="text-lg font-semibold">{project.investors}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <TrendingUp className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Créer un Nouveau Projet</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Présentez votre idée innovante à notre communauté d'investisseurs
                </p>
                <Button onClick={() => navigate('/create-project')}>Nouveau Projet</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Favorites Tab */}
          <TabsContent value="favorites" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {favoriteProjects.map(project => (
                <Card key={project.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{project.title}</CardTitle>
                        <Badge variant="secondary" className="mt-1">{project.sector}</Badge>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/project/${project.id}`)}>
                        <Heart className="w-4 h-4 text-destructive fill-current" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4 mr-1" />
                        {project.location}
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Progression</span>
                          <span className="font-medium">{project.progress}%</span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2">
                          <div 
                            className="bg-accent h-2 rounded-full"
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  Informations Personnelles
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nom complet</Label>
                    <Input id="name" value={userProfile.name} className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={userProfile.email} className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="phone">Téléphone</Label>
                    <Input id="phone" value={userProfile.phone} className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="location">Localisation</Label>
                    <Input id="location" value={userProfile.location} className="mt-1" />
                  </div>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">Compte Premium</h3>
                    <p className="text-sm text-muted-foreground">
                      Accédez à des fonctionnalités avancées et une meilleure visibilité
                    </p>
                  </div>
                  <Button variant="outline" onClick={() => navigate('/dashboard')}>Passer au Premium</Button>
                </div>
                <Separator />
                <div className="flex justify-end gap-3">
                  <Button variant="outline">Annuler</Button>
                  <Button>Sauvegarder</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;