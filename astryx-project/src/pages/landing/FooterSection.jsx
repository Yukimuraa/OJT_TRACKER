import React, { useState } from 'react';
import { Dialog, DialogHeader } from '@astryxdesign/core/Dialog';
import { Button } from '@astryxdesign/core/Button';
import { GraduationCapIcon, CheckCircleIcon } from '../../components/common/BrandIcons';

const CURRENT_YEAR = new Date().getFullYear();

export function FooterSection({ onRegister, onLogin }) {
  const [modalContent, setModalContent] = useState(null); // 'terms' | 'privacy' | 'contact' | null

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

  return (
    <>
      <footer
        style={{
          backgroundColor: '#ffffff',
          borderTop: '1px solid #e2e8f0',
          padding: 'clamp(40px, 6vw, 64px) 0 32px 0',
        }}
      >
        <div className="ojt-landing-container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 40,
              paddingBottom: 40,
              borderBottom: '1px solid #f1f5f9',
            }}
          >
            {/* Column 1: Brand Info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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
                  OJT Hours Tracker
                </span>
              </div>

              <p
                style={{
                  fontSize: '0.875rem',
                  color: '#64748b',
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                A modern Progressive Web Application designed specifically for Filipino student
                interns to record daily attendance, monitor hours rendered, and export official
                college DTTR reports.
              </p>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: '#059669',
                }}
              >
                <CheckCircleIcon style={{ width: 14, height: 14 }} />
                <span>Compliant with CHED &amp; State University Guidelines</span>
              </div>
            </div>

            {/* Column 2: Navigation */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <span
                style={{
                  fontSize: '0.8125rem',
                  fontWeight: 800,
                  color: '#142b49',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                Navigation
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <a
                  href="#home"
                  onClick={handleScroll('home')}
                  style={{
                    fontSize: '0.9rem',
                    color: '#64748b',
                    textDecoration: 'none',
                    transition: 'color 0.15s',
                  }}
                >
                  Home
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
                  Features &amp; Toolkit
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
                <a
                  href="#about"
                  onClick={handleScroll('about')}
                  style={{
                    fontSize: '0.9rem',
                    color: '#64748b',
                    textDecoration: 'none',
                    transition: 'color 0.15s',
                  }}
                >
                  About the Platform
                </a>
              </div>
            </div>

            {/* Column 3: Student Tools & Account */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <span
                style={{
                  fontSize: '0.8125rem',
                  fontWeight: 800,
                  color: '#142b49',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                Student Access
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
                  Create Free Account
                </a>
                <button
                  type="button"
                  onClick={() => setModalContent('contact')}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    textAlign: 'left',
                    fontSize: '0.9rem',
                    color: '#64748b',
                    cursor: 'pointer',
                  }}
                >
                  Support &amp; Feedback
                </button>
              </div>
            </div>

            {/* Column 4: Legal & Guidelines */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <span
                style={{
                  fontSize: '0.8125rem',
                  fontWeight: 800,
                  color: '#142b49',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                Trust &amp; Legal
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setModalContent('privacy')}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    textAlign: 'left',
                    fontSize: '0.9rem',
                    color: '#64748b',
                    cursor: 'pointer',
                  }}
                >
                  Privacy Policy
                </button>
                <button
                  type="button"
                  onClick={() => setModalContent('terms')}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    textAlign: 'left',
                    fontSize: '0.9rem',
                    color: '#64748b',
                    cursor: 'pointer',
                  }}
                >
                  Terms of Service
                </button>
                <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                  CHMSU CCS Approved Reference
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Copyright & Status */}
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
            <span>
              &copy; {CURRENT_YEAR} OJT Hours Tracker. Built with care for student interns.
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#10b981' }} />
              <span style={{ color: '#64748b', fontWeight: 600 }}>All Systems Operational</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Policy & Support Modal */}
      {modalContent && (
        <Dialog
          isOpen={Boolean(modalContent)}
          onOpenChange={(open) => {
            if (!open) setModalContent(null);
          }}
          purpose="info"
          width={560}
          maxHeight="85dvh"
        >
          <DialogHeader
            title={
              modalContent === 'terms'
                ? 'Terms of Service'
                : modalContent === 'privacy'
                ? 'Privacy Policy'
                : 'Contact & Support'
            }
            subtitle={
              modalContent === 'contact'
                ? 'Get assistance with your OJT Hours Tracker account or DTTR templates.'
                : 'Important guidelines for student account usage and data security.'
            }
            onOpenChange={(open) => {
              if (!open) setModalContent(null);
            }}
          />

          <div
            style={{
              padding: 24,
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              fontSize: '0.925rem',
              lineHeight: 1.6,
              color: '#475569',
              overflowY: 'auto',
            }}
          >
            {modalContent === 'privacy' && (
              <>
                <p>
                  <strong>Data Ownership:</strong> All training records, attendance hours, student
                  profile information, and custom DTTR templates belong exclusively to you.
                </p>
                <p>
                  <strong>Local-First &amp; Browser Security:</strong> Your records are securely stored
                  within your isolated browser storage. We never share or sell personal student data to
                  unauthorized third parties.
                </p>
                <p>
                  <strong>Official Documents:</strong> Generated DTTR reports are compiled locally on
                  your device using the official CHMSU College of Computer Studies portrait long bond
                  format.
                </p>
              </>
            )}

            {modalContent === 'terms' && (
              <>
                <p>
                  <strong>Academic Honor:</strong> Trainees are responsible for the truthfulness and
                  accuracy of all arrival and departure hours entered into this system.
                </p>
                <p>
                  <strong>Certification:</strong> Official Daily Time &amp; Tasks Records must be signed
                  by your authorized Industry Supervisor and submitted according to your college&apos;s
                  internship department regulations.
                </p>
                <p>
                  <strong>Free Availability:</strong> OJT Hours Tracker is provided free of charge for
                  student interns to assist with training compliance.
                </p>
              </>
            )}

            {modalContent === 'contact' && (
              <>
                <p>
                  Have questions about configuring your shift schedule, printing your DTTR, or
                  installing the PWA?
                </p>
                <div
                  style={{
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: 12,
                    padding: 16,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                  }}
                >
                  <div>
                    <strong>Support Email:</strong>{' '}
                    <span style={{ color: '#10b981' }}>support@ojt-tracker.ph</span>
                  </div>
                  <div>
                    <strong>Institution:</strong> Carlos Hilado Memorial State University (Main
                    Campus, Talisay City)
                  </div>
                  <div>
                    <strong>Department:</strong> College of Computer Studies (CCS)
                  </div>
                </div>
              </>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 12 }}>
              <Button
                label="Close"
                variant="primary"
                onClick={() => setModalContent(null)}
              />
            </div>
          </div>
        </Dialog>
      )}
    </>
  );
}
