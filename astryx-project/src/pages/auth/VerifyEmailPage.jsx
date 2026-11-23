import React, { useState, useEffect } from 'react';
import {
  AuthSplitLayout,
  AuthInput,
} from '../../components/auth/AuthFormControls';
import { CheckCircleIcon, AlertCircleIcon } from '../../components/common/BrandIcons';
import {
  isAuthenticated,
  getCurrentUser,
  verifyEmailLink,
  resendVerificationEmail,
  updateCurrentUserSession,
} from '../../services/authService';
import { isOnboardingCompleted } from '../../services/onboardingService';

function parseInitialVerificationState() {
  if (typeof window === 'undefined') {
    return { status: 'invalid', email: '', onboardingCompleted: null, onboardingStep: null, params: null };
  }
  const search = new URLSearchParams(window.location.search);
  const directStatus = search.get('status');
  const email = search.get('email') || getCurrentUser()?.email || '';
  const obCompletedParam = search.get('onboarding_completed');
  const obStepParam = search.get('onboarding_step');
  const id = search.get('id');
  const hash = search.get('hash');
  const expires = search.get('expires');
  const signature = search.get('signature');

  const onboardingCompleted =
    obCompletedParam === '1' || obCompletedParam === 'true'
      ? true
      : obCompletedParam === '0' || obCompletedParam === 'false'
      ? false
      : null;
  const onboardingStep =
    obStepParam !== null && !isNaN(Number(obStepParam)) ? Number(obStepParam) : null;

  if (directStatus) {
    const normalized =
      directStatus === 'verified' ||
      directStatus === 'already_verified' ||
      directStatus === 'expired' ||
      directStatus === 'invalid' ||
      directStatus === 'failed'
        ? directStatus
        : 'invalid';

    if (normalized === 'verified' || normalized === 'already_verified') {
      updateCurrentUserSession({
        isEmailVerified: true,
        emailVerifiedAt: new Date().toISOString(),
        ...(typeof onboardingCompleted === 'boolean' ? { onboardingCompleted } : {}),
        ...(typeof onboardingStep === 'number' ? { onboardingStep } : {}),
      });
      if (typeof onboardingStep === 'number' && typeof sessionStorage !== 'undefined') {
        try {
          sessionStorage.setItem('ojt_resume_onboarding_step', String(onboardingStep < 4 ? onboardingStep : 0));
        } catch {}
      }
    }

    return {
      status: normalized,
      email,
      onboardingCompleted,
      onboardingStep,
      params: null,
    };
  }

  if (id && hash && signature) {
    return {
      status: 'verifying',
      email,
      onboardingCompleted: null,
      onboardingStep: null,
      params: { id, hash, expires, signature },
    };
  }

  return { status: 'invalid', email, onboardingCompleted: null, onboardingStep: null, params: null };
}

