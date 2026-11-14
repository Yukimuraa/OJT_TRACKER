import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@astryxdesign/core/Button';
import { GraduationCapIcon, MenuIcon, CloseIcon } from '../../components/common/BrandIcons';

const NAV_LINKS = [
  { label: 'Home', href: '#home' },
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'About', href: '#about' },
];

export function LandingNav({ onRegister, onLogin }) {
  const [activeSection, setActiveSection] = useState('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const menuRef = useRef(null);

  // Active section spy and scroll progress tracking
  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = totalScroll > 0 ? Math.min(100, Math.max(0, (currentScroll / totalScroll) * 100)) : 0;
      setScrollProgress(progress);
      setIsScrolled(currentScroll > 15);

      const sections = ['home', 'features', 'product-preview', 'how-it-works', 'about'];
      let current = 'home';
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 140 && rect.bottom >= 140) {
            current = id;
          }
        }
      }
      setActiveSection(current);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock background scrolling when mobile menu is active
  useEffect(() => {
    if (isMobileMenuOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isMobileMenuOpen]);

  // Handle ESC key to dismiss mobile menu
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileMenuOpen]);

  const handleNavClick = (href) => (e) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    const id = href.replace('#', '');
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
          backgroundColor: isScrolled ? 'rgba(255, 255, 255, 0.98)' : 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: isScrolled ? '1px solid #e2e8f0' : '1px solid rgba(226, 232, 240, 0.7)',
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

            {/* Desktop Navigation Links (centered) */}
            <nav
              className="ojt-desktop-only"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 32,
              }}
            >
              {NAV_LINKS.map(({ label, href }) => {
                const isSelected = activeSection === href.replace('#', '');
                return (
                  <a
                    key={label}
                    href={href}
                    onClick={handleNavClick(href)}
                    style={{
                      fontSize: '0.925rem',
                      fontWeight: isSelected ? 700 : 500,
                      color: isSelected ? '#10b981' : '#64748b',
                      textDecoration: 'none',
                      transition: 'color 0.15s ease',
                      position: 'relative',
                      padding: '8px 0',
                    }}
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
              <Button
                label="Login"
                variant="ghost"
                size="md"
                onClick={onLogin}
              />
              <Button
                label="Get Started"
                variant="primary"
                size="md"
                onClick={onRegister}
              />
            </div>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              className="ojt-mobile-only"
              aria-label={isMobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
              aria-expanded={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                border: '1px solid #e2e8f0',
                backgroundColor: isMobileMenuOpen ? '#f1f5f9' : '#ffffff',
                color: '#142b49',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'background-color 0.15s, border-color 0.15s',
              }}
            >
              {isMobileMenuOpen ? (
                <CloseIcon style={{ width: 22, height: 22 }} />
              ) : (
                <MenuIcon style={{ width: 22, height: 22 }} />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Panel & Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="ojt-mobile-only"
          style={{
            position: 'fixed',
            inset: 0,
            top: 72,
            zIndex: 49,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Backdrop Blur */}
          <div
            onClick={() => setIsMobileMenuOpen(false)}
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(20, 43, 73, 0.4)',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
            }}
          />

          {/* Drawer Menu Body */}
          <div
            ref={menuRef}
            style={{
              position: 'relative',
              backgroundColor: '#ffffff',
              borderBottom: '1px solid #e2e8f0',
              boxShadow: '0 20px 30px -10px rgba(20, 43, 73, 0.15)',
              padding: '24px 20px 32px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
              maxHeight: 'calc(100vh - 80px)',
              overflowY: 'auto',
              animation: 'ojtSlideDown 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {/* Navigation links */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {NAV_LINKS.map(({ label, href }) => {
                const isSelected = activeSection === href.replace('#', '');
                return (
                  <a
                    key={label}
                    href={href}
                    onClick={handleNavClick(href)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '14px 16px',
                      borderRadius: 12,
                      textDecoration: 'none',
                      fontSize: '1rem',
                      fontWeight: isSelected ? 700 : 600,
                      color: isSelected ? '#10b981' : '#142b49',
                      backgroundColor: isSelected ? 'rgba(16, 185, 129, 0.08)' : 'transparent',
                      minHeight: 48,
                      transition: 'background-color 0.15s',
                    }}
                  >
                    <span>{label}</span>
                    {isSelected && (
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          backgroundColor: '#10b981',
                        }}
                      />
                    )}
                  </a>
                );
              })}
            </div>

            <div style={{ height: 1, backgroundColor: '#e2e8f0', margin: '4px 0' }} />

            {/* Mobile Auth Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onLogin?.();
                }}
                style={{
                  width: '100%',
                  minHeight: 48,
                  borderRadius: 12,
                  border: '1.5px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  color: '#142b49',
                  fontSize: '1rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background-color 0.15s',
                }}
              >
                Login
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onRegister?.();
                }}
                style={{
                  width: '100%',
                  minHeight: 48,
                  borderRadius: 12,
                  border: 'none',
                  backgroundColor: '#10b981',
                  color: '#ffffff',
                  fontSize: '1rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
                  transition: 'background-color 0.15s, transform 0.15s',
                }}
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
