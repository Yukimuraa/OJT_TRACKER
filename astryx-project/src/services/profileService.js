import { getCurrentUser, updateCurrentUserSession } from './authService.js';
import apiClient from './apiClient.js';

export function getProfileStorageKey(userId = null) {
  const effectiveId = userId || getCurrentUser()?.id || 'guest';
  return `ojt_student_profile_${effectiveId}`;
}

export const DEFAULT_STUDENT_PROFILE = {
  fullName: 'Student Intern',
  studentId: '',
  avatarUrl: '/assets/student-avatar.png',
  program: 'BS Information Technology',
  institution: 'Technological University of the Philippines',
  company: 'Technology Solutions & Innovations Inc.',
  department: 'Software Engineering & QA',
  supervisor: 'Engr. Michael Santos',
  supervisorEmail: 'msantos@company.example',
  startDate: '2026-09-01',
  targetEndDate: '2026-12-15',
  notes: '600-hour mandatory On-the-Job Training program.',
  requiredHours: 600,
  hoursPerDay: 8.0,
  morningStart: '08:00',
  morningEnd: '12:00',
  afternoonStart: '13:00',
  afternoonEnd: '17:00',
};

/**
 * Loads stored profile synchronously from localStorage.
 */
export function loadStoredProfile(userId = null) {
  if (typeof localStorage === 'undefined') return DEFAULT_STUDENT_PROFILE;
  try {
    const key = getProfileStorageKey(userId);
    const raw = localStorage.getItem(key);
    const currentUser = getCurrentUser();

    const baseProfile = {
      ...DEFAULT_STUDENT_PROFILE,
      fullName: currentUser?.fullName || DEFAULT_STUDENT_PROFILE.fullName,
      studentId: currentUser?.studentId || DEFAULT_STUDENT_PROFILE.studentId,
      institution: currentUser?.schoolName || DEFAULT_STUDENT_PROFILE.institution,
      company: currentUser?.companyName || DEFAULT_STUDENT_PROFILE.company,
    };

    if (!raw) return baseProfile;
    return { ...baseProfile, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_STUDENT_PROFILE;
  }
}

/**
 * Saves profile to localStorage for instant offline access.
 */
export function saveStoredProfile(profile, userId = null) {
  if (typeof localStorage === 'undefined') return;
  try {
    const key = getProfileStorageKey(userId);
    localStorage.setItem(key, JSON.stringify(profile));
  } catch (err) {
    console.error('Failed to save student profile to localStorage', err);
  }
}

/**
 * Fetches the student profile from the Laravel backend.
 */
export async function fetchStudentProfile() {
  try {
    const data = await apiClient.get('/api/student-profile');
    const remoteProfile = data?.profile;
    if (!remoteProfile) return null;

    const currentUser = getCurrentUser();
    const effectiveId = currentUser?.id || 'guest';
    const current = loadStoredProfile(effectiveId);

    const merged = {
      ...current,
      studentId: remoteProfile.student_id || current.studentId,
      requiredHours: remoteProfile.required_hours || current.requiredHours,
      hoursPerDay: remoteProfile.hours_per_day ? Number(remoteProfile.hours_per_day) : current.hoursPerDay,
      startDate: remoteProfile.start_date || current.startDate,
      targetEndDate: remoteProfile.target_end_date || current.targetEndDate,
      workingDays: remoteProfile.working_days || current.workingDays,
      program: remoteProfile.program || current.program,
      yearLevel: remoteProfile.year_level || current.yearLevel,
      schoolDepartment: remoteProfile.school_department || current.schoolDepartment,
      institution: remoteProfile.school?.name || current.institution,
      company: remoteProfile.company_name || remoteProfile.company?.name || current.company,
      companyAddress: remoteProfile.company_address || remoteProfile.company?.address || current.companyAddress,
      department: remoteProfile.company_department || current.department,
      supervisor: remoteProfile.supervisor_name || current.supervisor,
      supervisorEmail: remoteProfile.supervisor_email || current.supervisorEmail,
      internshipRole: remoteProfile.internship_role || current.internshipRole,
      morningEnabled: remoteProfile.morning_enabled !== undefined ? Boolean(remoteProfile.morning_enabled) : true,
      morningStart: remoteProfile.morning_start ? remoteProfile.morning_start.slice(0, 5) : '08:00',
      morningEnd: remoteProfile.morning_end ? remoteProfile.morning_end.slice(0, 5) : '12:00',
      afternoonEnabled: remoteProfile.afternoon_enabled !== undefined ? Boolean(remoteProfile.afternoon_enabled) : true,
      afternoonStart: remoteProfile.afternoon_start ? remoteProfile.afternoon_start.slice(0, 5) : '13:00',
      afternoonEnd: remoteProfile.afternoon_end ? remoteProfile.afternoon_end.slice(0, 5) : '17:00',
      onboardingCompleted: Boolean(remoteProfile.onboarding_completed),
      onboardingStep: Number(remoteProfile.onboarding_step) || 0,
    };

    saveStoredProfile(merged, effectiveId);

    // Synchronize onboarding completion and draft data across devices/browsers
    if (typeof localStorage !== 'undefined') {
      try {
        if (remoteProfile.onboarding_completed) {
          localStorage.setItem(`ojt_onboarding_completed_${effectiveId}`, 'true');
        }

        const onboardingDraft = {
          requiredHours: merged.requiredHours,
          dailyWorkingHours: merged.hoursPerDay,
          startDate: merged.startDate,
          workingDays: merged.workingDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          morningEnabled: merged.morningEnabled,
          morningTimeIn: merged.morningStart,
          morningTimeOut: merged.morningEnd,
          afternoonEnabled: merged.afternoonEnabled,
          afternoonTimeIn: merged.afternoonStart,
          afternoonTimeOut: merged.afternoonEnd,
          schoolName: merged.institution,
          program: merged.program,
          yearLevel: merged.yearLevel,
          schoolDepartment: merged.schoolDepartment,
          companyName: merged.company,
          companyAddress: merged.companyAddress,
          companyDepartment: merged.department,
          supervisorName: merged.supervisor,
          internshipRole: merged.internshipRole,
        };
        localStorage.setItem(`ojt_onboarding_data_${effectiveId}`, JSON.stringify(onboardingDraft));
      } catch (e) {
        console.warn('Failed to cache restored onboarding data in localStorage', e);
      }
    }

    return merged;
  } catch (err) {
    console.warn('Could not fetch student profile from server; using cached profile', err);
    return loadStoredProfile();
  }
}

/**
 * Updates the student profile on the Laravel backend and updates local cache.
 */
export async function updateStudentProfile(profileData) {
  const currentUser = getCurrentUser();
  const current = loadStoredProfile(currentUser?.id);
  const updated = { ...current, ...profileData };
  saveStoredProfile(updated, currentUser?.id);

  if (profileData.studentId !== undefined || profileData.fullName !== undefined) {
    updateCurrentUserSession({
      ...(profileData.studentId !== undefined ? { studentId: String(profileData.studentId || '').trim() } : {}),
      ...(profileData.fullName !== undefined ? { fullName: String(profileData.fullName || '').trim() } : {}),
    });
  }

  try {
    const payload = {};
    if (profileData.studentId !== undefined) {
      const trimmedId = String(profileData.studentId || '').trim();
      payload.student_id = trimmedId || null;
    }
    if (profileData.requiredHours) payload.required_hours = Number(profileData.requiredHours);
    if (profileData.hoursPerDay) payload.hours_per_day = Number(profileData.hoursPerDay);
    if (profileData.startDate) payload.start_date = profileData.startDate;
    if (profileData.targetEndDate) payload.target_end_date = profileData.targetEndDate;
    if (profileData.workingDays) payload.working_days = profileData.workingDays;
    if (profileData.morningEnabled !== undefined) payload.morning_enabled = Boolean(profileData.morningEnabled);
    if (profileData.morningStart) payload.morning_start = profileData.morningStart.length === 5 ? `${profileData.morningStart}:00` : profileData.morningStart;
    if (profileData.morningEnd) payload.morning_end = profileData.morningEnd.length === 5 ? `${profileData.morningEnd}:00` : profileData.morningEnd;
    if (profileData.afternoonEnabled !== undefined) payload.afternoon_enabled = Boolean(profileData.afternoonEnabled);
    if (profileData.afternoonStart) payload.afternoon_start = profileData.afternoonStart.length === 5 ? `${profileData.afternoonStart}:00` : profileData.afternoonStart;
    if (profileData.afternoonEnd) payload.afternoon_end = profileData.afternoonEnd.length === 5 ? `${profileData.afternoonEnd}:00` : profileData.afternoonEnd;
    if (profileData.program !== undefined) payload.program = profileData.program;
    if (profileData.institution || profileData.schoolName) payload.school_name = profileData.institution || profileData.schoolName;
    if (profileData.yearLevel !== undefined) payload.year_level = profileData.yearLevel;
    if (profileData.schoolDepartment !== undefined) payload.school_department = profileData.schoolDepartment;
    if (profileData.company !== undefined || profileData.companyName !== undefined) payload.company_name = profileData.company || profileData.companyName;
    if (profileData.companyAddress !== undefined) payload.company_address = profileData.companyAddress;
    if (profileData.department !== undefined || profileData.companyDepartment !== undefined) payload.company_department = profileData.department || profileData.companyDepartment;
    if (profileData.supervisor !== undefined || profileData.supervisorName !== undefined) payload.supervisor_name = profileData.supervisor || profileData.supervisorName;
    if (profileData.supervisorEmail !== undefined) payload.supervisor_email = profileData.supervisorEmail;
    if (profileData.internshipRole !== undefined) payload.internship_role = profileData.internshipRole;
    if (profileData.onboardingCompleted !== undefined) payload.onboarding_completed = Boolean(profileData.onboardingCompleted);
    if (profileData.onboardingStep !== undefined) payload.onboarding_step = Number(profileData.onboardingStep);
    if (profileData.companyId) payload.company_id = profileData.companyId;

    if (Object.keys(payload).length > 0) {
      const res = await apiClient.put('/api/student-profile', payload);
      if (res?.profile) {
        return { success: true, profile: { ...updated, ...res.profile } };
      }
    }
    return { success: true, profile: updated };
  } catch (err) {
    console.warn('Profile update queued locally (network error)', err);
    return { success: true, profile: updated, offline: true };
  }
}
