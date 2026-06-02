require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

const accommodationsRouter = require('./routes/accommodations');
const exportRouter = require('./routes/export');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet({ contentSecurityPolicy: false, crossOriginResourcePolicy: false }));
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:4173'] }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
app.use('/uploads', express.static(UPLOAD_DIR));

app.use('/api/accommodations', accommodationsRouter);
app.use('/api/export', exportRouter);

app.get('/api/health', (_req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`\n🏠  UNIC Accommodation Server`);
  console.log(`   ✅  Running at http://localhost:${PORT}`);
  console.log(`   📁  Uploads served from /uploads\n`);
});
