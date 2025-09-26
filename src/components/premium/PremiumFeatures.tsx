import { useUserRole } from "@/hooks/useUserRole";
import { useSubscription } from "@/hooks/useSubscription";
import { PremiumBadge } from "./PremiumBadge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Crown, Lock } from "lucide-react";

interface PremiumFeaturesProps {
  children: React.ReactNode;
  requiredPlan?: "start" | "capital" | "pro_plus";
  feature?: string;
  showUpgradePrompt?: boolean;
}

export const PremiumFeatures = ({ 
  children, 
  requiredPlan, 
  feature, 
  showUpgradePrompt = true 
}: PremiumFeaturesProps) => {
  const { user } = useUserRole();
  const { hasActivePremium, premiumPlan } = useSubscription(user?.id);

  // If no required plan specified, show for all premium users
  if (!requiredPlan) {
    if (hasActivePremium) {
      return <>{children}</>;
    }
  } else {
    // Check if user has the required plan or higher
    const planHierarchy = { "start": 1, "capital": 2, "pro_plus": 3 };
    const userPlanLevel = premiumPlan ? planHierarchy[premiumPlan] : 0;
    const requiredPlanLevel = planHierarchy[requiredPlan];

    if (userPlanLevel >= requiredPlanLevel) {
      return <>{children}</>;
    }
  }

  // Show upgrade prompt or lock message
  if (!showUpgradePrompt) {
    return null;
  }

  return (
    <div className="relative">
      <div className="opacity-50 pointer-events-none blur-sm">
        {children}
      </div>
      
      <Alert className="absolute inset-0 flex items-center justify-center bg-background/95 backdrop-blur-sm border-2 border-primary/20">
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center">
            <Crown className="h-8 w-8 text-primary" />
          </div>
          
          <div>
            <h3 className="font-semibold text-primary mb-1">
              {feature ? `${feature} Premium` : 'Fonctionnalité Premium'}
            </h3>
            
            {requiredPlan && (
              <div className="flex justify-center mb-2">
                <PremiumBadge plan={requiredPlan} size="md" />
              </div>
            )}
            
            <AlertDescription className="text-sm text-muted-foreground">
              Cette fonctionnalité nécessite un abonnement premium.
              <br />
              <a 
                href="/premium" 
                className="text-primary hover:underline font-medium"
              >
                Découvrir les plans premium →
              </a>
            </AlertDescription>
          </div>
        </div>
      </Alert>
    </div>
  );
};

export const PremiumOnly = PremiumFeatures;