import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export function createClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error('Supabase environment variables are missing.');
  }

  return createSupabaseClient(url, key, {
    global: {
      headers: {
        'X-Client-Info': 'bubblingbathdelights/2.0.0',
      },
    },
  });
}
