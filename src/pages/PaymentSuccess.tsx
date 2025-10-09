import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  const [transactionData, setTransactionData] = useState<any>(null);

  const reference = searchParams.get('reference');

  useEffect(() => {
    if (reference) {
      verifyPayment(reference);
    } else {
      setVerifying(false);
    }
  }, [reference]);

  const verifyPayment = async (paymentReference: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('paystack-payment', {
        body: {
          action: 'verify_payment',
          reference: paymentReference,
        },
      });

      if (error) throw error;

      if (data.success) {
        setSuccess(true);
        setTransactionData(data.transaction);
        toast({
          title: "Paiement réussi !",
          description: "Votre transaction a été confirmée avec succès.",
        });
      } else {
        throw new Error(data.error || 'Verification failed');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      setSuccess(false);
      toast({
        title: "Erreur de vérification",
        description: error instanceof Error ? error.message : "La vérification du paiement a échoué",
        variant: "destructive",
      });
    } finally {
      setVerifying(false);
    }
  };

  if (verifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Loader className="h-12 w-12 text-primary mx-auto mb-4 animate-spin" />
            <CardTitle>Vérification du paiement</CardTitle>
            <CardDescription>
              Veuillez patienter pendant que nous vérifions votre transaction...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {success ? (
            <>
              <CheckCircle className="h-12 w-12 text-accent mx-auto mb-4" />
              <CardTitle className="text-accent">Paiement Réussi !</CardTitle>
              <CardDescription>
                Votre transaction a été confirmée avec succès.
              </CardDescription>
            </>
          ) : (
            <>
              <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <CardTitle className="text-destructive">Paiement Échoué</CardTitle>
              <CardDescription>
                Une erreur s'est produite lors de la vérification de votre paiement.
              </CardDescription>
            </>
          )}
        </CardHeader>
        
        <CardContent className="space-y-4">
          {success && transactionData && (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Montant:</span>
                <span className="font-medium">₦{Number(transactionData.amount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type:</span>
                <span className="font-medium capitalize">{transactionData.transaction_type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Référence:</span>
                <span className="font-medium text-xs">{transactionData.paystack_reference}</span>
              </div>
            </div>
          )}
          
          <div className="flex flex-col gap-2">
            {success ? (
              <>
                <Button onClick={() => navigate('/dashboard')} className="w-full">
                  Voir le tableau de bord
                </Button>
                <Button onClick={() => navigate('/projects')} variant="outline" className="w-full">
                  Retour aux projets
                </Button>
              </>
            ) : (
              <>
                <Button onClick={() => navigate('/dashboard')} className="w-full">
                  Réessayer
                </Button>
                <Button onClick={() => navigate('/')} variant="outline" className="w-full">
                  Retour à l'accueil
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}