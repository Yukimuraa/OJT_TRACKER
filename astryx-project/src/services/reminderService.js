/**
 * Reminder & Notification Service for OJT Hours Tracker
 *
 * Implements:
 * - User-scoped reminder preference storage (user_id isolation)
 * - Configurable reminder time (default 5:00 PM) in user's local timezone
 * - Native Notification API permission handling & detection
 * - Service Worker persistent push/notification integration with tag de-duplication
 * - In-app interval scheduler + immediate test notification delivery
 * - Click action that opens / focuses /app/timelogs
 * - API sync readiness for Laravel Sanctum endpoints (/api/reminders)
 */

import { getCurrentUser } from './authService';
import apiClient from './apiClient';

const REMINDER_STORAGE_PREFIX = 'ojt_reminders_';
let activeSchedulerInterval = null;

/**
 * Returns current user's local IANA timezone name.
 */
export function getLocalTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Manila';
  } catch {
    return 'Asia/Manila';
  }
}

/**
 * Formats a 24-hour time string ("17:00") into a human-friendly format ("5:00 PM").
 */
export function formatTimeFriendly(time24 = '17:00') {
  if (!time24) return '5:00 PM';
  const [hStr, mStr] = time24.split(':');
  let h = parseInt(hStr, 10);
  const m = parseInt(mStr || '0', 10);
  if (isNaN(h)) return '5:00 PM';
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  h = h ? h : 12; // 0 should be 12
  const minutePadded = m < 10 ? `0${m}` : m;
  return `${h}:${minutePadded} ${ampm}`;
}

/**
 * Checks the browser's Notification permission status.
 * Returns: 'granted' | 'denied' | 'default' | 'unsupported'
 */
export function getNotificationPermissionStatus() {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
}

/**
 * Requests Notification permission from the browser.
 */
export async function requestNotificationPermission() {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (err) {
    console.error('Failed to request notification permission:', err);
    return 'denied';
  }
}

/**
 * Retrieves the stored reminder settings for a specific user ID.
 * Defaults:
 * - remindersEnabled: false
 * - reminderTime: "17:00" (5:00 PM)
 * - timezone: user's local timezone
 */
export function loadUserReminders(userId) {
  if (!userId) {
    const currentUser = getCurrentUser();
    userId = currentUser?.id || 'guest';
  }

  const defaultSettings = {
    userId,
    remindersEnabled: false,
    reminderTime: '17:00',
    timezone: getLocalTimezone(),
    lastNotifiedDate: null,
    updatedAt: new Date().toISOString(),
  };

  if (typeof localStorage === 'undefined') return defaultSettings;

  try {
    const raw = localStorage.getItem(`${REMINDER_STORAGE_PREFIX}${userId}`);
    if (!raw) return defaultSettings;
    const parsed = JSON.parse(raw);
    return {
      ...defaultSettings,
      ...parsed,
      userId, // Ensure caller cannot override owner user ID
    };
  } catch (err) {
    console.error(`Failed to load reminder settings for user ${userId}`, err);
    return defaultSettings;
  }
}

/**
 * Saves reminder settings strictly for the target user.
 */
export function saveUserReminders(userId, settings) {
  if (!userId) {
    const currentUser = getCurrentUser();
    userId = currentUser?.id || 'guest';
  }

  const safeSettings = {
    ...settings,
    userId,
    updatedAt: new Date().toISOString(),
  };

  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(
        `${REMINDER_STORAGE_PREFIX}${userId}`,
        JSON.stringify(safeSettings)
      );
    } catch (err) {
      console.error(`Failed to save reminder settings for user ${userId}`, err);
    }
  }

  // Restart scheduler with new parameters
  restartReminderScheduler(userId);

  // Attempt server sync if backend API is available
  syncReminderSettingsWithServer(userId, safeSettings).catch(() => {
    // Graceful offline fallback
  });

  return safeSettings;
}

/**
 * Delivers an actual system/PWA notification with click handling.
 */
