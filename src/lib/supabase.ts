import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Get Supabase configuration with fallbacks
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

// Client-side Supabase client
export const createClient = () => {
  return createSupabaseClient(supabaseUrl, supabaseAnonKey);
};

// Server-side Supabase client (same as client for now)
export const createServerClient = () => {
  return createSupabaseClient(supabaseUrl, supabaseAnonKey);
};

// Supabase configuration validation
export const validateSupabaseConfig = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error('Missing Supabase configuration. Please check your environment variables.');
  }

  return { url, anonKey };
};

// Database table names - centralized for consistency
export const DB_TABLES = {
  REGIONS: 'regions',
  CLINIC_CODES: 'clinic_codes',
  CLINICS: 'clinics',
  CARDS: 'cards',
  CARD_PERKS: 'card_perks',
  APPOINTMENTS: 'appointments',
  PERK_REDEMPTIONS: 'perk_redemptions',
  USER_PROFILES: 'user_profiles'
} as const;

// Initialize Supabase configuration check
if (typeof window !== 'undefined') {
  // Only validate on client side to avoid build-time errors
  try {
    validateSupabaseConfig();
  } catch (error) {
    console.warn('Supabase configuration warning:', error);
  }
}