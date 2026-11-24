import apiClient from './apiClient.js';

/**
 * Fetches publicly approved feedback reviews and approved-only rating distribution (GET /api/feedback).
 */
export async function fetchPublicFeedback() {
  return apiClient.get('/api/feedback');
}

/**
 * Submits a feedback review (works for both authenticated students and public visitors).
 */
export async function submitPublicFeedback({
  rating,
  comment,
  displayNamePreference = 'anonymous',
}) {
  const payload = {
    rating: Number(rating),
    comment: String(comment || '').trim(),
    display_name_preference: displayNamePreference === 'first_name' ? 'first_name' : 'anonymous',
  };

  try {
    const res = await apiClient.post('/api/feedback', payload);
    return {
      success: true,
      feedback: res?.feedback ?? null,
      message:
        res?.message ||
        'Thank you for sharing your experience! Your feedback is pending administrator review.',
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

    let message = 'Unable to submit your feedback right now. Please try again.';
    if (err?.isOffline) {
      message = 'You appear to be offline. Please check your internet connection and try again.';
    } else if (err?.status === 403) {
      message = err?.message || 'Your current account cannot submit public reviews.';
    } else if (err?.status === 422) {
      message = Object.values(fieldErrors)[0] || 'Please review the highlighted fields and try again.';
    } else if (err?.status === 429) {
      message = err?.message || 'Too many submissions recently. Please wait a moment before trying again.';
    } else if (err?.status === 419) {
      message = 'Your browser session token refreshed. Please submit once more.';
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
