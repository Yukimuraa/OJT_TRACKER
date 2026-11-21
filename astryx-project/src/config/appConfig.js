/**
 * Application Configuration & Version Single Source of Truth
 *
 * Centralizes application metadata, semantic versioning, and configurable
 * publisher information across Landing, About, Settings, and Legal pages.
 */

export const APP_CONFIG = {
  name: 'OJT Hours Tracker',
  shortName: 'OJT Tracker',
  version: '1.0.0',
  releaseDate: 'November 20, 2026',
  environment: import.meta.env.MODE || 'production',

  // Platform details matching actual technology stack
  platform: 'Web Application / Progressive Web App (PWA)',
  frontend: 'React 19, Vite, Meta Astryx UI / StyleX',
  backend: 'Laravel 13, PHP 8.3, Laravel Sanctum',
  database: 'MySQL 8.4',

  // PWA Features actually supported
  pwa: {
    installable: true,
    standalone: true,
    offlineSupport: true,
    pushNotifications: true,
    backgroundSync: false, // Transparent: not fully implemented
  },

  // Configurable Publisher / Developer Placeholders
  developer: {
    displayName: '[Developer / Publisher Name]',
    website: '[https://your-official-website.example.com]',
    supportEmail: '[support@your-domain.example.com]',
    privacyEmail: '[privacy@your-domain.example.com]',
    legalEmail: '[legal@your-domain.example.com]',
    dpoContact: '[Data Protection Officer / Privacy Contact Person]',
    officeAddress: '[City / Municipality, Province, Philippines]',
    institution: '[College / University / Organization Name]',
    copyrightYear: new Date().getFullYear(),
  },

  // Republic Act No. 10173 compliance details
  dataPrivacy: {
    regulatoryLaw: 'Republic Act No. 10173 (Data Privacy Act of 2012 of the Philippines)',
    regulatoryAuthority: 'National Privacy Commission (NPC)',
    retentionDefaultMonths: 12,
  },
};

export default APP_CONFIG;
