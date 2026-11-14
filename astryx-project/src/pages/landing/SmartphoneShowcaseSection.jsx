import React, { useState } from 'react';
import { Section } from '@astryxdesign/core/Section';
import {
  LayoutDashboardIcon,
  ClockIcon,
  FileTextIcon,
  UserRoundIcon,
  SettingsIcon,
  CheckCircleIcon,
  SparklesIcon,
  BellIcon,
} from '../../components/common/BrandIcons';
import { UserAvatar, DEFAULT_STUDENT_AVATAR } from '../../components/common/UserAvatar';

const TABS = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    Icon: LayoutDashboardIcon,
    tagline: 'Real-Time Progress & Pace',
    title: 'Monitor Hours & Milestones at a Glance',
    description:
      'Stay on top of your degree requirement. See your total rendered hours, remaining time countdown, and overall completion percentage with zero guesswork.',
    highlights: ['600-hour progress tracker', 'Weekly rendering pace monitor', 'Milestone badges (25%, 50%, 75%, 100%)'],
  },
  {
    id: 'timelogs',
    label: 'Time Logs',
    Icon: ClockIcon,
    tagline: 'Dual-Session Time Logger',
    title: 'Accurate Morning & Afternoon Attendance',
    description:
      'Record your official arrival and departure timestamps with smooth iOS-style time pickers. Lunch hours and break intervals are separated automatically.',
    highlights: ['Independent morning & afternoon shifts', 'Automatic lunch break exclusion', 'Instant duration calculation (+8.0 hrs)'],
  },
  {
    id: 'reports',
    label: 'Reports',
    Icon: FileTextIcon,
    tagline: 'Official Document Generator',
    title: 'Generate Print-Ready DTTRs in Any Bond Format',
    description:
      'Export formatted Daily Time and Task Records ready for printing, official review, supervisor signatures, and submission in any required bond paper size.',
    highlights: ['Standard trainee attendance table', 'Supervisor certification block', 'Download or save directly as PDF'],
  },
  {
    id: 'profile',
    label: 'Profile',
    Icon: UserRoundIcon,
    tagline: 'Student Trainee Dossier',
    title: 'Manage Academic Placement & Company Records',
    description:
      'Maintain your verified internship credentials: academic program, student ID, host training establishment, supervisor details, and training period.',
    highlights: ['Verified student ID & curriculum data', 'Host company placement details', 'Immediate supervisor contact block'],
  },
  {
    id: 'settings',
    label: 'Settings',
    Icon: SettingsIcon,
    tagline: 'Reminders & Preferences',
    title: 'Automate Reminders & Tailor Requirements',
    description:
      'Enable scheduled daily alerts at 5:00 PM to record your hours, customize required hours target, and download complete offline JSON archives.',
    highlights: ['Active 5:00 PM shift reminder switch', 'Target hours customizer (50–1200h)', 'Offline data backup and PWA installation'],
  },
];

