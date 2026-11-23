import React, { useId } from 'react';
import {
  EyeIcon,
  EyeOffIcon,
  CircleIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  DashboardIcon,
  ClockIcon,
  DocumentTextIcon,
  UserIcon,
  SettingsIcon,
} from '../common/BrandIcons';

const CURRENT_YEAR = new Date().getFullYear();

/**
 * BrandLogo - Renders the high-resolution transparent application logo
 * at a compact, crisp icon size (never upscaled or enlarged).
 */
export function BrandLogo({ size = 36 }) {
  const clampedSize = Math.min(Math.max(size, 24), 40);
  return (
    <img
      src="/brand-logo.png"
      alt="OJT Hours Tracker Logo"
      width={clampedSize}
      height={clampedSize}
      style={{
        width: clampedSize,
        height: clampedSize,
        maxWidth: clampedSize,
        maxHeight: clampedSize,
        backgroundColor: 'transparent',
        objectFit: 'contain',
        display: 'block',
        flexShrink: 0,
      }}
    />
  );
}

const COLUMN_A_FEATURES = ['dashboard', 'timelogs', 'reports', 'profile', 'settings', 'login', 'register'];
const COLUMN_B_FEATURES = ['settings', 'profile', 'reports', 'timelogs', 'dashboard', 'register', 'login'];
const COLUMN_C_FEATURES = ['reports', 'login', 'dashboard', 'register', 'timelogs', 'settings', 'profile'];

function PhoneStatusBar() {
  return (
    <div className="ojt-phone-statusbar">
      <span>9:41</span>
      <div className="ojt-phone-island">
        <div className="ojt-phone-island-lens" />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <svg width="13" height="9" viewBox="0 0 13 9" fill="currentColor" aria-hidden="true">
          <rect x="0" y="6" width="2" height="3" rx="0.5" />
          <rect x="3" y="4" width="2" height="5" rx="0.5" />
          <rect x="6" y="2" width="2" height="7" rx="0.5" />
          <rect x="9" y="0" width="2" height="9" rx="0.5" />
        </svg>
        <div
          style={{
            width: 17,
            height: 9,
            borderRadius: 2.5,
            border: '1px solid #0F172A',
            padding: 1,
            boxSizing: 'border-box',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <div style={{ width: '100%', height: '100%', backgroundColor: '#10B981', borderRadius: 1 }} />
        </div>
      </div>
    </div>
  );
}

function PhoneAppHeader({ title }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '6px 14px 8px 14px',
        borderBottom: '1px solid #F1F5F9',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div
          style={{
            width: 24,
            height: 24,
            borderRadius: '50%',
            backgroundColor: '#E2E8F0',
            border: '1px solid #CBD5E1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 9,
            fontWeight: 700,
            color: '#0F172A',
          }}
        >
          AR
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
          <span style={{ fontSize: 11.5, fontWeight: 700, color: '#0F172A' }}>{title}</span>
          <span style={{ fontSize: 9, fontWeight: 600, color: '#059669' }}>Student Portal</span>
        </div>
      </div>
      <span
        style={{
          fontSize: 8.5,
          fontWeight: 700,
          color: '#059669',
          backgroundColor: '#ECFDF5',
          padding: '2px 7px',
          borderRadius: 999,
        }}
      >
        PWA Active
      </span>
    </div>
  );
}

function PhoneBottomNav({ activeTab }) {
  const tabs = [
    { key: 'dashboard', label: 'Dashboard', Icon: DashboardIcon },
    { key: 'timelogs', label: 'Time Logs', Icon: ClockIcon },
    { key: 'reports', label: 'Reports', Icon: DocumentTextIcon },
    { key: 'profile', label: 'Profile', Icon: UserIcon },
    { key: 'settings', label: 'Settings', Icon: SettingsIcon },
  ];

  return (
    <div
      style={{
        borderTop: '1px solid #E2E8F0',
        backgroundColor: '#FFFFFF',
        padding: '6px 6px 6px 6px',
        flexShrink: 0,
      }}
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', alignItems: 'center' }}>
        {tabs.map(({ key, label, Icon }) => {
          const isActive = activeTab === key;
          return (
            <div
              key={key}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
                color: isActive ? '#059669' : '#64748B',
                position: 'relative',
              }}
            >
              {isActive && (
                <div
                  style={{
                    width: 14,
                    height: 2,
                    borderRadius: 999,
                    backgroundColor: '#10B981',
                    marginBottom: 1,
                  }}
                />
              )}
              <Icon width={13} height={13} />
              <span style={{ fontSize: 7.5, fontWeight: isActive ? 700 : 500, color: isActive ? '#0F172A' : '#64748B' }}>
                {label}
              </span>
            </div>
          );
        })}
      </div>
      <div
        style={{
          width: 72,
          height: 3,
          borderRadius: 999,
          backgroundColor: '#0F172A',
          margin: '7px auto 1px auto',
        }}
      />
    </div>
  );
}

