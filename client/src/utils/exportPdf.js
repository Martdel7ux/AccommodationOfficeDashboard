import jsPDF from 'jspdf';

// ── Colours ───────────────────────────────────────────────────────────────────
const C = {
  red:      [196, 18,  48],
  dark:     [15,  23,  42],
  mid:      [100, 116, 139],
  light:    [148, 163, 184],
  border:   [226, 232, 240],
  cardBg:   [250, 250, 252],
  white:    [255, 255, 255],
  green:    [16,  185, 129],
  rose:     [239, 68,  68],
  tagBg:    [241, 245, 249],
  tagText:  [100, 116, 139],
};

const PAGE_W  = 210;
const PAGE_H  = 297;
const MX      = 14;   // horizontal margin
const CARD_H  = 54;   // height of each listing card
const IMG_W   = 54;   // image width inside card
const IMG_H   = 44;   // image height inside card
const GAP     = 3;    // gap between cards
const TEXT_X  = MX + IMG_W + 7;  // text column start
const TEXT_W  = PAGE_W - MX - TEXT_X - 3; // text column width

// ── Load image via canvas (format-agnostic, handles CORS) ─────────────────────
function loadImageBase64(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width  = img.naturalWidth  || 800;
        canvas.height = img.naturalHeight || 600;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const rgb  = (doc, col)  => doc.setTextColor(...col);
const fill = (doc, col)  => doc.setFillColor(...col);
const draw = (doc, col)  => doc.setDrawColor(...col);
const bold = (doc, size) => { doc.setFont('helvetica', 'bold');   doc.setFontSize(size); };
const norm = (doc, size) => { doc.setFont('helvetica', 'normal'); doc.setFontSize(size); };

function pill(doc, x, y, w, h, bgCol, textCol, text) {
  fill(doc, bgCol);
  draw(doc, bgCol);
  doc.setLineWidth(0);
  doc.roundedRect(x, y, w, h, h / 2, h / 2, 'F');
  rgb(doc, textCol);
  doc.setFontSize(6.5);
  bold(doc, 6.5);
  doc.text(text, x + w / 2, y + h / 2 + 0.9, { align: 'center' });
}

function tag(doc, x, y, text) {
  const tw = doc.getTextWidth(text) + 5;
  fill(doc, C.tagBg);
  draw(doc, C.border);
  doc.setLineWidth(0.15);
  doc.roundedRect(x, y - 3.2, tw, 4.5, 1, 1, 'FD');
  rgb(doc, C.tagText);
  norm(doc, 7);
  doc.text(text, x + tw / 2, y, { align: 'center' });
  return tw + 2;
}

function placeholder(doc, x, y) {
  fill(doc, [241, 245, 249]);
  draw(doc, C.border);
  doc.setLineWidth(0.2);
  doc.roundedRect(x, y, IMG_W, IMG_H, 2, 2, 'FD');
  rgb(doc, C.light);
  norm(doc, 8);
  doc.text('No Image', x + IMG_W / 2, y + IMG_H / 2 + 1, { align: 'center' });
}

// ── Header printed on every page ──────────────────────────────────────────────
function addPageHeader(doc, pageNum, totalPages) {
  // Red band
  fill(doc, C.red);
  doc.rect(0, 0, PAGE_W, 19, 'F');

  // Logo text
  rgb(doc, C.white);
  bold(doc, 12);
  doc.text('UNIC Accommodation Office', MX, 8.5);
  norm(doc, 8);
  doc.text('University of Nicosia — Off Campus Accommodation Database', MX, 14);

  // Page number
  bold(doc, 8);
  doc.text(`${pageNum} / ${totalPages}`, PAGE_W - MX, 11, { align: 'right' });
}

// ── First-page meta block ─────────────────────────────────────────────────────
function addMeta(doc, total, filters) {
  let y = 26;

  rgb(doc, C.dark);
  bold(doc, 17);
  doc.text('Accommodation Listings', MX, y);
  y += 6.5;

  const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
  const timeStr = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  norm(doc, 8.5);
  rgb(doc, C.mid);
  doc.text(`Exported ${dateStr} at ${timeStr}  ·  ${total} propert${total === 1 ? 'y' : 'ies'} listed`, MX, y);
  y += 5;

  // Active filter summary
  const parts = [];
  if (filters.status && filters.status !== 'all')       parts.push(`Status: ${filters.status}`);
  if (filters.property_type)                             parts.push(`Type: ${filters.property_type}`);
  if (filters.bedrooms)                                  parts.push(`${filters.bedrooms} bed`);
  if (filters.min_price > 0 || filters.max_price < 2000) parts.push(`€${filters.min_price}–€${filters.max_price}`);
  if (filters.target_audience && filters.target_audience !== 'all') parts.push(`Audience: ${filters.target_audience}`);
  if (filters.walking_distance)                          parts.push('Walking distance');

  if (parts.length) {
    rgb(doc, C.light);
    norm(doc, 7.5);
    doc.text(`Filters: ${parts.join('  ·  ')}`, MX, y);
    y += 4.5;
  }

  // Divider
  draw(doc, C.border);
  doc.setLineWidth(0.3);
  doc.line(MX, y, PAGE_W - MX, y);
  y += 5;

  return y;
}

// ── Single listing card ───────────────────────────────────────────────────────
function drawCard(doc, l, imgBase64, y) {
  // Card background + border
  fill(doc, C.cardBg);
  draw(doc, C.border);
  doc.setLineWidth(0.25);
  doc.roundedRect(MX, y, PAGE_W - MX * 2, CARD_H, 2.5, 2.5, 'FD');

  // ── Image ──
  const imgX = MX + 3;
  const imgY = y + (CARD_H - IMG_H) / 2;
  if (imgBase64) {
    try {
      doc.addImage(imgBase64, 'JPEG', imgX, imgY, IMG_W, IMG_H, undefined, 'FAST');
      draw(doc, [203, 213, 225]);
      doc.setLineWidth(0.2);
      doc.roundedRect(imgX, imgY, IMG_W, IMG_H, 1.5, 1.5);
    } catch {
      placeholder(doc, imgX, imgY);
    }
  } else {
    placeholder(doc, imgX, imgY);
  }

  // ── Text column ──
  let ty = y + 6;

  // Status pill
  const isAvail = l.availability_status === 'available';
  pill(doc, TEXT_X, ty - 4, 22, 5.5, isAvail ? C.green : C.rose, C.white, isAvail ? 'Available' : 'Unavailable');

  ty += 3.5;

  // Property title
  const TYPE_MAP = { apartment: 'Apartment', studio: 'Studio', house: 'House', room: 'Room' };
  const bedsLabel = l.bedrooms ? `${l.bedrooms}-Bedroom ` : '';
  const typeLabel = TYPE_MAP[l.property_type] || l.property_type;
  rgb(doc, C.dark);
  bold(doc, 11.5);
  doc.text(`${bedsLabel}${typeLabel}`, TEXT_X, ty);

  // Price — right aligned
  rgb(doc, C.red);
  bold(doc, 11.5);
  doc.text(`€${Number(l.price).toLocaleString()}/mo`, PAGE_W - MX - 3, ty, { align: 'right' });
  ty += 5;

  // Address
  norm(doc, 8.5);
  rgb(doc, C.mid);
  const addrLines = doc.splitTextToSize(l.address, TEXT_W);
  doc.text(addrLines[0], TEXT_X, ty);
  ty += 5;

  // Thin rule
  draw(doc, [241, 245, 249]);
  doc.setLineWidth(0.2);
  doc.line(TEXT_X, ty, PAGE_W - MX - 3, ty);
  ty += 4;

  // Landlord line
  bold(doc, 8);
  rgb(doc, C.dark);
  const nameStr = `${l.first_name} ${l.last_name}`;
  doc.text(nameStr, TEXT_X, ty);
  const nameW = doc.getTextWidth(nameStr);
  norm(doc, 8);
  rgb(doc, C.mid);
  doc.text(`  ·  ${l.phone}`, TEXT_X + nameW, ty);
  if (l.email) {
    ty += 4;
    doc.text(l.email, TEXT_X, ty);
  }
  ty += 5.5;

  // Tags
  const AUDIENCE_MAP = { 'full-time': 'Full-time', erasmus: 'Erasmus', both: 'All Students' };
  const tags = [];
  if (l.furnishing_status) tags.push(l.furnishing_status === 'fully-furnished' ? 'Fully Furnished' : 'Semi-Furnished');
  if (l.walking_distance)  tags.push('Walking Distance');
  if (l.target_audience)   tags.push(AUDIENCE_MAP[l.target_audience] || l.target_audience);
  if (l.availability_date) tags.push(`From ${new Date(l.availability_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`);

  let tagX = TEXT_X;
  tags.forEach((t) => {
    const tw = doc.getTextWidth(t) + 5;
    if (tagX + tw > PAGE_W - MX - 3) return;
    tagX += tag(doc, tagX, ty, t);
  });
}

// ── Footer on every page ──────────────────────────────────────────────────────
function addFooter(doc) {
  rgb(doc, C.light);
  norm(doc, 7);
  doc.text(
    'UNIC Accommodation Office  —  For internal use only',
    PAGE_W / 2, PAGE_H - 5.5, { align: 'center' }
  );
}

// ── Main export function ──────────────────────────────────────────────────────
export async function generateListingsPdf(listings, activeFilters = {}) {
  // Pre-fetch all first images in parallel
  const imgData = await Promise.all(
    listings.map((l) => {
      const url = l.images?.[0]?.public_url;
      return url ? loadImageBase64(url) : Promise.resolve(null);
    })
  );

  const doc = new jsPDF({ unit: 'mm', format: 'a4', compress: true });

  // Calculate total pages needed
  const listingsPerFirstPage = Math.floor((PAGE_H - 55 - MX) / (CARD_H + GAP));
  const listingsPerPage      = Math.floor((PAGE_H - 30 - MX) / (CARD_H + GAP));
  const remaining = Math.max(0, listings.length - listingsPerFirstPage);
  const totalPages = 1 + Math.ceil(remaining / listingsPerPage);

  let page = 1;
  addPageHeader(doc, page, totalPages);
  let y = addMeta(doc, listings.length, activeFilters);

  for (let i = 0; i < listings.length; i++) {
    // Page break
    if (y + CARD_H > PAGE_H - MX - 8) {
      addFooter(doc);
      doc.addPage();
      page++;
      addPageHeader(doc, page, totalPages);
      y = 26;
    }

    drawCard(doc, listings[i], imgData[i], y);
    y += CARD_H + GAP;
  }

  addFooter(doc);

  const filename = `UNIC-Accommodations-${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}
