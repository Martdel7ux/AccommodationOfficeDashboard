const express        = require('express');
const path           = require('path');
const fs             = require('fs');
const { data, save, nextId } = require('../db');
const upload         = require('../middleware/upload');

const router = express.Router();

// ── helpers ───────────────────────────────────────────────────────────────────

function withImages(rows) {
  return rows.map((row) => ({
    ...row,
    images: data.images.filter((img) => img.accommodation_id === row.id),
  }));
}

function applyFilters(items, q) {
  return items.filter((a) => {
    if (q.status && q.status !== 'all' && a.availability_status !== q.status) return false;
    if (q.property_type && a.property_type !== q.property_type)              return false;
    if (q.bedrooms      && Number(a.bedrooms) !== Number(q.bedrooms))        return false;
    if (q.min_price     && a.price < Number(q.min_price))                    return false;
    if (q.max_price     && a.price > Number(q.max_price))                    return false;
    if (q.target_audience && q.target_audience !== 'all') {
      if (a.target_audience !== q.target_audience && a.target_audience !== 'both') return false;
    }
    if (q.walking_distance === 'true' && !a.walking_distance)               return false;
    if (q.availability_from && a.availability_date && a.availability_date < q.availability_from) return false;
    if (q.availability_to   && a.availability_date && a.availability_date > q.availability_to)   return false;
    if (q.search) {
      const s = q.search.toLowerCase();
      if (
        !(a.address     || '').toLowerCase().includes(s) &&
        !(a.first_name  || '').toLowerCase().includes(s) &&
        !(a.last_name   || '').toLowerCase().includes(s) &&
        !(a.description || '').toLowerCase().includes(s)
      ) return false;
    }
    return true;
  });
}

