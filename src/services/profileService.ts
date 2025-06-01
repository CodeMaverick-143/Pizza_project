import { supabase } from '../integrations/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '../integrations/supabase/types';

export type Profile = Tables<'profiles'>;
export type ProfileInsert = TablesInsert<'profiles'>;
export type ProfileUpdate = TablesUpdate<'profiles'>;

/**
 * Get a user profile by ID
 */
export const getProfile = async (userId: string) => {
  return await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
};

/**
 * Create a new user profile
 */
export const createProfile = async (profile: ProfileInsert) => {
  return await supabase
    .from('profiles')
    .insert(profile)
    .select()
    .single();
};

/**
 * Update an existing user profile
 */
export const updateProfile = async (userId: string, updates: ProfileUpdate) => {
  return await supabase
    .from('profiles')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)
    .select()
    .single();
};

/**
 * Get or create a user profile (useful after authentication)
 */
export const getOrCreateProfile = async (userId: string, email: string | null) => {
  // Try to get the profile first
  const { data: profile, error } = await getProfile(userId);
  
  // If profile exists, return it
  if (profile && !error) {
    return { data: profile, error: null };
  }
  
  // If profile doesn't exist, create a new one
  return await createProfile({
    id: userId,
    email,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });
};
