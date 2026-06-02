const { supabase } = require('../_db');
const { cors }     = require('../_cors');

// Deletes the calling user's account using the service-role key (server-side only)
module.exports = async (req, res) => {
  if (cors(req, res)) return;
  if (req.method !== 'DELETE') return res.status(405).end();

  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Unauthorised' });

    // Verify the JWT and get the user's id
    const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
    if (authErr || !user) return res.status(401).json({ error: 'Invalid session' });

    // Admin delete (requires service role)
    const { error: delErr } = await supabase.auth.admin.deleteUser(user.id);
    if (delErr) return res.status(500).json({ error: delErr.message });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete account' });
  }
};
