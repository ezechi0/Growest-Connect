import React from 'react';
import { useUserRole, UserRole } from '@/hooks/useUserRole';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield } from 'lucide-react';

interface RoleBasedAccessProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireKyc?: boolean;
}

export const RoleBasedAccess: React.FC<RoleBasedAccessProps> = ({
  allowedRoles,
  children,
  fallback,
  requireKyc = false
}) => {
  const { profile, loading, isKycApproved } = useUserRole();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!profile) {
    return fallback || (
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Vous devez être connecté pour accéder à cette section.
        </AlertDescription>
      </Alert>
    );
  }

  // Vérifier le rôle
  if (!allowedRoles.includes(profile.role)) {
    return fallback || (
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Vous n'avez pas les permissions nécessaires pour accéder à cette section.
        </AlertDescription>
      </Alert>
    );
  }

  // Vérifier le KYC si requis
  if (requireKyc && !isKycApproved()) {
    return fallback || (
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Votre compte doit être vérifié (KYC approuvé) pour accéder à cette section.
        </AlertDescription>
      </Alert>
    );
  }

  return <>{children}</>;
};