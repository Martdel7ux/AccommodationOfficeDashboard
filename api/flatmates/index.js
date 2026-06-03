const { supabase } = require('../_db');
const { cors }     = require('../_cors');

module.exports = async (req, res) => {
  if (cors(req, res)) return;

  // ── GET /api/flatmates ──────────────────────────────────────────────────────
  if (req.method === 'GET') {
    try {
      let query = supabase.from('flatmate_requests').select('*');

      const { has_flat, gender, year_of_study, search } = req.query;

      if (has_flat !== undefined && has_flat !== 'all') {
        query = query.eq('has_flat', has_flat === 'true');
      }
      if (gender && gender !== 'all') {
        query = query.eq('gender', gender);
      }
      if (year_of_study && year_of_study !== 'all') {
        query = query.eq('year_of_study', year_of_study);
      }
      if (search) {
        const s = search.replace(/'/g, "''");
        query = query.or(
          `first_name.ilike.%${s}%,last_name.ilike.%${s}%,phone.ilike.%${s}%,email.ilike.%${s}%`
        );
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) return res.status(500).json({ error: error.message });
      return res.json(data);
    } catch (err) {
      return res.status(500).json({ error: 'Failed to fetch flatmate requests' });
    }
  }

  // ── POST /api/flatmates ─────────────────────────────────────────────────────
  if (req.method === 'POST') {
    try {
      const {
        first_name, last_name, phone, email,
        year_of_study, gender, has_flat, notes,
        created_by_id, created_by_name,
      } = req.body;

      if (!first_name || !last_name || !phone) {
        return res.status(400).json({ error: 'First name, last name and phone are required' });
      }

      const { data, error } = await supabase
        .from('flatmate_requests')
        .insert([{
          first_name,
          last_name,
          phone,
          email:            email          || null,
          year_of_study:    year_of_study  || null,
          gender:           gender         || 'prefer_not_to_say',
          has_flat:         has_flat === true || has_flat === 'true',
          notes:            notes          || null,
          created_by_id:    created_by_id  || null,
          created_by_name:  created_by_name || null,
        }])
        .select()
        .single();

      if (error) return res.status(500).json({ error: error.message });
      return res.status(201).json(data);
    } catch (err) {
      return res.status(500).json({ error: 'Failed to create flatmate request' });
    }
  }

  res.status(405).end();
};
