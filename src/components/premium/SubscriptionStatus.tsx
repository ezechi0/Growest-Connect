import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, Clock, XCircle, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { PremiumBadge } from "./PremiumBadge";

interface Subscription {
  id: string;
  plan_type: string;
  status: string;
  start_date: string;
  end_date: string | null;
  amount: number;
  currency: string;
}

interface SubscriptionStatusProps {
  userId: string;
}

export const SubscriptionStatus = ({ userId }: SubscriptionStatusProps) => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchSubscription();
  }, [userId]);

  const fetchSubscription = async () => {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setSubscription(data);
    } catch (error: any) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-5 w-5 text-accent" />;
      case 'expired':
        return <XCircle className="h-5 w-5 text-destructive" />;
      case 'trial':
        return <Clock className="h-5 w-5 text-primary" />;
      case 'cancelled':
        return <AlertTriangle className="h-5 w-5 text-muted-foreground" />;
      default:
        return <RefreshCw className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-accent text-accent-foreground';
      case 'expired':
        return 'bg-destructive text-destructive-foreground';
      case 'trial':
        return 'bg-primary text-primary-foreground';
      case 'cancelled':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isExpiringSoon = (endDate: string | null) => {
    if (!endDate) return false;
    const end = new Date(endDate);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!subscription) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            Aucun Abonnement Actif
          </CardTitle>
          <CardDescription>
            Vous utilisez actuellement le plan gratuit de Growest Connect.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="default" className="w-full">
            Découvrir les Plans Premium
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {getStatusIcon(subscription.status)}
            Abonnement Premium
          </CardTitle>
          <PremiumBadge 
            plan={subscription.plan_type as "start" | "capital" | "pro_plus"} 
            size="md" 
          />
        </div>
        <CardDescription>
          Gérez votre abonnement et vos préférences de facturation
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Statut</span>
          <Badge className={getStatusColor(subscription.status)}>
            {subscription.status === 'active' ? 'Actif' :
             subscription.status === 'expired' ? 'Expiré' :
             subscription.status === 'trial' ? 'Période d\'essai' :
             subscription.status === 'cancelled' ? 'Annulé' : 'Inconnu'}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Plan</span>
          <span className="text-sm text-muted-foreground">
            {subscription.plan_type === 'start' ? 'Premium Start' :
             subscription.plan_type === 'capital' ? 'Premium Capital' :
             subscription.plan_type === 'pro_plus' ? 'Pro+' : subscription.plan_type}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Prix</span>
          <span className="text-sm text-muted-foreground">
            {subscription.amount?.toLocaleString()} {subscription.currency}/mois
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Date de début</span>
          <span className="text-sm text-muted-foreground">
            {formatDate(subscription.start_date)}
          </span>
        </div>

        {subscription.end_date && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Date d'expiration</span>
            <span className={`text-sm ${isExpiringSoon(subscription.end_date) ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
              {formatDate(subscription.end_date)}
            </span>
          </div>
        )}

        {isExpiringSoon(subscription.end_date) && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">Expiration proche</span>
            </div>
            <p className="text-sm text-destructive/80 mt-1">
              Votre abonnement expire bientôt. Renouvelez-le pour continuer à profiter des fonctionnalités premium.
            </p>
          </div>
        )}

        <div className="flex gap-2 pt-4">
          <Button variant="outline" size="sm" className="flex-1">
            Modifier le Plan
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            Gérer la Facturation
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};