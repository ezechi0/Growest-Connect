import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { RoleBasedAccess } from '../RoleBasedAccess';
import { PayoutManagement } from './PayoutManagement';
import { DataSeeder } from '@/components/admin/DataSeeder';
import { UsageMonitoring } from '@/components/analytics/UsageMonitoring';
import { ProductionChecklist } from '@/components/deployment/ProductionChecklist';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Users, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock,
  Eye,
  TrendingUp,
  Activity,
  DollarSign,
  Building,
  CreditCard
} from 'lucide-react';

interface PendingKyc {
  id: string;
  full_name: string;
  user_type: string;
  company?: string;
  kyc_status: string;
  kyc_document_url?: string;
  created_at: string;
}

interface AdminStats {
  totalUsers: number;
  pendingKyc: number;
  approvedKyc: number;
  activeProjects: number;
  totalInvestments: number;
}

export const AdminDashboard: React.FC = () => {
  const [pendingKycList, setPendingKycList] = useState<PendingKyc[]>([]);
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    pendingKyc: 0,
    approvedKyc: 0,
    activeProjects: 0,
    totalInvestments: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<PendingKyc | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      // Récupérer les KYC en attente
      const { data: kycData, error: kycError } = await supabase
        .from('profiles')
        .select('id, full_name, user_type, company, kyc_status, kyc_document_url, created_at')
        .in('kyc_status', ['pending', 'under_review']);

      if (kycError) throw kycError;

      // Récupérer les statistiques
      const { data: usersData } = await supabase
        .from('profiles')
        .select('kyc_status', { count: 'exact' });

      const { data: projectsData } = await supabase
        .from('projects')
        .select('id', { count: 'exact' })
        .eq('status', 'active');

      const { data: transactionsData } = await supabase
        .from('transactions')
        .select('amount', { count: 'exact' })
        .eq('status', 'completed');

      setPendingKycList(kycData || []);
      setStats({
        totalUsers: usersData?.length || 0,
        pendingKyc: usersData?.filter(u => u.kyc_status === 'pending' || u.kyc_status === 'under_review').length || 0,
        approvedKyc: usersData?.filter(u => u.kyc_status === 'approved').length || 0,
        activeProjects: projectsData?.length || 0,
        totalInvestments: transactionsData?.length || 0
      });

    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données administrateur",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKycDecision = async (userId: string, decision: 'approved' | 'rejected', reason?: string) => {
    try {
      const updates: any = {
        kyc_status: decision,
        kyc_verified_at: decision === 'approved' ? new Date().toISOString() : null
      };

      if (decision === 'rejected' && reason) {
        updates.kyc_rejected_reason = reason;
      }

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Décision enregistrée",
        description: `KYC ${decision === 'approved' ? 'approuvé' : 'rejeté'} avec succès`,
      });

      // Refresh data
      fetchAdminData();
      setSelectedUser(null);
      setRejectionReason('');

    } catch (error) {
      console.error('Error updating KYC status:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut KYC",
        variant: "destructive"
      });
    }
  };

  const openDocument = (url: string) => {
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <RoleBasedAccess allowedRoles={['admin']}>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Administration Growest Connect</h1>
            <p className="text-muted-foreground">Gestion complète de la plateforme</p>
          </div>
          <Badge variant="secondary">
            <Activity className="w-4 h-4 mr-1" />
            Administrateur
          </Badge>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="data">Données Test</TabsTrigger>
            <TabsTrigger value="deployment">Déploiement</TabsTrigger>
            <TabsTrigger value="management">Gestion</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            {/* Statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Utilisateurs totaux</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalUsers}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">KYC en attente</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">{stats.pendingKyc}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">KYC approuvés</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{stats.approvedKyc}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Projets actifs</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.activeProjects}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Investissements</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalInvestments}</div>
                </CardContent>
              </Card>
            </div>

            {/* Actions rapides */}
            <Card>
              <CardHeader>
                <CardTitle>Actions Rapides</CardTitle>
                <CardDescription>Accès rapide aux fonctions principales</CardDescription>
              </CardHeader>
              <CardContent className="grid md:grid-cols-3 gap-4">
                <Button className="h-20 flex flex-col gap-2">
                  <FileText className="h-6 w-6" />
                  <span>Charger Données Test</span>
                </Button>
                <Button className="h-20 flex flex-col gap-2" variant="outline">
                  <TrendingUp className="h-6 w-6" />
                  <span>Voir Analytics</span>
                </Button>
                <Button className="h-20 flex flex-col gap-2" variant="outline">
                  <CheckCircle className="h-6 w-6" />
                  <span>Checklist Déploiement</span>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <UsageMonitoring />
          </TabsContent>

          <TabsContent value="data">
            <DataSeeder />
          </TabsContent>

          <TabsContent value="deployment">
            <ProductionChecklist />
          </TabsContent>

          <TabsContent value="management">
            <Tabs defaultValue="kyc" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="kyc">Validation KYC</TabsTrigger>
                <TabsTrigger value="projects">Projets</TabsTrigger>
                <TabsTrigger value="payments">Paiements</TabsTrigger>
                <TabsTrigger value="payouts">Versements</TabsTrigger>
              </TabsList>

              <TabsContent value="kyc" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Validation KYC en attente
                    </CardTitle>
                    <CardDescription>
                      Examinez et validez les demandes de vérification d'identité
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {pendingKycList.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">
                        Aucune demande KYC en attente
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {pendingKycList.map((user) => (
                          <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex-1">
                              <div className="flex items-center gap-3">
                                <div>
                                  <h4 className="font-medium">{user.full_name}</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {user.user_type} {user.company && `• ${user.company}`}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    Soumis le {new Date(user.created_at).toLocaleDateString('fr-FR')}
                                  </p>
                                </div>
                                <Badge variant="outline" className="ml-auto">
                                  {user.kyc_status === 'pending' ? 'En attente' : 'En révision'}
                                </Badge>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {user.kyc_document_url && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openDocument(user.kyc_document_url!)}
                                >
                                  <Eye className="w-4 h-4 mr-1" />
                                  Voir documents
                                </Button>
                              )}
                              <Button
                                size="sm"
                                onClick={() => handleKycDecision(user.id, 'approved')}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Approuver
                              </Button>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => setSelectedUser(user)}
                                  >
                                    <XCircle className="w-4 w-4 mr-1" />
                                    Rejeter
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Rejeter la demande KYC</DialogTitle>
                                    <DialogDescription>
                                      Pourquoi rejetez-vous la demande de {user.full_name} ?
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <Textarea
                                      placeholder="Raison du rejet..."
                                      value={rejectionReason}
                                      onChange={(e) => setRejectionReason(e.target.value)}
                                    />
                                    <div className="flex justify-end gap-2">
                                      <Button variant="outline" onClick={() => setSelectedUser(null)}>
                                        Annuler
                                      </Button>
                                      <Button
                                        variant="destructive"
                                        onClick={() => handleKycDecision(user.id, 'rejected', rejectionReason)}
                                        disabled={!rejectionReason.trim()}
                                      >
                                        Confirmer le rejet
                                      </Button>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="projects" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building className="w-5 h-5" />
                      Validation des Projets
                    </CardTitle>
                    <CardDescription>
                      Examinez et validez les nouveaux projets soumis
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-center py-8">
                      Module de validation des projets en cours de développement
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="payments" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5" />
                      Suivi des Paiements
                    </CardTitle>
                    <CardDescription>
                      Surveillez les transactions et résolvez les litiges
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-center py-8">
                      Module de suivi des paiements en cours de développement
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="payouts" className="space-y-6">
                <PayoutManagement />
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      </div>
    </RoleBasedAccess>
  );
};