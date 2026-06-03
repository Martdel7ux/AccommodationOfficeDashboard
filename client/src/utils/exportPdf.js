import jsPDF from 'jspdf';

// ── Colours ───────────────────────────────────────────────────────────────────
const C = {
  redDark:  [140, 10,  28],
  red:      [196, 18,  48],
  redLight: [220, 40,  72],
  dark:     [15,  23,  42],
  mid:      [100, 116, 139],
  light:    [148, 163, 184],
  border:   [226, 232, 240],
  cardBg:   [250, 250, 252],
  white:    [255, 255, 255],
  rose:     [239, 68,  68],
  tagBg:    [241, 245, 249],
  tagText:  [100, 116, 139],
};

const PAGE_W = 210;
const PAGE_H = 297;
const MX     = 14;
const BANNER = 22;   // banner height
const CARD_H = 54;
const IMG_W  = 54;
const IMG_H  = 44;
const GAP    = 3;
const TEXT_X = MX + IMG_W + 7;
const TEXT_W = PAGE_W - MX - TEXT_X - 3;

const DISCLAIMER = `Please note that the University of Nicosia cannot guarantee the quality, the distance you may prefer, or any aspect of private accommodation, nor can it guarantee the availability of the listed options. These housing options are independent of the University, and you should contact and rent directly from the respective owners. Please note that owners usually require a deposit equal to one or two months' rent in order to secure the apartment/studio. Any amount outside this range may raise suspicion. If you are unsure, we recommend visiting the apartment to confirm its condition before proceeding with any rent payment.\n\nIf you need any further assistance or have specific questions, please do not hesitate to contact us.`;

// ── Load a property image (JPEG output, white fill for transparency) ──────────
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
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      } catch { resolve(null); }
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

// ── Load the logo (white fill ensures no black background on transparent PNGs)
function loadLogoBase64(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width  = img.naturalWidth  || 500;
        canvas.height = img.naturalHeight || 200;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/jpeg', 0.95));
      } catch { resolve(null); }
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const rgb  = (doc, col) => doc.setTextColor(...col);
const fill = (doc, col) => doc.setFillColor(...col);
const draw = (doc, col) => doc.setDrawColor(...col);
const bold = (doc, sz)  => { doc.setFont('helvetica', 'bold');   doc.setFontSize(sz); };
const norm = (doc, sz)  => { doc.setFont('helvetica', 'normal'); doc.setFontSize(sz); };

