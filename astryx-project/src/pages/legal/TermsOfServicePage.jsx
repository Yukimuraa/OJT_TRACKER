import React from 'react';
import { Card } from '@astryxdesign/core/Card';
import { Button } from '@astryxdesign/core/Button';
import { Divider } from '@astryxdesign/core/Divider';
import { APP_CONFIG } from '../../config/appConfig';
import { GraduationCapIcon } from '../../components/common/BrandIcons';

export function TermsOfServicePage({ onNavigate }) {
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
                Legal &amp; Guidelines
              </span>
            </div>
          </div>

          <Button label="← Return to Previous Page" variant="secondary" size="sm" onClick={handleBack} />
        </div>

        {/* Content Card */}
        <Card elevation="low" padding={6} style={{ backgroundColor: '#ffffff', borderRadius: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, color: '#334155', lineHeight: 1.7, fontSize: '0.95rem' }}>
            <div>
              <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, color: '#142b49', margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
                Terms of Service
              </h1>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                Effective Date: {APP_CONFIG.releaseDate} &bull; Version: {APP_CONFIG.version}
              </p>
            </div>

            <div style={{ backgroundColor: 'rgba(2, 132, 199, 0.06)', border: '1px solid rgba(2, 132, 199, 0.2)', borderRadius: 10, padding: 14 }}>
              <p style={{ margin: 0, fontSize: '0.875rem', color: '#0369a1' }}>
                <strong>Student Intern Agreement:</strong> By accessing, installing, or registering an account on <strong>{APP_CONFIG.name}</strong>, you agree to comply with these Terms of Service. Placeholders enclosed in <code>[brackets]</code> indicate terms subject to formal institutional designation.
              </p>
            </div>

            <Divider variant="subtle" />

            {/* 1. Acceptance */}
            <section>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#142b49', marginBottom: 8 }}>
                1. Acceptance of Terms
              </h2>
              <p>
                These Terms of Service govern your use of the {APP_CONFIG.name} website, Progressive Web Application (PWA), and associated backend services. If you do not agree to these terms, please refrain from using this service.
              </p>
            </section>

            {/* 2. Eligibility & Account */}
            <section>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#142b49', marginBottom: 8 }}>
                2. Eligibility and Account Responsibilities
              </h2>
              <p>
                This application is designed for students enrolled in formal On-the-Job Training (OJT), practicum, or internship academic programs. When creating an account:
              </p>
              <ul style={{ paddingLeft: 24, margin: '8px 0' }}>
                <li>You must provide an accurate, active email address that you own and control.</li>
                <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
                <li>You must notify us promptly if you suspect unauthorized access to your account.</li>
              </ul>
            </section>

            {/* 3. Recordkeeping & Academic Honor */}
            <section>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#142b49', marginBottom: 8 }}>
                3. Accurate OJT Recordkeeping &amp; Academic Integrity
              </h2>
              <p>
                As a student trainee:
              </p>
              <ul style={{ paddingLeft: 24, margin: '8px 0' }}>
                <li>
                  <strong>Truthfulness:</strong> All morning and afternoon time intervals, rendered hours, and logged task narratives entered into this system must faithfully represent your actual physical or remote training attendance.
                </li>
                <li>
                  <strong>Official Validation:</strong> Generated DTTR reports are compliance drafts. They become legally and academically binding only upon physical or digital verification and signature by your designated Host Training Establishment (HTE) supervisor and submission to your college practicum coordinator.
                </li>
                <li>
                  <strong>Falsification:</strong> Falsifying hours or forging signatures constitutes academic dishonesty and may subject you to disciplinary sanctions under your institution&apos;s student handbook.
                </li>
              </ul>
            </section>

            {/* 4. Uploaded Files */}
            <section>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#142b49', marginBottom: 8 }}>
                4. Uploaded File Responsibilities
              </h2>
              <p>
                When uploading custom PDF templates to your private account:
              </p>
              <ul style={{ paddingLeft: 24, margin: '8px 0' }}>
                <li>You must ensure you have the appropriate right or academic permission to use the uploaded PDF template.</li>
                <li>You agree not to upload files containing malware, harmful scripts, or unlawful content.</li>
                <li>Files exceeding the 10 MB limit or files in formats other than PDF are automatically rejected.</li>
              </ul>
            </section>

            {/* 5. Permitted & Prohibited Use */}
            <section>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#142b49', marginBottom: 8 }}>
                5. Permitted and Prohibited Uses
              </h2>
              <p>
                You may use this application for personal internship documentation. You agree not to:
              </p>
              <ul style={{ paddingLeft: 24, margin: '8px 0' }}>
                <li>Interfere with, disrupt, or attempt to gain unauthorized access to servers, databases, or API routes.</li>
                <li>Attempt to bypass access controls or retrieve another student&apos;s private records or custom templates.</li>
                <li>Deploy automated scrapers, bots, or rate-limit-bypassing scripts against application endpoints.</li>
              </ul>
            </section>

            {/* 6. Template Usage & Pricing */}
            <section>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#142b49', marginBottom: 8 }}>
                6. Template Usage &amp; Service Availability
              </h2>
              <p>
                Standard built-in system templates (including official university formats) and custom template uploads are provided to student trainees. Any future premium templates or institutional add-on services, if introduced, will require explicit advance consent and display clear pricing terms before purchase.
              </p>
            </section>

            {/* 7. Service Availability & Offline Use */}
            <section>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#142b49', marginBottom: 8 }}>
                7. Service Availability &amp; Offline Operation
              </h2>
              <p>
                {APP_CONFIG.name} supports offline caching via Progressive Web App technology. However, an active internet connection is necessary to synchronize records between multiple browsers, upload templates, and receive server-side backups. We do not guarantee uninterrupted or error-free continuous operation.
              </p>
            </section>

            {/* 8. Disclaimers */}
            <section>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#142b49', marginBottom: 8 }}>
                8. Disclaimers and Limitations of Liability
              </h2>
              <p>
                The application is provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis. To the maximum extent permitted by Philippine law, {APP_CONFIG.name} and its developers disclaim all warranties, express or implied, including fitness for a particular academic or commercial purpose. We are not liable for lost grades, delayed internship approvals, or unvalidated logs resulting from failure to export or submit reports on time.
              </p>
            </section>

            {/* 9. Modifications */}
            <section>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#142b49', marginBottom: 8 }}>
                9. Changes to Service and Terms
              </h2>
              <p>
                We may periodically update these terms to reflect functional improvements, security updates, or legal changes. Updates will be documented in the What&apos;s New release notes and reflected with an updated effective date. Continued use constitutes acceptance of revised terms.
              </p>
            </section>

            {/* 10. Contact */}
            <section>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#142b49', marginBottom: 8 }}>
                10. Contact &amp; Inquiries
              </h2>
              <p>
                If you have questions regarding these Terms of Service or academic use compliance, please contact:
              </p>
              <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: 16, fontSize: '0.9rem' }}>
                <div><strong>Legal Representative:</strong> <code>{APP_CONFIG.developer.displayName}</code></div>
                <div><strong>Email:</strong> <code>{APP_CONFIG.developer.legalEmail}</code></div>
                <div><strong>Governing Jurisdiction:</strong> <code>{APP_CONFIG.developer.officeAddress}</code></div>
              </div>
            </section>

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
