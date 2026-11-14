import { getCurrentUser } from './authService.js';

export function getProfileStorageKey(userId = null) {
  const effectiveId = userId || getCurrentUser()?.id || 'guest';
  return `ojt_student_profile_${effectiveId}`;
}

export const DEFAULT_STUDENT_PROFILE = {
  fullName: 'Student Intern',
  studentId: '2026-OJT-001',
  avatarUrl: '/assets/student-avatar.png',
  program: 'BS Information Technology',
  institution: 'State University - College of Computing',
  company: 'Technology Solutions & Innovations Inc.',
  department: 'Software Engineering & QA',
  supervisor: 'Engr. Michael Santos',
  supervisorEmail: 'msantos@company.example',
  startDate: '2026-09-01',
  targetEndDate: '2026-12-15',
  notes: '600-hour mandatory On-the-Job Training program.',
};

export function loadStoredProfile(userId = null) {
  if (typeof localStorage === 'undefined') return DEFAULT_STUDENT_PROFILE;
  try {
    const key = getProfileStorageKey(userId);
    const raw = localStorage.getItem(key);
    const currentUser = getCurrentUser();

    // Default template tailored to authenticated user if available
    const baseProfile = {
      ...DEFAULT_STUDENT_PROFILE,
      fullName: currentUser?.fullName || DEFAULT_STUDENT_PROFILE.fullName,
      studentId: currentUser?.studentId || DEFAULT_STUDENT_PROFILE.studentId,
    };

    if (!raw) return baseProfile;
    return { ...baseProfile, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_STUDENT_PROFILE;
  }
}

export function saveStoredProfile(profile, userId = null) {
  if (typeof localStorage === 'undefined') return;
  try {
    const key = getProfileStorageKey(userId);
    localStorage.setItem(key, JSON.stringify(profile));
  } catch (err) {
    console.error('Failed to save student profile to localStorage', err);
  }
}
