import React, { useState, useEffect } from 'react';
import { Theme } from '@astryxdesign/core/theme';
import { AppShell } from '@astryxdesign/core/AppShell';
import { themes, defaultThemeSlug } from './astryx-themes';
import { TrainingProvider } from './context/TrainingContext';
import { Sidebar } from './components/layout/Sidebar';
import { TopNavigation } from './components/layout/TopNavigation';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { Dashboard } from './pages/Dashboard';
import { TimeLogs } from './pages/TimeLogs';
import { Reports } from './pages/Reports';
import { Profile } from './pages/Profile';
import { Settings } from './pages/Settings';
import { LandingPage } from './pages/landing/LandingPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { LoginPage } from './pages/auth/LoginPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { VerifyEmailPage } from './pages/auth/VerifyEmailPage';
import { OnboardingWizard } from './pages/onboarding/OnboardingWizard';
import { PrivacyPolicyPage } from './pages/legal/PrivacyPolicyPage';
import { TermsOfServicePage } from './pages/legal/TermsOfServicePage';
import { AboutPage } from './pages/about/AboutPage';
import { HelpSupportPage } from './pages/support/HelpSupportPage';
import { ReportProblemPage } from './pages/support/ReportProblemPage';
import { isAuthenticated, getCurrentUser, fetchCurrentUser } from './services/authService';
import { restartReminderScheduler } from './services/reminderService';
import { fetchStudentProfile } from './services/profileService';
import { isOnboardingCompleted } from './services/onboardingService';
import { PwaStatusBanners } from './components/pwa/PwaStatusBanners';
import { useDarkMode } from './hooks/useDarkMode';
import { ErrorBoundary } from './components/common/ErrorBoundary';

const PROTECTED_PAGES = ['dashboard', 'timelogs', 'reports', 'profile', 'settings', 'onboarding'];

function getInitialPage() {
  if (typeof window !== 'undefined') {
    const path = window.location.pathname.toLowerCase().replace(/\/$/, '');
    if (path === '/register') return 'register';
    if (path === '/login') return 'login';
    if (path === '/forgot-password') return 'forgot-password';
    if (path === '/reset-password') return 'reset-password';
    if (path === '/verify-email' || path === '/email/verify') return 'verify-email';
    if (path === '/privacy' || path === '/privacy-policy') return 'privacy';
    if (path === '/terms' || path === '/terms-of-service') return 'terms';
    if (path === '/about') return 'about';
    if (path === '/help' || path === '/faq') return 'help';
    if (path === '/report-problem' || path === '/report-a-problem' || path === '/app/report-problem') return 'report-problem';

    const authed = isAuthenticated();
    if (!authed && (path.startsWith('/app') || path === '/dashboard' || path === '/onboarding' || path === '/timelogs')) {
      return 'login';
    }

    if (path === '/onboarding') {
      return isOnboardingCompleted() ? 'dashboard' : 'onboarding';
    }
    if (path === '/app/timelogs' || path === '/timelogs') return 'timelogs';
    if (path === '/app/reports' || path === '/reports') return 'reports';
    if (path === '/app/profile' || path === '/profile') return 'profile';
    if (path === '/app/settings' || path === '/settings') return 'settings';
    if (path.startsWith('/app') || path === '/dashboard') return 'dashboard';
  }
  return 'landing';
}

