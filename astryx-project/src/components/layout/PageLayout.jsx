import React from 'react';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';

/**
 * PageLayout - Consistent layout wrapper for application views.
 * Designed to prevent horizontal card overflow and border clipping
 * across all screen sizes (mobile, tablet, and desktop).
 */
export function PageLayout({ title, description, actions, children }) {
  return (
    <div
      className="ojt-page-layout"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        width: '100%',
        maxWidth: '100%',
        minWidth: 0,
        boxSizing: 'border-box',
      }}
    >
      {/* Page Header (Title, Subtitle, Action Buttons) */}
      <div
        className="ojt-page-layout-header"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          width: '100%',
          maxWidth: '100%',
          minWidth: 0,
          boxSizing: 'border-box',
        }}
      >
        <div style={{ flex: '1 1 220px', minWidth: 0 }}>
          <Heading level={1}>{title}</Heading>
          {description && (
            <Text type="supporting" color="secondary" style={{ marginTop: 4, display: 'block' }}>
              {description}
            </Text>
          )}
        </div>
        {actions && (
          <div
            className="ojt-page-layout-actions"
            style={{
              display: 'flex',
              gap: 8,
              flexWrap: 'wrap',
              alignItems: 'center',
              flexShrink: 0,
              maxWidth: '100%',
            }}
          >
            {actions}
          </div>
        )}
      </div>

      {/* Main Page Content - Clean container without negative margins */}
      <div
        className="ojt-page-layout-content"
        style={{
          width: '100%',
          maxWidth: '100%',
          minWidth: 0,
          boxSizing: 'border-box',
        }}
      >
        {children}
      </div>
    </div>
  );
}

export default PageLayout;
