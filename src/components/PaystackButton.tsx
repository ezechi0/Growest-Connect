import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PaystackButtonProps {
  amount: number;
  projectId?: string;
  email: string;
  investorId: string;
  transactionType?: "investment" | "subscription";
  planName?: string;
  children: React.ReactNode;
  variant?: "default" | "outline" | "secondary";
}

export const PaystackButton = ({
  amount,
  projectId,
  email,
  investorId,
  transactionType = "investment",
  planName,
  children,
  variant = "default",
}: PaystackButtonProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handlePayment = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase.functions.invoke('paystack-payment', {
        body: {
          action: 'initialize_payment',
          amount,
          email,
          project_id: projectId,
          investor_id: investorId,
          transaction_type: transactionType,
        },
      });

      if (error) throw error;

      if (data.success) {
        // Redirect to Paystack payment page
        window.location.href = data.authorization_url;
      } else {
        throw new Error(data.error || 'Payment initialization failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Erreur de paiement",
        description: error instanceof Error ? error.message : "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handlePayment}
      disabled={loading}
      variant={variant}
      className="w-full"
    >
      {loading ? "Initialisation..." : children}
    </Button>
  );
};