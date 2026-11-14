import React from 'react';
import { Section } from '@astryxdesign/core/Section';
import { UserAvatar } from '../../components/common/UserAvatar';
import {
  CheckCircleIcon,
  HourglassIcon,
  TrendingUpIcon,
  ClockIcon,
  DocumentTextIcon,
  ArrowRightIcon,
  SparklesIcon,
} from '../../components/common/BrandIcons';

const DEMO_COMPLETED = 184;
const DEMO_REQUIRED = 600;
const DEMO_REMAINING = DEMO_REQUIRED - DEMO_COMPLETED;
const DEMO_RATE = Math.round((DEMO_COMPLETED / DEMO_REQUIRED) * 100);

const DEMO_LOGS = [
  {
    date: 'Today',
    tag: 'Development',
    morning: '8:00 AM – 12:00 PM',
    afternoon: '1:00 PM – 5:00 PM',
    hours: '8.0',
    desc: 'Implemented frontend user authentication and responsive layout components.',
  },
  {
    date: 'Yesterday',
    tag: 'Database & API',
    morning: '8:00 AM – 12:00 PM',
    afternoon: '1:00 PM – 5:00 PM',
    hours: '8.0',
    desc: 'Designed PostgreSQL schemas and verified foreign key integrity.',
  },
  {
    date: 'Nov 12, 2026',
    tag: 'Sprint Review',
    morning: '9:00 AM – 12:00 PM',
    afternoon: '1:00 PM – 4:00 PM',
    hours: '6.0',
    desc: 'Participated in bi-weekly sprint demo with company mentor and team.',
  },
];