/**
 * Renders full-height iPhone mockups matching the exact dimensions (272x536px)
 * and UI details of the user's OJT Hours Tracker mobile screens:
 * Dashboard, Time Logs, Reports, Profile, Settings, Login, and Register.
 */
function FeaturePhoneCard({ feature }) {
  const isAuthScreen = feature === 'login' || feature === 'register';

  return (
    <div className="ojt-phone-frame" data-showcase-screen={feature}>
      <div className="ojt-phone-screen">
        <div>
          <PhoneStatusBar />
          {!isAuthScreen && (
            <PhoneAppHeader
              title={
                feature === 'dashboard'
                  ? 'Dashboard'
                  : feature === 'timelogs'
                  ? 'Time Logs'
                  : feature === 'reports'
                  ? 'Reports'
                  : feature === 'profile'
                  ? 'Profile'
                  : 'Settings'
              }
            />
          )}
        </div>

        {/* SCREEN BODY */}
        <div
          style={{
            flex: 1,
            padding: isAuthScreen ? '10px 15px' : '10px 13px',
            display: 'flex',
            flexDirection: 'column',
            gap: 9,
            overflow: 'hidden',
          }}
        >
          {/* 1. DASHBOARD SCREEN (Matching Reference Photo 2) */}
          {feature === 'dashboard' && (
            <>
              <div>
                <div style={{ fontSize: 10, color: '#64748B' }}>Welcome back,</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#0F172A', marginTop: 1 }}>
                  Alex Rivera 👋
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7 }}>
                <div style={{ border: '1px solid #E2E8F0', borderRadius: 11, padding: '8px 10px' }}>
                  <div style={{ fontSize: 8.5, color: '#64748B' }}>Required</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', margin: '2px 0' }}>600h</div>
                  <div style={{ fontSize: 8, color: '#64748B' }}>Total mandated</div>
                </div>
                <div style={{ border: '1px solid #E2E8F0', borderRadius: 11, padding: '8px 10px' }}>
                  <div style={{ fontSize: 8.5, color: '#059669', fontWeight: 600 }}>Completed</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#10B981', margin: '2px 0' }}>280.0h</div>
                  <div style={{ fontSize: 8, color: '#64748B' }}>Rendered to date</div>
                </div>
                <div style={{ border: '1px solid #E2E8F0', borderRadius: 11, padding: '8px 10px' }}>
                  <div style={{ fontSize: 8.5, color: '#D97706', fontWeight: 600 }}>Remaining</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#D97706', margin: '2px 0' }}>320.0h</div>
                  <div style={{ fontSize: 8, color: '#64748B' }}>Hours left</div>
                </div>
                <div style={{ border: '1px solid #E2E8F0', borderRadius: 11, padding: '8px 10px' }}>
                  <div style={{ fontSize: 8.5, color: '#059669', fontWeight: 600 }}>Progress</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#10B981', margin: '2px 0' }}>46.7%</div>
                  <div style={{ fontSize: 8, color: '#64748B' }}>On track</div>
                </div>
              </div>

              <div style={{ border: '1px solid #E2E8F0', borderRadius: 11, padding: '10px 11px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9.5, fontWeight: 700 }}>
                  <span style={{ color: '#0F172A' }}>Overall Training Progress</span>
                  <span style={{ color: '#10B981' }}>46.7%</span>
                </div>
                <div style={{ width: '100%', height: 6, backgroundColor: '#F1F5F9', borderRadius: 999, overflow: 'hidden' }}>
                  <div style={{ width: '46.7%', height: '100%', backgroundColor: '#10B981', borderRadius: 999 }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 8, color: '#64748B' }}>
                  <span>Pace: +40h / week</span>
                  <span>Est. Completion: 8 wks</span>
                </div>
              </div>

              <div style={{ border: '1px solid #E2E8F0', borderRadius: 11, padding: '10px 11px', display: 'flex', flexDirection: 'column', gap: 3 }}>
                <div style={{ fontSize: 9.5, fontWeight: 700, color: '#0F172A' }}>Latest Activity</div>
                <div style={{ fontSize: 9, color: '#334155', fontWeight: 500 }}>
                  Frontend Component Development · +8.0 hrs
                </div>
                <div style={{ fontSize: 8, color: '#64748B' }}>
                  Nov 14, 2026 · Verified attendance
                </div>
              </div>
            </>
          )}

          {/* 2. TIME LOGS SCREEN (Matching Reference Photo 3) */}
          {feature === 'timelogs' && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 8.5, color: '#64748B' }}>Daily Session Attendance</div>
                  <div style={{ fontSize: 11.5, fontWeight: 800, color: '#0F172A' }}>Thursday, Nov 14, 2026</div>
                </div>
                <span
                  style={{
                    fontSize: 8.5,
                    fontWeight: 700,
                    color: '#059669',
                    backgroundColor: '#ECFDF5',
                    border: '1px solid #A7F3D0',
                    padding: '3px 7px',
                    borderRadius: 7,
                  }}
                >
                  8.0 hrs logged
                </span>
              </div>

              <div style={{ border: '1px solid #E2E8F0', borderRadius: 11, padding: '10px 11px', display: 'flex', flexDirection: 'column', gap: 7 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#0F172A' }}>Morning Shift</span>
                  <span style={{ fontSize: 8, fontWeight: 700, color: '#059669', backgroundColor: '#ECFDF5', padding: '2px 6px', borderRadius: 5 }}>
                    Attended (4.0 hrs)
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                  <div style={{ backgroundColor: '#F8FAFC', borderRadius: 7, padding: '6px 8px' }}>
                    <div style={{ fontSize: 7.5, color: '#64748B', fontWeight: 600 }}>TIME IN</div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#0F172A', marginTop: 1 }}>08:00 AM</div>
                  </div>
                  <div style={{ backgroundColor: '#F8FAFC', borderRadius: 7, padding: '6px 8px' }}>
                    <div style={{ fontSize: 7.5, color: '#64748B', fontWeight: 600 }}>TIME OUT</div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#0F172A', marginTop: 1 }}>12:00 PM</div>
                  </div>
                </div>
              </div>

              <div style={{ border: '1px solid #E2E8F0', borderRadius: 11, padding: '10px 11px', display: 'flex', flexDirection: 'column', gap: 7 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#0F172A' }}>Afternoon Shift</span>
                  <span style={{ fontSize: 8, fontWeight: 700, color: '#059669', backgroundColor: '#ECFDF5', padding: '2px 6px', borderRadius: 5 }}>
                    Attended (4.0 hrs)
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                  <div style={{ backgroundColor: '#F8FAFC', borderRadius: 7, padding: '6px 8px' }}>
                    <div style={{ fontSize: 7.5, color: '#64748B', fontWeight: 600 }}>TIME IN</div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#0F172A', marginTop: 1 }}>01:00 PM</div>
                  </div>
                  <div style={{ backgroundColor: '#F8FAFC', borderRadius: 7, padding: '6px 8px' }}>
                    <div style={{ fontSize: 7.5, color: '#64748B', fontWeight: 600 }}>TIME OUT</div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#0F172A', marginTop: 1 }}>05:00 PM</div>
                  </div>
                </div>
              </div>

              <div style={{ border: '1px solid #E2E8F0', borderRadius: 11, padding: '10px 11px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ fontSize: 9.5, fontWeight: 700, color: '#0F172A' }}>Daily Activities</div>
                <div style={{ fontSize: 8.5, color: '#475569', lineHeight: 1.45 }}>
                  Implemented mobile bottom navigation bar and functional daily reminder notifications.
                </div>
              </div>
            </>
          )}

          {/* 3. REPORTS SCREEN (Matching Reference Photo 4) */}
          {feature === 'reports' && (
            <>
              <div>
                <div style={{ fontSize: 8.5, color: '#64748B' }}>Reports &amp; DTTR</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#0F172A', marginTop: 1 }}>
                  Official DTTR Document
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.35fr 0.8fr 0.8fr', gap: 6 }}>
                <div style={{ backgroundColor: '#0F172A', color: '#FFFFFF', borderRadius: 8, padding: '6px 6px', fontSize: 8, fontWeight: 700, textAlign: 'center' }}>
                  Long Bond (8.5 × 13)
                </div>
                <div style={{ border: '1px solid #E2E8F0', color: '#64748B', borderRadius: 8, padding: '6px 6px', fontSize: 8, fontWeight: 600, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  A4
                </div>
                <div style={{ border: '1px solid #E2E8F0', color: '#64748B', borderRadius: 8, padding: '6px 6px', fontSize: 8, fontWeight: 600, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  Letter
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7 }}>
                <div style={{ border: '1px solid #E2E8F0', borderRadius: 11, padding: '9px 10px' }}>
                  <div style={{ fontSize: 8.5, color: '#64748B' }}>Total Days</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#0F172A', marginTop: 2 }}>35 Days</div>
                </div>
                <div style={{ border: '1px solid #E2E8F0', borderRadius: 11, padding: '9px 10px' }}>
                  <div style={{ fontSize: 8.5, color: '#64748B' }}>Rendered Hours</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#10B981', marginTop: 2 }}>280.0 hrs</div>
                </div>
              </div>

              <div style={{ border: '1px solid #E2E8F0', borderRadius: 12, padding: '12px 11px', display: 'flex', flexDirection: 'column', gap: 9 }}>
                <div style={{ textAlign: 'center', borderBottom: '1px solid #F1F5F9', paddingBottom: 8 }}>
                  <div style={{ fontSize: 9.5, fontWeight: 800, color: '#0F172A' }}>DAILY TIME &amp; TASKS RECORD</div>
                  <div style={{ fontSize: 8, color: '#64748B', marginTop: 2 }}>Official Training Verification Form</div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 8.5, color: '#475569' }}>
                  <span>Trainee: Alex Rivera</span>
                  <span>Target: 600 Hours</span>
                </div>
                <div
                  style={{
                    backgroundColor: '#000000',
                    color: '#FFFFFF',
                    borderRadius: 8,
                    padding: '8px 10px',
                    fontSize: 9.5,
                    fontWeight: 700,
                    textAlign: 'center',
                  }}
                >
                  Print / Export DTTR (PDF)
                </div>
              </div>
            </>
          )}

          {/* 4. PROFILE SCREEN */}
          {feature === 'profile' && (
            <>
              <div style={{ border: '1px solid #E2E8F0', borderRadius: 12, padding: '10px 11px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: '#0F172A', color: '#FFFFFF', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  AR
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 800, color: '#0F172A' }}>Alex Rivera</span>
                    <span style={{ fontSize: 7.5, fontWeight: 700, color: '#059669', backgroundColor: '#ECFDF5', padding: '1px 5px', borderRadius: 999 }}>
                      Active Trainee
                    </span>
                  </div>
                  <span style={{ fontSize: 8.5, color: '#64748B' }}>BS Information Technology · 2026-CS-0042</span>
                </div>
              </div>

              <div style={{ border: '1px solid #E2E8F0', borderRadius: 11, padding: '10px 11px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ fontSize: 9.5, fontWeight: 700, color: '#0F172A', borderBottom: '1px solid #F1F5F9', paddingBottom: 4 }}>
                  Academic Information
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 8.5 }}>
                  <span style={{ color: '#64748B' }}>Institution</span>
                  <span style={{ fontWeight: 600, color: '#0F172A' }}>TUP Manila</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 8.5 }}>
                  <span style={{ color: '#64748B' }}>Student ID</span>
                  <span style={{ fontWeight: 600, color: '#0F172A' }}>2026-CS-0042</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 8.5 }}>
                  <span style={{ color: '#64748B' }}>Required OJT</span>
                  <span style={{ fontWeight: 700, color: '#059669' }}>600 Hours</span>
                </div>
              </div>

              <div style={{ border: '1px solid #E2E8F0', borderRadius: 11, padding: '10px 11px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ fontSize: 9.5, fontWeight: 700, color: '#0F172A', borderBottom: '1px solid #F1F5F9', paddingBottom: 4 }}>
                  Training Establishment
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 8.5 }}>
                  <span style={{ color: '#64748B' }}>Company</span>
                  <span style={{ fontWeight: 600, color: '#0F172A' }}>NexusTech Labs Inc.</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 8.5 }}>
                  <span style={{ color: '#64748B' }}>Department</span>
                  <span style={{ fontWeight: 600, color: '#0F172A' }}>Software Engineering</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 8.5 }}>
                  <span style={{ color: '#64748B' }}>Supervisor</span>
                  <span style={{ fontWeight: 600, color: '#0F172A' }}>Engr. M. Santos</span>
                </div>
              </div>
            </>
          )}

          {/* 5. SETTINGS SCREEN */}
          {feature === 'settings' && (
            <>
              <div style={{ fontSize: 9, fontWeight: 700, color: '#64748B', letterSpacing: '0.05em' }}>PREFERENCES</div>
              <div style={{ border: '1px solid #E2E8F0', borderRadius: 12, padding: '8px 11px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 10, fontWeight: 600, color: '#0F172A' }}>Dark Mode</span>
                  <div style={{ width: 28, height: 15, borderRadius: 999, backgroundColor: '#CBD5E1', padding: 2, boxSizing: 'border-box' }}>
                    <div style={{ width: 11, height: 11, borderRadius: '50%', backgroundColor: '#FFFFFF' }} />
                  </div>
                </div>
                <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 10, fontWeight: 600, color: '#0F172A' }}>Daily Reminder</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 8.5, fontWeight: 700, color: '#059669', backgroundColor: '#ECFDF5', padding: '1px 5px', borderRadius: 5 }}>
                      5:00 PM
                    </span>
                    <div style={{ width: 28, height: 15, borderRadius: 999, backgroundColor: '#10B981', padding: 2, boxSizing: 'border-box', display: 'flex', justifyContent: 'flex-end' }}>
                      <div style={{ width: 11, height: 11, borderRadius: '50%', backgroundColor: '#FFFFFF' }} />
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ fontSize: 9, fontWeight: 700, color: '#64748B', letterSpacing: '0.05em', marginTop: 2 }}>INFO &amp; PRIVACY</div>
              <div style={{ border: '1px solid #E2E8F0', borderRadius: 12, padding: '8px 11px', display: 'flex', flexDirection: 'column', gap: 7, fontSize: 9.5, color: '#0F172A', fontWeight: 500 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Work Schedule</span><span style={{ color: '#94A3B8' }}>›</span></div>
                <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: 6, display: 'flex', justifyContent: 'space-between' }}><span>Backup &amp; Restore</span><span style={{ color: '#94A3B8' }}>›</span></div>
                <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: 6, display: 'flex', justifyContent: 'space-between' }}><span>Privacy Policy</span><span style={{ color: '#94A3B8' }}>›</span></div>
                <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: 6, display: 'flex', justifyContent: 'space-between' }}><span>About OJT Tracker</span><span style={{ color: '#94A3B8' }}>v1.2.0</span></div>
              </div>
            </>
          )}

          {/* 6. LOGIN SCREEN */}
          {feature === 'login' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <BrandLogo size={28} />
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#111111' }}>OJT Hours Tracker</div>
                  <div style={{ fontSize: 8.5, color: '#666662' }}>Every hour moves you forward.</div>
                </div>
              </div>

              <div>
                <div style={{ fontSize: 17, fontWeight: 800, color: '#111111' }}>Welcome back</div>
                <div style={{ fontSize: 9.5, color: '#666662', marginTop: 2 }}>
                  Sign in to continue tracking your OJT progress.
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontSize: 9, fontWeight: 600, color: '#171717' }}>Email Address *</span>
                <div style={{ border: '1.5px solid #D4D4D0', borderRadius: 9, padding: '9px 10px', fontSize: 10, color: '#111111' }}>
                  alex.rivera@school.edu.ph
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontSize: 9, fontWeight: 600, color: '#171717' }}>Password *</span>
                <div style={{ border: '1.5px solid #D4D4D0', borderRadius: 9, padding: '9px 10px', fontSize: 10, color: '#111111', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>••••••••••••</span>
                  <EyeIcon width={12} height={12} style={{ color: '#666662' }} />
                </div>
              </div>

              <div style={{ textAlign: 'right', fontSize: 9, fontWeight: 600, color: '#141413', textDecoration: 'underline' }}>
                Forgot Password?
              </div>

              <div style={{ backgroundColor: '#141413', color: '#FFFFFF', borderRadius: 9, padding: '10px', fontSize: 11, fontWeight: 700, textAlign: 'center' }}>
                Sign In
              </div>

              <div style={{ textAlign: 'center', fontSize: 9, color: '#666662', marginTop: 4 }}>
                Don't have an account? <span style={{ color: '#111111', fontWeight: 700, textDecoration: 'underline' }}>Create Account</span>
              </div>
            </div>
          )}

          {/* 7. REGISTER SCREEN */}
          {feature === 'register' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginTop: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <BrandLogo size={26} />
                <div>
                  <div style={{ fontSize: 11.5, fontWeight: 700, color: '#111111' }}>OJT Hours Tracker</div>
                  <div style={{ fontSize: 8, color: '#666662' }}>Every hour moves you forward.</div>
                </div>
              </div>

              <div>
                <div style={{ fontSize: 15.5, fontWeight: 800, color: '#111111' }}>Create your account</div>
                <div style={{ fontSize: 9, color: '#666662', marginTop: 1 }}>Start tracking your OJT journey.</div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ border: '1px solid #D4D4D0', borderRadius: 8, padding: '7px 9px', fontSize: 9.5, color: '#111111' }}>
                  Alex Rivera
                </div>
                <div style={{ border: '1px solid #D4D4D0', borderRadius: 8, padding: '7px 9px', fontSize: 9.5, color: '#111111' }}>
                  alex.rivera@school.edu.ph
                </div>
                <div style={{ border: '1px solid #D4D4D0', borderRadius: 8, padding: '7px 9px', fontSize: 9.5, color: '#9A9A96', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Enter your student ID</span>
                  <span style={{ fontSize: 8, backgroundColor: '#F2F2EF', color: '#737373', padding: '0 5px', borderRadius: 999 }}>Optional</span>
                </div>
                <div style={{ border: '1px solid #16A34A', borderRadius: 8, padding: '7px 9px', fontSize: 9.5, color: '#111111' }}>
                  ••••••••••
                </div>
              </div>

              <div style={{ backgroundColor: '#F6F6F3', border: '1px solid #E5E5E0', borderRadius: 8, padding: '6px 8px', display: 'flex', flexDirection: 'column', gap: 3, fontSize: 8, color: '#15803D', fontWeight: 600 }}>
                <div>✓ At least 8 characters</div>
                <div>✓ Contains at least one letter</div>
                <div>✓ Contains at least one number</div>
              </div>

              <div style={{ backgroundColor: '#141413', color: '#FFFFFF', borderRadius: 9, padding: '9px', fontSize: 10.5, fontWeight: 700, textAlign: 'center' }}>
                Create Account
              </div>
            </div>
          )}
        </div>

        {/* BOTTOM NAVIGATION OR AUTH HOME BAR */}
        {isAuthScreen ? (
          <div style={{ padding: '6px 0 8px 0' }}>
            <div style={{ width: 72, height: 3, borderRadius: 999, backgroundColor: '#0F172A', margin: '0 auto' }} />
          </div>
        ) : (
          <PhoneBottomNav activeTab={feature} />
        )}
      </div>
    </div>
  );
}

