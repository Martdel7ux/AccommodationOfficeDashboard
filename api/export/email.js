const nodemailer      = require('nodemailer');
const { supabase }    = require('../_db');
const { cors }        = require('../_cors');
const { requireAuth } = require('../_auth');

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

  const user = await requireAuth(req, res);
  if (!user) return;

  try {
    const { to, subject, message, filters, sender_name, sender_email } = req.body;
    if (!to) return res.status(400).json({ error: 'Recipient email is required' });

    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      return res.status(500).json({
        error: 'Email is not configured. Please add SMTP_USER and SMTP_PASS in your Vercel environment variables.',
      });
    }

    const { data: all } = await supabase.from('accommodations').select('*');
    const listings = getFiltered(all || [], filters || {});

    const transporter = nodemailer.createTransport({
      host:   process.env.SMTP_HOST || 'smtp.office365.com',
      port:   Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth:   { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      tls:    { ciphers: 'SSLv3', rejectUnauthorized: false },
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

    const displayName = sender_name || 'UNIC Accommodation Office';
    const replyTo     = sender_email || process.env.SMTP_USER;

    await transporter.sendMail({
      from:    process.env.EMAIL_FROM || `"${displayName}" <${process.env.SMTP_USER}>`,
      replyTo: `"${displayName}" <${replyTo}>`,
      to,
      subject: subject || 'UNIC Accommodation Listings',
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
};
