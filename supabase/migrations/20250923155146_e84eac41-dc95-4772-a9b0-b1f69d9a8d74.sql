-- Améliorer la table messages pour support des pièces jointes
ALTER TABLE public.messages 
ADD COLUMN attachment_url TEXT,
ADD COLUMN attachment_name TEXT,
ADD COLUMN attachment_type TEXT,
ADD COLUMN attachment_size INTEGER;

-- Créer table pour les notifications
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('new_match', 'new_message', 'connection_request', 'project_interest', 'system')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activer RLS sur notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour notifications
CREATE POLICY "Les utilisateurs voient leurs notifications"
ON public.notifications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent marquer leurs notifications comme lues"
ON public.notifications 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Créer table pour les matches IA
CREATE TABLE public.ai_matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  target_id UUID NOT NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('project', 'profile')),
  match_score NUMERIC NOT NULL DEFAULT 0,
  match_reasons JSONB NOT NULL DEFAULT '[]'::jsonb,
  preferences_used JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Contrainte unique pour éviter les doublons
  UNIQUE(user_id, target_id, target_type)
);

-- Activer RLS sur ai_matches
ALTER TABLE public.ai_matches ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour ai_matches
CREATE POLICY "Les utilisateurs voient leurs matches"
ON public.ai_matches 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Système peut créer des matches"
ON public.ai_matches 
FOR INSERT 
WITH CHECK (true); -- Permet à l'edge function de créer des matches

-- Trigger pour updated_at sur notifications
CREATE TRIGGER update_notifications_updated_at
BEFORE UPDATE ON public.notifications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Index pour les performances
CREATE INDEX idx_notifications_user_unread ON public.notifications(user_id, read, created_at);
CREATE INDEX idx_ai_matches_user ON public.ai_matches(user_id, created_at);
CREATE INDEX idx_messages_conversation ON public.messages(conversation_id, created_at);

-- Permettre les updates sur messages pour read status
DROP POLICY IF EXISTS "Les participants peuvent envoyer des messages" ON public.messages;

CREATE POLICY "Les participants peuvent envoyer des messages"
ON public.messages 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM conversations
    WHERE conversations.id = messages.conversation_id 
    AND (conversations.investor_id = auth.uid() OR conversations.entrepreneur_id = auth.uid())
  ) 
  AND auth.uid() = sender_id
);

CREATE POLICY "Les participants peuvent marquer les messages comme lus"
ON public.messages 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1
    FROM conversations
    WHERE conversations.id = messages.conversation_id 
    AND (conversations.investor_id = auth.uid() OR conversations.entrepreneur_id = auth.uid())
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM conversations
    WHERE conversations.id = messages.conversation_id 
    AND (conversations.investor_id = auth.uid() OR conversations.entrepreneur_id = auth.uid())
  )
);