export function SmartphoneShowcaseSection() {
  const [activeTabId, setActiveTabId] = useState('dashboard');
  const [isMorningAttended, setIsMorningAttended] = useState(true);
  const [isAfternoonAttended, setIsAfternoonAttended] = useState(true);
  const [printFeedback, setPrintFeedback] = useState(false);
  const [reminderDemoActive, setReminderDemoActive] = useState(true);

  const activeTab = TABS.find((t) => t.id === activeTabId) || TABS[0];

  const handleSimulateDownload = () => {
    setPrintFeedback(true);
    setTimeout(() => setPrintFeedback(false), 2500);
  };

  return (
    <Section
      id="product-preview"
      variant="transparent"
      style={{
        paddingTop: 'clamp(48px, 6vw, 84px)',
        paddingBottom: 'clamp(48px, 6vw, 84px)',
        backgroundColor: '#FCFCFB',
        borderTop: '1px solid #e5e7eb',
        borderBottom: '1px solid #e5e7eb',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      <div className="ojt-landing-container">
        {/* Section Header */}
        <div
          className="ojt-reveal-on-scroll"
          style={{
            maxWidth: 720,
            margin: '0 auto clamp(32px, 4vw, 48px) auto',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <div className="ojt-badge-pill">
            <SparklesIcon style={{ width: 14, height: 14, color: '#10b981' }} />
            <span>Interactive Mobile Showcase</span>
          </div>

          <h2 className="ojt-section-headline" style={{ color: '#142b49' }}>
            Experience the Tracker on Mobile
          </h2>

          <p className="ojt-lead-text">
            Designed as an installable Progressive Web App with fixed bottom navigation.
            Tap any feature below or tap the icons inside the phone to preview the actual mobile screens.
          </p>
        </div>

        {/* 2-Column Responsive Layout */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            alignItems: 'center',
            gap: 'clamp(28px, 4vw, 56px)',
          }}
        >
          {/* Left Column: Interactive Feature Selector & Deep Dive */}
          <div
            className="ojt-reveal-on-scroll"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 18,
            }}
          >
            {/* Tab Pill Buttons */}
            <div
              style={{
                display: 'flex',
                gap: 6,
                flexWrap: 'wrap',
                backgroundColor: '#f1f5f9',
                padding: 6,
                borderRadius: 14,
                width: 'fit-content',
                maxWidth: '100%',
              }}
            >
              {TABS.map(({ id, label, Icon: IconComponent }) => {
                const isSelected = activeTabId === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setActiveTabId(id)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '7px 13px',
                      borderRadius: 10,
                      border: 'none',
                      backgroundColor: isSelected ? '#ffffff' : 'transparent',
                      color: isSelected ? '#142b49' : '#64748b',
                      fontWeight: isSelected ? 700 : 500,
                      fontSize: '0.825rem',
                      cursor: 'pointer',
                      boxShadow: isSelected ? '0 2px 8px rgba(20, 43, 73, 0.08)' : 'none',
                      transition: 'all 0.15s ease',
                      WebkitTapHighlightColor: 'transparent',
                    }}
                  >
                    <IconComponent
                      style={{
                        width: 15,
                        height: 15,
                        color: isSelected ? '#10b981' : '#64748b',
                      }}
                    />
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>

            {/* Active Feature Detail Card */}
            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: 16,
                padding: 'clamp(20px, 3.5vw, 32px)',
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
                boxShadow: '0 4px 16px -2px rgba(20, 43, 73, 0.04)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span
                  style={{
                    fontSize: '0.725rem',
                    fontWeight: 700,
                    color: '#059669',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                  }}
                >
                  {activeTab.tagline}
                </span>
              </div>

              <h3
                style={{
                  margin: 0,
                  fontSize: 'clamp(1.25rem, 2.2vw, 1.65rem)',
                  fontWeight: 800,
                  color: '#142b49',
                  lineHeight: 1.25,
                }}
              >
                {activeTab.title}
              </h3>

              <p
                style={{
                  margin: 0,
                  fontSize: '0.925rem',
                  lineHeight: 1.6,
                  color: '#64748b',
                }}
              >
                {activeTab.description}
              </p>

              {/* Bullet points */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  paddingTop: 12,
                  borderTop: '1px solid #f1f5f9',
                }}
              >
                {activeTab.highlights.map((item) => (
                  <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: '50%',
                        backgroundColor: 'rgba(16, 185, 129, 0.12)',
                        color: '#059669',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <CheckCircleIcon style={{ width: 13, height: 13 }} />
                    </div>
                    <span style={{ fontSize: '0.875rem', color: '#142b49', fontWeight: 600 }}>
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Realistic Smartphone Showcase Frame */}
          <div
            className="ojt-reveal-on-scroll ojt-delay-100"
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              width: '100%',
            }}
          >
            {/* Phone Chassis */}
            <div
              style={{
                width: '100%',
                maxWidth: 330,
                height: 650,
                backgroundColor: '#0f172a',
                borderRadius: 44,
                padding: 10,
                boxShadow:
                  '0 25px 60px -15px rgba(20, 43, 73, 0.28), 0 0 0 1px rgba(255, 255, 255, 0.15) inset, 0 10px 20px rgba(0, 0, 0, 0.12)',
                position: 'relative',
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Top Dynamic Island Notch */}
              <div
                style={{
                  position: 'absolute',
                  top: 18,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 96,
                  height: 22,
                  backgroundColor: '#000000',
                  borderRadius: 14,
                  zIndex: 40,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  paddingRight: 10,
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                  }}
                />
              </div>

              {/* Inner Phone Screen */}
              <div
                style={{
                  flex: 1,
                  backgroundColor: '#FCFCFB',
                  borderRadius: 36,
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                }}
              >
                {/* iOS Status Bar */}
                <div
                  style={{
                    height: 38,
                    padding: '8px 20px 0 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: '#142b49',
                    backgroundColor: '#ffffff',
                    borderBottom: '1px solid #f1f5f9',
                    zIndex: 20,
                  }}
                >
                  <span>9:41</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 1.5, height: 10 }}>
                      <div style={{ width: 2, height: 4, backgroundColor: '#142b49', borderRadius: 0.5 }} />
                      <div style={{ width: 2, height: 6, backgroundColor: '#142b49', borderRadius: 0.5 }} />
                      <div style={{ width: 2, height: 8, backgroundColor: '#142b49', borderRadius: 0.5 }} />
                      <div style={{ width: 2, height: 10, backgroundColor: '#142b49', borderRadius: 0.5 }} />
                    </div>
                    <div
                      style={{
                        width: 18,
                        height: 9,
                        borderRadius: 3,
                        border: '1.2px solid #142b49',
                        padding: 1,
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <div style={{ width: 11, height: 5, backgroundColor: '#10b981', borderRadius: 1 }} />
                    </div>
                  </div>
                </div>

                {/* In-App Header */}
                <div
                  style={{
                    padding: '8px 12px',
                    backgroundColor: '#ffffff',
                    borderBottom: '1px solid #e5e7eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <UserAvatar src={DEFAULT_STUDENT_AVATAR} size={28} alt="Student Trainee" />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#142b49', lineHeight: 1.1 }}>
                        {activeTab.label}
                      </span>
                      <span style={{ fontSize: '0.62rem', color: '#059669', fontWeight: 600 }}>
                        Student Portal
                      </span>
                    </div>
                  </div>

                  <span
                    style={{
                      fontSize: '0.62rem',
                      fontWeight: 700,
                      color: '#059669',
                      backgroundColor: 'rgba(16, 185, 129, 0.1)',
                      padding: '2px 8px',
                      borderRadius: 9999,
                    }}
                  >
                    PWA Active
                  </span>
                </div>

                {/* Phone Screen Body */}
                <div
                  style={{
                    flex: 1,
                    padding: 12,
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                    fontSize: '0.8rem',
                    backgroundColor: '#FCFCFB',
                  }}
                >
                  {/* SCREEN 1: DASHBOARD */}
                  {activeTabId === 'dashboard' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Welcome back,</div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#142b49' }}>
                          Alex Rivera 👋
                        </div>
                      </div>

                      {/* 4 Summary Cards Grid */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        <div
                          style={{
                            backgroundColor: '#ffffff',
                            borderRadius: 10,
                            padding: '10px 8px',
                            border: '1px solid #e5e7eb',
                            boxShadow: '0 1px 4px rgba(20,43,73,0.03)',
                          }}
                        >
                          <div style={{ fontSize: '0.62rem', color: '#64748b', fontWeight: 600 }}>Required</div>
                          <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#142b49' }}>600h</div>
                          <div style={{ fontSize: '0.6rem', color: '#94a3b8' }}>Total mandated</div>
                        </div>

                        <div
                          style={{
                            backgroundColor: '#ffffff',
                            borderRadius: 10,
                            padding: '10px 8px',
                            border: '1px solid #e5e7eb',
                            boxShadow: '0 1px 4px rgba(20,43,73,0.03)',
                          }}
                        >
                          <div style={{ fontSize: '0.62rem', color: '#059669', fontWeight: 600 }}>Completed</div>
                          <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#059669' }}>280.0h</div>
                          <div style={{ fontSize: '0.6rem', color: '#94a3b8' }}>Rendered to date</div>
                        </div>

                        <div
                          style={{
                            backgroundColor: '#ffffff',
                            borderRadius: 10,
                            padding: '10px 8px',
                            border: '1px solid #e5e7eb',
                            boxShadow: '0 1px 4px rgba(20,43,73,0.03)',
                          }}
                        >
                          <div style={{ fontSize: '0.62rem', color: '#d97706', fontWeight: 600 }}>Remaining</div>
                          <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#d97706' }}>320.0h</div>
                          <div style={{ fontSize: '0.6rem', color: '#94a3b8' }}>Hours left</div>
                        </div>

                        <div
                          style={{
                            backgroundColor: '#ffffff',
                            borderRadius: 10,
                            padding: '10px 8px',
                            border: '1px solid #e5e7eb',
                            boxShadow: '0 1px 4px rgba(20,43,73,0.03)',
                          }}
                        >
                          <div style={{ fontSize: '0.62rem', color: '#10b981', fontWeight: 600 }}>Progress</div>
                          <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#10b981' }}>46.7%</div>
                          <div style={{ fontSize: '0.6rem', color: '#94a3b8' }}>On track</div>
                        </div>
                      </div>

                      {/* Progress Bar Card */}
                      <div
                        style={{
                          backgroundColor: '#ffffff',
                          borderRadius: 12,
                          padding: 10,
                          border: '1px solid #e5e7eb',
                          boxShadow: '0 1px 4px rgba(20,43,73,0.03)',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem' }}>
                          <span style={{ fontWeight: 700, color: '#142b49' }}>Overall Training Progress</span>
                          <span style={{ fontWeight: 800, color: '#059669' }}>46.7%</span>
                        </div>
                        <div style={{ width: '100%', height: 7, backgroundColor: '#f1f5f9', borderRadius: 9999, overflow: 'hidden', marginTop: 8 }}>
                          <div style={{ width: '46.7%', height: '100%', backgroundColor: '#10b981', borderRadius: 9999 }} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.62rem', color: '#64748b', marginTop: 6 }}>
                          <span>Pace: +40h / week</span>
                          <span>Est. Completion: 8 wks</span>
                        </div>
                      </div>

                      {/* Recent Log Snapshot */}
                      <div
                        style={{
                          backgroundColor: '#ffffff',
                          borderRadius: 10,
                          padding: 10,
                          border: '1px solid #e5e7eb',
                        }}
                      >
                        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#142b49', marginBottom: 4 }}>
                          Latest Activity
                        </div>
                        <div style={{ fontSize: '0.68rem', color: '#334155' }}>
                          Frontend Component Development &bull; +8.0 hrs
                        </div>
                        <div style={{ fontSize: '0.6rem', color: '#94a3b8' }}>
                          Nov 14, 2026 &bull; Verified attendance
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SCREEN 2: TIME LOGS */}
                  {activeTabId === 'timelogs' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Daily Session Attendance</div>
                          <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#142b49' }}>
                            Thursday, Nov 14, 2026
                          </div>
                        </div>
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            color: '#059669',
                            backgroundColor: '#ecfdf5',
                            padding: '3px 8px',
                            borderRadius: 6,
                            border: '1px solid #a7f3d0',
                          }}
                        >
                          8.0 hrs logged
                        </span>
                      </div>

                      {/* Morning Session */}
                      <div
                        style={{
                          backgroundColor: '#ffffff',
                          borderRadius: 10,
                          padding: 10,
                          border: '1px solid #e5e7eb',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 6,
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.75rem', color: '#142b49' }}>
                            Morning Shift
                          </span>
                          <span
                            onClick={() => setIsMorningAttended(!isMorningAttended)}
                            style={{
                              fontSize: '0.62rem',
                              fontWeight: 700,
                              color: isMorningAttended ? '#059669' : '#dc2626',
                              backgroundColor: isMorningAttended ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                              padding: '2px 6px',
                              borderRadius: 4,
                              cursor: 'pointer',
                            }}
                          >
                            {isMorningAttended ? 'Attended (4.0 hrs)' : 'Absent (0 hrs)'}
                          </span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, fontSize: '0.7rem' }}>
                          <div style={{ backgroundColor: '#f8fafc', padding: '6px 8px', borderRadius: 6 }}>
                            <div style={{ fontSize: '0.58rem', color: '#64748b' }}>TIME IN</div>
                            <div style={{ fontWeight: 700, color: '#142b49' }}>08:00 AM</div>
                          </div>
                          <div style={{ backgroundColor: '#f8fafc', padding: '6px 8px', borderRadius: 6 }}>
                            <div style={{ fontSize: '0.58rem', color: '#64748b' }}>TIME OUT</div>
                            <div style={{ fontWeight: 700, color: '#142b49' }}>12:00 PM</div>
                          </div>
                        </div>
                      </div>

                      {/* Afternoon Session */}
                      <div
                        style={{
                          backgroundColor: '#ffffff',
                          borderRadius: 10,
                          padding: 10,
                          border: '1px solid #e5e7eb',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 6,
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.75rem', color: '#142b49' }}>
                            Afternoon Shift
                          </span>
                          <span
                            onClick={() => setIsAfternoonAttended(!isAfternoonAttended)}
                            style={{
                              fontSize: '0.62rem',
                              fontWeight: 700,
                              color: isAfternoonAttended ? '#059669' : '#dc2626',
                              backgroundColor: isAfternoonAttended ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                              padding: '2px 6px',
                              borderRadius: 4,
                              cursor: 'pointer',
                            }}
                          >
                            {isAfternoonAttended ? 'Attended (4.0 hrs)' : 'Absent (0 hrs)'}
                          </span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, fontSize: '0.7rem' }}>
                          <div style={{ backgroundColor: '#f8fafc', padding: '6px 8px', borderRadius: 6 }}>
                            <div style={{ fontSize: '0.58rem', color: '#64748b' }}>TIME IN</div>
                            <div style={{ fontWeight: 700, color: '#142b49' }}>01:00 PM</div>
                          </div>
                          <div style={{ backgroundColor: '#f8fafc', padding: '6px 8px', borderRadius: 6 }}>
                            <div style={{ fontSize: '0.58rem', color: '#64748b' }}>TIME OUT</div>
                            <div style={{ fontWeight: 700, color: '#142b49' }}>05:00 PM</div>
                          </div>
                        </div>
                      </div>

                      {/* Daily Activity Input */}
                      <div
                        style={{
                          backgroundColor: '#ffffff',
                          borderRadius: 10,
                          padding: 8,
                          border: '1px solid #e5e7eb',
                          fontSize: '0.68rem',
                        }}
                      >
                        <div style={{ fontWeight: 700, color: '#142b49', marginBottom: 2 }}>Daily Activities</div>
                        <div style={{ color: '#475569', lineHeight: 1.3 }}>
                          Implemented mobile bottom navigation bar and functional daily reminder notifications.
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SCREEN 3: REPORTS */}
                  {activeTabId === 'reports' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Reports & DTTR</div>
                          <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#142b49' }}>
                            Official DTTR Document
                          </div>
                        </div>
                      </div>

                      {/* Format Selector */}
                      <div style={{ display: 'flex', gap: 4 }}>
                        {['Long Bond (8.5 × 13)', 'A4', 'Letter'].map((fmt, i) => (
                          <div
                            key={fmt}
                            style={{
                              flex: 1,
                              padding: '4px 2px',
                              textAlign: 'center',
                              borderRadius: 6,
                              fontSize: '0.58rem',
                              fontWeight: i === 0 ? 700 : 500,
                              backgroundColor: i === 0 ? '#142b49' : '#ffffff',
                              color: i === 0 ? '#ffffff' : '#64748b',
                              border: '1px solid #e5e7eb',
                            }}
                          >
                            {fmt}
                          </div>
                        ))}
                      </div>

                      {/* Summary Metrics */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                        <div style={{ backgroundColor: '#ffffff', padding: 8, borderRadius: 8, border: '1px solid #e5e7eb' }}>
                          <div style={{ fontSize: '0.6rem', color: '#64748b' }}>Total Days</div>
                          <div style={{ fontSize: '1rem', fontWeight: 800, color: '#142b49' }}>35 Days</div>
                        </div>
                        <div style={{ backgroundColor: '#ffffff', padding: 8, borderRadius: 8, border: '1px solid #e5e7eb' }}>
                          <div style={{ fontSize: '0.6rem', color: '#64748b' }}>Rendered Hours</div>
                          <div style={{ fontSize: '1rem', fontWeight: 800, color: '#059669' }}>280.0 hrs</div>
                        </div>
                      </div>

                      {/* Official DTTR Document Preview */}
                      <div
                        style={{
                          backgroundColor: '#ffffff',
                          borderRadius: 8,
                          padding: 10,
                          border: '1px solid #cbd5e1',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 6,
                        }}
                      >
                        <div style={{ textAlign: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: 6 }}>
                          <div style={{ fontSize: '0.62rem', fontWeight: 800, color: '#142b49', textTransform: 'uppercase' }}>
                            Daily Time & Tasks Record
                          </div>
                          <div style={{ fontSize: '0.55rem', color: '#64748b' }}>
                            Official Training Verification Form
                          </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.58rem', color: '#475569' }}>
                          <span>Trainee: Alex Rivera</span>
                          <span>Target: 600 Hours</span>
                        </div>

                        <button
                          type="button"
                          onClick={handleSimulateDownload}
                          style={{
                            width: '100%',
                            padding: '7px 0',
                            borderRadius: 6,
                            backgroundColor: printFeedback ? '#059669' : '#000000',
                            color: '#ffffff',
                            fontWeight: 700,
                            fontSize: '0.68rem',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 6,
                            transition: 'background-color 0.2s ease',
                          }}
                        >
                          <FileTextIcon style={{ width: 12, height: 12 }} />
                          <span>{printFeedback ? 'PDF Generated!' : 'Print / Export DTTR (PDF)'}</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* SCREEN 4: PROFILE */}
                  {activeTabId === 'profile' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Student Dossier</div>

                      {/* Student Card */}
                      <div
                        style={{
                          backgroundColor: '#ffffff',
                          borderRadius: 12,
                          padding: 12,
                          border: '1px solid #e5e7eb',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                        }}
                      >
                        <UserAvatar src={DEFAULT_STUDENT_AVATAR} size={42} alt="Alex Rivera" />
                        <div>
                          <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#142b49' }}>
                            Alex Rivera
                          </div>
                          <div style={{ fontSize: '0.65rem', color: '#059669', fontWeight: 600 }}>
                            Software Engineering Intern
                          </div>
                          <div style={{ fontSize: '0.6rem', color: '#64748b' }}>
                            Tech Innovators Lab
                          </div>
                        </div>
                      </div>

                      {/* Detail Fields */}
                      <div
                        style={{
                          backgroundColor: '#ffffff',
                          borderRadius: 10,
                          padding: 10,
                          border: '1px solid #e5e7eb',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 8,
                          fontSize: '0.68rem',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: 4 }}>
                          <span style={{ color: '#64748b' }}>Student ID:</span>
                          <span style={{ fontWeight: 700, color: '#142b49' }}>2023-10492</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: 4 }}>
                          <span style={{ color: '#64748b' }}>Degree Program:</span>
                          <span style={{ fontWeight: 700, color: '#142b49' }}>BS Computer Science</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: 4 }}>
                          <span style={{ color: '#64748b' }}>Supervisor:</span>
                          <span style={{ fontWeight: 700, color: '#142b49' }}>Engr. Melissa Santos</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#64748b' }}>Status:</span>
                          <span style={{ fontWeight: 700, color: '#059669' }}>Active &bull; In Good Standing</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SCREEN 5: SETTINGS */}
                  {activeTabId === 'settings' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div style={{ fontSize: '0.68rem', color: '#64748b' }}>App Preferences</div>

                      {/* Working Reminders & Notifications Feature */}
                      <div
                        style={{
                          backgroundColor: '#ffffff',
                          borderRadius: 10,
                          padding: 10,
                          border: '1px solid #e5e7eb',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 8,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <BellIcon style={{ width: 14, height: 14, color: '#10b981' }} />
                            <span style={{ fontWeight: 700, fontSize: '0.72rem', color: '#142b49' }}>
                              Daily OJT Reminder
                            </span>
                          </div>
                          <span
                            onClick={() => setReminderDemoActive(!reminderDemoActive)}
                            style={{
                              width: 32,
                              height: 18,
                              borderRadius: 18,
                              backgroundColor: reminderDemoActive ? '#10b981' : '#cbd5e1',
                              position: 'relative',
                              cursor: 'pointer',
                              display: 'inline-block',
                            }}
                          >
                            <span
                              style={{
                                width: 14,
                                height: 14,
                                borderRadius: '50%',
                                backgroundColor: '#ffffff',
                                position: 'absolute',
                                top: 2,
                                left: reminderDemoActive ? 16 : 2,
                                transition: 'left 0.15s ease',
                              }}
                            />
                          </span>
                        </div>

                        <div style={{ fontSize: '0.62rem', color: '#64748b', lineHeight: 1.3 }}>
                          Receive an automatic prompt at shift end to record your hours.
                        </div>

                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            backgroundColor: '#FCFCFB',
                            padding: '6px 8px',
                            borderRadius: 6,
                            border: '1px solid #e5e7eb',
                            fontSize: '0.65rem',
                          }}
                        >
                          <span style={{ color: '#64748b' }}>Reminder Time:</span>
                          <span style={{ fontWeight: 700, color: '#10b981' }}>5:00 PM</span>
                        </div>

                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            fontSize: '0.58rem',
                            color: '#059669',
                            fontWeight: 600,
                          }}
                        >
                          <CheckCircleIcon style={{ width: 11, height: 11 }} />
                          <span>Notification active & scheduled</span>
                        </div>
                      </div>

                      {/* Training Target */}
                      <div
                        style={{
                          backgroundColor: '#ffffff',
                          borderRadius: 10,
                          padding: 10,
                          border: '1px solid #e5e7eb',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#142b49' }}>Target Hours</div>
                          <div style={{ fontSize: '0.6rem', color: '#64748b' }}>Curriculum requirement</div>
                        </div>
                        <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#142b49' }}>600 hrs</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Smartphone Fixed 5-Item Bottom App Navigation Bar */}
                <div
                  style={{
                    height: 52,
                    backgroundColor: '#ffffff',
                    borderTop: '1px solid #e5e7eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-around',
                    padding: '2px 4px 0 4px',
                    zIndex: 20,
                  }}
                >
                  {TABS.map(({ id, label, Icon: IconComponent }) => {
                    const isSelected = activeTabId === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setActiveTabId(id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 2,
                          color: isSelected ? '#10b981' : '#64748b',
                          cursor: 'pointer',
                          padding: '4px 2px',
                          flex: 1,
                          position: 'relative',
                          WebkitTapHighlightColor: 'transparent',
                        }}
                      >
                        {isSelected && (
                          <span
                            style={{
                              position: 'absolute',
                              top: -2,
                              width: 20,
                              height: 2.5,
                              backgroundColor: '#10b981',
                              borderRadius: '0 0 2px 2px',
                            }}
                          />
                        )}
                        <IconComponent style={{ width: 16, height: 16 }} />
                        <span
                          style={{
                            fontSize: '0.58rem',
                            fontWeight: isSelected ? 700 : 500,
                            color: isSelected ? '#142b49' : '#64748b',
                          }}
                        >
                          {label}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* iPhone Home Bar Indicator */}
                <div
                  style={{
                    height: 12,
                    backgroundColor: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <div
                    style={{
                      width: 90,
                      height: 3,
                      backgroundColor: '#1e293b',
                      borderRadius: 9999,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

export default SmartphoneShowcaseSection;
