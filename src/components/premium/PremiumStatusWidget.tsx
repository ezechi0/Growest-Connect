import { useState, useEffect } from "react";
import { useUserRole } from "@/hooks/useUserRole";
import { useSubscription } from "@/hooks/useSubscription";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PremiumBadge } from "@/components/premium/PremiumBadge";
import { Crown, Zap, TrendingUp, Users, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";

export const PremiumStatusWidget = () => {
  const { user, profile } = useUserRole();
  const { hasActivePremium, premiumPlan, subscription, isExpiringSoon } = useSubscription(user?.id);

  if (!user) return null;

  return (
    <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Crown className="h-5 w-5 text-primary" />
            Statut Premium
          </CardTitle>
          
          {hasActivePremium && premiumPlan && (
            <PremiumBadge plan={premiumPlan} size="md" />
          )}
        </div>
        
        {isExpiringSoon && (
          <div className="flex items-center gap-2 p-2 bg-destructive/10 border border-destructive/20 rounded-lg">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <span className="text-sm text-destructive font-medium">
              Votre abonnement expire bientôt
            </span>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        {hasActivePremium ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Plan actuel</span>
              <Badge variant="secondary">
                {subscription?.plan_type === 'start' ? 'Premium Start' :
                 subscription?.plan_type === 'capital' ? 'Premium Capital' :
                 subscription?.plan_type === 'pro_plus' ? 'Pro+' : 'Premium'}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <TrendingUp className="h-4 w-4" />
                <span>Visibilité renforcée active</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>Accès complet aux investisseurs</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Zap className="h-4 w-4" />
                <span>Matching IA avancé</span>
              </div>
            </div>
            
            <Button variant="outline" size="sm" asChild className="w-full">
              <Link to="/premium">
                Gérer l'abonnement
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <CardDescription>
              Débloquez toutes les fonctionnalités premium pour maximiser vos chances de succès.
            </CardDescription>
            
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-primary rounded-full"></span>
                <span>Visibilité 3x supérieure</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-primary rounded-full"></span>
                <span>Matching IA avancé</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-primary rounded-full"></span>
                <span>Support prioritaire</span>
              </div>
            </div>
            
            <Button asChild className="w-full">
              <Link to="/premium">
                <Crown className="h-4 w-4 mr-2" />
                Passer à Premium
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};