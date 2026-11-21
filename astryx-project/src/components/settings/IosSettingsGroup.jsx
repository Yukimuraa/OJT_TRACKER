import React from 'react';

export function IosSettingsGroup({ title, children, footer, style = {} }) {
  return (
    <div style={{ marginBottom: 20, ...style }}>
      {title && (
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: 'var(--color-text-secondary, #64748B)',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            paddingLeft: 16,
            marginBottom: 8,
          }}
        >
          {title}
        </div>
      )}

      <div
        className="ojt-ios-group-card"
        style={{
          backgroundColor: 'var(--color-background-surface, #FFFFFF)',
          borderRadius: 22,
          border: '1px solid var(--color-border, rgba(226, 232, 240, 0.8))',
          boxShadow: '0 2px 8px var(--color-shadow, rgba(20, 43, 73, 0.03))',
          overflow: 'hidden',
        }}
      >
        {children}
      </div>

      {footer && (
        <div
          style={{
            fontSize: 12,
            color: 'var(--color-text-secondary, #64748B)',
            paddingLeft: 16,
            paddingRight: 16,
            marginTop: 6,
            lineHeight: 1.4,
          }}
        >
          {footer}
        </div>
      )}
    </div>
  );
}

export default IosSettingsGroup;
