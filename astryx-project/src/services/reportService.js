import apiClient from './apiClient.js';

export const PROBLEM_CATEGORIES = [
  'Bug or technical issue',
  'Login or account problem',
  'Time log problem',
  'Reports or PDF problem',
  'Profile or settings problem',
  'Data missing or incorrect',
  'Other',
];

/**
 * Submits a problem report to the backend API (POST /api/problem-reports).
 * Automatically uses Sanctum session cookies when a student is signed in.
 */
export async function submitProblemReport({
  category,
  description,
  email = '',
  isAuthenticated = false,
}) {
  const payload = {
    category: String(category || '').trim(),
    description: String(description || '').trim(),
  };

  if (!isAuthenticated) {
    payload.email = String(email || '').trim().toLowerCase();
  }

  try {
    const res = await apiClient.post('/api/problem-reports', payload);
    return {
      success: true,
      reportId: res?.report_id ?? null,
      message: res?.message || 'Report submitted successfully.',
    };
  } catch (err) {
    const fieldErrors = {};
    if (err?.errors && typeof err.errors === 'object') {
      for (const [key, messages] of Object.entries(err.errors)) {
        if (Array.isArray(messages) && messages.length > 0) {
          fieldErrors[key] = messages[0];
        }
      }
    }

    let message = 'Unable to submit your report right now. Please try again.';
    if (err?.isOffline) {
      message = 'You appear to be offline. Please check your internet connection and try again.';
    } else if (err?.status === 422) {
      message = Object.values(fieldErrors)[0] || 'Please review the highlighted fields and try again.';
    } else if (err?.status === 429) {
      message = 'Too many reports submitted recently. Please wait a minute before trying again.';
    } else if (err?.status === 419) {
      message = 'Your browser session token refreshed. Please submit the form once more.';
    } else if (err?.status === 0) {
      message = 'Could not connect to the server. Please check your connection and try again.';
    }

    return {
      success: false,
      status: err?.status || 0,
      message,
      errors: fieldErrors,
    };
  }
}
