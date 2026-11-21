import React from 'react';

/**
 * IosSwitch - Polished iOS-style toggle switch component
 * 
 * Props:
 * - checked: boolean
 * - onChange: (checked: boolean) => void
 * - disabled?: boolean
 * - activeColor?: string (default '#5B50E5' to match reference screenshot or '#10b981')
 * - ariaLabel?: string
 */
export function IosSwitch({
  checked = false,
  onChange,
  disabled = false,
  activeColor = '#5B50E5',
  ariaLabel = 'Toggle switch',
}) {
  const handleClick = (e) => {
    e.stopPropagation();
    if (disabled) return;
    onChange?.(!checked);
  };

  const handleKeyDown = (e) => {
    if (disabled) return;
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      onChange?.(!checked);
    }
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      style={{
        width: 50,
        height: 30,
        borderRadius: 9999,
        backgroundColor: checked ? activeColor : '#E2E8F0',
        padding: 2,
        border: 'none',
        display: 'inline-flex',
        alignItems: 'center',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        position: 'relative',
        transition: 'background-color 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        outline: 'none',
        WebkitTapHighlightColor: 'transparent',
        boxSizing: 'border-box',
        flexShrink: 0,
      }}
    >
      <span
        style={{
          width: 26,
          height: 26,
          borderRadius: 9999,
          backgroundColor: '#FFFFFF',
          boxShadow: '0 2px 5px rgba(0, 0, 0, 0.18), 0 1px 2px rgba(0, 0, 0, 0.1)',
          transform: checked ? 'translateX(20px)' : 'translateX(0px)',
          transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
          display: 'block',
          pointerEvents: 'none',
        }}
      />
    </button>
  );
}

export default IosSwitch;
