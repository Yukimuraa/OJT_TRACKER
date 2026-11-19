import React, { useState, useMemo, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Dialog, DialogHeader } from '@astryxdesign/core/Dialog';
import { VStack } from '@astryxdesign/core/VStack';
import { HStack } from '@astryxdesign/core/HStack';
import { Grid } from '@astryxdesign/core/Grid';
import { Text } from '@astryxdesign/core/Text';
import { Button } from '@astryxdesign/core/Button';
import { TextInput } from '@astryxdesign/core/TextInput';
import { Selector } from '@astryxdesign/core/Selector';
import { Card } from '@astryxdesign/core/Card';
import { PrinterIcon } from '../common/BrandIcons';
import { loadStoredProfile } from '../../services/profileService';
import { loadOnboardingData } from '../../services/onboardingService';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const CURRENT_DATE = new Date();
const DEFAULT_YEAR = CURRENT_DATE.getFullYear();
const DEFAULT_MONTH = CURRENT_DATE.getMonth() + 1; // 1-12

function formatTime12h(timeStr) {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':').map(Number);
  if (isNaN(h) || isNaN(m)) return timeStr;
  const period = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 || 12;
  return `${displayH}:${String(m).padStart(2, '0')} ${period}`;
}

function getDefaultHeaderInfo(currentUserId, currentUser) {
  const profile = loadStoredProfile(currentUserId);
  const onboarding = loadOnboardingData(currentUserId);

  // Build the 4-slot official schedule string: MorningIn - MorningOut - AfternoonIn - AfternoonOut
  const morningIn = onboarding?.morningTimeIn ? formatTime12h(onboarding.morningTimeIn) : '8:00 AM';
  const morningOut = onboarding?.morningTimeOut ? formatTime12h(onboarding.morningTimeOut) : '12:00 PM';
  const afternoonIn = onboarding?.afternoonTimeIn ? formatTime12h(onboarding.afternoonTimeIn) : '1:00 PM';
  const afternoonOut = onboarding?.afternoonTimeOut ? formatTime12h(onboarding.afternoonTimeOut) : '5:00 PM';

  return {
    studentName: profile?.fullName || currentUser?.fullName || '',
    studentId: profile?.studentId || currentUser?.studentId || '',
    program: profile?.program || onboarding?.program || '',
    agencyName: profile?.company || onboarding?.companyName || '',
    department: profile?.department || onboarding?.companyDepartment || '',
    supervisorName: profile?.supervisor || onboarding?.supervisorName || '',
    officialSchedule: `${morningIn} - ${morningOut} - ${afternoonIn} - ${afternoonOut}`,
  };
}

