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
import { FeedbackPage } from './pages/feedback/FeedbackPage';
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminStudentsPage } from './pages/admin/AdminStudentsPage';
import { AdminProblemReportsPage } from './pages/admin/AdminProblemReportsPage';
import { AdminFeedbackPage } from './pages/admin/AdminFeedbackPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';
import { getCurrentUser, fetchCurrentUser } from './services/authService';
import { restartReminderScheduler } from './services/reminderService';
import { fetchStudentProfile } from './services/profileService';
import { isOnboardingCompleted } from './services/onboardingService';
import { PwaStatusBanners } from './components/pwa/PwaStatusBanners';
import { useDarkMode } from './hooks/useDarkMode';
import { ErrorBoundary } from './components/common/ErrorBoundary';

const STUDENT_PROTECTED_PAGES = ['dashboard', 'timelogs', 'reports', 'profile', 'settings', 'onboarding'];
const ADMIN_PAGES = ['admin-dashboard', 'admin-students', 'admin-problem-reports', 'admin-feedback', 'admin-settings'];

const ADMIN_ROUTE_PATHS = {
  'admin-dashboard': '/admin/dashboard',
  'admin-students': '/admin/students',
  'admin-problem-reports': '/admin/problem-reports',
  'admin-feedback': '/admin/feedback',
  'admin-settings': '/admin/settings',
};

function isAdminUser(user) {
  return user?.role === 'admin';
}

function getTargetPathForPage(page) {
  if (page === 'register') return '/register';
  if (page === 'login') return '/login';
  if (page === 'forgot-password') return '/forgot-password';
  if (page === 'reset-password') return '/reset-password';
  if (page === 'verify-email') return '/verify-email';
  if (page === 'onboarding') return '/onboarding';
  if (page === 'privacy') return '/privacy';
  if (page === 'terms') return '/terms';
  if (page === 'about') return '/about';
  if (page === 'help' || page === 'faq') return '/help';
  if (page === 'report-problem') return '/report-problem';
  if (page === 'feedback') return '/feedback';
  if (ADMIN_ROUTE_PATHS[page]) return ADMIN_ROUTE_PATHS[page];
  if (page !== 'landing') return `/app/${page}`;
  return '/';
}

