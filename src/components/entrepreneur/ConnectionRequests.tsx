import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';
import { Clock, Check, X, MessageSquare, User, Building, Calendar } from 'lucide-react';

interface ConnectionRequest {
  id: string;
  investor_id: string;
  project_id: string;
  status: 'pending' | 'accepted' | 'declined';
  message?: string;
  created_at: string;
  profiles?: {
    full_name: string;
    company?: string;
    avatar_url?: string;
  };
  projects?: {
    title: string;
  };
}

interface ConnectionRequestsProps {
  entrepreneurId?: string;
}

export const ConnectionRequests: React.FC<ConnectionRequestsProps> = ({ entrepreneurId }) => {
  const [requests, setRequests] = useState<ConnectionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<ConnectionRequest | null>(null);
  const [responseMessage, setResponseMessage] = useState('');
  const [responding, setResponding] = useState(false);
  
  const { user } = useUserRole();
  const { toast } = useToast();

  useEffect(() => {
    if (user?.id || entrepreneurId) {
      loadConnectionRequests();
    }
  }, [user, entrepreneurId]);

  const loadConnectionRequests = async () => {
    try {
      const userId = entrepreneurId || user?.id;
      if (!userId) return;

      const { data, error } = await supabase
        .from('connection_requests')
        .select(`
          id,
          investor_id,
          project_id,
          status,
          message,
          created_at
        `)
        .eq('entrepreneur_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Charger les profils et projets séparément
      const requestsWithDetails = await Promise.all((data || []).map(async (request) => {
        const [profileResult, projectResult] = await Promise.all([
          // SECURITY: Only select safe fields, never include phone
          supabase
            .from('profiles')
            .select('full_name, company, avatar_url')
            .eq('id', request.investor_id)
            .single(),
          supabase
            .from('projects')
            .select('title')
            .eq('id', request.project_id)
            .single()
        ]);

        return {
          ...request,
          status: request.status as 'pending' | 'accepted' | 'declined',
          profiles: profileResult.data,
          projects: projectResult.data
        };
      }));
      
      setRequests(requestsWithDetails);
    } catch (error: any) {
      console.error('Error loading connection requests:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les demandes de connexion",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const respondToRequest = async (requestId: string, status: 'accepted' | 'declined', message?: string) => {
    setResponding(true);
    try {
      const { error } = await supabase
        .from('connection_requests')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) throw error;

      // Créer une conversation si accepté
      if (status === 'accepted') {
        const request = requests.find(r => r.id === requestId);
        if (request) {
          const { error: conversationError } = await supabase
            .from('conversations')
            .insert({
              investor_id: request.investor_id,
              entrepreneur_id: user?.id || entrepreneurId,
              project_id: request.project_id
            });

          if (conversationError && conversationError.code !== '23505') {
            console.error('Error creating conversation:', conversationError);
          }
        }
      }

      toast({
        title: status === 'accepted' ? "Demande acceptée" : "Demande déclinée",
        description: status === 'accepted' 
          ? "Une conversation a été créée avec l'investisseur"
          : "L'investisseur a été informé de votre décision"
      });

      await loadConnectionRequests();
      setSelectedRequest(null);
      setResponseMessage('');
    } catch (error: any) {
      console.error('Error responding to request:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de répondre à la demande",
        variant: "destructive"
      });
    } finally {
      setResponding(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'accepted': return 'bg-green-50 text-green-700 border-green-200';
      case 'declined': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'accepted': return 'Acceptée';
      case 'declined': return 'Déclinée';
      default: return status;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2 text-muted-foreground">Chargement des demandes...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const processedRequests = requests.filter(r => r.status !== 'pending');

  return (
    <div className="space-y-6">
      {/* Demandes en attente */}
      {pendingRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-600" />
              Demandes en attente ({pendingRequests.length})
            </CardTitle>
            <CardDescription>
              Nouvelles demandes de connexion d'investisseurs
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingRequests.map((request) => (
              <div key={request.id} className="border rounded-lg p-4 bg-yellow-50 border-yellow-200">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <Avatar>
                      <AvatarImage src={request.profiles?.avatar_url} />
                      <AvatarFallback>
                        {request.profiles?.full_name?.charAt(0) || 'I'}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-900">
                          {request.profiles?.full_name || 'Investisseur'}
                        </h4>
                        <Badge variant="outline" className="text-xs">
                          Investisseur
                        </Badge>
                      </div>
                      
                      {request.profiles?.company && (
                        <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                          <Building className="w-3 h-3" />
                          {request.profiles.company}
                        </div>
                      )}
                      
                      <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                        <Calendar className="w-3 h-3" />
                        Demande reçue le {new Date(request.created_at).toLocaleDateString('fr-FR')}
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">
                        Souhaite se connecter pour le projet: <span className="font-medium">{request.projects?.title}</span>
                      </p>
                      
                      {request.message && (
                        <div className="bg-white p-3 rounded border mt-2">
                          <div className="flex items-center gap-1 text-xs text-gray-600 mb-1">
                            <MessageSquare className="w-3 h-3" />
                            Message personnel:
                          </div>
                          <p className="text-sm">{request.message}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2 mt-4">
                  <Button
                    size="sm"
                    onClick={() => respondToRequest(request.id, 'accepted')}
                    disabled={responding}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Accepter
                  </Button>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedRequest(request)}
                        disabled={responding}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Décliner
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Décliner la demande</DialogTitle>
                        <DialogDescription>
                          Voulez-vous vraiment décliner cette demande de connexion ?
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                          Cette action informera l'investisseur que vous avez décliné sa demande.
                        </p>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm">
                            Annuler
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => respondToRequest(request.id, 'declined')}
                            disabled={responding}
                          >
                            Décliner
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Historique des demandes */}
      {processedRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Historique des demandes ({processedRequests.length})
            </CardTitle>
            <CardDescription>
              Demandes déjà traitées
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {processedRequests.map((request) => (
              <div key={request.id} className="border rounded-lg p-3 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={request.profiles?.avatar_url} />
                      <AvatarFallback className="text-xs">
                        {request.profiles?.full_name?.charAt(0) || 'I'}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">
                          {request.profiles?.full_name || 'Investisseur'}
                        </span>
                        <Badge className={`text-xs border ${getStatusColor(request.status)}`}>
                          {getStatusLabel(request.status)}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {request.projects?.title} • {new Date(request.created_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* État vide */}
      {requests.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium text-lg mb-2">Aucune demande de connexion</h3>
            <p className="text-muted-foreground">
              Les investisseurs intéressés par vos projets pourront vous envoyer des demandes de connexion ici.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};