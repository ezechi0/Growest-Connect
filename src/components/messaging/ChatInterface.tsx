import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';
import { 
  Send, 
  Paperclip, 
  Download, 
  FileText, 
  Image as ImageIcon, 
  X,
  MessageCircle,
  Phone,
  Video,
  MoreVertical
} from 'lucide-react';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  conversation_id: string;
  created_at: string;
  is_read: boolean;
  attachment_url?: string;
  attachment_name?: string;
  attachment_type?: string;
  attachment_size?: number;
  profiles?: {
    full_name: string;
    avatar_url?: string;
  };
}

interface Conversation {
  id: string;
  investor_id: string;
  entrepreneur_id: string;
  project_id: string;
  last_message_at: string;
  projects?: {
    title: string;
  };
  investor_profile?: {
    full_name: string;
    avatar_url?: string;
    company?: string;
  };
  entrepreneur_profile?: {
    full_name: string;
    avatar_url?: string;
    company?: string;
  };
}

interface ChatInterfaceProps {
  userId?: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ userId }) => {
  const { user } = useUserRole();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentUserId = userId || user?.id;

  useEffect(() => {
    if (currentUserId) {
      loadConversations();
      subscribeToConversations();
    }
  }, [currentUserId]);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages();
      subscribeToMessages();
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async () => {
    if (!currentUserId) return;

    try {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          projects!conversations_project_id_fkey (title),
          investor_profile:profiles!conversations_investor_id_fkey (full_name, avatar_url, company),
          entrepreneur_profile:profiles!conversations_entrepreneur_id_fkey (full_name, avatar_url, company)
        `)
        .or(`investor_id.eq.${currentUserId},entrepreneur_id.eq.${currentUserId}`)
        .order('last_message_at', { ascending: false });

      if (error) throw error;
      setConversations(data || []);
    } catch (error: any) {
      console.error('Error loading conversations:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les conversations",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async () => {
    if (!selectedConversation) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          profiles:sender_id (full_name, avatar_url)
        `)
        .eq('conversation_id', selectedConversation)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);

      // Marquer les messages comme lus
      await markMessagesAsRead();
    } catch (error: any) {
      console.error('Error loading messages:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les messages",
        variant: "destructive"
      });
    }
  };

  const markMessagesAsRead = async () => {
    if (!selectedConversation || !currentUserId) return;

    try {
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('conversation_id', selectedConversation)
        .neq('sender_id', currentUserId)
        .eq('is_read', false);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const subscribeToConversations = () => {
    if (!currentUserId) return;

    const channel = supabase
      .channel('conversations-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'conversations',
          filter: `or(investor_id.eq.${currentUserId},entrepreneur_id.eq.${currentUserId})`
        },
        () => {
          loadConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const subscribeToMessages = () => {
    if (!selectedConversation) return;

    const channel = supabase
      .channel('messages-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${selectedConversation}`
        },
        (payload) => {
          loadMessages(); // Recharger tous les messages pour avoir les profils
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const uploadAttachment = async (file: File): Promise<{ url: string; name: string; type: string; size: number } | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `chat-attachments/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('project-images') // Utiliser un bucket existant
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('project-images')
        .getPublicUrl(filePath);

      return {
        url: publicUrl,
        name: file.name,
        type: file.type,
        size: file.size
      };
    } catch (error) {
      console.error('Error uploading attachment:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'uploader le fichier",
        variant: "destructive"
      });
      return null;
    }
  };

  const sendMessage = async () => {
    if ((!newMessage.trim() && !attachmentFile) || !selectedConversation || !currentUserId) return;

    setIsSending(true);
    try {
      let attachmentData = null;

      // Upload de la pièce jointe si présente
      if (attachmentFile) {
        attachmentData = await uploadAttachment(attachmentFile);
        if (!attachmentData) {
          setIsSending(false);
          return;
        }
      }

      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: selectedConversation,
          sender_id: currentUserId,
          content: newMessage.trim() || (attachmentData ? `Pièce jointe: ${attachmentData.name}` : ''),
          attachment_url: attachmentData?.url,
          attachment_name: attachmentData?.name,
          attachment_type: attachmentData?.type,
          attachment_size: attachmentData?.size
        });

      if (error) throw error;

      // Mettre à jour la conversation
      await supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', selectedConversation);

      // Créer une notification pour le destinataire
      const conversation = conversations.find(c => c.id === selectedConversation);
      if (conversation) {
        const recipientId = conversation.investor_id === currentUserId 
          ? conversation.entrepreneur_id 
          : conversation.investor_id;

        await supabase
          .from('notifications')
          .insert({
            user_id: recipientId,
            type: 'new_message',
            title: '💬 Nouveau message',
            message: attachmentData 
              ? `Nouvelle pièce jointe reçue` 
              : newMessage.length > 50 
                ? `${newMessage.substring(0, 50)}...`
                : newMessage,
            data: {
              conversation_id: selectedConversation,
              sender_name: user?.email || 'Utilisateur'
            }
          });
      }

      setNewMessage('');
      setAttachmentFile(null);
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Vérifier la taille (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Fichier trop volumineux",
          description: "La taille maximale est de 10MB",
          variant: "destructive"
        });
        return;
      }
      setAttachmentFile(file);
    }
  };

  const getOtherUserInfo = (conversation: Conversation) => {
    const isInvestor = conversation.investor_id === currentUserId;
    if (isInvestor) {
      return {
        name: conversation.entrepreneur_profile?.full_name || 'Entrepreneur',
        avatar: conversation.entrepreneur_profile?.avatar_url,
        company: conversation.entrepreneur_profile?.company,
        role: 'Entrepreneur'
      };
    } else {
      return {
        name: conversation.investor_profile?.full_name || 'Investisseur',
        avatar: conversation.investor_profile?.avatar_url,
        company: conversation.investor_profile?.company,
        role: 'Investisseur'
      };
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon className="w-4 h-4" />;
    return <FileText className="w-4 h-4" />;
  };

  if (isLoading) {
    return (
      <Card className="h-[600px] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement des conversations...</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="flex h-[600px] border rounded-lg overflow-hidden">
      {/* Liste des conversations */}
      <div className="w-1/3 border-r bg-muted/20">
        <div className="p-4 border-b">
          <h3 className="font-semibold flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Conversations
          </h3>
        </div>
        <ScrollArea className="h-[540px]">
          {conversations.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Aucune conversation</p>
            </div>
          ) : (
            conversations.map((conversation) => {
              const otherUser = getOtherUserInfo(conversation);
              return (
                <div
                  key={conversation.id}
                  className={`p-3 cursor-pointer hover:bg-muted/40 border-b transition-colors ${
                    selectedConversation === conversation.id ? 'bg-primary/10 border-primary/20' : ''
                  }`}
                  onClick={() => setSelectedConversation(conversation.id)}
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={otherUser.avatar} />
                      <AvatarFallback>
                        {otherUser.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm truncate">
                          {otherUser.name}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {otherUser.role}
                        </Badge>
                      </div>
                      {otherUser.company && (
                        <p className="text-xs text-muted-foreground truncate">
                          {otherUser.company}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground truncate mt-1">
                        Projet: {conversation.projects?.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(conversation.last_message_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </ScrollArea>
      </div>

      {/* Interface de chat */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Header du chat */}
            <div className="p-4 border-b bg-muted/10">
              {(() => {
                const conversation = conversations.find(c => c.id === selectedConversation);
                const otherUser = conversation ? getOtherUserInfo(conversation) : null;
                
                return otherUser ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={otherUser.avatar} />
                        <AvatarFallback>
                          {otherUser.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{otherUser.name}</span>
                          <Badge variant="secondary">{otherUser.role}</Badge>
                        </div>
                        {otherUser.company && (
                          <p className="text-sm text-muted-foreground">{otherUser.company}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Phone className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Video className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ) : null;
              })()}
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => {
                  const isOwn = message.sender_id === currentUserId;
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[70%] ${isOwn ? 'order-2' : 'order-1'}`}>
                        <div
                          className={`p-3 rounded-lg ${
                            isOwn
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          {message.content && (
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          )}
                          
                          {message.attachment_url && (
                            <div className="mt-2 p-2 rounded border bg-background/10">
                              <div className="flex items-center gap-2">
                                {getFileIcon(message.attachment_type || '')}
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium truncate">
                                    {message.attachment_name}
                                  </p>
                                  <p className="text-xs opacity-70">
                                    {formatFileSize(message.attachment_size || 0)}
                                  </p>
                                </div>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => window.open(message.attachment_url, '_blank')}
                                >
                                  <Download className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className={`flex items-center gap-2 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                          {!isOwn && (
                            <Avatar className="w-6 h-6">
                              <AvatarImage src={message.profiles?.avatar_url} />
                              <AvatarFallback className="text-xs">
                                {message.profiles?.full_name?.charAt(0) || 'U'}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {new Date(message.created_at).toLocaleTimeString('fr-FR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Zone de saisie */}
            <div className="p-4 border-t">
              {attachmentFile && (
                <div className="mb-2 p-2 bg-muted rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getFileIcon(attachmentFile.type)}
                    <div>
                      <p className="text-sm font-medium">{attachmentFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(attachmentFile.size)}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setAttachmentFile(null)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
              
              <div className="flex gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleFileSelect}
                  accept="image/*,.pdf,.doc,.docx,.txt"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isSending}
                >
                  <Paperclip className="w-4 h-4" />
                </Button>
                <Input
                  placeholder="Tapez votre message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  disabled={isSending}
                  className="flex-1"
                />
                <Button onClick={sendMessage} disabled={isSending || (!newMessage.trim() && !attachmentFile)}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Sélectionnez une conversation</p>
              <p className="text-sm">Choisissez une conversation pour commencer à échanger</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};