import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

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
  } catch {}

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
 * Enhanced DTTR PDF Populator with intelligent auto-fitting,
 * crisp typography, accurate coordinates, and overflow prevention.
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

  const page = pdfDoc.getPages()[0];
  const { width, height } = page.getSize();

  // Baseline reference is Philippine Long Bond (8.5 x 13 inches = 612 x 936 pt)
  const BASE_WIDTH = 612;
  const BASE_HEIGHT = 936;
  const scaleX = width / BASE_WIDTH;
  const scaleY = height / BASE_HEIGHT;
  const scaleMin = Math.min(scaleX, scaleY);

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const textColor = rgb(0, 0, 0);

  /**
   * Helper: Draw centered text with automatic font-size downscaling to fit maxWidth.
   * Prevents text from overflowing lines or colliding with neighboring elements.
   */
  const drawCenteredAutoFit = (text, centerX, y, baseSize, fontToUse = font, maxWidth = null, minSize = 6.0) => {
    if (!text) return;
    let cleanText = String(text).replace(/[\r\n\t]+/g, ' ').trim();
    if (!cleanText) return;

    let fontSize = baseSize;
    if (maxWidth && maxWidth > 0) {
      let currentWidth = fontToUse.widthOfTextAtSize(cleanText, fontSize);
      if (currentWidth > maxWidth) {
        fontSize = Math.max(minSize, fontSize * (maxWidth / currentWidth));
        currentWidth = fontToUse.widthOfTextAtSize(cleanText, fontSize);

        // If still exceeds at minSize, truncate cleanly with ellipsis
        if (currentWidth > maxWidth) {
          while (cleanText.length > 3 && fontToUse.widthOfTextAtSize(cleanText + '...', fontSize) > maxWidth) {
            cleanText = cleanText.slice(0, -1);
          }
          cleanText = cleanText.trim() + '...';
        }
      }
    }

    const finalWidth = fontToUse.widthOfTextAtSize(cleanText, fontSize);
    page.drawText(cleanText, {
      x: centerX - finalWidth / 2,
      y,
      size: fontSize,
      font: fontToUse,
      color: textColor,
    });
  };

  /**
   * Helper: Draw left-aligned text with automatic truncation to avoid overlapping grid lines.
   */
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
  // Underline in standard template: x=[149.8, 461.8] (width ~312 pt), y=777.2
  // Center is ~306.0 pt. Text baseline at y=781.0 (3.8pt above underline to clear descenders)
  const customNameCoord = parseCoordinate(fieldMap?.studentName);
  const nameX = customNameCoord ? customNameCoord.x : scaleX * 306.0;
  const nameY = customNameCoord ? customNameCoord.y : scaleY * 781.0;
  const nameBaseSize = Math.max(8.0, 9.5 * scaleMin);
  const nameMaxWidth = scaleX * 304.0;
  drawCenteredAutoFit(headerInfo.studentName || '', nameX, nameY, nameBaseSize, fontBold, nameMaxWidth, 7.0);

  // 1B. Industry / Agency Name / Department
  // Underline in standard template: x=[149.8, 461.8] (width ~312 pt), y=743.1
  // Heading label below underline: y=731.1 "INDUSTRY / AGENCY NAME / DEPARTMENT"
  // Text baseline at y=747.0 (3.9pt above underline to clear descenders and keep spacing readable)
  const agencyParts = [];
  if (headerInfo.agencyName?.trim()) agencyParts.push(headerInfo.agencyName.trim());
  if (headerInfo.department?.trim()) agencyParts.push(headerInfo.department.trim());
  const agencyDeptText = agencyParts.join('  /  ');

  const customAgencyCoord = parseCoordinate(fieldMap?.agencyName || fieldMap?.department);
  const agencyX = customAgencyCoord ? customAgencyCoord.x : scaleX * 306.0;
  const agencyY = customAgencyCoord ? customAgencyCoord.y : scaleY * 747.0;
  const agencyBaseSize = Math.max(7.5, 8.5 * scaleMin);
  const agencyMaxWidth = scaleX * 306.0;
  drawCenteredAutoFit(agencyDeptText, agencyX, agencyY, agencyBaseSize, fontBold, agencyMaxWidth, 6.5);

  // 1C. Month
  // Underline in standard template: x=[232.1, 380.0] (width ~148 pt), y=705.5
  // Heading label below underline: y=693.5 "MONTH"
  // Text baseline at y=709.0 (3.5pt above underline)
  const monthText = `${(monthName || '').toUpperCase()} ${selectedYear || ''}`.trim();
  const customMonthCoord = parseCoordinate(fieldMap?.month);
  const monthX = customMonthCoord ? customMonthCoord.x : scaleX * 306.0;
  const monthY = customMonthCoord ? customMonthCoord.y : scaleY * 709.0;
  const monthBaseSize = Math.max(7.5, 8.5 * scaleMin);
  const monthMaxWidth = scaleX * 144.0;
  drawCenteredAutoFit(monthText, monthX, monthY, monthBaseSize, fontBold, monthMaxWidth, 6.8);

  // 1D. Official Schedule (4 slots: AM Arrival, AM Departure, PM Arrival, PM Departure)
  // Exact slot underlines:
  // Slot 1: [205.7, 248.0] -> center ~227.0
  // Slot 2: [258.0, 298.0] -> center ~277.5
  // Slot 3: [308.0, 348.0] -> center ~328.0
  // Slot 4: [356.0, 396.0] -> center ~377.5
  // Hyphens are at 251.9, 302.3, 350.7; underline y=679.0; baseline y=682.5
  const scheduleSlots = headerInfo.officialSchedule
    ? headerInfo.officialSchedule.split(' - ')
    : ['', '', '', ''];
  while (scheduleSlots.length < 4) scheduleSlots.push('');

  const scheduleBaseCoords = [
    { x: 227.0, y: 682.5 },
    { x: 277.5, y: 682.5 },
    { x: 328.0, y: 682.5 },
    { x: 377.5, y: 682.5 },
  ];
  const schedSize = Math.max(6.2, 7.5 * scaleMin);
  const slotMaxWidth = scaleX * 42.0;

  scheduleSlots.forEach((slot, idx) => {
    if (slot?.trim() && idx < scheduleBaseCoords.length) {
      const sx = scaleX * scheduleBaseCoords[idx].x;
      const sy = scaleY * scheduleBaseCoords[idx].y;
      drawCenteredAutoFit(slot.trim(), sx, sy, schedSize, fontBold, slotMaxWidth, 5.8);
    }
  });

  /* ─────────────────────────────────────────────────────────────────────────────
     2. Daily Training Logs Table (Days 1 to 31)
  ───────────────────────────────────────────────────────────────────────────── */
  // Baseline for Day 1 on 612 x 936 is y = 621.5 pt; step per row is 14.0 pt
  const DAY1_Y = 621.5;
  const ROW_STEP_Y = 14.0;

  const colCenters = {
    amArrival: scaleX * 80.9,
    amDeparture: scaleX * 118.2,
    pmArrival: scaleX * 155.6,
    pmDeparture: scaleX * 193.1,
    hours: scaleX * 234.0,
  };
  const tasksStartX = scaleX * 260.0;
  const tasksMaxWidth = scaleX * 314.0;

  const tableFontSize = Math.max(6.0, 7.0 * scaleMin);

  for (let day = 1; day <= 31; day++) {
    const row = monthRows.find((r) => r.day === day);
    if (!row || !row.hasRecord) continue;

    const rowY = scaleY * (DAY1_Y - (day - 1) * ROW_STEP_Y);

    if (row.amArrival) {
      drawCenteredAutoFit(row.amArrival, colCenters.amArrival, rowY, tableFontSize, font, scaleX * 34.0, 5.5);
    }
    if (row.amDeparture) {
      drawCenteredAutoFit(row.amDeparture, colCenters.amDeparture, rowY, tableFontSize, font, scaleX * 34.0, 5.5);
    }
    if (row.pmArrival) {
      drawCenteredAutoFit(row.pmArrival, colCenters.pmArrival, rowY, tableFontSize, font, scaleX * 34.0, 5.5);
    }
    if (row.pmDeparture) {
      drawCenteredAutoFit(row.pmDeparture, colCenters.pmDeparture, rowY, tableFontSize, font, scaleX * 34.0, 5.5);
    }
    if (row.hours) {
      drawCenteredAutoFit(String(row.hours), colCenters.hours, rowY, tableFontSize, fontBold, scaleX * 36.0, 5.5);
    }
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
    const totalBaseSize = Math.max(7.0, 8.5 * scaleMin);
    const maxBoxWidth = scaleX * 35.5;
    drawCenteredAutoFit(totalHoursStr, totalCenterX, totalBaselineY, totalBaseSize, fontBold, maxBoxWidth, 5.5);
  }

  /* ─────────────────────────────────────────────────────────────────────────────
     4. Supervisor Signature Name (Optional / Professional Complete Overlay)
  ───────────────────────────────────────────────────────────────────────────── */
  // Underline at y=104.0; heading at y=93.4 "HTE Supervisor’s Name & Signature"
  if (headerInfo.supervisorName?.trim()) {
    const customSuperCoord = parseCoordinate(fieldMap?.supervisorSignature);
    const superX = customSuperCoord ? customSuperCoord.x : scaleX * 326.0;
    const superY = customSuperCoord ? customSuperCoord.y : scaleY * 107.5;
    const superBaseSize = Math.max(7.5, 8.5 * scaleMin);
    const superMaxWidth = scaleX * 144.0;
    drawCenteredAutoFit(headerInfo.supervisorName.trim(), superX, superY, superBaseSize, fontBold, superMaxWidth, 6.5);
  }

  return await pdfDoc.save();
}
