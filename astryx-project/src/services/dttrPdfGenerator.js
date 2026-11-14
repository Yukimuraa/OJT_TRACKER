import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

/**
 * Converts a base64 Data URL or raw base64 string to a Uint8Array.
 */
export function base64ToUint8Array(base64OrDataUrl) {
  if (!base64OrDataUrl) {
    throw new Error('No PDF data provided.');
  }

  let base64 = base64OrDataUrl;
  if (base64.includes(',')) {
    base64 = base64.split(',')[1];
  }
  base64 = base64.trim();

  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Parses coordinate string hints like "x=100, y=200", "100, 200", or JSON.
 */
function parseCoordinate(coordStr) {
  if (!coordStr || typeof coordStr !== 'string') return null;
  const trimmed = coordStr.trim();
  try {
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      const obj = JSON.parse(trimmed);
      if (typeof obj.x === 'number' && typeof obj.y === 'number') {
        return { x: obj.x, y: obj.y };
      }
    }
  } catch {
    // Ignore JSON parse errors and continue to regex
  }

  const xyMatch = trimmed.match(/x\s*[:=]\s*([0-9.-]+)[\s,]+y\s*[:=]\s*([0-9.-]+)/i);
  if (xyMatch) {
    return { x: parseFloat(xyMatch[1]), y: parseFloat(xyMatch[2]) };
  }

  const numMatch = trimmed.match(/^([0-9.-]+)[\s,]+([0-9.-]+)$/);
  if (numMatch) {
    return { x: parseFloat(numMatch[1]), y: parseFloat(numMatch[2]) };
  }

  return null;
}

/**
 * Populates training logs onto an uploaded DTTR PDF template.
 *
 * @param {Object} options
 * @param {string} options.templatePdfDataUrl - Base64 data URL of the original PDF
 * @param {Object} options.headerInfo - Trainee details (studentName, agencyName, department, supervisorName, officialSchedule)
 * @param {Array}  options.monthRows - Day-by-day records (day 1..31, amArrival, amDeparture, pmArrival, pmDeparture, hours, tasks, hasRecord)
 * @param {number} options.totalHours - Sum of hours rendered in the month
 * @param {string} options.monthName - e.g. "November"
 * @param {string} options.selectedYear - e.g. "2026"
 * @param {Object} [options.fieldMap] - Optional manual field coordinate overrides
 * @returns {Promise<Uint8Array>} The populated PDF bytes
 */
