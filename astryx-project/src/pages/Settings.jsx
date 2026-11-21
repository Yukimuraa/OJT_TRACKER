import React, { useState } from 'react';
import { PageLayout } from '../components/layout/PageLayout';
import { VStack } from '@astryxdesign/core/VStack';
import { HStack } from '@astryxdesign/core/HStack';
import { Grid } from '@astryxdesign/core/Grid';
import { Card } from '@astryxdesign/core/Card';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { Button } from '@astryxdesign/core/Button';
import { Badge } from '@astryxdesign/core/Badge';
import { NumberInput } from '@astryxdesign/core/NumberInput';
import { Divider } from '@astryxdesign/core/Divider';
import { Dialog, DialogHeader } from '@astryxdesign/core/Dialog';
import { Banner } from '@astryxdesign/core/Banner';
import { useTraining } from '../hooks/useTraining';
import { InstallAppCard } from '../components/pwa/InstallAppCard';
import { RemindersSection } from '../components/settings/RemindersSection';
import { APP_CONFIG } from '../config/appConfig';
import { WhatsNewModal } from '../components/common/WhatsNewModal';
import { hasUnreadReleaseNotes } from '../config/releaseNotes';
import { useAppUpdate } from '../hooks/useAppUpdate';
import { useDarkMode } from '../hooks/useDarkMode';
import { getCurrentUser } from '../services/authService';
import {
  loadUserReminders,
  saveUserReminders,
  getNotificationPermissionStatus,
  requestNotificationPermission,
  formatTimeFriendly,
} from '../services/reminderService';

// iOS-inspired components for mobile layout
import { IosSettingsGroup } from '../components/settings/IosSettingsGroup';
import { IosSettingsRow } from '../components/settings/IosSettingsRow';
import { IosSwitch } from '../components/common/IosSwitch';
import {
  MoonIcon,
  BellIcon,
  NotePencilIcon,
  BadgeIdIcon,
  CalendarClockIcon,
  DatabaseRestoreIcon,
  BookTutorialIcon,
  ShieldCheckIcon,
  InfoIcon,
  SparklesIcon,
  RefreshCwIcon,
  RotateCcwIcon,
  TargetIcon,
} from '../components/common/BrandIcons';