function ProductMockup() {
  return (
    <div className="ojt-dashboard-mockup">
      {/* Browser Window Header Chrome */}
      <div
        style={{
          backgroundColor: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          padding: '12px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <div style={{ width: 11, height: 11, borderRadius: '50%', backgroundColor: '#f87171' }} />
          <div style={{ width: 11, height: 11, borderRadius: '50%', backgroundColor: '#fbbf24' }} />
          <div style={{ width: 11, height: 11, borderRadius: '50%', backgroundColor: '#34d399' }} />
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: '0.785rem',
            color: '#64748b',
            fontWeight: 600,
            backgroundColor: '#ffffff',
            padding: '3px 12px',
            borderRadius: 6,
            border: '1px solid #e2e8f0',
          }}
        >
          <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#10b981' }} />
          <span>app.ojt-tracker.ph/dashboard</span>
        </div>

        <div style={{ width: 44 }} />
      </div>

      {/* Main Mockup Body */}
      <div style={{ padding: ' clamp(16px, 3vw, 24px)', display: 'flex', flexDirection: 'column', gap: 18 }}>
        {/* Trainee Profile Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
            borderBottom: '1px solid #f1f5f9',
            paddingBottom: 14,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <UserAvatar size={44} alt="John Doe" />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '1rem', fontWeight: 700, color: '#142b49' }}>
                  John Doe
                </span>
                <span
                  style={{
                    backgroundColor: 'rgba(16, 185, 129, 0.12)',
                    color: '#059669',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 9999,
                  }}
                >
                  Active Trainee
                </span>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 2 }}>
                BS Information Technology · Student Intern
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 8,
              padding: '6px 12px',
              fontSize: '0.8rem',
              color: '#142b49',
              fontWeight: 600,
            }}
          >
            <DocumentTextIcon style={{ width: 16, height: 16, color: '#10b981' }} />
            <span>DTTR Report Ready</span>
          </div>
        </div>

        {/* 4 Metric Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
            gap: 10,
          }}
        >
          {/* Required */}
          <div
            style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 12,
              padding: '10px 12px',
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#64748b' }}>
              <ClockIcon style={{ width: 14, height: 14, color: '#64748b' }} />
              <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Required</span>
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#142b49' }}>
              {DEMO_REQUIRED}{' '}
              <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#64748b' }}>hrs</span>
            </div>
          </div>

          {/* Completed */}
          <div
            style={{
              backgroundColor: 'rgba(16, 185, 129, 0.05)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              borderRadius: 12,
              padding: '10px 12px',
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#059669' }}>
              <CheckCircleIcon style={{ width: 14, height: 14 }} />
              <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>Rendered</span>
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#059669' }}>
              {DEMO_COMPLETED}{' '}
              <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#059669' }}>hrs</span>
            </div>
          </div>

          {/* Remaining */}
          <div
            style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 12,
              padding: '10px 12px',
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#64748b' }}>
              <HourglassIcon style={{ width: 14, height: 14, color: '#d97706' }} />
              <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Remaining</span>
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#142b49' }}>
              {DEMO_REMAINING}{' '}
              <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#64748b' }}>hrs</span>
            </div>
          </div>

          {/* Completion Rate */}
          <div
            style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 12,
              padding: '10px 12px',
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#64748b' }}>
              <TrendingUpIcon style={{ width: 14, height: 14, color: '#10b981' }} />
              <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Rate</span>
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10b981' }}>
              {DEMO_RATE}%
            </div>
          </div>
        </div>

        {/* Progress Bar Container */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#142b49' }}>
              Cumulative Requirement Progress
            </span>
            <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: '#10b981' }}>
              {DEMO_COMPLETED} / {DEMO_REQUIRED} hrs
            </span>
          </div>

          <div
            style={{
              width: '100%',
              height: 10,
              backgroundColor: '#e2e8f0',
              borderRadius: 9999,
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            <div
              style={{
                width: `${DEMO_RATE}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
                borderRadius: 9999,
                transition: 'width 0.8s ease',
              }}
            />
          </div>
        </div>

        {/* Recent Daily Time Log Snippet */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#142b49' }}>
              Latest Verified Entries
            </span>
            <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>
              Live Log Sync
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {DEMO_LOGS.map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 12px',
                  borderRadius: 10,
                  backgroundColor: '#f8fafc',
                  border: '1px solid #f1f5f9',
                  gap: 8,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                  <div
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      backgroundColor: '#10b981',
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#142b49' }}>
                        {item.date}
                      </span>
                      <span
                        style={{
                          fontSize: '0.6875rem',
                          backgroundColor: '#e2e8f0',
                          padding: '1px 6px',
                          borderRadius: 4,
                          color: '#475569',
                          fontWeight: 600,
                        }}
                      >
                        {item.tag}
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        color: '#64748b',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {item.desc}
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    fontSize: '0.85rem',
                    fontWeight: 800,
                    color: '#142b49',
                    whiteSpace: 'nowrap',
                  }}
                >
                  +{item.hours}h
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function HeroSection({ onRegister }) {
  return (
    <Section
      id="home"
      variant="transparent"
      paddingBlock={8}
      paddingInline={0}
      style={{ backgroundColor: '#FCFCFB' }}
    >
      <div className="ojt-landing-container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            alignItems: 'center',
            gap: 'clamp(28px, 5vw, 64px)',
            paddingTop: 'clamp(16px, 4vw, 36px)',
            paddingBottom: 'clamp(24px, 5vw, 48px)',
          }}
        >
          {/* Left Column: Heading, description, CTA buttons */}
          <div className="ojt-reveal-on-scroll" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Pill badge */}
            <div className="ojt-badge-pill">
              <SparklesIcon style={{ width: 14, height: 14 }} />
              <span>Built for Student Interns &amp; On-the-Job Training</span>
            </div>

            {/* Main Headline */}
            <h1 className="ojt-hero-headline">
              Track Your OJT Hours.{' '}
              <span style={{ color: '#10b981' }}>Stay on Top of Your Progress.</span>
            </h1>

            {/* Supporting description */}
            <p className="ojt-lead-text">
              A simpler way to manage your internship hours, document your daily activities,
              monitor your progress, and prepare your OJT reports.
            </p>

            {/* CTA button row */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                flexWrap: 'wrap',
              }}
            >
              <button
                type="button"
                onClick={onRegister}
                style={{
                  height: 50,
                  padding: '0 26px',
                  borderRadius: 12,
                  border: 'none',
                  backgroundColor: '#000000',
                  color: '#ffffff',
                  fontSize: '1rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 10,
                  boxShadow: '0 4px 16px -2px rgba(0, 0, 0, 0.25)',
                  transition: 'background-color 0.15s ease, transform 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#1f2937';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#000000';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <span>Get Started Free</span>
                <ArrowRightIcon style={{ width: 18, height: 18 }} />
              </button>

              <button
                type="button"
                onClick={() => {
                  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                }}
                style={{
                  height: 50,
                  padding: '0 22px',
                  borderRadius: 12,
                  border: '1.5px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  color: '#142b49',
                  fontSize: '1rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  transition: 'border-color 0.15s, background-color 0.15s',
                }}
              >
                <span>Explore Features</span>
              </button>
            </div>

            {/* Trust check points */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 20,
                flexWrap: 'wrap',
                paddingTop: 8,
                borderTop: '1px solid #f1f5f9',
                fontSize: '0.85rem',
                color: '#64748b',
                fontWeight: 600,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <CheckCircleIcon style={{ width: 16, height: 16, color: '#10b981' }} />
                <span>100% Free for Students</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <CheckCircleIcon style={{ width: 16, height: 16, color: '#10b981' }} />
                <span>Installable PWA</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <CheckCircleIcon style={{ width: 16, height: 16, color: '#10b981' }} />
                <span>Export in Any Bond Format</span>
              </div>
            </div>
          </div>

          {/* Right Column: Dashboard preview */}
          <div className="ojt-reveal-on-scroll ojt-delay-100" style={{ width: '100%', minWidth: 0 }}>
            <ProductMockup />
          </div>
        </div>
      </div>
    </Section>
  );
}
