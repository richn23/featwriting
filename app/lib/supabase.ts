import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Server-side client using service_role key
// Only use this in API routes — never expose to the browser
export const supabase = createClient(supabaseUrl, supabaseServiceKey);
