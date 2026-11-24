import React from 'react';
import { SideNav, SideNavItem, SideNavSection } from '@astryxdesign/core/SideNav';
import { DashboardIcon, ChartBarIcon, UserIcon } from '../common/BrandIcons';

export function Sidebar({ activePage, onNavigate }) {
  return (
    <SideNav
      collapsible={true}
      footer={
        <SideNavSection title="Account" isHeaderHidden={true}>
          <SideNavItem
            label="Profile"
            icon={UserIcon}
            isSelected={activePage === 'profile'}
            onClick={() => onNavigate('profile')}
          />
          <SideNavItem
            label="Settings"
            icon="wrench"
            isSelected={activePage === 'settings'}
            onClick={() => onNavigate('settings')}
          />
        </SideNavSection>
      }
    >
      <SideNavSection title="Menu" isHeaderHidden={true}>
        <SideNavItem
          label="Dashboard"
          icon={DashboardIcon}
          isSelected={activePage === 'dashboard'}
          onClick={() => onNavigate('dashboard')}
        />
        <SideNavItem
          label="Time Logs"
          icon="clock"
          isSelected={activePage === 'timelogs'}
          onClick={() => onNavigate('timelogs')}
        />
        <SideNavItem
          label="Reports"
          icon={ChartBarIcon}
          isSelected={activePage === 'reports'}
          onClick={() => onNavigate('reports')}
        />
      </SideNavSection>
    </SideNav>
  );
}

