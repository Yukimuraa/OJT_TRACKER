import React from 'react';
import {
  DashboardIcon,
  ChartBarIcon,
  PlusIcon,
  ClockIcon,
  SettingsIcon,
} from '../common/BrandIcons';

/**
 * MobileBottomNav - iOS-inspired floating pill bottom navigation
 * Reuses the exact same icon components and designs as the desktop navigation:
 * 1. Dashboard (DashboardIcon)
 * 2. Reports (ChartBarIcon)
 * 3. Elevated center Add Action Button (+ PlusIcon, #10B981 background)
 * 4. Time Logs (ClockIcon)
 * 5. Settings (SettingsIcon)
 */
export function MobileBottomNav({ activePage, onNavigate, onAddLog }) {
  const isDashboardActive = activePage === 'dashboard';
  const isReportsActive = activePage === 'reports';
  const isTimeLogsActive = activePage === 'timelogs';
  const isSettingsActive =
    activePage === 'settings' ||
    activePage === 'profile' ||
    activePage === 'help' ||
    activePage === 'about' ||
    activePage === 'privacy' ||
    activePage === 'terms';

  // Active accent color (matches user's app branding #10B981)
  const activeColor = '#10B981';
  const centerButtonBg = '#10B981';
  const centerButtonGlow = 'rgba(16, 185, 129, 0.38)';

  return (
    <nav
      id="ojt-mobile-bottom-nav"
      className="ojt-mobile-bottom-nav"
      aria-label="Mobile Navigation"
      style={{
        position: 'fixed',
        bottom: 'calc(14px + env(safe-area-inset-bottom, 0px))',
        left: 16,
        right: 16,
        maxWidth: 420,
        margin: '0 auto',
        height: 64,
        backgroundColor: 'var(--color-background-surface, rgba(255, 255, 255, 0.94))',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderRadius: 36,
        border: '1px solid var(--color-border, rgba(226, 232, 240, 0.8))',
        boxShadow: '0 10px 25px -4px rgba(20, 43, 73, 0.12), 0 4px 10px -2px rgba(20, 43, 73, 0.06)',
        zIndex: 900,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 12px',
        boxSizing: 'border-box',
      }}
    >
      {/* 1. Dashboard */}
      <button
        type="button"
        onClick={() => onNavigate('dashboard')}
        aria-label="Dashboard"
        title="Dashboard"
        aria-current={isDashboardActive ? 'page' : undefined}
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
          outline: 'none',
          WebkitTapHighlightColor: 'transparent',
          color: isDashboardActive ? activeColor : 'var(--color-text-secondary, #64748B)',
          transition: 'color 0.15s ease, transform 0.1s ease',
        }}
      >
        <DashboardIcon width={24} height={24} />
      </button>

      {/* 2. Reports */}
      <button
        type="button"
        onClick={() => onNavigate('reports')}
        aria-label="Reports"
        title="Reports"
        aria-current={isReportsActive ? 'page' : undefined}
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
          outline: 'none',
          WebkitTapHighlightColor: 'transparent',
          color: isReportsActive ? activeColor : 'var(--color-text-secondary, #64748B)',
          transition: 'color 0.15s ease, transform 0.1s ease',
        }}
      >
        <ChartBarIcon width={24} height={24} />
      </button>

      {/* 3. Center Prominent Add Button (Squircle with #10B981) */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
        }}
      >
        <button
          type="button"
          onClick={onAddLog}
          aria-label="Add Time Log"
          title="Add Time Log"
          style={{
            width: 48,
            height: 48,
            borderRadius: 15,
            backgroundColor: centerButtonBg,
            color: '#FFFFFF',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 6px 16px ${centerButtonGlow}`,
            cursor: 'pointer',
            outline: 'none',
            WebkitTapHighlightColor: 'transparent',
            transition: 'transform 0.12s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.12s ease',
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = 'scale(0.92)';
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
          onTouchStart={(e) => {
            e.currentTarget.style.transform = 'scale(0.92)';
          }}
          onTouchEnd={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <PlusIcon width={24} height={24} />
        </button>
      </div>

      {/* 4. Time Logs */}
      <button
        type="button"
        onClick={() => onNavigate('timelogs')}
        aria-label="Time Logs"
        title="Time Logs"
        aria-current={isTimeLogsActive ? 'page' : undefined}
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
          outline: 'none',
          WebkitTapHighlightColor: 'transparent',
          color: isTimeLogsActive ? activeColor : 'var(--color-text-secondary, #64748B)',
          transition: 'color 0.15s ease, transform 0.1s ease',
        }}
      >
        <ClockIcon width={24} height={24} />
      </button>

      {/* 5. Settings */}
      <button
        type="button"
        onClick={() => onNavigate('settings')}
        aria-label="Settings"
        title="Settings"
        aria-current={isSettingsActive ? 'page' : undefined}
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
          outline: 'none',
          WebkitTapHighlightColor: 'transparent',
          color: isSettingsActive ? activeColor : 'var(--color-text-secondary, #64748B)',
          transition: 'color 0.15s ease, transform 0.1s ease',
        }}
      >
        <SettingsIcon width={24} height={24} />
      </button>
    </nav>
  );
}

export default MobileBottomNav;
