import React from 'react';
import { Section } from '@astryxdesign/core/Section';
import {
  GraduationCapIcon,
  CalendarIcon,
  PrinterIcon,
  SparklesIcon,
} from '../../components/common/BrandIcons';

const STEPS = [
  {
    step: '01',
    icon: GraduationCapIcon,
    title: 'Configure Your Placement',
    badge: 'Step 1: Setup',
    description:
      'Enter your institution, host training company, supervisor, and mandated target hours (e.g. 600 hours). Set your expected daily morning and afternoon shift schedule.',
  },
  {
    step: '02',
    icon: CalendarIcon,
    title: 'Log Daily Sessions & Tasks',
    badge: 'Step 2: Routine',
    description:
      'Record your attendance times at arrival and departure with our smooth picker. Write detailed task descriptions to document everything you learn and accomplish.',
  },
  {
    step: '03',
    icon: PrinterIcon,
    title: 'Track Progress & Print DTTR',
    badge: 'Step 3: Verification',
    description:
      'Watch your progress bar advance in real time. Whenever submission day arrives, generate and organize your Daily Time and Task Records for your OJT documentation in one click.',
  },
];

export function HowItWorksSection() {
  return (
    <Section
      id="how-it-works"
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
              <span>Simple 3-Step Workflow</span>
            </div>
            <h2 className="ojt-section-headline">
              How Tempus Works
            </h2>
            <p className="ojt-lead-text">
              Zero complicated spreadsheets or lost paper slips. Start in seconds, stay organized
              throughout your internship, and graduate on schedule.
            </p>
          </div>

          {/* 3 Step Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 24,
            }}
          >
            {STEPS.map(({ step, icon: IconComponent, title, badge, description }, idx) => (
              <div
                key={step}
                className={`ojt-card-hover ojt-reveal-on-scroll ojt-delay-${(idx + 1) * 100}`}
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: 18,
                  padding: '32px 26px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 18,
                  position: 'relative',
                  boxShadow: '0 2px 6px rgba(20, 43, 73, 0.04)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 14,
                      backgroundColor: 'rgba(20, 43, 73, 0.06)',
                      color: '#142b49',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <IconComponent style={{ width: 26, height: 26, color: '#10b981' }} />
                  </div>

                  <span
                    style={{
                      fontSize: '1.25rem',
                      fontWeight: 800,
                      color: '#10b981',
                      letterSpacing: '-0.02em',
                      backgroundColor: 'rgba(16, 185, 129, 0.08)',
                      padding: '4px 12px',
                      borderRadius: 9999,
                    }}
                  >
                    {step}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: '#64748b',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}
                  >
                    {badge}
                  </span>
                  <h3
                    style={{
                      fontSize: '1.25rem',
                      fontWeight: 800,
                      color: '#142b49',
                      margin: 0,
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
