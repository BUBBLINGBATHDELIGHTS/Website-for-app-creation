import { createClient } from '@supabase/supabase-js';

let supabaseClient;

export function getSupabase() {
  if (!supabaseClient) {
    const url = process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceKey) {
      throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be configured.');
    }

    supabaseClient = createClient(url, serviceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }

  return supabaseClient;
}

export async function getUserFromToken(accessToken) {
  const supabase = getSupabase();
  const { data, error } = await supabase.auth.getUser(accessToken);
  if (error) {
    throw error;
  }
  return data.user;
}
