-- Phase 1: Initialisation - Configuration des bases de données et stockage

-- 1. Ajout de la colonne role dans la table profiles pour gérer les rôles utilisateurs
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'entrepreneur' CHECK (role IN ('entrepreneur', 'investor', 'admin'));

-- 2. Création de la table subscriptions pour gérer les abonnements Premium
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('free', 'premium_start', 'premium_capital', 'pro_plus')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'trial', 'expired', 'cancelled')),
  start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  end_date TIMESTAMP WITH TIME ZONE,
  paystack_subscription_code TEXT,
  paystack_customer_code TEXT,
  amount NUMERIC,
  currency TEXT DEFAULT 'XOF',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. Ajout de colonnes KYC dans la table profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS kyc_status TEXT DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'under_review', 'approved', 'rejected')),
ADD COLUMN IF NOT EXISTS kyc_document_url TEXT,
ADD COLUMN IF NOT EXISTS kyc_verified_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS kyc_rejected_reason TEXT;

-- 4. Configuration du stockage cloud - Création des buckets
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('pitch-decks', 'pitch-decks', false),
  ('project-images', 'project-images', true),
  ('project-videos', 'project-videos', false),
  ('kyc-documents', 'kyc-documents', false),
  ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 5. RLS pour la table subscriptions
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscriptions" 
ON public.subscriptions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own subscriptions" 
ON public.subscriptions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions" 
ON public.subscriptions 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Admins peuvent voir toutes les subscriptions
CREATE POLICY "Admins can view all subscriptions" 
ON public.subscriptions 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 6. Politiques de stockage pour les buckets

-- Pitch decks: seuls les propriétaires et admins peuvent accéder
CREATE POLICY "Users can upload their pitch decks" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'pitch-decks' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own pitch decks" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'pitch-decks' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Images de projets: publiques pour affichage
CREATE POLICY "Project images are publicly viewable" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'project-images');

CREATE POLICY "Authenticated users can upload project images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'project-images' AND 
  auth.role() = 'authenticated'
);

-- Vidéos de projets: accès contrôlé
CREATE POLICY "Users can upload project videos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'project-videos' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Authenticated users can view project videos" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'project-videos' AND 
  auth.role() = 'authenticated'
);

-- Documents KYC: très sécurisés
CREATE POLICY "Users can upload their KYC documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'kyc-documents' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own KYC documents" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'kyc-documents' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Admins peuvent voir tous les documents KYC
CREATE POLICY "Admins can view all KYC documents" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'kyc-documents' AND 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Avatars: publics
CREATE POLICY "Avatars are publicly viewable" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated users can upload avatars" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'avatars' AND 
  auth.role() = 'authenticated'
);

-- 7. Trigger pour updated_at sur subscriptions
CREATE TRIGGER update_subscriptions_updated_at
BEFORE UPDATE ON public.subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 8. Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_kyc_status ON public.profiles(kyc_status);