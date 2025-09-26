import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Subscription {
  id: string;
  plan_type: string;
  status: string;
  start_date: string;
  end_date: string | null;
  amount: number;
  currency: string;
  paystack_subscription_code: string | null;
}

export const useSubscription = (userId?: string) => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [isExpiringSoon, setIsExpiringSoon] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (userId) {
      fetchSubscription();
      
      // Set up real-time subscription to changes
      const channel = supabase
        .channel('subscription_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'subscriptions',
            filter: `user_id=eq.${userId}`
          },
          (payload) => {
            if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
              setSubscription(payload.new as Subscription);
              checkExpirationStatus(payload.new as Subscription);
            } else if (payload.eventType === 'DELETE') {
              setSubscription(null);
              setIsExpiringSoon(false);
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [userId]);

  const fetchSubscription = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .in('status', ['active', 'trial'])
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setSubscription(data);
      if (data) {
        checkExpirationStatus(data);
      }
    } catch (error: any) {
      console.error('Error fetching subscription:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les informations d'abonnement.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const checkExpirationStatus = (sub: Subscription) => {
    if (!sub.end_date) {
      setIsExpiringSoon(false);
      return;
    }

    const endDate = new Date(sub.end_date);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    const expiringSoon = daysUntilExpiry <= 7 && daysUntilExpiry > 0;
    setIsExpiringSoon(expiringSoon);

    // Show notification for expiring subscriptions
    if (expiringSoon && daysUntilExpiry === 7) {
      toast({
        title: "Abonnement expire bientôt",
        description: `Votre abonnement ${sub.plan_type} expire dans ${daysUntilExpiry} jour(s). Renouvelez-le pour continuer à profiter des fonctionnalités premium.`,
        variant: "destructive",
      });
    }
  };

  const cancelSubscription = async () => {
    if (!subscription?.paystack_subscription_code) {
      toast({
        title: "Erreur",
        description: "Impossible d'annuler l'abonnement.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('paystack-payment', {
        body: {
          action: 'cancel_subscription',
          subscription_code: subscription.paystack_subscription_code,
        },
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Abonnement annulé",
          description: "Votre abonnement a été annulé avec succès. Vous conservez l'accès jusqu'à la fin de la période payée.",
        });
        
        // Refresh subscription data
        await fetchSubscription();
      } else {
        throw new Error(data.error || 'Erreur lors de l\'annulation');
      }
    } catch (error: any) {
      console.error('Cancel subscription error:', error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de l'annulation.",
        variant: "destructive",
      });
    }
  };

  const renewSubscription = async (userEmail: string) => {
    if (!subscription) return;

    try {
      const { data, error } = await supabase.functions.invoke('paystack-payment', {
        body: {
          action: 'create_subscription',
          email: userEmail,
          amount: subscription.amount,
          plan_code: subscription.plan_type,
          metadata: {
            user_id: userId,
            plan_type: subscription.plan_type,
            subscription_type: 'renewal'
          },
        },
      });

      if (error) throw error;

      if (data.success && data.authorization_url) {
        window.location.href = data.authorization_url;
      } else {
        throw new Error(data.error || 'Erreur lors du renouvellement');
      }
    } catch (error: any) {
      console.error('Renew subscription error:', error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors du renouvellement.",
        variant: "destructive",
      });
    }
  };

  const hasActivePremium = () => {
    return subscription && (subscription.status === 'active' || subscription.status === 'trial');
  };

  const getPremiumPlan = (): "start" | "capital" | "pro_plus" | null => {
    if (!hasActivePremium()) return null;
    return subscription?.plan_type as "start" | "capital" | "pro_plus";
  };

  return {
    subscription,
    loading,
    isExpiringSoon,
    hasActivePremium: hasActivePremium(),
    premiumPlan: getPremiumPlan(),
    cancelSubscription,
    renewSubscription,
    refreshSubscription: fetchSubscription
  };
};