import React from 'react';
import { Section } from '@astryxdesign/core/Section';
import {
  ClockIcon,
  CalendarIcon,
  ClipboardCheckIcon,
  PrinterIcon,
  TrendingUpIcon,
  DeviceMobileIcon,
  SparklesIcon,
} from '../../components/common/BrandIcons';

const FEATURES = [
  {
    icon: ClockIcon,
    title: 'OJT Hour Tracking',
    badge: 'Core Engine',
    description:
      'Log and calculate cumulative hours rendered toward your 600-hour or customized curriculum requirement with minute-level precision and zero guesswork.',
  },
  {
    icon: CalendarIcon,
    title: 'Daily Time Logs',
    badge: 'Two-Session Support',
    description:
      'Record dual morning and afternoon sessions with precise arrival and departure times, automatic lunch break handling, and weekend status indicators.',
  },
  {
    icon: ClipboardCheckIcon,
    title: 'Training Activities',
    badge: 'Structured Logs',
    description:
      'Categorize daily work into Development, Research, Testing, and Meetings with detailed task descriptions preserved without truncation.',
  },
  {
    icon: PrinterIcon,
    title: 'DTTR PDF Generation',
    badge: 'Flexible Export',
    description:
      'Generate clean, print-ready Daily Time & Tasks Records formatted for any bond paper size with structured attendance tables and supervisor signatures.',
  },
  {
    icon: TrendingUpIcon,
    title: 'Progress Monitoring',
    badge: 'Real-Time Insights',
    description:
      'Track 25%, 50%, 75%, and 100% milestone completions alongside projected graduation and training completion dates tailored to your weekly work schedule.',
  },
  {
    icon: DeviceMobileIcon,
    title: 'Installable PWA',
    badge: 'Offline-Ready',
    description:
      'Add to your home screen or desktop with one click. Enjoy a fast, standalone application experience powered by modern service workers and asset caching.',
  },
];

export function FeaturesSection() {
  return (
    <Section
      id="features"
      variant="transparent"
      paddingBlock={10}
      paddingInline={0}
      style={{ backgroundColor: '#FCFCFB' }}
    >
      <div className="ojt-landing-container">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
          {/* Header */}
          <div
            className="ojt-reveal-on-scroll"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: 12,
              maxWidth: 720,
              margin: '0 auto',
            }}
          >
            <div className="ojt-badge-pill">
              <SparklesIcon style={{ width: 14, height: 14 }} />
              <span>Comprehensive Toolkit</span>
            </div>
            <h2 className="ojt-section-headline">
              Everything You Need to Master Your OJT
            </h2>
            <p className="ojt-lead-text">
              Built from the ground up to solve the real administrative headaches of student
              internships, attendance logging, and college report submissions.
            </p>
          </div>

          {/* 6 Feature cards Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: 20,
            }}
          >
            {FEATURES.map(({ icon: IconComponent, title, badge, description }, idx) => (
              <div
                key={title}
                className={`ojt-card-hover ojt-reveal-on-scroll ojt-delay-${((idx % 3) + 1) * 100}`}
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  padding: '28px 24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16,
                  boxShadow: '0 1px 4px rgba(20, 43, 73, 0.04)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: 14,
                      backgroundColor: 'rgba(16, 185, 129, 0.12)',
                      color: '#10b981',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <IconComponent style={{ width: 26, height: 26 }} />
                  </div>

                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: '#059669',
                      backgroundColor: 'rgba(16, 185, 129, 0.08)',
                      padding: '4px 10px',
                      borderRadius: 9999,
                      border: '1px solid rgba(16, 185, 129, 0.2)',
                    }}
                  >
                    {badge}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <h3
                    style={{
                      fontSize: '1.25rem',
                      fontWeight: 800,
                      color: '#142b49',
                      margin: 0,
                      lineHeight: 1.3,
                    }}
                  >
                    {title}
                  </h3>
                  <p
                    style={{
                      fontSize: '0.925rem',
                      color: '#64748b',
                      lineHeight: 1.6,
                      margin: 0,
                    }}
                  >
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}
