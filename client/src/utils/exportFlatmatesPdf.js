import jsPDF from 'jspdf';
import {
  C, PAGE_W, PAGE_H, MX, BANNER,
  rgb, fill, draw, bold, norm,
  loadLogoBase64, addBanner, savePdf,
} from './pdfCommon.js';

const GENDER_LABEL = {
  male: 'Male', female: 'Female', prefer_not_to_say: 'Undisclosed',
};

export const TYPE_LABEL = {
  all:      'All Students',
  has_flat: 'Has a Flat',
  looking:  'Looking for a Flat',
};

export const GENDER_FILTER_LABEL = {
  all: 'All Genders', ...GENDER_LABEL,
};

// ── Table geometry ────────────────────────────────────────────────────────────
const ROW_H  = 8;
const HEAD_H = 8;
const COLS = [
  { key: 'name',   label: 'Name',   w: 42 },
  { key: 'status', label: 'Status', w: 28 },
  { key: 'gender', label: 'Gender', w: 22 },
  { key: 'year',   label: 'Year',   w: 22 },
  { key: 'phone',  label: 'Phone',  w: 30 },
  { key: 'email',  label: 'Email',  w: 38 },
];

// Truncate to fit a column, appending an ellipsis when it overflows
function clip(doc, text, w) {
  const pad = 3;
  if (!text) return '';
  if (doc.getTextWidth(text) <= w - pad) return text;
  let out = text;
  while (out.length > 1 && doc.getTextWidth(`${out}…`) > w - pad) {
    out = out.slice(0, -1);
  }
  return `${out}…`;
}

function rowValues(s) {
  return {
    name:   `${s.first_name} ${s.last_name}`,
    status: s.has_flat ? 'Has a Flat' : 'Looking for a Flat',
    gender: GENDER_LABEL[s.gender] || s.gender || '',
    year:   s.year_of_study || '—',
    phone:  s.phone || '',
    email:  s.email || '—',
  };
}

// ── Meta block on the first page ──────────────────────────────────────────────
function addMeta(doc, total, selection) {
  let y = BANNER + 8;

  rgb(doc, C.dark);
  bold(doc, 17);
  doc.text('Flatmate Listings', MX, y);
  y += 6.5;

  const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
  const timeStr = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  norm(doc, 8.5); rgb(doc, C.mid);
  doc.text(`Exported ${dateStr} at ${timeStr}  ·  ${total} student${total === 1 ? '' : 's'} listed`, MX, y);
  y += 5;

  rgb(doc, C.light); norm(doc, 7.5);
  doc.text(
    `Selection: ${TYPE_LABEL[selection.type] || selection.type}  ·  ${GENDER_FILTER_LABEL[selection.gender] || selection.gender}`,
    MX, y,
  );
  y += 4.5;

  draw(doc, C.border);
  doc.setLineWidth(0.3);
  doc.line(MX, y, PAGE_W - MX, y);
  y += 5;
  return y;
}

// ── Table header (repeated on every page) ─────────────────────────────────────
function addTableHead(doc, y) {
  fill(doc, C.tagBg); draw(doc, C.border);
  doc.setLineWidth(0.25);
  doc.rect(MX, y, PAGE_W - MX * 2, HEAD_H, 'FD');

  bold(doc, 8); rgb(doc, C.dark);
  let x = MX;
  COLS.forEach((col) => {
    doc.text(col.label, x + 2, y + HEAD_H / 2 + 1.4);
    x += col.w;
  });
  return y + HEAD_H;
}

function drawRow(doc, s, y, striped) {
  if (striped) {
    fill(doc, C.cardBg);
    doc.rect(MX, y, PAGE_W - MX * 2, ROW_H, 'F');
  }

  // Status accent bar — green for "has a flat", blue for "looking"
  fill(doc, s.has_flat ? [16, 185, 129] : [59, 130, 246]);
  doc.rect(MX, y, 1, ROW_H, 'F');

  const values = rowValues(s);
  let x = MX;
  COLS.forEach((col) => {
    if (col.key === 'name') { bold(doc, 8); rgb(doc, C.dark); }
    else                    { norm(doc, 7.5); rgb(doc, C.mid); }
    doc.text(clip(doc, values[col.key], col.w), x + 2.5, y + ROW_H / 2 + 1.2);
    x += col.w;
  });

  draw(doc, C.border);
  doc.setLineWidth(0.15);
  doc.line(MX, y + ROW_H, PAGE_W - MX, y + ROW_H);
}

// ── Main export ───────────────────────────────────────────────────────────────
export async function generateFlatmatesPdf(students, selection = { type: 'all', gender: 'all' }) {
  const logoBase64 = await loadLogoBase64('/unic-logo.png');
  const doc = new jsPDF({ unit: 'mm', format: 'a4', compress: true });

  const bottom = PAGE_H - MX;

  // Pre-compute the page count so the "n / total" banner is accurate
  const firstPageRows = Math.floor((bottom - (BANNER + 8 + 16 + 5 + HEAD_H)) / ROW_H);
  const laterPageRows = Math.floor((bottom - (BANNER + 8 + HEAD_H)) / ROW_H);
  const remaining     = Math.max(0, students.length - firstPageRows);
  const totalPages    = Math.max(1, 1 + Math.ceil(remaining / laterPageRows));

  let page = 1;
  addBanner(doc, logoBase64, page, totalPages);
  let y = addMeta(doc, students.length, selection);
  y = addTableHead(doc, y);

  students.forEach((s, i) => {
    if (y + ROW_H > bottom) {
      doc.addPage();
      page++;
      addBanner(doc, logoBase64, page, totalPages);
      y = addTableHead(doc, BANNER + 8);
    }
    drawRow(doc, s, y, i % 2 === 1);
    y += ROW_H;
  });

  if (students.length === 0) {
    norm(doc, 9); rgb(doc, C.light);
    doc.text('No students match the selected criteria.', PAGE_W / 2, y + 12, { align: 'center' });
  }

  const filename = `UNIC-Flatmates-${new Date().toISOString().slice(0, 10)}.pdf`;
  await savePdf(doc, filename);
}
