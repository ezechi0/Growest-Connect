-- Améliorer la table projects avec workflow et champs manquants
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS min_investment numeric DEFAULT 1000,
ADD COLUMN IF NOT EXISTS max_investment numeric,
ADD COLUMN IF NOT EXISTS business_model text,
ADD COLUMN IF NOT EXISTS target_market text,
ADD COLUMN IF NOT EXISTS revenue_model text,
ADD COLUMN IF NOT EXISTS team_size integer,
ADD COLUMN IF NOT EXISTS stage text DEFAULT 'ideation',
ADD COLUMN IF NOT EXISTS risk_level text DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS expected_roi numeric,
ADD COLUMN IF NOT EXISTS submission_date timestamp with time zone DEFAULT now(),
ADD COLUMN IF NOT EXISTS approval_date timestamp with time zone,
ADD COLUMN IF NOT EXISTS launch_date timestamp with time zone,
ADD COLUMN IF NOT EXISTS close_date timestamp with time zone,
ADD COLUMN IF NOT EXISTS admin_notes text,
ADD COLUMN IF NOT EXISTS rejection_reason text;

-- Améliorer les statuts de projet
-- Status possibles: 'draft', 'submitted', 'under_review', 'approved', 'active', 'funded', 'closed', 'rejected'

-- Créer une table pour les intérêts des investisseurs
CREATE TABLE IF NOT EXISTS public.project_interests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  investor_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  interest_level text DEFAULT 'interested' CHECK (interest_level IN ('interested', 'very_interested', 'considering', 'not_interested')),
  investment_amount numeric,
  message text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(project_id, investor_id)
);

-- Enable RLS sur project_interests
ALTER TABLE public.project_interests ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour project_interests
CREATE POLICY "Les investisseurs peuvent exprimer leur intérêt"
ON public.project_interests
FOR INSERT
WITH CHECK (auth.uid() = investor_id);

CREATE POLICY "Les participants voient les intérêts du projet"
ON public.project_interests
FOR SELECT
USING (
  auth.uid() = investor_id OR 
  auth.uid() = (SELECT owner_id FROM public.projects WHERE id = project_id)
);

CREATE POLICY "Les investisseurs peuvent modifier leur intérêt"
ON public.project_interests
FOR UPDATE
USING (auth.uid() = investor_id)
WITH CHECK (auth.uid() = investor_id);

CREATE POLICY "Les investisseurs peuvent supprimer leur intérêt"
ON public.project_interests
FOR DELETE
USING (auth.uid() = investor_id);

-- Trigger pour updated_at sur project_interests
CREATE TRIGGER update_project_interests_updated_at
BEFORE UPDATE ON public.project_interests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Fonction pour calculer les statistiques de projet
CREATE OR REPLACE FUNCTION public.get_project_interest_stats(project_uuid uuid)
RETURNS TABLE(
  total_interests bigint,
  total_potential_investment numeric,
  avg_investment_amount numeric,
  interest_breakdown jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_interests,
    COALESCE(SUM(pi.investment_amount), 0) as total_potential_investment,
    COALESCE(AVG(pi.investment_amount), 0) as avg_investment_amount,
    jsonb_object_agg(pi.interest_level, COUNT(*)) as interest_breakdown
  FROM public.project_interests pi
  WHERE pi.project_id = project_uuid AND pi.status = 'pending'
  GROUP BY pi.project_id;
END;
$$;

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_owner_status ON public.projects(owner_id, status);
CREATE INDEX IF NOT EXISTS idx_project_interests_project ON public.project_interests(project_id);
CREATE INDEX IF NOT EXISTS idx_project_interests_investor ON public.project_interests(investor_id);