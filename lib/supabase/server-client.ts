import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export function createClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error('Supabase environment variables are missing.');
  }

  if (!url.startsWith('https://')) {
    throw new Error('SUPABASE_URL must start with https:// to satisfy secure transport requirements.');
  }

  return createSupabaseClient(url, key, {
    global: {
      headers: {
        'X-Client-Info': 'bubblingbathdelights/2.0.0',
      },
    },
  });
}