// ── GET /stats ─────────────────────────────────────────────────────────────────
router.get('/stats', (_req, res) => {
  try {
    const all         = data.accommodations;
    const avgPrice    = all.length
      ? Math.round(all.reduce((s, a) => s + a.price, 0) / all.length)
      : 0;

    const byType = Object.values(
      all.reduce((acc, a) => {
        acc[a.property_type] = acc[a.property_type] || { property_type: a.property_type, count: 0 };
        acc[a.property_type].count++;
        return acc;
      }, {})
    ).sort((a, b) => b.count - a.count);

    const byBedrooms = Object.values(
      all.filter((a) => a.bedrooms).reduce((acc, a) => {
        acc[a.bedrooms] = acc[a.bedrooms] || { bedrooms: a.bedrooms, count: 0 };
        acc[a.bedrooms].count++;
        return acc;
      }, {})
    ).sort((a, b) => a.bedrooms - b.bedrooms);

    const byAudience = Object.values(
      all.reduce((acc, a) => {
        acc[a.target_audience] = acc[a.target_audience] || { target_audience: a.target_audience, count: 0 };
        acc[a.target_audience].count++;
        return acc;
      }, {})
    );

    const recentListings = [...all]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 6)
      .map(({ id, first_name, last_name, property_type, bedrooms, price, address, availability_status, created_at }) =>
        ({ id, first_name, last_name, property_type, bedrooms, price, address, availability_status, created_at })
      );

    res.json({
      total: all.length,
      available:   all.filter((a) => a.availability_status === 'available').length,
      unavailable: all.filter((a) => a.availability_status === 'unavailable').length,
      avgPrice,
      byType,
      byBedrooms,
      byAudience,
      recentListings,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load stats' });
  }
});

// ── GET / ──────────────────────────────────────────────────────────────────────
router.get('/', (req, res) => {
  try {
    const filtered = applyFilters(data.accommodations, req.query);
    const sorted   = [...filtered].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    res.json(withImages(sorted));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch accommodations' });
  }
});

// ── GET /:id ───────────────────────────────────────────────────────────────────
router.get('/:id', (req, res) => {
  try {
    const row = data.accommodations.find((a) => a.id === Number(req.params.id));
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(withImages([row])[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch accommodation' });
  }
});

// ── POST / ─────────────────────────────────────────────────────────────────────
router.post('/', upload.array('images', 10), (req, res) => {
  try {
    const {
      first_name, last_name, phone, email,
      property_type, bedrooms, price, address,
      availability_date, availability_status, target_audience,
      furnishing_status, walking_distance, description,
    } = req.body;

    const now = new Date().toISOString();
    const id  = nextId('accommodations');

    const record = {
      id,
      first_name, last_name, phone, email,
      property_type,
      bedrooms: bedrooms ? Number(bedrooms) : null,
      price: Number(price),
      address,
      availability_date:   availability_date   || null,
      availability_status: availability_status || 'available',
      target_audience:     target_audience     || 'both',
      furnishing_status:   furnishing_status   || null,
      walking_distance:    walking_distance === 'true' || walking_distance === '1',
      description:         description         || null,
      created_at: now,
      updated_at: now,
    };

    data.accommodations.push(record);

    if (req.files?.length) {
      for (const f of req.files) {
        data.images.push({
          id: nextId('images'),
          accommodation_id: id,
          filename: f.filename,
          original_name: f.originalname,
          created_at: now,
        });
      }
    }

    save();
    res.status(201).json(withImages([record])[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create accommodation' });
  }
});

// ── PUT /:id ───────────────────────────────────────────────────────────────────
router.put('/:id', upload.array('images', 10), (req, res) => {
  try {
    const numId = Number(req.params.id);
    const idx   = data.accommodations.findIndex((a) => a.id === numId);
    if (idx === -1) return res.status(404).json({ error: 'Not found' });

    const {
      first_name, last_name, phone, email,
      property_type, bedrooms, price, address,
      availability_date, availability_status, target_audience,
      furnishing_status, walking_distance, description,
      delete_images,
    } = req.body;

    const now = new Date().toISOString();
    data.accommodations[idx] = {
      ...data.accommodations[idx],
      first_name, last_name, phone, email,
      property_type,
      bedrooms: bedrooms ? Number(bedrooms) : null,
      price: Number(price),
      address,
      availability_date:   availability_date   || null,
      availability_status: availability_status || 'available',
      target_audience:     target_audience     || 'both',
      furnishing_status:   furnishing_status   || null,
      walking_distance:    walking_distance === 'true' || walking_distance === '1',
      description:         description         || null,
      updated_at: now,
    };

    if (delete_images) {
      for (const imgId of JSON.parse(delete_images)) {
        const img = data.images.find((i) => i.id === imgId);
        if (img) {
          const fp = path.join(__dirname, '..', '..', 'uploads', img.filename);
          if (fs.existsSync(fp)) fs.unlinkSync(fp);
          data.images = data.images.filter((i) => i.id !== imgId);
        }
      }
    }

    if (req.files?.length) {
      for (const f of req.files) {
        data.images.push({
          id: nextId('images'),
          accommodation_id: numId,
          filename: f.filename,
          original_name: f.originalname,
          created_at: now,
        });
      }
    }

    save();
    res.json(withImages([data.accommodations[idx]])[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update accommodation' });
  }
});

// ── DELETE /:id ────────────────────────────────────────────────────────────────
router.delete('/:id', (req, res) => {
  try {
    const numId = Number(req.params.id);
    if (!data.accommodations.find((a) => a.id === numId)) {
      return res.status(404).json({ error: 'Not found' });
    }

    for (const img of data.images.filter((i) => i.accommodation_id === numId)) {
      const fp = path.join(__dirname, '..', '..', 'uploads', img.filename);
      if (fs.existsSync(fp)) fs.unlinkSync(fp);
    }

    data.accommodations = data.accommodations.filter((a) => a.id !== numId);
    data.images         = data.images.filter((i) => i.accommodation_id !== numId);
    save();

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete accommodation' });
  }
});

module.exports = router;
