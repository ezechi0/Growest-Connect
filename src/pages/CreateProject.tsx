import { ProjectForm } from "@/components/projects/ProjectForm";
import { useNavigate } from "react-router-dom";

export default function CreateProject() {
  const navigate = useNavigate();

  const handleSuccess = (projectId: string) => {
    navigate(`/project/${projectId}`);
  };

  const handleCancel = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 py-8">
      <ProjectForm 
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </div>
  );
}