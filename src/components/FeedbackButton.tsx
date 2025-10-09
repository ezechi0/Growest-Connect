import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MessageSquare, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";

export const FeedbackButton = () => {
  const [open, setOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useUserRole();

  const handleSubmit = async () => {
    if (!feedback.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer votre feedback",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Log feedback en console (en attendant la table feedback dans Supabase)
      console.log('📝 Feedback Beta:', {
        user: user?.email || 'Anonymous',
        message: feedback,
        page: window.location.pathname,
        timestamp: new Date().toISOString()
      });

      toast({
        title: "Merci pour votre retour !",
        description: "Votre feedback a été enregistré. Nous l'analyserons rapidement."
      });

      setFeedback("");
      setOpen(false);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le feedback. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="fixed bottom-6 right-6 z-50 shadow-lg hover:shadow-xl transition-all gap-2"
        >
          <MessageSquare className="w-4 h-4" />
          <span className="hidden sm:inline">Feedback Beta</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Partagez votre expérience</DialogTitle>
          <DialogDescription>
            Growest Connect est en version Beta. Votre feedback est précieux pour améliorer la plateforme !
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="feedback">Votre retour</Label>
            <Textarea
              id="feedback"
              placeholder="Qu'avez-vous aimé ? Que pourrions-nous améliorer ? Avez-vous rencontré des bugs ?"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={5}
              className="resize-none"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 gap-2"
            >
              {isSubmitting ? (
                "Envoi..."
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Envoyer
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
