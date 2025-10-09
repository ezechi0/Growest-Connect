-- ============================================
-- MIGRATION DE SÉCURITÉ CRITIQUE
-- Séparer les rôles utilisateurs et corriger RLS
-- ============================================

-- 1. Créer l'enum pour les rôles
CREATE TYPE public.app_role AS ENUM ('admin', 'entrepreneur', 'investor');

-- 2. Créer la table user_roles (séparée pour éviter les escalades de privilèges)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, role)
);

-- 3. Activer RLS sur user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4. Créer la fonction de sécurité SECURITY DEFINER (évite la récursion RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- 5. Migrer les rôles existants de profiles vers user_roles
INSERT INTO public.user_roles (user_id, role)
SELECT id, role::app_role
FROM public.profiles
WHERE role IS NOT NULL
ON CONFLICT (user_id, role) DO NOTHING;

-- 6. Politique RLS pour user_roles (les utilisateurs voient leur propre rôle)
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 7. Politique RLS pour user_roles (seuls les admins peuvent modifier)
CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 8. Restreindre subscription_plans (authentifié seulement)
DROP POLICY IF EXISTS "Active subscription plans are viewable by everyone" ON public.subscription_plans;
CREATE POLICY "Authenticated users can view active plans"
ON public.subscription_plans
FOR SELECT
TO authenticated
USING (is_active = true);

-- 9. Restreindre exchange_rates (authentifié seulement)
DROP POLICY IF EXISTS "Taux de change publics" ON public.exchange_rates;
CREATE POLICY "Authenticated users can view exchange rates"
ON public.exchange_rates
FOR SELECT
TO authenticated
USING (true);

-- 10. Politique admin pour subscription_plans
CREATE POLICY "Admins can manage subscription plans v2"
ON public.subscription_plans
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 11. Mettre à jour les politiques admin sur payouts
DROP POLICY IF EXISTS "Admins voient tous les payouts" ON public.payouts;
CREATE POLICY "Admins can manage all payouts"
ON public.payouts
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 12. Mettre à jour les politiques admin sur subscriptions
DROP POLICY IF EXISTS "Admins can view all subscriptions" ON public.subscriptions;
CREATE POLICY "Admins can view all subscriptions v2"
ON public.subscriptions
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR auth.uid() = user_id);

-- 13. S'assurer que la devise par défaut est XOF partout
ALTER TABLE public.transactions ALTER COLUMN currency SET DEFAULT 'XOF';
ALTER TABLE public.subscriptions ALTER COLUMN currency SET DEFAULT 'XOF';
ALTER TABLE public.subscription_plans ALTER COLUMN currency SET DEFAULT 'XOF';

-- 14. Empêcher la modification du propriétaire d'un projet (sécurité)
CREATE POLICY "Project owners cannot be changed"
ON public.projects
FOR UPDATE
TO authenticated
USING (auth.uid() = owner_id)
WITH CHECK (owner_id = (SELECT owner_id FROM public.projects WHERE id = projects.id));

-- 15. Créer une table d'audit pour les actions sensibles
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_data JSONB,
  new_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view audit logs"
ON public.audit_logs
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 16. Fonction pour logger les actions sensibles
CREATE OR REPLACE FUNCTION public.log_audit_action()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.audit_logs (user_id, action, table_name, record_id, old_data, new_data)
  VALUES (
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END
  );
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- 17. Appliquer l'audit sur les tables sensibles
CREATE TRIGGER audit_profiles_changes
AFTER UPDATE OR DELETE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.log_audit_action();

CREATE TRIGGER audit_transactions_changes
AFTER INSERT OR UPDATE OR DELETE ON public.transactions
FOR EACH ROW EXECUTE FUNCTION public.log_audit_action();

CREATE TRIGGER audit_payouts_changes
AFTER INSERT OR UPDATE OR DELETE ON public.payouts
FOR EACH ROW EXECUTE FUNCTION public.log_audit_action();

-- 18. Index pour améliorer les performances des requêtes de rôles
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_role ON public.user_roles(role);
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);