function getInitialPage() {
  if (typeof window !== 'undefined') {
    const path = window.location.pathname.toLowerCase().replace(/\/$/, '') || '/';
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
    if (path === '/feedback' || path === '/feedback-ratings' || path === '/app/feedback') return 'feedback';

    const currentUser = getCurrentUser();
    const authed = Boolean(currentUser);
    const isAdminRoute = path === '/admin' || path.startsWith('/admin/');
    const isStudentAppRoute =
      path.startsWith('/app') ||
      path === '/dashboard' ||
      path === '/onboarding' ||
      path === '/timelogs' ||
      path === '/reports' ||
      path === '/profile' ||
      path === '/settings';

    if (!authed && (isAdminRoute || isStudentAppRoute)) {
      return 'login';
    }

    if (authed && isAdminUser(currentUser)) {
      if (path === '/admin/students') return 'admin-students';
      if (path === '/admin/problem-reports') return 'admin-problem-reports';
      if (path === '/admin/feedback') return 'admin-feedback';
      if (path === '/admin/settings') return 'admin-settings';
      if (isAdminRoute || isStudentAppRoute) return 'admin-dashboard';
      return 'landing';
    }

    if (authed && isAdminRoute) {
      return isOnboardingCompleted() ? 'dashboard' : 'onboarding';
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

  // Initialize background reminder scheduler for authenticated students only
  useEffect(() => {
    const user = getCurrentUser();
    if (user?.id && !isAdminUser(user)) {
      restartReminderScheduler(user.id);
    }
  }, [activePage]);

  // Normalize URL path when initial route guard redirects unauthenticated or mismatched-role visitors
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const path = window.location.pathname.toLowerCase().replace(/\/$/, '') || '/';
    const isAdminRoute = path === '/admin' || path.startsWith('/admin/');
    const isStudentAppRoute =
      path.startsWith('/app') ||
      path === '/dashboard' ||
      path === '/onboarding' ||
      path === '/timelogs' ||
      path === '/reports' ||
      path === '/profile' ||
      path === '/settings';

    const redirectedToLogin = activePage === 'login' && (isAdminRoute || isStudentAppRoute);
    const redirectedFromAdmin = !ADMIN_PAGES.includes(activePage) && isAdminRoute;
    const redirectedToAdmin = ADMIN_PAGES.includes(activePage) && !isAdminRoute;

    if (redirectedToLogin || redirectedFromAdmin || redirectedToAdmin) {
      const canonical = getTargetPathForPage(activePage);
      if (path !== canonical) {
        window.history.replaceState({ page: activePage }, '', canonical);
      }
    }
  }, [activePage]);

  // Verify authoritative backend role & session on mount and route changes
  useEffect(() => {
    let isMounted = true;

    const syncSessionAndRole = async () => {
      const liveUser = await fetchCurrentUser();
      if (!isMounted) return;

      if (!liveUser) {
        if (ADMIN_PAGES.includes(activePage) || STUDENT_PROTECTED_PAGES.includes(activePage)) {
          setActivePage('login');
          if (typeof window !== 'undefined') {
            window.history.replaceState({ page: 'login' }, '', '/login');
          }
        }
        return;
      }

      if (isAdminUser(liveUser)) {
        if (STUDENT_PROTECTED_PAGES.includes(activePage) || activePage === 'login') {
          setActivePage('admin-dashboard');
          if (typeof window !== 'undefined') {
            window.history.replaceState({ page: 'admin-dashboard' }, '', '/admin/dashboard');
          }
        }
        return;
      }

      // Authenticated student: block admin routes and restore onboarding state
      if (ADMIN_PAGES.includes(activePage)) {
        const fallback = liveUser.onboardingCompleted || isOnboardingCompleted(liveUser.id) ? 'dashboard' : 'onboarding';
        const fallbackPath = fallback === 'dashboard' ? '/app/dashboard' : '/onboarding';
        setActivePage(fallback);
        if (typeof window !== 'undefined') {
          window.history.replaceState({ page: fallback }, '', fallbackPath);
        }
        return;
      }

      try {
        const profile = await fetchStudentProfile();
        if (!isMounted) return;
        const isCompleted = Boolean(profile?.onboardingCompleted ?? liveUser.onboardingCompleted);

        if (isCompleted && (activePage === 'onboarding' || window.location.pathname.toLowerCase() === '/onboarding')) {
          setActivePage('dashboard');
          if (typeof window !== 'undefined') {
            window.history.replaceState({ page: 'dashboard' }, '', '/app/dashboard');
          }
        } else if (activePage === 'login' || activePage === 'landing') {
          const targetPage = isCompleted ? 'dashboard' : 'onboarding';
          setActivePage(targetPage);
          if (typeof window !== 'undefined') {
            window.history.replaceState({ page: targetPage }, '', targetPage === 'dashboard' ? '/app/dashboard' : '/onboarding');
          }
        }
      } catch {
        // Offline cached session fallback
      }
    };

    syncSessionAndRole();
    return () => {
      isMounted = false;
    };
  }, [activePage]);

  const navigateTo = (page) => {
    const currentUser = getCurrentUser();
    const isProtected = STUDENT_PROTECTED_PAGES.includes(page) || ADMIN_PAGES.includes(page);

    if (isProtected && !currentUser) {
      setActivePage('login');
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.history.pushState({ page: 'login' }, '', '/login');
      }
      return;
    }

    if (ADMIN_PAGES.includes(page) && !isAdminUser(currentUser)) {
      const studentFallback = isOnboardingCompleted(currentUser?.id) ? 'dashboard' : 'onboarding';
      const studentPath = studentFallback === 'dashboard' ? '/app/dashboard' : '/onboarding';
      setActivePage(studentFallback);
      if (typeof window !== 'undefined') {
        window.history.replaceState({ page: studentFallback }, '', studentPath);
      }
      return;
    }

    if (STUDENT_PROTECTED_PAGES.includes(page) && isAdminUser(currentUser)) {
      setActivePage('admin-dashboard');
      if (typeof window !== 'undefined') {
        window.history.replaceState({ page: 'admin-dashboard' }, '', '/admin/dashboard');
      }
      return;
    }

    setActivePage(page);
    if (typeof window !== 'undefined') {
      const targetPath = getTargetPathForPage(page);
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
          onEnterApp={() => {
            const current = getCurrentUser();
            if (!current) {
              navigateTo('login');
              return;
            }
            navigateTo(isAdminUser(current) ? 'admin-dashboard' : 'dashboard');
          }}
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

  if (activePage === 'feedback') {
    return (
      <Theme theme={themes[defaultThemeSlug]} mode="light">
        <PwaStatusBanners />
        <FeedbackPage onNavigate={navigateTo} />
      </Theme>
    );
  }

  if (ADMIN_PAGES.includes(activePage)) {
    const renderAdminPage = () => {
      switch (activePage) {
        case 'admin-dashboard':
          return <AdminDashboardPage onNavigate={navigateTo} />;
        case 'admin-students':
          return <AdminStudentsPage />;
        case 'admin-problem-reports':
          return <AdminProblemReportsPage />;
        case 'admin-feedback':
          return <AdminFeedbackPage onNavigate={navigateTo} />;
        case 'admin-settings':
          return <AdminSettingsPage />;
        default:
          return <AdminDashboardPage onNavigate={navigateTo} />;
      }
    };

    return (
      <Theme theme={themes[defaultThemeSlug]} mode="light">
        <AdminLayout activePage={activePage} onNavigate={navigateTo}>
          {renderAdminPage()}
        </AdminLayout>
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
