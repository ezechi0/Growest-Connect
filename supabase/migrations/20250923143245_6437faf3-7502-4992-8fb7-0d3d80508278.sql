-- Fix profile visibility issue: Set existing profiles to public by default
-- This ensures the app continues to work normally while users can still control their privacy
UPDATE public.profiles 
SET is_public = true 
WHERE is_public = false OR is_public IS NULL;

-- Add a comment to document this change
COMMENT ON COLUMN public.profiles.is_public IS 'Controls profile visibility. True = visible to other authenticated users, False = only visible to user and in project contexts';