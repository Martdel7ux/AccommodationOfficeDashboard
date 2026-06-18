const express     = require('express');
const path        = require('path');
const nodemailer  = require('nodemailer');
const PDFDocument = require('pdfkit');
const { data }    = require('../db');

const LOGO_WHITE = path.join(__dirname, '..', 'assets', 'unic-logo-white.png');

const router = express.Router();

function getFiltered(filters = {}) {
  return data.accommodations.filter((a) => {
    if (filters.status       && filters.status !== 'all'       && a.availability_status !== filters.status)  return false;
    if (filters.property_type && a.property_type !== filters.property_type)                                   return false;
    if (filters.bedrooms     && Number(a.bedrooms) !== Number(filters.bedrooms))                              return false;
    if (filters.min_price    && a.price < Number(filters.min_price))                                          return false;
    if (filters.max_price    && a.price > Number(filters.max_price))                                          return false;
    if (filters.target_audience && filters.target_audience !== 'all') {
      if (a.target_audience !== filters.target_audience && a.target_audience !== 'both') return false;
    }
    return true;
  }).sort((a, b) => a.price - b.price);
}

// ── POST /api/export/pdf ───────────────────────────────────────────────────────
router.post('/pdf', (req, res) => {
  try {
    const listings = getFiltered(req.body.filters || {});
    const doc      = new PDFDocument({ margin: 50, size: 'A4' });
    const buffers  = [];

    doc.on('data', (c) => buffers.push(c));
    doc.on('end', () => {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="UNIC-Accommodations-${new Date().toISOString().slice(0, 10)}.pdf"`
      );
      res.send(Buffer.concat(buffers));
    });

    const BLUE = '#C41230', DARK = '#1E293B', MUTED = '#64748B';
    const LIGHT = '#F1F5F9', GREEN = '#10B981', RED = '#EF4444';

    // ── Header banner ────────────────────────────────────────────────────────
    const BANNER_H = 100;
    doc.rect(0, 0, doc.page.width, BANNER_H).fill(BLUE);

    // Embed the white logo — fit within 200×70 px area, left-aligned
    const fs = require('fs');
    if (fs.existsSync(LOGO_WHITE)) {
      doc.image(LOGO_WHITE, 40, 15, { fit: [200, 70], align: 'left', valign: 'center' });
    } else {
      doc.fillColor('#FFFFFF').fontSize(20).font('Helvetica-Bold').text('UNIC', 50, 35);
    }

    // Right-aligned meta text
    const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
    doc.fillColor('#FECDD3').fontSize(8.5).font('Helvetica')
      .text('Property Listings Report', 0, 60, { align: 'right', width: doc.page.width - 40 });
    doc.fillColor('#FFFFFF').fontSize(8).font('Helvetica')
      .text(`${dateStr}   ·   ${listings.length} listing${listings.length !== 1 ? 's' : ''}`, 0, 75, { align: 'right', width: doc.page.width - 40 });

    doc.moveDown(3.5);

    if (!listings.length) {
      doc.fillColor(MUTED).fontSize(12).font('Helvetica')
        .text('No listings match the selected filters.', { align: 'center' });
      doc.end();
      return;
    }

    // ── Icon helpers (pure PDFKit vector paths) ───────────────────────────────
    // Each icon fits in a sz×sz bounding box at (x, y)

    function iconPin(x, y, sz, color) {
      // Teardrop map-pin: filled circle + triangular tail
      const cx = x + sz / 2;
      doc.save();
      doc.circle(cx, y + sz * 0.37, sz * 0.36).fill(color);
      doc.circle(cx, y + sz * 0.37, sz * 0.16).fill('#FFFFFF');
      doc.moveTo(cx - sz * 0.22, y + sz * 0.62)
         .lineTo(cx,              y + sz * 1.02)
         .lineTo(cx + sz * 0.22, y + sz * 0.62)
         .fill(color);
      doc.restore();
    }

    function iconPerson(x, y, sz, color) {
      // Circle head + rounded shoulders
      const cx = x + sz / 2;
      doc.save();
      doc.circle(cx, y + sz * 0.27, sz * 0.23).fill(color);
      doc.moveTo(x + sz * 0.02, y + sz * 0.98)
         .quadraticCurveTo(x + sz * 0.02, y + sz * 0.60, cx, y + sz * 0.57)
         .quadraticCurveTo(x + sz * 0.98, y + sz * 0.60, x + sz * 0.98, y + sz * 0.98)
         .fill(color);
      doc.restore();
    }

    function iconPhone(x, y, sz, color) {
      // Rounded rectangle handset body + small speaker line
      doc.save();
      doc.roundedRect(x + sz * 0.18, y, sz * 0.64, sz * 0.98, sz * 0.14).fill(color);
      doc.roundedRect(x + sz * 0.33, y + sz * 0.10, sz * 0.34, sz * 0.06, 1).fill('#FFFFFF');
      doc.restore();
    }

    function iconEnvelope(x, y, sz, color) {
      // Envelope body + flap V
      doc.save();
      doc.roundedRect(x, y + sz * 0.12, sz, sz * 0.76, 1.5).fill(color);
      // White V flap overlay
      doc.moveTo(x,        y + sz * 0.12)
         .lineTo(x + sz / 2, y + sz * 0.56)
         .lineTo(x + sz,   y + sz * 0.12)
         .lineWidth(0)
         .fillOpacity(1)
         .fill('#FFFFFF');
      // Restore opacity
      doc.fillOpacity(1);
      // Bottom corners — redraw body corners that the flap covered
      doc.moveTo(x,        y + sz * 0.88)
         .lineTo(x + sz * 0.38, y + sz * 0.52)
         .lineTo(x,        y + sz * 0.52)
         .fill(color);
      doc.moveTo(x + sz,   y + sz * 0.88)
         .lineTo(x + sz * 0.62, y + sz * 0.52)
         .lineTo(x + sz,   y + sz * 0.52)
         .fill(color);
      doc.restore();
    }

    // ── Row helper: icon + label + value ─────────────────────────────────────
    function infoRow(doc, iconFn, label, value, x, y, valueWidth) {
      const ICON_SZ   = 9;
      const LABEL_END = x + 58;
      const VALUE_X   = LABEL_END + 6;

      // Draw icon
      iconFn(x, y - 1, ICON_SZ, '#94A3B8');

      // Label (uppercase, small, muted)
      doc.fillColor('#94A3B8').fontSize(6.8).font('Helvetica-Bold')
         .text(label, x + ICON_SZ + 4, y + 0.5, { width: LABEL_END - x - ICON_SZ - 4 });

      // Value
      doc.fillColor('#334155').fontSize(8.5).font('Helvetica')
         .text(value, VALUE_X, y, { width: valueWidth || 360, lineBreak: false });
    }

    // ── Listing cards ─────────────────────────────────────────────────────────
    const CARD_H = 152;

    listings.forEach((l, i) => {
      if (doc.y > 680) doc.addPage();
      const cardY = doc.y;

      // Card background + border
      doc.rect(40, cardY, doc.page.width - 80, CARD_H)
         .fill(i % 2 === 0 ? '#FFFFFF' : LIGHT)
         .strokeColor('#E2E8F0').lineWidth(0.5).stroke();

      // Left accent bar
      doc.rect(40, cardY, 3, CARD_H).fill(BLUE);

      // ── Status badge ─────────────────────────────────────────────────────
      const sc = l.availability_status === 'available' ? GREEN : RED;
      const badgeW = 88;
      doc.roundedRect(doc.page.width - 40 - badgeW - 8, cardY + 11, badgeW, 17, 4).fill(sc);
      doc.fillColor('#FFFFFF').fontSize(7).font('Helvetica-Bold')
         .text(l.availability_status.toUpperCase(), doc.page.width - 40 - badgeW - 4, cardY + 15, { width: badgeW, align: 'center' });

      // ── Title & price ─────────────────────────────────────────────────────
      const typeMap = { apartment: 'Apartment', studio: 'Studio', house: 'House', room: 'Room' };
      const title   = `${l.bedrooms ? `${l.bedrooms}-Bedroom ` : ''}${typeMap[l.property_type] || l.property_type}`;
      doc.fillColor(DARK).fontSize(13).font('Helvetica-Bold')
         .text(title, 52, cardY + 12, { width: 300 });

      doc.fillColor(BLUE).fontSize(15).font('Helvetica-Bold')
         .text(`€${Number(l.price).toLocaleString()}`, 52, cardY + 29);
      doc.fillColor(MUTED).fontSize(8).font('Helvetica')
         .text('/month', 52 + doc.widthOfString(`€${Number(l.price).toLocaleString()}`, { fontSize: 15 }) + 2, cardY + 33);

      // ── Thin divider ─────────────────────────────────────────────────────
      doc.rect(52, cardY + 50, doc.page.width - 100, 0.5).fill('#E2E8F0');

      // ── Info rows with vector icons ───────────────────────────────────────
      infoRow(doc, iconPin,    'ADDRESS',  l.address,                          52, cardY + 58, 370);
      infoRow(doc, iconPerson, 'LANDLORD', `${l.first_name} ${l.last_name}`,  52, cardY + 74, 370);

      // Phone + Email on one row, separated by a mid-point
      const MID = Math.floor((doc.page.width - 40) / 2) + 8;
      infoRow(doc, iconPhone,    'PHONE', l.phone,  52,  cardY + 90, MID - 80);
      infoRow(doc, iconEnvelope, 'EMAIL', l.email,  MID, cardY + 90, doc.page.width - MID - 50);

      // ── Thin divider ─────────────────────────────────────────────────────
      doc.rect(52, cardY + 106, doc.page.width - 100, 0.5).fill('#E2E8F0');

      // ── Tags row ──────────────────────────────────────────────────────────
      const amMap = { 'full-time': 'Full-time', erasmus: 'Erasmus', both: 'All Students' };
      const tags  = [
        l.furnishing_status === 'fully-furnished' ? 'Fully Furnished'
          : l.furnishing_status === 'semi-furnished' ? 'Semi-Furnished' : null,
        l.walking_distance ? 'Walking Distance' : null,
        amMap[l.target_audience] || l.target_audience,
        l.availability_date
          ? `From ${new Date(l.availability_date).toLocaleDateString('en-GB')}`
          : null,
      ].filter(Boolean);

      let tagX = 52;
      const tagY = cardY + 113;
      tags.forEach((tag) => {
        const tw = doc.widthOfString(tag, { fontSize: 7.5 }) + 10;
        doc.roundedRect(tagX, tagY, tw, 13, 3).fill('#F1F5F9');
        doc.fillColor('#475569').fontSize(7.5).font('Helvetica').text(tag, tagX + 5, tagY + 3);
        tagX += tw + 5;
      });

      // ── Description ───────────────────────────────────────────────────────
      if (l.description) {
        const desc = l.description.length > 155 ? `${l.description.slice(0, 155)}…` : l.description;
        doc.fillColor('#64748B').fontSize(7.5).font('Helvetica')
           .text(desc, 52, cardY + 131, { width: doc.page.width - 110, lineBreak: false });
      }

      doc.y = cardY + CARD_H + 4;
    });

    // ── Footer on every page ─────────────────────────────────────────────────
    const range = doc.bufferedPageRange();
    for (let i = 0; i < range.count; i++) {
      doc.switchToPage(range.start + i);
      doc.rect(0, doc.page.height - 35, doc.page.width, 35).fill(LIGHT);
      doc.fillColor(MUTED).fontSize(8).font('Helvetica').text(
        'University of Nicosia Accommodation Office  ·  Confidential — For Internal Use Only',
        50, doc.page.height - 22,
        { align: 'center', width: doc.page.width - 100 }
      );
    }

    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

// ── POST /api/export/email ─────────────────────────────────────────────────────
router.post('/email', async (req, res) => {
  try {
    const { to, subject, message, filters } = req.body;
    if (!to) return res.status(400).json({ error: 'Recipient email is required' });

    const listings = getFiltered(filters || {});

    const transporter = nodemailer.createTransport({
      host:   process.env.SMTP_HOST || 'smtp.gmail.com',
      port:   Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth:   { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });

    const rows = listings.map((l) => `
      <tr style="border-bottom:1px solid #E2E8F0;">
        <td style="padding:10px 8px;font-weight:600;color:#1E293B;">${l.bedrooms || '—'}-bed ${l.property_type}</td>
        <td style="padding:10px 8px;color:#C41230;font-weight:700;">€${Number(l.price).toLocaleString()}</td>
        <td style="padding:10px 8px;color:#64748B;">${l.address}</td>
        <td style="padding:10px 8px;">
          <span style="background:${l.availability_status === 'available' ? '#D1FAE5' : '#FEE2E2'};color:${l.availability_status === 'available' ? '#065F46' : '#991B1B'};padding:3px 8px;border-radius:12px;font-size:12px;">
            ${l.availability_status === 'available' ? 'Available' : 'Unavailable'}
          </span>
        </td>
        <td style="padding:10px 8px;color:#64748B;">${l.first_name} ${l.last_name}</td>
      </tr>`).join('');

    await transporter.sendMail({
      from:    process.env.EMAIL_FROM || 'UNIC Accommodation Office',
      to,
      subject: subject || 'Off-campus Accommodation Listings',
      html: `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;font-family:-apple-system,sans-serif;background:#F8FAFC;">
  <div style="max-width:700px;margin:30px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.08);">
    <div style="background:#C41230;padding:28px 32px;">
      <h1 style="margin:0;color:#fff;font-size:22px;">University of Nicosia</h1>
      <p style="margin:4px 0 0;color:#FECDD3;font-size:14px;">Accommodation Office — Property Listings</p>
    </div>
    <div style="padding:28px 32px;">
      ${message ? `<p style="color:#475569;font-size:15px;line-height:1.6;margin-bottom:24px;">${message}</p>` : ''}
      <p style="color:#94A3B8;font-size:13px;margin-bottom:16px;">Showing <strong style="color:#1E293B;">${listings.length}</strong> listing${listings.length !== 1 ? 's' : ''}</p>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <thead><tr style="background:#F1F5F9;">
          <th style="padding:10px 8px;text-align:left;color:#64748B;font-size:11px;text-transform:uppercase;">Type</th>
          <th style="padding:10px 8px;text-align:left;color:#64748B;font-size:11px;text-transform:uppercase;">Price</th>
          <th style="padding:10px 8px;text-align:left;color:#64748B;font-size:11px;text-transform:uppercase;">Address</th>
          <th style="padding:10px 8px;text-align:left;color:#64748B;font-size:11px;text-transform:uppercase;">Status</th>
          <th style="padding:10px 8px;text-align:left;color:#64748B;font-size:11px;text-transform:uppercase;">Landlord</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
    <div style="background:#F8FAFC;padding:18px 32px;border-top:1px solid #E2E8F0;">
      <p style="margin:0;color:#94A3B8;font-size:12px;">Sent by the UNIC Accommodation Office system · ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
    </div>
  </div>
</body></html>`,
    });

    res.json({ success: true, sent: listings.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Failed to send email' });
  }
});

module.exports = router;