export async function deliverNotification({
  title = 'OJT Hours Tracker Reminder',
  body = "Don't forget to record your OJT training hours and daily activities.",
  url = '/app/timelogs',
  tag = 'ojt-daily-reminder',
}) {
  const status = getNotificationPermissionStatus();
  if (status !== 'granted') {
    return {
      success: false,
      reason: status === 'denied' ? 'PERMISSION_DENIED' : 'PERMISSION_NOT_REQUESTED',
      message:
        status === 'denied'
          ? 'Notifications are blocked in your browser settings. Please enable them to receive reminders.'
          : 'Notification permission has not been granted yet.',
    };
  }

  const notificationOptions = {
    body,
    icon: '/icons/icon-192.png',
    badge: '/favicon.svg',
    data: { url },
    tag,
    renotify: true,
  };

  // 1. Try displaying via Service Worker registration (most reliable for PWAs)
  if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg && reg.showNotification) {
        await reg.showNotification(title, notificationOptions);
        return { success: true, method: 'service_worker' };
      }
    } catch (err) {
      console.warn('Service worker notification failed, falling back to Notification constructor:', err);
    }
  }

  // 2. Direct Window Notification API Fallback
  try {
    const notif = new Notification(title, notificationOptions);
    notif.onclick = () => {
      window.focus();
      if (typeof window !== 'undefined' && window.location.pathname !== url) {
        window.location.href = url;
      }
      notif.close();
    };
    return { success: true, method: 'window_notification' };
  } catch (err) {
    console.error('Failed to instantiate Notification:', err);
    return { success: false, reason: 'SYSTEM_ERROR', message: err.message };
  }
}

/**
 * Triggers a live test notification immediately.
 */
export async function sendTestNotification() {
  return deliverNotification({
    title: 'OJT Hours Tracker Reminder',
    body: "Don't forget to record your OJT training hours and daily activities.",
    url: '/app/timelogs',
    tag: 'ojt-test-reminder',
  });
}

/**
 * Evaluates whether a scheduled daily reminder should fire right now.
 */
function evaluateAndFireScheduledReminder(userId) {
  const settings = loadUserReminders(userId);
  if (!settings.remindersEnabled || !settings.reminderTime) return;

  const permission = getNotificationPermissionStatus();
  if (permission !== 'granted') return;

  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  // If already notified today, do not repeat
  if (settings.lastNotifiedDate === todayStr) {
    return;
  }

  const [scheduledHoursStr, scheduledMinutesStr] = settings.reminderTime.split(':');
  const targetHour = parseInt(scheduledHoursStr, 10);
  const targetMinute = parseInt(scheduledMinutesStr, 10);

  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  // If current local time has reached or passed the reminder hour & minute today
  if (
    currentHour > targetHour ||
    (currentHour === targetHour && currentMinute >= targetMinute)
  ) {
    deliverNotification({
      title: 'OJT Hours Tracker Reminder',
      body: "Don't forget to record your OJT training hours and daily activities.",
      url: '/app/timelogs',
      tag: 'ojt-daily-reminder',
    }).then((res) => {
      if (res.success) {
        // Record that user was notified today
        saveUserReminders(userId, {
          ...settings,
          lastNotifiedDate: todayStr,
        });
      }
    });
  }
}

/**
 * Starts or restarts the active in-session reminder check.
 */
export function restartReminderScheduler(userId) {
  if (activeSchedulerInterval) {
    clearInterval(activeSchedulerInterval);
    activeSchedulerInterval = null;
  }

  if (!userId) {
    const user = getCurrentUser();
    userId = user?.id;
  }
  if (!userId) return;

  const settings = loadUserReminders(userId);
  if (!settings.remindersEnabled) return;

  // Run immediate check
  evaluateAndFireScheduledReminder(userId);

  // Poll every 60 seconds while session is active
  activeSchedulerInterval = setInterval(() => {
    evaluateAndFireScheduledReminder(userId);
  }, 60000);
}

/**
 * Connects to Laravel /api/reminders endpoint using Sanctum cookie authentication.
 */
export async function syncReminderSettingsWithServer(userId, settings) {
  try {
    const data = await apiClient.post('/api/reminders', {
      title: 'Daily Attendance Reminder',
      description: `Daily OJT reminder scheduled for ${settings.reminderTime} (${settings.timezone})`,
      remind_at: `${new Date().toISOString().slice(0, 10)} ${settings.reminderTime}:00`,
      is_completed: false,
    });
    return { success: true, data };
  } catch (err) {
    return { offline: true, error: err.message };
  }
}

