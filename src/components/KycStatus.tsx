import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileUpload } from './FileUpload';
import { useUserRole } from '@/hooks/useUserRole';
import { 
  CheckCircle, 
  Clock, 
  XCircle, 
  AlertCircle, 
  Upload,
  FileText 
} from 'lucide-react';

const kycStatusConfig = {
  pending: {
    icon: Clock,
    label: 'En attente',
    description: 'Votre vérification d\'identité est en attente de soumission.',
    color: 'bg-yellow-100 text-yellow-800',
    variant: 'secondary' as const
  },
  under_review: {
    icon: AlertCircle,
    label: 'En cours de révision',
    description: 'Vos documents sont en cours de vérification par notre équipe.',
    color: 'bg-blue-100 text-blue-800',
    variant: 'secondary' as const
  },
  approved: {
    icon: CheckCircle,
    label: 'Approuvé',
    description: 'Votre identité a été vérifiée avec succès.',
    color: 'bg-green-100 text-green-800',
    variant: 'default' as const
  },
  rejected: {
    icon: XCircle,
    label: 'Rejeté',
    description: 'Votre vérification a été rejetée. Veuillez soumettre de nouveaux documents.',
    color: 'bg-red-100 text-red-800',
    variant: 'destructive' as const
  }
};

export const KycStatus: React.FC = () => {
  const { profile, updateProfile, loading } = useUserRole();

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!profile) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Impossible de charger les informations de profil.
        </AlertDescription>
      </Alert>
    );
  }

  const kycStatus = profile.kyc_status || 'pending';
  const config = kycStatusConfig[kycStatus];
  const Icon = config.icon;

  const handleDocumentUpload = async (url: string, fileName: string) => {
    const result = await updateProfile({
      kyc_document_url: url,
      kyc_status: 'under_review'
    });

    if (result.error) {
      console.error('Failed to update KYC status:', result.error);
    }
  };

  const canUploadDocument = kycStatus === 'pending' || kycStatus === 'rejected';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Vérification d'identité (KYC)
        </CardTitle>
        <CardDescription>
          La vérification d'identité est requise pour accéder à toutes les fonctionnalités de la plateforme.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Statut actuel */}
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5" />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium">Statut :</span>
              <Badge variant={config.variant} className={config.color}>
                <Icon className="w-3 h-3 mr-1" />
                {config.label}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {config.description}
            </p>
          </div>
        </div>

        {/* Message de rejet */}
        {kycStatus === 'rejected' && profile.kyc_rejected_reason && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Raison du rejet :</strong> {profile.kyc_rejected_reason}
            </AlertDescription>
          </Alert>
        )}

        {/* Documents requis */}
        <div className="border rounded-lg p-4 bg-muted/50">
          <h4 className="font-medium mb-2">Documents requis :</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Pièce d'identité valide (carte d'identité, passeport)</li>
            <li>• Justificatif de domicile récent</li>
            <li>• Document commercial (pour les entreprises)</li>
          </ul>
        </div>

        {/* Upload de documents */}
        {canUploadDocument && (
          <div className="space-y-3">
            <h4 className="font-medium">Soumettre vos documents :</h4>
            <FileUpload
              bucketType="kyc-documents"
              onUploadComplete={handleDocumentUpload}
              maxSizeMB={20}
            >
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
                <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm font-medium">Cliquez pour uploader vos documents</p>
                <p className="text-xs text-muted-foreground mt-1">
                  PDF, JPG, PNG jusqu'à 20MB
                </p>
              </div>
            </FileUpload>
          </div>
        )}

        {/* Document déjà soumis */}
        {profile.kyc_document_url && kycStatus !== 'pending' && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FileText className="w-4 h-4" />
            <span>Document soumis le</span>
            {profile.kyc_verified_at && (
              <span>{new Date(profile.kyc_verified_at).toLocaleDateString('fr-FR')}</span>
            )}
          </div>
        )}

        {/* Actions */}
        {kycStatus === 'approved' && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Félicitations ! Votre compte est maintenant vérifié. Vous avez accès à toutes les fonctionnalités.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};