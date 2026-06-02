const { supabase } = require('../_db');
const { cors }     = require('../_cors');

// ── Filter builder ────────────────────────────────────────────────────────────
function buildQuery(q) {
  let query = supabase.from('accommodations').select('*, accommodation_images(*)');

  if (q.status && q.status !== 'all')
    query = query.eq('availability_status', q.status);

  if (q.property_type)
    query = query.eq('property_type', q.property_type);

  if (q.bedrooms)
    query = query.eq('bedrooms', Number(q.bedrooms));

  if (q.min_price)
    query = query.gte('price', Number(q.min_price));

  if (q.max_price)
    query = query.lte('price', Number(q.max_price));

  if (q.target_audience && q.target_audience !== 'all')
    query = query.or(`target_audience.eq.${q.target_audience},target_audience.eq.both`);

  if (q.walking_distance === 'true')
    query = query.eq('walking_distance', true);

  if (q.availability_from)
    query = query.gte('availability_date', q.availability_from);

  if (q.availability_to)
    query = query.lte('availability_date', q.availability_to);

  if (q.search) {
    const s = q.search.replace(/'/g, "''");
    query = query.or(
      `address.ilike.%${s}%,first_name.ilike.%${s}%,last_name.ilike.%${s}%,description.ilike.%${s}%`
    );
  }

  return query.order('created_at', { ascending: false });
}

// ── Handler ───────────────────────────────────────────────────────────────────
module.exports = async (req, res) => {
  if (cors(req, res)) return;

  // GET /api/accommodations
  if (req.method === 'GET') {
    try {
      const { data, error } = await buildQuery(req.query);
      if (error) return res.status(500).json({ error: error.message });
      return res.json(data);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to fetch accommodations' });
    }
  }

  // POST /api/accommodations
  if (req.method === 'POST') {
    try {
      const {
        first_name, last_name, phone, email,
        property_type, bedrooms, price, address,
        availability_date, availability_status, target_audience,
        furnishing_status, walking_distance, description,
        image_urls = [],
      } = req.body;

      const { data: acc, error } = await supabase
        .from('accommodations')
        .insert([{
          first_name, last_name, phone, email,
          property_type,
          bedrooms: bedrooms ? Number(bedrooms) : null,
          price: Number(price),
          address,
          availability_date:   availability_date   || null,
          availability_status: availability_status || 'available',
          target_audience:     target_audience     || 'both',
          furnishing_status:   furnishing_status   || null,
          walking_distance:    walking_distance === true || walking_distance === 'true',
          description:         description         || null,
        }])
        .select()
        .single();

      if (error) return res.status(500).json({ error: error.message });

      if (image_urls.length > 0) {
        await supabase.from('accommodation_images').insert(
          image_urls.map((img) => ({
            accommodation_id: acc.id,
            storage_path:  img.storage_path,
            public_url:    img.public_url,
            original_name: img.original_name || null,
          }))
        );
      }

      const { data: full } = await supabase
        .from('accommodations')
        .select('*, accommodation_images(*)')
        .eq('id', acc.id)
        .single();

      return res.status(201).json(full);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to create accommodation' });
    }
  }

  res.status(405).end();
};
