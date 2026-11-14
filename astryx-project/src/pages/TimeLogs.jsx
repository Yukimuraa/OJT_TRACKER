import React, { useState, useMemo, useRef } from 'react';
import { PageLayout } from '../components/layout/PageLayout';
import { VStack } from '@astryxdesign/core/VStack';
import { HStack } from '@astryxdesign/core/HStack';
import { Grid } from '@astryxdesign/core/Grid';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { Button } from '@astryxdesign/core/Button';
import { Card } from '@astryxdesign/core/Card';
import { Icon } from '@astryxdesign/core/Icon';
import { EmptyState } from '@astryxdesign/core/EmptyState';
import { StatusDot } from '@astryxdesign/core/StatusDot';
import { Dialog, DialogHeader } from '@astryxdesign/core/Dialog';
import { DateInput } from '@astryxdesign/core/DateInput';
import { Selector } from '@astryxdesign/core/Selector';
import { IOSSessionCard } from '../components/common/IOSWheelPicker';
import { TextArea } from '@astryxdesign/core/TextArea';
import { Banner } from '@astryxdesign/core/Banner';
import { Divider } from '@astryxdesign/core/Divider';
import { useTraining } from '../hooks/useTraining';
import { GraduationCapIcon, PrinterIcon } from '../components/common/BrandIcons';
import { DttrPrintModal } from '../components/timelogs/DttrPrintModal';
import { DttrTemplateSelectorModal } from '../components/timelogs/DttrTemplateSelectorModal';
import { DttrCustomTemplateModal } from '../components/timelogs/DttrCustomTemplateModal';
import {
  loadOnboardingData,
  calculateDailySessionHours,
  validateSessionsConfig,
} from '../services/onboardingService';

const ACTIVITY_OPTIONS = [
  'Development',
  'Design',
  'Documentation',
  'Client Meeting',
  'Team Meeting',
  'Research',
  'Testing',
  'Training',
  'Other',
];

const TODAY = new Date().toISOString().split('T')[0];

function formatFullDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(`${dateStr}T00:00:00`);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatTime12h(timeStr) {
  if (!timeStr) return '—';
  const [h, m] = timeStr.split(':').map(Number);
  if (isNaN(h) || isNaN(m)) return timeStr;
  const period = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 || 12;
  return `${displayH}:${String(m).padStart(2, '0')} ${period}`;
}

/**
 * Validates that a HH:MM string represents a reasonable time in the given range (minutes from midnight).
 * Returns the original string if valid, or the fallback if not.
 */
function sanitizeTime(timeStr, minMinutes, maxMinutes, fallback) {
  if (!timeStr || typeof timeStr !== 'string') return fallback;
  const parts = timeStr.split(':').map(Number);
  if (parts.length < 2 || isNaN(parts[0]) || isNaN(parts[1])) return fallback;
  const totalMins = parts[0] * 60 + parts[1];
  if (totalMins < minMinutes || totalMins > maxMinutes) return fallback;
  return timeStr;
}

function getFormStateFromRecord(record) {
  if (record) {
    return {
      entryType: record.entryType || 'work',
      date: record.date || TODAY,
      activity: record.activity || 'Development',
      morningAttended: Boolean(record.morningSession?.attended),
      morningTimeIn: record.morningSession?.timeIn || '08:00',
      morningTimeOut: record.morningSession?.timeOut || '12:00',
      afternoonAttended: Boolean(record.afternoonSession?.attended),
      afternoonTimeIn: record.afternoonSession?.timeIn || '13:00',
      afternoonTimeOut: record.afternoonSession?.timeOut || '17:00',
      description: record.description || '',
    };
  }

  const onboarding = loadOnboardingData();

  // Sanitize morning time in: must be between 05:00 (300) and 11:59 (719) for a morning session.
  // Any value outside this range (e.g. 00:20, 01:00, 23:00) is treated as corrupt and replaced.
  const morningTimeIn = sanitizeTime(
    onboarding.morningTimeIn,
    300, // 05:00 earliest morning in
    719, // 11:59 latest morning in
    '08:00'
  );

  // Sanitize morning time out: must be between 10:00 (600) and 13:00 (780) for a morning session.
  const morningTimeOut = sanitizeTime(
    onboarding.morningTimeOut,
    600, // 10:00 earliest morning out
    780, // 13:00 latest morning out
    '12:00'
  );

  // Sanitize afternoon time in: must be between 11:00 (660) and 15:00 (900).
  const afternoonTimeIn = sanitizeTime(
    onboarding.afternoonTimeIn,
    660, // 11:00 earliest afternoon in
    900, // 15:00 latest afternoon in
    '13:00'
  );

  // Sanitize afternoon time out: must be between 13:00 (780) and 23:00 (1380).
  const afternoonTimeOut = sanitizeTime(
    onboarding.afternoonTimeOut,
    780, // 13:00 earliest afternoon out
    1380, // 23:00 latest afternoon out
    '17:00'
  );

  return {
    entryType: 'work',
    date: TODAY,
    activity: 'Development',
    morningAttended: onboarding.morningEnabled !== false,
    morningTimeIn,
    morningTimeOut,
    afternoonAttended: onboarding.afternoonEnabled !== false,
    afternoonTimeIn,
    afternoonTimeOut,
    description: '',
  };
}

