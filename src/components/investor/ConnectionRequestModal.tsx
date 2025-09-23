import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';
import { MessageSquare, UserCheck, Handshake } from 'lucide-react';

interface Project {
  id: string;
  title: string;
  owner_id: string;
  profiles?: {
    full_name: string;
    company?: string;
  };
}

interface ConnectionRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  onSuccess?: () => void;
}

export const ConnectionRequestModal: React.FC<ConnectionRequestModalProps> = ({
  isOpen,
  onClose,
  project,
  onSuccess
}) => {
  const { user } = useUserRole();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const [message, setMessage] = useState('');

  const handleSubmit = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('connection_requests')
        .insert([{
          investor_id: user.id,
          entrepreneur_id: project.owner_id,
          project_id: project.id,
          message: message.trim() || null,
          status: 'pending'
        }]);

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast({
            title: "Demande déjà envoyée",
            description: "Vous avez déjà envoyé une demande de connexion pour ce projet",
            variant: "destructive"
          });
          return;
        }
        throw error;
      }

      toast({
        title: "Demande envoyée",
        description: "Votre demande de connexion a été envoyée à l'entrepreneur",
      });

      onSuccess?.();
      onClose();

    } catch (error: any) {
      console.error('Error sending connection request:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'envoyer la demande",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Handshake className="w-5 h-5" />
            Se connecter avec l'entrepreneur
          </DialogTitle>
          <DialogDescription>
            Projet: <span className="font-medium">{project.title}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informations entrepreneur */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <UserCheck className="w-5 h-5 text-blue-600" />
              <div>
                <h4 className="font-medium text-blue-900">
                  {project.profiles?.full_name || 'Entrepreneur'}
                </h4>
                {project.profiles?.company && (
                  <p className="text-sm text-blue-700">{project.profiles.company}</p>
                )}
              </div>
            </div>
            <Badge variant="outline" className="bg-white border-blue-300 text-blue-700">
              Porteur de projet
            </Badge>
          </div>

          {/* Message personnel */}
          <div className="space-y-2">
            <Label htmlFor="message">Message personnel (recommandé)</Label>
            <div className="relative">
              <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Présentez-vous brièvement et expliquez votre intérêt pour le projet..."
                className="pl-10 resize-none"
                rows={4}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Un message personnalisé augmente vos chances d'obtenir une réponse positive.
            </p>
          </div>

          {/* Information sur la suite */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-900 mb-2">✅ Prochaines étapes</h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• L'entrepreneur recevra votre demande de connexion</li>
              <li>• Il pourra accepter ou décliner votre demande</li>
              <li>• Si acceptée, vous pourrez échanger directement</li>
              <li>• Vous serez notifié de sa réponse</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="bg-primary hover:bg-primary/90"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                  Envoi...
                </>
              ) : (
                <>
                  <Handshake className="w-4 h-4 mr-2" />
                  Envoyer la demande
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};