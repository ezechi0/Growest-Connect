-- Créer table pour les demandes de connexion investisseur-fondateur
CREATE TABLE public.connection_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  investor_id UUID NOT NULL,
  entrepreneur_id UUID NOT NULL,
  project_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Contrainte unique pour éviter les doublons
  UNIQUE(investor_id, entrepreneur_id, project_id)
);

-- Activer RLS
ALTER TABLE public.connection_requests ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour connection_requests
CREATE POLICY "Les investisseurs peuvent créer des demandes"
ON public.connection_requests 
FOR INSERT 
WITH CHECK (auth.uid() = investor_id);

CREATE POLICY "Les participants voient leurs demandes"
ON public.connection_requests 
FOR SELECT 
USING (auth.uid() = investor_id OR auth.uid() = entrepreneur_id);

CREATE POLICY "Les entrepreneurs peuvent répondre aux demandes"
ON public.connection_requests 
FOR UPDATE 
USING (auth.uid() = entrepreneur_id)
WITH CHECK (auth.uid() = entrepreneur_id);

-- Trigger pour updated_at
CREATE TRIGGER update_connection_requests_updated_at
BEFORE UPDATE ON public.connection_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Index pour les performances
CREATE INDEX idx_connection_requests_investor ON public.connection_requests(investor_id);
CREATE INDEX idx_connection_requests_entrepreneur ON public.connection_requests(entrepreneur_id);
CREATE INDEX idx_connection_requests_project ON public.connection_requests(project_id);
CREATE INDEX idx_connection_requests_status ON public.connection_requests(status);