import React, { useState } from 'react';
import { Section } from '@astryxdesign/core/Section';
import { Button } from '@astryxdesign/core/Button';
import {
  PrinterIcon,
  ClockIcon,
  TrendingUpIcon,
  CheckCircleIcon,
  SparklesIcon,
  GraduationCapIcon,
} from '../../components/common/BrandIcons';

export function ProductPreviewSection() {
  const [activeTab, setActiveTab] = useState('dttr'); // 'dttr' | 'logger' | 'analytics'
  const [isMorningActive, setIsMorningActive] = useState(true);
  const [isAfternoonActive, setIsAfternoonActive] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('Development');
  const [printStatus, setPrintStatus] = useState(null);

  const calculatedHours = (isMorningActive ? 4.0 : 0) + (isAfternoonActive ? 4.0 : 0);

  const handleSimulatePrint = () => {
    setPrintStatus('Generating PDF format for 8.5" × 13" Long Bond Paper...');
    setTimeout(() => {
      setPrintStatus('Document formatted with 100% printable table & signature fields!');
      setTimeout(() => setPrintStatus(null), 3000);
    }, 1200);
  };

  return (
    <Section
      id="product-preview"
      style={{
        paddingTop: 'clamp(64px, 8vw, 104px)',
        paddingBottom: 'clamp(64px, 8vw, 104px)',
        backgroundColor: '#f8fafc',
        borderTop: '1px solid #e2e8f0',
        borderBottom: '1px solid #e2e8f0',
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
            margin: '0 auto clamp(36px, 5vw, 48px) auto',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 14,
          }}
        >
          <div className="ojt-badge-pill">
            <SparklesIcon style={{ width: 14, height: 14, color: '#10b981' }} />
            <span>Interactive Application Tour</span>
          </div>

          <h2 className="ojt-section-headline">
            Experience the Tracker in Action
          </h2>

          <p className="ojt-lead-text">
            Designed specifically for Filipino OJT interns and university coordinators.
            Explore the three cornerstone tools built to eliminate manual calculation errors and tedious paperwork.
          </p>

          {/* Interactive Navigation Switcher */}
          <div
            style={{
              display: 'inline-flex',
              padding: 6,
              backgroundColor: '#e2e8f0',
              borderRadius: 14,
              gap: 6,
              marginTop: 12,
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            <button
              onClick={() => setActiveTab('dttr')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '9px 18px',
                borderRadius: 10,
                border: 'none',
                backgroundColor: activeTab === 'dttr' ? '#ffffff' : 'transparent',
                color: activeTab === 'dttr' ? '#142b49' : '#64748b',
                fontWeight: activeTab === 'dttr' ? 700 : 500,
                fontSize: '0.875rem',
                cursor: 'pointer',
                boxShadow: activeTab === 'dttr' ? '0 2px 8px rgba(20, 43, 73, 0.08)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <PrinterIcon style={{ width: 16, height: 16, color: activeTab === 'dttr' ? '#10b981' : '#64748b' }} />
              <span>1. Official DTTR Generator</span>
            </button>

            <button
              onClick={() => setActiveTab('logger')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '9px 18px',
                borderRadius: 10,
                border: 'none',
                backgroundColor: activeTab === 'logger' ? '#ffffff' : 'transparent',
                color: activeTab === 'logger' ? '#142b49' : '#64748b',
                fontWeight: activeTab === 'logger' ? 700 : 500,
                fontSize: '0.875rem',
                cursor: 'pointer',
                boxShadow: activeTab === 'logger' ? '0 2px 8px rgba(20, 43, 73, 0.08)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <ClockIcon style={{ width: 16, height: 16, color: activeTab === 'logger' ? '#10b981' : '#64748b' }} />
              <span>2. Dual-Session Time Logger</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '9px 18px',
                borderRadius: 10,
                border: 'none',
                backgroundColor: activeTab === 'analytics' ? '#ffffff' : 'transparent',
                color: activeTab === 'analytics' ? '#142b49' : '#64748b',
                fontWeight: activeTab === 'analytics' ? 700 : 500,
                fontSize: '0.875rem',
                cursor: 'pointer',
                boxShadow: activeTab === 'analytics' ? '0 2px 8px rgba(20, 43, 73, 0.08)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <TrendingUpIcon style={{ width: 16, height: 16, color: activeTab === 'analytics' ? '#10b981' : '#64748b' }} />
              <span>3. Milestone Analytics</span>
            </button>
          </div>
        </div>

        {/* Tab Content Display Area */}
        <div className="ojt-reveal-on-scroll ojt-delay-100">
          {activeTab === 'dttr' && (
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: 20,
                border: '1px solid #e2e8f0',
                boxShadow: '0 20px 40px -12px rgba(20, 43, 73, 0.08)',
                overflow: 'hidden',
              }}
            >
              {/* Document Banner & Action Header */}
              <div
                style={{
                  padding: '16px 24px',
                  backgroundColor: '#ffffff',
                  borderBottom: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 12,
                }}
              >
                <div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Document Standard
                  </span>
                  <h3 style={{ margin: '2px 0 0 0', fontSize: '1.1rem', fontWeight: 800, color: '#142b49' }}>
                    CHMSU College of Computer Studies — DTTR Template
                  </h3>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Button
                    label="Print / Save as PDF"
                    variant="primary"
                    size="sm"
                    icon={<PrinterIcon style={{ width: 16, height: 16 }} />}
                    onClick={handleSimulatePrint}
                  />
                </div>
              </div>

              {printStatus && (
                <div
                  style={{
                    padding: '10px 24px',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderBottom: '1px solid rgba(16, 185, 129, 0.25)',
                    color: '#059669',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <CheckCircleIcon style={{ width: 16, height: 16 }} />
                  <span>{printStatus}</span>
                </div>
              )}

              {/* Realistic Document Paper View */}
              <div
                style={{
                  padding: 'clamp(20px, 4vw, 36px)',
                  backgroundColor: '#f8fafc',
                  display: 'flex',
                  justifyContent: 'center',
                }}
              >
                <div
                  style={{
                    backgroundColor: '#ffffff',
                    width: '100%',
                    maxWidth: 780,
                    padding: 'clamp(20px, 4vw, 32px)',
                    border: '1px solid #cbd5e1',
                    borderRadius: 8,
                    boxShadow: '0 8px 24px rgba(20, 43, 73, 0.06)',
                    fontFamily: 'serif',
                    color: '#1e293b',
                  }}
                >
                  {/* University Header */}
                  <div style={{ textAlign: 'center', borderBottom: '2px solid #059669', paddingBottom: 14, marginBottom: 16 }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                      Republic of the Philippines
                    </div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#142b49', marginTop: 2 }}>
                      CARLOS HILADO MEMORIAL STATE UNIVERSITY
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', fontStyle: 'italic', marginTop: 2 }}>
                      College of Computer Studies • Talisay (Main) Campus
                    </div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#142b49', marginTop: 10, letterSpacing: '0.02em' }}>
                      DAILY TIME & TASKS RECORD (DTTR)
                    </div>
                  </div>

                  {/* Student & HTE Details Grid */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: '8px 20px',
                      fontSize: '0.825rem',
                      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                      marginBottom: 16,
                      backgroundColor: '#f8fafc',
                      padding: 12,
                      borderRadius: 6,
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    <div>
                      <strong style={{ color: '#64748b' }}>Student Name:</strong> <span style={{ fontWeight: 700, color: '#142b49' }}>Juan D. Dela Cruz</span>
                    </div>
                    <div>
                      <strong style={{ color: '#64748b' }}>Host Training Agency:</strong> <span style={{ fontWeight: 700, color: '#142b49' }}>TechCorp Solutions Inc.</span>
                    </div>
                    <div>
                      <strong style={{ color: '#64748b' }}>Official Hours:</strong> <span style={{ fontWeight: 700, color: '#142b49' }}>8:00 AM – 5:00 PM</span>
                    </div>
                    <div>
                      <strong style={{ color: '#64748b' }}>Month & Year:</strong> <span style={{ fontWeight: 700, color: '#142b49' }}>November 2026</span>
                    </div>
                  </div>

                  {/* Sample Attendance Table */}
                  <div style={{ overflowX: 'auto', marginBottom: 20 }}>
                    <table
                      style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                        fontSize: '0.785rem',
                        textAlign: 'center',
                        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                        border: '1px solid #334155',
                      }}
                    >
                      <thead>
                        <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #334155' }}>
                          <th style={{ padding: '6px 4px', borderRight: '1px solid #334155', width: '8%' }}>Day</th>
                          <th style={{ padding: '6px 4px', borderRight: '1px solid #334155', width: '13%' }}>AM Arrival</th>
                          <th style={{ padding: '6px 4px', borderRight: '1px solid #334155', width: '13%' }}>AM Departure</th>
                          <th style={{ padding: '6px 4px', borderRight: '1px solid #334155', width: '13%' }}>PM Arrival</th>
                          <th style={{ padding: '6px 4px', borderRight: '1px solid #334155', width: '13%' }}>PM Departure</th>
                          <th style={{ padding: '6px 4px', borderRight: '1px solid #334155', width: '10%', fontWeight: 800 }}>Hours</th>
                          <th style={{ padding: '6px 8px', textAlign: 'left', width: '30%' }}>Tasks / Activities Performed</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                          <td style={{ padding: '6px 4px', borderRight: '1px solid #cbd5e1', fontWeight: 700 }}>01</td>
                          <td style={{ padding: '6px 4px', borderRight: '1px solid #cbd5e1' }}>08:00 AM</td>
                          <td style={{ padding: '6px 4px', borderRight: '1px solid #cbd5e1' }}>12:00 PM</td>
                          <td style={{ padding: '6px 4px', borderRight: '1px solid #cbd5e1' }}>01:00 PM</td>
                          <td style={{ padding: '6px 4px', borderRight: '1px solid #cbd5e1' }}>05:00 PM</td>
                          <td style={{ padding: '6px 4px', borderRight: '1px solid #cbd5e1', fontWeight: 800, color: '#059669' }}>8.0</td>
                          <td style={{ padding: '6px 8px', textAlign: 'left', fontSize: '0.75rem' }}>OJT orientation, repository setup, and architecture review.</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #cbd5e1', backgroundColor: '#fafafa' }}>
                          <td style={{ padding: '6px 4px', borderRight: '1px solid #cbd5e1', fontWeight: 700 }}>02</td>
                          <td style={{ padding: '6px 4px', borderRight: '1px solid #cbd5e1' }}>08:00 AM</td>
                          <td style={{ padding: '6px 4px', borderRight: '1px solid #cbd5e1' }}>12:00 PM</td>
                          <td style={{ padding: '6px 4px', borderRight: '1px solid #cbd5e1' }}>01:00 PM</td>
                          <td style={{ padding: '6px 4px', borderRight: '1px solid #cbd5e1' }}>05:00 PM</td>
                          <td style={{ padding: '6px 4px', borderRight: '1px solid #cbd5e1', fontWeight: 800, color: '#059669' }}>8.0</td>
                          <td style={{ padding: '6px 8px', textAlign: 'left', fontSize: '0.75rem' }}>Developed API endpoints for student training logs and validation.</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                          <td style={{ padding: '6px 4px', borderRight: '1px solid #cbd5e1', fontWeight: 700 }}>03</td>
                          <td style={{ padding: '6px 4px', borderRight: '1px solid #cbd5e1' }}>08:00 AM</td>
                          <td style={{ padding: '6px 4px', borderRight: '1px solid #cbd5e1' }}>12:00 PM</td>
                          <td style={{ padding: '6px 4px', borderRight: '1px solid #cbd5e1' }}>01:00 PM</td>
                          <td style={{ padding: '6px 4px', borderRight: '1px solid #cbd5e1' }}>05:00 PM</td>
                          <td style={{ padding: '6px 4px', borderRight: '1px solid #cbd5e1', fontWeight: 800, color: '#059669' }}>8.0</td>
                          <td style={{ padding: '6px 8px', textAlign: 'left', fontSize: '0.75rem' }}>Implemented responsive navigation and interactive dashboard widgets.</td>
                        </tr>
                        <tr style={{ backgroundColor: '#f1f5f9', fontWeight: 800 }}>
                          <td colSpan={5} style={{ padding: '8px 12px', textAlign: 'right', borderRight: '1px solid #334155' }}>
                            MONTHLY TOTAL HOURS RENDERED:
                          </td>
                          <td style={{ padding: '8px 4px', borderRight: '1px solid #334155', color: '#059669', fontSize: '0.9rem' }}>
                            184.0
                          </td>
                          <td style={{ padding: '8px 8px', textAlign: 'left', fontSize: '0.75rem', color: '#64748b' }}>
                            Verified against curriculum target
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Certification & Signatures */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: 32,
                      marginTop: 24,
                      fontSize: '0.8rem',
                      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                      paddingTop: 12,
                      borderTop: '1px dashed #cbd5e1',
                    }}
                  >
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ height: 36, borderBottom: '1px solid #142b49', width: '80%', margin: '0 auto 6px auto' }} />
                      <div style={{ fontWeight: 700, color: '#142b49' }}>JUAN D. DELA CRUZ</div>
                      <div style={{ color: '#64748b', fontSize: '0.725rem' }}>Student Trainee Signature</div>
                    </div>

                    <div style={{ textAlign: 'center' }}>
                      <div style={{ height: 36, borderBottom: '1px solid #142b49', width: '80%', margin: '0 auto 6px auto' }} />
                      <div style={{ fontWeight: 700, color: '#142b49' }}>ENGR. ROBERTO SANTOS</div>
                      <div style={{ color: '#64748b', fontSize: '0.725rem' }}>HTE Immediate Supervisor</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'logger' && (
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: 20,
                border: '1px solid #e2e8f0',
                boxShadow: '0 20px 40px -12px rgba(20, 43, 73, 0.08)',
                padding: 'clamp(20px, 4vw, 36px)',
              }}
            >
              <div style={{ maxWidth: 640, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Form Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: 14 }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#142b49' }}>Log Daily Training Hours</h3>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                      Automatic hour calculation with two-session lunch break separation.
                    </p>
                  </div>

                  <div
                    style={{
                      padding: '6px 14px',
                      borderRadius: 10,
                      backgroundColor: 'rgba(16, 185, 129, 0.12)',
                      color: '#059669',
                      fontWeight: 800,
                      fontSize: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <span>+{calculatedHours.toFixed(1)} hrs</span>
                  </div>
                </div>

                {/* Session Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
                  {/* Morning Session */}
                  <div
                    style={{
                      border: isMorningActive ? '2px solid #10b981' : '1px solid #e2e8f0',
                      borderRadius: 14,
                      padding: 16,
                      backgroundColor: isMorningActive ? '#f0fdf4' : '#f8fafc',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                      <span style={{ fontWeight: 700, color: '#142b49', fontSize: '0.9rem' }}>Morning Session</span>
                      <button
                        onClick={() => setIsMorningActive(!isMorningActive)}
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '4px 10px',
                          borderRadius: 6,
                          border: 'none',
                          backgroundColor: isMorningActive ? '#10b981' : '#cbd5e1',
                          color: '#ffffff',
                          cursor: 'pointer',
                        }}
                      >
                        {isMorningActive ? 'Attended' : 'Absent'}
                      </button>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <div>
                        <div style={{ color: '#64748b', fontSize: '0.75rem' }}>Time In</div>
                        <div style={{ fontWeight: 700, color: '#142b49' }}>08:00 AM</div>
                      </div>
                      <div style={{ textAlign: 'center', color: '#94a3b8' }}>→</div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ color: '#64748b', fontSize: '0.75rem' }}>Time Out</div>
                        <div style={{ fontWeight: 700, color: '#142b49' }}>12:00 PM</div>
                      </div>
                    </div>
                  </div>

                  {/* Afternoon Session */}
                  <div
                    style={{
                      border: isAfternoonActive ? '2px solid #10b981' : '1px solid #e2e8f0',
                      borderRadius: 14,
                      padding: 16,
                      backgroundColor: isAfternoonActive ? '#f0fdf4' : '#f8fafc',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                      <span style={{ fontWeight: 700, color: '#142b49', fontSize: '0.9rem' }}>Afternoon Session</span>
                      <button
                        onClick={() => setIsAfternoonActive(!isAfternoonActive)}
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '4px 10px',
                          borderRadius: 6,
                          border: 'none',
                          backgroundColor: isAfternoonActive ? '#10b981' : '#cbd5e1',
                          color: '#ffffff',
                          cursor: 'pointer',
                        }}
                      >
                        {isAfternoonActive ? 'Attended' : 'Absent'}
                      </button>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <div>
                        <div style={{ color: '#64748b', fontSize: '0.75rem' }}>Time In</div>
                        <div style={{ fontWeight: 700, color: '#142b49' }}>01:00 PM</div>
                      </div>
                      <div style={{ textAlign: 'center', color: '#94a3b8' }}>→</div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ color: '#64748b', fontSize: '0.75rem' }}>Time Out</div>
                        <div style={{ fontWeight: 700, color: '#142b49' }}>05:00 PM</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Category Chips */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#142b49', marginBottom: 8 }}>
                    Activity Category
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {['Development', 'Design', 'Documentation', 'Testing', 'Team Meeting'].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        style={{
                          padding: '6px 14px',
                          borderRadius: 8,
                          border: selectedCategory === cat ? '1px solid #10b981' : '1px solid #e2e8f0',
                          backgroundColor: selectedCategory === cat ? 'rgba(16, 185, 129, 0.1)' : '#ffffff',
                          color: selectedCategory === cat ? '#059669' : '#64748b',
                          fontWeight: selectedCategory === cat ? 700 : 500,
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                        }}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Task Description Mockup */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#142b49', marginBottom: 8 }}>
                    Tasks & Accomplishments
                  </label>
                  <div
                    style={{
                      padding: 12,
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: 10,
                      fontSize: '0.85rem',
                      color: '#334155',
                      lineHeight: 1.5,
                    }}
                  >
                    Implemented student onboarding responsive form components and fixed DTTR printable table widths to ensure full column visibility.
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: 20,
                border: '1px solid #e2e8f0',
                boxShadow: '0 20px 40px -12px rgba(20, 43, 73, 0.08)',
                padding: 'clamp(20px, 4vw, 36px)',
              }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
                {/* Progress Summary Card */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#10b981', textTransform: 'uppercase' }}>
                      Curriculum Target
                    </span>
                    <h3 style={{ margin: '4px 0 0 0', fontSize: '1.4rem', fontWeight: 800, color: '#142b49' }}>
                      184.0 / 600.0 Hours
                    </h3>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                      416 hours remaining • Currently rendering 40.0 hrs / week
                    </p>
                  </div>

                  {/* Main Progress Bar */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, marginBottom: 6 }}>
                      <span style={{ color: '#142b49' }}>Completion Progress</span>
                      <span style={{ color: '#10b981' }}>30.7%</span>
                    </div>
                    <div style={{ width: '100%', height: 12, backgroundColor: '#e2e8f0', borderRadius: 9999, overflow: 'hidden' }}>
                      <div
                        style={{
                          width: '30.7%',
                          height: '100%',
                          backgroundColor: '#10b981',
                          borderRadius: 9999,
                          transition: 'width 1s ease',
                        }}
                      />
                    </div>
                  </div>

                  {/* Milestone Milestones */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginTop: 8 }}>
                    {[
                      { percent: '25%', label: '150 hrs', done: true },
                      { percent: '50%', label: '300 hrs', done: false, active: true },
                      { percent: '75%', label: '450 hrs', done: false },
                      { percent: '100%', label: '600 hrs', done: false },
                    ].map((m) => (
                      <div
                        key={m.percent}
                        style={{
                          padding: '10px 8px',
                          borderRadius: 10,
                          textAlign: 'center',
                          border: m.done
                            ? '1px solid #10b981'
                            : m.active
                            ? '1px solid #0284c7'
                            : '1px solid #e2e8f0',
                          backgroundColor: m.done
                            ? 'rgba(16, 185, 129, 0.08)'
                            : m.active
                            ? 'rgba(2, 132, 199, 0.08)'
                            : '#f8fafc',
                        }}
                      >
                        <div style={{ fontSize: '0.85rem', fontWeight: 800, color: m.done ? '#059669' : m.active ? '#0284c7' : '#94a3b8' }}>
                          {m.percent}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{m.label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pace & Schedule Projection */}
                <div
                  style={{
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: 16,
                    padding: 20,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: 16,
                  }}
                >
                  <div>
                    <h4 style={{ margin: '0 0 12px 0', fontSize: '1rem', fontWeight: 800, color: '#142b49' }}>
                      Pace & Completion Forecast
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.85rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: 6 }}>
                        <span style={{ color: '#64748b' }}>Projected Finish Date:</span>
                        <strong style={{ color: '#142b49' }}>January 15, 2027</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: 6 }}>
                        <span style={{ color: '#64748b' }}>Days Remaining:</span>
                        <strong style={{ color: '#142b49' }}>52 training days</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: 6 }}>
                        <span style={{ color: '#64748b' }}>Current Status:</span>
                        <span style={{ color: '#059669', fontWeight: 700 }}>On Schedule (100% Pace)</span>
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      padding: '12px 14px',
                      backgroundColor: '#ffffff',
                      borderRadius: 10,
                      border: '1px solid #e2e8f0',
                      fontSize: '0.8rem',
                      color: '#475569',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                    }}
                  >
                    <GraduationCapIcon style={{ width: 20, height: 20, color: '#10b981', flexShrink: 0 }} />
                    <span>
                      At your current pace of 8.0 hours/day (Mon–Fri), you will satisfy graduation requirements 2 weeks before the deadline.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Section>
  );
}