export function Settings({ onNavigate }) {
  const { requiredHours, setRequiredHours, records, clearAllRecords } = useTraining();
  const [tempHours, setTempHours] = useState(requiredHours);
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);
  const [isWhatsNewOpen, setIsWhatsNewOpen] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Dark Mode Hook
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  // Reminder State for Mobile Settings
  const currentUser = getCurrentUser();
  const userId = currentUser?.id || 'guest';
  const [reminderSettings, setReminderSettings] = useState(() => loadUserReminders(userId));
  const [permissionStatus, setPermissionStatus] = useState(getNotificationPermissionStatus);

  const hasUnreadNotes = hasUnreadReleaseNotes();
  const {
    isChecking: isCheckingUpdate,
    isUpdateAvailable,
    isUpToDate,
    errorMessage: updateError,
    lastChecked,
    checkForUpdates,
    applyUpdate,
  } = useAppUpdate();

  const handleSaveHours = () => {
    if (tempHours && tempHours > 0) {
      setRequiredHours(Number(tempHours));
      setFeedback({ type: 'success', message: 'Target hours updated successfully.' });
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const handleExportData = () => {
    const dataToExport = {
      exportedAt: new Date().toISOString(),
      appVersion: APP_CONFIG.version,
      requiredHours,
      records,
    };
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ojt_tracker_export_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setFeedback({ type: 'success', message: 'JSON backup downloaded successfully.' });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleConfirmClear = () => {
    clearAllRecords();
    setIsClearDialogOpen(false);
    setFeedback({ type: 'success', message: 'All training records have been cleared from local storage.' });
    setTimeout(() => setFeedback(null), 3000);
  };

  // Mobile Daily Reminder Handlers
  const handleToggleReminder = async (enabled) => {
    if (enabled && permissionStatus !== 'granted') {
      const res = await requestNotificationPermission();
      setPermissionStatus(res);
      if (res === 'denied') {
        setFeedback({
          type: 'error',
          message: 'Notification permission was blocked in your browser. Please allow notifications in site settings.',
        });
        return;
      }
    }

    const updated = saveUserReminders(userId, {
      ...reminderSettings,
      remindersEnabled: enabled,
    });
    setReminderSettings(updated);

    setFeedback({
      type: 'success',
      message: enabled
        ? `Daily OJT reminder activated for ${formatTimeFriendly(updated.reminderTime)}.`
        : 'Daily OJT reminders have been disabled.',
    });
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleReminderTimeChange = (e) => {
    const newTime = e.target.value;
    const updated = saveUserReminders(userId, {
      ...reminderSettings,
      reminderTime: newTime,
    });
    setReminderSettings(updated);
    setFeedback({
      type: 'success',
      message: `Reminder time updated to ${formatTimeFriendly(newTime)}.`,
    });
    setTimeout(() => setFeedback(null), 3000);
  };

  return (
    <>
      {/* =========================================================================
          1. MOBILE VIEW (<= 768px): iOS-Inspired Modern Settings Layout
          Recreated based on reference screenshot with PREFERENCES, INFO, DATA
          ========================================================================= */}
      <div className="ojt-settings-mobile-view" style={{ padding: '8px 16px 24px 16px' }}>
        {feedback && (
          <div style={{ marginBottom: 16 }}>
            <Banner
              status={feedback.type}
              title={feedback.message}
              isDismissable
              onDismiss={() => setFeedback(null)}
            />
          </div>
        )}

        {/* Mobile Header: "Settings" rounded card header matching screenshot */}
        <div
          style={{
            backgroundColor: 'var(--color-background-surface, #FFFFFF)',
            borderRadius: 22,
            border: '1px solid var(--color-border, rgba(226, 232, 240, 0.8))',
            boxShadow: '0 2px 8px var(--color-shadow, rgba(20, 43, 73, 0.03))',
            padding: '16px 20px',
            marginBottom: 20,
          }}
        >
          <div
            style={{
              fontSize: 20,
              fontWeight: 800,
              color: 'var(--color-text-primary, #142B49)',
              letterSpacing: '-0.02em',
            }}
          >
            Settings
          </div>
        </div>

        {/* GROUP 1: PREFERENCES */}
        <IosSettingsGroup title="PREFERENCES">
          {/* Row 1: Dark Mode */}
          <IosSettingsRow
            icon={<MoonIcon />}
            iconBg="var(--color-background-muted, #F8FAFC)"
            iconBorder="var(--color-border, rgba(226, 232, 240, 0.8))"
            iconColor="var(--color-text-secondary, #64748B)"
            title="Dark Mode"
            control={
              <IosSwitch
                checked={isDarkMode}
                onChange={toggleDarkMode}
                activeColor="#10B981"
                ariaLabel="Dark Mode"
              />
            }
          />

          {/* Row 2: Daily Reminder */}
          <IosSettingsRow
            icon={<BellIcon />}
            iconBg="var(--color-background-muted, #F8FAFC)"
            iconBorder="var(--color-border, rgba(226, 232, 240, 0.8))"
            iconColor="var(--color-text-secondary, #64748B)"
            title="Daily Reminder"
            showDivider={false}
            rightContent={
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {reminderSettings.remindersEnabled && (
                  <div style={{ position: 'relative' }}>
                    <input
                      type="time"
                      value={reminderSettings.reminderTime || '17:00'}
                      onChange={handleReminderTimeChange}
                      title="Tap to change reminder time"
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: '#10B981',
                        backgroundColor: 'rgba(16, 185, 129, 0.08)',
                        border: '1px solid rgba(16, 185, 129, 0.25)',
                        borderRadius: 8,
                        padding: '3px 8px',
                        outline: 'none',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                      }}
                    />
                  </div>
                )}
                {!reminderSettings.remindersEnabled && (
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: 'var(--color-text-secondary, #94A3B8)',
                    }}
                  >
                    Off
                  </span>
                )}
              </div>
            }
            control={
              <IosSwitch
                checked={reminderSettings.remindersEnabled}
                onChange={handleToggleReminder}
                activeColor="#10B981"
                ariaLabel="Daily Reminder"
              />
            }
          />
        </IosSettingsGroup>

        {/* GROUP 2: INFO */}
        <IosSettingsGroup title="INFO">
          {/* Row 1: Logs */}
          <IosSettingsRow
            icon={<NotePencilIcon />}
            iconBg="var(--color-background-muted, #F8FAFC)"
            iconBorder="var(--color-border, rgba(226, 232, 240, 0.8))"
            iconColor="var(--color-text-secondary, #64748B)"
            title="Logs"
            onClick={() => onNavigate('timelogs')}
          />

          {/* Row 2: My Profile */}
          <IosSettingsRow
            icon={<BadgeIdIcon />}
            iconBg="var(--color-background-muted, #F8FAFC)"
            iconBorder="var(--color-border, rgba(226, 232, 240, 0.8))"
            iconColor="var(--color-text-secondary, #64748B)"
            title="My Profile"
            onClick={() => onNavigate('profile')}
          />

          {/* Row 3: Work Schedule */}
          <IosSettingsRow
            icon={<CalendarClockIcon />}
            iconBg="var(--color-background-muted, #F8FAFC)"
            iconBorder="var(--color-border, rgba(226, 232, 240, 0.8))"
            iconColor="var(--color-text-secondary, #64748B)"
            title="Work Schedule"
            onClick={() => onNavigate('onboarding')}
          />

          {/* Row 4: Backup & Restore */}
          <IosSettingsRow
            icon={<DatabaseRestoreIcon />}
            iconBg="var(--color-background-muted, #F8FAFC)"
            iconBorder="var(--color-border, rgba(226, 232, 240, 0.8))"
            iconColor="var(--color-text-secondary, #64748B)"
            title="Backup & Restore"
            onClick={handleExportData}
          />

          {/* Row 5: Tutorial */}
          <IosSettingsRow
            icon={<BookTutorialIcon />}
            iconBg="var(--color-background-muted, #F8FAFC)"
            iconBorder="var(--color-border, rgba(226, 232, 240, 0.8))"
            iconColor="var(--color-text-secondary, #64748B)"
            title="Tutorial"
            onClick={() => onNavigate('help')}
          />

          {/* Row 6: Privacy Policy */}
          <IosSettingsRow
            icon={<ShieldCheckIcon />}
            iconBg="var(--color-background-muted, #F8FAFC)"
            iconBorder="var(--color-border, rgba(226, 232, 240, 0.8))"
            iconColor="var(--color-text-secondary, #64748B)"
            title="Privacy Policy"
            onClick={() => onNavigate('privacy')}
          />

          {/* Row 7: About */}
          <IosSettingsRow
            icon={<InfoIcon />}
            iconBg="var(--color-background-muted, #F8FAFC)"
            iconBorder="var(--color-border, rgba(226, 232, 240, 0.8))"
            iconColor="var(--color-text-secondary, #64748B)"
            title="About"
            showDivider={false}
            onClick={() => onNavigate('about')}
          />
        </IosSettingsGroup>

        {/* GROUP 3: APPLICATION UPDATES & RELEASE NOTES */}
        <IosSettingsGroup title="APPLICATION">
          <IosSettingsRow
            icon={<SparklesIcon />}
            iconBg="rgba(16, 185, 129, 0.1)"
            iconBorder="rgba(16, 185, 129, 0.25)"
            iconColor="#10B981"
            title="What's New"
            subtitle={`Version ${APP_CONFIG.version}`}
            rightContent={
              hasUnreadNotes ? (
                <span
                  style={{
                    backgroundColor: '#10B981',
                    color: '#FFFFFF',
                    fontSize: 10,
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 9999,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                  }}
                >
                  New
                </span>
              ) : null
            }
            onClick={() => setIsWhatsNewOpen(true)}
          />

          <IosSettingsRow
            icon={<RefreshCwIcon />}
            iconBg="rgba(16, 185, 129, 0.1)"
            iconBorder="rgba(16, 185, 129, 0.2)"
            iconColor="#10B981"
            title="Check for Updates"
            subtitle={
              isCheckingUpdate
                ? 'Checking for updates...'
                : isUpdateAvailable
                ? 'Update Available • Tap to Install'
                : isUpToDate
                ? `Up-to-date (v${APP_CONFIG.version})`
                : updateError || `v${APP_CONFIG.version}`
            }
            showDivider={false}
            onClick={isUpdateAvailable ? applyUpdate : checkForUpdates}
          />
        </IosSettingsGroup>

        {/* GROUP 4: DATA */}
        <IosSettingsGroup title="DATA">
          {/* Target Required Hours */}
          <IosSettingsRow
            icon={<TargetIcon />}
            iconBg="rgba(16, 185, 129, 0.1)"
            iconBorder="rgba(16, 185, 129, 0.25)"
            iconColor="#10B981"
            title="Target Required Hours"
            subtitle={`Current requirement: ${requiredHours} hrs`}
            control={
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <input
                  type="number"
                  min={50}
                  max={1200}
                  step={10}
                  value={tempHours}
                  onChange={(e) => setTempHours(Number(e.target.value))}
                  style={{
                    width: 64,
                    padding: '4px 6px',
                    fontSize: 14,
                    fontWeight: 700,
                    textAlign: 'center',
                    borderRadius: 8,
                    border: '1px solid var(--color-border, #CBD5E1)',
                    outline: 'none',
                    color: 'var(--color-text-primary, #142B49)',
                    backgroundColor: 'var(--color-background-surface, #FFFFFF)',
                    fontFamily: 'inherit',
                  }}
                />
                <span
                  style={{
                    fontSize: 13,
                    color: 'var(--color-text-secondary, #64748B)',
                    fontWeight: 600,
                  }}
                >
                  hrs
                </span>
                {tempHours !== requiredHours && (
                  <button
                    type="button"
                    onClick={handleSaveHours}
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: '#FFFFFF',
                      backgroundColor: '#10B981',
                      border: 'none',
                      borderRadius: 6,
                      padding: '4px 8px',
                      cursor: 'pointer',
                    }}
                  >
                    Save
                  </button>
                )}
              </div>
            }
          />

          {/* Reset all logs */}
          <IosSettingsRow
            icon={<RotateCcwIcon />}
            iconBg="#FEF2F2"
            iconBorder="#FEE2E2"
            iconColor="#EF4444"
            title="Reset all logs"
            subtitle={`${records.length} training records in storage`}
            isDestructive={true}
            showDivider={false}
            onClick={() => setIsClearDialogOpen(true)}
          />
        </IosSettingsGroup>

        {/* Mobile Subtle Version Footer */}
        <div style={{ textAlign: 'center', padding: '16px 0 8px 0' }}>
          <span
            style={{
              fontSize: 11,
              color: 'var(--color-text-secondary, #94A3B8)',
              fontWeight: 500,
            }}
          >
            {APP_CONFIG.shortName} • Version {APP_CONFIG.version} (PWA)
          </span>
        </div>
      </div>

      {/* =========================================================================
          2. DESKTOP VIEW (> 768px): Preserved Desktop Layout & Components
          Preserves the existing desktop design, Grid, and RemindersSection.
          ========================================================================= */}
      <div className="ojt-settings-desktop-view">
        <PageLayout
          title="Settings"
          description="Configure training parameters, reminders, application updates, and review security & legal guidelines."
        >
          <VStack gap={6}>
            {feedback && (
              <Banner
                status={feedback.type}
                title={feedback.message}
                isDismissable
                onDismiss={() => setFeedback(null)}
              />
            )}

            <Grid columns={{ minWidth: 280, max: 2 }} gap={4}>
              <InstallAppCard />

              {/* Section 0: Application Updates & Versioning */}
              <Card elevation="low" padding={5}>
                <VStack gap={4}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                    <VStack gap={1}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Heading level={3}>App Version &amp; Updates</Heading>
                        <Badge label={`v${APP_CONFIG.version}`} variant="neutral" size="sm" />
                      </div>
                      <Text type="supporting" color="secondary">
                        Stay on the latest progressive web application release.
                      </Text>
                    </VStack>

                    <Button
                      label={hasUnreadNotes ? "What's New (New)" : "What's New"}
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsWhatsNewOpen(true)}
                    />
                  </div>

                  <Divider variant="subtle" />

                  <VStack gap={3}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                      <div>
                        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-primary, #142b49)', display: 'block' }}>
                          Current Status:
                        </span>
                        <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary, #64748b)' }}>
                          {isCheckingUpdate
                            ? 'Checking for updates...'
                            : isUpdateAvailable
                            ? 'A newer version is ready to be applied.'
                            : isUpToDate
                            ? `You are using the latest version (v${APP_CONFIG.version}).`
                            : updateError
                            ? updateError
                            : `Version ${APP_CONFIG.version} (Semantic Versioning)`}
                        </span>
                        {lastChecked && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary, #94a3b8)', display: 'block', marginTop: 2 }}>
                            Last checked: {lastChecked.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>

                      <HStack gap={2}>
                        <Button
                          label={isCheckingUpdate ? 'Checking...' : 'Check for Updates'}
                          variant="secondary"
                          size="sm"
                          disabled={isCheckingUpdate}
                          onClick={checkForUpdates}
                        />

                        {isUpdateAvailable && (
                          <Button
                            label="Update Now"
                            variant="primary"
                            size="sm"
                            onClick={applyUpdate}
                          />
                        )}
                      </HStack>
                    </div>
                  </VStack>
                </VStack>
              </Card>

              {/* Section 1: Onboarding Setup Configuration */}
              <Card elevation="low" padding={5}>
                <VStack gap={4}>
                  <VStack gap={1}>
                    <Heading level={3}>Onboarding Setup Wizard</Heading>
                    <Text type="supporting" color="secondary">
                      Reconfigure your training requirements, shift schedule, school, and host company placement.
                    </Text>
                  </VStack>

                  <Divider variant="subtle" />

                  <VStack gap={2}>
                    <Text size="sm" color="secondary">
                      Walk through the 4-step setup wizard to recalculate completion dates and update your training parameters.
                    </Text>
                    <HStack>
                      <Button
                        label="Launch Setup Wizard"
                        variant="primary"
                        onClick={() => onNavigate?.('onboarding')}
                      />
                    </HStack>
                  </VStack>
                </VStack>
              </Card>

              {/* Section 2: Training Requirement Target */}
              <Card elevation="low" padding={5}>
                <VStack gap={4}>
                  <VStack gap={1}>
                    <Heading level={3}>Training Requirement</Heading>
                    <Text type="supporting" color="secondary">
                      Specify the total number of hours mandated by your institution or curriculum.
                    </Text>
                  </VStack>

                  <Divider variant="subtle" />

                  <VStack gap={3}>
                    <NumberInput
                      label="Target Required Hours"
                      isRequired
                      value={tempHours}
                      min={50}
                      max={1200}
                      step={50}
                      units="hrs"
                      hasNumberSteppers
                      onChange={setTempHours}
                      width="100%"
                    />

                    <HStack justify="end">
                      <Button
                        label="Save Target"
                        variant="primary"
                        size="sm"
                        onClick={handleSaveHours}
                      />
                    </HStack>
                  </VStack>
                </VStack>
              </Card>

              {/* Section 3: Functional Reminders & Notifications */}
              <RemindersSection />

              {/* Section 4: Privacy & Security */}
              <Card elevation="low" padding={5}>
                <VStack gap={4}>
                  <VStack gap={1}>
                    <Heading level={3}>Privacy &amp; Security</Heading>
                    <Text type="supporting" color="secondary">
                      Personal data protection, account security, and adherence to R.A. 10173.
                    </Text>
                  </VStack>

                  <Divider variant="subtle" />

                  <VStack gap={3}>
                    <Text size="sm" color="secondary">
                      Your academic records, attendance hours, and custom templates are linked exclusively to your account. Passwords use Bcrypt hashing and sessions use HTTP-only Sanctum cookies.
                    </Text>
                    <HStack>
                      <Button
                        label="View Privacy Policy"
                        variant="secondary"
                        onClick={() => onNavigate?.('privacy')}
                      />
                    </HStack>
                  </VStack>
                </VStack>
              </Card>

              {/* Section 5: Terms of Service */}
              <Card elevation="low" padding={5}>
                <VStack gap={4}>
                  <VStack gap={1}>
                    <Heading level={3}>Terms of Service</Heading>
                    <Text type="supporting" color="secondary">
                      Student trainee responsibilities, academic honor rules, and acceptable use.
                    </Text>
                  </VStack>

                  <Divider variant="subtle" />

                  <VStack gap={3}>
                    <Text size="sm" color="secondary">
                      By using this application, you agree to record truthful attendance hours and maintain academic integrity when presenting DTTR reports to supervisors.
                    </Text>
                    <HStack>
                      <Button
                        label="View Terms of Service"
                        variant="secondary"
                        onClick={() => onNavigate?.('terms')}
                      />
                    </HStack>
                  </VStack>
                </VStack>
              </Card>

              {/* Section 6: About OJT Hours Tracker */}
              <Card elevation="low" padding={5}>
                <VStack gap={4}>
                  <VStack gap={1}>
                    <Heading level={3}>About {APP_CONFIG.shortName}</Heading>
                    <Text type="supporting" color="secondary">
                      Application specifications, architecture, and developer information.
                    </Text>
                  </VStack>

                  <Divider variant="subtle" />

                  <VStack gap={3}>
                    <Text size="sm" color="secondary">
                      Version {APP_CONFIG.version} &bull; Built with {APP_CONFIG.frontend} and {APP_CONFIG.backend}. Supports offline PWA caching and push notifications.
                    </Text>
                    <HStack>
                      <Button
                        label="View Full About Page"
                        variant="secondary"
                        onClick={() => onNavigate?.('about')}
                      />
                    </HStack>
                  </VStack>
                </VStack>
              </Card>

              {/* Section 7: Help & Support */}
              <Card elevation="low" padding={5}>
                <VStack gap={4}>
                  <VStack gap={1}>
                    <Heading level={3}>Help &amp; Support</Heading>
                    <Text type="supporting" color="secondary">
                      Frequently Asked Questions, troubleshooting tips, and contact information.
                    </Text>
                  </VStack>

                  <Divider variant="subtle" />

                  <VStack gap={3}>
                    <Text size="sm" color="secondary">
                      Learn how to configure shifts, export Long Bond DTTRs, upload custom templates, and resolve common issues.
                    </Text>
                    <HStack>
                      <Button
                        label="Open Help &amp; FAQ Center"
                        variant="secondary"
                        onClick={() => onNavigate?.('help')}
                      />
                    </HStack>
                  </VStack>
                </VStack>
              </Card>

              {/* Section 8: Data Export & Backup */}
              <Card elevation="low" padding={5}>
                <VStack gap={4}>
                  <VStack gap={1}>
                    <Heading level={3}>Data Backup &amp; Export</Heading>
                    <Text type="supporting" color="secondary">
                      Download a JSON backup of all your recorded training sessions.
                    </Text>
                  </VStack>

                  <Divider variant="subtle" />

                  <VStack gap={2}>
                    <Text size="sm" color="secondary">
                      Contains all {records.length} logged training records, timestamps, and categories.
                    </Text>
                    <HStack>
                      <Button
                        label="Download JSON Backup"
                        variant="secondary"
                        onClick={handleExportData}
                      />
                    </HStack>
                  </VStack>
                </VStack>
              </Card>

              {/* Section 9: Danger Zone */}
              <Card elevation="low" padding={5}>
                <VStack gap={4}>
                  <VStack gap={1}>
                    <Heading level={3}>Danger Zone</Heading>
                    <Text type="supporting" color="secondary">
                      Irreversible data management actions.
                    </Text>
                  </VStack>

                  <Divider variant="subtle" />

                  <VStack gap={2}>
                    <Text size="sm" color="secondary">
                      Clear all recorded training hours from local storage. This action cannot be undone.
                    </Text>
                    <HStack>
                      <Button
                        label="Clear All Records"
                        variant="destructive"
                        onClick={() => setIsClearDialogOpen(true)}
                      />
                    </HStack>
                  </VStack>
                </VStack>
              </Card>
            </Grid>

            {/* Subtle Version Footer */}
            <div style={{ textAlign: 'center', padding: '16px 0 8px 0', borderTop: '1px solid #f1f5f9' }}>
              <Text size="xs" color="secondary">
                {APP_CONFIG.name} &bull; Version {APP_CONFIG.version} &bull; {APP_CONFIG.platform} &bull; &copy; {new Date().getFullYear()}
              </Text>
            </div>
          </VStack>
        </PageLayout>
      </div>

      {/* Confirmation Dialog (Shared between Desktop & Mobile) */}
      <Dialog
        isOpen={isClearDialogOpen}
        onOpenChange={setIsClearDialogOpen}
        purpose="required"
        width={460}
      >
        <DialogHeader
          title="Clear all training records?"
          subtitle="Are you sure you want to delete all recorded hours? This action cannot be undone."
          onOpenChange={setIsClearDialogOpen}
        />
        <VStack gap={4} padding={4}>
          <Text type="body" color="secondary">
            All {records.length} logged training sessions will be permanently removed from your browser storage.
          </Text>
          <HStack gap={2} justify="end">
            <Button
              label="Cancel"
              variant="secondary"
              onClick={() => setIsClearDialogOpen(false)}
            />
            <Button
              label="Yes, Delete All"
              variant="destructive"
              onClick={handleConfirmClear}
            />
          </HStack>
        </VStack>
      </Dialog>

      {/* What's New Modal (Shared between Desktop & Mobile) */}
      <WhatsNewModal isOpen={isWhatsNewOpen} onOpenChange={setIsWhatsNewOpen} />
    </>
  );
}

export default Settings;
