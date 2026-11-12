import React, { useState } from 'react';
import { PageLayout } from '../components/layout/PageLayout';
import { VStack } from '@astryxdesign/core/VStack';
import { HStack } from '@astryxdesign/core/HStack';
import { Grid } from '@astryxdesign/core/Grid';
import { Card } from '@astryxdesign/core/Card';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { Button } from '@astryxdesign/core/Button';
import { NumberInput } from '@astryxdesign/core/NumberInput';
import { CheckboxInput } from '@astryxdesign/core/CheckboxInput';
import { Divider } from '@astryxdesign/core/Divider';
import { Dialog, DialogHeader } from '@astryxdesign/core/Dialog';
import { Banner } from '@astryxdesign/core/Banner';
import { useTraining } from '../hooks/useTraining';

const SETTINGS_STORAGE_KEY = 'ojt_app_settings';

function loadStoredSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return { dailyReminder: true, milestoneAlerts: true, weeklySummary: false };
    return JSON.parse(raw);
  } catch {
    return { dailyReminder: true, milestoneAlerts: true, weeklySummary: false };
  }
}

function saveStoredSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save settings', err);
  }
}

export function Settings({ onNavigate }) {
  const { requiredHours, setRequiredHours, records, clearAllRecords } = useTraining();
  const [tempHours, setTempHours] = useState(requiredHours);
  const [preferences, setPreferences] = useState(loadStoredSettings);
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const handleSaveHours = () => {
    if (tempHours && tempHours > 0) {
      setRequiredHours(Number(tempHours));
      setFeedback({ type: 'success', message: 'Target hours updated successfully.' });
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const handleTogglePreference = (key, val) => {
    const next = { ...preferences, [key]: val };
    setPreferences(next);
    saveStoredSettings(next);
  };

  const handleExportData = () => {
    const dataToExport = {
      exportedAt: new Date().toISOString(),
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
  };

  const handleConfirmClear = () => {
    clearAllRecords();
    setIsClearDialogOpen(false);
    setFeedback({ type: 'success', message: 'All training records have been cleared.' });
    setTimeout(() => setFeedback(null), 3000);
  };

  return (
    <PageLayout
      title="Settings"
      description="Configure your OJT requirements target, reminders, and data management options."
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

        <Grid columns={{ minWidth: 320, max: 2 }} gap={4}>
          {/* Section 0: Onboarding Setup Configuration */}
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

          {/* Section 1: Training Requirement Target */}
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

          {/* Section 2: Notifications & Reminders */}
          <Card elevation="low" padding={5}>
            <VStack gap={4}>
              <VStack gap={1}>
                <Heading level={3}>Reminders & Notifications</Heading>
                <Text type="supporting" color="secondary">
                  Manage attendance reminders and milestone completion alerts.
                </Text>
              </VStack>

              <Divider variant="subtle" />

              <VStack gap={3}>
                <CheckboxInput
                  label="Daily Log Reminder"
                  description="Prompt to record daily hours at the end of each training day."
                  value={preferences.dailyReminder}
                  onChange={(val) => handleTogglePreference('dailyReminder', val)}
                />

                <CheckboxInput
                  label="Milestone Progress Alerts"
                  description="Celebrate when reaching 25%, 50%, 75%, and 100% completion."
                  value={preferences.milestoneAlerts}
                  onChange={(val) => handleTogglePreference('milestoneAlerts', val)}
                />

                <CheckboxInput
                  label="Weekly Recap Summary"
                  description="Review cumulative weekly hours rendered and remaining days."
                  value={preferences.weeklySummary}
                  onChange={(val) => handleTogglePreference('weeklySummary', val)}
                />
              </VStack>
            </VStack>
          </Card>

          {/* Section 3: Data Export & Backup */}
          <Card elevation="low" padding={5}>
            <VStack gap={4}>
              <VStack gap={1}>
                <Heading level={3}>Data Backup & Export</Heading>
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

          {/* Section 4: Danger Zone */}
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
      </VStack>

      {/* Confirmation Dialog */}
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
    </PageLayout>
  );
}
