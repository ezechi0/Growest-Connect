import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';
import { TrendingUp, DollarSign, MessageSquare } from 'lucide-react';
import { formatCurrency } from '@/lib/currency';

interface Project {
  id: string;
  title: string;
  min_investment: number;
  max_investment?: number;
  funding_goal: number;
}

interface ProjectInterestModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  onSuccess?: () => void;
}

export const ProjectInterestModal: React.FC<ProjectInterestModalProps> = ({
  isOpen,
  onClose,
  project,
  onSuccess
}) => {
  const { user } = useUserRole();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    interest_level: 'interested',
    investment_amount: project.min_investment,
    message: ''
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!user) return;

    // Validation
    if (formData.investment_amount < project.min_investment) {
      toast({
        title: "Montant insuffisant",
        description: `L'investissement minimum est de ${formatCurrency(project.min_investment)}`,
        variant: "destructive"
      });
      return;
    }

    if (project.max_investment && formData.investment_amount > project.max_investment) {
      toast({
        title: "Montant trop élevé",
        description: `L'investissement maximum est de ${formatCurrency(project.max_investment)}`,
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('project_interests')
        .insert([{
          project_id: project.id,
          investor_id: user.id,
          interest_level: formData.interest_level,
          investment_amount: formData.investment_amount,
          message: formData.message.trim() || null,
          status: 'pending'
        }]);

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast({
            title: "Intérêt déjà exprimé",
            description: "Vous avez déjà exprimé votre intérêt pour ce projet",
            variant: "destructive"
          });
          return;
        }
        throw error;
      }

      toast({
        title: "Intérêt exprimé",
        description: "Votre intérêt a été transmis au porteur de projet",
      });

      onSuccess?.();
      onClose();

    } catch (error: any) {
      console.error('Error expressing interest:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'exprimer votre intérêt",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getInterestLevelLabel = (level: string) => {
    const labels = {
      interested: 'Intéressé',
      very_interested: 'Très intéressé',
      considering: 'En réflexion',
      not_interested: 'Pas intéressé'
    };
    return labels[level as keyof typeof labels] || level;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Exprimer votre intérêt
          </DialogTitle>
          <DialogDescription>
            Projet: <span className="font-medium">{project.title}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Niveau d'intérêt */}
          <div className="space-y-2">
            <Label htmlFor="interest_level">Niveau d'intérêt *</Label>
            <Select 
              value={formData.interest_level} 
              onValueChange={(value) => handleInputChange('interest_level', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="interested">🤔 Intéressé</SelectItem>
                <SelectItem value="very_interested">🔥 Très intéressé</SelectItem>
                <SelectItem value="considering">💭 En réflexion</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Montant d'investissement */}
          <div className="space-y-2">
            <Label htmlFor="investment_amount">Montant d'investissement (FCFA) *</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="investment_amount"
                type="number"
                min={project.min_investment}
                max={project.max_investment || undefined}
                value={formData.investment_amount}
                onChange={(e) => handleInputChange('investment_amount', parseInt(e.target.value))}
                className="pl-10"
                placeholder={project.min_investment.toString()}
            />
          </div>
          <div className="text-sm text-muted-foreground">
            Minimum: {formatCurrency(project.min_investment)}
            {project.max_investment && ` • Maximum: ${formatCurrency(project.max_investment)}`}
          </div>
          </div>

          {/* Message optionnel */}
          <div className="space-y-2">
            <Label htmlFor="message">Message pour l'entrepreneur (optionnel)</Label>
            <div className="relative">
              <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
                placeholder="Questions, expérience, conditions spécifiques..."
                className="pl-10 resize-none"
                rows={3}
              />
            </div>
          </div>

          {/* Information sur la suite */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">📋 Prochaines étapes</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Le porteur de projet recevra votre intérêt</li>
              <li>• Il pourra vous contacter pour discuter</li>
              <li>• Vous pourrez finaliser votre investissement</li>
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
                'Exprimer mon intérêt'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};