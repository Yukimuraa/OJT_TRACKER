import React from 'react';
import { ChevronRightIcon } from '../common/BrandIcons';

export function IosSettingsRow({
  icon,
  iconBg = '#F8FAFC',
  iconBorder = 'rgba(226, 232, 240, 0.8)',
  iconColor = '#475569',
  title,
  subtitle,
  rightContent,
  control,
  onClick,
  showChevron = true,
  isDestructive = false,
  showDivider = true,
}) {
  const isClickable = Boolean(onClick);

  return (
    <div>
      <div
        role={isClickable ? 'button' : undefined}
        tabIndex={isClickable ? 0 : undefined}
        onClick={onClick}
        onKeyDown={(e) => {
          if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            onClick();
          }
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          minHeight: 56,
          boxSizing: 'border-box',
          cursor: isClickable ? 'pointer' : 'default',
          userSelect: 'none',
          WebkitTapHighlightColor: 'transparent',
          transition: 'background-color 0.15s ease',
          outline: 'none',
          gap: 12,
        }}
        className="ojt-ios-settings-row"
      >
        {/* Left: Outlined icon inside small rounded-square container + text */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0, flex: 1 }}>
          {icon && (
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 11,
                backgroundColor: iconBg,
                border: `1px solid ${iconBorder}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: iconColor,
                flexShrink: 0,
              }}
            >
              {React.isValidElement(icon)
                ? React.cloneElement(icon, { width: 20, height: 20 })
                : icon}
            </div>
          )}

          <div style={{ minWidth: 0, flex: 1 }}>
            <div
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: isDestructive ? '#EF4444' : 'var(--color-text-primary, #142B49)',
                lineHeight: 1.3,
                letterSpacing: '-0.01em',
              }}
            >
              {title}
            </div>
            {subtitle && (
              <div
                style={{
                  fontSize: 12,
                  color: 'var(--color-text-secondary, #64748B)',
                  marginTop: 2,
                  lineHeight: 1.3,
                }}
              >
                {subtitle}
              </div>
            )}
          </div>
        </div>

        {/* Right: Control, Value / Badge, or Chevron */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            flexShrink: 0,
          }}
          onClick={(e) => {
            if (control) e.stopPropagation();
          }}
        >
          {rightContent}
          {control}
          {isClickable && !control && showChevron && (
            <div style={{ color: '#94A3B8', display: 'flex', alignItems: 'center' }}>
              <ChevronRightIcon width={18} height={18} />
            </div>
          )}
        </div>
      </div>

      {/* Inset Hairline Divider */}
      {showDivider && (
        <div
          style={{
            height: 1,
            backgroundColor: 'var(--color-border, #F1F5F9)',
            marginLeft: 64,
            marginRight: 0,
          }}
        />
      )}
    </div>
  );
}

export default IosSettingsRow;
