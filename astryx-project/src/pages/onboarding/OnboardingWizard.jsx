import React, { useState, useMemo, useEffect } from 'react';
import { VStack } from '@astryxdesign/core/VStack';
import { HStack } from '@astryxdesign/core/HStack';
import { Grid } from '@astryxdesign/core/Grid';
import { Card } from '@astryxdesign/core/Card';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { Button } from '@astryxdesign/core/Button';
import { NumberInput } from '@astryxdesign/core/NumberInput';
import { DateInput } from '@astryxdesign/core/DateInput';
import { TextInput } from '@astryxdesign/core/TextInput';
import { CheckboxInput } from '@astryxdesign/core/CheckboxInput';
import { Stepper, Step } from '@astryxdesign/core/Stepper';
import { StatusDot } from '@astryxdesign/core/StatusDot';
import { Divider } from '@astryxdesign/core/Divider';
import { Banner } from '@astryxdesign/core/Banner';
import { Icon } from '@astryxdesign/core/Icon';
import { GraduationCapIcon } from '../../components/common/BrandIcons';
import {
  DAYS_OF_WEEK,
  loadOnboardingData,
  saveOnboardingData,
  completeOnboarding,
  fetchRemoteOnboardingData,
  syncOnboardingDraftToBackend,
  calculateTrainingDays,
  calculateDailySessionHours,
  validateSessionsConfig,
  calculateEstimatedCompletionDate,
} from '../../services/onboardingService';

