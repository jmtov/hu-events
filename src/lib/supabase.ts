import { createClient } from '@supabase/supabase-js';

// Fallback placeholders prevent a crash at module load time when env vars are
// not yet configured locally. Auth calls will fail gracefully until real
// values are added to .env.local.
const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined) ?? 'https://placeholder.supabase.co';
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ?? 'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
