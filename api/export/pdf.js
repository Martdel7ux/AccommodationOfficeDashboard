const path        = require('path');
const fs          = require('fs');
const PDFDocument = require('pdfkit');
const { supabase } = require('../_db');
const { cors }     = require('../_cors');

const LOGO = path.join(__dirname, '..', 'assets', 'unic-logo-white.png');

function getFiltered(all, filters = {}) {
  return all.filter((a) => {
    if (filters.status       && filters.status !== 'all'       && a.availability_status !== filters.status)  return false;
    if (filters.property_type && a.property_type !== filters.property_type)                                   return false;
    if (filters.bedrooms     && Number(a.bedrooms) !== Number(filters.bedrooms))                              return false;
    if (filters.min_price    && Number(a.price) < Number(filters.min_price))                                  return false;
    if (filters.max_price    && Number(a.price) > Number(filters.max_price))                                  return false;
    if (filters.target_audience && filters.target_audience !== 'all') {
      if (a.target_audience !== filters.target_audience && a.target_audience !== 'both') return false;
    }
    return true;
  }).sort((a, b) => Number(a.price) - Number(b.price));
}

module.exports = async (req, res) => {
  if (cors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { data: all } = await supabase.from('accommodations').select('*');
    const listings = getFiltered(all || [], req.body.filters || {});

    const doc     = new PDFDocument({ margin: 50, size: 'A4' });
    const buffers = [];
    doc.on('data', (c) => buffers.push(c));
    doc.on('end', () => {
      res
        .status(200)
        .setHeader('Content-Type', 'application/pdf')
        .setHeader('Content-Disposition', `attachment; filename="UNIC-Accommodations-${new Date().toISOString().slice(0, 10)}.pdf"`)
        .send(Buffer.concat(buffers));
    });

    const RED   = '#C41230', DARK = '#1E293B', MUTED = '#64748B';
    const LIGHT = '#F1F5F9', GREEN = '#10B981', ERR  = '#EF4444';

    // ── Header banner ────────────────────────────────────────────────────────
    const BANNER_H = 100;
    doc.rect(0, 0, doc.page.width, BANNER_H).fill(RED);
    if (fs.existsSync(LOGO)) {
      doc.image(LOGO, 40, 15, { fit: [200, 70], align: 'left', valign: 'center' });
    } else {
      doc.fillColor('#FFFFFF').fontSize(20).font('Helvetica-Bold').text('UNIC', 50, 35);
    }
    const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
    doc.fillColor('#FECDD3').fontSize(8.5).font('Helvetica')
       .text('Property Listings Report', 0, 60, { align: 'right', width: doc.page.width - 40 });
    doc.fillColor('#FFFFFF').fontSize(8)
       .text(`${dateStr}   ·   ${listings.length} listing${listings.length !== 1 ? 's' : ''}`, 0, 75, { align: 'right', width: doc.page.width - 40 });

    doc.moveDown(3.5);

    if (!listings.length) {
      doc.fillColor(MUTED).fontSize(12).font('Helvetica')
         .text('No listings match the selected filters.', { align: 'center' });
      doc.end();
      return;
    }

    // ── Icon helpers ─────────────────────────────────────────────────────────
    function iconPin(x, y, sz, color) {
      const cx = x + sz / 2;
      doc.save();
      doc.circle(cx, y + sz * 0.37, sz * 0.36).fill(color);
      doc.circle(cx, y + sz * 0.37, sz * 0.16).fill('#FFFFFF');
      doc.moveTo(cx - sz * 0.22, y + sz * 0.62).lineTo(cx, y + sz * 1.02).lineTo(cx + sz * 0.22, y + sz * 0.62).fill(color);
      doc.restore();
    }
    function iconPerson(x, y, sz, color) {
      const cx = x + sz / 2;
      doc.save();
      doc.circle(cx, y + sz * 0.27, sz * 0.23).fill(color);
      doc.moveTo(x + sz * 0.02, y + sz * 0.98).quadraticCurveTo(x + sz * 0.02, y + sz * 0.60, cx, y + sz * 0.57).quadraticCurveTo(x + sz * 0.98, y + sz * 0.60, x + sz * 0.98, y + sz * 0.98).fill(color);
      doc.restore();
    }
    function iconPhone(x, y, sz, color) {
      doc.save();
      doc.roundedRect(x + sz * 0.18, y, sz * 0.64, sz * 0.98, sz * 0.14).fill(color);
      doc.roundedRect(x + sz * 0.33, y + sz * 0.10, sz * 0.34, sz * 0.06, 1).fill('#FFFFFF');
      doc.restore();
    }
    function iconEnvelope(x, y, sz, color) {
      doc.save();
      doc.roundedRect(x, y + sz * 0.12, sz, sz * 0.76, 1.5).fill(color);
      doc.moveTo(x, y + sz * 0.12).lineTo(x + sz / 2, y + sz * 0.56).lineTo(x + sz, y + sz * 0.12).fill('#FFFFFF');
      doc.moveTo(x, y + sz * 0.88).lineTo(x + sz * 0.38, y + sz * 0.52).lineTo(x, y + sz * 0.52).fill(color);
      doc.moveTo(x + sz, y + sz * 0.88).lineTo(x + sz * 0.62, y + sz * 0.52).lineTo(x + sz, y + sz * 0.52).fill(color);
      doc.restore();
    }

    function infoRow(doc, iconFn, label, value, x, y, valueWidth) {
      const ICON_SZ   = 9;
      const LABEL_END = x + 58;
      const VALUE_X   = LABEL_END + 6;
      iconFn(x, y - 1, ICON_SZ, '#94A3B8');
      doc.fillColor('#94A3B8').fontSize(6.8).font('Helvetica-Bold')
         .text(label, x + ICON_SZ + 4, y + 0.5, { width: LABEL_END - x - ICON_SZ - 4 });
      doc.fillColor('#334155').fontSize(8.5).font('Helvetica')
         .text(value, VALUE_X, y, { width: valueWidth || 360, lineBreak: false });
    }

    // ── Listing cards ─────────────────────────────────────────────────────────
    const CARD_H = 152;
    listings.forEach((l, i) => {
      if (doc.y > 680) doc.addPage();
      const cardY = doc.y;

      doc.rect(40, cardY, doc.page.width - 80, CARD_H)
         .fill(i % 2 === 0 ? '#FFFFFF' : LIGHT)
         .strokeColor('#E2E8F0').lineWidth(0.5).stroke();
      doc.rect(40, cardY, 3, CARD_H).fill(RED);

      const sc = l.availability_status === 'available' ? GREEN : ERR;
      const bw = 88;
      doc.roundedRect(doc.page.width - 40 - bw - 8, cardY + 11, bw, 17, 4).fill(sc);
      doc.fillColor('#FFFFFF').fontSize(7).font('Helvetica-Bold')
         .text(l.availability_status.toUpperCase(), doc.page.width - 40 - bw - 4, cardY + 15, { width: bw, align: 'center' });

      const typeMap = { apartment: 'Apartment', studio: 'Studio', house: 'House', room: 'Room' };
      const title   = `${l.bedrooms ? `${l.bedrooms}-Bedroom ` : ''}${typeMap[l.property_type] || l.property_type}`;
      doc.fillColor(DARK).fontSize(13).font('Helvetica-Bold').text(title, 52, cardY + 12, { width: 300 });
      doc.fillColor(RED).fontSize(15).font('Helvetica-Bold').text(`€${Number(l.price).toLocaleString()}`, 52, cardY + 29);
      doc.fillColor(MUTED).fontSize(8).font('Helvetica').text('/month', 52 + 60, cardY + 33);

      doc.rect(52, cardY + 50, doc.page.width - 100, 0.5).fill('#E2E8F0');

      infoRow(doc, iconPin,    'ADDRESS',  l.address,                        52, cardY + 58, 370);
      infoRow(doc, iconPerson, 'LANDLORD', `${l.first_name} ${l.last_name}`, 52, cardY + 74, 370);

      const MID = Math.floor((doc.page.width - 40) / 2) + 8;
      infoRow(doc, iconPhone,    'PHONE', l.phone, 52,  cardY + 90, MID - 80);
      infoRow(doc, iconEnvelope, 'EMAIL', l.email, MID, cardY + 90, doc.page.width - MID - 50);

      doc.rect(52, cardY + 106, doc.page.width - 100, 0.5).fill('#E2E8F0');

      const amMap = { 'full-time': 'Full-time', erasmus: 'Erasmus', both: 'All Students' };
      const tags  = [
        l.furnishing_status === 'fully-furnished' ? 'Fully Furnished' : l.furnishing_status === 'semi-furnished' ? 'Semi-Furnished' : null,
        l.walking_distance ? 'Walking Distance' : null,
        amMap[l.target_audience] || l.target_audience,
        l.availability_date ? `From ${new Date(l.availability_date).toLocaleDateString('en-GB')}` : null,
      ].filter(Boolean);

      let tagX = 52;
      tags.forEach((tag) => {
        const tw = doc.widthOfString(tag, { fontSize: 7.5 }) + 10;
        doc.roundedRect(tagX, cardY + 113, tw, 13, 3).fill('#F1F5F9');
        doc.fillColor('#475569').fontSize(7.5).font('Helvetica').text(tag, tagX + 5, cardY + 116);
        tagX += tw + 5;
      });

      if (l.description) {
        const desc = l.description.length > 155 ? `${l.description.slice(0, 155)}…` : l.description;
        doc.fillColor('#64748B').fontSize(7.5).font('Helvetica')
           .text(desc, 52, cardY + 131, { width: doc.page.width - 110, lineBreak: false });
      }

      doc.y = cardY + CARD_H + 4;
    });

    // ── Footer ────────────────────────────────────────────────────────────────
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
};
