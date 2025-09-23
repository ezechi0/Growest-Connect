-- Fix security issue: Restrict profile access to authenticated users only
-- Drop the overly permissive policy that allows public access to all profiles
DROP POLICY IF EXISTS "Les profils publics sont visibles par tous" ON public.profiles;

-- Add privacy control column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false;

-- Create index for better performance on privacy queries
CREATE INDEX IF NOT EXISTS idx_profiles_is_public ON public.profiles(is_public);

-- Create more secure RLS policies
-- Policy 1: Users can always see their own profile
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = id);

-- Policy 2: Authenticated users can see public profiles of others
CREATE POLICY "Authenticated users can view public profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (is_public = true AND auth.uid() != id);

-- Policy 3: Allow profile access in project context (for project owners to see entrepreneurs and vice versa)
CREATE POLICY "Project participants can view each other's profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (
  id IN (
    -- Allow seeing profiles of project owners when user is involved in their projects
    SELECT p.owner_id 
    FROM projects p 
    WHERE EXISTS (
      SELECT 1 FROM transactions t 
      WHERE t.project_id = p.id AND t.investor_id = auth.uid()
    )
    UNION
    -- Allow seeing profiles of investors when user owns projects they're investing in
    SELECT t.investor_id 
    FROM transactions t 
    JOIN projects p ON p.id = t.project_id 
    WHERE p.owner_id = auth.uid()
    UNION
    -- Allow seeing profiles in conversations
    SELECT c.investor_id 
    FROM conversations c 
    WHERE c.entrepreneur_id = auth.uid()
    UNION
    SELECT c.entrepreneur_id 
    FROM conversations c 
    WHERE c.investor_id = auth.uid()
  )
);

-- Update existing profiles to be public by default to maintain current functionality
-- Users can change this in their settings if they want privacy
UPDATE public.profiles SET is_public = true WHERE is_public IS NULL;