'use client';

import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  // Initialize Supabase client for browser-side use
  return createPagesBrowserClient({
    supabaseUrl,
    supabaseKey: supabaseAnonKey,
  });
}