export function VerifyEmailPage({ onNavigate }) {
  const initial = parseInitialVerificationState();
  const [status, setStatus] = useState(initial.status);
  const [emailInput, setEmailInput] = useState(initial.email);
  const [remoteOnboardingCompleted, setRemoteOnboardingCompleted] = useState(initial.onboardingCompleted);
  const [remoteOnboardingStep, setRemoteOnboardingStep] = useState(initial.onboardingStep);
  const [resendState, setResendState] = useState({ loading: false, sent: false, error: null });

  const authed = isAuthenticated();
  const currentUser = getCurrentUser();

  useEffect(() => {
    if (initial.status !== 'verifying' || !initial.params) return;
    let isMounted = true;

    (async () => {
      const res = await verifyEmailLink(initial.params);
      if (!isMounted) return;
      if (res.email) setEmailInput(res.email);
      if (typeof res.onboardingCompleted === 'boolean') {
        setRemoteOnboardingCompleted(res.onboardingCompleted);
      }
      if (typeof res.onboardingStep === 'number') {
        setRemoteOnboardingStep(res.onboardingStep);
        if (typeof sessionStorage !== 'undefined') {
          try {
            sessionStorage.setItem(
              'ojt_resume_onboarding_step',
              String(res.onboardingStep < 4 ? res.onboardingStep : 0)
            );
          } catch {}
        }
      }
      setStatus(res.status || (res.success ? 'verified' : 'failed'));
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  const hasCompletedOnboarding = Boolean(
    remoteOnboardingCompleted ??
      currentUser?.onboardingCompleted ??
      isOnboardingCompleted(currentUser?.id)
  );

  const handleContinue = () => {
    if (authed) {
      if (!hasCompletedOnboarding && typeof remoteOnboardingStep === 'number' && typeof sessionStorage !== 'undefined') {
        try {
          sessionStorage.setItem(
            'ojt_resume_onboarding_step',
            String(remoteOnboardingStep < 4 ? remoteOnboardingStep : 0)
          );
        } catch {}
      }
      onNavigate?.(hasCompletedOnboarding ? 'dashboard' : 'onboarding');
    } else {
      if (emailInput && typeof sessionStorage !== 'undefined') {
        try {
          sessionStorage.setItem('ojt_prefill_email', emailInput);
        } catch {}
      }
      onNavigate?.('login');
    }
  };

  const handleResend = async (e) => {
    if (e) e.preventDefault();
    const targetEmail = (emailInput || currentUser?.email || '').trim();
    if (!authed && !targetEmail) {
      setResendState({
        loading: false,
        sent: false,
        error: 'Please enter your email address to resend the verification link.',
      });
      return;
    }

    setResendState({ loading: true, sent: false, error: null });
    const res = await resendVerificationEmail(targetEmail);
    if (res.success) {
      if (res.status === 'already_verified') {
        setStatus('already_verified');
        setResendState({ loading: false, sent: false, error: null });
      } else {
        setResendState({ loading: false, sent: true, error: null });
      }
    } else {
      setResendState({
        loading: false,
        sent: false,
        error: res.error || 'Could not resend verification email. Please try again.',
      });
    }
  };

  const isSuccess = status === 'verified' || status === 'already_verified';
  const canResend = status === 'expired' || status === 'invalid' || status === 'failed';

  const stateConfig = {
    verifying: {
      heading: 'Verifying email...',
      description: 'Please wait while we validate your verification link.',
    },
    verified: {
      heading: 'Email successfully verified',
      description: 'Your email address has been successfully verified!',
    },
    already_verified: {
      heading: 'Email already verified',
      description: 'Your email address has already been verified. You can continue to your account.',
    },
    expired: {
      heading: 'Verification link expired',
      description: 'This email verification link has expired. Request a new verification link below.',
    },
    invalid: {
      heading: 'Invalid verification link',
      description: 'This verification link is invalid or has already been replaced.',
    },
    failed: {
      heading: 'Verification failed',
      description: 'We could not complete email verification at this moment. Please request a fresh link.',
    },
  }[status] || {
    heading: 'Invalid verification link',
    description: 'This verification link is invalid.',
  };

  return (
    <AuthSplitLayout onNavigate={onNavigate}>
      <div
        id="ojt-verify-email-card"
        data-verification-status={status}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
        }}
      >
        {/* Status Icon Badge */}
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: isSuccess
              ? 'rgba(22, 163, 74, 0.1)'
              : status === 'verifying'
              ? '#F2F2EF'
              : 'rgba(220, 38, 38, 0.1)',
            color: isSuccess ? '#16A34A' : status === 'verifying' ? '#141413' : '#DC2626',
          }}
        >
          {status === 'verifying' ? (
            <div
              style={{
                width: 22,
                height: 22,
                border: '2.5px solid #D4D4D0',
                borderTopColor: '#141413',
                borderRadius: '50%',
                animation: 'ojtSpin 0.8s linear infinite',
              }}
            />
          ) : isSuccess ? (
            <CheckCircleIcon width={24} height={24} />
          ) : (
            <AlertCircleIcon width={24} height={24} />
          )}
        </div>

        {/* Heading & Message */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <h1
            style={{
              fontSize: 'clamp(1.5rem, 2.3vw, 1.85rem)',
              fontWeight: 700,
              letterSpacing: '-0.025em',
              color: '#111111',
              margin: 0,
              lineHeight: 1.2,
            }}
          >
            {stateConfig.heading}
          </h1>
          <p
            style={{
              fontSize: 15,
              lineHeight: 1.55,
              color: isSuccess ? '#15803D' : '#52524E',
              fontWeight: isSuccess ? 600 : 400,
              margin: 0,
            }}
          >
            {stateConfig.description}
          </p>
        </div>

        {/* Success Action */}
        {isSuccess && (
          <button
            type="button"
            onClick={handleContinue}
            className="ojt-auth-primary-btn"
          >
            {authed
              ? hasCompletedOnboarding
                ? 'Continue to Dashboard'
                : 'Continue Onboarding'
              : 'Continue to Sign In'}
          </button>
        )}

        {/* Resend Verification Form for Expired / Invalid / Failed states */}
        {canResend && (
          <form onSubmit={handleResend} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {!authed && (
              <AuthInput
                id="verify-resend-email"
                name="email"
                type="email"
                label="Email Address"
                required
                placeholder="name@school.edu.ph"
                value={emailInput}
                onChange={(val) => setEmailInput(val)}
                error={resendState.error}
                disabled={resendState.loading}
              />
            )}

            {authed && resendState.error && (
              <div role="alert" className="ojt-auth-feedback is-error">
                <AlertCircleIcon width={15} height={15} />
                <span>{resendState.error}</span>
              </div>
            )}

            {resendState.sent && (
              <div role="status" className="ojt-auth-feedback is-success">
                <CheckCircleIcon width={15} height={15} />
                <span>A new verification link has been sent to your email address.</span>
              </div>
            )}

            <button
              type="submit"
              disabled={resendState.loading}
              className="ojt-auth-primary-btn"
            >
              {resendState.loading ? 'Sending verification email...' : 'Resend Verification Email'}
            </button>
          </form>
        )}

        <div
          style={{
            borderTop: '1px solid #E5E5E0',
            paddingTop: 18,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
          }}
        >
          <button
            type="button"
            onClick={() => onNavigate?.(authed ? (hasCompletedOnboarding ? 'dashboard' : 'onboarding') : 'login')}
            className="ojt-auth-link-btn"
          >
            {authed ? (hasCompletedOnboarding ? 'Go to Dashboard' : 'Return to Onboarding') : 'Back to Sign In'}
          </button>
        </div>
      </div>
    </AuthSplitLayout>
  );
}
