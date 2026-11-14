import React from 'react';
import { Section } from '@astryxdesign/core/Section';
import {
  ArrowRightIcon,
  CheckCircleIcon,
  SparklesIcon,
} from '../../components/common/BrandIcons';

export function CTASection({ onRegister }) {
  return (
    <Section id="about" variant="transparent" paddingBlock={8} paddingInline={0}>
      <div className="ojt-landing-container">
        <div
          style={{
            background: 'linear-gradient(135deg, #142b49 0%, #1e3a5f 100%)',
            borderRadius: 24,
            padding: 'clamp(36px, 6vw, 64px) clamp(24px, 5vw, 48px)',
            color: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: 24,
            boxShadow: '0 20px 40px -15px rgba(20, 43, 73, 0.25)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Subtle background glow effect */}
          <div
            style={{
              position: 'absolute',
              top: -60,
              right: -60,
              width: 220,
              height: 220,
              borderRadius: '50%',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              filter: 'blur(40px)',
              pointerEvents: 'none',
            }}
          />

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 16px',
              borderRadius: 9999,
              backgroundColor: 'rgba(16, 185, 129, 0.2)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              color: '#34d399',
              fontSize: '0.8125rem',
              fontWeight: 700,
              letterSpacing: '0.02em',
            }}
          >
            <SparklesIcon style={{ width: 14, height: 14 }} />
            <span>Start Tracking Today</span>
          </div>

          <h2
            style={{
              fontSize: 'clamp(1.75rem, 4.5vw, 2.75rem)',
              fontWeight: 800,
              lineHeight: 1.2,
              letterSpacing: '-0.02em',
              margin: 0,
              maxWidth: 720,
            }}
          >
            Take the Stress Out of Your OJT Requirement.
          </h2>

          <p
            style={{
              fontSize: 'clamp(0.95rem, 2vw, 1.15rem)',
              lineHeight: 1.6,
              color: '#cbd5e1',
              maxWidth: 620,
              margin: 0,
            }}
          >
            Record daily morning and afternoon sessions, track total hours rendered, and export
            certified CHMSU DTTR reports ready for your university supervisor.
          </p>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              flexWrap: 'wrap',
              justifyContent: 'center',
              marginTop: 8,
            }}
          >
            <button
              type="button"
              onClick={onRegister}
              style={{
                height: 52,
                padding: '0 28px',
                borderRadius: 12,
                border: 'none',
                backgroundColor: '#10b981',
                color: '#ffffff',
                fontSize: '1rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                boxShadow: '0 8px 24px -4px rgba(16, 185, 129, 0.5)',
                transition: 'background-color 0.15s, transform 0.15s',
              }}
            >
              <span>Create Free Student Account</span>
              <ArrowRightIcon style={{ width: 18, height: 18 }} />
            </button>

            <button
              type="button"
              onClick={() => {
                document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
              }}
              style={{
                height: 52,
                padding: '0 24px',
                borderRadius: 12,
                border: '1.5px solid rgba(255, 255, 255, 0.25)',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                color: '#ffffff',
                fontSize: '1rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                transition: 'background-color 0.15s',
              }}
            >
              <span>Explore Features</span>
            </button>
          </div>

          {/* Trust bullets */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 20,
              flexWrap: 'wrap',
              justifyContent: 'center',
              marginTop: 12,
              fontSize: '0.8125rem',
              color: '#94a3b8',
              fontWeight: 600,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <CheckCircleIcon style={{ width: 16, height: 16, color: '#34d399' }} />
              <span>100% Free for Students</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <CheckCircleIcon style={{ width: 16, height: 16, color: '#34d399' }} />
              <span>Works Completely Offline (PWA)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <CheckCircleIcon style={{ width: 16, height: 16, color: '#34d399' }} />
              <span>Official College DTTR PDF</span>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
