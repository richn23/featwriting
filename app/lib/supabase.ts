import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Lazy singleton — only created when first called at runtime,
// so the build doesn't crash when env vars aren't set yet.
let _supabase: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (_supabase) return _supabase;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    // Env vars not configured — Supabase features silently disabled
    return null;
  }

  _supabase = createClient(url, key);
  return _supabase;
}
