/**
 * Authentication Service for OJT Tracker
 * 
 * Note on Architecture:
 * - This frontend currently runs standalone (no Laravel backend is present in the workspace).
 * - Plaintext passwords are NEVER stored in localStorage or sessionStorage.
 * - Passwords are cryptographically hashed using Web Crypto API SHA-256 with unique per-user salts.
 * - This service provides an API-ready interface (registerUser, loginUser, logoutUser, getCurrentUser)
 *   that can seamlessly connect to Laravel Sanctum / session authentication endpoints when deployed.
 */

const ACCOUNTS_STORAGE_KEY = 'ojt_registered_accounts';
const SESSION_STORAGE_KEY = 'ojt_auth_session';

/**
 * Generates a random cryptographic salt as a hex string.
 */
function generateSalt(length = 16) {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

/**
 * Hashes a password string with salt using Web Crypto SHA-256.
 * Falls back safely to a deterministic hash if SubtleCrypto is unavailable.
 */
async function hashPasswordWithSalt(password, salt) {
  const saltedPassword = `${salt}:${password}`;
  if (typeof crypto !== 'undefined' && crypto.subtle && crypto.subtle.digest) {
    const encoder = new TextEncoder();
    const data = encoder.encode(saltedPassword);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  // Deterministic fallback if subtle is unavailable in older environments
  let hash = 0;
  for (let i = 0; i < saltedPassword.length; i++) {
    const char = saltedPassword.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `fallback_${Math.abs(hash).toString(16)}`;
}

/**
 * Loads all registered accounts from storage.
 */
export function getRegisteredAccounts() {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to load registered accounts', err);
    return [];
  }
}

/**
 * Saves registered accounts to storage.
 */
function saveRegisteredAccounts(accounts) {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
  } catch (err) {
    console.error('Failed to save registered accounts', err);
  }
}

/**
 * Checks if a specific email has a registered account.
 */
export function isEmailRegistered(email) {
  if (!email) return false;
  const accounts = getRegisteredAccounts();
  const normalized = email.trim().toLowerCase();
  return accounts.some((a) => a.email.toLowerCase() === normalized);
}

/**
 * Registers a new student account.
 * Plaintext passwords are not persisted; only the salt and SHA-256 hash are stored.
 */
export async function registerUser({ fullName, studentId, email, password }) {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const trimmedName = String(fullName || '').trim();
  const trimmedStudentId = String(studentId || '').trim();

  if (!trimmedName) {
    return { success: false, error: 'Full name is required.' };
  }
  if (!trimmedStudentId) {
    return { success: false, error: 'Student ID number is required.' };
  }
  if (!normalizedEmail) {
    return { success: false, error: 'Email address is required.' };
  }
  if (!password || password.length < 8) {
    return { success: false, error: 'Password must be at least 8 characters long.' };
  }

  const accounts = getRegisteredAccounts();
  const existing = accounts.find((a) => a.email.toLowerCase() === normalizedEmail);
  if (existing) {
    return { success: false, error: 'An account with this email address already exists. Please log in.' };
  }

  const salt = generateSalt(16);
  const passwordHash = await hashPasswordWithSalt(password, salt);

  const newUser = {
    id: `usr_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    fullName: trimmedName,
    studentId: trimmedStudentId,
    email: normalizedEmail,
    salt,
    passwordHash,
    createdAt: new Date().toISOString(),
  };

  accounts.push(newUser);
  saveRegisteredAccounts(accounts);

  // Return public safe user info
  return {
    success: true,
    user: {
      id: newUser.id,
      fullName: newUser.fullName,
      studentId: newUser.studentId,
      email: newUser.email,
    },
  };
}

/**
 * Authenticates a student with email and password.
 * Rejects unregistered accounts and incorrect passwords with specific error messages.
 */
export async function loginUser({ email, password }) {
  const normalizedEmail = String(email || '').trim().toLowerCase();

  if (!normalizedEmail) {
    return { success: false, error: 'Email address is required.' };
  }
  if (!password) {
    return { success: false, error: 'Password is required.' };
  }

  const accounts = getRegisteredAccounts();
  const user = accounts.find((a) => a.email.toLowerCase() === normalizedEmail);

  if (!user) {
    return {
      success: false,
      error: 'Account not found. Please register first.',
      code: 'ACCOUNT_NOT_FOUND',
    };
  }

  const inputHash = await hashPasswordWithSalt(password, user.salt);
  if (inputHash !== user.passwordHash) {
    return {
      success: false,
      error: 'Incorrect email or password.',
      code: 'INVALID_CREDENTIALS',
    };
  }

  // Create safe authenticated session
  const sessionUser = {
    id: user.id,
    fullName: user.fullName,
    studentId: user.studentId,
    email: user.email,
  };

  const session = {
    token: `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    user: sessionUser,
    loggedInAt: new Date().toISOString(),
  };

  try {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));

    // Synchronize to stored student profile if needed
    const rawProfile = localStorage.getItem('ojt_student_profile');
    const profile = rawProfile ? JSON.parse(rawProfile) : {};
    localStorage.setItem(
      'ojt_student_profile',
      JSON.stringify({
        ...profile,
        fullName: sessionUser.fullName,
        studentId: sessionUser.studentId,
      })
    );
  } catch (err) {
    console.error('Failed to save session', err);
  }

  return {
    success: true,
    user: sessionUser,
  };
}

/**
 * Gets the currently authenticated user from session.
 */
export function getCurrentUser() {
  if (typeof localStorage === 'undefined' && typeof sessionStorage === 'undefined') return null;
  try {
    const raw = (typeof sessionStorage !== 'undefined' && sessionStorage.getItem(SESSION_STORAGE_KEY)) ||
      (typeof localStorage !== 'undefined' && localStorage.getItem(SESSION_STORAGE_KEY));
    if (!raw) return null;
    const session = JSON.parse(raw);
    return session?.user || null;
  } catch {
    return null;
  }
}

/**
 * Checks whether the current visitor is authenticated.
 */
export function isAuthenticated() {
  return Boolean(getCurrentUser());
}

/**
 * Logs out the currently authenticated user and clears session tokens.
 */
export function logoutUser() {
  try {
    if (typeof sessionStorage !== 'undefined') sessionStorage.removeItem(SESSION_STORAGE_KEY);
    if (typeof localStorage !== 'undefined') localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear session', err);
  }
}