// Simulate a horizontal gradient by drawing thin vertical strips
function gradientRect(doc, x, y, w, h, from, to) {
  const steps = Math.ceil(w * 3);
  const sw = w / steps;
  for (let i = 0; i < steps; i++) {
    const t = i / steps;
    fill(doc, [
      Math.round(from[0] + (to[0] - from[0]) * t),
      Math.round(from[1] + (to[1] - from[1]) * t),
      Math.round(from[2] + (to[2] - from[2]) * t),
    ]);
    doc.rect(x + i * sw, y, sw + 0.2, h, 'F');
  }
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

function tagPill(doc, x, y, text) {
  const tw = doc.getTextWidth(text) + 5;
  fill(doc, C.tagBg); draw(doc, C.border);
  doc.setLineWidth(0.15);
  doc.roundedRect(x, y - 3.2, tw, 4.5, 1, 1, 'FD');
  rgb(doc, C.tagText);
  norm(doc, 7);
  doc.text(text, x + tw / 2, y, { align: 'center' });
  return tw + 2;
}

// ── Banner (on every page) ────────────────────────────────────────────────────
function addBanner(doc, logoBase64, pageNum, totalPages) {
  // Gradient: deep crimson → bright red
  gradientRect(doc, 0, 0, PAGE_W, BANNER, C.redDark, C.redLight);

  // Logo (white rounded box so it's always visible)
  const LOGO_BOX_W = 40;
  const LOGO_BOX_H = 16;
  const LOGO_BOX_X = MX;
  const LOGO_BOX_Y = (BANNER - LOGO_BOX_H) / 2;

  if (logoBase64) {
    // White backing card
    fill(doc, C.white);
    draw(doc, [255, 255, 255]);
    doc.setLineWidth(0);
    doc.roundedRect(LOGO_BOX_X, LOGO_BOX_Y, LOGO_BOX_W, LOGO_BOX_H, 2, 2, 'F');
    try {
      doc.addImage(
        logoBase64, 'PNG',
        LOGO_BOX_X + 2, LOGO_BOX_Y + 1,
        LOGO_BOX_W - 4, LOGO_BOX_H - 2,
        undefined, 'FAST'
      );
    } catch { /* skip if format unsupported */ }
  }

  // Text to the right of the logo box
  const textX = LOGO_BOX_X + LOGO_BOX_W + 6;
  rgb(doc, C.white);
  bold(doc, 11.5);
  doc.text('UNIC Accommodation Office', textX, BANNER / 2 - 1);
  norm(doc, 7.5);
  doc.text('University of Nicosia Off Campus Accommodation Options', textX, BANNER / 2 + 5);

  // Page number
  bold(doc, 8);
  doc.text(`${pageNum} / ${totalPages}`, PAGE_W - MX, BANNER / 2 + 1.5, { align: 'right' });
}

// ── First-page meta ───────────────────────────────────────────────────────────
function addMeta(doc, total, filters) {
  let y = BANNER + 8;

  rgb(doc, C.dark);
  bold(doc, 17);
  doc.text('Accommodation Listings', MX, y);
  y += 6.5;

  const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
  const timeStr = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  norm(doc, 8.5); rgb(doc, C.mid);
  doc.text(`Exported ${dateStr} at ${timeStr}  ·  ${total} propert${total === 1 ? 'y' : 'ies'} listed`, MX, y);
  y += 5;

  const parts = [];
  if (filters.status && filters.status !== 'all')              parts.push(`Status: ${filters.status}`);
  if (filters.property_type)                                    parts.push(`Type: ${filters.property_type}`);
  if (filters.bedrooms)                                         parts.push(`${filters.bedrooms} bed`);
  if (filters.min_price > 0 || filters.max_price < 2000)       parts.push(`€${filters.min_price}–€${filters.max_price}`);
  if (filters.target_audience && filters.target_audience !== 'all') parts.push(`Audience: ${filters.target_audience}`);
  if (filters.walking_distance)                                 parts.push('Walking distance');

  if (parts.length) {
    rgb(doc, C.light); norm(doc, 7.5);
    doc.text(`Filters: ${parts.join('  ·  ')}`, MX, y);
    y += 4.5;
  }

  draw(doc, C.border);
  doc.setLineWidth(0.3);
  doc.line(MX, y, PAGE_W - MX, y);
  y += 5;
  return y;
}

// ── Single listing card ───────────────────────────────────────────────────────
function drawCard(doc, l, imgBase64, y) {
  fill(doc, C.cardBg); draw(doc, C.border);
  doc.setLineWidth(0.25);
  doc.roundedRect(MX, y, PAGE_W - MX * 2, CARD_H, 2.5, 2.5, 'FD');

  // Image
  const imgX = MX + 3;
  const imgY = y + (CARD_H - IMG_H) / 2;
  if (imgBase64) {
    try {
      doc.addImage(imgBase64, 'JPEG', imgX, imgY, IMG_W, IMG_H, undefined, 'FAST');
      draw(doc, [203, 213, 225]); doc.setLineWidth(0.2);
      doc.roundedRect(imgX, imgY, IMG_W, IMG_H, 1.5, 1.5);
    } catch { placeholder(doc, imgX, imgY); }
  } else {
    placeholder(doc, imgX, imgY);
  }

  // Text column
  let ty = y + 8;

  // Property type + price (no status pill)
  const TYPE_MAP = { apartment: 'Apartment', studio: 'Studio', house: 'House', room: 'Room' };
  const bedsLabel = l.bedrooms ? `${l.bedrooms}-Bedroom ` : '';
  const typeLabel = TYPE_MAP[l.property_type] || l.property_type;

  rgb(doc, C.dark); bold(doc, 11.5);
  doc.text(`${bedsLabel}${typeLabel}`, TEXT_X, ty);

  rgb(doc, C.red); bold(doc, 11.5);
  doc.text(`€${Number(l.price).toLocaleString()}/mo`, PAGE_W - MX - 3, ty, { align: 'right' });
  ty += 5;

  // Address
  norm(doc, 8.5); rgb(doc, C.mid);
  const addrLines = doc.splitTextToSize(l.address, TEXT_W);
  doc.text(addrLines[0], TEXT_X, ty);
  ty += 5;

  // Rule
  draw(doc, [241, 245, 249]); doc.setLineWidth(0.2);
  doc.line(TEXT_X, ty, PAGE_W - MX - 3, ty);
  ty += 4;

  // Landlord
  bold(doc, 8); rgb(doc, C.dark);
  const nameStr = `${l.first_name} ${l.last_name}`;
  doc.text(nameStr, TEXT_X, ty);
  const nameW = doc.getTextWidth(nameStr);
  norm(doc, 8); rgb(doc, C.mid);
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
    tagX += tagPill(doc, tagX, ty, t);
  });
}

