import React from 'react';
import { SideNav, SideNavHeading, SideNavItem, SideNavSection } from '@astryxdesign/core/SideNav';
import { Icon } from '@astryxdesign/core/Icon';
import {
  GraduationCapIcon,
  DashboardIcon,
  UserIcon,
  AlertCircleIcon,
  StarIcon,
} from '../common/BrandIcons';

export function AdminSidebar({ activePage, onNavigate }) {
  return (
    <SideNav
      collapsible={true}
      header={
        <SideNavHeading
          heading="OJT Tracker"
          subheading="Admin Portal"
          icon={<Icon icon={GraduationCapIcon} color="accent" size="lg" label="OJT Hours Tracker Admin" />}
        />
      }
      footer={
        <SideNavSection title="Account" isHeaderHidden={true}>
          <SideNavItem
            label="Admin Settings"
            icon="wrench"
            isSelected={activePage === 'admin-settings'}
            onClick={() => onNavigate('admin-settings')}
          />
        </SideNavSection>
      }
    >
      <SideNavSection title="Administration" isHeaderHidden={true}>
        <SideNavItem
          label="Dashboard"
          icon={DashboardIcon}
          isSelected={activePage === 'admin-dashboard'}
          onClick={() => onNavigate('admin-dashboard')}
        />
        <SideNavItem
          label="Student Accounts"
          icon={UserIcon}
          isSelected={activePage === 'admin-students'}
          onClick={() => onNavigate('admin-students')}
        />
        <SideNavItem
          label="Problem Reports"
          icon={AlertCircleIcon}
          isSelected={activePage === 'admin-problem-reports'}
          onClick={() => onNavigate('admin-problem-reports')}
        />
        <SideNavItem
          label="Feedback & Ratings"
          icon={StarIcon}
          isSelected={activePage === 'admin-feedback'}
          onClick={() => onNavigate('admin-feedback')}
        />
      </SideNavSection>
    </SideNav>
  );
}

export default AdminSidebar;
