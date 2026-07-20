// Shared PDF primitives used by the accommodation and flatmate exporters.

// ── Colours ───────────────────────────────────────────────────────────────────
export const C = {
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

export const PAGE_W = 210;
export const PAGE_H = 297;
export const MX     = 14;
export const BANNER = 22;   // banner height

// ── Helpers ───────────────────────────────────────────────────────────────────
export const rgb  = (doc, col) => doc.setTextColor(...col);
export const fill = (doc, col) => doc.setFillColor(...col);
export const draw = (doc, col) => doc.setDrawColor(...col);
export const bold = (doc, sz)  => { doc.setFont('helvetica', 'bold');   doc.setFontSize(sz); };
export const norm = (doc, sz)  => { doc.setFont('helvetica', 'normal'); doc.setFontSize(sz); };

// ── Load the logo (white fill ensures no black background on transparent PNGs)
export function loadLogoBase64(url) {
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

// Simulate a horizontal gradient by drawing thin vertical strips
export function gradientRect(doc, x, y, w, h, from, to) {
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

export function tagPill(doc, x, y, text) {
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
export function addBanner(doc, logoBase64, pageNum, totalPages) {
  // Gradient: deep crimson on the left → pure white on the right
  gradientRect(doc, 0, 0, PAGE_W, BANNER, C.redDark, C.white);

  // Logo on the right (over white area) — placed directly, no backing box
  const LOGO_W  = 52;
  const LOGO_H  = 15;
  const LOGO_X  = PAGE_W - MX - LOGO_W;
  const LOGO_Y  = (BANNER - LOGO_H) / 2;

  if (logoBase64) {
    try {
      doc.addImage(logoBase64, 'JPEG', LOGO_X, LOGO_Y, LOGO_W, LOGO_H, undefined, 'FAST');
    } catch { /* skip if unsupported */ }
  }

  // Page number — dark text, sits just above the logo
  rgb(doc, [100, 116, 139]);
  bold(doc, 7.5);
  doc.text(`${pageNum} / ${totalPages}`, PAGE_W - MX, BANNER - 2.5, { align: 'right' });
}

// ── Save (native picker where available, direct download otherwise) ───────────
export async function savePdf(doc, filename) {
  const blob = doc.output('blob');

  if (typeof window.showSaveFilePicker === 'function') {
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName: filename,
        types: [{ description: 'PDF Document', accept: { 'application/pdf': ['.pdf'] } }],
      });
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
    } catch (err) {
      // User cancelled — do nothing. Any other error falls back to direct download.
      if (err.name !== 'AbortError') {
        doc.save(filename);
      }
    }
  } else {
    // Firefox / Safari fallback — direct download
    doc.save(filename);
  }
}
