import { saveStoredProfile, loadStoredProfile } from './profileService.js';
import { getCurrentUser } from './authService.js';

export function getOnboardingStorageKey(userId = null) {
  const effectiveId = userId || getCurrentUser()?.id || 'guest';
  return `ojt_onboarding_data_${effectiveId}`;
}

export function getOnboardingStatusKey(userId = null) {
  const effectiveId = userId || getCurrentUser()?.id || 'guest';
  return `ojt_onboarding_completed_${effectiveId}`;
}

export const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

const DAY_INDICES = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};

export const DEFAULT_ONBOARDING_DATA = {
  // Step 1: Requirements
  requiredHours: 600,
  dailyWorkingHours: 8,
  startDate: new Date().toISOString().slice(0, 10),
  // Step 2: Schedule
  workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  // Two Daily Training Sessions
  morningEnabled: true,
  morningTimeIn: '08:00',
  morningTimeOut: '12:00',
  afternoonEnabled: true,
  afternoonTimeIn: '13:00',
  afternoonTimeOut: '17:00',
  // Backward compatibility legacy fields
  timeIn: '08:00',
  timeOut: '17:00',
  breakMinutes: 60,
  // Step 3: School Information
  schoolName: '',
  program: '',
  yearLevel: '',
  schoolDepartment: '',
  // Step 4: Company Information
  companyName: '',
  companyAddress: '',
  companyDepartment: '',
  supervisorName: '',
  internshipRole: '',
};

/**
 * Converts HH:MM string to total minutes from midnight.
 */
export function timeToMinutes(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') return null;
  const parts = timeStr.split(':').map(Number);
  if (parts.length < 2 || isNaN(parts[0]) || isNaN(parts[1])) return null;
  return parts[0] * 60 + parts[1];
}

/**
 * Converts total minutes from midnight to HH:MM format.
 */
