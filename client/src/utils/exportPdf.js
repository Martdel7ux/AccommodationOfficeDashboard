import jsPDF from 'jspdf';
import {
  C, PAGE_W, PAGE_H, MX, BANNER,
  rgb, fill, draw, bold, norm,
  loadLogoBase64, tagPill, addBanner, savePdf,
} from './pdfCommon.js';

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

function placeholder(doc, x, y) {
  fill(doc, [241, 245, 249]);
  draw(doc, C.border);
  doc.setLineWidth(0.2);
  doc.roundedRect(x, y, IMG_W, IMG_H, 2, 2, 'FD');
  rgb(doc, C.light);
  norm(doc, 8);
  doc.text('No Image', x + IMG_W / 2, y + IMG_H / 2 + 1, { align: 'center' });
}

// ── First-page meta ───────────────────────────────────────────────────────────
function addMeta(doc, total, filters) {
  let y = BANNER + 8;

  rgb(doc, C.dark);
  bold(doc, 17);
  doc.text('Off-campus Accommodation Listings', MX, y);
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
  if (l.phone) doc.text(`  ·  ${l.phone}`, TEXT_X + nameW, ty);
  const contact = [l.email, l.target_audience === 'staff' ? l.link : null].filter(Boolean).join('  ·  ');
  if (contact) {
    ty += 4;
    doc.text(doc.splitTextToSize(contact, TEXT_W)[0], TEXT_X, ty);
  }
  ty += 5.5;

  // Tags
  const AUDIENCE_MAP = { 'full-time': 'Full-time', erasmus: 'Erasmus', both: 'All Students', staff: 'Staff Only' };
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
export async function generateListingsPdf(listings, activeFilters = {}, filePrefix = 'UNIC-Accommodations') {
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

  const filename = `${filePrefix}-${new Date().toISOString().slice(0, 10)}.pdf`;
  await savePdf(doc, filename);
}

