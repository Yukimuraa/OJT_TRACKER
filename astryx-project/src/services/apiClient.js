/**
 * Centralized API Client for Laravel Sanctum SPA Authentication & Endpoints
 * 
 * Features:
 * - Cookie-based session authentication with credentials: 'include'
 * - Automatic CSRF handshake with /sanctum/csrf-cookie
 * - X-XSRF-TOKEN header injection from document.cookie
 * - Precise HTTP status code handling (401, 419, 422, 429, 500)
 * - Accurate offline detection vs backend unreachable distinction
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

let csrfPromise = null;

/**
 * Extracts a cookie value by name from document.cookie.
 */
export function getCookie(name) {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
  return match ? decodeURIComponent(match[3]) : null;
}

/**
 * Ensures CSRF protection cookie is established before state-mutating requests.
 */
export async function ensureCsrf(force = false) {
  if (!force && getCookie('XSRF-TOKEN')) {
    return Promise.resolve();
  }

  if (!csrfPromise || force) {
    csrfPromise = fetch(`${API_BASE}/sanctum/csrf-cookie`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        Accept: 'application/json',
      },
    })
      .then((res) => {
        csrfPromise = null;
        if (!res.ok) {
          throw new ApiError(`Failed to initialize CSRF protection (HTTP ${res.status}).`, res.status);
        }
      })
      .catch((err) => {
        csrfPromise = null;
        console.error('[apiClient] CSRF handshake error:', err);
        if (err instanceof ApiError) throw err;
        const isOffline = typeof navigator !== 'undefined' && navigator.onLine === false;
        const msg = isOffline
          ? 'Network connection failed. You are currently offline.'
          : 'Unable to connect to authentication service. Please verify that the backend server is running.';
        const apiErr = new ApiError(msg, 0);
        apiErr.isOffline = isOffline;
        throw apiErr;
      });
  }

  return csrfPromise;
}

/**
 * Custom error class for API errors with validation details and HTTP status.
 */
export class ApiError extends Error {
  constructor(message, status = 0, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
    this.errors = data?.errors || {};
    this.isOffline = false;
  }
}

/**
 * Generic request helper with Sanctum credentials, CSRF handling, and error mapping.
 */
export async function request(endpoint, options = {}) {
  const method = (options.method || 'GET').toUpperCase();
  const isUnsafeMethod = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);

  if (isUnsafeMethod) {
    await ensureCsrf();
  }

  const xsrfToken = getCookie('XSRF-TOKEN');

  const headers = {
    Accept: 'application/json',
    ...(options.headers || {}),
  };

  if (xsrfToken && isUnsafeMethod) {
    headers['X-XSRF-TOKEN'] = xsrfToken;
  }

  if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(options.body);
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;

  let response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include',
    });
  } catch (networkError) {
    console.error('[apiClient] Fetch error on URL:', url, networkError);
    const isActuallyOffline = typeof navigator !== 'undefined' && navigator.onLine === false;
    const msg = isActuallyOffline
      ? 'Network connection failed. You are currently offline.'
      : 'Cannot reach the backend server. Please ensure the backend server is running.';
    const error = new ApiError(msg, 0);
    error.isOffline = isActuallyOffline;
    throw error;
  }

  const contentType = response.headers.get('content-type') || '';
  let data = null;
  if (contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    if (response.status === 419 && !options._isRetry) {
      console.warn('[apiClient] CSRF token mismatch (HTTP 419). Refreshing CSRF token and retrying...');
      await ensureCsrf(true);
      return request(endpoint, { ...options, _isRetry: true });
    }

    let message = data?.message;
    if (!message) {
      if (response.status === 401) {
        message = 'Unauthenticated. Please log in.';
      } else if (response.status === 419) {
        message = 'Your session or CSRF token has expired. Please refresh the page.';
      } else if (response.status === 422) {
        message = 'Validation failed. Please check the entered information.';
      } else if (response.status === 429) {
        message = 'Too many requests. Please wait a moment before trying again.';
      } else if (response.status >= 500) {
        message = 'Internal server error occurred. Please check backend server logs.';
      } else {
        message = `Request failed with status ${response.status}`;
      }
    }
    throw new ApiError(message, response.status, data);
  }

  return data;
}

export const apiClient = {
  get: (url, options = {}) => request(url, { ...options, method: 'GET' }),
  post: (url, body, options = {}) => request(url, { ...options, method: 'POST', body }),
  put: (url, body, options = {}) => request(url, { ...options, method: 'PUT', body }),
  patch: (url, body, options = {}) => request(url, { ...options, method: 'PATCH', body }),
  delete: (url, options = {}) => request(url, { ...options, method: 'DELETE' }),
};

export default apiClient;
