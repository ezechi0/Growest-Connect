import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Bell, Crown, AlertTriangle, CheckCircle } from "lucide-react";

interface SubscriptionNotificationsProps {
  userId: string;
}

interface NotificationData {
  type: 'subscription_confirmed' | 'subscription_expiring' | 'subscription_expired' | 'subscription_renewed' | 'subscription_cancelled';
  title: string;
  message: string;
  plan?: string;
  daysLeft?: number;
}

export const SubscriptionNotifications = ({ userId }: SubscriptionNotificationsProps) => {
  const { toast } = useToast();
  const [hasShownWelcome, setHasShownWelcome] = useState(false);

  useEffect(() => {
    const channel = supabase
      .channel('subscription_notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'subscriptions',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          const subscription = payload.new;
          showSubscriptionNotification({
            type: 'subscription_confirmed',
            title: 'Abonnement confirmé !',
            message: `Votre abonnement ${subscription.plan_type} est maintenant actif. Profitez de toutes les fonctionnalités premium !`,
            plan: subscription.plan_type
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'subscriptions',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          const oldSub = payload.old;
          const newSub = payload.new;

          if (oldSub.status !== newSub.status) {
            if (newSub.status === 'expired') {
              showSubscriptionNotification({
                type: 'subscription_expired',
                title: 'Abonnement expiré',
                message: 'Votre abonnement premium a expiré. Renouvelez-le pour continuer à profiter des fonctionnalités premium.',
                plan: newSub.plan_type
              });
            } else if (newSub.status === 'cancelled') {
              showSubscriptionNotification({
                type: 'subscription_cancelled',
                title: 'Abonnement annulé',
                message: 'Votre abonnement a été annulé. Vous conservez l\'accès jusqu\'à la fin de la période payée.',
                plan: newSub.plan_type
              });
            } else if (newSub.status === 'active' && oldSub.status === 'expired') {
              showSubscriptionNotification({
                type: 'subscription_renewed',
                title: 'Abonnement renouvelé !',
                message: `Votre abonnement ${newSub.plan_type} a été renouvelé avec succès.`,
                plan: newSub.plan_type
              });
            }
          }
        }
      )
      .subscribe();

    // Check for existing active subscription on mount
    checkExistingSubscription();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const checkExistingSubscription = async () => {
    try {
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();

      if (subscription && !hasShownWelcome) {
        // Check if subscription is expiring soon
        if (subscription.end_date) {
          const endDate = new Date(subscription.end_date);
          const now = new Date();
          const daysUntilExpiry = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

          if (daysUntilExpiry <= 7 && daysUntilExpiry > 0) {
            showSubscriptionNotification({
              type: 'subscription_expiring',
              title: 'Abonnement expire bientôt',
              message: `Votre abonnement ${subscription.plan_type} expire dans ${daysUntilExpiry} jour(s).`,
              plan: subscription.plan_type,
              daysLeft: daysUntilExpiry
            });
          }
        }
        setHasShownWelcome(true);
      }
    } catch (error) {
      console.error('Error checking existing subscription:', error);
    }
  };

  const showSubscriptionNotification = (data: NotificationData) => {
    const getIcon = () => {
      switch (data.type) {
        case 'subscription_confirmed':
        case 'subscription_renewed':
          return <CheckCircle className="h-5 w-5" />;
        case 'subscription_expiring':
        case 'subscription_expired':
        case 'subscription_cancelled':
          return <AlertTriangle className="h-5 w-5" />;
        default:
          return <Bell className="h-5 w-5" />;
      }
    };

    const getVariant = (): "default" | "destructive" => {
      switch (data.type) {
        case 'subscription_confirmed':
        case 'subscription_renewed':
          return 'default';
        case 'subscription_expiring':
        case 'subscription_expired':
        case 'subscription_cancelled':
          return 'destructive';
        default:
          return 'default';
      }
    };

    toast({
      title: data.title,
      description: data.message,
      variant: getVariant(),
      duration: data.type === 'subscription_confirmed' ? 8000 : 6000,
    });

    // Store notification in database for history
    storeNotification(data);
  };

  const storeNotification = async (data: NotificationData) => {
    try {
      await supabase.from('notifications').insert({
        user_id: userId,
        type: data.type,
        title: data.title,
        message: data.message,
        data: {
          plan: data.plan,
          daysLeft: data.daysLeft
        }
      });
    } catch (error) {
      console.error('Error storing notification:', error);
    }
  };

  return null; // This component doesn't render anything visible
};

export default SubscriptionNotifications;