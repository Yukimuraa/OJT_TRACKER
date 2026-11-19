/**
 * Authentication Service for OJT Tracker
 * 
 * Powered by Laravel Sanctum SPA Cookie-based Session Authentication.
 * - CSRF handshake via /sanctum/csrf-cookie
 * - Session cookies with credentials: 'include'
 * - Offline-resilient user session caching
 */

import apiClient, { ApiError } from './apiClient.js';

const SESSION_STORAGE_KEY = 'ojt_auth_session';

/**
 * Fetches the list of registered schools for selection.
 */
export async function getSchools(search = '') {
  try {
    const url = search ? `/api/schools?search=${encodeURIComponent(search)}` : '/api/schools';
    const data = await apiClient.get(url);
    return data?.schools || [];
  } catch (err) {
    console.warn('Failed to load schools from API, returning empty list', err);
    return [];
  }
}

/**
 * Normalizes backend user structure for React frontend consumption.
 */
function normalizeUser(backendUser) {
  if (!backendUser) return null;
  const profile = backendUser.student_profile || {};
  return {
    id: backendUser.id,
    fullName: backendUser.name || '',
    name: backendUser.name || '',
    email: backendUser.email || '',
    studentId: profile.student_id || '',
    schoolId: profile.school?.id || profile.school_id || null,
    schoolName: profile.school?.name || '',
    companyId: profile.company?.id || profile.company_id || null,
    companyName: profile.company_name || profile.company?.name || '',
    requiredHours: profile.required_hours || 600,
    onboardingCompleted: Boolean(profile.onboarding_completed),
    onboardingStep: Number(profile.onboarding_step) || 0,
    emailVerifiedAt: backendUser.email_verified_at || null,
    isEmailVerified: Boolean(backendUser.email_verified_at),
    studentProfile: profile,
  };
}

/**
 * Saves authenticated user session to browser storage.
 */
function saveSession(user) {
  if (!user || typeof window === 'undefined') return;
  const session = {
    user,
    loggedInAt: new Date().toISOString(),
  };
  try {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  } catch (err) {
    console.error('Failed to save session to storage', err);
  }
}

/**
 * Clears authenticated user session from browser storage.
 */
function clearSession() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear session from storage', err);
  }
}

/**
 * Gets the currently cached authenticated user (synchronous for initial render).
 */
export function getCurrentUser() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(SESSION_STORAGE_KEY) || localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    return session?.user || null;
  } catch {
    return null;
  }
}

/**
 * Updates the current user session with partial data and persists to storage.
 */
export function updateCurrentUserSession(partial) {
  const current = getCurrentUser();
  if (!current) return;
  const updated = { ...current, ...partial };
  saveSession(updated);
  return updated;
}

/**
 * Checks whether the current visitor is authenticated.
 */
export function isAuthenticated() {
  return Boolean(getCurrentUser());
}

/**
 * Refreshes and verifies the current user session against Laravel Sanctum /api/user.
 */
export async function fetchCurrentUser() {
  try {
    const data = await apiClient.get('/api/user');
    const user = normalizeUser(data?.user);
    if (user) {
      saveSession(user);
    }
    return user;
  } catch (err) {
    if (err.status === 401) {
      clearSession();
    }
    return null;
  }
}

/**
 * Registers a new student account via Laravel Sanctum endpoint POST /api/register.
 */
export async function registerUser({
  fullName,
  name,
  studentId,
  email,
  password,
  confirmPassword,
  password_confirmation,
  schoolId,
  school_id,
  requiredHours = 600,
}) {
  const effectiveName = String(fullName || name || '').trim();
  const effectiveStudentId = String(studentId || '').trim();
  const effectiveEmail = String(email || '').trim().toLowerCase();
  const effectiveConfirmation = confirmPassword || password_confirmation || password;

  let effectiveSchoolId = Number(schoolId || school_id);
  if (!effectiveSchoolId || isNaN(effectiveSchoolId)) {
    // Resolve default or first available school if not explicitly selected
    try {
      const schools = await getSchools();
      effectiveSchoolId = schools[0]?.id || 1;
    } catch {
      effectiveSchoolId = 1;
    }
  }

  try {
    const payload = {
      name: effectiveName,
      email: effectiveEmail,
      password,
      password_confirmation: effectiveConfirmation,
      school_id: effectiveSchoolId,
      student_id: effectiveStudentId,
      required_hours: Number(requiredHours) || 600,
    };

    const res = await apiClient.post('/api/register', payload);
    const user = normalizeUser(res?.user);
    if (user) {
      saveSession(user);
      if (user.onboardingCompleted && typeof localStorage !== 'undefined') {
        try {
          localStorage.setItem(`ojt_onboarding_completed_${user.id}`, 'true');
        } catch {}
      }
    }

    return {
      success: true,
      user,
      message: res?.message || 'Registration successful.',
    };
  } catch (err) {
    const firstErrorMessage =
      err.errors && Object.values(err.errors)[0]
        ? Object.values(err.errors)[0][0]
        : err.message || 'Registration failed.';

    return {
      success: false,
      error: firstErrorMessage,
      errors: err.errors || {},
    };
  }
}

