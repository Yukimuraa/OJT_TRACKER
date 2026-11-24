import apiClient from './apiClient.js';

/**
 * Fetches live Admin Dashboard stats and recent activity from GET /api/admin/dashboard.
 */
export async function fetchAdminDashboard() {
  return apiClient.get('/api/admin/dashboard');
}

/**
 * Lists student accounts with search, status filter, and pagination.
 */
export async function fetchAdminStudents({ search = '', status = 'all', page = 1, perPage = 10 } = {}) {
  const params = new URLSearchParams();
  if (search.trim()) params.set('search', search.trim());
  if (status && status !== 'all') params.set('status', status);
  params.set('page', String(page));
  params.set('per_page', String(perPage));
  return apiClient.get(`/api/admin/students?${params.toString()}`);
}

/**
 * Fetches detailed read-only account summary for one student.
 */
export async function fetchAdminStudentDetail(studentId) {
  return apiClient.get(`/api/admin/students/${encodeURIComponent(studentId)}`);
}

/**
 * Activates or deactivates a student account.
 */
export async function updateAdminStudentStatus(studentId, isActive) {
  return apiClient.patch(`/api/admin/students/${encodeURIComponent(studentId)}/status`, {
    is_active: Boolean(isActive),
  });
}

/**
 * Lists submitted problem reports with search, status/category filters, and pagination.
 */
export async function fetchAdminProblemReports({
  search = '',
  status = 'all',
  category = 'all',
  page = 1,
  perPage = 10,
} = {}) {
  const params = new URLSearchParams();
  if (search.trim()) params.set('search', search.trim());
  if (status && status !== 'all') params.set('status', status);
  if (category && category !== 'all') params.set('category', category);
  params.set('page', String(page));
  params.set('per_page', String(perPage));
  return apiClient.get(`/api/admin/problem-reports?${params.toString()}`);
}

/**
 * Updates the status of a problem report.
 */
export async function updateAdminProblemReportStatus(reportId, status) {
  return apiClient.patch(`/api/admin/problem-reports/${encodeURIComponent(reportId)}/status`, {
    status,
  });
}

/**
 * Lists student and public feedback submissions along with approved-only average rating and 1-5 distribution.
 */
export async function fetchAdminFeedback({
  search = '',
  rating = 'all',
  moderationStatus = 'all',
  page = 1,
  perPage = 10,
} = {}) {
  const params = new URLSearchParams();
  if (search.trim()) params.set('search', search.trim());
  if (rating && rating !== 'all') params.set('rating', String(rating));
  if (moderationStatus && moderationStatus !== 'all') params.set('moderation_status', moderationStatus);
  params.set('page', String(page));
  params.set('per_page', String(perPage));
  return apiClient.get(`/api/admin/feedback?${params.toString()}`);
}

/**
 * Approves or rejects a feedback submission for public carousel visibility.
 */
export async function moderateAdminFeedback(feedbackId, moderationStatus) {
  return apiClient.patch(`/api/admin/feedback/${encodeURIComponent(feedbackId)}/moderation`, {
    moderation_status: moderationStatus,
  });
}

/**
 * Updates the administrator profile name and email.
 */
export async function updateAdminProfile({ name, email }) {
  return apiClient.put('/api/admin/settings/profile', { name, email });
}

/**
 * Updates the administrator password.
 */
export async function updateAdminPassword({ current_password, password, password_confirmation }) {
  return apiClient.put('/api/admin/settings/password', {
    current_password,
    password,
    password_confirmation,
  });
}
