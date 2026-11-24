import React, { useState } from 'react';
import { Card } from '@astryxdesign/core/Card';
import { Button } from '@astryxdesign/core/Button';
import { Divider } from '@astryxdesign/core/Divider';
import { APP_CONFIG } from '../../config/appConfig';
import { GraduationCapIcon } from '../../components/common/BrandIcons';

const FAQS = [
  {
    q: 'How do I log my daily morning and afternoon training attendance?',
    a: 'Navigate to the Time Logs section. Click "Add Time Log" or select today\'s date. Enter your AM Arrival, AM Departure, PM Arrival, and PM Departure times, along with a brief summary of tasks accomplished. The system automatically computes your daily rendered hours.',
  },
  {
    q: 'How do I export or print my official Daily Time & Tasks Record (DTTR)?',
    a: 'Go to Time Logs and click "Print DTTR". Choose your preferred format (e.g. Computer Studies CHMSU template, Standard Form, or your custom uploaded template), select the report month and year, preview the populated sheet, and click "Print" or "Download PDF". The document is automatically scaled to Philippine Long Bond paper.',
  },
  {
    q: 'Can I upload my own college or company DTTR template?',
    a: 'Yes! In the DTTR Template Selector, click "Upload Your Own Template". Select any valid PDF file up to 10 MB. You can preview the canvas and configure field coordinate mappings so your monthly hours overlay directly onto your institution\'s official template.',
  },
  {
    q: 'Does my uploaded template sync if I use another computer or browser?',
    a: 'Yes. Custom PDF templates are securely uploaded to your private account on the server. Whenever you sign in on another computer, browser, or installed PWA, your templates and field mappings synchronize automatically.',
  },
  {
    q: 'How do I install the app on my phone, tablet, or desktop?',
    a: 'On desktop (Chrome or Edge), look for the install icon in the address bar or visit Settings to click "Install App". On Android, tap the three dots in Chrome and choose "Install app" or "Add to Home screen". On iOS (iPhone/iPad), open in Safari, tap the Share icon, and select "Add to Home Screen".',
  },
  {
    q: 'What should I do if I forget my account password?',
    a: 'On the Login page, click "Forgot Password?". Enter your registered email address to receive a secure password recovery link. Open the link in your email, set a new password, and proceed to sign in.',
  },
  {
    q: 'Can I record attendance when there is no internet connection?',
    a: 'Yes. As a Progressive Web App, your previously cached records and interface remain functional offline. You can log attendance locally, and records will sync with the server once your connection is restored.',
  },
];

export function HelpSupportPage({ onNavigate }) {
  const [openFaq, setOpenFaq] = useState(null);

  const handleBack = () => {
    if (onNavigate) {
      if (typeof window !== 'undefined' && window.history.length > 1) {
        window.history.back();
      } else {
        onNavigate('landing');
      }
    }
  };

  return (
    <div style={{ backgroundColor: '#FCFCFB', minHeight: '100vh', padding: 'clamp(20px, 4vw, 48px) 16px' }}>
      <div style={{ maxWidth: 840, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Top Header & Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
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
            <div>
              <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#142b49', display: 'block' }}>
                {APP_CONFIG.name}
              </span>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Help Center &amp; Support
              </span>
            </div>
          </div>

          <Button label="← Return to Previous Page" variant="secondary" size="sm" onClick={handleBack} />
        </div>

        {/* Content Card */}
        <Card elevation="low" padding={6} style={{ backgroundColor: '#ffffff', borderRadius: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24, color: '#334155', lineHeight: 1.7 }}>
            <div>
              <h1 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.25rem)', fontWeight: 800, color: '#142b49', margin: '0 0 10px 0', letterSpacing: '-0.02em' }}>
                Help &amp; Frequently Asked Questions
              </h1>
              <p style={{ margin: 0, fontSize: '1rem', color: '#64748b' }}>
                Quick answers, configuration guidance, and step-by-step troubleshooting for student interns.
              </p>
            </div>

            <Divider variant="subtle" />

            {/* FAQs Accordion */}
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#142b49', marginBottom: 14 }}>
                Frequently Asked Questions
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {FAQS.map((faq, idx) => {
                  const isOpen = openFaq === idx;
                  return (
                    <div
                      key={idx}
                      style={{
                        border: '1px solid #e2e8f0',
                        borderRadius: 10,
                        backgroundColor: isOpen ? '#f8fafc' : '#ffffff',
                        overflow: 'hidden',
                        transition: 'background-color 0.15s ease',
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => setOpenFaq(isOpen ? null : idx)}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          padding: '14px 18px',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 12,
                        }}
                      >
                        <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#142b49' }}>
                          {faq.q}
                        </span>
                        <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#10b981' }}>
                          {isOpen ? '−' : '+'}
                        </span>
                      </button>
                      {isOpen && (
                        <div style={{ padding: '0 18px 16px 18px', fontSize: '0.9rem', color: '#475569', lineHeight: 1.6 }}>
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <Divider variant="subtle" />

            {/* Troubleshooting Guide */}
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#142b49', marginBottom: 12 }}>
                Basic Troubleshooting Guide
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ padding: 16, backgroundColor: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                  <div style={{ fontWeight: 700, color: '#142b49', marginBottom: 4 }}>
                    Issue: PDF Template Upload Fails
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                    Ensure your template is an actual PDF document and does not exceed the maximum file size of 10 MB. Scanned multi-page color documents may exceed this size; try compressing the PDF before uploading.
                  </div>
                </div>

                <div style={{ padding: 16, backgroundColor: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                  <div style={{ fontWeight: 700, color: '#142b49', marginBottom: 4 }}>
                    Issue: App Update Available or Outdated Cache
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                    Visit Settings &rarr; Application Updates and click &ldquo;Check for Updates&rdquo;. When a newer version is detected, click &ldquo;Update Now&rdquo; to load the latest service worker cleanly without losing your login session or saved records.
                  </div>
                </div>

                <div style={{ padding: 16, backgroundColor: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                  <div style={{ fontWeight: 700, color: '#142b49', marginBottom: 4 }}>
                    Issue: Forgot Password Email Not Arriving
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                    Check your Spam or Junk folder for an email from {APP_CONFIG.name}. Password reset tokens expire after 60 minutes for security reasons. If expired, submit a new request on the Forgot Password page.
                  </div>
                </div>
              </div>
            </div>

            <Divider variant="subtle" />

            {/* Support Inquiries */}
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#142b49', marginBottom: 10 }}>
                Need Further Assistance?
              </h2>
              <p style={{ margin: '0 0 12px 0', fontSize: '0.925rem', color: '#475569' }}>
                For technical issues, institutional setup inquiries, or account questions, contact our support desk:
              </p>
              <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: 16, fontSize: '0.9rem' }}>
                <div><strong>Email:</strong> <code>dayonmakima@gmail.com</code></div>
                <div><strong>Developer / Maintainer:</strong> <code>Joemarie Damasing</code></div>
                {/* <div><strong>Official Portal:</strong> <code>{APP_CONFIG.developer.website}</code></div> */}
              </div>
            </div>

            <Divider variant="subtle" />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <span style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>
                &copy; {APP_CONFIG.developer.copyrightYear} {APP_CONFIG.name}. All rights reserved.
              </span>
              <Button label="Back to Top" variant="secondary" size="sm" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
