import * as XLSX from 'xlsx';

const AUDIENCE_MAP   = { 'full-time': 'Full-time Students', erasmus: 'Erasmus Students', both: 'All Students' };
const FURNISH_MAP    = { 'fully-furnished': 'Fully Furnished', 'semi-furnished': 'Semi-Furnished' };
const TYPE_MAP       = { apartment: 'Apartment', studio: 'Studio', house: 'House', room: 'Room' };

export function generateListingsExcel(listings) {
  // ── Build rows ──────────────────────────────────────────────────────────────
  const rows = listings.map((l) => ({
    'Property Type':      TYPE_MAP[l.property_type]    || l.property_type    || '',
    'Bedrooms':           l.bedrooms                   || 'Studio',
    'Monthly Rent (€)':   Number(l.price),
    'Address':            l.address                    || '',
    'Status':             l.availability_status === 'available' ? 'Available' : 'Unavailable',
    'Available From':     l.availability_date
                            ? new Date(l.availability_date).toLocaleDateString('en-GB')
                            : 'Immediately',
    'Target Audience':    AUDIENCE_MAP[l.target_audience]  || l.target_audience  || '',
    'Furnishing':         FURNISH_MAP[l.furnishing_status] || l.furnishing_status || '',
    'Walking Distance':   l.walking_distance ? 'Yes' : 'No',
    'Landlord First Name': l.first_name  || '',
    'Landlord Last Name':  l.last_name   || '',
    'Phone':               l.phone       || '',
    'Email':               l.email       || '',
    'Description':         l.description || '',
    'Added By':            l.created_by_name || '',
    'Date Added':          l.created_at
                            ? new Date(l.created_at).toLocaleDateString('en-GB', {
                                day: '2-digit', month: 'short', year: 'numeric',
                              })
                            : '',
    'Time Added':          l.created_at
                            ? new Date(l.created_at).toLocaleTimeString('en-GB', {
                                hour: '2-digit', minute: '2-digit',
                              })
                            : '',
  }));

  // ── Create worksheet ────────────────────────────────────────────────────────
  const ws = XLSX.utils.json_to_sheet(rows);

  // Column widths
  ws['!cols'] = [
    { wch: 16 }, // Property Type
    { wch: 10 }, // Bedrooms
    { wch: 16 }, // Monthly Rent
    { wch: 36 }, // Address
    { wch: 14 }, // Status
    { wch: 16 }, // Available From
    { wch: 20 }, // Target Audience
    { wch: 18 }, // Furnishing
    { wch: 18 }, // Walking Distance
    { wch: 20 }, // First Name
    { wch: 20 }, // Last Name
    { wch: 18 }, // Phone
    { wch: 26 }, // Email
    { wch: 40 }, // Description
    { wch: 20 }, // Added By
    { wch: 16 }, // Date Added
    { wch: 12 }, // Time Added
  ];

  // ── Create workbook with a summary sheet ────────────────────────────────────
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Listings');

  // Summary sheet
  const available   = listings.filter((l) => l.availability_status === 'available').length;
  const unavailable = listings.length - available;
  const avgPrice    = listings.length
    ? Math.round(listings.reduce((s, l) => s + Number(l.price), 0) / listings.length)
    : 0;

  const summaryRows = [
    { Metric: 'Total Listings',        Value: listings.length },
    { Metric: 'Available',             Value: available },
    { Metric: 'Unavailable',           Value: unavailable },
    { Metric: 'Average Monthly Rent',  Value: `€${avgPrice.toLocaleString()}` },
    { Metric: 'Export Date',           Value: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) },
    { Metric: 'Export Time',           Value: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) },
  ];

  const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
  wsSummary['!cols'] = [{ wch: 24 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

  // ── Save ─────────────────────────────────────────────────────────────────────
  const filename = `UNIC-Accommodations-${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, filename);
}
