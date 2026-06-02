const { createClient } = require('@supabase/supabase-js');

// Service role — full access, never sent to the browser
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = { supabase };
