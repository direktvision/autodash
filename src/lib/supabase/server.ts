import { createClient } from '@supabase/supabase-js';

/**
 * Server-side Supabase client.
 *
 * v1 has no auth, so this uses the anon key and carries no session — there is
 * no cookie handling to do. Created per call rather than module-scoped so a
 * long-lived server process can't leak state between requests.
 */
export function createServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. ' +
        'Copy .env.example to .env.local and fill them in.',
    );
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
