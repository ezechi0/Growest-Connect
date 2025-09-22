-- Création des tables manquantes pour Invest Connect (avec vérification d'existence)

-- Vérifier et créer les tables manquantes
DO $$ 
BEGIN
  -- 1. Table des projets (si elle n'existe pas)
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'projects') THEN
    CREATE TABLE public.projects (
      id UUID NOT NULL DEFAULT gen_random_uuid(),
      owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      sector TEXT NOT NULL,
      location TEXT NOT NULL,
      funding_goal DECIMAL(12,2) NOT NULL,
      current_funding DECIMAL(12,2) DEFAULT 0,
      status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'funded', 'closed')),
      pitch_deck_url TEXT,
      video_url TEXT,
      images JSONB DEFAULT '[]',
      documents JSONB DEFAULT '[]',
      tags TEXT[] DEFAULT '{}',
      start_date DATE,
      end_date DATE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      PRIMARY KEY (id)
    );
    
    ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
    CREATE INDEX idx_projects_owner_id ON public.projects(owner_id);
    CREATE INDEX idx_projects_status ON public.projects(status);
    CREATE INDEX idx_projects_sector ON public.projects(sector);
  END IF;

  -- 2. Table des transactions (si elle n'existe pas)
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'transactions') THEN
    CREATE TABLE public.transactions (
      id UUID NOT NULL DEFAULT gen_random_uuid(),
      project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
      investor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
      amount DECIMAL(10,2) NOT NULL,
      transaction_type TEXT DEFAULT 'investment' CHECK (transaction_type IN ('investment', 'donation')),
      status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
      payment_method TEXT,
      paystack_reference TEXT,
      notes TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      PRIMARY KEY (id)
    );
    
    ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
    CREATE INDEX idx_transactions_project_id ON public.transactions(project_id);
    CREATE INDEX idx_transactions_investor_id ON public.transactions(investor_id);
  END IF;

  -- 3. Table des projets favoris (si elle n'existe pas)
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'project_favorites') THEN
    CREATE TABLE public.project_favorites (
      id UUID NOT NULL DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
      project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      PRIMARY KEY (id),
      UNIQUE(user_id, project_id)
    );
    
    ALTER TABLE public.project_favorites ENABLE ROW LEVEL SECURITY;
  END IF;

  -- 4. Table des conversations (si elle n'existe pas)
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'conversations') THEN
    CREATE TABLE public.conversations (
      id UUID NOT NULL DEFAULT gen_random_uuid(),
      project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
      investor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
      entrepreneur_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
      last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      PRIMARY KEY (id),
      UNIQUE(project_id, investor_id)
    );
    
    ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
  END IF;

  -- 5. Table des messages (si elle n'existe pas)
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'messages') THEN
    CREATE TABLE public.messages (
      id UUID NOT NULL DEFAULT gen_random_uuid(),
      conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
      sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      is_read BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      PRIMARY KEY (id)
    );
    
    ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
    CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id);
    CREATE INDEX idx_messages_created_at ON public.messages(created_at);
  END IF;
END $$;

-- Création des fonctions et triggers nécessaires
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Triggers pour updated_at
DROP TRIGGER IF EXISTS update_projects_updated_at ON public.projects;
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_transactions_updated_at ON public.transactions;  
CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Politiques RLS pour les projets
DROP POLICY IF EXISTS "Tous les projets actifs sont visibles" ON public.projects;
CREATE POLICY "Tous les projets actifs sont visibles" ON public.projects
  FOR SELECT USING (status = 'active' OR owner_id = auth.uid());

DROP POLICY IF EXISTS "Les utilisateurs peuvent créer leurs projets" ON public.projects;
CREATE POLICY "Les utilisateurs peuvent créer leurs projets" ON public.projects
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Les propriétaires peuvent modifier leurs projets" ON public.projects;
CREATE POLICY "Les propriétaires peuvent modifier leurs projets" ON public.projects
  FOR UPDATE USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Les propriétaires peuvent supprimer leurs projets" ON public.projects;
CREATE POLICY "Les propriétaires peuvent supprimer leurs projets" ON public.projects
  FOR DELETE USING (auth.uid() = owner_id);

-- Politiques RLS pour les transactions
DROP POLICY IF EXISTS "Les utilisateurs voient leurs propres transactions" ON public.transactions;
CREATE POLICY "Les utilisateurs voient leurs propres transactions" ON public.transactions
  FOR SELECT USING (
    auth.uid() = investor_id OR 
    auth.uid() = (SELECT owner_id FROM public.projects WHERE id = project_id)
  );

DROP POLICY IF EXISTS "Les utilisateurs peuvent créer des transactions" ON public.transactions;
CREATE POLICY "Les utilisateurs peuvent créer des transactions" ON public.transactions
  FOR INSERT WITH CHECK (auth.uid() = investor_id);

-- Politiques RLS pour les favoris
DROP POLICY IF EXISTS "Les utilisateurs voient leurs propres favoris" ON public.project_favorites;
CREATE POLICY "Les utilisateurs voient leurs propres favoris" ON public.project_favorites
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Les utilisateurs peuvent gérer leurs favoris" ON public.project_favorites;
CREATE POLICY "Les utilisateurs peuvent gérer leurs favoris" ON public.project_favorites
  FOR ALL USING (auth.uid() = user_id);

-- Politiques RLS pour les conversations
DROP POLICY IF EXISTS "Les participants voient leurs conversations" ON public.conversations;
CREATE POLICY "Les participants voient leurs conversations" ON public.conversations
  FOR SELECT USING (
    auth.uid() = investor_id OR 
    auth.uid() = entrepreneur_id
  );

DROP POLICY IF EXISTS "Les investisseurs peuvent créer des conversations" ON public.conversations;
CREATE POLICY "Les investisseurs peuvent créer des conversations" ON public.conversations
  FOR INSERT WITH CHECK (auth.uid() = investor_id);

-- Politiques RLS pour les messages
DROP POLICY IF EXISTS "Les participants voient les messages de leurs conversations" ON public.messages;
CREATE POLICY "Les participants voient les messages de leurs conversations" ON public.messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.conversations 
      WHERE id = conversation_id 
      AND (investor_id = auth.uid() OR entrepreneur_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Les participants peuvent envoyer des messages" ON public.messages;
CREATE POLICY "Les participants peuvent envoyer des messages" ON public.messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.conversations 
      WHERE id = conversation_id 
      AND (investor_id = auth.uid() OR entrepreneur_id = auth.uid())
    )
    AND auth.uid() = sender_id
  );

-- Fonction utile pour les statistiques des projets
CREATE OR REPLACE FUNCTION public.get_project_stats(project_uuid UUID)
RETURNS TABLE(
  total_investors BIGINT,
  funding_percentage NUMERIC
) 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(DISTINCT t.investor_id) as total_investors,
    CASE 
      WHEN p.funding_goal > 0 THEN ROUND((p.current_funding / p.funding_goal) * 100, 2)
      ELSE 0 
    END as funding_percentage
  FROM public.projects p
  LEFT JOIN public.transactions t ON p.id = t.project_id AND t.status = 'completed'
  WHERE p.id = project_uuid
  GROUP BY p.id, p.current_funding, p.funding_goal;
END;
$$;