/* ─────────────────────────────────────────────────────────────────────────────
   DTTR Printable Document — official CHMSU CCS portrait long-bond layout
───────────────────────────────────────────────────────────────────────────── */
function DttrDocument({ id = 'dttr-document-root', headerInfo, monthRows, totalHours, monthName, selectedYear, templateVariant = 'system_chmsu_ccs' }) {
  // Table row style helpers — deliberately compact for one-page fit
  const cell = (extra = {}) => ({
    border: '1px solid #000',
    padding: '1.5px 2px',
    fontSize: '7pt',
    color: '#000',
    verticalAlign: 'middle',
    ...extra,
  });

  const thCell = (extra = {}) => ({
    border: '1px solid #000',
    padding: '2px 2px',
    fontSize: '7pt',
    fontWeight: 'bold',
    textAlign: 'center',
    backgroundColor: '#fff',
    color: '#000',
    verticalAlign: 'middle',
    ...extra,
  });

  const scheduleSlots = headerInfo.officialSchedule
    ? headerInfo.officialSchedule.split(' - ')
    : ['', '', '', ''];
  while (scheduleSlots.length < 4) scheduleSlots.push('');

  return (
    <div
      id={id}
      style={{
        fontFamily: 'Arial, Helvetica, sans-serif',
        backgroundColor: '#ffffff',
        color: '#000000',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      {/* ── Header ── */}
      {templateVariant === 'system_chmsu_ccs' ? (
        <>
          <img
            src="/assets/chmsu-header.png"
            alt="CHMSU Header"
            style={{ width: '100%', display: 'block', marginBottom: 1 }}
          />
          <div
            style={{
              textAlign: 'right',
              fontSize: '8.5pt',
              fontWeight: 'bold',
              color: '#555555',
              letterSpacing: '0.03em',
              marginBottom: 4,
              paddingRight: 2,
            }}
          >
            College of Computer Studies
          </div>
        </>
      ) : (
        <div
          style={{
            textAlign: 'center',
            marginBottom: 8,
            borderBottom: '2px solid #10b981',
            paddingBottom: 6,
          }}
        >
          <div
            style={{
              fontSize: '12pt',
              fontWeight: 'bold',
              color: '#142b49',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            ON-THE-JOB TRAINING PROGRAM
          </div>
          <div style={{ fontSize: '7.5pt', color: '#64748b', marginTop: 2, fontWeight: 600 }}>
            Official Trainee Daily Attendance &amp; Tasks Record · System Template
          </div>
        </div>
      )}

      {/* ── DTTR Title ── */}
      <div
        style={{
          textAlign: 'center',
          fontSize: '10.5pt',
          fontWeight: 'bold',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          marginBottom: 6,
          color: '#000000',
        }}
      >
        Daily Time &amp; Tasks Record (DTTR)
      </div>

      {/* ── Student Information Section (Centered per original CHMSU DTTR PDF) ── */}
      <div style={{ marginBottom: 6, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* 1. NAME */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '56%', marginBottom: 4 }}>
          <div
            style={{
              width: '100%',
              borderBottom: '1px solid #000000',
              textAlign: 'center',
              fontWeight: 'bold',
              fontSize: '9pt',
              paddingBottom: 1,
              letterSpacing: '0.04em',
              minHeight: 14,
            }}
          >
            {headerInfo.studentName}
          </div>
          <div
            style={{
              fontSize: '6.5pt',
              fontWeight: 'bold',
              letterSpacing: '0.06em',
              marginTop: 1,
              textAlign: 'center',
            }}
          >
            NAME
          </div>
        </div>

        {/* 2. INDUSTRY / AGENCY NAME / DEPARTMENT */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '56%', marginBottom: 4 }}>
          <div
            style={{
              width: '100%',
              borderBottom: '1px solid #000000',
              textAlign: 'center',
              fontWeight: 'bold',
              fontSize: '8.5pt',
              paddingBottom: 1,
              minHeight: 14,
              wordBreak: 'break-word',
              overflowWrap: 'anywhere',
              whiteSpace: 'normal',
            }}
          >
            {[headerInfo.agencyName, headerInfo.department].filter(Boolean).join('  /  ')}
          </div>
          <div
            style={{
              fontSize: '6.5pt',
              fontWeight: 'bold',
              letterSpacing: '0.02em',
              marginTop: 1,
              textAlign: 'center',
              whiteSpace: 'nowrap',
            }}
          >
            INDUSTRY / AGENCY NAME / DEPARTMENT
          </div>
        </div>

        {/* 3. MONTH */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '30%', marginBottom: 4 }}>
          <div
            style={{
              width: '100%',
              borderBottom: '1px solid #000000',
              textAlign: 'center',
              fontWeight: 'bold',
              fontSize: '8.5pt',
              paddingBottom: 1,
              letterSpacing: '0.05em',
              minHeight: 14,
            }}
          >
            {monthName.toUpperCase()} {selectedYear}
          </div>
          <div
            style={{
              fontSize: '6.5pt',
              fontWeight: 'bold',
              letterSpacing: '0.06em',
              marginTop: 1,
              textAlign: 'center',
            }}
          >
            MONTH
          </div>
        </div>

        {/* 4. Official Hour Of Arrival And Departure */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0 }}>
            {scheduleSlots.map((slot, idx, arr) => (
              <React.Fragment key={idx}>
                <div
                  style={{
                    borderBottom: '1px solid #000000',
                    minWidth: 60,
                    textAlign: 'center',
                    fontSize: '7pt',
                    fontWeight: 'bold',
                    paddingBottom: 1,
                  }}
                >
                  {slot}
                </div>
                {idx < arr.length - 1 && (
                  <span style={{ margin: '0 3px', fontWeight: 'bold', fontSize: '7.5pt' }}>-</span>
                )}
              </React.Fragment>
            ))}
          </div>
          <div
            style={{
              fontSize: '6.5pt',
              fontWeight: 'bold',
              marginTop: 1,
              textAlign: 'center',
            }}
          >
            Official Hour Of Arrival And Departure
          </div>
        </div>
      </div>

      {/* ── Attendance Table ── */}
      <table
        className="dttr-table"
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          border: '1px solid #000',
          tableLayout: 'fixed',
        }}
      >
        {/* colgroup widths: 6+11+11+11+11+7+43 = 100% */}
        <colgroup>
          <col style={{ width: '6%' }} />
          <col style={{ width: '11%' }} />
          <col style={{ width: '11%' }} />
          <col style={{ width: '11%' }} />
          <col style={{ width: '11%' }} />
          <col style={{ width: '7%' }} />
          <col style={{ width: '43%' }} />
        </colgroup>
        <thead>
          {/* Tier-1: DAY | AM (colspan 2) | PM (colspan 2) | NO. OF HOURS | TASKS */}
          <tr>
            <th rowSpan={2} style={thCell({ width: '6%' })}>DAY</th>
            <th colSpan={2} style={thCell()}>AM</th>
            <th colSpan={2} style={thCell()}>PM</th>
            <th rowSpan={2} style={thCell({ width: '7%', fontSize: '6pt', lineHeight: 1.1 })}>NO.{'\u00A0'}OF{'\u00A0'}HRS</th>
            <th rowSpan={2} style={thCell({ textAlign: 'left', paddingLeft: 4, width: '43%' })}>
              TASKS / ASSIGNMENTS PERFORMED
            </th>
          </tr>
          {/* Tier-2: ARRIVAL | DEPARTURE | ARRIVAL | DEPARTURE */}
          <tr>
            <th style={thCell({ fontSize: '6.5pt' })}>ARRIVAL</th>
            <th style={thCell({ fontSize: '6.5pt' })}>DEPARTURE</th>
            <th style={thCell({ fontSize: '6.5pt' })}>ARRIVAL</th>
            <th style={thCell({ fontSize: '6.5pt' })}>DEPARTURE</th>
          </tr>
        </thead>
        <tbody>
          {/* Always render exactly 31 rows */}
          {Array.from({ length: 31 }, (_, i) => i + 1).map((dayNum) => {
            const row = monthRows.find((r) => r.dayNum === dayNum);
            const isBlank = !row;
            const isWeekend = row?.isWeekend ?? false;
            return (
              <tr
                key={dayNum}
                style={{ backgroundColor: isWeekend && !row?.hasRecord ? '#f7f7f7' : '#fff' }}
              >
                <td style={cell({ textAlign: 'center', fontWeight: row?.hasRecord ? '600' : 'normal' })}>
                  {dayNum}
                </td>
                <td style={cell({ textAlign: 'center' })}>
                  {isBlank ? '' : row.amArrival}
                </td>
                <td style={cell({ textAlign: 'center' })}>
                  {isBlank ? '' : row.amDeparture}
                </td>
                <td style={cell({ textAlign: 'center' })}>
                  {isBlank ? '' : row.pmArrival}
                </td>
                <td style={cell({ textAlign: 'center' })}>
                  {isBlank ? '' : row.pmDeparture}
                </td>
                <td style={cell({ textAlign: 'center', fontWeight: row?.hours ? '700' : 'normal' })}>
                  {isBlank ? '' : row.hours}
                </td>
                <td
                  style={cell({
                    textAlign: 'left',
                    paddingLeft: 4,
                    wordBreak: 'break-word',
                    lineHeight: '1.15',
                  })}
                >
                  {isBlank ? '' : row.tasks}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* ── Total Hours box ── */}
      <div
        style={{
          marginTop: 3,
          marginBottom: 4,
          display: 'flex',
          justifyContent: 'flex-start',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            border: '1px solid #000',
            padding: '2px 8px',
            fontSize: '7.5pt',
            fontWeight: 'bold',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <span>TOTAL NO. OF HOURS:</span>
          <span
            style={{
              borderBottom: '1px solid #000',
              minWidth: 44,
              textAlign: 'center',
              fontWeight: 'bold',
              fontSize: '8pt',
            }}
          >
            {totalHours > 0 ? totalHours.toFixed(1) : ''}
          </span>
        </div>
      </div>

      {/* ── Certification Statement ── */}
      <p
        style={{
          fontSize: '7pt',
          fontStyle: 'italic',
          margin: '0 0 6px 0',
          color: '#000000',
          textAlign: 'justify',
          lineHeight: '1.3',
        }}
      >
        I hereby certify on my honor that the above is a true and correct report of hours and
        assignments/tasks performed, a record of which was made daily at the time of arrival and
        departure from the office.
      </p>

      {/* ── Signature Lines ── */}
      <div
        className="dttr-signature-section"
        style={{
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'flex-end',
          marginBottom: 6,
          gap: 32,
        }}
      >
        {/* Student Signature */}
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div
            style={{
              borderBottom: '1.5px solid #000',
              minHeight: 24,
              marginBottom: 2,
            }}
          />
          <div style={{ fontSize: '7.5pt', color: '#000' }}>
            Student&apos;s Signature
          </div>
        </div>

        {/* HTE Supervisor Signature */}
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div
            style={{
              borderBottom: '1.5px solid #000',
              minHeight: 24,
              marginBottom: 2,
            }}
          />
          <div style={{ fontSize: '7.5pt', color: '#000' }}>
            HTE Supervisor&apos;s Name &amp; Signature
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      {templateVariant === 'system_chmsu_ccs' ? (
        <img
          src="/assets/chmsu-footer.png"
          alt="CHMSU Footer"
          style={{ width: '100%', display: 'block', marginTop: 2 }}
        />
      ) : (
        <div
          style={{
            borderTop: '1px solid #10b981',
            paddingTop: 4,
            marginTop: 6,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '6.5pt',
            color: '#64748b',
          }}
        >
          <span>Verified OJT Training Attendance &amp; Task Report</span>
          <span>OJT Tracker System · Official Form</span>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Interactive Dialog Content (controls hidden on print)
───────────────────────────────────────────────────────────────────────────── */
function DttrPrintContent({ onOpenChange, records = [], currentUser = null, templateVariant = 'system_chmsu_ccs' }) {
  const currentUserId = currentUser?.id || null;

  const [selectedYear, setSelectedYear] = useState(() => String(DEFAULT_YEAR));
  const [selectedMonth, setSelectedMonth] = useState(() => String(DEFAULT_MONTH));
  const [showSettings, setShowSettings] = useState(false);

  const [headerInfo, setHeaderInfo] = useState(() =>
    getDefaultHeaderInfo(currentUserId, currentUser)
  );

  // Draft copy used only while the Edit Header form is open.
  // On Save it is committed to headerInfo; on Cancel changes are discarded.
  const [draftInfo, setDraftInfo] = useState(headerInfo);

  const { monthRows, totalHours, recordedDaysCount, monthName } = useMemo(() => {
    const yr = parseInt(selectedYear, 10) || DEFAULT_YEAR;
    const mo = parseInt(selectedMonth, 10) || DEFAULT_MONTH;
    const mName = MONTH_NAMES[mo - 1] || 'Month';
    const totalDays = new Date(yr, mo, 0).getDate();

    const recordMap = new Map();
    let sumHours = 0;
    let daysWithRecords = 0;

    const prefix = `${yr}-${String(mo).padStart(2, '0')}`;
    for (const r of records) {
      if (r.date && r.date.startsWith(prefix)) {
        recordMap.set(r.date, r);
        const hrs = Number(r.hours) || 0;
        sumHours += hrs;
        if (hrs > 0 || r.morningSession?.attended || r.afternoonSession?.attended) {
          daysWithRecords += 1;
        }
      }
    }

    const rows = [];
    for (let day = 1; day <= totalDays; day++) {
      const dateStr = `${prefix}-${String(day).padStart(2, '0')}`;
      const dayDate = new Date(yr, mo - 1, day);
      const dow = dayDate.getDay(); // 0=Sun, 6=Sat
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const record = recordMap.get(dateStr);

      if (record) {
        const morning = record.morningSession?.attended;
        const afternoon = record.afternoonSession?.attended;
        rows.push({
          dayNum: day,
          dayLabel: `${String(day).padStart(2, '0')} (${dayNames[dow]})`,
          isWeekend: dow === 0 || dow === 6,
          amArrival: morning && record.morningSession?.timeIn ? formatTime12h(record.morningSession.timeIn) : '',
          amDeparture: morning && record.morningSession?.timeOut ? formatTime12h(record.morningSession.timeOut) : '',
          pmArrival: afternoon && record.afternoonSession?.timeIn ? formatTime12h(record.afternoonSession.timeIn) : '',
          pmDeparture: afternoon && record.afternoonSession?.timeOut ? formatTime12h(record.afternoonSession.timeOut) : '',
          hours: Number(record.hours) > 0 ? Number(record.hours).toFixed(1) : '',
          tasks: record.description || '',
          hasRecord: true,
        });
      } else {
        rows.push({
          dayNum: day,
          dayLabel: `${String(day).padStart(2, '0')} (${dayNames[dow]})`,
          isWeekend: dow === 0 || dow === 6,
          amArrival: '', amDeparture: '', pmArrival: '', pmDeparture: '',
          hours: '', tasks: '', hasRecord: false,
        });
      }
    }

    return {
      monthRows: rows,
      totalHours: Math.round(sumHours * 10) / 10,
      recordedDaysCount: daysWithRecords,
      monthName: mName,
    };
  }, [selectedYear, selectedMonth, records]);

  const handlePrint = () => window.print();

  // ── Print Portal: render the full DTTR document directly on document.body
  //    so it is never clipped by the Dialog's scrollable overflow container.
  //    The print CSS hides everything else and reveals only #dttr-printable-report.
  const printPortalEl = useMemo(() => {
    const el = document.createElement('div');
    el.id = 'dttr-print-portal-host';
    return el;
  }, []);

  useEffect(() => {
    document.body.appendChild(printPortalEl);
    return () => {
      document.body.removeChild(printPortalEl);
    };
  }, [printPortalEl]);

  const monthOptions = MONTH_NAMES.map((name, idx) => ({
    label: name,
    value: String(idx + 1),
  }));

  const yearOptions = [
    { label: String(DEFAULT_YEAR - 1), value: String(DEFAULT_YEAR - 1) },
    { label: String(DEFAULT_YEAR), value: String(DEFAULT_YEAR) },
    { label: String(DEFAULT_YEAR + 1), value: String(DEFAULT_YEAR + 1) },
  ];

  return (
    <>
      {/* ── Dialog chrome (hidden during printing via .no-print) ── */}
      <div className="no-print">
        <DialogHeader
          title={templateVariant === 'system_default' ? 'Print System DTTR Template' : 'Print Daily Time & Tasks Record (DTTR)'}
          subtitle={templateVariant === 'system_default' ? 'Standard OJT Daily Time & Tasks Record system template.' : 'Official CHMSU College of Computer Studies portrait long-bond DTTR.'}
          onOpenChange={onOpenChange}
        />
      </div>

      <VStack
        gap={4}
        padding={4}
        isScrollable
        style={{
          maxHeight: 'calc(95dvh - 140px)',
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {/* ── Controls Card (hidden on print) ── */}
        <Card elevation="low" padding={4} className="no-print">
          <VStack gap={4}>
            <HStack justify="between" align="center" wrap="wrap" gap={3}>
              <HStack gap={3} align="center" wrap="wrap">
                <div style={{ width: 170 }}>
                  <Selector
                    label="Select Month"
                    options={monthOptions}
                    value={selectedMonth}
                    onChange={(val) => setSelectedMonth(val)}
                  />
                </div>
                <div style={{ width: 120 }}>
                  <Selector
                    label="Select Year"
                    options={yearOptions}
                    value={selectedYear}
                    onChange={(val) => setSelectedYear(val)}
                  />
                </div>
              </HStack>

              <HStack gap={2} align="center">
                <Button
                  label={showSettings ? 'Cancel' : 'Edit Header Details'}
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    if (!showSettings) {
                      // Seed the draft with current committed values when opening
                      setDraftInfo(headerInfo);
                    }
                    setShowSettings((prev) => !prev);
                  }}
                />
                {!showSettings && (
                  <Button
                    label="Print / Save PDF"
                    variant="primary"
                    icon={<PrinterIcon style={{ width: 16, height: 16 }} />}
                    onClick={handlePrint}
                  />
                )}
              </HStack>
            </HStack>

            {/* Summary pill */}
            <div
              style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                padding: '8px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 8,
              }}
            >
              <Text size="sm" color="secondary">
                Report Period: <strong>{monthName} {selectedYear}</strong> •{' '}
                <strong>{recordedDaysCount}</strong> days recorded
              </Text>
              <Text size="sm" weight="semibold" color="accent">
                Monthly Total: {totalHours.toFixed(1)} hrs
              </Text>
            </div>

            {/* Optional header details editor */}
            {showSettings && (
              <div
                style={{
                  borderTop: '1px solid #e2e8f0',
                  paddingTop: 16,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                }}
              >
                <Text size="sm" weight="bold" color="default">
                  Edit Document Header Details
                </Text>
                <Grid columns={{ minWidth: 220, max: 3 }} gap={3}>
                  <TextInput
                    label="Trainee Full Name"
                    value={draftInfo.studentName}
                    onChange={(val) => setDraftInfo((p) => ({ ...p, studentName: val }))}
                  />
                  <TextInput
                    label="Student ID"
                    value={draftInfo.studentId}
                    onChange={(val) => setDraftInfo((p) => ({ ...p, studentId: val }))}
                  />
                  <TextInput
                    label="Degree Program / Course"
                    value={draftInfo.program}
                    onChange={(val) => setDraftInfo((p) => ({ ...p, program: val }))}
                  />
                  <TextInput
                    label="Industry / Agency Name"
                    value={draftInfo.agencyName}
                    onChange={(val) => setDraftInfo((p) => ({ ...p, agencyName: val }))}
                  />
                  <TextInput
                    label="Department / Unit"
                    value={draftInfo.department}
                    onChange={(val) => setDraftInfo((p) => ({ ...p, department: val }))}
                  />
                  <TextInput
                    label="HTE Supervisor Name"
                    value={draftInfo.supervisorName}
                    onChange={(val) => setDraftInfo((p) => ({ ...p, supervisorName: val }))}
                  />
                  <TextInput
                    label="Official Schedule (e.g. 8:00 AM - 12:00 PM - 1:00 PM - 5:00 PM)"
                    value={draftInfo.officialSchedule}
                    onChange={(val) => setDraftInfo((p) => ({ ...p, officialSchedule: val }))}
                  />
                </Grid>

                {/* Save / Cancel row */}
                <HStack gap={2} justify="end" style={{ paddingTop: 4 }}>
                  <Button
                    label="Cancel"
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowSettings(false)}
                  />
                  <Button
                    label="Save"
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setHeaderInfo(draftInfo);
                      setShowSettings(false);
                    }}
                  />
                </HStack>
              </div>
            )}
          </VStack>
        </Card>

        {/* ── Printable Document Preview (hidden while editing header) ── */}
        {!showSettings && (
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: 8,
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              padding: '20px 28px',
              overflowX: 'auto',
            }}
          >
            <DttrDocument
              id="dttr-screen-preview"
              headerInfo={headerInfo}
              monthRows={monthRows}
              totalHours={totalHours}
              monthName={monthName}
              selectedYear={selectedYear}
              templateVariant={templateVariant}
            />
          </div>
        )}
      </VStack>

      {/* ── Print Portal: full DTTR rendered on document.body, never clipped ── */}
      {ReactDOM.createPortal(
        <DttrDocument
          id="dttr-printable-report"
          headerInfo={headerInfo}
          monthRows={monthRows}
          totalHours={totalHours}
          monthName={monthName}
          selectedYear={selectedYear}
          templateVariant={templateVariant}
        />,
        printPortalEl,
      )}

      {/* ── Footer action bar (hidden on print and while editing) ── */}
      {!showSettings && (
        <div
          className="no-print"
          style={{
            borderTop: '1px solid #e2e8f0',
            padding: '12px 16px',
            backgroundColor: '#ffffff',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 8,
          }}
        >
          <Button
            label="Close"
            variant="secondary"
            onClick={() => onOpenChange(false)}
          />
          <Button
            label="Print / Save PDF"
            variant="primary"
            icon={<PrinterIcon style={{ width: 16, height: 16 }} />}
            onClick={handlePrint}
          />
        </div>
      )}
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Exported Modal Shell
───────────────────────────────────────────────────────────────────────────── */
export function DttrPrintModal({ isOpen, onOpenChange, records = [], currentUser = null, templateVariant = 'system_chmsu_ccs' }) {
  if (!isOpen) return null;

  return (
    <Dialog
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      purpose="form"
      width={1020}
      maxHeight="95dvh"
    >
      <DttrPrintContent
        onOpenChange={onOpenChange}
        records={records}
        currentUser={currentUser}
        templateVariant={templateVariant}
      />
    </Dialog>
  );
}
