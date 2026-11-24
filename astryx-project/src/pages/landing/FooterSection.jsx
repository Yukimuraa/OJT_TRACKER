import React from 'react';
import { GraduationCapIcon } from '../../components/common/BrandIcons';
import { APP_CONFIG } from '../../config/appConfig';

const CURRENT_YEAR = new Date().getFullYear();

export function FooterSection({ onRegister, onLogin, onNavigate }) {
  const handleScroll = (id) => (e) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const topOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - topOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  const handleLink = (page) => (e) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate(page);
    }
  };

  return (
    <footer
      style={{
        backgroundColor: '#FCFCFB',
        borderTop: '1px solid #e5e7eb',
        padding: 'clamp(40px, 6vw, 64px) 0 32px 0',
      }}
    >
      <div className="ojt-landing-container">
        {/* Main Footer Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 36,
            paddingBottom: 40,
            borderBottom: '1px solid #f1f5f9',
          }}
        >
          {/* Brand Info Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, gridColumn: 'span 2' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  backgroundColor: 'rgba(16, 185, 129, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#10b981',
                }}
              >
                <GraduationCapIcon style={{ width: 20, height: 20 }} />
              </div>
              <span
                style={{
                  fontSize: '1.15rem',
                  fontWeight: 800,
                  color: '#142b49',
                  letterSpacing: '-0.02em',
                }}
              >
                {APP_CONFIG.name}
              </span>
            </div>

            <p
              style={{
                fontSize: '0.875rem',
                color: '#64748b',
                lineHeight: 1.6,
                margin: 0,
                maxWidth: 380,
              }}
            >
              A modern Progressive Web Application designed specifically for Filipino student
              interns to record daily attendance, monitor hours rendered, and export official
              college DTTR reports.
            </p>

            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              <button
                type="button"
                onClick={onLogin}
                style={{
                  padding: '6px 14px',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: '#142b49',
                  backgroundColor: '#ffffff',
                  border: '1.5px solid #cbd5e1',
                  borderRadius: 8,
                  cursor: 'pointer',
                }}
              >
                Student Login
              </button>
              <button
                type="button"
                onClick={onRegister}
                style={{
                  padding: '6px 14px',
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  color: '#ffffff',
                  backgroundColor: '#000000',
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer',
                  transition: 'background-color 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#1f2937';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#000000';
                }}
              >
                Create Account
              </button>
            </div>
          </div>

          {/* 1. Product Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <span
              style={{
                fontSize: '0.8125rem',
                fontWeight: 800,
                color: '#142b49',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              Product
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <a
                href="#login"
                onClick={(e) => {
                  e.preventDefault();
                  onLogin?.();
                }}
                style={{
                  fontSize: '0.9rem',
                  color: '#64748b',
                  textDecoration: 'none',
                  transition: 'color 0.15s',
                  fontWeight: 600,
                }}
              >
                Student Login
              </a>
              <a
                href="#register"
                onClick={(e) => {
                  e.preventDefault();
                  onRegister?.();
                }}
                style={{
                  fontSize: '0.9rem',
                  color: '#64748b',
                  textDecoration: 'none',
                  transition: 'color 0.15s',
                }}
              >
                Create Account
              </a>
              <a
                href="#features"
                onClick={handleScroll('features')}
                style={{
                  fontSize: '0.9rem',
                  color: '#64748b',
                  textDecoration: 'none',
                  transition: 'color 0.15s',
                }}
              >
                Features
              </a>
              <a
                href="#how-it-works"
                onClick={handleScroll('how-it-works')}
                style={{
                  fontSize: '0.9rem',
                  color: '#64748b',
                  textDecoration: 'none',
                  transition: 'color 0.15s',
                }}
              >
                How It Works
              </a>
              <span
                style={{
                  fontSize: '0.8125rem',
                  fontWeight: 800,
                  color: '#142b49',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginTop: 10,
                }}
              >
                Support
              </span>
              <a
                href="/help"
                onClick={handleLink('help')}
                style={{
                  fontSize: '0.9rem',
                  color: '#64748b',
                  textDecoration: 'none',
                  transition: 'color 0.15s',
                }}
              >
                Help &amp; Support
              </a>
              <a
                href="/report-problem"
                onClick={handleLink('report-problem')}
                style={{
                  fontSize: '0.9rem',
                  color: '#64748b',
                  textDecoration: 'none',
                  transition: 'color 0.15s',
                }}
              >
                Report a Problem
              </a>
            </div>
          </div>

          {/* 2. Legal Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <span
              style={{
                fontSize: '0.8125rem',
                fontWeight: 800,
                color: '#142b49',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              Legal
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <a
                href="/privacy"
                onClick={handleLink('privacy')}
                style={{
                  fontSize: '0.9rem',
                  color: '#64748b',
                  textDecoration: 'none',
                  transition: 'color 0.15s',
                }}
              >
                Privacy Policy
              </a>
              <a
                href="/terms"
                onClick={handleLink('terms')}
                style={{
                  fontSize: '0.9rem',
                  color: '#64748b',
                  textDecoration: 'none',
                  transition: 'color 0.15s',
                }}
              >
                Terms of Service
              </a>
            </div>
          </div>

          {/* 3. About Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <span
              style={{
                fontSize: '0.8125rem',
                fontWeight: 800,
                color: '#142b49',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              About
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <a
                href="/about"
                onClick={handleLink('about')}
                style={{
                  fontSize: '0.9rem',
                  color: '#64748b',
                  textDecoration: 'none',
                  transition: 'color 0.15s',
                }}
              >
                About {APP_CONFIG.shortName}
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Subtle Version */}
        <div
          style={{
            paddingTop: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 16,
            fontSize: '0.8125rem',
            color: '#94a3b8',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <span>
              &copy; {CURRENT_YEAR} {APP_CONFIG.name}. Built with care for student interns.
            </span>
            <span
              style={{
                fontSize: '0.75rem',
                backgroundColor: '#f1f5f9',
                color: '#64748b',
                padding: '2px 8px',
                borderRadius: 6,
                fontWeight: 600,
              }}
            >
              v{APP_CONFIG.version}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#10b981' }} />
            <span style={{ color: '#64748b', fontWeight: 600 }}>All Systems Operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
