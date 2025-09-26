import { Badge } from "@/components/ui/badge";
import { Crown, Zap, Star } from "lucide-react";

interface PremiumBadgeProps {
  plan: "start" | "capital" | "pro_plus" | null;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
}

export const PremiumBadge = ({ plan, size = "sm", showIcon = true }: PremiumBadgeProps) => {
  if (!plan) return null;

  const config = {
    start: {
      label: "Premium Start",
      variant: "default" as const,
      icon: Star,
      className: "bg-gradient-to-r from-primary to-primary-light text-primary-foreground"
    },
    capital: {
      label: "Premium Capital", 
      variant: "secondary" as const,
      icon: Zap,
      className: "bg-gradient-to-r from-accent to-accent-light text-accent-foreground"
    },
    pro_plus: {
      label: "Pro+",
      variant: "outline" as const,
      icon: Crown,
      className: "bg-gradient-to-r from-amber-500 to-amber-600 text-white border-amber-400"
    }
  };

  const { label, icon: Icon, className } = config[plan];
  const sizeClass = size === "lg" ? "text-sm px-3 py-1" : size === "md" ? "text-xs px-2.5 py-0.5" : "text-xs px-2 py-0.5";

  return (
    <Badge className={`${className} ${sizeClass} font-semibold shadow-sm`}>
      {showIcon && <Icon className="h-3 w-3 mr-1" />}
      {label}
    </Badge>
  );
};