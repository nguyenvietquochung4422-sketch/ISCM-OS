// Client-side CSV export — no backend, no extra dependency. Opens directly
// in Excel/Sheets, which is why "export to Excel" and "export to CSV" are
// treated as the same feature across the Research module.

function escapeCsvCell(value) {
  const str = value === null || value === undefined ? '' : String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * @param {string} filename - without extension
 * @param {string[]} headers
 * @param {Array<Array<string|number>>} rows
 */
export function exportToCsv(filename, headers, rows) {
  const lines = [headers, ...rows].map((row) => row.map(escapeCsvCell).join(','));
  // Leading BOM so Excel opens UTF-8 (Vietnamese diacritics) correctly.
  const csvContent = '﻿' + lines.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