export function minutesToTime(totalMinutes) {
  if (totalMinutes == null || isNaN(totalMinutes)) return '00:00';
  const hours = Math.floor(totalMinutes / 60) % 24;
  const mins = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

/**
 * Calculates session duration in minutes.
 * Returns 0 if timeOut is not strictly after timeIn.
 */
export function calculateSessionDurationMinutes(timeIn, timeOut) {
  const inMins = timeToMinutes(timeIn);
  const outMins = timeToMinutes(timeOut);
  if (inMins == null || outMins == null) return 0;
  if (outMins <= inMins) return 0;
  return outMins - inMins;
}

/**
 * Calculates morning, afternoon, and total daily hours based on enabled sessions.
 * Excludes any interval between morning and afternoon sessions.
 */
export function calculateDailySessionHours({
  morningEnabled = true,
  morningTimeIn = '08:00',
  morningTimeOut = '12:00',
  afternoonEnabled = true,
  afternoonTimeIn = '13:00',
  afternoonTimeOut = '17:00',
} = {}) {
  let morningMinutes = 0;
  let afternoonMinutes = 0;

  if (morningEnabled) {
    morningMinutes = calculateSessionDurationMinutes(morningTimeIn, morningTimeOut);
  }

  if (afternoonEnabled) {
    afternoonMinutes = calculateSessionDurationMinutes(afternoonTimeIn, afternoonTimeOut);
  }

  const totalMinutes = morningMinutes + afternoonMinutes;
  const morningHours = Math.round((morningMinutes / 60) * 100) / 100;
  const afternoonHours = Math.round((afternoonMinutes / 60) * 100) / 100;
  const totalHours = Math.round((totalMinutes / 60) * 100) / 100;

  let intervalMinutes = 0;
  if (morningEnabled && afternoonEnabled) {
    const mOut = timeToMinutes(morningTimeOut);
    const aIn = timeToMinutes(afternoonTimeIn);
    if (mOut != null && aIn != null && aIn > mOut) {
      intervalMinutes = aIn - mOut;
    }
  }

  return {
    morningMinutes,
    afternoonMinutes,
    totalMinutes,
    morningHours,
    afternoonHours,
    totalHours,
    intervalMinutes,
  };
}

/**
 * Validates session configuration.
 * - Time Out must be later than Time In.
 * - Afternoon must not overlap with morning.
 * - At least one session must be enabled.
 * - Daily hours must be greater than zero.
 */
export function validateSessionsConfig({
  morningEnabled = true,
  morningTimeIn = '08:00',
  morningTimeOut = '12:00',
  afternoonEnabled = true,
  afternoonTimeIn = '13:00',
  afternoonTimeOut = '17:00',
}) {
  const errors = {};

  if (!morningEnabled && !afternoonEnabled) {
    errors.sessions = 'At least one training session (Morning or Afternoon) must be enabled.';
    return errors;
  }

  const mIn = timeToMinutes(morningTimeIn);
  const mOut = timeToMinutes(morningTimeOut);
  const aIn = timeToMinutes(afternoonTimeIn);
  const aOut = timeToMinutes(afternoonTimeOut);

  if (morningEnabled) {
    if (mIn == null || mOut == null) {
      errors.morning = 'Please provide valid Morning Time In and Time Out.';
    } else if (mOut <= mIn) {
      errors.morningTimeOut = 'Morning Time Out must be later than Morning Time In.';
    }
  }

  if (afternoonEnabled) {
    if (aIn == null || aOut == null) {
      errors.afternoon = 'Please provide valid Afternoon Time In and Time Out.';
    } else if (aOut <= aIn) {
      errors.afternoonTimeOut = 'Afternoon Time Out must be later than Afternoon Time In.';
    }
  }

  // Cross-session overlap check
  if (morningEnabled && afternoonEnabled && mIn != null && mOut != null && aIn != null && aOut != null) {
    if (aIn < mOut) {
      errors.overlap = 'Afternoon session cannot start before morning session ends. Please ensure sessions do not overlap.';
    }
  }

  const sessionHours = calculateDailySessionHours({
    morningEnabled,
    morningTimeIn,
    morningTimeOut,
    afternoonEnabled,
    afternoonTimeIn,
    afternoonTimeOut,
  });

  if (sessionHours.totalHours <= 0 && !errors.sessions && !errors.morning && !errors.afternoon) {
    errors.sessions = 'Daily training hours must be greater than zero.';
  }

  return errors;
}

/**
 * Calculates estimated training days required based on required hours and daily hours.
 */
export function calculateTrainingDays(requiredHours, dailyWorkingHours) {
  const req = Number(requiredHours);
  const daily = Number(dailyWorkingHours);
  if (!req || req <= 0 || !daily || daily <= 0) return 0;
  return Math.ceil(req / daily);
}

/**
 * Calculates the estimated completion date by stepping through calendar days
 * and counting only configured working days.
 */
export function calculateEstimatedCompletionDate(startDateStr, requiredHours, dailyWorkingHours, workingDays = []) {
  if (!startDateStr || !requiredHours || !dailyWorkingHours) return null;
  const daysRequired = calculateTrainingDays(requiredHours, dailyWorkingHours);
  if (daysRequired <= 0) return null;

  const validDayIndices = (workingDays.length > 0 ? workingDays : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'])
    .map((name) => DAY_INDICES[name])
    .filter((idx) => idx !== undefined);

  if (validDayIndices.length === 0) return null;

  const current = new Date(`${startDateStr}T00:00:00`);
  if (isNaN(current.getTime())) return null;

  let daysCounted = 0;
  const maxIterations = 365 * 3;
  let iterations = 0;

  while (daysCounted < daysRequired && iterations < maxIterations) {
    const dayOfWeek = current.getDay();
    if (validDayIndices.includes(dayOfWeek)) {
      daysCounted += 1;
      if (daysCounted >= daysRequired) {
        break;
      }
    }
    current.setDate(current.getDate() + 1);
    iterations += 1;
  }

  const formatted = current.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return {
    date: current,
    formatted,
    iso: current.toISOString().slice(0, 10),
  };
}

/**
 * Formats minutes into human-readable duration string.
 */
export function formatMinutesToDuration(totalMinutes) {
  if (!totalMinutes || totalMinutes <= 0) return '0 hrs';
  const hrs = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  if (hrs > 0 && mins > 0) return `${hrs}h ${mins}m`;
  if (hrs > 0) return `${hrs} hr${hrs > 1 ? 's' : ''}`;
  return `${mins} min${mins > 1 ? 's' : ''}`;
}

/**
 * Checks if onboarding has been completed for a specific user.
 */
export function isOnboardingCompleted(userId = null) {
  if (typeof window === 'undefined') return false;
  try {
    const key = getOnboardingStatusKey(userId);
    return localStorage.getItem(key) === 'true';
  } catch {
    return false;
  }
}

/**
 * Loads current draft of onboarding data isolated per user.
 */
export function loadOnboardingData(userId = null) {
  if (typeof window === 'undefined') return DEFAULT_ONBOARDING_DATA;
  try {
    const key = getOnboardingStorageKey(userId);
    const raw = localStorage.getItem(key);
    if (!raw) return DEFAULT_ONBOARDING_DATA;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_ONBOARDING_DATA,
      ...parsed,
      morningEnabled: parsed.morningEnabled !== undefined ? Boolean(parsed.morningEnabled) : true,
      morningTimeIn: parsed.morningTimeIn || DEFAULT_ONBOARDING_DATA.morningTimeIn,
      morningTimeOut: parsed.morningTimeOut || DEFAULT_ONBOARDING_DATA.morningTimeOut,
      afternoonEnabled: parsed.afternoonEnabled !== undefined ? Boolean(parsed.afternoonEnabled) : true,
      afternoonTimeIn: parsed.afternoonTimeIn || DEFAULT_ONBOARDING_DATA.afternoonTimeIn,
      afternoonTimeOut: parsed.afternoonTimeOut || DEFAULT_ONBOARDING_DATA.afternoonTimeOut,
    };
  } catch {
    return DEFAULT_ONBOARDING_DATA;
  }
}

/**
 * Saves current draft of onboarding data (isolated per user).
 */
export function saveOnboardingData(data, userId = null) {
  if (typeof window === 'undefined') return;
  try {
    const key = getOnboardingStorageKey(userId);
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save onboarding data', err);
  }
}

/**
 * Completes onboarding and synchronizes profile and training hours.
 */
export function completeOnboarding(data, userId = null) {
  if (typeof window === 'undefined') return;
  try {
    const sessionHours = calculateDailySessionHours(data);
    const effectiveDailyHours =
      sessionHours.totalHours > 0
        ? sessionHours.totalHours
        : Number(data.dailyWorkingHours) || 8;

    const updatedData = {
      ...data,
      dailyWorkingHours: effectiveDailyHours,
    };

    saveOnboardingData(updatedData, userId);
    const statusKey = getOnboardingStatusKey(userId);
    localStorage.setItem(statusKey, 'true');

    // Synchronize to student profile
    const existingProfile = loadStoredProfile(userId);
    const scheduleParts = [];
    if (data.morningEnabled) scheduleParts.push(`AM: ${data.morningTimeIn}-${data.morningTimeOut}`);
    if (data.afternoonEnabled) scheduleParts.push(`PM: ${data.afternoonTimeIn}-${data.afternoonTimeOut}`);
    const schedSummary = scheduleParts.join(' · ') || `${effectiveDailyHours} hrs/day`;

    const updatedProfile = {
      ...existingProfile,
      program: data.program || existingProfile.program,
      institution: data.schoolName || existingProfile.institution,
      company: data.companyName || existingProfile.company,
      department: data.companyDepartment || existingProfile.department,
      supervisor: data.supervisorName || existingProfile.supervisor,
      startDate: data.startDate || existingProfile.startDate,
      notes: `Target: ${data.requiredHours} hours · ${data.internshipRole || 'Intern'} · Schedule: ${schedSummary}`,
    };

    const completion = calculateEstimatedCompletionDate(
      data.startDate,
      data.requiredHours,
      effectiveDailyHours,
      data.workingDays
    );
    if (completion) {
      updatedProfile.targetEndDate = completion.iso;
    }

    saveStoredProfile(updatedProfile, userId);
  } catch (err) {
    console.error('Failed to complete onboarding', err);
  }
}
