-- Create subscription plans table to store plan information
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'NGN',
  interval_type TEXT NOT NULL DEFAULT 'monthly',
  features JSONB DEFAULT '[]'::jsonb,
  target_role TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on subscription_plans
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

-- Create policy to allow everyone to read active plans
CREATE POLICY "Active subscription plans are viewable by everyone"
ON public.subscription_plans
FOR SELECT
USING (is_active = true);

-- Create policy for admin management
CREATE POLICY "Admins can manage subscription plans"
ON public.subscription_plans
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Insert the premium plans
INSERT INTO public.subscription_plans (plan_id, name, description, price, target_role, features) VALUES
('start', 'Premium Start', 'Pour Fondateurs - Boostez votre visibilité', 25000, 'entrepreneur', 
 '["Visibilité renforcée des projets", "Accès complet aux profils investisseurs", "Matching IA avancé", "Statistiques détaillées", "Support prioritaire", "Badge Premium Start", "Notifications en temps réel", "Messagerie illimitée"]'::jsonb),
('capital', 'Premium Capital', 'Pour Investisseurs - Découvrez les meilleures opportunités', 35000, 'investor',
 '["Accès anticipé aux nouveaux projets", "Filtres avancés et alertes personnalisées", "Rapports de due diligence détaillés", "Portfolio tracking avancé", "Connexion directe avec fondateurs", "Badge Premium Capital", "Analytics investissement", "Support dédié", "Accès aux pitch rooms exclusives"]'::jsonb),
('pro_plus', 'Pro+', 'Pour Corporates - Solution complète pour institutions', 99000, 'admin',
 '["Toutes les fonctionnalités Premium", "Tableau de bord personnalisé", "API access complet", "White-label options", "Rapports institutionnels", "Gestionnaire de compte dédié", "Intégrations sur mesure", "KYC institutionnel avancé", "Multi-utilisateurs (jusquà 10)", "Support 24/7", "Formation équipe", "Conformité réglementaire"]'::jsonb)
ON CONFLICT (plan_id) DO UPDATE SET
name = EXCLUDED.name,
description = EXCLUDED.description,
price = EXCLUDED.price,
features = EXCLUDED.features,
updated_at = now();

-- Add trigger for updating timestamps
CREATE TRIGGER update_subscription_plans_updated_at
    BEFORE UPDATE ON public.subscription_plans
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();