import React, { useEffect } from 'react';
import { Dialog, DialogHeader } from '@astryxdesign/core/Dialog';
import { VStack } from '@astryxdesign/core/VStack';
import { HStack } from '@astryxdesign/core/HStack';
import { Button } from '@astryxdesign/core/Button';
import { Badge } from '@astryxdesign/core/Badge';
import { Divider } from '@astryxdesign/core/Divider';
import { RELEASE_NOTES, markReleaseNotesViewed } from '../../config/releaseNotes';

export function WhatsNewModal({ isOpen, onOpenChange }) {
  useEffect(() => {
    if (isOpen) {
      markReleaseNotesViewed();
    }
  }, [isOpen]);

  return (
    <Dialog
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      purpose="info"
      width={640}
      maxHeight="85dvh"
    >
      <DialogHeader
        title="What's New in OJT Hours Tracker"
        subtitle="Chronological release notes, latest features, improvements, and bug fixes."
        onOpenChange={onOpenChange}
      />

      <VStack
        gap={4}
        padding={5}
        isScrollable
        style={{ maxHeight: 'calc(85dvh - 140px)', overflowY: 'auto' }}
      >
        {RELEASE_NOTES.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 16px', color: '#64748b' }}>
            <p style={{ fontSize: '1rem', fontWeight: 600, color: '#142b49' }}>No release notes available</p>
            <p style={{ fontSize: '0.875rem' }}>Check back soon for future update details.</p>
          </div>
        ) : (
          RELEASE_NOTES.map((release, idx) => (
            <div
              key={release.version}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: 12,
                padding: 20,
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#142b49' }}>
                      Version {release.version}
                    </span>
                    {idx === 0 && <Badge label="Latest" variant="neutral" size="sm" />}
                  </div>
                  <span style={{ fontSize: '0.8125rem', color: '#64748b', fontWeight: 500 }}>
                    Released on {release.date}
                  </span>
                </div>
              </div>

              {release.summary && (
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#334155', lineHeight: 1.5 }}>
                  {release.summary}
                </p>
              )}

              <Divider variant="subtle" />

              {/* Features */}
              {release.features?.length > 0 && (
                <div>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    New Features
                  </span>
                  <ul style={{ margin: '6px 0 0 0', paddingLeft: 20, fontSize: '0.875rem', color: '#475569', lineHeight: 1.6 }}>
                    {release.features.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Improvements */}
              {release.improvements?.length > 0 && (
                <div>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Improvements
                  </span>
                  <ul style={{ margin: '6px 0 0 0', paddingLeft: 20, fontSize: '0.875rem', color: '#475569', lineHeight: 1.6 }}>
                    {release.improvements.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Bug Fixes */}
              {release.fixes?.length > 0 && (
                <div>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#e11d48', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Bug Fixes
                  </span>
                  <ul style={{ margin: '6px 0 0 0', paddingLeft: 20, fontSize: '0.875rem', color: '#475569', lineHeight: 1.6 }}>
                    {release.fixes.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))
        )}
      </VStack>

      <div style={{ padding: '12px 20px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', backgroundColor: '#f8fafc' }}>
        <Button label="Close" variant="secondary" onClick={() => onOpenChange(false)} />
      </div>
    </Dialog>
  );
}
