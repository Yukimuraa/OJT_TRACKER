import { getCurrentUser } from './authService.js';
import apiClient from './apiClient.js';
import {
  idbGetRecords,
  idbSaveRecord,
  idbSaveRecords,
  idbDeleteRecord,
  idbEnqueueMutation,
  idbGetSyncQueue,
  idbRemoveQueueItem,
} from './indexedDbService.js';

export const REQUIRED_OJT_HOURS = 600;

/**
 * Returns the isolated localStorage key for a specific user.
 */
export function getTrainingRecordsKey(userId = null) {
  const effectiveId = userId || getCurrentUser()?.id || 'guest';
  return `ojt_training_records_${effectiveId}`;
}

/**
 * Calculates total completed training hours from records.
 */
export function calculateCompletedHours(records = []) {
  const total = records
    .filter((r) => r.status === 'Approved' || !r.status)
    .reduce((sum, r) => sum + (Number(r.hours) || 0), 0);
  return Math.round(total * 10) / 10;
}

/**
 * Calculates remaining hours to reach target requirement.
 */
export function calculateRemainingHours(required = REQUIRED_OJT_HOURS, completed = 0) {
  return Math.max(0, Math.round((required - completed) * 10) / 10);
}

/**
 * Calculates the progress completion rate as a percentage clamped to 100%.
 */
export function calculateCompletionRate(required = REQUIRED_OJT_HOURS, completed = 0) {
  if (required <= 0) return 0;
  const rate = (completed / required) * 100;
  return Math.min(100, Math.round(rate * 10) / 10);
}

/**
 * Calculates detailed training analytics including pace, days, and estimated completion.
 */
export function calculateTrainingAnalytics(records = [], required = REQUIRED_OJT_HOURS) {
  const completed = calculateCompletedHours(records);
  const remaining = calculateRemainingHours(required, completed);
  const rate = calculateCompletionRate(required, completed);
  const daysRendered = new Set(records.map((r) => r.date).filter(Boolean)).size;
  const avgHoursPerDay = daysRendered > 0 ? Math.round((completed / daysRendered) * 10) / 10 : 0;
  const estimatedDaysLeft = avgHoursPerDay > 0 ? Math.ceil(remaining / avgHoursPerDay) : null;

  return {
    completed,
    remaining,
    rate,
    daysRendered,
    avgHoursPerDay,
    estimatedDaysLeft,
  };
}

/**
 * Calculates milestone completion tiers for requirement progress.
 */
export function calculateMilestones(completed = 0, required = REQUIRED_OJT_HOURS) {
  const tiers = [
    { targetPercent: 25, label: 'First Quarter' },
    { targetPercent: 50, label: 'Halfway Mark' },
    { targetPercent: 75, label: 'Three Quarters' },
    { targetPercent: 100, label: 'Full Completion' },
  ];

  return tiers.map((tier) => {
    const targetHours = Math.round((required * tier.targetPercent) / 100);
    return {
      ...tier,
      targetHours,
      isCompleted: completed >= targetHours,
    };
  });
}

/**
 * Returns the latest N records sorted by date/creation descending.
 */
export function getRecentRecords(records = [], limit = 5) {
  return [...records]
    .sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt))
    .slice(0, limit);
}

/**
 * Groups hours by activity category with percentage calculation.
 */
export function calculateHoursByCategory(records = []) {
  const totals = {};
  let totalHours = 0;

  for (const r of records) {
    const hrs = Number(r.hours) || 0;
    const cat = r.activity || 'Other';
    totals[cat] = (totals[cat] || 0) + hrs;
    totalHours += hrs;
  }

  return Object.entries(totals)
    .map(([category, hours]) => {
      const rounded = Math.round(hours * 10) / 10;
      const percentage = totalHours > 0 ? Math.round((rounded / totalHours) * 100) : 0;
      return {
        category,
        hours: rounded,
        percentage,
      };
    })
    .sort((a, b) => b.hours - a.hours);
}

/**
 * Calculates monthly hours aggregation for trend analysis.
 */
export function calculateMonthlyTrends(records = []) {
  const months = {};
  for (const r of records) {
    if (!r.date) continue;
    const key = r.date.slice(0, 7); // YYYY-MM
    months[key] = (months[key] || 0) + (Number(r.hours) || 0);
  }

  return Object.entries(months)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, hours]) => {
      const [year, m] = month.split('-');
      const date = new Date(Number(year), Number(m) - 1, 1);
      const label = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      return {
        month: label,
        rawMonth: month,
        hours: Math.round(hours * 10) / 10,
      };
    });
}

/**
 * Calculates weekly rendered hours for current week.
 */
export function calculateWeeklyHours(records = []) {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  return records
    .filter((r) => {
      if (!r.date) return false;
      const d = new Date(`${r.date}T00:00:00`);
      return d >= monday && d <= sunday;
    })
    .reduce((sum, r) => sum + (Number(r.hours) || 0), 0);
}