export function App() {
  const { isDarkMode } = useDarkMode();
  const [activePage, setActivePage] = useState(getInitialPage);
  const [openAddOnTimeLogs, setOpenAddOnTimeLogs] = useState(false);

  const handleOpenAddLog = () => {
    setOpenAddOnTimeLogs(true);
    if (activePage !== 'timelogs') {
      navigateTo('timelogs');
    }
  };

  // Sync with browser back/forward history
  useEffect(() => {
    const handlePopState = () => {
      setActivePage(getInitialPage());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Initialize background reminder scheduler for authenticated student
  useEffect(() => {
    if (isAuthenticated()) {
      const user = getCurrentUser();
      if (user?.id) {
        restartReminderScheduler(user.id);
      }
    }
  }, [activePage]);

  // Restore student profile & onboarding state from backend on mount and page change
  useEffect(() => {
    if (isAuthenticated()) {
      fetchStudentProfile().then((profile) => {
        if (profile?.onboardingCompleted && (activePage === 'onboarding' || window.location.pathname.toLowerCase() === '/onboarding')) {
          setActivePage('dashboard');
          if (typeof window !== 'undefined') {
            window.history.replaceState({ page: 'dashboard' }, '', '/dashboard');
          }
        }
      }).catch(() => {});
    } else {
      // In case session cookie exists in browser/PWA but local storage was cleared
      fetchCurrentUser().then((user) => {
        if (user) {
          fetchStudentProfile().then((profile) => {
            const isCompleted = Boolean(profile?.onboardingCompleted ?? user.onboardingCompleted);
            const targetPage = isCompleted ? 'dashboard' : 'onboarding';
            if (activePage === 'login' || activePage === 'landing') {
              setActivePage(targetPage);
              if (typeof window !== 'undefined') {
                window.history.replaceState({ page: targetPage }, '', `/${targetPage}`);
              }
            }
          }).catch(() => {});
        }
      }).catch(() => {});
    }
  }, [activePage]);

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
      else if (page === 'forgot-password') targetPath = '/forgot-password';
      else if (page === 'reset-password') targetPath = '/reset-password';
      else if (page === 'verify-email') targetPath = '/verify-email';
      else if (page === 'onboarding') targetPath = '/onboarding';
      else if (page === 'privacy') targetPath = '/privacy';
      else if (page === 'terms') targetPath = '/terms';
      else if (page === 'about') targetPath = '/about';
      else if (page === 'help' || page === 'faq') targetPath = '/help';
      else if (page === 'report-problem') targetPath = '/report-problem';
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

  if (activePage === 'forgot-password') {
    return (
      <Theme theme={themes[defaultThemeSlug]} mode="light">
        <PwaStatusBanners />
        <ForgotPasswordPage onNavigate={navigateTo} />
      </Theme>
    );
  }

  if (activePage === 'reset-password') {
    return (
      <Theme theme={themes[defaultThemeSlug]} mode="light">
        <PwaStatusBanners />
        <ResetPasswordPage onNavigate={navigateTo} />
      </Theme>
    );
  }

  if (activePage === 'verify-email') {
    return (
      <Theme theme={themes[defaultThemeSlug]} mode="light">
        <PwaStatusBanners />
        <VerifyEmailPage onNavigate={navigateTo} />
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

  if (activePage === 'privacy') {
    return (
      <Theme theme={themes[defaultThemeSlug]} mode="light">
        <PwaStatusBanners />
        <PrivacyPolicyPage onNavigate={navigateTo} />
      </Theme>
    );
  }

  if (activePage === 'terms') {
    return (
      <Theme theme={themes[defaultThemeSlug]} mode="light">
        <PwaStatusBanners />
        <TermsOfServicePage onNavigate={navigateTo} />
      </Theme>
    );
  }

  if (activePage === 'about') {
    return (
      <Theme theme={themes[defaultThemeSlug]} mode="light">
        <PwaStatusBanners />
        <AboutPage onNavigate={navigateTo} />
      </Theme>
    );
  }

  if (activePage === 'help' || activePage === 'faq') {
    return (
      <Theme theme={themes[defaultThemeSlug]} mode="light">
        <PwaStatusBanners />
        <HelpSupportPage onNavigate={navigateTo} />
      </Theme>
    );
  }

  if (activePage === 'report-problem') {
    return (
      <Theme theme={themes[defaultThemeSlug]} mode="light">
        <PwaStatusBanners />
        <ReportProblemPage onNavigate={navigateTo} />
      </Theme>
    );
  }

  const renderActivePage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard onNavigate={navigateTo} />;
      case 'timelogs':
        return (
          <TimeLogs
            onNavigate={navigateTo}
            openAddModal={openAddOnTimeLogs}
            onAddModalHandled={() => setOpenAddOnTimeLogs(false)}
          />
        );
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
    <Theme theme={themes[defaultThemeSlug]} mode={isDarkMode ? 'dark' : 'light'}>
      <TrainingProvider>
        <AppShell
          variant="elevated"
          height="auto"
          contentPadding={4}
          mobileNav={false}
          sideNav={<Sidebar activePage={activePage} onNavigate={navigateTo} />}
          topNav={<TopNavigation onNavigate={navigateTo} />}
        >
          <PwaStatusBanners />
          <div className="ojt-authenticated-content">
            <ErrorBoundary onReset={() => setActivePage('dashboard')}>
              {renderActivePage()}
            </ErrorBoundary>
          </div>
          <MobileBottomNav
            activePage={activePage}
            onNavigate={navigateTo}
            onAddLog={handleOpenAddLog}
          />
        </AppShell>
      </TrainingProvider>
    </Theme>
  );
}

export default App;
