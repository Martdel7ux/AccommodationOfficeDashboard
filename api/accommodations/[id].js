const { supabase } = require('../_db');
const { cors }     = require('../_cors');

module.exports = async (req, res) => {
  if (cors(req, res)) return;

  const { id } = req.query;
  const numId  = Number(id);

  // ── GET /:id ──────────────────────────────────────────────────────────────
  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('accommodations')
      .select('*, accommodation_images(*)')
      .eq('id', numId)
      .single();

    if (error || !data) return res.status(404).json({ error: 'Not found' });
    return res.json(data);
  }

  // ── PUT /:id ──────────────────────────────────────────────────────────────
  if (req.method === 'PUT') {
    try {
      const {
        first_name, last_name, phone, email,
        property_type, bedrooms, price, address,
        availability_date, availability_status, target_audience,
        furnishing_status, walking_distance, description,
        image_urls     = [],
        delete_image_ids = [],
      } = req.body;

      // 1. Update main record
      const { error: updErr } = await supabase
        .from('accommodations')
        .update({
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
        })
        .eq('id', numId);

      if (updErr) return res.status(500).json({ error: updErr.message });

      // 2. Delete removed images from Storage + DB
      if (delete_image_ids.length > 0) {
        const { data: toDelete } = await supabase
          .from('accommodation_images')
          .select('id, storage_path')
          .in('id', delete_image_ids);

        if (toDelete?.length) {
          await supabase.storage
            .from('acc-images')
            .remove(toDelete.map((i) => i.storage_path));

          await supabase
            .from('accommodation_images')
            .delete()
            .in('id', delete_image_ids);
        }
      }

      // 3. Insert new images
      if (image_urls.length > 0) {
        await supabase.from('accommodation_images').insert(
          image_urls.map((img) => ({
            accommodation_id: numId,
            storage_path:  img.storage_path,
            public_url:    img.public_url,
            original_name: img.original_name || null,
          }))
        );
      }

      const { data: full } = await supabase
        .from('accommodations')
        .select('*, accommodation_images(*)')
        .eq('id', numId)
        .single();

      return res.json(full);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to update accommodation' });
    }
  }

  // ── DELETE /:id ───────────────────────────────────────────────────────────
  if (req.method === 'DELETE') {
    try {
      // Fetch Storage paths before cascade deletes the rows
      const { data: images } = await supabase
        .from('accommodation_images')
        .select('storage_path')
        .eq('accommodation_id', numId);

      if (images?.length) {
        await supabase.storage
          .from('acc-images')
          .remove(images.map((i) => i.storage_path));
      }

      const { error } = await supabase
        .from('accommodations')
        .delete()
        .eq('id', numId);

      if (error) return res.status(500).json({ error: error.message });
      return res.json({ success: true });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to delete accommodation' });
    }
  }

  res.status(405).end();
};
