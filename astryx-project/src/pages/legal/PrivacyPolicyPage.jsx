import React from 'react';
import { Card } from '@astryxdesign/core/Card';
import { Button } from '@astryxdesign/core/Button';
import { Divider } from '@astryxdesign/core/Divider';
import { APP_CONFIG } from '../../config/appConfig';
import { GraduationCapIcon } from '../../components/common/BrandIcons';

export function PrivacyPolicyPage({ onNavigate }) {
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
                Legal &amp; Transparency
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
                Privacy Policy
              </h1>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                Effective Date: {APP_CONFIG.releaseDate} &bull; Applicable Law: Republic Act No. 10173 (Data Privacy Act of 2012)
              </p>
            </div>

            <div style={{ backgroundColor: 'rgba(2, 132, 199, 0.06)', border: '1px solid rgba(2, 132, 199, 0.2)', borderRadius: 10, padding: 14 }}>
              <p style={{ margin: 0, fontSize: '0.875rem', color: '#0369a1' }}>
                <strong>Important Notice:</strong> This Privacy Policy outlines the personal data handling practices of <strong>{APP_CONFIG.name}</strong>. Items enclosed in square brackets ( <code>JOEMARIE DAMASING</code>) represent specific institutional or organizational contact information to be provided by the system administrator or deploying entity.
              </p>
            </div>

            <Divider variant="subtle" />

            {/* 1. Information Collected */}
            <section>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#142b49', marginBottom: 8 }}>
                1. Information We Collect
              </h2>
              <p>
                To provide you with internship hour computation, daily attendance logging, and official report generation, the application collects and processes the following categories of information:
              </p>
              <ul style={{ paddingLeft: 24, margin: '8px 0' }}>
                <li>
                  <strong>Account &amp; Authentication Credentials:</strong> Your registered email address, hashed account password (passwords are stored as one-way cryptographic hashes using Laravel Bcrypt and are never stored in plaintext), and session identifiers.
                </li>
                <li>
                  <strong>Student Academic Profile:</strong> Full name, student identification number (e.g., college ID), curriculum requirements, and target required hours.
                </li>
                <li>
                  <strong>Training Placement &amp; Institutional Details:</strong> Name of your enrolled school or university, host training establishment (company/agency), department, and designated supervisor name.
                </li>
                <li>
                  <strong>Attendance &amp; Training Records:</strong> Daily morning (AM) and afternoon (PM) time-in/time-out timestamps, recorded daily hours, and brief narrative descriptions of daily tasks rendered.
                </li>
                <li>
                  <strong>Uploaded DTTR PDF Templates:</strong> Custom Daily Time &amp; Tasks Record PDF template files uploaded by you, including original filenames, file sizes, and user-defined document field-position mappings.
                </li>
                <li>
                  <strong>Notification &amp; Device Preferences:</strong> Daily reminder schedule preferences and browser Web Push notification endpoint subscriptions (if enabled by you on your device).
                </li>
              </ul>
            </section>

            {/* 2. How Information is Used */}
            <section>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#142b49', marginBottom: 8 }}>
                2. How We Use Your Information
              </h2>
              <p>The information collected is used solely for the following legitimate training-management purposes:</p>
              <ul style={{ paddingLeft: 24, margin: '8px 0' }}>
                <li>Computing total accumulated internship hours against your target training quota.</li>
                <li>Generating printable, formatted Daily Time &amp; Tasks Record (DTTR) sheets on standard Long Bond paper.</li>
                <li>Providing cross-browser synchronization so your records and templates are accessible whenever you sign in.</li>
                <li>Dispatching transactional password recovery emails when requested by you.</li>
                <li>Delivering local or push shift reminders based on your configured work schedule.</li>
              </ul>
            </section>

            {/* 3. Storage and Protection */}
            <section>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#142b49', marginBottom: 8 }}>
                3. How Information is Stored and Protected
              </h2>
              <p>
                The application implements structured technical safeguards:
              </p>
              <ul style={{ paddingLeft: 24, margin: '8px 0' }}>
                <li>
                  <strong>Session Security:</strong> Authenticated sessions use HTTP-only, SameSite cookies with Laravel Sanctum and automated Cross-Site Request Forgery (CSRF) token validation.
                </li>
                <li>
                  <strong>Password Security:</strong> Passwords are protected using standard Bcrypt hashing with a minimum work factor of 12. Plaintext passwords are never logged or stored.
                </li>
                <li>
                  <strong>Storage Isolation:</strong> Uploaded custom PDF files are saved to private server storage and are accessible only after the authenticated user ownership is validated.
                </li>
                <li>
                  <strong>Local Caching:</strong> For offline functionality, records and templates are temporarily cached within your browser&apos;s local storage and Service Worker precache.
                </li>
              </ul>
            </section>

            {/* 4. Uploaded PDF Handling */}
            <section>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#142b49', marginBottom: 8 }}>
                4. Uploaded PDF Template Handling
              </h2>
              <p>
                When you upload a custom PDF template:
              </p>
              <ul style={{ paddingLeft: 24, margin: '8px 0' }}>
                <li>The file is validated to ensure it is a valid PDF and does not exceed the 10 MB limit.</li>
                <li>The file is assigned an isolated path linked to your user identifier.</li>
                <li>The file is used exclusively to render your own preview and generate your populated DTTR document.</li>
                <li>If you delete a template, the file is deleted from both the database and physical server storage.</li>
              </ul>
            </section>

            {/* 5. Push Notifications */}
            <section>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#142b49', marginBottom: 8 }}>
                5. Push Notifications &amp; Device Subscriptions
              </h2>
              <p>
                If you opt in to receive shift reminders, your browser creates a standard Web Push subscription identifier that is saved with your account. You can disable or modify notifications at any time directly through the Settings page or via your browser site settings.
              </p>
            </section>

            {/* 6. Data Sharing */}
            <section>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#142b49', marginBottom: 8 }}>
                6. Data Sharing &amp; Third-Party Services
              </h2>
              <p>
                We do not sell, rent, or trade your personal data. Data is processed through the following necessary channels:
              </p>
              <ul style={{ paddingLeft: 24, margin: '8px 0' }}>
                <li>
                  <strong>Transactional Email Service:</strong> Password reset requests route through an external SMTP provider (such as Google Gmail SMTP) solely to transmit the recovery link to your inbox.
                </li>
                <li>
                  <strong>Your Academic Institution &amp; Supervisor:</strong> When you print or export your DTTR report, you voluntarily disclose your attendance records to your school coordinator and employer for grading and accreditation.
                </li>
              </ul>
            </section>

            {/* 7. Data Retention */}
            <section>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#142b49', marginBottom: 8 }}>
                7. Data Retention
              </h2>
              <p>
                Your student profile, time entries, and templates are retained for the duration of your active account to maintain training compliance continuity. Data will be retained for up to <code>{APP_CONFIG.dataPrivacy.retentionDefaultMonths} months</code> following your expected internship conclusion, or until you choose to delete your records or request account removal.
              </p>
            </section>

            {/* 8. User Rights */}
            <section>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#142b49', marginBottom: 8 }}>
                8. Your Rights Under Philippine Law (R.A. 10173)
              </h2>
              <p>
                Under the Data Privacy Act of 2012, you possess the following rights regarding your personal information:
              </p>
              <ul style={{ paddingLeft: 24, margin: '8px 0' }}>
                <li><strong>Right to be Informed:</strong> To understand how your personal information is gathered and processed.</li>
                <li><strong>Right to Access:</strong> To view your profile, logged hours, and uploaded documents at any time.</li>
                <li><strong>Right to Rectification:</strong> To modify incorrect attendance logs or profile parameters via the Edit tools.</li>
                <li><strong>Right to Erasure or Blocking:</strong> To delete individual records, clear all logged data, or remove custom templates.</li>
                <li><strong>Right to Data Portability:</strong> To export a complete JSON backup of all your recorded training records via Settings.</li>
              </ul>
            </section>

            {/* 9. Account Deletion */}
            <section>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#142b49', marginBottom: 8 }}>
                9. Account &amp; Data Deletion Procedures
              </h2>
              <p>
                You may clear all recorded time entries at any time using the <em>Danger Zone &rarr; Clear All Records</em> feature in Settings. To permanently delete your entire account, student profile, and stored PDF templates from the server, please submit a deletion request to the contact address below.
              </p>
            </section>

            {/* 10. Contact */}
            <section>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#142b49', marginBottom: 8 }}>
                10. Privacy Contact Information
              </h2>
              <p>
                For privacy-related inquiries, data correction requests, or questions regarding our adherence to R.A. 10173, please contact:
              </p>
              <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: 16, fontSize: '0.9rem' }}>
                <div><strong>Application:</strong> Tempus</div>
                {/* <div><strong>Data Protection Officer:</strong> <code>Joemarie Damasing</code></div> */}
                {/* <div><strong>Institution / Organization:</strong> <code>{APP_CONFIG.developer.institution}</code></div> */}
                <div><strong>Email:</strong> <code>dayonmakima@gmail.com</code></div>
                {/* <div><strong>Office Address:</strong> <code>{APP_CONFIG.developer.officeAddress}</code></div> */}
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
