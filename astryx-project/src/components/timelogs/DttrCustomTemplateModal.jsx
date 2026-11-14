/**
 * DttrCustomTemplateModal
 *
 * Two modes:
 *   mode="upload"  – Upload a new PDF, name it, preview it, save field-mapping, save to storage.
 *   mode="generate" – Use a previously saved custom template to overlay the student's monthly data
 *                     and display it for printing.
 *
 * Props:
 *   isOpen, onOpenChange, currentUser, records,
 *   mode ("upload" | "generate"),
 *   template (null for upload, template object for generate),
 *   onSaved (callback after a new upload is saved — returns to selector),
 *   onBack  (go back to template selector)
 */
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Dialog, DialogHeader } from '@astryxdesign/core/Dialog';
import { VStack } from '@astryxdesign/core/VStack';
import { HStack } from '@astryxdesign/core/HStack';
import { Grid } from '@astryxdesign/core/Grid';
import { Text } from '@astryxdesign/core/Text';
import { Button } from '@astryxdesign/core/Button';
import { TextInput } from '@astryxdesign/core/TextInput';
import { Selector } from '@astryxdesign/core/Selector';
import { Card } from '@astryxdesign/core/Card';
import { Banner } from '@astryxdesign/core/Banner';
import { PrinterIcon } from '../common/BrandIcons';
import { loadStoredProfile } from '../../services/profileService';
import { loadOnboardingData } from '../../services/onboardingService';
import {
  addUserTemplate,
  updateUserTemplate,
  readPdfFile,
} from '../../services/dttrTemplateService';
import { generatePopulatedDttrPdf } from '../../services/dttrPdfGenerator';

/* ── Shared constants ────────────────────────────────────────────────────── */
const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];
const CURRENT_DATE = new Date();
const DEFAULT_YEAR = CURRENT_DATE.getFullYear();
const DEFAULT_MONTH = CURRENT_DATE.getMonth() + 1;

const FIELD_LABELS = {
  studentName: 'Student Name',
  agencyName: 'Industry / Agency Name',
  department: 'Department',
  month: 'Month',
  officialSchedule: 'Official Arrival & Departure',
  amArrival: 'AM Arrival Column',
  amDeparture: 'AM Departure Column',
  pmArrival: 'PM Arrival Column',
  pmDeparture: 'PM Departure Column',
  hoursColumn: 'Number of Hours Column',
  tasksColumn: 'Tasks / Assignments Column',
  totalHours: 'Total No. of Hours',
  studentSignature: 'Student Signature',
  supervisorSignature: 'HTE Supervisor Signature',
};

/* ── Small SVG icons ─────────────────────────────────────────────────────── */
function UploadCloudIcon({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 16 12 12 8 16" />
      <line x1="12" y1="12" x2="12" y2="21" />
      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
    </svg>
  );
}

/* ── helpers ──────────────────────────────────────────────────────────────── */
function formatTime12h(timeStr) {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':').map(Number);
  if (isNaN(h) || isNaN(m)) return timeStr;
  const period = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 || 12;
  return `${displayH}:${String(m).padStart(2, '0')} ${period}`;
}

function getHeaderInfo(userId, currentUser) {
  const profile = loadStoredProfile(userId);
  const onboarding = loadOnboardingData(userId);
  const morningIn  = onboarding?.morningTimeIn   ? formatTime12h(onboarding.morningTimeIn)   : '8:00 AM';
  const morningOut = onboarding?.morningTimeOut  ? formatTime12h(onboarding.morningTimeOut)  : '12:00 PM';
  const afternoonIn  = onboarding?.afternoonTimeIn  ? formatTime12h(onboarding.afternoonTimeIn)  : '1:00 PM';
  const afternoonOut = onboarding?.afternoonTimeOut ? formatTime12h(onboarding.afternoonTimeOut) : '5:00 PM';
  return {
    studentName: profile?.fullName || currentUser?.fullName || '',
    agencyName: profile?.company || onboarding?.companyName || '',
    department: profile?.department || onboarding?.companyDepartment || '',
    supervisorName: profile?.supervisor || onboarding?.supervisorName || '',
    officialSchedule: `${morningIn} - ${morningOut} - ${afternoonIn} - ${afternoonOut}`,
  };
}