/**
 * Internal Form Body for creating and editing daily training records.
 * Mounts freshly on dialog open, guaranteeing accurate defaults and zero stale state.
 */
function RecordFormContent({
  recordToEdit,
  existingRecords = [],
  onSubmit,
  onOpenChange,
  onEditExisting,
}) {
  const [form, setForm] = useState(() => getFormStateFromRecord(recordToEdit));
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formScrollRef = useRef(null);
  const dateWarningRef = useRef(null);

  // Live accurate minute-based calculation of actual rendered hours
  const sessionCalculation = useMemo(() => {
    return calculateDailySessionHours({
      morningEnabled: form.morningAttended,
      morningTimeIn: form.morningTimeIn,
      morningTimeOut: form.morningTimeOut,
      afternoonEnabled: form.afternoonAttended,
      afternoonTimeIn: form.afternoonTimeIn,
      afternoonTimeOut: form.afternoonTimeOut,
    });
  }, [
    form.morningAttended,
    form.morningTimeIn,
    form.morningTimeOut,
    form.afternoonAttended,
    form.afternoonTimeIn,
    form.afternoonTimeOut,
  ]);

  // Live duplicate date detection — finds any other record with matching date
  const existingRecordForDate = useMemo(() => {
    if (!form.date || !Array.isArray(existingRecords)) return null;
    return existingRecords.find(
      (r) => r.date === form.date && (!recordToEdit || r.id !== recordToEdit.id)
    );
  }, [existingRecords, form.date, recordToEdit]);

  const isDuplicateDate = Boolean(existingRecordForDate);

  const validate = () => {
    const next = {};
    if (!form.date) {
      next.date = 'Training date is required.';
    } else if (isDuplicateDate) {
      next.date = 'Training record already exists for this date. Please choose another date or edit your existing record.';
    }

    if (!form.activity) {
      next.activity = 'Please select an activity category.';
    }

    const sessionErrors = validateSessionsConfig({
      morningEnabled: form.morningAttended,
      morningTimeIn: form.morningTimeIn,
      morningTimeOut: form.morningTimeOut,
      afternoonEnabled: form.afternoonAttended,
      afternoonTimeIn: form.afternoonTimeIn,
      afternoonTimeOut: form.afternoonTimeOut,
    });

    Object.assign(next, sessionErrors);

    if (sessionCalculation.totalHours <= 0 && !sessionErrors.sessions) {
      next.hours = 'Total actual rendered hours must be greater than 0.';
    }

    if (!form.description.trim()) {
      next.description = 'Description / tasks accomplished is required.';
    } else if (form.description.trim().length < 5) {
      next.description = 'Please provide a more detailed description of your tasks today.';
    }

    return next;
  };

  const handleSubmit = () => {
    // If duplicate date, scroll to the warning and block submission
    if (isDuplicateDate) {
      setErrors((prev) => ({
        ...prev,
        date: 'Training record already exists for this date. Please choose another date or edit your existing record.',
      }));
      // Scroll the form body to the top so the duplicate warning is visible
      if (formScrollRef.current) {
        formScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
      // Also try to scroll the warning element into view
      if (dateWarningRef.current) {
        dateWarningRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      return;
    }

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      // Scroll to top to show any date errors
      if (validationErrors.date && formScrollRef.current) {
        formScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }

    setIsSubmitting(true);
    onSubmit({
      date: form.date,
      activity: form.activity,
      hours: sessionCalculation.totalHours,
      morningSession: {
        attended: form.morningAttended,
        timeIn: form.morningAttended ? form.morningTimeIn : '',
        timeOut: form.morningAttended ? form.morningTimeOut : '',
        durationMinutes: sessionCalculation.morningMinutes,
        durationHours: sessionCalculation.morningHours,
      },
      afternoonSession: {
        attended: form.afternoonAttended,
        timeIn: form.afternoonAttended ? form.afternoonTimeIn : '',
        timeOut: form.afternoonAttended ? form.afternoonTimeOut : '',
        durationMinutes: sessionCalculation.afternoonMinutes,
        durationHours: sessionCalculation.afternoonHours,
      },
      description: form.description.trim(),
    });
    setIsSubmitting(false);
    onOpenChange(false);
  };

  const isEditing = Boolean(recordToEdit);

  return (
    <>
      <DialogHeader
        title={isEditing ? 'Edit Training Record' : 'Log Training Hours'}
        subtitle={
          isEditing
            ? 'Update your recorded attendance sessions and tasks accomplished.'
            : 'Record your actual attendance times, activities, and tasks accomplished today.'
        }
        onOpenChange={onOpenChange}
      />

      {/* Scrollable Form Body (Light Theme Navy + Emerald) */}
      <VStack
        gap={4}
        padding={4}
        isScrollable
        ref={formScrollRef}
        style={{
          maxHeight: 'calc(92dvh - 170px)',
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {/* 1. Training Date — Required & 2. Activity Category — Required */}
        <Grid columns={{ minWidth: 220, max: 2 }} gap={3}>
          <DateInput
            label="Training Date"
            isRequired
            value={form.date}
            max={TODAY}
            onChange={(val) => {
              setForm((prev) => ({ ...prev, date: val }));
              setErrors((prev) => ({ ...prev, date: undefined }));
            }}
            status={
              isDuplicateDate
                ? { type: 'error', message: 'Training record already exists for this date.' }
                : errors.date
                ? { type: 'error', message: errors.date }
                : undefined
            }
            width="100%"
          />

          <Selector
            label="Activity Category"
            isRequired
            placeholder="Select a category"
            options={ACTIVITY_OPTIONS}
            value={form.activity}
            onChange={(val) => {
              setForm((prev) => ({ ...prev, activity: val }));
              setErrors((prev) => ({ ...prev, activity: undefined }));
            }}
            status={errors.activity ? { type: 'error', message: errors.activity } : undefined}
            width="100%"
          />
        </Grid>

        {/* Duplicate date warning — prominently displayed immediately below the date/activity row */}
        {isDuplicateDate && (
          <div ref={dateWarningRef} style={{ width: '100%' }}>
            <Banner
              status="error"
              title="Training record already exists for this date"
            />
            <div
              style={{
                backgroundColor: '#fef2f2',
                border: '1.5px solid #fecaca',
                borderRadius: 10,
                padding: '10px 14px',
                marginTop: 6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 10,
                flexWrap: 'wrap',
              }}
            >
              <Text size="sm" color="destructive">
                Training record already exists for this date. Please choose another date or edit your existing record.
              </Text>
              {onEditExisting && existingRecordForDate && (
                <Button
                  size="sm"
                  variant="secondary"
                  label="Edit Existing Record"
                  onClick={() => {
                    onEditExisting(existingRecordForDate);
                  }}
                />
              )}
            </div>
          </div>
        )}

        {errors.sessions && <Banner status="error" title={errors.sessions} />}

        {/* 3 & 4. Morning Session: Morning Time In & Morning Time Out */}
        <IOSSessionCard
          title="Morning"
          icon="sun"
          enabled={form.morningAttended}
          durationHours={sessionCalculation.morningHours}
          timeIn={form.morningTimeIn}
          onTimeInChange={(val) => {
            setForm((prev) => ({ ...prev, morningTimeIn: val }));
            setErrors((prev) => ({
              ...prev,
              morningTimeIn: undefined,
              sessions: undefined,
              hours: undefined,
            }));
          }}
          timeOut={form.morningTimeOut}
          onTimeOutChange={(val) => {
            setForm((prev) => ({ ...prev, morningTimeOut: val }));
            setErrors((prev) => ({
              ...prev,
              morningTimeOut: undefined,
              sessions: undefined,
              hours: undefined,
            }));
          }}
          onToggle={(enabled) => {
            if (!enabled && !form.afternoonAttended) {
              setErrors((prev) => ({
                ...prev,
                sessions: 'At least one session (Morning or Afternoon) must remain attended.',
              }));
              return;
            }
            setForm((prev) => ({ ...prev, morningAttended: enabled }));
            setErrors((prev) => ({
              ...prev,
              morningTimeIn: undefined,
              morningTimeOut: undefined,
              sessions: undefined,
              hours: undefined,
            }));
          }}
        />

        {/* 5 & 6. Afternoon Session: Afternoon Time In & Afternoon Time Out */}
        <IOSSessionCard
          title="Afternoon"
          icon="moon"
          enabled={form.afternoonAttended}
          durationHours={sessionCalculation.afternoonHours}
          timeIn={form.afternoonTimeIn}
          onTimeInChange={(val) => {
            setForm((prev) => ({ ...prev, afternoonTimeIn: val }));
            setErrors((prev) => ({
              ...prev,
              afternoonTimeIn: undefined,
              sessions: undefined,
              hours: undefined,
            }));
          }}
          timeOut={form.afternoonTimeOut}
          onTimeOutChange={(val) => {
            setForm((prev) => ({ ...prev, afternoonTimeOut: val }));
            setErrors((prev) => ({
              ...prev,
              afternoonTimeOut: undefined,
              sessions: undefined,
              hours: undefined,
            }));
          }}
          onToggle={(enabled) => {
            if (!enabled && !form.morningAttended) {
              setErrors((prev) => ({
                ...prev,
                sessions: 'At least one session (Morning or Afternoon) must remain attended.',
              }));
              return;
            }
            setForm((prev) => ({ ...prev, afternoonAttended: enabled }));
            setErrors((prev) => ({
              ...prev,
              afternoonTimeIn: undefined,
              afternoonTimeOut: undefined,
              sessions: undefined,
              hours: undefined,
            }));
          }}
        />

        {/* 7. Actual Rendered Hours Summary (After Time Entries, Before Description) */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: 14,
            padding: '16px 20px',
            border: '1.5px solid #e2e8f0',
            boxShadow: '0 1px 4px rgba(20, 43, 73, 0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#142b49' }}>
              Actual Rendered Hours
            </span>
            <span style={{ fontSize: 13, color: '#64748b' }}>
              {form.morningAttended ? `AM: ${sessionCalculation.morningHours}h` : 'AM: 0h'}
              {' + '}
              {form.afternoonAttended ? `PM: ${sessionCalculation.afternoonHours}h` : 'PM: 0h'}
            </span>
            <span style={{ fontSize: 12, color: '#94a3b8' }}>
              Lunch break and excluded intervals are not counted.
            </span>
          </div>
          <div
            style={{
              fontSize: 24,
              fontWeight: 800,
              color: '#10b981',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {sessionCalculation.totalHours} hrs
          </div>
        </div>

        {errors.hours && <Banner status="error" title={errors.hours} />}

        {/* 8. Description / Tasks Accomplished — Required */}
        <VStack gap={1.5}>
          <TextArea
            label="Description / Tasks Accomplished"
            isRequired
            placeholder="Describe the tasks you completed, activities you participated in, and skills or knowledge you gained today..."
            value={form.description}
            onChange={(val) => {
              setForm((prev) => ({ ...prev, description: val }));
              if (errors.description) setErrors((prev) => ({ ...prev, description: undefined }));
            }}
            status={errors.description ? { type: 'error', message: errors.description } : undefined}
            rows={4}
            maxLength={1000}
            width="100%"
          />
          <HStack justify="end">
            <Text size="xs" color={form.description.length > 950 ? 'warning' : 'secondary'}>
              {form.description.length} / 1000 characters
            </Text>
          </HStack>
        </VStack>
      </VStack>

      {/* 9. Save Training Record Sticky Footer */}
      <HStack
        justify="between"
        align="center"
        padding={4}
        wrap="wrap"
        gap={2}
        style={{
          borderTop: '1px solid #e2e8f0',
          backgroundColor: '#ffffff',
        }}
      >
        <VStack gap={0}>
          <Text size="xs" color="secondary">
            {isEditing ? 'Updated Total' : 'Total Rendered Today'}
          </Text>
          <Heading level={3} color="accent">
            {sessionCalculation.totalHours} hrs
          </Heading>
        </VStack>

        <HStack gap={2}>
          <Button
            label="Cancel"
            variant="secondary"
            onClick={() => onOpenChange(false)}
          />
          <Button
            label={isEditing ? 'Save Changes' : 'Save Training Record'}
            variant="primary"
            isLoading={isSubmitting}
            isDisabled={isDuplicateDate}
            onClick={handleSubmit}
          />
        </HStack>
      </HStack>
    </>
  );
}

/**
 * Record Form Dialog wrapper. Mounts RecordFormContent only when isOpen=true.
 */
function RecordFormDialog({
  isOpen,
  onOpenChange,
  recordToEdit,
  existingRecords = [],
  onSubmit,
  onEditExisting,
}) {
  return (
    <Dialog
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      purpose="form"
      width={600}
      maxHeight="92dvh"
    >
      {isOpen && (
        <RecordFormContent
          recordToEdit={recordToEdit}
          existingRecords={existingRecords}
          onSubmit={onSubmit}
          onOpenChange={onOpenChange}
          onEditExisting={onEditExisting}
        />
      )}
    </Dialog>
  );
}

/**
 * View Details Dialog for reviewing full record contents.
 */
function ViewDetailsDialog({ isOpen, onOpenChange, record, onEdit }) {
  if (!record) return null;

  return (
    <Dialog
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      purpose="info"
      width={560}
      maxHeight="85dvh"
    >
      <DialogHeader
        title="Training Log Details"
        subtitle={formatFullDate(record.date)}
        onOpenChange={onOpenChange}
      />
      <VStack
        gap={4}
        padding={4}
        isScrollable
        style={{
          maxHeight: 'calc(85dvh - 140px)',
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <Grid columns={{ minWidth: 200, max: 2 }} gap={3}>
          <Card elevation="low" padding={3}>
            <VStack gap={1}>
              <Text size="xs" color="secondary">Activity Category</Text>
              <Text weight="semibold">{record.activity || 'Development'}</Text>
            </VStack>
          </Card>

          <Card elevation="low" padding={3}>
            <VStack gap={1}>
              <Text size="xs" color="secondary">Total Rendered Hours</Text>
              <Heading level={3} color="accent">{record.hours} hrs</Heading>
            </VStack>
          </Card>
        </Grid>

        {/* Morning Session Details */}
        <Card variant={record.morningSession?.attended ? 'default' : 'muted'} padding={3}>
          <VStack gap={1}>
            <HStack justify="between" align="center">
              <Text weight="semibold">Morning Session</Text>
              <StatusDot
                variant={record.morningSession?.attended ? 'success' : 'neutral'}
                label={record.morningSession?.attended ? 'Attended' : 'No AM Session'}
              />
            </HStack>
            {record.morningSession?.attended ? (
              <HStack justify="between" align="center">
                <Text size="sm" color="secondary">
                  {formatTime12h(record.morningSession.timeIn)} – {formatTime12h(record.morningSession.timeOut)}
                </Text>
                <Text size="sm" weight="medium">
                  {record.morningSession.durationHours} hrs ({record.morningSession.durationMinutes} mins)
                </Text>
              </HStack>
            ) : (
              <Text size="sm" color="secondary">No morning session recorded for this day.</Text>
            )}
          </VStack>
        </Card>

        {/* Afternoon Session Details */}
        <Card variant={record.afternoonSession?.attended ? 'default' : 'muted'} padding={3}>
          <VStack gap={1}>
            <HStack justify="between" align="center">
              <Text weight="semibold">Afternoon Session</Text>
              <StatusDot
                variant={record.afternoonSession?.attended ? 'success' : 'neutral'}
                label={record.afternoonSession?.attended ? 'Attended' : 'No PM Session'}
              />
            </HStack>
            {record.afternoonSession?.attended ? (
              <HStack justify="between" align="center">
                <Text size="sm" color="secondary">
                  {formatTime12h(record.afternoonSession.timeIn)} – {formatTime12h(record.afternoonSession.timeOut)}
                </Text>
                <Text size="sm" weight="medium">
                  {record.afternoonSession.durationHours} hrs ({record.afternoonSession.durationMinutes} mins)
                </Text>
              </HStack>
            ) : (
              <Text size="sm" color="secondary">No afternoon session recorded for this day.</Text>
            )}
          </VStack>
        </Card>

        {/* Description / Tasks Accomplished */}
        <Card elevation="low" padding={4}>
          <VStack gap={2}>
            <Text weight="semibold">Tasks Accomplished & Notes</Text>
            <Divider variant="subtle" />
            <Text style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
              {record.description || 'No description provided.'}
            </Text>
          </VStack>
        </Card>

        {/* Record Metadata */}
        <HStack justify="between" align="center" wrap="wrap">
          <Text size="xs" color="secondary">
            Verified Training Entry
          </Text>
          {record.updatedAt && (
            <Text size="xs" color="secondary">
              Last saved: {new Date(record.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          )}
        </HStack>
      </VStack>

      <HStack
        justify="end"
        padding={3}
        gap={2}
        style={{
          borderTop: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-background-surface)',
        }}
      >
        <Button
          label="Edit Record"
          variant="secondary"
          onClick={() => {
            onOpenChange(false);
            onEdit(record);
          }}
        />
        <Button
          label="Close"
          variant="primary"
          onClick={() => onOpenChange(false)}
        />
      </HStack>
    </Dialog>
  );
}

/**
 * Delete Confirmation Dialog.
 */
function DeleteConfirmDialog({ isOpen, onOpenChange, record, onConfirm }) {
  if (!record) return null;

  return (
    <Dialog
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      purpose="required"
      width={460}
    >
      <DialogHeader
        title="Delete Training Record?"
        subtitle={`Delete record for ${formatFullDate(record.date)} (${record.hours} hrs)`}
        onOpenChange={onOpenChange}
      />
      <VStack gap={4} padding={4}>
        <Text color="secondary">
          Are you sure you want to permanently delete this training record? This will reduce your completed OJT hours by{' '}
          <strong>{record.hours} hours</strong>. This action cannot be undone.
        </Text>
        <HStack gap={2} justify="end">
          <Button
            label="Cancel"
            variant="secondary"
            onClick={() => onOpenChange(false)}
          />
          <Button
            label="Yes, Delete Record"
            variant="destructive"
            onClick={() => {
              onConfirm(record.id);
              onOpenChange(false);
            }}
          />
        </HStack>
      </VStack>
    </Dialog>
  );
}

/**
 * Main TimeLogs Page Component.
 */
export function TimeLogs() {
  const { currentUser, records, addRecord, updateRecord, deleteRecord } = useTraining();
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isDttrDialogOpen, setIsDttrDialogOpen] = useState(false);
  const [selectedSystemTemplateType, setSelectedSystemTemplateType] = useState('system_chmsu_ccs');
  const [isTemplateSelectorOpen, setIsTemplateSelectorOpen] = useState(false);
  const [isCustomTemplateOpen, setIsCustomTemplateOpen] = useState(false);
  const [customTemplateMode, setCustomTemplateMode] = useState('upload'); // 'upload' | 'generate'
  const [selectedCustomTemplate, setSelectedCustomTemplate] = useState(null);
  const [recordToEdit, setRecordToEdit] = useState(null);
  const [recordToView, setRecordToView] = useState(null);
  const [recordToDelete, setRecordToDelete] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const [sort, setSort] = useState([{ sortKey: 'date', direction: 'descending' }]);

  const handleToggleSort = (key) => {
    setSort((prev) => {
      if (prev.length > 0 && prev[0].sortKey === key) {
        return [{ sortKey: key, direction: prev[0].direction === 'ascending' ? 'descending' : 'ascending' }];
      }
      return [{ sortKey: key, direction: 'descending' }];
    });
  };

  const sortedRecords = useMemo(() => {
    if (sort.length === 0) return [...records];
    const { sortKey, direction } = sort[0];
    return [...records].sort((a, b) => {
      let aVal = a[sortKey];
      let bVal = b[sortKey];
      if (sortKey === 'hours') {
        aVal = Number(aVal);
        bVal = Number(bVal);
      } else {
        aVal = String(aVal ?? '');
        bVal = String(bVal ?? '');
      }
      if (aVal < bVal) return direction === 'ascending' ? -1 : 1;
      if (aVal > bVal) return direction === 'ascending' ? 1 : -1;
      return 0;
    });
  }, [records, sort]);

  const handleOpenNewLog = () => {
    setRecordToEdit(null);
    setIsFormDialogOpen(true);
  };

  const handleEdit = (record) => {
    if (currentUser && record.userId && record.userId !== currentUser.id) {
      setFeedback({ type: 'error', message: 'You do not have permission to edit this record.' });
      return;
    }
    setRecordToEdit(record);
    setIsFormDialogOpen(true);
  };

  const handleFormSubmit = (formData) => {
    if (recordToEdit) {
      updateRecord(recordToEdit.id, formData);
      setFeedback({ type: 'success', message: `Training record for ${formData.date} updated successfully.` });
    } else {
      addRecord(formData);
      setFeedback({ type: 'success', message: `Training record for ${formData.date} logged successfully.` });
    }
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleDeleteConfirm = (id) => {
    const target = records.find((r) => r.id === id);
    if (currentUser && target?.userId && target.userId !== currentUser.id) {
      setFeedback({ type: 'error', message: 'You do not have permission to delete this record.' });
      return;
    }
    deleteRecord(id);
    setFeedback({ type: 'success', message: 'Training record deleted successfully.' });
    setTimeout(() => setFeedback(null), 3500);
  };

  return (
    <PageLayout
      title="Time Logs"
      description="Record and review all your on-the-job training hours and daily session attendance."
      actions={
        <HStack gap={2} align="center">
          <Button
            label="Print DTTR"
            variant="secondary"
            icon={<PrinterIcon style={{ width: 16, height: 16 }} />}
            onClick={() => setIsTemplateSelectorOpen(true)}
          />
          <Button
            label="Log Hours"
            variant="primary"
            icon={<Icon icon="clock" size="sm" />}
            onClick={handleOpenNewLog}
          />
        </HStack>
      }
    >
      <VStack gap={4}>
        {feedback && (
          <Banner
            status={feedback.type}
            title={feedback.message}
            isDismissable
            onDismiss={() => setFeedback(null)}
          />
        )}

        <Card padding={4} elevation="low">
          <VStack gap={4}>
            <HStack justify="between" align="center">
              <VStack gap={0.5}>
                <Heading level={2}>All Training Records</Heading>
                <Text type="supporting" color="secondary">
                  {records.length === 0
                    ? 'No records yet. Log your first training session to get started.'
                    : `${records.length} record${records.length === 1 ? '' : 's'} total`}
                </Text>
              </VStack>
            </HStack>

            {records.length === 0 ? (
              <EmptyState
                title="No time entries yet"
                description="Start recording your daily OJT hours to build your verified training history."
                icon={<Icon icon={GraduationCapIcon} size="lg" color="accent" />}
                actions={
                  <Button
                    label="Log Your First Hours"
                    variant="primary"
                    onClick={handleOpenNewLog}
                  />
                }
              />
            ) : (
              <>
                {/* Desktop & Tablet Table Layout (>= 769px) */}
                <div
                  className="ojt-desktop-only"
                  style={{
                    width: '100%',
                    overflowX: 'auto',
                    borderRadius: 12,
                    border: '1px solid #e2e8f0',
                    backgroundColor: '#ffffff',
                  }}
                >
                  <table
                    style={{
                      width: '100%',
                      borderCollapse: 'collapse',
                      textAlign: 'left',
                      minWidth: 840,
                    }}
                  >
                    <thead>
                      <tr
                        style={{
                          backgroundColor: '#f8fafc',
                          borderBottom: '2px solid #e2e8f0',
                        }}
                      >
                        <th
                          onClick={() => handleToggleSort('date')}
                          title="Click to sort by Date"
                          style={{
                            padding: '14px 16px',
                            fontSize: '0.85rem',
                            fontWeight: 700,
                            color: '#142b49',
                            width: '15%',
                            letterSpacing: '0.02em',
                            cursor: 'pointer',
                            userSelect: 'none',
                          }}
                        >
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                            Date
                            <span style={{ fontSize: '0.75rem', color: sort[0]?.sortKey === 'date' ? '#10b981' : '#94a3b8' }}>
                              {sort[0]?.sortKey === 'date' ? (sort[0].direction === 'ascending' ? '▲' : '▼') : '↕'}
                            </span>
                          </span>
                        </th>
                        <th
                          style={{
                            padding: '14px 16px',
                            fontSize: '0.85rem',
                            fontWeight: 700,
                            color: '#142b49',
                            width: '19%',
                            letterSpacing: '0.02em',
                          }}
                        >
                          Morning Session
                        </th>
                        <th
                          style={{
                            padding: '14px 16px',
                            fontSize: '0.85rem',
                            fontWeight: 700,
                            color: '#142b49',
                            width: '19%',
                            letterSpacing: '0.02em',
                          }}
                        >
                          Afternoon Session
                        </th>
                        <th
                          onClick={() => handleToggleSort('hours')}
                          title="Click to sort by Total Hours"
                          style={{
                            padding: '14px 16px',
                            fontSize: '0.85rem',
                            fontWeight: 700,
                            color: '#142b49',
                            width: '13%',
                            textAlign: 'right',
                            letterSpacing: '0.02em',
                            cursor: 'pointer',
                            userSelect: 'none',
                          }}
                        >
                          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
                            Total Hours
                            <span style={{ fontSize: '0.75rem', color: sort[0]?.sortKey === 'hours' ? '#10b981' : '#94a3b8' }}>
                              {sort[0]?.sortKey === 'hours' ? (sort[0].direction === 'ascending' ? '▲' : '▼') : '↕'}
                            </span>
                          </span>
                        </th>
                        <th
                          style={{
                            padding: '14px 16px',
                            fontSize: '0.85rem',
                            fontWeight: 700,
                            color: '#142b49',
                            width: '16%',
                            letterSpacing: '0.02em',
                          }}
                        >
                          Tasks / Notes
                        </th>
                        <th
                          style={{
                            padding: '14px 16px',
                            fontSize: '0.85rem',
                            fontWeight: 700,
                            color: '#142b49',
                            width: '18%',
                            textAlign: 'right',
                            letterSpacing: '0.02em',
                          }}
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedRecords.map((row, idx) => {
                        const morning = row.morningSession?.attended;
                        const afternoon = row.afternoonSession?.attended;
                        return (
                          <tr
                            key={row.id || idx}
                            style={{
                              borderBottom: idx < sortedRecords.length - 1 ? '1px solid #f1f5f9' : 'none',
                              transition: 'background-color 0.15s',
                            }}
                          >
                            {/* Date */}
                            <td
                              style={{
                                padding: '14px 16px',
                                fontSize: '0.9rem',
                                fontWeight: 700,
                                color: '#142b49',
                                fontVariantNumeric: 'tabular-nums',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <span>{row.date}</span>
                                <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 500 }}>
                                  {formatFullDate(row.date).split(',')[0]}
                                </span>
                              </div>
                            </td>

                            {/* Morning Session */}
                            <td style={{ padding: '14px 16px', fontSize: '0.85rem' }}>
                              {morning ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                  <span style={{ fontWeight: 600, color: '#142b49' }}>
                                    {formatTime12h(row.morningSession.timeIn)} – {formatTime12h(row.morningSession.timeOut)}
                                  </span>
                                  <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600 }}>
                                    {row.morningSession.durationHours} hrs rendered
                                  </span>
                                </div>
                              ) : (
                                <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>None</span>
                              )}
                            </td>

                            {/* Afternoon Session */}
                            <td style={{ padding: '14px 16px', fontSize: '0.85rem' }}>
                              {afternoon ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                  <span style={{ fontWeight: 600, color: '#142b49' }}>
                                    {formatTime12h(row.afternoonSession.timeIn)} – {formatTime12h(row.afternoonSession.timeOut)}
                                  </span>
                                  <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600 }}>
                                    {row.afternoonSession.durationHours} hrs rendered
                                  </span>
                                </div>
                              ) : (
                                <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>None</span>
                              )}
                            </td>

                            {/* Total Hours */}
                            <td
                              style={{
                                padding: '14px 16px',
                                textAlign: 'right',
                              }}
                            >
                              <span
                                style={{
                                  display: 'inline-block',
                                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                  color: '#059669',
                                  fontWeight: 800,
                                  fontSize: '0.9rem',
                                  padding: '4px 10px',
                                  borderRadius: 8,
                                  border: '1px solid rgba(16, 185, 129, 0.25)',
                                  fontVariantNumeric: 'tabular-nums',
                                }}
                              >
                                {row.hours} hrs
                              </span>
                            </td>

                            {/* Tasks / Notes */}
                            <td
                              style={{
                                padding: '14px 16px',
                                fontSize: '0.85rem',
                                color: row.description ? '#334155' : '#94a3b8',
                                maxWidth: 220,
                              }}
                            >
                              <div
                                style={{
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  lineHeight: 1.4,
                                }}
                              >
                                {row.description || '—'}
                              </div>
                            </td>

                            {/* Actions Column */}
                            <td
                              style={{
                                padding: '14px 16px',
                                textAlign: 'right',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              <div
                                style={{
                                  display: 'flex',
                                  gap: 6,
                                  justifyContent: 'flex-end',
                                  alignItems: 'center',
                                }}
                              >
                                <Button
                                  label="View"
                                  variant="ghost"
                                  size="sm"
                                  icon={<Icon icon="search" size="sm" />}
                                  onClick={() => setRecordToView(row)}
                                />
                                <Button
                                  label="Edit"
                                  variant="ghost"
                                  size="sm"
                                  icon={<Icon icon="wrench" size="sm" />}
                                  onClick={() => handleEdit(row)}
                                />
                                <Button
                                  label="Delete"
                                  variant="ghost"
                                  size="sm"
                                  icon={<Icon icon="close" size="sm" />}
                                  onClick={() => setRecordToDelete(row)}
                                />
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Responsive Record Cards (<= 768px) */}
                <div
                  className="ojt-mobile-only"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                    width: '100%',
                  }}
                >
                  {sortedRecords.map((row) => {
                    const morning = row.morningSession?.attended;
                    const afternoon = row.afternoonSession?.attended;
                    return (
                      <div
                        key={row.id || row.date}
                        style={{
                          backgroundColor: '#ffffff',
                          border: '1.5px solid #e2e8f0',
                          borderRadius: 14,
                          padding: '16px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 12,
                          boxShadow: '0 1px 3px rgba(20, 43, 73, 0.04)',
                        }}
                      >
                        {/* Header: Date + Activity + Hours */}
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: 8,
                            borderBottom: '1px solid #f1f5f9',
                            paddingBottom: 10,
                          }}
                        >
                          <div>
                            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#142b49' }}>
                              {row.date}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                              {formatFullDate(row.date)}
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            {row.activity && (
                              <span
                                style={{
                                  fontSize: '0.75rem',
                                  backgroundColor: '#f1f5f9',
                                  color: '#475569',
                                  padding: '3px 8px',
                                  borderRadius: 6,
                                  fontWeight: 600,
                                }}
                              >
                                {row.activity}
                              </span>
                            )}
                            <span
                              style={{
                                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                color: '#059669',
                                fontWeight: 800,
                                fontSize: '0.9rem',
                                padding: '4px 10px',
                                borderRadius: 8,
                                border: '1px solid rgba(16, 185, 129, 0.25)',
                              }}
                            >
                              +{row.hours}h
                            </span>
                          </div>
                        </div>

                        {/* Sessions Chips */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.825rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ color: '#64748b', fontWeight: 600 }}>Morning Session:</span>
                            <span style={{ fontWeight: 600, color: morning ? '#142b49' : '#94a3b8' }}>
                              {morning
                                ? `${formatTime12h(row.morningSession.timeIn)} – ${formatTime12h(row.morningSession.timeOut)} (${row.morningSession.durationHours}h)`
                                : 'None'}
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ color: '#64748b', fontWeight: 600 }}>Afternoon Session:</span>
                            <span style={{ fontWeight: 600, color: afternoon ? '#142b49' : '#94a3b8' }}>
                              {afternoon
                                ? `${formatTime12h(row.afternoonSession.timeIn)} – ${formatTime12h(row.afternoonSession.timeOut)} (${row.afternoonSession.durationHours}h)`
                                : 'None'}
                            </span>
                          </div>
                        </div>

                        {/* Tasks / Description */}
                        {row.description && (
                          <div
                            style={{
                              backgroundColor: '#f8fafc',
                              border: '1px solid #e2e8f0',
                              borderRadius: 8,
                              padding: '10px 12px',
                              fontSize: '0.825rem',
                              color: '#334155',
                              lineHeight: 1.5,
                            }}
                          >
                            <span style={{ fontWeight: 700, color: '#142b49', display: 'block', marginBottom: 2 }}>
                              Tasks Accomplished:
                            </span>
                            {row.description}
                          </div>
                        )}

                        {/* Mobile Actions Bar */}
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, 1fr)',
                            gap: 8,
                            paddingTop: 4,
                          }}
                        >
                          <Button
                            label="View"
                            variant="secondary"
                            size="sm"
                            icon={<Icon icon="search" size="sm" />}
                            onClick={() => setRecordToView(row)}
                          />
                          <Button
                            label="Edit"
                            variant="secondary"
                            size="sm"
                            icon={<Icon icon="wrench" size="sm" />}
                            onClick={() => handleEdit(row)}
                          />
                          <Button
                            label="Delete"
                            variant="destructive"
                            size="sm"
                            icon={<Icon icon="close" size="sm" />}
                            onClick={() => setRecordToDelete(row)}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </VStack>
        </Card>
      </VStack>

      {/* Create / Edit Record Dialog */}
      <RecordFormDialog
        isOpen={isFormDialogOpen}
        onOpenChange={setIsFormDialogOpen}
        recordToEdit={recordToEdit}
        existingRecords={records}
        onSubmit={handleFormSubmit}
        onEditExisting={(existingRec) => {
          setIsFormDialogOpen(false);
          setTimeout(() => {
            handleEdit(existingRec);
          }, 120);
        }}
      />

      {/* View Details Dialog */}
      <ViewDetailsDialog
        isOpen={Boolean(recordToView)}
        onOpenChange={(open) => !open && setRecordToView(null)}
        record={recordToView}
        onEdit={(rec) => {
          setRecordToView(null);
          handleEdit(rec);
        }}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={Boolean(recordToDelete)}
        onOpenChange={(open) => !open && setRecordToDelete(null)}
        record={recordToDelete}
        onConfirm={handleDeleteConfirm}
      />

      {/* DTTR Monthly Print Report Dialog (Official System Template) */}
      <DttrPrintModal
        isOpen={isDttrDialogOpen}
        onOpenChange={setIsDttrDialogOpen}
        records={records}
        currentUser={currentUser}
        templateVariant={selectedSystemTemplateType}
      />

      {/* DTTR Template Selector — Step 1 when clicking "Print DTTR" */}
      <DttrTemplateSelectorModal
        isOpen={isTemplateSelectorOpen}
        onOpenChange={setIsTemplateSelectorOpen}
        currentUser={currentUser}
        onSelectSystem={(type) => {
          setSelectedSystemTemplateType(type || 'system_chmsu_ccs');
          setIsTemplateSelectorOpen(false);
          setIsDttrDialogOpen(true);
        }}
        onSelectCustom={(tmpl) => {
          setIsTemplateSelectorOpen(false);
          setSelectedCustomTemplate(tmpl);
          setCustomTemplateMode('generate');
          setIsCustomTemplateOpen(true);
        }}
        onUploadNew={() => {
          setIsTemplateSelectorOpen(false);
          setCustomTemplateMode('upload');
          setSelectedCustomTemplate(null);
          setIsCustomTemplateOpen(true);
        }}
      />

      {/* Custom Template Upload / Generate */}
      <DttrCustomTemplateModal
        isOpen={isCustomTemplateOpen}
        onOpenChange={setIsCustomTemplateOpen}
        currentUser={currentUser}
        records={records}
        mode={customTemplateMode}
        template={selectedCustomTemplate}
        onSaved={() => {
          // After saving a new upload, go back to the template selector
          setIsCustomTemplateOpen(false);
          setIsTemplateSelectorOpen(true);
        }}
        onBack={() => {
          setIsCustomTemplateOpen(false);
          setIsTemplateSelectorOpen(true);
        }}
      />
    </PageLayout>
  );
}
