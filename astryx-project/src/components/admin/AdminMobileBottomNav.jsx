import React from 'react';
import {
  DashboardIcon,
  UserIcon,
  AlertCircleIcon,
  StarIcon,
  SettingsIcon,
} from '../common/BrandIcons';

const ADMIN_NAV_ITEMS = [
  { id: 'admin-dashboard', label: 'Dashboard', Icon: DashboardIcon },
  { id: 'admin-students', label: 'Students', Icon: UserIcon },
  { id: 'admin-problem-reports', label: 'Reports', Icon: AlertCircleIcon },
  { id: 'admin-feedback', label: 'Feedback', Icon: StarIcon },
  { id: 'admin-settings', label: 'Settings', Icon: SettingsIcon },
];

export function AdminMobileBottomNav({ activePage, onNavigate }) {
  const activeColor = '#10B981';

  return (
    <nav
      id="ojt-mobile-bottom-nav"
      className="ojt-mobile-bottom-nav"
      aria-label="Admin Mobile Navigation"
      style={{
        position: 'fixed',
        bottom: 'calc(14px + env(safe-area-inset-bottom, 0px))',
        left: 16,
        right: 16,
        maxWidth: 440,
        margin: '0 auto',
        height: 64,
        backgroundColor: 'var(--color-background-surface, rgba(255, 255, 255, 0.96))',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderRadius: 36,
        border: '1px solid var(--color-border, rgba(226, 232, 240, 0.8))',
        boxShadow: '0 10px 25px -4px rgba(20, 43, 73, 0.12), 0 4px 10px -2px rgba(20, 43, 73, 0.06)',
        zIndex: 900,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 10px',
        boxSizing: 'border-box',
      }}
    >
      {ADMIN_NAV_ITEMS.map(({ id, label, Icon }) => {
        const isSelected = activePage === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onNavigate(id)}
            aria-label={label}
            title={label}
            aria-current={isSelected ? 'page' : undefined}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              height: '100%',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              outline: 'none',
              color: isSelected ? activeColor : 'var(--color-text-secondary, #64748B)',
            }}
          >
            <Icon width={21} height={21} />
            <span style={{ fontSize: '0.66rem', fontWeight: isSelected ? 700 : 500 }}>
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

export default AdminMobileBottomNav;
