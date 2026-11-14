import React, { useState } from 'react';

export const DEFAULT_STUDENT_AVATAR = '/assets/student-avatar.png';

/**
 * Clean, circular User Avatar component.
 * Displays the user's uploaded photo if available, or the default student avatar.
 * Falls back to an SVG silhouette if image loading fails.
 * Never displays initials (and never defaults to "JD").
 */
export function UserAvatar({
  src,
  alt = 'Student Trainee',
  size = 40,
  style = {},
  className = '',
}) {
  const [hasError, setHasError] = useState(false);
  const effectiveSrc = src || DEFAULT_STUDENT_AVATAR;

  const dimensionStyle = {
    width: size,
    height: size,
    minWidth: size,
    minHeight: size,
    borderRadius: '50%',
  };

  if (effectiveSrc && !hasError) {
    return (
      <img
        src={effectiveSrc}
        alt={alt}
        onError={() => setHasError(true)}
        className={className}
        style={{
          ...dimensionStyle,
          objectFit: 'cover',
          display: 'block',
          border: '1.5px solid rgba(20, 43, 73, 0.1)',
          backgroundColor: '#f8fafc',
          ...style,
        }}
      />
    );
  }

  // Neutral illustrated user silhouette fallback
  return (
    <div
      className={className}
      aria-label={alt}
      role="img"
      style={{
        ...dimensionStyle,
        backgroundColor: '#e2e8f0',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        color: '#475569',
        border: '1.5px solid #cbd5e1',
        boxSizing: 'border-box',
        flexShrink: 0,
        ...style,
      }}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          width: Math.round(size * 0.58),
          height: Math.round(size * 0.58),
          color: '#64748b',
        }}
      >
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    </div>
  );
}