export async function generatePopulatedDttrPdf({
  templatePdfDataUrl,
  headerInfo = {},
  monthRows = [],
  totalHours = 0,
  monthName = '',
  selectedYear = '',
  fieldMap = {},
}) {
  if (!templatePdfDataUrl) {
    throw new Error('Template PDF data is missing. Please re-upload or select a valid PDF template.');
  }

  const pdfBytes = base64ToUint8Array(templatePdfDataUrl);
  const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });

  const pageCount = pdfDoc.getPageCount();
  if (pageCount === 0) {
    throw new Error('The uploaded PDF does not contain any pages.');
  }

  // DTTR is a single-page document; target page 0
  const page = pdfDoc.getPages()[0];
  const { width, height } = page.getSize();

  // Baseline reference is Philippine Long Bond (8.5 x 13 inches = 612 x 936 pt)
  const BASE_WIDTH = 612;
  const BASE_HEIGHT = 936;
  const scaleX = width / BASE_WIDTH;
  const scaleY = height / BASE_HEIGHT;

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const textColor = rgb(0, 0, 0);

  // Helper: Draw horizontally centered text on a given baseline
  const drawCentered = (text, centerX, y, size, fontToUse = font) => {
    if (!text) return;
    const cleanText = String(text).trim();
    if (!cleanText) return;
    const textWidth = fontToUse.widthOfTextAtSize(cleanText, size);
    page.drawText(cleanText, {
      x: centerX - textWidth / 2,
      y,
      size,
      font: fontToUse,
      color: textColor,
    });
  };

  // Helper: Draw left-aligned text with automatic truncation to avoid overlapping grid lines
  const drawLeft = (text, x, y, size, fontToUse = font, maxWidth = null) => {
    if (!text) return;
    let cleanText = String(text).replace(/[\r\n\t]+/g, ' ').trim();
    if (!cleanText) return;

    if (maxWidth && maxWidth > 0) {
      if (fontToUse.widthOfTextAtSize(cleanText, size) > maxWidth) {
        while (cleanText.length > 3 && fontToUse.widthOfTextAtSize(cleanText + '...', size) > maxWidth) {
          cleanText = cleanText.slice(0, -1);
        }
        cleanText = cleanText.trim() + '...';
      }
    }

    page.drawText(cleanText, {
      x,
      y,
      size,
      font: fontToUse,
      color: textColor,
    });
  };

  /* ─────────────────────────────────────────────────────────────────────────────
     1. Document Header Information
  ───────────────────────────────────────────────────────────────────────────── */
  // 1A. Student Name
  const customNameCoord = parseCoordinate(fieldMap?.studentName);
  const nameX = customNameCoord ? customNameCoord.x : scaleX * 300.0;
  const nameY = customNameCoord ? customNameCoord.y : scaleY * 778.5;
  const nameSize = Math.max(7.5, 9.5 * Math.min(scaleX, scaleY));
  drawCentered(headerInfo.studentName || '', nameX, nameY, nameSize, fontBold);

  // 1B. Industry / Agency Name / Department
  const agencyDeptText = headerInfo.agencyName
    ? `${headerInfo.agencyName}${headerInfo.department ? ' / ' + headerInfo.department : ''}`
    : '';
  const customAgencyCoord = parseCoordinate(fieldMap?.agencyName || fieldMap?.department);
  const agencyX = customAgencyCoord ? customAgencyCoord.x : scaleX * 300.0;
  const agencyY = customAgencyCoord ? customAgencyCoord.y : scaleY * 744.5;
  const agencySize = Math.max(7, 8.5 * Math.min(scaleX, scaleY));
  drawCentered(agencyDeptText, agencyX, agencyY, agencySize, fontBold);

  // 1C. Month
  const monthText = `${(monthName || '').toUpperCase()} ${selectedYear || ''}`.trim();
  const customMonthCoord = parseCoordinate(fieldMap?.month);
  const monthX = customMonthCoord ? customMonthCoord.x : scaleX * 300.0;
  const monthY = customMonthCoord ? customMonthCoord.y : scaleY * 707.5;
  const monthSize = Math.max(7, 8.5 * Math.min(scaleX, scaleY));
  drawCentered(monthText, monthX, monthY, monthSize, fontBold);

  // 1D. Official Schedule (4 slots: AM Arrival, AM Departure, PM Arrival, PM Departure)
  const scheduleSlots = headerInfo.officialSchedule
    ? headerInfo.officialSchedule.split(' - ')
    : ['', '', '', ''];
  while (scheduleSlots.length < 4) scheduleSlots.push('');

  const scheduleBaseCoords = [
    { x: 212.0, y: 681.0 },
    { x: 261.5, y: 681.0 },
    { x: 311.0, y: 681.0 },
    { x: 360.0, y: 681.0 },
  ];
  const schedSize = Math.max(6, 7.5 * Math.min(scaleX, scaleY));
  scheduleSlots.forEach((slot, idx) => {
    if (slot && idx < scheduleBaseCoords.length) {
      const sx = scaleX * scheduleBaseCoords[idx].x;
      const sy = scaleY * scheduleBaseCoords[idx].y;
      drawCentered(slot, sx, sy, schedSize, fontBold);
    }
  });

  /* ─────────────────────────────────────────────────────────────────────────────
     2. Daily Training Logs Table (Days 1 to 31)
  ───────────────────────────────────────────────────────────────────────────── */
  // Baseline for Day 1 on 612 x 936 is y = 621.5 pt; step per row is 14.0 pt
  const DAY1_Y = 621.5;
  const ROW_STEP_Y = 14.0;

  // Center X coordinates of the columns on standard layout
  const colCenters = {
    amArrival: scaleX * 80.9,
    amDeparture: scaleX * 118.2,
    pmArrival: scaleX * 155.6,
    pmDeparture: scaleX * 193.1,
    hours: scaleX * 234.0,
  };
  const tasksStartX = scaleX * 260.0;
  const tasksMaxWidth = scaleX * 314.0;

  const tableFontSize = Math.max(5.8, 7.0 * Math.min(scaleX, scaleY));

  // Loop through all 31 days
  for (let day = 1; day <= 31; day++) {
    const row = monthRows.find((r) => r.day === day);
    if (!row || !row.hasRecord) continue;

    const rowY = scaleY * (DAY1_Y - (day - 1) * ROW_STEP_Y);

    // AM Arrival & Departure
    if (row.amArrival) {
      drawCentered(row.amArrival, colCenters.amArrival, rowY, tableFontSize, font);
    }
    if (row.amDeparture) {
      drawCentered(row.amDeparture, colCenters.amDeparture, rowY, tableFontSize, font);
    }

    // PM Arrival & Departure
    if (row.pmArrival) {
      drawCentered(row.pmArrival, colCenters.pmArrival, rowY, tableFontSize, font);
    }
    if (row.pmDeparture) {
      drawCentered(row.pmDeparture, colCenters.pmDeparture, rowY, tableFontSize, font);
    }

    // Hours
    if (row.hours) {
      drawCentered(String(row.hours), colCenters.hours, rowY, tableFontSize, fontBold);
    }

    // Tasks / Assignments Performed
    if (row.tasks) {
      drawLeft(row.tasks, tasksStartX, rowY, tableFontSize, font, tasksMaxWidth);
    }
  }

  /* ─────────────────────────────────────────────────────────────────────────────
     3. Total Number of Hours
  ───────────────────────────────────────────────────────────────────────────── */
  const customTotalCoord = parseCoordinate(fieldMap?.totalHours);
  // Designated box on standard 612x936 DTTR is [216.5, 172.15] to [256.0, 192.20]
  // Box width = 39.5 pt, center X = 236.25 pt, baseline Y = 177.0 pt
  const totalCenterX = customTotalCoord ? customTotalCoord.x : scaleX * 236.25;
  const totalBaselineY = customTotalCoord ? customTotalCoord.y : scaleY * 177.0;

  const totalHoursValue = Number(totalHours) || 0;
  if (totalHoursValue > 0) {
    const totalHoursStr = totalHoursValue.toFixed(1);
    let totalSize = Math.max(6.5, 8.0 * Math.min(scaleX, scaleY));
    // Ensure the number fits cleanly inside the 39.5 pt box with safe horizontal padding
    const maxBoxWidth = scaleX * 35.5;
    const textWidthAtBase = fontBold.widthOfTextAtSize(totalHoursStr, totalSize);
    if (textWidthAtBase > maxBoxWidth) {
      totalSize = Math.max(5.5, totalSize * (maxBoxWidth / textWidthAtBase));
    }
    drawCentered(totalHoursStr, totalCenterX, totalBaselineY, totalSize, fontBold);
  }

  return await pdfDoc.save();
}
