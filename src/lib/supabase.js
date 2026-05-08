import { createClient } from '@supabase/supabase-js';

// Hardcoding the non-secret anon key and URL here because Netlify build 
// does not have access to the local .env file.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://orktaxeljakxsukygatj.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ya3RheGVsamFreHN1a3lnYXRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxNjkwNTYsImV4cCI6MjA5Mjc0NTA1Nn0.m8wNGHSKoC9NtyoLAyrpmXmq4fmxGk4rXRT_hikgUHg';

export const supabase = createClient(supabaseUrl, supabaseKey);
