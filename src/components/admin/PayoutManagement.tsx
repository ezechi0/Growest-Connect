import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  DollarSign, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Send, 
  Eye,
  Calendar,
  User,
  Building
} from 'lucide-react';

interface Payout {
  id: string;
  entrepreneur_id: string;
  project_id: string;
  amount: number;
  currency: string;
  status: string;
  payout_method: string;
  bank_details?: any;
  notes?: string;
  created_at: string;
  processed_at?: string;
  profiles?: {
    full_name: string;
  } | null;
  projects?: {
    title: string;
  } | null;
}

export const PayoutManagement: React.FC = () => {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayout, setSelectedPayout] = useState<Payout | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadPayouts();
  }, []);

  const loadPayouts = async () => {
    try {
      const { data, error } = await supabase
        .from('payouts')
        .select(`
          *
        `)
        .order('created_at', { ascending: false });

      // Fetch related data separately 
      const payoutsWithRelations = await Promise.all(
        (data || []).map(async (payout) => {
          const [profileData, projectData] = await Promise.all([
            supabase
              .from('profiles')
              .select('full_name')
              .eq('id', payout.entrepreneur_id)
              .single(),
            supabase
              .from('projects')
              .select('title')
              .eq('id', payout.project_id)
              .single()
          ]);

          return {
            ...payout,
            profiles: profileData.data,
            projects: projectData.data
          };
        })
      );

      if (error) throw error;
      setPayouts(payoutsWithRelations as Payout[]);
    } catch (error) {
      console.error('Error loading payouts:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les versements",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updatePayoutStatus = async (payoutId: string, status: string, notes?: string) => {
    try {
      setProcessingId(payoutId);
      
      const updateData: any = {
        status,
        updated_at: new Date().toISOString()
      };

      if (status === 'completed') {
        updateData.processed_at = new Date().toISOString();
      }

      if (notes) {
        updateData.notes = notes;
      }

      const { error } = await supabase
        .from('payouts')
        .update(updateData)
        .eq('id', payoutId);

      if (error) throw error;

      toast({
        title: "Versement mis à jour",
        description: `Le statut a été changé vers "${getStatusLabel(status)}"`,
      });

      loadPayouts();
    } catch (error) {
      console.error('Error updating payout:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le versement",
        variant: "destructive"
      });
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'En attente', variant: 'secondary' as const, icon: Clock },
      processing: { label: 'En cours', variant: 'outline' as const, icon: Send },
      completed: { label: 'Terminé', variant: 'default' as const, icon: CheckCircle },
      failed: { label: 'Échoué', variant: 'destructive' as const, icon: XCircle }
    };
    return statusConfig[status as keyof typeof statusConfig] || { 
      label: status, 
      variant: 'outline' as const, 
      icon: Clock 
    };
  };

  const getStatusLabel = (status: string) => {
    return getStatusBadge(status).label;
  };

  const calculateTotalPending = () => {
    return payouts
      .filter(p => p.status === 'pending')
      .reduce((sum, p) => sum + p.amount, 0);
  };

  const calculateTotalProcessed = () => {
    return payouts
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">En attente</p>
                <p className="text-xl font-bold">{calculateTotalPending().toLocaleString()} XOF</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Versés</p>
                <p className="text-xl font-bold">{calculateTotalProcessed().toLocaleString()} XOF</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total versements</p>
                <p className="text-xl font-bold">{payouts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des versements */}
      <Card>
        <CardHeader>
          <CardTitle>Gestion des versements</CardTitle>
          <CardDescription>
            Gérez les versements aux entrepreneurs après réception des investissements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {payouts.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Aucun versement trouvé
              </p>
            ) : (
              payouts.map((payout) => {
                const statusConfig = getStatusBadge(payout.status);
                const StatusIcon = statusConfig.icon;
                
                return (
                  <div
                    key={payout.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <StatusIcon className="w-5 h-5 text-primary" />
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{payout.profiles?.full_name}</h4>
                          <Badge variant={statusConfig.variant}>
                            {statusConfig.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {payout.projects?.title}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            {payout.amount.toLocaleString()} {payout.currency}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(payout.created_at).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedPayout(payout)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>Détails du versement</DialogTitle>
                            <DialogDescription>
                              Gérer le versement pour {payout.profiles?.full_name}
                            </DialogDescription>
                          </DialogHeader>
                          
                          {selectedPayout && (
                            <PayoutDetailForm
                              payout={selectedPayout}
                              onUpdate={updatePayoutStatus}
                              isProcessing={processingId === selectedPayout.id}
                            />
                          )}
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

interface PayoutDetailFormProps {
  payout: Payout;
  onUpdate: (id: string, status: string, notes?: string) => void;
  isProcessing: boolean;
}

const PayoutDetailForm: React.FC<PayoutDetailFormProps> = ({
  payout,
  onUpdate,
  isProcessing
}) => {
  const [notes, setNotes] = useState(payout.notes || '');

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <Label className="text-muted-foreground">Entrepreneur</Label>
          <p className="font-medium">{payout.profiles?.full_name}</p>
        </div>
        <div>
          <Label className="text-muted-foreground">Montant</Label>
          <p className="font-medium">{payout.amount.toLocaleString()} {payout.currency}</p>
        </div>
        <div>
          <Label className="text-muted-foreground">Projet</Label>
          <p className="font-medium">{payout.projects?.title}</p>
        </div>
        <div>
          <Label className="text-muted-foreground">Méthode</Label>
          <p className="font-medium">{payout.payout_method}</p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes administratives</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Ajouter des notes sur ce versement..."
          rows={3}
        />
      </div>

      {payout.status === 'pending' && (
        <div className="flex gap-2">
          <Button
            onClick={() => onUpdate(payout.id, 'processing', notes)}
            disabled={isProcessing}
            className="flex-1"
          >
            Marquer en cours
          </Button>
          <Button
            onClick={() => onUpdate(payout.id, 'completed', notes)}
            disabled={isProcessing}
            variant="default"
            className="flex-1"
          >
            Marquer comme terminé
          </Button>
        </div>
      )}

      {payout.status === 'processing' && (
        <div className="flex gap-2">
          <Button
            onClick={() => onUpdate(payout.id, 'completed', notes)}
            disabled={isProcessing}
            className="flex-1"
          >
            Marquer comme terminé
          </Button>
          <Button
            onClick={() => onUpdate(payout.id, 'failed', notes)}
            disabled={isProcessing}
            variant="destructive"
            className="flex-1"
          >
            Marquer comme échoué
          </Button>
        </div>
      )}

      {(payout.status === 'completed' || payout.status === 'failed') && (
        <Button
          onClick={() => onUpdate(payout.id, 'pending', notes)}
          disabled={isProcessing}
          variant="outline"
          className="w-full"
        >
          Remettre en attente
        </Button>
      )}
    </div>
  );
};