/* ── Upload step ─────────────────────────────────────────────────────────── */
function UploadContent({ userId, onSaved, onBack, onOpenChange }) {
  const fileRef = useRef(null);
  const [pdfData, setPdfData] = useState(null); // { dataUrl, fileSizeKb }
  const [fileName, setFileName] = useState('');
  const [templateName, setTemplateName] = useState('');
  const [fieldMap, setFieldMap] = useState({});
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState('pick'); // pick → preview → mapping

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    try {
      const result = await readPdfFile(file);
      setPdfData(result);
      setFileName(file.name);
      setTemplateName(file.name.replace(/\.pdf$/i, ''));
      setStep('preview');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSave = () => {
    if (!templateName.trim()) { setError('Please enter a template name.'); return; }
    if (!pdfData?.dataUrl) { setError('No PDF file loaded.'); return; }
    setSaving(true);
    try {
      addUserTemplate({
        name: templateName.trim(),
        fileName,
        dataUrl: pdfData.dataUrl,
        fileSizeKb: pdfData.fileSizeKb,
        fieldMap,
      }, userId);
      onSaved();
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  /* ─ pick state ─ */
  if (step === 'pick') {
    return (
      <>
        <div className="no-print">
          <DialogHeader
            title="Upload Your Own Template"
            subtitle="Upload a DTTR/DTR PDF template provided by your college or training agency."
            onOpenChange={onOpenChange}
          />
        </div>
        <VStack gap={4} padding={4} style={{ minHeight: 260 }}>
          {error && <Banner status="error" title={error} isDismissable onDismiss={() => setError(null)} />}

          {/* Drop zone */}
          <div
            onClick={() => fileRef.current?.click()}
            style={{
              border: '2px dashed #cbd5e1', borderRadius: 14,
              padding: '48px 24px', textAlign: 'center', cursor: 'pointer',
              backgroundColor: '#f8fafc', transition: 'border-color 0.15s',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
            }}
          >
            <div style={{
              width: 56, height: 56, borderRadius: 14,
              backgroundColor: 'rgba(16,185,129,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981',
            }}>
              <UploadCloudIcon size={28} />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#142b49', marginBottom: 4 }}>
                Click to select a PDF file
              </div>
              <div style={{ fontSize: 12, color: '#94a3b8' }}>PDF only · Max 10 MB</div>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
          </div>
        </VStack>
        <div className="no-print" style={{ borderTop: '1px solid #e2e8f0', padding: '12px 16px', display: 'flex', justifyContent: 'flex-start' }}>
          <Button label="← Back to Templates" variant="secondary" onClick={onBack} />
        </div>
      </>
    );
  }

  /* ─ preview + mapping state ─ */
  /* ─ preview + mapping state ─ */
  return (
    <>
      <div className="no-print">
        <DialogHeader
          title={step === 'preview' ? 'Preview & Name Your Template' : 'Map Data Fields'}
          subtitle={step === 'preview'
            ? 'Review the PDF and give your template a name.'
            : 'Configure how your monthly report data maps to this template.'
          }
          onOpenChange={onOpenChange}
        />
      </div>

      <VStack
        gap={4} padding={4} isScrollable
        style={{ maxHeight: 'calc(90dvh - 170px)', overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}
      >
        {error && <Banner status="error" title={error} isDismissable onDismiss={() => setError(null)} />}

        {step === 'preview' && (
          <>
            {/* Template name input */}
            <TextInput
              label="Template Name"
              value={templateName}
              onChange={(v) => setTemplateName(v)}
              placeholder="e.g. My College DTR"
            />

            {/* PDF preview — Clean centered paper view without dark frame */}
            <div
              style={{
                width: '100%',
                borderRadius: 10,
                border: '1px solid #e2e8f0',
                backgroundColor: '#f8fafc',
                padding: '20px 12px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: 320,
                  maxWidth: '100%',
                  aspectRatio: '612 / 936',
                  height: 489,
                  backgroundColor: '#ffffff',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
                  borderRadius: 3,
                  overflow: 'hidden',
                  border: '1px solid #e2e8f0',
                }}
              >
                <iframe
                  src={`${pdfData.dataUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                  title="PDF Preview"
                  style={{ width: '100%', height: '100%', border: 'none', display: 'block', backgroundColor: '#ffffff' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <Text size="sm" color="secondary">{fileName} · {pdfData.fileSizeKb} KB</Text>
              <Button
                label="Change File"
                variant="ghost"
                size="sm"
                onClick={() => { setStep('pick'); setPdfData(null); setFileName(''); }}
              />
            </div>
          </>
        )}

        {step === 'mapping' && (
          <>
            <Banner
              status="info"
              title="Field Mapping"
            />
            <Text size="sm" color="secondary">
              Describe where each data field is positioned on your template PDF.
              This helps the system place your training data correctly.
              If a field is not on your template, leave it blank.
            </Text>
            <Grid columns={{ minWidth: 260, max: 2 }} gap={3}>
              {Object.entries(FIELD_LABELS).map(([key, label]) => (
                <TextInput
                  key={key}
                  label={label}
                  value={fieldMap[key] || ''}
                  onChange={(v) => setFieldMap((prev) => ({ ...prev, [key]: v }))}
                  placeholder={`e.g. Row 1, Column 2`}
                />
              ))}
            </Grid>
          </>
        )}
      </VStack>

      {/* Footer */}
      <div className="no-print" style={{
        borderTop: '1px solid #e2e8f0', padding: '12px 16px', backgroundColor: '#fff',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8,
      }}>
        <Button
          label={step === 'preview' ? '← Back' : '← Preview'}
          variant="secondary"
          onClick={() => step === 'preview' ? onBack() : setStep('preview')}
        />
        <HStack gap={2}>
          {step === 'preview' && (
            <Button label="Map Fields (Optional)" variant="secondary" size="sm" onClick={() => setStep('mapping')} />
          )}
          <Button
            label={saving ? 'Saving...' : 'Save Template'}
            variant="primary"
            onClick={handleSave}
            disabled={saving}
          />
        </HStack>
      </div>
    </>
  );
}

/* ── Generate / print step (custom template) ─────────────────────────────── */
function GenerateContent({ userId, currentUser, records, template, onBack, onOpenChange }) {
  const isCustomTemplate = !template?.isSystem;
  const [selectedYear, setSelectedYear] = useState(() => String(DEFAULT_YEAR));
  const [selectedMonth, setSelectedMonth] = useState(() => String(DEFAULT_MONTH));
  const [showSettings, setShowSettings] = useState(false);
  const [showMapping, setShowMapping] = useState(false);
  const [activeTab, setActiveTab] = useState(() => (isCustomTemplate ? 'pdf' : 'report'));
  const [zoomPercent, setZoomPercent] = useState(100);
  const [headerInfo, setHeaderInfo] = useState(() => getHeaderInfo(userId, currentUser));
  const [draftInfo, setDraftInfo] = useState(headerInfo);
  const [fieldMap, setFieldMap] = useState(() => template.fieldMap || {});
  const [feedback, setFeedback] = useState(null);
  const [populatedPdfUrl, setPopulatedPdfUrl] = useState(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfGenError, setPdfGenError] = useState(null);

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
        if (hrs > 0 || r.morningSession?.attended || r.afternoonSession?.attended) daysWithRecords++;
      }
    }
    const rows = [];
    for (let day = 1; day <= totalDays; day++) {
      const dateStr = `${prefix}-${String(day).padStart(2, '0')}`;
      const record = recordMap.get(dateStr);
      if (record) {
        const am = record.morningSession?.attended;
        const pm = record.afternoonSession?.attended;
        rows.push({
          day,
          amArrival: am && record.morningSession?.timeIn ? formatTime12h(record.morningSession.timeIn) : '',
          amDeparture: am && record.morningSession?.timeOut ? formatTime12h(record.morningSession.timeOut) : '',
          pmArrival: pm && record.afternoonSession?.timeIn ? formatTime12h(record.afternoonSession.timeIn) : '',
          pmDeparture: pm && record.afternoonSession?.timeOut ? formatTime12h(record.afternoonSession.timeOut) : '',
          hours: Number(record.hours) > 0 ? Number(record.hours).toFixed(1) : '',
          tasks: record.description || '',
          hasRecord: true,
        });
      } else {
        rows.push({ day, amArrival:'', amDeparture:'', pmArrival:'', pmDeparture:'', hours:'', tasks:'', hasRecord: false });
      }
    }
    return { monthRows: rows, totalHours: Math.round(sumHours * 10) / 10, recordedDaysCount: daysWithRecords, monthName: mName };
  }, [selectedYear, selectedMonth, records]);

  useEffect(() => {
    let isMounted = true;
    let currentObjectUrl = null;

    async function generate() {
      if (!template?.dataUrl) return;
      setIsGeneratingPdf(true);
      setPdfGenError(null);
      try {
        const pdfBytes = await generatePopulatedDttrPdf({
          templatePdfDataUrl: template.dataUrl,
          headerInfo,
          monthRows,
          totalHours,
          monthName,
          selectedYear,
          fieldMap,
        });

        if (!isMounted) return;
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        currentObjectUrl = URL.createObjectURL(blob);
        setPopulatedPdfUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return currentObjectUrl;
        });
      } catch (err) {
        if (!isMounted) return;
        console.error('Failed to generate populated DTTR PDF:', err);
        setPdfGenError(err.message || 'Unable to populate PDF template.');
      } finally {
        if (isMounted) setIsGeneratingPdf(false);
      }
    }

    generate();

    return () => {
      isMounted = false;
      if (currentObjectUrl) {
        URL.revokeObjectURL(currentObjectUrl);
      }
    };
  }, [template?.dataUrl, headerInfo, monthRows, totalHours, monthName, selectedYear, fieldMap]);

  const handleDownloadPdf = () => {
    const url = populatedPdfUrl || template?.dataUrl;
    if (!url) return;
    const studentSlug = (headerInfo.studentName || 'Student').trim().replace(/[^a-zA-Z0-9_-]+/g, '_');
    const safeMonth = (monthName || 'Month').trim();
    const safeYear = (selectedYear || '').trim();
    const fileName = `DTTR_${studentSlug}_${safeMonth}_${safeYear}.pdf`;

    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    if (!isCustomTemplate && activeTab === 'report') {
      window.print();
    } else {
      if (populatedPdfUrl) {
        const printWindow = window.open(populatedPdfUrl, '_blank');
        if (printWindow) {
          printWindow.focus();
        } else {
          handleDownloadPdf();
        }
      } else {
        window.print();
      }
    }
  };

  const handleSaveFieldMap = () => {
    try {
      updateUserTemplate(template.id, { fieldMap }, userId);
      setShowMapping(false);
      setFeedback({ type: 'success', message: 'Field mapping saved successfully.' });
      setTimeout(() => setFeedback(null), 2500);
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  const monthOptions = MONTH_NAMES.map((n, i) => ({ label: n, value: String(i + 1) }));
  const yearOptions = [
    { label: String(DEFAULT_YEAR - 1), value: String(DEFAULT_YEAR - 1) },
    { label: String(DEFAULT_YEAR), value: String(DEFAULT_YEAR) },
    { label: String(DEFAULT_YEAR + 1), value: String(DEFAULT_YEAR + 1) },
  ];

  const scheduleSlots = headerInfo.officialSchedule
    ? headerInfo.officialSchedule.split(' - ')
    : ['', '', '', ''];
  while (scheduleSlots.length < 4) scheduleSlots.push('');

  return (
    <>
      <div className="no-print">
        <DialogHeader
          title={`Generate Report — ${template.name}`}
          subtitle="Populate your training records onto this template and print or save as PDF."
          onOpenChange={onOpenChange}
        />
      </div>

      <VStack
        gap={4} padding={4} isScrollable
        style={{ maxHeight: 'calc(95dvh - 140px)', overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}
      >
        {feedback && (
          <Banner status={feedback.type} title={feedback.message} isDismissable onDismiss={() => setFeedback(null)} />
        )}

        {/* Controls */}
        <Card elevation="low" padding={4} className="no-print">
          <VStack gap={4}>
            <HStack justify="between" align="center" wrap="wrap" gap={3}>
              <HStack gap={3} align="center" wrap="wrap">
                <div style={{ width: 170 }}>
                  <Selector label="Select Month" options={monthOptions} value={selectedMonth} onChange={setSelectedMonth} />
                </div>
                <div style={{ width: 120 }}>
                  <Selector label="Select Year" options={yearOptions} value={selectedYear} onChange={setSelectedYear} />
                </div>
              </HStack>
              <HStack gap={2} align="center">
                <Button
                  label={showMapping ? 'Close Mapping' : 'Field Mapping'}
                  variant="secondary" size="sm"
                  onClick={() => {
                    setShowMapping((p) => !p);
                    if (showSettings) setShowSettings(false);
                  }}
                />
                <Button
                  label={showSettings ? 'Cancel' : 'Edit Header Details'}
                  variant="secondary" size="sm"
                  onClick={() => {
                    if (!showSettings) setDraftInfo(headerInfo);
                    setShowSettings((p) => !p);
                    if (showMapping) setShowMapping(false);
                  }}
                />
                {!showSettings && !showMapping && (
                  <Button label="Print / Save PDF" variant="primary" icon={<PrinterIcon style={{ width: 16, height: 16 }} />} onClick={handlePrint} />
                )}
              </HStack>
            </HStack>

            {/* Summary & View Mode Tabs */}
            <div style={{
              backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8,
              padding: '8px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8,
            }}>
              <Text size="sm" color="secondary">
                Report: <strong>{monthName} {selectedYear}</strong> · <strong>{recordedDaysCount}</strong> days · Total: <strong>{totalHours.toFixed(1)} hrs</strong>
              </Text>
              <div style={{ display: 'flex', gap: 6 }}>
                {!isCustomTemplate && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('report')}
                    style={{
                      fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 6,
                      border: '1px solid #e2e8f0',
                      backgroundColor: activeTab === 'report' ? '#10b981' : '#ffffff',
                      color: activeTab === 'report' ? '#ffffff' : '#334155',
                      cursor: 'pointer',
                    }}
                  >
                    DTTR Report
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setActiveTab('pdf')}
                  style={{
                    fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 6,
                    border: '1px solid #10b981',
                    backgroundColor: '#10b981',
                    color: '#ffffff',
                    cursor: isCustomTemplate ? 'default' : 'pointer',
                  }}
                >
                  Original PDF
                </button>
              </div>
            </div>

            {/* Field Mapping Editor */}
            {showMapping && (
              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <Text size="sm" weight="bold">Custom Field Mapping Configuration</Text>
                <Text size="xs" color="secondary">
                  Specify how each data field is laid out on this custom template. Configurations are saved with this template for future reports.
                </Text>
                <Grid columns={{ minWidth: 240, max: 2 }} gap={3}>
                  {Object.entries(FIELD_LABELS).map(([key, label]) => (
                    <TextInput
                      key={key}
                      label={label}
                      value={fieldMap[key] || ''}
                      onChange={(v) => setFieldMap((prev) => ({ ...prev, [key]: v }))}
                      placeholder="e.g. Header Line 1 or Column 4"
                    />
                  ))}
                </Grid>
                <HStack gap={2} justify="end" style={{ paddingTop: 4 }}>
                  <Button label="Cancel" variant="secondary" size="sm" onClick={() => setShowMapping(false)} />
                  <Button label="Save Mapping" variant="primary" size="sm" onClick={handleSaveFieldMap} />
                </HStack>
              </div>
            )}

            {/* Edit header form */}
            {showSettings && (
              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <Text size="sm" weight="bold">Edit Document Header Details</Text>
                <Grid columns={{ minWidth: 220, max: 3 }} gap={3}>
                  <TextInput label="Trainee Full Name" value={draftInfo.studentName} onChange={(v) => setDraftInfo((p) => ({ ...p, studentName: v }))} />
                  <TextInput label="Industry / Agency Name" value={draftInfo.agencyName} onChange={(v) => setDraftInfo((p) => ({ ...p, agencyName: v }))} />
                  <TextInput label="Department / Unit" value={draftInfo.department} onChange={(v) => setDraftInfo((p) => ({ ...p, department: v }))} />
                  <TextInput label="HTE Supervisor Name" value={draftInfo.supervisorName} onChange={(v) => setDraftInfo((p) => ({ ...p, supervisorName: v }))} />
                  <TextInput label="Official Schedule" value={draftInfo.officialSchedule} onChange={(v) => setDraftInfo((p) => ({ ...p, officialSchedule: v }))} />
                </Grid>
                <HStack gap={2} justify="end" style={{ paddingTop: 4 }}>
                  <Button label="Cancel" variant="secondary" size="sm" onClick={() => setShowSettings(false)} />
                  <Button label="Save" variant="primary" size="sm" onClick={() => { setHeaderInfo(draftInfo); setShowSettings(false); }} />
                </HStack>
              </div>
            )}
          </VStack>
        </Card>

        {/* Original / Populated PDF viewer tab — Clean white preview with zoom controls */}
        {!showSettings && !showMapping && activeTab === 'pdf' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {isGeneratingPdf && (
              <Banner
                status="info"
                title="Populating DTTR Template"
              >
                Rendering your training records onto the uploaded PDF template...
              </Banner>
            )}

            {pdfGenError && (
              <Banner
                status="error"
                title="Template Population Warning"
                isDismissable
                onDismiss={() => setPdfGenError(null)}
              >
                {pdfGenError}. Showing unmodified template preview.
              </Banner>
            )}

            {/* Document Action & Zoom Toolbar */}
            <div
              className="no-print"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                padding: '8px 14px',
                flexWrap: 'wrap',
                gap: 8,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#142b49' }}>
                  Original PDF Preview
                </span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    backgroundColor: 'rgba(16,185,129,0.12)',
                    color: '#10b981',
                    padding: '2px 8px',
                    borderRadius: 12,
                  }}
                >
                  {recordedDaysCount} {recordedDaysCount === 1 ? 'Record' : 'Records'} Populated
                </span>
              </div>

              {/* Zoom & Action Controls */}
              <HStack gap={2} align="center">
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    backgroundColor: '#f1f5f9',
                    borderRadius: 8,
                    padding: '3px 8px',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <button
                    type="button"
                    title="Zoom Out"
                    onClick={() => setZoomPercent((prev) => Math.max(50, prev - 15))}
                    style={{
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      fontSize: 14,
                      color: '#475569',
                      padding: '0 4px',
                      lineHeight: 1,
                    }}
                  >
                    −
                  </button>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: '#142b49',
                      minWidth: 38,
                      textAlign: 'center',
                    }}
                  >
                    {zoomPercent}%
                  </span>
                  <button
                    type="button"
                    title="Zoom In"
                    onClick={() => setZoomPercent((prev) => Math.min(160, prev + 15))}
                    style={{
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      fontSize: 14,
                      color: '#475569',
                      padding: '0 4px',
                      lineHeight: 1,
                    }}
                  >
                    +
                  </button>
                  <button
                    type="button"
                    title="Reset to Fit Width"
                    onClick={() => setZoomPercent(100)}
                    style={{
                      background: '#ffffff',
                      borderRadius: 4,
                      cursor: 'pointer',
                      fontSize: 10,
                      fontWeight: 700,
                      color: '#64748b',
                      padding: '2px 6px',
                      marginLeft: 4,
                      border: '1px solid #cbd5e1',
                    }}
                  >
                    Fit
                  </button>
                </div>

                {populatedPdfUrl && (
                  <Button
                    label="Download Populated PDF"
                    variant="secondary"
                    size="sm"
                    onClick={handleDownloadPdf}
                  />
                )}
              </HStack>
            </div>

            {/* Clean Centered Document Canvas (pure light desk background, zero dark frame) */}
            <div
              className="no-print"
              style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 10,
                padding: '24px 16px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-start',
                minHeight: 560,
                maxHeight: 'calc(90dvh - 230px)',
                overflowY: 'auto',
                overflowX: 'auto',
                WebkitOverflowScrolling: 'touch',
              }}
            >
              {/* Paper Sheet Representation */}
              <div
                style={{
                  width: `${(612 * zoomPercent) / 100}px`,
                  maxWidth: '100%',
                  aspectRatio: '612 / 936',
                  height: `${(936 * zoomPercent) / 100}px`,
                  backgroundColor: '#ffffff',
                  borderRadius: 3,
                  boxShadow: '0 4px 24px rgba(0, 0, 0, 0.08), 0 1px 4px rgba(0, 0, 0, 0.04)',
                  border: '1px solid #e2e8f0',
                  overflow: 'hidden',
                  position: 'relative',
                  flexShrink: 0,
                  transition: 'width 0.12s ease, height 0.12s ease',
                }}
              >
                <iframe
                  src={`${populatedPdfUrl || template.dataUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                  title="Populated Original Template PDF"
                  style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    display: 'block',
                    backgroundColor: '#ffffff',
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Printable preview — Generated DTTR Document (Only for system templates) */}
        {!showSettings && !showMapping && !isCustomTemplate && activeTab === 'report' && (
          <div
            id="dttr-printable-report"
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: 8,
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              padding: '24px 30px',
              fontFamily: 'Arial, Helvetica, sans-serif',
              color: '#000000',
            }}
          >
            {/* Header info with template label */}
            <div style={{ textAlign: 'center', marginBottom: 12 }}>
              <div style={{ fontSize: '10pt', fontWeight: 'bold', color: '#10b981', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 4 }}>
                {template.name}
              </div>
              <h1 style={{ fontSize: '13pt', fontWeight: 'bold', margin: '0 0 4px 0', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                DAILY TIME &amp; TASKS RECORD (DTTR)
              </h1>
            </div>

            {/* Student Information Section (Centered per original DTTR PDF) */}
            <div style={{ marginBottom: 10, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {/* 1. NAME */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '56%', marginBottom: 6 }}>
                <div
                  style={{
                    width: '100%',
                    borderBottom: '1px solid #000000',
                    textAlign: 'center',
                    fontWeight: 'bold',
                    fontSize: '10pt',
                    paddingBottom: 2,
                    letterSpacing: '0.04em',
                    minHeight: 18,
                  }}
                >
                  {headerInfo.studentName}
                </div>
                <div style={{ fontSize: '7.5pt', fontWeight: 'bold', letterSpacing: '0.06em', marginTop: 2, textAlign: 'center' }}>
                  NAME
                </div>
              </div>

              {/* 2. INDUSTRY / AGENCY NAME / DEPARTMENT */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '56%', marginBottom: 6 }}>
                <div
                  style={{
                    width: '100%',
                    borderBottom: '1px solid #000000',
                    textAlign: 'center',
                    fontWeight: 'bold',
                    fontSize: '9pt',
                    paddingBottom: 2,
                    minHeight: 18,
                  }}
                >
                  {headerInfo.agencyName
                    ? `${headerInfo.agencyName}${headerInfo.department ? ' / ' + headerInfo.department : ''}`
                    : ''}
                </div>
                <div style={{ fontSize: '7.5pt', fontWeight: 'bold', letterSpacing: '0.04em', marginTop: 2, textAlign: 'center' }}>
                  INDUSTRY / AGENCY NAME / DEPARTMENT
                </div>
              </div>

              {/* 3. MONTH */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '30%', marginBottom: 6 }}>
                <div
                  style={{
                    width: '100%',
                    borderBottom: '1px solid #000000',
                    textAlign: 'center',
                    fontWeight: 'bold',
                    fontSize: '9pt',
                    paddingBottom: 2,
                    letterSpacing: '0.05em',
                    minHeight: 18,
                  }}
                >
                  {monthName.toUpperCase()} {selectedYear}
                </div>
                <div style={{ fontSize: '7.5pt', fontWeight: 'bold', letterSpacing: '0.06em', marginTop: 2, textAlign: 'center' }}>
                  MONTH
                </div>
              </div>

              {/* 4. Official Hour Of Arrival And Departure */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0 }}>
                  {scheduleSlots.map((slot, idx, arr) => (
                    <React.Fragment key={idx}>
                      <div
                        style={{
                          borderBottom: '1px solid #000000',
                          minWidth: 64,
                          textAlign: 'center',
                          fontSize: '7.5pt',
                          fontWeight: 'bold',
                          paddingBottom: 1,
                        }}
                      >
                        {slot}
                      </div>
                      {idx < arr.length - 1 && (
                        <span style={{ margin: '0 4px', fontWeight: 'bold', fontSize: '8pt' }}>-</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
                <div style={{ fontSize: '7.5pt', fontWeight: 'bold', marginTop: 2, textAlign: 'center' }}>
                  Official Hour Of Arrival And Departure
                </div>
              </div>
            </div>

            {/* Attendance table */}
            <table
              className="dttr-table"
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                border: '1px solid #000',
                tableLayout: 'fixed',
              }}
            >
              <colgroup>
                <col style={{ width: '5%' }} />
                <col style={{ width: '9%' }} />
                <col style={{ width: '9%' }} />
                <col style={{ width: '9%' }} />
                <col style={{ width: '9%' }} />
                <col style={{ width: '8%' }} />
                <col style={{ width: '51%' }} />
              </colgroup>
              <thead>
                <tr>
                  <th style={{ border: '1px solid #000', padding: '3px', textAlign: 'center', fontSize: '7.5pt', fontWeight: 'bold' }} rowSpan={2}>DAY</th>
                  <th style={{ border: '1px solid #000', padding: '3px', textAlign: 'center', fontSize: '7.5pt', fontWeight: 'bold' }} colSpan={2}>AM</th>
                  <th style={{ border: '1px solid #000', padding: '3px', textAlign: 'center', fontSize: '7.5pt', fontWeight: 'bold' }} colSpan={2}>PM</th>
                  <th style={{ border: '1px solid #000', padding: '3px', textAlign: 'center', fontSize: '6.5pt', fontWeight: 'bold' }} rowSpan={2}>NO. OF HOURS</th>
                  <th style={{ border: '1px solid #000', padding: '3px 6px', textAlign: 'left', fontSize: '7.5pt', fontWeight: 'bold' }} rowSpan={2}>TASKS / ASSIGNMENTS PERFORMED</th>
                </tr>
                <tr>
                  <th style={{ border: '1px solid #000', padding: '2px', fontSize: '7pt', textAlign: 'center' }}>ARRIVAL</th>
                  <th style={{ border: '1px solid #000', padding: '2px', fontSize: '7pt', textAlign: 'center' }}>DEPARTURE</th>
                  <th style={{ border: '1px solid #000', padding: '2px', fontSize: '7pt', textAlign: 'center' }}>ARRIVAL</th>
                  <th style={{ border: '1px solid #000', padding: '2px', fontSize: '7pt', textAlign: 'center' }}>DEPARTURE</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => {
                  const row = monthRows.find((r) => r.day === d);
                  return (
                    <tr key={d}>
                      <td style={{ border: '1px solid #000', padding: '2px 3px', textAlign: 'center', fontSize: '7.5pt', fontWeight: row?.hasRecord ? '600' : 'normal' }}>{d}</td>
                      <td style={{ border: '1px solid #000', padding: '2px 3px', textAlign: 'center', fontSize: '7.5pt', whiteSpace: 'nowrap' }}>{row?.amArrival || ''}</td>
                      <td style={{ border: '1px solid #000', padding: '2px 3px', textAlign: 'center', fontSize: '7.5pt', whiteSpace: 'nowrap' }}>{row?.amDeparture || ''}</td>
                      <td style={{ border: '1px solid #000', padding: '2px 3px', textAlign: 'center', fontSize: '7.5pt', whiteSpace: 'nowrap' }}>{row?.pmArrival || ''}</td>
                      <td style={{ border: '1px solid #000', padding: '2px 3px', textAlign: 'center', fontSize: '7.5pt', whiteSpace: 'nowrap' }}>{row?.pmDeparture || ''}</td>
                      <td style={{ border: '1px solid #000', padding: '2px 3px', textAlign: 'center', fontSize: '7.5pt', fontWeight: row?.hours ? '700' : 'normal' }}>{row?.hours || ''}</td>
                      <td style={{ border: '1px solid #000', padding: '2px 6px', textAlign: 'left', fontSize: '7.5pt', wordBreak: 'break-word', lineHeight: '1.25' }}>{row?.tasks || ''}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Total */}
            <div style={{ marginTop: 6, marginBottom: 8, display: 'inline-flex', alignItems: 'center', gap: 6, border: '1px solid #000', padding: '3px 10px', fontSize: '8.5pt', fontWeight: 'bold' }}>
              <span>TOTAL NO. OF HOURS:</span>
              <span style={{ borderBottom: '1px solid #000', minWidth: 48, textAlign: 'center', fontSize: '9pt' }}>
                {totalHours > 0 ? totalHours.toFixed(1) : ''}
              </span>
            </div>

            {/* Certification */}
            <p style={{ fontSize: '8pt', fontStyle: 'italic', margin: '0 0 14px 0', color: '#000', textAlign: 'justify', lineHeight: 1.4 }}>
              I hereby certify on my honor that the above is a true and correct report of hours and
              assignments/tasks performed, a record of which was made daily at the time of arrival and
              departure from the office.
            </p>

            {/* Signatures */}
            <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', gap: 32, marginTop: 10 }}>
              <div style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ borderBottom: '1.5px solid #000', minHeight: 32, marginBottom: 4 }} />
                <div style={{ fontSize: '8.5pt' }}>Student&apos;s Signature</div>
              </div>
              <div style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ borderBottom: '1.5px solid #000', minHeight: 32, marginBottom: 4 }} />
                <div style={{ fontSize: '8.5pt' }}>HTE Supervisor&apos;s Name &amp; Signature</div>
              </div>
            </div>
          </div>
        )}
      </VStack>

      {/* Footer */}
      {!showSettings && !showMapping && (
        <div className="no-print" style={{
          borderTop: '1px solid #e2e8f0', padding: '12px 16px', backgroundColor: '#fff',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8,
        }}>
          <Button label="← Back to Templates" variant="secondary" onClick={onBack} />
          <HStack gap={2}>
            <Button label="Close" variant="secondary" onClick={() => onOpenChange(false)} />
            <Button label="Print / Save PDF" variant="primary" icon={<PrinterIcon style={{ width: 16, height: 16 }} />} onClick={handlePrint} />
          </HStack>
        </div>
      )}
    </>
  );
}

/* ── Modal shell ─────────────────────────────────────────────────────────── */
function CustomModalContent({ onOpenChange, currentUser, records, mode, template, onSaved, onBack }) {
  const userId = currentUser?.id || null;

  if (mode === 'upload') {
    return (
      <UploadContent
        userId={userId}
        onSaved={onSaved}
        onBack={onBack}
        onOpenChange={onOpenChange}
      />
    );
  }

  // mode === 'generate'
  return (
    <GenerateContent
      userId={userId}
      currentUser={currentUser}
      records={records}
      template={template}
      onBack={onBack}
      onOpenChange={onOpenChange}
    />
  );
}

export function DttrCustomTemplateModal({
  isOpen,
  onOpenChange,
  currentUser = null,
  records = [],
  mode = 'upload',
  template = null,
  onSaved,
  onBack,
}) {
  if (!isOpen) return null;
  return (
    <Dialog isOpen={isOpen} onOpenChange={onOpenChange} purpose="form" width={1020} maxHeight="95dvh">
      <CustomModalContent
        onOpenChange={onOpenChange}
        currentUser={currentUser}
        records={records}
        mode={mode}
        template={template}
        onSaved={onSaved}
        onBack={onBack}
      />
    </Dialog>
  );
}
