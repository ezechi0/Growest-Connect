-- Create a sanitized view for public profiles that excludes sensitive fields like phone and KYC details
create or replace view public.public_profiles as
select 
  id,
  full_name,
  user_type,
  company,
  bio,
  website,
  location,
  avatar_url,
  is_verified
from public.profiles
where is_public = true;

-- Ensure the view runs with caller privileges and cannot escalate
alter view public.public_profiles set (security_invoker = true);

-- Grant read access on the view only to authenticated users (not anon)
grant select on public.public_profiles to authenticated;
revoke all on public.public_profiles from anon;

-- Performance: index for frequent filtering by is_public
create index if not exists idx_profiles_is_public_true on public.profiles (id) where is_public = true;