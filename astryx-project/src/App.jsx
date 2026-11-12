import React, { useState, useEffect } from 'react';
import { Theme } from '@astryxdesign/core/theme';
import { AppShell } from '@astryxdesign/core/AppShell';
import { themes, defaultThemeSlug } from './astryx-themes';
import { TrainingProvider } from './context/TrainingContext';
import { Sidebar } from './components/layout/Sidebar';
import { TopNavigation } from './components/layout/TopNavigation';
import { Dashboard } from './pages/Dashboard';
import { TimeLogs } from './pages/TimeLogs';
import { Reports } from './pages/Reports';
import { Profile } from './pages/Profile';
import { Settings } from './pages/Settings';
import { LandingPage } from './pages/landing/LandingPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { LoginPage } from './pages/auth/LoginPage';
import { OnboardingWizard } from './pages/onboarding/OnboardingWizard';
import { isAuthenticated } from './services/authService';
import { PwaStatusBanners } from './components/pwa/PwaStatusBanners';

const PAGE_TITLES = {
  dashboard: 'Dashboard',
  timelogs: 'Time Logs',
  reports: 'Reports',
  profile: 'Profile',
  settings: 'Settings',
};

const PROTECTED_PAGES = ['dashboard', 'timelogs', 'reports', 'profile', 'settings', 'onboarding'];

function getInitialPage() {
  if (typeof window !== 'undefined') {
    const path = window.location.pathname.toLowerCase().replace(/\/$/, '');
    if (path === '/register') return 'register';
    if (path === '/login') return 'login';

    const authed = isAuthenticated();
    if (!authed && (path.startsWith('/app') || path === '/dashboard' || path === '/onboarding' || path === '/timelogs')) {
      return 'login';
    }

    if (path === '/onboarding') return 'onboarding';
    if (path === '/app/timelogs' || path === '/timelogs') return 'timelogs';
    if (path === '/app/reports' || path === '/reports') return 'reports';
    if (path === '/app/profile' || path === '/profile') return 'profile';
    if (path === '/app/settings' || path === '/settings') return 'settings';
    if (path.startsWith('/app') || path === '/dashboard') return 'dashboard';
  }
  return 'landing';
}

export function App() {
  const [activePage, setActivePage] = useState(getInitialPage);

  // Sync with browser back/forward history
  useEffect(() => {
    const handlePopState = () => {
      setActivePage(getInitialPage());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (page) => {
    // Route guard: Prevent unauthenticated users from accessing protected pages
    if (PROTECTED_PAGES.includes(page) && !isAuthenticated()) {
      setActivePage('login');
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.history.pushState({ page: 'login' }, '', '/login');
      }
      return;
    }

    setActivePage(page);
    if (typeof window !== 'undefined') {
      let targetPath = '/';
      if (page === 'register') targetPath = '/register';
      else if (page === 'login') targetPath = '/login';
      else if (page === 'onboarding') targetPath = '/onboarding';
      else if (page !== 'landing') targetPath = `/app/${page}`;

      if (window.location.pathname !== targetPath) {
        window.history.pushState({ page }, '', targetPath);
      }
    }
  };

  if (activePage === 'landing') {
    return (
      <Theme theme={themes[defaultThemeSlug]} mode="light">
        <PwaStatusBanners />
        <LandingPage
          onEnterApp={() => (isAuthenticated() ? navigateTo('dashboard') : navigateTo('login'))}
          onNavigate={navigateTo}
        />
      </Theme>
    );
  }

  if (activePage === 'register') {
    return (
      <Theme theme={themes[defaultThemeSlug]} mode="light">
        <PwaStatusBanners />
        <RegisterPage onNavigate={navigateTo} />
      </Theme>
    );
  }

  if (activePage === 'login') {
    return (
      <Theme theme={themes[defaultThemeSlug]} mode="light">
        <PwaStatusBanners />
        <LoginPage onNavigate={navigateTo} />
      </Theme>
    );
  }

  if (activePage === 'onboarding') {
    return (
      <Theme theme={themes[defaultThemeSlug]} mode="light">
        <PwaStatusBanners />
        <TrainingProvider>
          <OnboardingWizard
            onComplete={() => {
              navigateTo('dashboard');
            }}
          />
        </TrainingProvider>
      </Theme>
    );
  }

  const renderActivePage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard onNavigate={navigateTo} />;
      case 'timelogs':
        return <TimeLogs onNavigate={navigateTo} />;
      case 'reports':
        return <Reports onNavigate={navigateTo} />;
      case 'profile':
        return <Profile onNavigate={navigateTo} />;
      case 'settings':
        return <Settings onNavigate={navigateTo} />;
      default:
        return <Dashboard onNavigate={navigateTo} />;
    }
  };

  return (
    <Theme theme={themes[defaultThemeSlug]} mode="light">
      <TrainingProvider>
        <AppShell
          variant="elevated"
          height="auto"
          contentPadding={4}
          sideNav={<Sidebar activePage={activePage} onNavigate={navigateTo} />}
          topNav={
            <TopNavigation
              pageTitle={PAGE_TITLES[activePage] || 'OJT Tracker'}
              onNavigate={navigateTo}
            />
          }
        >
          <PwaStatusBanners />
          {renderActivePage()}
        </AppShell>
      </TrainingProvider>
    </Theme>
  );
}

export default App;
