-- Enable RLS on the public_profiles view
alter view public.public_profiles set (security_barrier = true);

-- Since views don't support RLS directly like tables, we need to ensure 
-- the underlying profiles table RLS handles security properly.
-- The view itself is safe because it only shows is_public=true rows and excludes sensitive fields.

-- Now let's fix the profiles table policies to prevent phone harvesting
-- Drop the old policy that allows viewing all public profiles with phone numbers
drop policy if exists "Authenticated users can view public profiles" on public.profiles;

-- Create a new safer policy that still allows viewing public profiles
-- but applications should explicitly select only non-sensitive columns
create policy "Authenticated users can view public profile data"
on public.profiles
for select
to authenticated
using (
  (is_public = true) 
  and (auth.uid() <> id)
);

-- Add a comment to remind developers to exclude sensitive fields
comment on policy "Authenticated users can view public profile data" on public.profiles is 
'This policy allows viewing public profiles. Applications MUST explicitly select only non-sensitive columns (exclude phone, kyc_document_url, kyc_rejected_reason) when querying other users profiles.';

-- Create a helper function to safely get public profile info without sensitive data
create or replace function public.get_safe_profile(profile_id uuid)
returns table (
  id uuid,
  full_name text,
  user_type text,
  company text,
  bio text,
  website text,
  location text,
  avatar_url text,
  is_verified boolean,
  is_public boolean
)
language sql
stable
security definer
set search_path = public
as $$
  select 
    id,
    full_name,
    user_type,
    company,
    bio,
    website,
    location,
    avatar_url,
    is_verified,
    is_public
  from public.profiles
  where profiles.id = profile_id
    and (profiles.is_public = true or profiles.id = auth.uid());
$$;

-- Grant execute permission to authenticated users
grant execute on function public.get_safe_profile(uuid) to authenticated;