-- Suppression des anciennes policies pour recréer avec meilleure sécurité
-- =====================================================

-- Supprimer les policies existantes sur storage.objects pour kyc-documents
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can view their own KYC documents" ON storage.objects;
  DROP POLICY IF EXISTS "Users can upload their own KYC documents" ON storage.objects;
  DROP POLICY IF EXISTS "Users can update their own KYC documents" ON storage.objects;
  DROP POLICY IF EXISTS "Users can delete their own KYC documents" ON storage.objects;
  DROP POLICY IF EXISTS "Admins can view all KYC documents" ON storage.objects;
  DROP POLICY IF EXISTS "Entrepreneurs can manage their pitch decks" ON storage.objects;
  DROP POLICY IF EXISTS "Investors can view pitch decks of active projects" ON storage.objects;
  DROP POLICY IF EXISTS "Entrepreneurs can manage their project videos" ON storage.objects;
  DROP POLICY IF EXISTS "Investors can view videos of active projects" ON storage.objects;
END $$;

-- 1. RLS Policies STRICTES pour kyc-documents
CREATE POLICY "Users can view their own KYC documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'kyc-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can upload their own KYC documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'kyc-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own KYC documents"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'kyc-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own KYC documents"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'kyc-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Admins can view all KYC documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'kyc-documents' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- 2. RLS Policies pour pitch-decks
CREATE POLICY "Entrepreneurs can manage their pitch decks"
ON storage.objects
FOR ALL
TO authenticated
USING (
  bucket_id = 'pitch-decks' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Investors can view pitch decks of active projects"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'pitch-decks'
  AND EXISTS (
    SELECT 1 FROM projects p
    WHERE p.status = 'active'
    AND p.pitch_deck_url LIKE '%' || name || '%'
  )
);

-- 3. RLS Policies pour project-videos
CREATE POLICY "Entrepreneurs can manage their project videos"
ON storage.objects
FOR ALL
TO authenticated
USING (
  bucket_id = 'project-videos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Investors can view videos of active projects"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'project-videos'
  AND EXISTS (
    SELECT 1 FROM projects p
    WHERE p.status = 'active'
    AND p.video_url LIKE '%' || name || '%'
  )
);

-- 4. Fonction de sécurité pour documents sensibles
CREATE OR REPLACE FUNCTION public.can_access_sensitive_document(
  user_id uuid,
  document_owner_id uuid
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    user_id = document_owner_id 
    OR has_role(user_id, 'admin'::app_role)
$$;