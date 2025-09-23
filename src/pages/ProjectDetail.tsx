import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ProjectDetail as ProjectDetailComponent } from "@/components/projects/ProjectDetail";
import { ProjectForm } from "@/components/projects/ProjectForm";

export default function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);

  if (!projectId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Projet non trouvé</h1>
          <button 
            onClick={() => navigate('/projects')}
            className="text-primary hover:underline"
          >
            Retour aux projets
          </button>
        </div>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 py-8">
        <ProjectForm
          projectId={projectId}
          onSuccess={() => setIsEditing(false)}
          onCancel={() => setIsEditing(false)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 py-8">
      <ProjectDetailComponent
        projectId={projectId}
        onEdit={() => setIsEditing(true)}
      />
    </div>
  );
}