// ── Disclaimer page ───────────────────────────────────────────────────────────
function addDisclaimerPage(doc, logoBase64, pageNum, totalPages) {
  doc.addPage();
  addBanner(doc, logoBase64, pageNum, totalPages);

  let y = BANNER + 12;

  // Section heading
  rgb(doc, C.dark); bold(doc, 13);
  doc.text('Important Notice', MX, y);
  y += 2;

  draw(doc, C.red); doc.setLineWidth(0.5);
  doc.line(MX, y + 1, MX + 38, y + 1);
  y += 7;

  // Disclaimer body
  norm(doc, 9); rgb(doc, C.mid);
  doc.setLineHeightFactor(1.55);
  const lines = doc.splitTextToSize(DISCLAIMER, PAGE_W - MX * 2);
  doc.text(lines, MX, y);
  y += lines.length * 9 * 0.3528 * 1.55 + 10;

}

// ── Main export ───────────────────────────────────────────────────────────────
export async function generateListingsPdf(listings, activeFilters = {}) {
  // Fetch logo and all property images in parallel
  const [logoBase64, ...imgData] = await Promise.all([
    loadLogoBase64('/unic-logo.png'),
    ...listings.map((l) => {
      const url = l.images?.[0]?.public_url;
      return url ? loadImageBase64(url) : Promise.resolve(null);
    }),
  ]);

  const doc = new jsPDF({ unit: 'mm', format: 'a4', compress: true });

  // Calculate total pages (listings + 1 disclaimer page)
  const firstPageStart = BANNER + 8 + 16 + 5;
  const listingsPerFirstPage = Math.floor((PAGE_H - firstPageStart - MX) / (CARD_H + GAP));
  const listingsPerPage      = Math.floor((PAGE_H - BANNER - 10 - MX) / (CARD_H + GAP));
  const remaining   = Math.max(0, listings.length - listingsPerFirstPage);
  const listingPages = 1 + Math.ceil(remaining / listingsPerPage);
  const totalPages  = listingPages + 1; // +1 for disclaimer

  let page = 1;
  addBanner(doc, logoBase64, page, totalPages);
  let y = addMeta(doc, listings.length, activeFilters);

  for (let i = 0; i < listings.length; i++) {
    if (y + CARD_H > PAGE_H - MX - 6) {
      doc.addPage();
      page++;
      addBanner(doc, logoBase64, page, totalPages);
      y = BANNER + 8;
    }
    drawCard(doc, listings[i], imgData[i], y);
    y += CARD_H + GAP;
  }

  // Disclaimer page
  addDisclaimerPage(doc, logoBase64, totalPages, totalPages);

  const filename = `UNIC-Accommodations-${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}
