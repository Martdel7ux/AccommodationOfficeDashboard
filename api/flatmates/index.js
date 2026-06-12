const { supabase }    = require('../_db');
const { cors }        = require('../_cors');
const { requireAuth } = require('../_auth');

module.exports = async (req, res) => {
  if (cors(req, res)) return;

  const user = await requireAuth(req, res);
  if (!user) return;

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
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) return res.status(500).json({ error: error.message });

      let result = data;
      if (search) {
        const lower = search.toLowerCase();
        const digits = search.replace(/\D/g, '');
        result = result.filter((item) => {
          const fullName = `${item.first_name} ${item.last_name}`.toLowerCase();
          const email    = (item.email || '').toLowerCase();
          const phone    = (item.phone || '').replace(/\D/g, '');
          return (
            fullName.includes(lower) ||
            email.includes(lower) ||
            (digits.length > 0 && phone.includes(digits))
          );
        });
      }

      return res.json(result);
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
