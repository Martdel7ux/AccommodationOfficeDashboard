import * as XLSX from 'xlsx';
import { TYPE_LABEL, GENDER_FILTER_LABEL } from './exportFlatmatesPdf.js';

const GENDER_LABEL = {
  male: 'Male', female: 'Female', prefer_not_to_say: 'Undisclosed',
};

export function generateFlatmatesExcel(students, selection = { type: 'all', gender: 'all' }) {
  // ── Build rows ──────────────────────────────────────────────────────────────
  const rows = students.map((s) => ({
    'First Name':    s.first_name || '',
    'Last Name':     s.last_name  || '',
    'Status':        s.has_flat ? 'Has a Flat' : 'Looking for a Flat',
    'Gender':        GENDER_LABEL[s.gender] || s.gender || '',
    'Year of Study': s.year_of_study || '',
    'Phone':         s.phone || '',
    'Email':         s.email || '',
    'Notes':         s.notes || '',
    'Added By':      s.created_by_name || '',
    'Date Added':    s.created_at
                       ? new Date(s.created_at).toLocaleDateString('en-GB', {
                           day: '2-digit', month: 'short', year: 'numeric',
                         })
                       : '',
  }));

  // ── Create worksheet ────────────────────────────────────────────────────────
  const ws = XLSX.utils.json_to_sheet(rows);

  ws['!cols'] = [
    { wch: 20 }, // First Name
    { wch: 20 }, // Last Name
    { wch: 20 }, // Status
    { wch: 14 }, // Gender
    { wch: 16 }, // Year of Study
    { wch: 18 }, // Phone
    { wch: 28 }, // Email
    { wch: 40 }, // Notes
    { wch: 20 }, // Added By
    { wch: 16 }, // Date Added
  ];

  // ── Create workbook with a summary sheet ────────────────────────────────────
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Flatmates');

  const hasFlat = students.filter((s) => s.has_flat).length;

  const summaryRows = [
    { Metric: 'Total Students',      Value: students.length },
    { Metric: 'Has a Flat',          Value: hasFlat },
    { Metric: 'Looking for a Flat',  Value: students.length - hasFlat },
    { Metric: 'Type Selected',       Value: TYPE_LABEL[selection.type] || selection.type },
    { Metric: 'Gender Selected',     Value: GENDER_FILTER_LABEL[selection.gender] || selection.gender },
    { Metric: 'Export Date',         Value: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) },
    { Metric: 'Export Time',         Value: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) },
  ];

  const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
  wsSummary['!cols'] = [{ wch: 24 }, { wch: 22 }];
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

  // ── Save ─────────────────────────────────────────────────────────────────────
  const filename = `UNIC-Flatmates-${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, filename);
}
