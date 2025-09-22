import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, MapPin, Calendar, Euro, Search, Filter } from "lucide-react";

const Projects = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSector, setSelectedSector] = useState("all");

  // Données d'exemple - sera remplacé par Supabase
  const projects = [
    {
      id: 1,
      title: "AgriTech Solutions",
      description: "Plateforme digitale pour optimiser la chaîne d'approvisionnement agricole au Sénégal",
      sector: "Agriculture",
      location: "Dakar, Sénégal",
      fundingGoal: 150000,
      raised: 45000,
      daysLeft: 25,
      image: "🌱",
      entrepreneur: "Amina Diallo"
    },
    {
      id: 2,
      title: "EduConnect",
      description: "Application mobile d'apprentissage adaptatif pour l'éducation primaire en Côte d'Ivoire",
      sector: "Éducation",
      location: "Abidjan, Côte d'Ivoire",
      fundingGoal: 80000,
      raised: 62000,
      daysLeft: 12,
      image: "📚",
      entrepreneur: "Kouassi Jean"
    },
    {
      id: 3,
      title: "HealthCare Mobile",
      description: "Télémédecine et suivi médical à distance pour les zones rurales du Mali",
      sector: "Santé",
      location: "Bamako, Mali",
      fundingGoal: 200000,
      raised: 18000,
      daysLeft: 45,
      image: "🏥",
      entrepreneur: "Dr. Fatou Traoré"
    },
    {
      id: 4,
      title: "Green Energy Hub",
      description: "Solutions d'énergie solaire décentralisée pour les communautés rurales du Burkina Faso",
      sector: "Énergie",
      location: "Ouagadougou, Burkina Faso",
      fundingGoal: 300000,
      raised: 95000,
      daysLeft: 30,
      image: "☀️",
      entrepreneur: "Ibrahim Sawadogo"
    }
  ];

  const sectors = ["all", "Agriculture", "Éducation", "Santé", "Énergie", "Fintech", "E-commerce"];

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSector = selectedSector === "all" || project.sector === selectedSector;
    return matchesSearch && matchesSector;
  });

  const calculateProgress = (raised: number, goal: number) => {
    return Math.min((raised / goal) * 100, 100);
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Découvrez les <span className="text-primary">Projets Innovants</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Explorez une sélection de projets entrepreneuriaux prometteurs à travers l'Afrique
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Rechercher un projet..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={selectedSector} onValueChange={setSelectedSector}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Tous les secteurs" />
              </SelectTrigger>
              <SelectContent>
                {sectors.map(sector => (
                  <SelectItem key={sector} value={sector}>
                    {sector === "all" ? "Tous les secteurs" : sector}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProjects.map(project => (
            <Card key={project.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="text-4xl mb-2">{project.image}</div>
                  <Button variant="ghost" size="sm">
                    <Heart className="w-4 h-4" />
                  </Button>
                </div>
                <CardTitle className="text-xl leading-tight">{project.title}</CardTitle>
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4 mr-1" />
                  {project.location}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground text-sm line-clamp-3">
                  {project.description}
                </p>
                
                <Badge variant="secondary" className="w-fit">
                  {project.sector}
                </Badge>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Objectif: €{project.fundingGoal.toLocaleString()}</span>
                    <span className="font-medium">€{project.raised.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div 
                      className="bg-accent h-2 rounded-full transition-all"
                      style={{ width: `${calculateProgress(project.raised, project.fundingGoal)}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-accent font-medium">
                      {calculateProgress(project.raised, project.fundingGoal).toFixed(1)}% financé
                    </span>
                    <div className="flex items-center text-muted-foreground">
                      <Calendar className="w-4 h-4 mr-1" />
                      {project.daysLeft} jours restants
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <p className="text-sm text-muted-foreground">
                    Par <span className="font-medium text-foreground">{project.entrepreneur}</span>
                  </p>
                </div>

                <Button className="w-full">
                  <Euro className="w-4 h-4 mr-2" />
                  Investir dans ce Projet
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              Aucun projet ne correspond à vos critères de recherche.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Projects;