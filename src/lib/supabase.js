import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://orktaxeljakxsukygatj.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ya3RheGVsamFreHN1a3lnYXRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyMDc5NTksImV4cCI6MjA2MTc4Mzk1OX0.iG0_2_2m8wNGHSKoC9NtyoLAyrpmXmq4fmxGk4rXRT_hikgUHg';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key is missing. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
