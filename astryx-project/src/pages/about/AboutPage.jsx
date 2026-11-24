import React, { useState } from 'react';
import { Card } from '@astryxdesign/core/Card';
import { Button } from '@astryxdesign/core/Button';
import { Divider } from '@astryxdesign/core/Divider';
import { Badge } from '@astryxdesign/core/Badge';
import { APP_CONFIG } from '../../config/appConfig';
import { WhatsNewModal } from '../../components/common/WhatsNewModal';
import { hasUnreadReleaseNotes } from '../../config/releaseNotes';
import {
  GraduationCapIcon,
  SparklesIcon,
  DeviceMobileIcon,
  ClipboardCheckIcon,
} from '../../components/common/BrandIcons';

export function AboutPage({ onNavigate }) {
  const [isWhatsNewOpen, setIsWhatsNewOpen] = useState(false);
  const hasUnread = hasUnreadReleaseNotes();

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
                Application Overview &bull; Version {APP_CONFIG.version}
              </span>
            </div>
          </div>

          <HStack gap={2}>
            <Button
              label={hasUnread ? "What's New (New)" : "What's New"}
              variant="secondary"
              size="sm"
              onClick={() => setIsWhatsNewOpen(true)}
            />
            <Button label="← Return to Previous Page" variant="secondary" size="sm" onClick={handleBack} />
          </HStack>
        </div>

        {/* Hero Card */}
        <Card elevation="low" padding={6} style={{ backgroundColor: '#ffffff', borderRadius: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24, color: '#334155', lineHeight: 1.7 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Badge label="Production Ready" variant="neutral" size="sm" />
                <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>Release {APP_CONFIG.releaseDate}</span>
              </div>
              <h1 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.25rem)', fontWeight: 800, color: '#142b49', margin: '0 0 10px 0', letterSpacing: '-0.02em' }}>
                About {APP_CONFIG.name}
              </h1>
              <p style={{ margin: 0, fontSize: '1.05rem', color: '#475569', lineHeight: 1.6 }}>
                A purpose-built web and progressive web application crafted specifically for Filipino student interns, trainees, and academic coordinators. It eliminates manual hour calculations, prevents lost log sheets, and automatically produces verified, formatted Daily Time &amp; Tasks Records (DTTR).
              </p>
            </div>

            <Divider variant="subtle" />

            {/* Core Capabilities */}
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#142b49', marginBottom: 16 }}>
                Core Capabilities
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
                <div style={{ padding: 16, backgroundColor: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                  <div style={{ fontWeight: 700, color: '#142b49', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <ClipboardCheckIcon style={{ width: 18, height: 18, color: '#10b981' }} />
                    Attendance Tracking
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                    Record distinct morning (AM) and afternoon (PM) shift arrivals and departures with automatic duration computation.
                  </div>
                </div>

                <div style={{ padding: 16, backgroundColor: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                  <div style={{ fontWeight: 700, color: '#142b49', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <SparklesIcon style={{ width: 18, height: 18, color: '#10b981' }} />
                    Progress Monitoring
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                    Real-time visual percentage gauges tracking rendered hours against institutional quotas and projected completion dates.
                  </div>
                </div>

                <div style={{ padding: 16, backgroundColor: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                  <div style={{ fontWeight: 700, color: '#142b49', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <DeviceMobileIcon style={{ width: 18, height: 18, color: '#10b981' }} />
                    DTTR Report Export
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                    Generate print-ready monthly Daily Time &amp; Tasks Records formatted for Philippine standard Long Bond paper (8.5 x 13 in).
                  </div>
                </div>

                <div style={{ padding: 16, backgroundColor: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                  <div style={{ fontWeight: 700, color: '#142b49', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <GraduationCapIcon style={{ width: 18, height: 18, color: '#10b981' }} />
                    Custom PDF Templates
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                    Upload your specific college or agency DTTR form, map field coordinates, and synchronize seamlessly across browsers.
                  </div>
                </div>
              </div>
            </div>

            <Divider variant="subtle" />

            {/* Application & Platform Information */}
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#142b49', marginBottom: 14 }}>
                Application Specifications
              </h2>
              <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: '#64748b', width: '35%' }}>Application Name</td>
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: '#142b49' }}>{APP_CONFIG.name}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: '#fcfcfb' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: '#64748b' }}>Current Version</td>
                      <td style={{ padding: '12px 16px', color: '#142b49' }}>
                        <code>v{APP_CONFIG.version}</code> (Semantic Versioning)
                      </td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: '#64748b' }}>Platform Type</td>
                      <td style={{ padding: '12px 16px', color: '#142b49' }}>{APP_CONFIG.platform}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: '#fcfcfb' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: '#64748b' }}>Frontend Framework</td>
                      <td style={{ padding: '12px 16px', color: '#142b49' }}>{APP_CONFIG.frontend}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: '#64748b' }}>Backend Architecture</td>
                      <td style={{ padding: '12px 16px', color: '#142b49' }}>{APP_CONFIG.backend}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: '#fcfcfb' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: '#64748b' }}>Database Engine</td>
                      <td style={{ padding: '12px 16px', color: '#142b49' }}>{APP_CONFIG.database}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: '#64748b' }}>Publisher / Maintainer</td>
                      <td style={{ padding: '12px 16px', color: '#142b49' }}>
                        <code>JOEMARIE DAMASING</code>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <Divider variant="subtle" />

            {/* PWA Features */}
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#142b49', marginBottom: 12 }}>
                Progressive Web App (PWA) Capabilities
              </h2>
              <p style={{ margin: '0 0 12px 0', fontSize: '0.925rem', color: '#475569' }}>
                This system runs as an installed, standalone desktop or mobile application without requiring an app store download:
              </p>
              <ul style={{ paddingLeft: 24, margin: '0 0 14px 0', fontSize: '0.925rem', color: '#475569' }}>
                <li><strong>Home Screen Install:</strong> Add directly to Android, iOS, Windows, macOS, or Linux through Chrome, Edge, or Safari.</li>
                <li><strong>Offline Continuity:</strong> Cached application shell and local database keep existing records accessible even without active internet.</li>
                <li><strong>Push Reminders:</strong> Optional local and push notifications to remind trainees of upcoming shift intervals.</li>
              </ul>
            </div>

            <Divider variant="subtle" />

            {/* Developer & Contact Information */}
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#142b49', marginBottom: 12 }}>
                Publisher &amp; Contact Details
              </h2>
              <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: 18, fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div><strong>Publisher:</strong> <code>JOEMARIE DAMASING</code></div>
                {/* <div><strong>Official Website:</strong> <code>{APP_CONFIG.developer.website}</code></div> */}
                <div><strong>Support &amp; Inquiries:</strong> <code>dayonmakima@gmail.com</code></div>
                <div><strong>Copyright:</strong> &copy; {APP_CONFIG.developer.copyrightYear} {APP_CONFIG.name}. Built with care for student interns.</div>
              </div>
            </div>

            <Divider variant="subtle" />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <span style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>
                Running Version {APP_CONFIG.version} &bull; {APP_CONFIG.platform}
              </span>
              <Button label="Back to Top" variant="secondary" size="sm" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} />
            </div>
          </div>
        </Card>
      </div>

      <WhatsNewModal isOpen={isWhatsNewOpen} onOpenChange={setIsWhatsNewOpen} />
    </div>
  );
}

function HStack({ children, gap = 2 }) {
  return <div style={{ display: 'flex', alignItems: 'center', gap: gap * 4 }}>{children}</div>;
}
