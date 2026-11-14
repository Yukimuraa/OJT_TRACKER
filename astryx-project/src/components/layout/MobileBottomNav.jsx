import React from 'react';
import {
  LayoutDashboardIcon,
  ClockIcon,
  FileTextIcon,
  UserRoundIcon,
  SettingsIcon,
} from '../common/BrandIcons';

const NAV_ITEMS = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    Icon: LayoutDashboardIcon,
  },
  {
    id: 'timelogs',
    label: 'Time Logs',
    Icon: ClockIcon,
  },
  {
    id: 'reports',
    label: 'Reports',
    Icon: FileTextIcon,
  },
  {
    id: 'profile',
    label: 'Profile',
    Icon: UserRoundIcon,
  },
  {
    id: 'settings',
    label: 'Settings',
    Icon: SettingsIcon,
  },
];

export function MobileBottomNav({ activePage, onNavigate }) {
  return (
    <nav
      id="ojt-mobile-bottom-nav"
      className="ojt-mobile-bottom-nav"
      aria-label="Mobile Bottom Navigation"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderTop: '1px solid #E5E7EB',
        boxShadow: '0 -2px 10px rgba(20, 43, 73, 0.05)',
        zIndex: 900,
        display: 'flex',
        alignItems: 'stretch',
        justifyContent: 'space-around',
        paddingTop: '6px',
        paddingBottom: 'max(6px, env(safe-area-inset-bottom, 0px))',
        boxSizing: 'border-box',
      }}
    >
      {NAV_ITEMS.map((item) => {
        const isActive = activePage === item.id;
        const IconComponent = item.Icon;

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onNavigate(item.id)}
            aria-label={item.label}
            aria-current={isActive ? 'page' : undefined}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '4px 2px',
              minHeight: '48px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              userSelect: 'none',
              outline: 'none',
              WebkitTapHighlightColor: 'transparent',
              position: 'relative',
              transition: 'transform 0.1s ease',
            }}
          >
            {/* Active Top Accent Indicator */}
            {isActive && (
              <span
                style={{
                  position: 'absolute',
                  top: '-6px',
                  width: '28px',
                  height: '3px',
                  backgroundColor: '#10B981',
                  borderRadius: '0 0 3px 3px',
                }}
              />
            )}

            {/* Icon wrapper */}
            <div
              style={{
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isActive ? '#10B981' : '#64748B',
                transition: 'color 0.15s ease',
              }}
            >
              <IconComponent width={22} height={22} />
            </div>

            {/* Label */}
            <span
              style={{
                fontSize: '11px',
                lineHeight: '1.2',
                marginTop: '3px',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? '#142B49' : '#64748B',
                letterSpacing: '-0.01em',
                transition: 'color 0.15s ease',
              }}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

export default MobileBottomNav;

