const { jsPDF } = require('jspdf');
require('jspdf-autotable');

/**
 * Generate a PDF report buffer from title, columns, rows, and optional filters.
 * @param {string} title
 * @param {Array<{header: string, dataKey: string}>} columns
 * @param {Array<Object>} rows
 * @param {Object} [filters]
 * @returns {Buffer}
 */
function generateReportPdf(title, columns, rows, filters) {
  const doc = new jsPDF({ orientation: columns.length > 6 ? 'landscape' : 'portrait' });

  // Title
  doc.setFontSize(16);
  doc.setTextColor(40, 40, 40);
  doc.text(title, 14, 20);

  // Subtitle with filters and date
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  const parts = [`Generated: ${new Date().toISOString().split('T')[0]}`];
  if (filters) {
    if (filters.date_from) parts.push(`From: ${filters.date_from}`);
    if (filters.date_to) parts.push(`To: ${filters.date_to}`);
  }
  doc.text(parts.join('  |  '), 14, 28);

  // Table
  const head = [columns.map(c => c.header)];
  const body = rows.map(row => columns.map(c => {
    const val = row[c.dataKey];
    return val != null ? String(val) : '';
  }));

  doc.autoTable({
    startY: 34,
    head,
    body,
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [99, 102, 241], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [245, 245, 250] },
    margin: { left: 14, right: 14 },
  });

  // Footer — page count
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.getWidth() - 30, doc.internal.pageSize.getHeight() - 10);
  }

  return Buffer.from(doc.output('arraybuffer'));
}

module.exports = { generateReportPdf };
