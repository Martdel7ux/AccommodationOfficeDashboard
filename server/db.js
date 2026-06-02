const fs   = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'accommodation.json');

const DEFAULTS = {
  accommodations: [],
  images: [],
  seq: { accommodations: 0, images: 0 },
};

let data = { ...DEFAULTS };

// ── Load from disk ────────────────────────────────────────────────────────────
if (fs.existsSync(DB_PATH)) {
  try {
    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    data = { ...DEFAULTS, ...JSON.parse(raw) };
    if (!data.seq) data.seq = { accommodations: 0, images: 0 };
  } catch (e) {
    console.warn('⚠️  Could not parse DB file; starting fresh.', e.message);
  }
}

// ── Persist to disk ───────────────────────────────────────────────────────────
function save() {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

// ── Auto-increment ID ─────────────────────────────────────────────────────────
function nextId(table) {
  data.seq[table] = (data.seq[table] || 0) + 1;
  return data.seq[table];
}

module.exports = { data, save, nextId };
