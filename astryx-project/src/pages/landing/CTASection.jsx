import React from 'react';
import { Section } from '@astryxdesign/core/Section';
import {
  ArrowRightIcon,
  CheckCircleIcon,
} from '../../components/common/BrandIcons';

export function CTASection({ onRegister }) {
  return (
    <Section
      id="cta"
      variant="transparent"
      paddingBlock={8}
      paddingInline={0}
      style={{ backgroundColor: '#FCFCFB' }}
    >
      <div className="ojt-landing-container">
        <div
          className="ojt-reveal-on-scroll"
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 16,
            padding: 'clamp(36px, 6vw, 56px) clamp(20px, 5vw, 48px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: 20,
            boxShadow: '0 4px 20px -2px rgba(20, 43, 73, 0.05)',
            boxSizing: 'border-box',
          }}
        >
          {/* Header label */}
          <span
            style={{
              fontSize: '0.8rem',
              fontWeight: 700,
              color: '#059669',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            Start Tracking Today
          </span>

          {/* Main Headline */}
          <h2
            style={{
              fontSize: 'clamp(1.65rem, 4vw, 2.35rem)',
              fontWeight: 800,
              lineHeight: 1.25,
              letterSpacing: '-0.02em',
              color: '#142b49',
              margin: 0,
              maxWidth: 680,
            }}
          >
            Take the Stress Out of Your OJT Requirement.
          </h2>

          {/* Supporting description */}
          <p
            style={{
              fontSize: 'clamp(0.95rem, 1.8vw, 1.075rem)',
              lineHeight: 1.6,
              color: '#64748b',
              maxWidth: 580,
              margin: 0,
            }}
          >
            Record daily morning and afternoon sessions, track total hours rendered, and generate
            and organize your Daily Time and Task Records for your OJT documentation.
          </p>

          {/* Action button row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              flexWrap: 'wrap',
              justifyContent: 'center',
              marginTop: 6,
            }}
          >
            <button
              type="button"
              onClick={onRegister}
              style={{
                height: 50,
                padding: '0 26px',
                borderRadius: 10,
                border: 'none',
                backgroundColor: '#000000',
                color: '#ffffff',
                fontSize: '0.975rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                boxShadow: '0 4px 14px -2px rgba(0, 0, 0, 0.25)',
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
              <span>Create Free Student Account</span>
              <ArrowRightIcon style={{ width: 17, height: 17 }} />
            </button>

            <button
              type="button"
              onClick={() => {
                document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
              }}
              style={{
                height: 50,
                padding: '0 22px',
                borderRadius: 10,
                border: '1.5px solid #cbd5e1',
                backgroundColor: '#ffffff',
                color: '#142b49',
                fontSize: '0.975rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                transition: 'background-color 0.15s ease, border-color 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f8fafc';
                e.currentTarget.style.borderColor = '#94a3b8';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#ffffff';
                e.currentTarget.style.borderColor = '#cbd5e1';
              }}
            >
              <span>Explore Features</span>
            </button>
          </div>

          {/* Minimalist Trust Checklist */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'clamp(16px, 3vw, 24px)',
              flexWrap: 'wrap',
              justifyContent: 'center',
              marginTop: 10,
              paddingTop: 16,
              borderTop: '1px solid #f1f5f9',
              fontSize: '0.8125rem',
              color: '#64748b',
              fontWeight: 600,
              width: '100%',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <CheckCircleIcon style={{ width: 15, height: 15, color: '#10b981' }} />
              <span>100% Free for Students</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <CheckCircleIcon style={{ width: 15, height: 15, color: '#10b981' }} />
              <span>Works Completely Offline (PWA)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <CheckCircleIcon style={{ width: 15, height: 15, color: '#10b981' }} />
              <span>Printable in Any Bond Format</span>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
