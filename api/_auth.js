const { supabase } = require('./_db');

// Verifies the Bearer token from the Authorization header.
// Returns the authenticated user, or sends a 401 and returns null.
async function requireAuth(req, res) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    res.status(401).json({ error: 'Unauthorised' });
    return null;
  }
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) {
    res.status(401).json({ error: 'Invalid session' });
    return null;
  }
  return user;
}

module.exports = { requireAuth };
