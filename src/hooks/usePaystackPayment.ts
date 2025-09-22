import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PaymentOptions {
  email: string;
  amount: number;
  plan: string;
  projectId?: string;
  metadata?: any;
}

interface PaymentResponse {
  success: boolean;
  data?: any;
  authorization_url?: string;
  reference?: string;
  error?: string;
}

export const usePaystackPayment = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const initializePayment = async (options: PaymentOptions): Promise<PaymentResponse> => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('paystack-payment', {
        body: options,
      });

      if (error) {
        throw error;
      }

      return data;
    } catch (error: any) {
      console.error('Payment initialization error:', error);
      toast({
        title: "Erreur de paiement",
        description: error.message || "Une erreur est survenue lors de l'initialisation du paiement.",
        variant: "destructive",
      });
      
      return {
        success: false,
        error: error.message,
      };
    } finally {
      setLoading(false);
    }
  };

  const redirectToPayment = (authorizationUrl: string) => {
    window.open(authorizationUrl, '_blank');
  };

  return {
    initializePayment,
    redirectToPayment,
    loading,
  };
};