/**
 * Loads records synchronously from user-partitioned localStorage.
 */
export function loadStoredRecords(userId = null) {
  if (typeof localStorage === 'undefined') return [];
  try {
    const key = getTrainingRecordsKey(userId);
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    const effectiveUserId = userId || getCurrentUser()?.id;
    if (effectiveUserId) {
      return parsed.filter((r) => !r.userId || r.userId === effectiveUserId);
    }
    return parsed;
  } catch (err) {
    console.error('Failed to load training records from localStorage', err);
    return [];
  }
}

/**
 * Saves records to user-partitioned localStorage and IndexedDB.
 */
export function saveStoredRecords(userId = null, records = []) {
  let targetUserId = userId;
  let targetRecords = records;
  if (Array.isArray(userId)) {
    targetRecords = userId;
    targetUserId = getCurrentUser()?.id || null;
  }

  const effectiveUserId = targetUserId || getCurrentUser()?.id || 'guest';
  const stampedRecords = (targetRecords || []).map((r) => ({
    ...r,
    userId: r.userId || effectiveUserId,
  }));

  if (typeof localStorage !== 'undefined') {
    try {
      const key = getTrainingRecordsKey(targetUserId);
      localStorage.setItem(key, JSON.stringify(stampedRecords));
    } catch (err) {
      console.error('Failed to save OJT training records to localStorage', err);
    }
  }

  // Also persist asynchronously to IndexedDB
  idbSaveRecords(stampedRecords).catch(() => {});
}

/**
 * Checks if a record with the same date already exists for the user.
 */
export function isDateDuplicate(records = [], date, currentId = null) {
  if (!date || !Array.isArray(records)) return false;
  return records.some((r) => r.date === date && (!currentId || r.id !== currentId));
}

/**
 * Normalizes backend response record to frontend format.
 */
export function mapBackendRecordToFrontend(r) {
  if (!r) return null;
  const mIn = r.morning_arrival ? r.morning_arrival.slice(0, 5) : '';
  const mOut = r.morning_departure ? r.morning_departure.slice(0, 5) : '';
  const aIn = r.afternoon_arrival ? r.afternoon_arrival.slice(0, 5) : '';
  const aOut = r.afternoon_departure ? r.afternoon_departure.slice(0, 5) : '';

  return {
    id: r.id,
    userId: r.user_id,
    date: r.training_date || r.date,
    activity: r.activity_category || r.activity || 'Development',
    hours: Number(r.hours) || 0,
    morningSession: {
      attended: Boolean(mIn || mOut),
      timeIn: mIn,
      timeOut: mOut,
      durationHours: 0,
      durationMinutes: 0,
    },
    afternoonSession: {
      attended: Boolean(aIn || aOut),
      timeIn: aIn,
      timeOut: aOut,
      durationHours: 0,
      durationMinutes: 0,
    },
    status: 'Approved',
    description: r.description || '',
    syncStatus: 'synced',
    sync_version: r.sync_version || 1,
    createdAt: r.created_at || new Date().toISOString(),
    updatedAt: r.updated_at || new Date().toISOString(),
  };
}

/**
 * Transforms frontend record to backend format.
 */
export function mapFrontendRecordToBackend(r) {
  return {
    id: r.id,
    training_date: r.date,
    morning_arrival: r.morningSession?.timeIn ? `${r.morningSession.timeIn}:00` : null,
    morning_departure: r.morningSession?.timeOut ? `${r.morningSession.timeOut}:00` : null,
    afternoon_arrival: r.afternoonSession?.timeIn ? `${r.afternoonSession.timeIn}:00` : null,
    afternoon_departure: r.afternoonSession?.timeOut ? `${r.afternoonSession.timeOut}:00` : null,
    hours: Number(r.hours) || 0,
    activity_category: r.activity || 'Development',
    description: r.description || '',
    sync_version: r.sync_version || 1,
    client_updated_at: r.updatedAt || new Date().toISOString(),
  };
}

/**
 * Creates a new training log record.
 */
