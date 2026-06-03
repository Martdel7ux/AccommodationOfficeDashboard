const { supabase } = require('../_db');
const { cors }     = require('../_cors');

module.exports = async (req, res) => {
  if (cors(req, res)) return;

  const { id } = req.query;

  // ── DELETE /api/flatmates/:id ───────────────────────────────────────────────
  if (req.method === 'DELETE') {
    try {
      const { error } = await supabase
        .from('flatmate_requests')
        .delete()
        .eq('id', Number(id));

      if (error) return res.status(500).json({ error: error.message });
      return res.json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: 'Failed to delete flatmate request' });
    }
  }

  res.status(405).end();
};
