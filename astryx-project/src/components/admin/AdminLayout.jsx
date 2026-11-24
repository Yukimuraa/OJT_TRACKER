import React from 'react';
import { AppShell } from '@astryxdesign/core/AppShell';
import { AdminSidebar } from './AdminSidebar';
import { AdminMobileBottomNav } from './AdminMobileBottomNav';
import { TopNavigation } from '../layout/TopNavigation';
import { PwaStatusBanners } from '../pwa/PwaStatusBanners';
import { ErrorBoundary } from '../common/ErrorBoundary';

export function AdminLayout({ activePage, onNavigate, children }) {
  return (
    <AppShell
      variant="elevated"
      height="auto"
      contentPadding={4}
      mobileNav={false}
      sideNav={<AdminSidebar activePage={activePage} onNavigate={onNavigate} />}
      topNav={<TopNavigation onNavigate={onNavigate} />}
    >
      <PwaStatusBanners />
      <div className="ojt-authenticated-content">
        <ErrorBoundary onReset={() => onNavigate('admin-dashboard')}>
          {children}
        </ErrorBoundary>
      </div>
      <AdminMobileBottomNav activePage={activePage} onNavigate={onNavigate} />
    </AppShell>
  );
}

export default AdminLayout;