export function createTrainingRecord({
  userId = null,
  date,
  activity = 'Development',
  hours,
  morningSession = null,
  afternoonSession = null,
  description = '',
  status = 'Approved',
}) {
  const effectiveUserId = userId || getCurrentUser()?.id || 'guest';
  const now = new Date().toISOString();
  const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  return {
    id,
    userId: effectiveUserId,
    date,
    activity: activity || 'Development',
    hours: Math.round(Number(hours) * 100) / 100,
    morningSession: morningSession
      ? {
          attended: Boolean(morningSession.attended),
          timeIn: morningSession.timeIn || '',
          timeOut: morningSession.timeOut || '',
          durationMinutes: Number(morningSession.durationMinutes) || 0,
          durationHours: Math.round((Number(morningSession.durationHours) || 0) * 100) / 100,
        }
      : null,
    afternoonSession: afternoonSession
      ? {
          attended: Boolean(afternoonSession.attended),
          timeIn: afternoonSession.timeIn || '',
          timeOut: afternoonSession.timeOut || '',
          durationMinutes: Number(afternoonSession.durationMinutes) || 0,
          durationHours: Math.round((Number(afternoonSession.durationHours) || 0) * 100) / 100,
        }
      : null,
    status: status || 'Approved',
    description: String(description || '').trim(),
    syncStatus: 'pending',
    sync_version: 1,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Updates an existing training record.
 */
export function updateTrainingRecord(records = [], id, updatedFields = {}, currentUserId = null) {
  const effectiveUserId = currentUserId || getCurrentUser()?.id;
  const now = new Date().toISOString();

  return records.map((record) => {
    if (record.id !== id) return record;
    if (effectiveUserId && record.userId && record.userId !== effectiveUserId) {
      console.warn('Unauthorized update attempt on record belonging to another user.');
      return record;
    }
    return {
      ...record,
      ...updatedFields,
      userId: record.userId || effectiveUserId || 'guest',
      activity: updatedFields.activity || record.activity,
      hours: Math.round(Number(updatedFields.hours ?? record.hours) * 100) / 100,
      morningSession: updatedFields.morningSession !== undefined ? updatedFields.morningSession : record.morningSession,
      afternoonSession: updatedFields.afternoonSession !== undefined ? updatedFields.afternoonSession : record.afternoonSession,
      description: updatedFields.description !== undefined ? String(updatedFields.description).trim() : record.description,
      status: updatedFields.status || record.status || 'Approved',
      syncStatus: 'pending',
      sync_version: (record.sync_version || 1) + 1,
      updatedAt: now,
    };
  });
}

// ----------------------------------------------------
// Remote API & Offline Sync Integration
// ----------------------------------------------------

/**
 * Fetches all training records from the Laravel backend.
 */
export async function fetchRemoteRecords(userId = null) {
  try {
    const data = await apiClient.get('/api/training-records?all=true');
    const remoteRecords = (data?.records || []).map(mapBackendRecordToFrontend);

    if (remoteRecords.length > 0) {
      saveStoredRecords(userId, remoteRecords);
    }
    return remoteRecords;
  } catch (err) {
    console.warn('Unable to reach backend /api/training-records; returning cached records', err);
    return loadStoredRecords(userId);
  }
}

/**
 * Persists a single record to backend, or queues it if offline.
 */
export async function persistRecordToBackend(record, isNew = false) {
  const payload = mapFrontendRecordToBackend(record);

  try {
    let res;
    if (isNew) {
      res = await apiClient.post('/api/training-records', payload);
    } else {
      res = await apiClient.put(`/api/training-records/${record.id}`, payload);
    }

    const updated = mapBackendRecordToFrontend(res?.record);
    if (updated) {
      await idbSaveRecord(updated);
    }
    return { success: true, record: updated || record };
  } catch (err) {
    // Offline or server error: enqueue for sync
    await idbEnqueueMutation(record.userId, isNew ? 'create' : 'update', payload);
    await idbSaveRecord({ ...record, syncStatus: 'pending' });
    return { success: true, record, offline: true };
  }
}

/**
 * Deletes a record from backend, or queues deletion if offline.
 */
export async function deleteRecordFromBackend(recordId, userId = null) {
  const effectiveUserId = userId || getCurrentUser()?.id;

  try {
    await apiClient.delete(`/api/training-records/${recordId}`);
    await idbDeleteRecord(recordId);
    return { success: true };
  } catch (err) {
    await idbEnqueueMutation(effectiveUserId, 'delete', { id: recordId });
    await idbDeleteRecord(recordId);
    return { success: true, offline: true };
  }
}

/**
 * Flushes the offline sync queue to the Laravel backend /api/sync/push.
 */
export async function flushOfflineSyncQueue(userId = null) {
  const effectiveUserId = userId || getCurrentUser()?.id;
  if (!effectiveUserId) return { synced: 0 };

  const queue = await idbGetSyncQueue(effectiveUserId);
  if (!queue || queue.length === 0) return { synced: 0 };

  const recordsPayload = queue.map((item) => {
    if (item.action === 'delete') {
      return { id: item.data.id, training_date: '2026-01-01', is_deleted: true };
    }
    return {
      ...item.data,
      is_deleted: false,
    };
  });

  try {
    const res = await apiClient.post('/api/sync/push', { records: recordsPayload });

    // Remove successfully processed items from queue
    for (const item of queue) {
      await idbRemoveQueueItem(item.queueId);
    }

    return {
      synced: queue.length,
      applied: res?.applied || [],
      conflicts: res?.conflicts || [],
    };
  } catch (err) {
    console.warn('Sync flush failed; will retry on next online event', err);
    return { synced: 0, error: err.message };
  }
}

// Auto-flush queue when browser comes online
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    flushOfflineSyncQueue().catch((err) => console.warn('Background sync failed', err));
  });
}
