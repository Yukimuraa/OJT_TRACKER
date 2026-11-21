import React, { useState, useEffect } from 'react';
import { Button } from '@astryxdesign/core/Button';
import {
  GraduationCapIcon,
  HomeIcon,
  SparklesIcon,
  DeviceMobileIcon,
  ClipboardCheckIcon,
  UserIcon,
} from '../../components/common/BrandIcons';

const NAV_LINKS = [
  { id: 'home', label: 'Home', href: '#home', Icon: HomeIcon },
  { id: 'features', label: 'Features', href: '#features', Icon: SparklesIcon },
  { id: 'product-preview', label: 'Preview', href: '#product-preview', Icon: DeviceMobileIcon },
  { id: 'how-it-works', label: 'How It Works', href: '#how-it-works', Icon: ClipboardCheckIcon },
];

export function LandingNav({ onRegister, onLogin }) {
  const [activeSection, setActiveSection] = useState('home');
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Active section spy and scroll progress tracking
  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = totalScroll > 0 ? Math.min(100, Math.max(0, (currentScroll / totalScroll) * 100)) : 0;
      setScrollProgress(progress);
      setIsScrolled(currentScroll > 15);

      if (currentScroll < 80) {
        setActiveSection('home');
        return;
      }

      // Check if near page bottom, activate the last section
      if (window.innerHeight + currentScroll >= document.documentElement.scrollHeight - 60) {
        setActiveSection('how-it-works');
        return;
      }

      const sections = ['home', 'product-preview', 'features', 'how-it-works'];
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 160 && rect.bottom >= 100) {
            setActiveSection(id);
            break;
          }
        }
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (href) => (e) => {
    e.preventDefault();
    const id = href.replace('#', '');
    setActiveSection(id);

    if (id === 'home') {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
      return;
    }

    const element = document.getElementById(id);
    if (element) {
      const topOffset = 76;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - topOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <>
      {/* Top thin scroll progress bar */}
      <div
        id="ojt-scroll-progress-bar"
        style={{
          width: `${scrollProgress}%`,
        }}
      />

      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          width: '100%',
          backgroundColor: isScrolled ? 'rgba(252, 252, 251, 0.98)' : 'rgba(252, 252, 251, 0.92)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: isScrolled ? '1px solid #e5e7eb' : '1px solid rgba(229, 231, 235, 0.7)',
          boxShadow: isScrolled ? '0 4px 20px -2px rgba(20, 43, 73, 0.08)' : 'none',
          transition: 'all 0.25s ease',
        }}
      >
        <div className="ojt-landing-container">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              height: 72,
            }}
          >
            {/* Brand Logo & Title */}
            <a
              href="#home"
              onClick={handleNavClick('#home')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                textDecoration: 'none',
                color: '#142b49',
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  backgroundColor: 'rgba(16, 185, 129, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#10b981',
                }}
              >
                <GraduationCapIcon style={{ width: 22, height: 22 }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span
                  style={{
                    fontSize: '1.125rem',
                    fontWeight: 800,
                    letterSpacing: '-0.02em',
                    lineHeight: 1.2,
                    color: '#142b49',
                  }}
                >
                  OJT Tracker
                </span>
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    color: '#10b981',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                  }}
                >
                  Student Portal
                </span>
              </div>
            </a>

            {/* Desktop Navigation Links (centered, brand emerald on hover and active, never black) */}
            <nav
              className="ojt-desktop-only"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 32,
              }}
            >
              {NAV_LINKS.map(({ label, href, id }) => {
                const isSelected = activeSection === id;
                return (
                  <a
                    key={id}
                    href={href}
                    onClick={handleNavClick(href)}
                    className={`ojt-landing-nav-link ${isSelected ? 'active' : ''}`}
                  >
                    {label}
                    {isSelected && (
                      <span
                        style={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          height: 2,
                          backgroundColor: '#10b981',
                          borderRadius: 2,
                        }}
                      />
                    )}
                  </a>
                );
              })}
            </nav>

            {/* Desktop Actions (Login & Get Started) */}
            <div
              className="ojt-desktop-only"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <button
                type="button"
                onClick={onLogin}
                aria-label="Login to account"
                style={{
                  padding: '8px 18px',
                  fontSize: '0.9375rem',
                  fontWeight: 600,
                  color: '#142b49',
                  backgroundColor: '#ffffff',
                  border: '1.5px solid #cbd5e1',
                  borderRadius: 10,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  minHeight: 40,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#10b981';
                  e.currentTarget.style.color = '#10b981';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#cbd5e1';
                  e.currentTarget.style.color = '#142b49';
                }}
              >
                Login
              </button>
              <button
                type="button"
                onClick={onRegister}
                aria-label="Create account"
                style={{
                  padding: '8px 20px',
                  fontSize: '0.9375rem',
                  fontWeight: 700,
                  color: '#ffffff',
                  backgroundColor: '#10b981',
                  border: 'none',
                  borderRadius: 10,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(16, 185, 129, 0.25)',
                  transition: 'all 0.15s ease',
                  minHeight: 40,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#059669';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#10b981';
                }}
              >
                Get Started
              </button>
            </div>

            {/* Mobile Top Header Actions */}
            <div
              className="ojt-mobile-only"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                flexShrink: 0,
              }}
            >
              <button
                type="button"
                onClick={onLogin}
                aria-label="Login"
                style={{
                  padding: '7px 14px',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: '#142b49',
                  backgroundColor: '#ffffff',
                  border: '1.5px solid #cbd5e1',
                  borderRadius: 8,
                  cursor: 'pointer',
                  minHeight: 38,
                  whiteSpace: 'nowrap',
                }}
              >
                Login
              </button>
              <button
                type="button"
                onClick={onRegister}
                aria-label="Get Started"
                style={{
                  padding: '7px 14px',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  color: '#ffffff',
                  backgroundColor: '#10b981',
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(16, 185, 129, 0.25)',
                  minHeight: 38,
                  whiteSpace: 'nowrap',
                }}
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Fixed Mobile Bottom Navigation Bar (replaces hamburger menu on mobile screen sizes) */}
      <nav
        className="ojt-landing-mobile-bottom-nav ojt-mobile-only"
        aria-label="Mobile Landing Navigation"
      >
        {NAV_LINKS.map(({ label, href, id, Icon }) => {
          const isSelected = activeSection === id;
          return (
            <button
              key={id}
              type="button"
              onClick={handleNavClick(href)}
              aria-label={label}
              aria-current={isSelected ? 'page' : undefined}
              className={`ojt-landing-bottom-nav-item ${isSelected ? 'active' : ''}`}
            >
              {/* Active top accent indicator */}
              {isSelected && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-6px',
                    width: '28px',
                    height: '3px',
                    backgroundColor: '#10b981',
                    borderRadius: '0 0 3px 3px',
                  }}
                />
              )}
              <Icon
                style={{
                  width: 20,
                  height: 20,
                  color: isSelected ? '#10b981' : '#64748b',
                  marginBottom: 2,
                  transition: 'color 0.15s ease',
                }}
              />
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: isSelected ? 700 : 500,
                  color: isSelected ? '#10b981' : '#64748b',
                  transition: 'color 0.15s ease',
                }}
              >
                {label}
              </span>
            </button>
          );
        })}

        {/* Mobile Landing Bottom Bar Login Button */}
        <button
          type="button"
          onClick={onLogin}
          aria-label="Student Login"
          className="ojt-landing-bottom-nav-item"
          style={{
            color: '#10b981',
          }}
        >
          <div style={{ width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 2 }}>
            <UserIcon width={20} height={20} />
          </div>
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              color: '#10b981',
            }}
          >
            Login
          </span>
        </button>
      </nav>
    </>
  );
}