export function OnboardingWizard({ onComplete }) {
  const [activeStep, setActiveStep] = useState(0);
  const [data, setData] = useState(() => loadOnboardingData());
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Restore remote onboarding state from backend across browsers/devices
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const remote = await fetchRemoteOnboardingData();
        if (isMounted && remote) {
          setData(remote);
          if (remote.onboardingCompleted) {
            onComplete?.(remote);
            return;
          }
          if (remote.onboardingStep && remote.onboardingStep > 0 && remote.onboardingStep < 4) {
            setActiveStep(remote.onboardingStep);
          }
        }
      } catch (err) {
        console.warn('Could not restore remote onboarding draft:', err);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  // Auto-save draft on data changes to preserve state
  useEffect(() => {
    saveOnboardingData(data);
  }, [data]);

  // Derived Two-Session Calculations
  const sessionHours = useMemo(
    () =>
      calculateDailySessionHours({
        morningEnabled: data.morningEnabled,
        morningTimeIn: data.morningTimeIn,
        morningTimeOut: data.morningTimeOut,
        afternoonEnabled: data.afternoonEnabled,
        afternoonTimeIn: data.afternoonTimeIn,
        afternoonTimeOut: data.afternoonTimeOut,
      }),
    [
      data.morningEnabled,
      data.morningTimeIn,
      data.morningTimeOut,
      data.afternoonEnabled,
      data.afternoonTimeIn,
      data.afternoonTimeOut,
    ]
  );

  const effectiveDailyHours =
    sessionHours.totalHours > 0
      ? sessionHours.totalHours
      : Number(data.dailyWorkingHours) || 8;

  const calculatedTrainingDays = useMemo(
    () => calculateTrainingDays(data.requiredHours, effectiveDailyHours),
    [data.requiredHours, effectiveDailyHours]
  );

  const completionInfo = useMemo(
    () =>
      calculateEstimatedCompletionDate(
        data.startDate,
        data.requiredHours,
        effectiveDailyHours,
        data.workingDays
      ),
    [data.startDate, data.requiredHours, effectiveDailyHours, data.workingDays]
  );

  // Field change helpers
  const updateField = (field, value) => {
    setData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const toggleWorkingDay = (day) => {
    setData((prev) => {
      const exists = prev.workingDays.includes(day);
      const nextDays = exists
        ? prev.workingDays.filter((d) => d !== day)
        : [...prev.workingDays, day];
      return { ...prev, workingDays: nextDays };
    });
    if (errors.workingDays) {
      setErrors((prev) => ({ ...prev, workingDays: undefined }));
    }
  };

  // Step Validation Logic
  const validateStep = (stepIndex) => {
    const errs = {};

    if (stepIndex === 0) {
      if (!data.requiredHours || Number(data.requiredHours) <= 0) {
        errs.requiredHours = 'Please enter valid required training hours (e.g. 600).';
      }
      if (!data.dailyWorkingHours || Number(data.dailyWorkingHours) <= 0) {
        errs.dailyWorkingHours = 'Daily working hours must be greater than 0.';
      }
      if (!data.startDate) {
        errs.startDate = 'Training start date is required.';
      }
    } else if (stepIndex === 1) {
      if (!data.workingDays || data.workingDays.length === 0) {
        errs.workingDays = 'Please select at least one regular working day.';
      }
      const sessionErrors = validateSessionsConfig({
        morningEnabled: data.morningEnabled,
        morningTimeIn: data.morningTimeIn,
        morningTimeOut: data.morningTimeOut,
        afternoonEnabled: data.afternoonEnabled,
        afternoonTimeIn: data.afternoonTimeIn,
        afternoonTimeOut: data.afternoonTimeOut,
      });
      Object.assign(errs, sessionErrors);
    } else if (stepIndex === 2) {
      if (!data.schoolName.trim()) {
        errs.schoolName = 'School or university name is required.';
      }
      if (!data.program.trim()) {
        errs.program = 'Academic program / degree course is required.';
      }
    } else if (stepIndex === 3) {
      if (!data.companyName.trim()) {
        errs.companyName = 'Host company name is required.';
      }
      if (!data.companyAddress.trim()) {
        errs.companyAddress = 'Company address is required.';
      }
      if (!data.companyDepartment.trim()) {
        errs.companyDepartment = 'Department / office assignment is required.';
      }
      if (!data.internshipRole.trim()) {
        errs.internshipRole = 'Internship position or role is required.';
      }
    }

    return errs;
  };

  const handleNext = () => {
    const stepErrors = validateStep(activeStep);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    setErrors({});
    if (activeStep < 3) {
      const nextStep = activeStep + 1;
      setActiveStep(nextStep);
      syncOnboardingDraftToBackend(data, nextStep);
    }
  };

  const handleBack = () => {
    setErrors({});
    if (activeStep > 0) {
      setActiveStep((prev) => prev - 1);
    }
  };

  const handleComplete = async () => {
    const stepErrors = validateStep(3);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await completeOnboarding(data);
    } catch (err) {
      console.warn('Onboarding completion error:', err);
    } finally {
      setIsSubmitting(false);
      onComplete?.(data);
    }
  };

  return (
    <div className="ojt-landing-root" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Top Header */}
      <header
        style={{
          borderBottom: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-background-surface)',
          padding: '16px 24px',
        }}
      >
        <div className="ojt-landing-container">
          <HStack justify="between" align="center">
            <HStack gap={2} align="center">
              <Icon icon={GraduationCapIcon} size="md" color="accent" />
              <VStack gap={0}>
                <Heading level={3}>OJT Tracker</Heading>
                <Text size="sm" color="secondary">
                  Student Setup Wizard
                </Text>
              </VStack>
            </HStack>

            <Text size="sm" weight="semibold" color="accent">
              Step {activeStep + 1} of 4
            </Text>
          </HStack>
        </div>
      </header>

      {/* Main Form Container */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          padding: '36px 16px',
        }}
      >
        <div style={{ width: '100%', maxWidth: 760 }}>
          <VStack gap={6}>
            {/* Stepper Progress Bar */}
            <Card elevation="low" padding={4}>
              <Stepper activeStep={activeStep}>
                <Step step={0} label="Requirements" description="Target hours & start" />
                <Step step={1} label="Schedule" description="Working days & shifts" />
                <Step step={2} label="School" description="Academic details" />
                <Step step={3} label="Company" description="Host training placement" />
              </Stepper>
            </Card>

            {/* Step 1: Training Requirements */}
            {activeStep === 0 && (
              <Card elevation="low" padding={6}>
                <VStack gap={5}>
                  <VStack gap={1}>
                    <Heading level={2}>Training Requirements</Heading>
                    <Text type="body" color="secondary">
                      Configure your mandatory OJT training hours and starting date.
                    </Text>
                  </VStack>

                  <Divider variant="subtle" />

                  <Grid columns={{ minWidth: 260, max: 2 }} gap={4}>
                    <NumberInput
                      label="Required OJT Hours"
                      isRequired
                      description="Enter your curriculum's required hours (e.g. 600, 486, 300)"
                      value={data.requiredHours}
                      min={50}
                      max={1500}
                      step={50}
                      units="hrs"
                      hasNumberSteppers
                      onChange={(val) => updateField('requiredHours', val)}
                      status={errors.requiredHours ? { type: 'error', message: errors.requiredHours } : undefined}
                      width="100%"
                    />

                    <NumberInput
                      label="Daily Working Hours"
                      isRequired
                      description="Expected training rendered per day (usually 8 hrs)"
                      value={data.dailyWorkingHours}
                      min={1}
                      max={16}
                      step={0.5}
                      units="hrs/day"
                      hasNumberSteppers
                      onChange={(val) => updateField('dailyWorkingHours', val)}
                      status={errors.dailyWorkingHours ? { type: 'error', message: errors.dailyWorkingHours } : undefined}
                      width="100%"
                    />
                  </Grid>

                  <DateInput
                    label="Training Start Date"
                    isRequired
                    description="The official first day of your on-the-job training"
                    value={data.startDate}
                    onChange={(val) => updateField('startDate', val || '')}
                    status={errors.startDate ? { type: 'error', message: errors.startDate } : undefined}
                    width="100%"
                  />

                  {/* Calculated Completion Preview */}
                  <Card variant="muted" padding={4}>
                    <VStack gap={2}>
                      <HStack justify="between" align="center" wrap="wrap">
                        <Text size="sm" weight="semibold">
                          Estimated Timeline Preview
                        </Text>
                        <HStack gap={1} align="center">
                          <StatusDot variant="success" label="Calculated" />
                          <Text size="sm" color="accent" weight="medium">
                            Auto-Calculated
                          </Text>
                        </HStack>
                      </HStack>

                      <Grid columns={{ minWidth: 160, max: 3 }} gap={3}>
                        <VStack gap={0.5}>
                          <Text size="sm" color="secondary">Total Training Days</Text>
                          <Heading level={3}>{calculatedTrainingDays} days</Heading>
                        </VStack>
                        <VStack gap={0.5}>
                          <Text size="sm" color="secondary">Estimated Duration</Text>
                          <Heading level={3}>
                            {completionInfo ? `~${completionInfo.estimatedWeeks} weeks` : '—'}
                          </Heading>
                        </VStack>
                        <VStack gap={0.5}>
                          <Text size="sm" color="secondary">Target Completion Date</Text>
                          <Heading level={3} color="accent">
                            {completionInfo ? completionInfo.formatted : '—'}
                          </Heading>
                        </VStack>
                      </Grid>
                    </VStack>
                  </Card>
                </VStack>
              </Card>
            )}

            {/* Step 2: Training Schedule */}
            {activeStep === 1 && (
              <Card elevation="low" padding={6}>
                <VStack gap={5}>
                  <VStack gap={1}>
                    <Heading level={2}>Training Schedule & Daily Sessions</Heading>
                    <Text type="body" color="secondary">
                      Select your weekly attendance days and configure your morning and afternoon training sessions.
                    </Text>
                  </VStack>

                  <Divider variant="subtle" />

                  {/* Working Days Selector */}
                  <VStack gap={3}>
                    <HStack justify="between" align="center" wrap="wrap">
                      <VStack gap={0.5}>
                        <Text weight="semibold">Regular Working Days</Text>
                        <Text size="sm" color="secondary">
                          Select which days you report for training.
                        </Text>
                      </VStack>
                      <Button
                        label="Select Weekdays (Mon-Fri)"
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          updateField('workingDays', [
                            'Monday',
                            'Tuesday',
                            'Wednesday',
                            'Thursday',
                            'Friday',
                          ])
                        }
                      />
                    </HStack>

                    <Grid columns={{ minWidth: 140, max: 4 }} gap={2}>
                      {DAYS_OF_WEEK.map((day) => (
                        <CheckboxInput
                          key={day}
                          label={day}
                          value={data.workingDays.includes(day)}
                          onChange={() => toggleWorkingDay(day)}
                        />
                      ))}
                    </Grid>

                    {errors.workingDays && (
                      <Banner status="error" title={errors.workingDays} />
                    )}
                  </VStack>

                  <Divider variant="subtle" />

                  {/* General Sessions Error */}
                  {errors.sessions && (
                    <Banner status="error" title={errors.sessions} />
                  )}

                  {/* Morning Session Clean Schedule Configuration (No Time Picker) */}
                  <div
                    style={{
                      backgroundColor: '#ffffff',
                      borderRadius: 14,
                      padding: '16px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      border: '1.5px solid #e2e8f0',
                      boxShadow: '0 1px 3px rgba(20, 43, 73, 0.05)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 12,
                          backgroundColor: data.morningEnabled ? 'rgba(16, 185, 129, 0.12)' : '#f1f5f9',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: data.morningEnabled ? '#10b981' : '#94a3b8',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="5" />
                          <line x1="12" y1="1" x2="12" y2="3" />
                          <line x1="12" y1="21" x2="12" y2="23" />
                          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                          <line x1="1" y1="12" x2="3" y2="12" />
                          <line x1="21" y1="12" x2="23" y2="12" />
                          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                        </svg>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <span style={{ fontSize: 16, fontWeight: 700, color: '#142b49' }}>
                          Morning Session
                        </span>
                        <span style={{ fontSize: 13, color: data.morningEnabled ? '#10b981' : '#64748b', fontWeight: data.morningEnabled ? 600 : 400 }}>
                          {data.morningEnabled ? '8:00 AM – 12:00 PM · 4 hours' : 'Disabled · 0 hours'}
                        </span>
                      </div>
                    </div>

                    {/* Toggle Switch */}
                    <button
                      type="button"
                      role="switch"
                      aria-checked={data.morningEnabled}
                      aria-label="Toggle Morning Session"
                      onClick={() => {
                        if (data.morningEnabled && !data.afternoonEnabled) {
                          setErrors((prev) => ({
                            ...prev,
                            sessions: 'At least one session (Morning or Afternoon) must remain enabled.',
                          }));
                          return;
                        }
                        setErrors((prev) => ({ ...prev, sessions: undefined }));
                        updateField('morningEnabled', !data.morningEnabled);
                      }}
                      style={{
                        width: 52,
                        height: 32,
                        borderRadius: 16,
                        backgroundColor: data.morningEnabled ? '#10b981' : '#cbd5e1',
                        position: 'relative',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 3,
                        transition: 'background-color 0.2s ease',
                        outline: 'none',
                      }}
                    >
                      <div
                        style={{
                          width: 26,
                          height: 26,
                          borderRadius: 13,
                          backgroundColor: '#ffffff',
                          boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)',
                          transform: data.morningEnabled ? 'translateX(20px)' : 'translateX(0)',
                          transition: 'transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)',
                        }}
                      />
                    </button>
                  </div>

                  {/* Mid-day lunch / rest break Informational Section */}
                  <div
                    style={{
                      backgroundColor: '#f8fafc',
                      borderRadius: 14,
                      padding: '14px 18px',
                      border: '1.5px dashed #cbd5e1',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                    }}
                  >
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 10,
                        backgroundColor: '#ffffff',
                        border: '1px solid #e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#64748b',
                        fontSize: 16,
                      }}
                    >
                      ☕
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: '#142b49' }}>
                        Mid-day lunch / rest break: 60 minutes
                      </span>
                      <span style={{ fontSize: 13, color: '#64748b' }}>
                        12:00 PM – 1:00 PM · This interval must be excluded from rendered training hours.
                      </span>
                    </div>
                  </div>

                  {/* Afternoon Session Clean Schedule Configuration (No Time Picker) */}
                  <div
                    style={{
                      backgroundColor: '#ffffff',
                      borderRadius: 14,
                      padding: '16px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      border: '1.5px solid #e2e8f0',
                      boxShadow: '0 1px 3px rgba(20, 43, 73, 0.05)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 12,
                          backgroundColor: data.afternoonEnabled ? 'rgba(16, 185, 129, 0.12)' : '#f1f5f9',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: data.afternoonEnabled ? '#10b981' : '#94a3b8',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                        </svg>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <span style={{ fontSize: 16, fontWeight: 700, color: '#142b49' }}>
                          Afternoon Session
                        </span>
                        <span style={{ fontSize: 13, color: data.afternoonEnabled ? '#10b981' : '#64748b', fontWeight: data.afternoonEnabled ? 600 : 400 }}>
                          {data.afternoonEnabled ? '1:00 PM – 5:00 PM · 4 hours' : 'Disabled · 0 hours'}
                        </span>
                      </div>
                    </div>

                    {/* Toggle Switch */}
                    <button
                      type="button"
                      role="switch"
                      aria-checked={data.afternoonEnabled}
                      aria-label="Toggle Afternoon Session"
                      onClick={() => {
                        if (data.afternoonEnabled && !data.morningEnabled) {
                          setErrors((prev) => ({
                            ...prev,
                            sessions: 'At least one session (Morning or Afternoon) must remain enabled.',
                          }));
                          return;
                        }
                        setErrors((prev) => ({ ...prev, sessions: undefined }));
                        updateField('afternoonEnabled', !data.afternoonEnabled);
                      }}
                      style={{
                        width: 52,
                        height: 32,
                        borderRadius: 16,
                        backgroundColor: data.afternoonEnabled ? '#10b981' : '#cbd5e1',
                        position: 'relative',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 3,
                        transition: 'background-color 0.2s ease',
                        outline: 'none',
                      }}
                    >
                      <div
                        style={{
                          width: 26,
                          height: 26,
                          borderRadius: 13,
                          backgroundColor: '#ffffff',
                          boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)',
                          transform: data.afternoonEnabled ? 'translateX(20px)' : 'translateX(0)',
                          transition: 'transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)',
                        }}
                      />
                    </button>
                  </div>

                  {/* Daily Training Hours Summary */}
                  <Card variant="muted" padding={4}>
                    <HStack justify="between" align="center" wrap="wrap" gap={3}>
                      <VStack gap={0.5}>
                        <Text size="sm" weight="semibold">
                          Daily Training Hours Summary
                        </Text>
                        <Text size="sm" color="secondary">
                          {data.morningEnabled ? 'Morning: 4h' : 'Morning: 0h'}
                          {' + '}
                          {data.afternoonEnabled ? 'Afternoon: 4h' : 'Afternoon: 0h'}
                          {' · Lunch interval excluded.'}
                        </Text>
                      </VStack>
                      <HStack gap={3} align="center">
                        <Heading level={2} color="accent">
                          Total Daily Training Hours: {sessionHours.totalHours} hrs/day
                        </Heading>
                      </HStack>
                    </HStack>
                  </Card>
                </VStack>
              </Card>
            )}

            {/* Step 3: School Information */}
            {activeStep === 2 && (
              <Card elevation="low" padding={6}>
                <VStack gap={5}>
                  <VStack gap={1}>
                    <Heading level={2}>School & Academic Information</Heading>
                    <Text type="body" color="secondary">
                      Provide your educational institution and academic program details.
                    </Text>
                  </VStack>

                  <Divider variant="subtle" />

                  <VStack gap={4}>
                    <TextInput
                      label="School / University Name"
                      isRequired
                      placeholder="e.g. State University of the Philippines"
                      value={data.schoolName}
                      onChange={(val) => updateField('schoolName', val)}
                      status={errors.schoolName ? { type: 'error', message: errors.schoolName } : undefined}
                      width="100%"
                    />

                    <TextInput
                      label="Course / Academic Program"
                      isRequired
                      placeholder="e.g. BS Information Technology"
                      value={data.program}
                      onChange={(val) => updateField('program', val)}
                      status={errors.program ? { type: 'error', message: errors.program } : undefined}
                      width="100%"
                    />

                    <Grid columns={{ minWidth: 260, max: 2 }} gap={4}>
                      <TextInput
                        label="Year Level"
                        isOptional
                        placeholder="e.g. 4th Year / Senior"
                        value={data.yearLevel}
                        onChange={(val) => updateField('yearLevel', val)}
                        width="100%"
                      />

                      <TextInput
                        label="School Department / College"
                        isOptional
                        placeholder="e.g. College of Computing Studies"
                        value={data.schoolDepartment}
                        onChange={(val) => updateField('schoolDepartment', val)}
                        width="100%"
                      />
                    </Grid>
                  </VStack>
                </VStack>
              </Card>
            )}

            {/* Step 4: Company Information & Final Review */}
            {activeStep === 3 && (
              <Card elevation="low" padding={6}>
                <VStack gap={5}>
                  <VStack gap={1}>
                    <Heading level={2}>Company Information & Review</Heading>
                    <Text type="body" color="secondary">
                      Enter your host training establishment details and review your complete OJT configuration.
                    </Text>
                  </VStack>

                  <Divider variant="subtle" />

                  <VStack gap={4}>
                    <TextInput
                      label="Company Name"
                      isRequired
                      placeholder="e.g. Technology Solutions Inc."
                      value={data.companyName}
                      onChange={(val) => updateField('companyName', val)}
                      status={errors.companyName ? { type: 'error', message: errors.companyName } : undefined}
                      width="100%"
                    />

                    <TextInput
                      label="Company Address"
                      isRequired
                      placeholder="e.g. 123 Tech Park Ave, Bonifacio Global City, Taguig"
                      value={data.companyAddress}
                      onChange={(val) => updateField('companyAddress', val)}
                      status={errors.companyAddress ? { type: 'error', message: errors.companyAddress } : undefined}
                      width="100%"
                    />

                    <Grid columns={{ minWidth: 260, max: 2 }} gap={4}>
                      <TextInput
                        label="Department / Assigned Office"
                        isRequired
                        placeholder="e.g. Engineering & Product Team"
                        value={data.companyDepartment}
                        onChange={(val) => updateField('companyDepartment', val)}
                        status={errors.companyDepartment ? { type: 'error', message: errors.companyDepartment } : undefined}
                        width="100%"
                      />

                      <TextInput
                        label="Internship Position / Role"
                        isRequired
                        placeholder="e.g. Software Engineering Intern"
                        value={data.internshipRole}
                        onChange={(val) => updateField('internshipRole', val)}
                        status={errors.internshipRole ? { type: 'error', message: errors.internshipRole } : undefined}
                        width="100%"
                      />
                    </Grid>

                    <TextInput
                      label="Industry Supervisor Name"
                      isOptional
                      placeholder="e.g. Engr. Michael Santos"
                      value={data.supervisorName}
                      onChange={(val) => updateField('supervisorName', val)}
                      width="100%"
                    />
                  </VStack>

                  <Divider variant="subtle" />

                  {/* Final Review Summary Card */}
                  <Card variant="muted" padding={5}>
                    <VStack gap={3}>
                      <HStack justify="between" align="center">
                        <Heading level={3}>Configuration Summary</Heading>
                        <Text size="sm" weight="semibold" color="accent">
                          Ready to Launch
                        </Text>
                      </HStack>

                      <Grid columns={{ minWidth: 200, max: 3 }} gap={3}>
                        <VStack gap={0.5}>
                          <Text size="sm" color="secondary">Requirement</Text>
                          <Text weight="semibold">{data.requiredHours} Hours</Text>
                          <Text size="sm" color="secondary">
                            {calculatedTrainingDays} days @ {data.dailyWorkingHours}h/day
                          </Text>
                        </VStack>

                        <VStack gap={0.5}>
                          <Text size="sm" color="secondary">Schedule</Text>
                          <Text weight="semibold">
                            {data.workingDays.length} Days / Week
                          </Text>
                          <Text size="sm" color="secondary">
                            {data.morningEnabled ? `AM: ${data.morningTimeIn}-${data.morningTimeOut}` : 'AM: Off'}
                            {' · '}
                            {data.afternoonEnabled ? `PM: ${data.afternoonTimeIn}-${data.afternoonTimeOut}` : 'PM: Off'}
                          </Text>
                        </VStack>

                        <VStack gap={0.5}>
                          <Text size="sm" color="secondary">Estimated Finish</Text>
                          <Text weight="semibold" color="accent">
                            {completionInfo ? completionInfo.formatted : '—'}
                          </Text>
                          <Text size="sm" color="secondary">
                            {completionInfo ? `~${completionInfo.estimatedWeeks} weeks` : '—'}
                          </Text>
                        </VStack>
                      </Grid>

                      <Divider variant="subtle" />

                      <HStack gap={4} wrap="wrap">
                        <VStack gap={0.5}>
                          <Text size="sm" color="secondary">School</Text>
                          <Text size="sm" weight="medium">
                            {data.schoolName || '—'} ({data.program || '—'})
                          </Text>
                        </VStack>

                        <VStack gap={0.5}>
                          <Text size="sm" color="secondary">Company & Role</Text>
                          <Text size="sm" weight="medium">
                            {data.companyName || '—'} · {data.internshipRole || 'Intern'}
                          </Text>
                        </VStack>
                      </HStack>
                    </VStack>
                  </Card>
                </VStack>
              </Card>
            )}

            {/* Wizard Navigation Action Bar */}
            <Card elevation="low" padding={4}>
              <HStack justify="between" align="center" wrap="wrap" gap={3}>
                <Button
                  label="Back"
                  variant="secondary"
                  isDisabled={activeStep === 0 || isSubmitting}
                  onClick={handleBack}
                />

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {activeStep < 3 ? (
                    <Button
                      label="Continue"
                      variant="primary"
                      onClick={handleNext}
                    />
                  ) : (
                    <Button
                      label="Complete Setup & Go to Dashboard"
                      variant="primary"
                      isLoading={isSubmitting}
                      onClick={handleComplete}
                    />
                  )}
                </div>
              </HStack>
            </Card>
          </VStack>
        </div>
      </main>
    </div>
  );
}
