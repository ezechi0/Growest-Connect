import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

export type UserRole = 'entrepreneur' | 'investor' | 'admin';
export type UserType = 'entrepreneur' | 'investor' | 'institutional';

interface UserProfile {
  id: string;
  full_name: string;
  user_type: UserType;
  role: UserRole;
  company?: string;
  kyc_status: 'pending' | 'under_review' | 'approved' | 'rejected';
  kyc_document_url?: string;
  kyc_verified_at?: string;
  kyc_rejected_reason?: string;
  is_verified: boolean;
  avatar_url?: string;
  phone?: string;
  bio?: string;
  website?: string;
  location?: string;
}

export const useUserRole = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
      } else {
        // Type assertion pour s'assurer de la compatibilité
        setProfile(data as UserProfile);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return { error: 'No user logged in' };

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        return { error: error.message };
      }

      setProfile(data as UserProfile);
      return { data };
    } catch (error) {
      return { error: 'Failed to update profile' };
    }
  };

  const isRole = (role: UserRole) => profile?.role === role;
  const isEntrepreneur = () => isRole('entrepreneur');
  const isInvestor = () => isRole('investor');
  const isAdmin = () => isRole('admin');
  const isKycApproved = () => profile?.kyc_status === 'approved';

  return {
    user,
    profile,
    loading,
    updateProfile,
    fetchProfile: () => user ? fetchProfile(user.id) : Promise.resolve(),
    isRole,
    isEntrepreneur,
    isInvestor,
    isAdmin,
    isKycApproved,
    role: profile?.role,
    userType: profile?.user_type,
    kycStatus: profile?.kyc_status
  };
};