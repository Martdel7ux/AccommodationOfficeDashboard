const { supabase } = require('../_db');
const { cors }     = require('../_cors');

module.exports = async (req, res) => {
  if (cors(req, res)) return;
  if (req.method !== 'GET') return res.status(405).end();

  try {
    const { data: all, error } = await supabase
      .from('accommodations')
      .select('id,first_name,last_name,property_type,bedrooms,price,address,availability_status,target_audience,created_at');

    if (error) return res.status(500).json({ error: error.message });

    const available   = all.filter((a) => a.availability_status === 'available').length;
    const unavailable = all.filter((a) => a.availability_status === 'unavailable').length;
    const avgPrice    = all.length
      ? Math.round(all.reduce((s, a) => s + Number(a.price), 0) / all.length)
      : 0;

    const count = (arr, key) =>
      Object.values(
        arr.reduce((acc, a) => {
          const k = a[key];
          if (!k) return acc;
          acc[k] = acc[k] || { [key]: k, count: 0 };
          acc[k].count++;
          return acc;
        }, {})
      );

    const byType     = count(all, 'property_type').sort((a, b) => b.count - a.count);
    const byBedrooms = count(all.filter((a) => a.bedrooms), 'bedrooms')
      .sort((a, b) => a.bedrooms - b.bedrooms);
    const byAudience = count(all, 'target_audience');

    const recentListings = [...all]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 6);

    res.json({ total: all.length, available, unavailable, avgPrice, byType, byBedrooms, byAudience, recentListings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load stats' });
  }
};
