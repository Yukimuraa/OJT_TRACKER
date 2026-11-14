import React, { useState, useEffect } from 'react';
import { Card } from '@astryxdesign/core/Card';
import { VStack } from '@astryxdesign/core/VStack';
import { HStack } from '@astryxdesign/core/HStack';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { Button } from '@astryxdesign/core/Button';
import { Divider } from '@astryxdesign/core/Divider';
import { Banner } from '@astryxdesign/core/Banner';
import { Icon } from '@astryxdesign/core/Icon';
import { getCurrentUser } from '../../services/authService';
import {
  loadUserReminders,
  saveUserReminders,
  getNotificationPermissionStatus,
  requestNotificationPermission,
  sendTestNotification,
  formatTimeFriendly,
  getLocalTimezone,
} from '../../services/reminderService';
import { BellIcon, ClockIcon, CheckCircleIcon } from '../common/BrandIcons';

export function RemindersSection() {
  const currentUser = getCurrentUser();
  const userId = currentUser?.id || 'guest';

  const [prevUserId, setPrevUserId] = useState(userId);
  const [settings, setSettings] = useState(() => loadUserReminders(userId));
  const [permissionStatus, setPermissionStatus] = useState(getNotificationPermissionStatus);
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Synchronize when switching authenticated user
  if (prevUserId !== userId) {
    setPrevUserId(userId);
    setSettings(loadUserReminders(userId));
    setPermissionStatus(getNotificationPermissionStatus());
  }

  // Refresh permission state whenever user returns to the tab (e.g. from browser site settings)
  useEffect(() => {
    const handleFocus = () => {
      setPermissionStatus(getNotificationPermissionStatus());
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const handleToggleReminder = async (enabled) => {
    // If enabling and permission is not granted, request permission
    if (enabled && permissionStatus !== 'granted') {
      setIsRequestingPermission(true);
      const res = await requestNotificationPermission();
      setIsRequestingPermission(false);
      setPermissionStatus(res);

      if (res === 'denied') {
        setFeedback({
          type: 'error',
          message:
            'Notification permission was blocked in your browser. Please allow notifications in site settings.',
        });
        return;
      }
    }

    const updated = saveUserReminders(userId, {
      ...settings,
      remindersEnabled: enabled,
    });
    setSettings(updated);

    setFeedback({
      type: 'success',
      message: enabled
        ? `Daily OJT reminder activated for ${formatTimeFriendly(updated.reminderTime)}.`
        : 'Daily OJT reminders have been disabled.',
    });
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleTimeChange = (e) => {
    const newTime = e.target.value;
    const updated = saveUserReminders(userId, {
      ...settings,
      reminderTime: newTime,
    });
    setSettings(updated);
    setFeedback({
      type: 'success',
      message: `Reminder time updated to ${formatTimeFriendly(newTime)}.`,
    });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleRequestPermission = async () => {
    setIsRequestingPermission(true);
    const res = await requestNotificationPermission();
    setIsRequestingPermission(false);
    setPermissionStatus(res);
    if (res === 'granted') {
      setFeedback({
        type: 'success',
        message: 'Notification permission granted! Reminders are now active.',
      });
    } else if (res === 'denied') {
      setFeedback({
        type: 'error',
        message:
          'Notifications are blocked. Please click the icon in your browser address bar to allow notifications for this site.',
      });
    }
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleTestNotification = async () => {
    if (permissionStatus !== 'granted') {
      const res = await requestNotificationPermission();
      setPermissionStatus(res);
      if (res !== 'granted') {
        setFeedback({
          type: 'error',
          message: 'Please grant notification permission first to test notifications.',
        });
        return;
      }
    }

    setIsSendingTest(true);
    const result = await sendTestNotification();
    setIsSendingTest(false);

    if (result.success) {
      setFeedback({
        type: 'success',
        message:
          'Test reminder delivered! Tap or click the notification to jump straight to Time Logs.',
      });
    } else {
      setFeedback({
        type: 'error',
        message: result.message || 'Failed to deliver notification.',
      });
    }
    setTimeout(() => setFeedback(null), 4000);
  };

  const userTimezone = settings.timezone || getLocalTimezone();

  return (
    <Card elevation="low" padding={5} style={{ backgroundColor: '#ffffff', borderRadius: 12 }}>
      <VStack gap={4}>
        {/* Header */}
        <HStack justify="between" align="start" wrap="wrap" gap={2}>
          <HStack gap={2} align="center">
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#10b981',
              }}
            >
              <BellIcon width={20} height={20} />
            </div>
            <VStack gap={0}>
              <Heading level={3}>Reminders & Notifications</Heading>
              <Text type="supporting" color="secondary" size="sm">
                Receive scheduled alerts to log your hours and track your daily training progress.
              </Text>
            </VStack>
          </HStack>

          {/* Permission Status Pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {permissionStatus === 'granted' ? (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '3px 10px',
                  borderRadius: 9999,
                  backgroundColor: '#ecfdf5',
                  color: '#059669',
                  fontSize: 12,
                  fontWeight: 600,
                  border: '1px solid #a7f3d0',
                }}
              >
                <CheckCircleIcon width={13} height={13} />
                Allowed
              </span>
            ) : permissionStatus === 'denied' ? (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '3px 10px',
                  borderRadius: 9999,
                  backgroundColor: '#fef2f2',
                  color: '#dc2626',
                  fontSize: 12,
                  fontWeight: 600,
                  border: '1px solid #fecaca',
                }}
              >
                Blocked
              </span>
            ) : (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '3px 10px',
                  borderRadius: 9999,
                  backgroundColor: '#fffbeb',
                  color: '#d97706',
                  fontSize: 12,
                  fontWeight: 600,
                  border: '1px solid #fde68a',
                }}
              >
                Needs Permission
              </span>
            )}
          </div>
        </HStack>

        <Divider variant="subtle" />

        {/* Feedback message */}
        {feedback && (
          <Banner
            status={feedback.type}
            title={feedback.message}
            isDismissable
            onDismiss={() => setFeedback(null)}
          />
        )}

        {/* Blocked Explanation */}
        {permissionStatus === 'denied' && (
          <div
            style={{
              padding: '12px 16px',
              backgroundColor: '#fff1f2',
              border: '1px solid #fecdd3',
              borderRadius: 8,
              fontSize: 13,
              color: '#9f1239',
              lineHeight: 1.5,
            }}
          >
            <strong>Notifications are currently blocked:</strong> Your browser has disabled alerts for this site.
            To receive reminders, click the lock or settings icon next to the URL in your browser address bar,
            change Notifications to <strong>Allow</strong>, and refresh the page.
          </div>
        )}

        {/* Feature A: Daily OJT Reminder Toggle */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 14px',
            backgroundColor: '#FCFCFB',
            borderRadius: 8,
            border: '1px solid #e5e7eb',
            gap: 16,
          }}
        >
          <VStack gap={1}>
            <span style={{ fontWeight: 600, fontSize: 14, color: '#142b49' }}>
              Daily OJT Reminder
            </span>
            <span style={{ fontSize: 12, color: '#64748b', lineHeight: 1.4 }}>
              Receive a reminder to record your OJT training hours.
            </span>
          </VStack>

          {/* Native High-Performance Accessible Switch */}
          <label
            style={{
              position: 'relative',
              display: 'inline-block',
              width: 46,
              height: 24,
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            <input
              type="checkbox"
              checked={settings.remindersEnabled}
              onChange={(e) => handleToggleReminder(e.target.checked)}
              disabled={isRequestingPermission}
              style={{ opacity: 0, width: 0, height: 0, margin: 0 }}
              aria-label="Daily OJT Reminder Toggle"
            />
            <span
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: settings.remindersEnabled ? '#10b981' : '#cbd5e1',
                borderRadius: 24,
                transition: 'background-color 0.2s ease',
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  content: '""',
                  height: 18,
                  width: 18,
                  left: settings.remindersEnabled ? 24 : 3,
                  bottom: 3,
                  backgroundColor: '#ffffff',
                  borderRadius: '50%',
                  transition: 'left 0.2s ease',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                }}
              />
            </span>
          </label>
        </div>

        {/* Feature B: Configurable Reminder Time */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            padding: '12px 14px',
            backgroundColor: '#FCFCFB',
            borderRadius: 8,
            border: '1px solid #e5e7eb',
            opacity: settings.remindersEnabled ? 1 : 0.7,
            transition: 'opacity 0.2s ease',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 12,
            }}
          >
            <HStack gap={2} align="center">
              <ClockIcon width={16} height={16} style={{ color: '#10b981' }} />
              <VStack gap={0}>
                <span style={{ fontWeight: 600, fontSize: 13, color: '#142b49' }}>
                  Reminder Time
                </span>
                <span style={{ fontSize: 11, color: '#64748b' }}>
                  Local timezone: {userTimezone}
                </span>
              </VStack>
            </HStack>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="time"
                value={settings.reminderTime || '17:00'}
                onChange={handleTimeChange}
                disabled={!settings.remindersEnabled}
                aria-label="Choose daily reminder time"
                style={{
                  padding: '6px 10px',
                  borderRadius: 6,
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  color: '#142b49',
                  fontSize: 13,
                  fontWeight: 600,
                  outline: 'none',
                  cursor: settings.remindersEnabled ? 'pointer' : 'not-allowed',
                }}
              />
              <span style={{ fontSize: 12, fontWeight: 600, color: '#10b981' }}>
                ({formatTimeFriendly(settings.reminderTime || '17:00')})
              </span>
            </div>
          </div>

          <span style={{ fontSize: 11, color: '#64748b' }}>
            Default reminder time is set to 5:00 PM. The application alerts you when your shift concludes.
          </span>
        </div>

        {/* Feature C & F: Permission Prompt & Test Notification Button */}
        <HStack justify="between" align="center" wrap="wrap" gap={3} style={{ paddingTop: 4 }}>
          {permissionStatus !== 'granted' && permissionStatus !== 'denied' ? (
            <Button
              label={isRequestingPermission ? 'Requesting...' : 'Enable Browser Notifications'}
              variant="primary"
              size="sm"
              icon={<Icon icon={BellIcon} size="sm" />}
              onClick={handleRequestPermission}
              isDisabled={isRequestingPermission}
            />
          ) : (
            <div style={{ fontSize: 12, color: '#64748b' }}>
              Reminders automatically navigate to <strong>Time Logs</strong> when clicked.
            </div>
          )}

          <Button
            label={isSendingTest ? 'Sending...' : 'Send Test Notification'}
            variant="ghost"
            size="sm"
            onClick={handleTestNotification}
            isDisabled={isSendingTest || permissionStatus === 'denied'}
          />
        </HStack>
      </VStack>
    </Card>
  );
}

export default RemindersSection;