/**
 * MobileDeviceShowcase - Mobbin-inspired diagonal 3-column Infinite Vertical Marquee
 * extending seamlessly edge-to-edge through all corners of the left showcase panel.
 */
export function MobileDeviceShowcase() {
  return (
    <div className="ojt-showcase-stage" aria-hidden="true">
      {/* COLUMN A — Moves Upward */}
      <div className="ojt-marquee-col ojt-marquee-col-a" data-marquee-col="A">
        <div className="ojt-marquee-track ojt-marquee-track-up">
          <div className="ojt-marquee-group" data-marquee-set="primary">
            {COLUMN_A_FEATURES.map((feat) => (
              <FeaturePhoneCard key={`col-a-1-${feat}`} feature={feat} />
            ))}
          </div>
          <div className="ojt-marquee-group" data-marquee-set="clone" aria-hidden="true">
            {COLUMN_A_FEATURES.map((feat) => (
              <FeaturePhoneCard key={`col-a-2-${feat}`} feature={feat} />
            ))}
          </div>
        </div>
      </div>

      {/* COLUMN B — Moves Downward */}
      <div className="ojt-marquee-col ojt-marquee-col-b" data-marquee-col="B">
        <div className="ojt-marquee-track ojt-marquee-track-down">
          <div className="ojt-marquee-group" data-marquee-set="primary">
            {COLUMN_B_FEATURES.map((feat) => (
              <FeaturePhoneCard key={`col-b-1-${feat}`} feature={feat} />
            ))}
          </div>
          <div className="ojt-marquee-group" data-marquee-set="clone" aria-hidden="true">
            {COLUMN_B_FEATURES.map((feat) => (
              <FeaturePhoneCard key={`col-b-2-${feat}`} feature={feat} />
            ))}
          </div>
        </div>
      </div>

      {/* COLUMN C — Moves Upward (fills top-right / bottom-right corners diagonally) */}
      <div className="ojt-marquee-col ojt-marquee-col-c" data-marquee-col="C">
        <div className="ojt-marquee-track ojt-marquee-track-up-slow">
          <div className="ojt-marquee-group" data-marquee-set="primary">
            {COLUMN_C_FEATURES.map((feat) => (
              <FeaturePhoneCard key={`col-c-1-${feat}`} feature={feat} />
            ))}
          </div>
          <div className="ojt-marquee-group" data-marquee-set="clone" aria-hidden="true">
            {COLUMN_C_FEATURES.map((feat) => (
              <FeaturePhoneCard key={`col-c-2-${feat}`} feature={feat} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * AuthSplitLayout - Split-screen authentication layout:
 * - LEFT SIDE (Desktop & Tablet): Angled corner-to-corner Infinite Vertical Marquee of OJT Hours Tracker screens.
 * - RIGHT SIDE: Application logo, application name, tagline ("Every hour moves you forward."), and authentication form.
 */
export function AuthSplitLayout({ onNavigate, children }) {
  return (
    <div className="ojt-auth-split-shell">
      {/* LEFT PANEL — ANGLED INFINITE VERTICAL MARQUEE SHOWCASE */}
      <aside className="ojt-auth-brand-panel" aria-label="OJT Hours Tracker Feature Showcase">
        <div className="ojt-auth-brand-decor" aria-hidden="true">
          <div className="ojt-auth-brand-orb-1" />
        </div>

        <MobileDeviceShowcase />
      </aside>

      {/* RIGHT PANEL — BRANDING AND AUTHENTICATION FORM */}
      <div className="ojt-auth-form-panel">
        {/* Top Navigation Row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          <button
            type="button"
            onClick={() => onNavigate?.('landing')}
            style={{
              background: 'none',
              border: '1px solid #E5E5E0',
              borderRadius: 8,
              padding: '6px 12px',
              fontSize: 13,
              fontWeight: 600,
              color: '#171717',
              cursor: 'pointer',
            }}
          >
            ← Back to Home
          </button>
        </div>

        {/* Centered Branding + Authentication Form Area */}
        <main className="ojt-auth-form-center">
          <div className="ojt-auth-form-container">
            {/* RIGHT SIDE BRANDING HEADER (Logo, Application Name, Tagline above form) */}
            <div className="ojt-auth-right-brand-header">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 11,
                  cursor: 'pointer',
                  width: 'fit-content',
                }}
                onClick={() => onNavigate?.('landing')}
              >
                <BrandLogo size={36} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <span
                    style={{
                      fontSize: 17,
                      fontWeight: 700,
                      letterSpacing: '-0.02em',
                      color: '#111111',
                      lineHeight: 1.2,
                    }}
                  >
                    OJT Hours Tracker
                  </span>
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: '#666662',
                      lineHeight: 1.35,
                    }}
                  >
                    Every hour moves you forward.
                  </span>
                </div>
              </div>
            </div>

            {children}
          </div>
        </main>

        {/* Subtle Bottom Copyright */}
        <footer
          style={{
            textAlign: 'center',
            fontSize: 12,
            color: '#8E8E8A',
            paddingTop: 8,
          }}
        >
          © {CURRENT_YEAR} OJT Hours Tracker · Student Internship Portal
        </footer>
      </div>
    </div>
  );
}

/**
 * Reusable accessible text/email input for authentication forms.
 * 54px height, 16px font-size, 12px border-radius, label positioned above.
 * Supports an optional badge (e.g. optionalLabel="Optional") beside the label.
 */
export function AuthInput({
  label,
  optionalLabel,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  autoComplete,
  error,
  disabled = false,
  name,
  id: providedId,
}) {
  const generatedId = useId();
  const inputId = providedId || generatedId;
  const errorId = `${inputId}-error`;

  return (
    <div className="ojt-auth-field">
      <div className="ojt-auth-label-row">
        <label htmlFor={inputId} className="ojt-auth-label">
          <span>{label}</span>
          {required && (
            <span className="ojt-auth-required-mark" aria-hidden="true">
              *
            </span>
          )}
        </label>
        {optionalLabel && (
          <span className="ojt-auth-optional-badge">{optionalLabel}</span>
        )}
      </div>

      <div className="ojt-auth-input-wrap">
        <input
          id={inputId}
          name={name}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className={`ojt-auth-input${error ? ' is-error' : ''}`}
        />
      </div>

      {error && (
        <div id={errorId} role="alert" className="ojt-auth-feedback is-error">
          <AlertCircleIcon width={15} height={15} style={{ flexShrink: 0 }} aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

/**
 * Reusable accessible password input with vertically centered visibility toggle.
 * Supports error feedback and optional success match indicator.
 */
export function AuthPasswordInput({
  label,
  value,
  onChange,
  showPassword,
  onToggleShow,
  placeholder,
  required = false,
  autoComplete,
  error,
  successMessage,
  disabled = false,
  name,
  id: providedId,
}) {
  const generatedId = useId();
  const inputId = providedId || generatedId;
  const feedbackId = `${inputId}-feedback`;
  const hasFeedback = Boolean(error || successMessage);

  const stateClass = error ? ' is-error' : successMessage ? ' is-valid' : '';

  return (
    <div className="ojt-auth-field">
      <div className="ojt-auth-label-row">
        <label htmlFor={inputId} className="ojt-auth-label">
          <span>{label}</span>
          {required && (
            <span className="ojt-auth-required-mark" aria-hidden="true">
              *
            </span>
          )}
        </label>
      </div>

      <div className="ojt-auth-input-wrap">
        <input
          id={inputId}
          name={name}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={hasFeedback ? feedbackId : undefined}
          className={`ojt-auth-input has-toggle${stateClass}`}
        />

        <button
          type="button"
          onClick={onToggleShow}
          aria-label={showPassword ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
          aria-pressed={showPassword}
          disabled={disabled}
          className="ojt-auth-toggle-btn"
        >
          {showPassword ? (
            <EyeOffIcon width={20} height={20} aria-hidden="true" />
          ) : (
            <EyeIcon width={20} height={20} aria-hidden="true" />
          )}
        </button>
      </div>

      {error && (
        <div id={feedbackId} role="alert" className="ojt-auth-feedback is-error">
          <AlertCircleIcon width={15} height={15} style={{ flexShrink: 0 }} aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      {!error && successMessage && (
        <div id={feedbackId} className="ojt-auth-feedback is-success">
          <CheckCircleIcon width={15} height={15} style={{ flexShrink: 0 }} aria-hidden="true" />
          <span>{successMessage}</span>
        </div>
      )}
    </div>
  );
}

/**
 * Shared password validation rules matching backend and frontend requirements.
 */
export function evaluatePasswordRequirements(password = '') {
  const hasMinLength = password.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const allMet = hasMinLength && hasLetter && hasNumber;

  return {
    hasMinLength,
    hasLetter,
    hasNumber,
    allMet,
  };
}

/**
 * Real-time interactive password requirements indicator for Register page.
 * Initially shows neutral gray indicators; displays green checkmark as requirements are met.
 */
export function PasswordRequirements({ password = '' }) {
  const { hasMinLength, hasLetter, hasNumber, allMet } = evaluatePasswordRequirements(password);

  const items = [
    { key: 'length', label: 'At least 8 characters', met: hasMinLength },
    { key: 'letter', label: 'Contains at least one letter', met: hasLetter },
    { key: 'number', label: 'Contains at least one number', met: hasNumber },
  ];

  return (
    <div
      className={`ojt-auth-req-box${allMet ? ' is-all-met' : ''}`}
      aria-live="polite"
    >
      <div
        style={{
          fontSize: 12.5,
          fontWeight: 600,
          color: '#3F3F3C',
        }}
      >
        Password requirements
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {items.map((item) => (
          <div
            key={item.key}
            className={`ojt-auth-req-item${item.met ? ' is-met' : ''}`}
          >
            {item.met ? (
              <CheckCircleIcon
                width={16}
                height={16}
                style={{ color: '#16A34A', flexShrink: 0 }}
                aria-hidden="true"
              />
            ) : (
              <CircleIcon
                width={16}
                height={16}
                style={{ color: '#8E8E8A', flexShrink: 0 }}
                aria-hidden="true"
              />
            )}
            <span>{item.label}</span>
          </div>
        ))}
      </div>

      {allMet && (
        <div
          className="ojt-auth-feedback is-success"
          style={{
            marginTop: 4,
            paddingTop: 6,
            borderTop: '1px solid rgba(22, 163, 74, 0.2)',
          }}
        >
          <CheckCircleIcon width={15} height={15} style={{ flexShrink: 0 }} aria-hidden="true" />
          <span>Password meets all requirements.</span>
        </div>
      )}
    </div>
  );
}
