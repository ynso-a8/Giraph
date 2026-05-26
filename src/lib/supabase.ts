import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const isUrlValid = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch (_) {
    return false;
  }
};

const hasCredentials =
  !!supabaseUrl &&
  supabaseUrl !== 'your_supabase_project_url' &&
  !!supabaseAnonKey &&
  supabaseAnonKey !== 'your_supabase_anon_key' &&
  isUrlValid(supabaseUrl);

if (!hasCredentials) {
  console.warn(
    'Supabase URL or Anon Key is missing or invalid. App will run in local storage fallback mode.'
  );
}

export const supabase = hasCredentials
  ? createClient(supabaseUrl, supabaseAnonKey)
  : (null as any);
