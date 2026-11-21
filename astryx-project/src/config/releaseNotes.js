/**
 * Release Notes & What's New Single Source of Truth
 *
 * Chronological log of application updates.
 * Add new entries at the top of the RELEASE_NOTES array.
 */

export const RELEASE_NOTES = [
  {
    version: '1.0.0',
    date: 'November 20, 2026',
    title: 'Initial Production Release',
    summary: 'Complete attendance tracking, cross-browser synchronization, and PWA capabilities for student interns.',
    features: [
      'Daily time & tasks logging with separate AM and PM shifts and automatic rendered hours computation.',
      'Student profile setup wizard covering target hours, working schedules, school, and host company placement.',
      'Official Daily Time & Tasks Record (DTTR) generation on standard Long Bond paper format.',
      'Custom DTTR PDF template upload with server-side private file storage and cross-browser synchronization.',
      'Email-based password recovery flow with secure token validation and Gmail SMTP integration.',
      'Progressive Web App (PWA) installation for standalone mobile and desktop home screen experience.',
      'Transparent Privacy Policy, Terms of Service, About page, Help & FAQ center, and Update Checker.',
    ],
    improvements: [
      'Sanctum SPA cookie authentication with automated CSRF handshake and session resilience.',
      'High-DPI canvas PDF preview and rendering using local standard fonts without browser plugin dependencies.',
      'Accessible, high-contrast UI layouts following Meta Astryx Design guidelines.',
    ],
    fixes: [
      'Resolved session collision where RedirectIfAuthenticated prevented password reset token processing.',
      'Fixed repeated onboarding prompt by preserving authoritative server-side completion flag across devices.',
      'Fixed uploaded DTTR PDF templates not appearing when logging in on secondary browsers.',
    ],
  },
];

const LAST_VIEWED_VERSION_KEY = 'ojt_last_viewed_version';

/**
 * Returns whether there are newer release notes the user hasn't opened yet.
 */
export function hasUnreadReleaseNotes() {
  if (typeof localStorage === 'undefined') return false;
  if (!RELEASE_NOTES || RELEASE_NOTES.length === 0) return false;
  const latestVersion = RELEASE_NOTES[0].version;
  const lastViewed = localStorage.getItem(LAST_VIEWED_VERSION_KEY);
  return lastViewed !== latestVersion;
}

/**
 * Marks the latest release notes version as viewed by the user.
 */
export function markReleaseNotesViewed() {
  if (typeof localStorage === 'undefined') return;
  if (!RELEASE_NOTES || RELEASE_NOTES.length === 0) return;
  localStorage.setItem(LAST_VIEWED_VERSION_KEY, RELEASE_NOTES[0].version);
}
