/**
 * Secure Profile Query Helpers
 * 
 * These functions enforce field-level access control for the profiles table.
 * Direct queries to the profiles table should NEVER include sensitive fields
 * like 'phone', 'kyc_document_url', or 'kyc_rejected_reason' when viewing other users.
 * 
 * SECURITY: Always use these helper functions instead of direct Supabase queries
 * to prevent accidental exposure of sensitive user data.
 */

import { supabase } from "@/integrations/supabase/client";

/**
 * Safe profile fields that can be shared with other users
 * NEVER include: phone, kyc_document_url, kyc_rejected_reason
 */
export const SAFE_PROFILE_FIELDS = [
  'id',
  'full_name', 
  'user_type',
  'company',
  'bio',
  'website',
  'location',
  'avatar_url',
  'is_verified',
  'created_at'
] as const;

/**
 * Fields that should ONLY be accessible to the profile owner
 */
export const PRIVATE_PROFILE_FIELDS = [
  'phone',
  'kyc_status',
  'kyc_document_url',
  'kyc_verified_at',
  'kyc_rejected_reason'
] as const;

/**
 * Get safe profile data for display to other users
 * This function explicitly excludes sensitive fields like phone numbers
 */
export async function getSafeProfile(profileId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select(SAFE_PROFILE_FIELDS.join(', '))
    .eq('id', profileId)
    .single();

  return { data, error };
}

/**
 * Get multiple safe profiles (e.g., for project participants)
 * This function explicitly excludes sensitive fields like phone numbers
 */
export async function getSafeProfiles(profileIds: string[]) {
  const { data, error } = await supabase
    .from('profiles')
    .select(SAFE_PROFILE_FIELDS.join(', '))
    .in('id', profileIds);

  return { data, error };
}

/**
 * Get own profile with all fields (including private ones)
 * This should ONLY be called with the current user's ID
 */
export async function getOwnProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  return { data, error };
}

/**
 * String to use in Supabase select for profile relations
 * Use this when joining profiles via foreign keys
 * 
 * Example:
 * .select(`*, ${SAFE_PROFILE_SELECT_STRING}`)
 */
export const SAFE_PROFILE_SELECT_STRING = `
  full_name,
  user_type,
  company,
  bio,
  website,
  location,
  avatar_url,
  is_verified
`.trim().split('\n').map(s => s.trim()).join(', ');

/**
 * Get public profiles view (for is_public = true profiles only)
 * This is the safest way to access publicly available profiles
 */
export async function getPublicProfiles() {
  const { data, error } = await supabase
    .from('public_profiles')
    .select('*');

  return { data, error };
}
