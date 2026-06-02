import { createClient } from '@supabase/supabase-js';

// Anon key — safe to expose in the browser (used only for Storage uploads)
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