/**
 * Authenticates a student via Laravel Sanctum endpoint POST /api/login.
 */
export async function loginUser({ email, password, remember = true }) {
  const normalizedEmail = String(email || '').trim().toLowerCase();

  if (!normalizedEmail) {
    return { success: false, error: 'Email address is required.' };
  }
  if (!password) {
    return { success: false, error: 'Password is required.' };
  }

  try {
    const res = await apiClient.post('/api/login', {
      email: normalizedEmail,
      password,
      remember: Boolean(remember),
    });

    const user = normalizeUser(res?.user);
    if (user) {
      saveSession(user);
      if (user.onboardingCompleted && typeof localStorage !== 'undefined') {
        try {
          localStorage.setItem(`ojt_onboarding_completed_${user.id}`, 'true');
        } catch {}
      }
    }

    return {
      success: true,
      user,
      message: res?.message || 'Logged in successfully.',
    };
  } catch (err) {
    const code = err.status === 422 ? 'INVALID_CREDENTIALS' : 'AUTH_ERROR';
    const firstErrorMessage =
      err.errors && Object.values(err.errors)[0]
        ? Object.values(err.errors)[0][0]
        : err.message || 'Invalid email or password.';

    return {
      success: false,
      error: firstErrorMessage,
      code,
      status: err.status,
    };
  }
}

/**
 * Logs out the currently authenticated user via POST /api/logout.
 */
export async function logoutUser() {
  try {
    await apiClient.post('/api/logout', {});
  } catch (err) {
    console.warn('Backend logout request failed or network offline', err);
  } finally {
    clearSession();
  }
}

/**
 * Requests a password reset link email via POST /api/forgot-password.
 */
export async function requestPasswordReset(email) {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  if (!normalizedEmail) {
    return { success: false, error: 'Email address is required.' };
  }

  try {
    const res = await apiClient.post('/api/forgot-password', { email: normalizedEmail });
    return {
      success: true,
      message:
        res?.message ||
        "We've received your request. If an account exists with this email address, you will receive a password reset link shortly. Please check your inbox.",
    };
  } catch (err) {
    const firstErrorMessage =
      err.errors && Object.values(err.errors)[0]
        ? Object.values(err.errors)[0][0]
        : err.message || 'Failed to send reset link.';
    return {
      success: false,
      error: firstErrorMessage,
      errors: err.errors || {},
    };
  }
}

/**
 * Resets user password via POST /api/reset-password.
 */
export async function resetPassword({ token, email, password, password_confirmation }) {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  if (!token) {
    return { success: false, error: 'Reset token is required.' };
  }
  if (!normalizedEmail) {
    return { success: false, error: 'Email address is required.' };
  }
  if (!password) {
    return { success: false, error: 'New password is required.' };
  }
  if (password !== password_confirmation) {
    return { success: false, error: 'Passwords do not match.' };
  }

  try {
    const res = await apiClient.post('/api/reset-password', {
      token,
      email: normalizedEmail,
      password,
      password_confirmation,
    });
    // Invalidate local session cache so the client state is cleanly prepared for the new login
    clearSession();
    return {
      success: true,
      message: res?.message || 'Your password has been successfully reset. You can now log in with your new password.',
    };
  } catch (err) {
    const firstErrorMessage =
      err.errors && Object.values(err.errors)[0]
        ? Object.values(err.errors)[0][0]
        : err.message || 'Failed to reset password.';
    return {
      success: false,
      error: firstErrorMessage,
      errors: err.errors || {},
    };
  }
}

/**
 * Resends email verification notification via POST /api/email/verification-notification.
 */
export async function resendVerificationEmail() {
  try {
    const res = await apiClient.post('/api/email/verification-notification', {});
    return { success: true, message: res?.message || 'Verification email resent.' };
  } catch (err) {
    return { success: false, error: err.message || 'Failed to resend verification email.' };
  }
}
