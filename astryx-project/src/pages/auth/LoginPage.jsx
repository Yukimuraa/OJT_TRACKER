import React, { useState } from 'react';
import { Banner } from '@astryxdesign/core/Banner';
import {
  AuthSplitLayout,
  AuthInput,
  AuthPasswordInput,
} from '../../components/auth/AuthFormControls';
import { isOnboardingCompleted } from '../../services/onboardingService';
import { fetchStudentProfile } from '../../services/profileService';
import { loginUser } from '../../services/authService';

export function LoginPage({ onNavigate }) {
  const [email, setEmail] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const prefill = sessionStorage.getItem('ojt_prefill_email');
        if (prefill) {
          sessionStorage.removeItem('ojt_prefill_email');
          return prefill;
        }
      } catch {}
    }
    return '';
  });
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    const nextErrors = {};
    const trimmedEmail = email.trim();
    if (!trimmedEmail) nextErrors.email = 'Email address is required.';
    if (!password) nextErrors.password = 'Password is required.';

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const result = await loginUser({
        email: trimmedEmail,
        password,
        remember: true,
      });
      setIsSubmitting(false);

      if (!result.success) {
        if (result.code === 'ACCOUNT_NOT_FOUND') {
          setErrors({
            general: 'Account not found. Please register first.',
            email: 'Account not found with this email.',
          });
        } else if (result.code === 'INVALID_CREDENTIALS') {
          setErrors({
            general: 'Incorrect email or password.',
            password: 'Password does not match our records.',
          });
        } else {
          setErrors({ general: result.error || 'Authentication failed. Please try again.' });
        }
        return;
      }

      // Retrieve backend profile before routing to ensure onboarding and requirements are restored on any device
      let isCompleted = Boolean(
        result.user?.onboardingCompleted ||
        result.user?.studentProfile?.onboarding_completed
      );

      let savedStep = Number(
        result.user?.onboardingStep ??
        result.user?.studentProfile?.onboarding_step ??
        0
      );

      try {
        const remoteProfile = await fetchStudentProfile();
        if (remoteProfile?.onboardingCompleted) {
          isCompleted = true;
        } else {
          if (typeof remoteProfile?.onboardingStep === 'number') {
            savedStep = remoteProfile.onboardingStep;
          }
          if (!isCompleted) {
            isCompleted = isOnboardingCompleted(result.user?.id);
          }
        }
      } catch (err) {
        console.warn('Backend profile fetch failed after login, falling back to local state:', err);
        if (!isCompleted) {
          isCompleted = isOnboardingCompleted(result.user?.id);
        }
      }

      if (isCompleted) {
        onNavigate?.('dashboard');
      } else {
        if (typeof sessionStorage !== 'undefined') {
          sessionStorage.setItem('ojt_resume_onboarding_step', String(savedStep < 4 ? savedStep : 0));
        }
        onNavigate?.('onboarding');
      }
    } catch {
      setIsSubmitting(false);
      setErrors({ general: 'An unexpected authentication error occurred. Please try again.' });
    }
  };

  return (
    <AuthSplitLayout onNavigate={onNavigate}>
      {/* Form Heading & Supporting Text */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <h1
          style={{
            fontSize: 'clamp(1.6rem, 2.4vw, 1.95rem)',
            fontWeight: 700,
            letterSpacing: '-0.025em',
            color: '#111111',
            margin: 0,
            lineHeight: 1.2,
          }}
        >
          Welcome back
        </h1>
        <p
          style={{
            fontSize: 15,
            lineHeight: 1.5,
            color: '#666662',
            margin: 0,
          }}
        >
          Sign in to continue tracking your OJT progress.
        </p>
      </div>

      {errors.general && (
        <Banner
          status="error"
          title={errors.general}
        />
      )}

      <form onSubmit={handleSubmit} noValidate style={{ width: '100%' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18, width: '100%' }}>
          <AuthInput
            id="login-email"
            name="email"
            type="email"
            label="Email Address"
            required
            autoComplete="email"
            placeholder="name@school.edu.ph"
            value={email}
            onChange={(val) => {
              setEmail(val);
              if (errors.email) setErrors((p) => ({ ...p, email: undefined }));
            }}
            error={errors.email}
            disabled={isSubmitting}
          />

          <AuthPasswordInput
            id="login-password"
            name="password"
            label="Password"
            required
            autoComplete="current-password"
            placeholder="Enter your password"
            value={password}
            onChange={(val) => {
              setPassword(val);
              if (errors.password) setErrors((p) => ({ ...p, password: undefined }));
            }}
            showPassword={showPassword}
            onToggleShow={() => setShowPassword((prev) => !prev)}
            error={errors.password}
            disabled={isSubmitting}
          />

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              marginTop: -4,
            }}
          >
            <button
              type="button"
              onClick={() => onNavigate?.('forgot-password')}
              className="ojt-auth-link-btn"
            >
              Forgot Password?
            </button>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="ojt-auth-primary-btn"
          >
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </button>
        </div>
      </form>

      <div
        style={{
          borderTop: '1px solid #E5E5E0',
          paddingTop: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          flexWrap: 'wrap',
          fontSize: 14,
          color: '#666662',
        }}
      >
        <span>Don't have an account?</span>
        <button
          type="button"
          onClick={() => onNavigate?.('register')}
          className="ojt-auth-link-btn"
        >
          Create Account
        </button>
      </div>
    </AuthSplitLayout>
  );
}
