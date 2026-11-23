import React, { useState } from 'react';
import { Banner } from '@astryxdesign/core/Banner';
import {
  AuthSplitLayout,
  AuthInput,
  AuthPasswordInput,
  PasswordRequirements,
  evaluatePasswordRequirements,
} from '../../components/auth/AuthFormControls';
import { registerUser } from '../../services/authService';
import { loadStoredProfile, saveStoredProfile } from '../../services/profileService';

export function RegisterPage({ onNavigate }) {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    studentId: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { allMet: isPasswordStrong } = evaluatePasswordRequirements(form.password);

  // Real-time confirm password match state (never show success when empty)
  const hasConfirmInput = form.confirmPassword.length > 0;
  const passwordsMatch =
    hasConfirmInput && form.password.length > 0 && form.password === form.confirmPassword;
  const liveConfirmMismatch =
    hasConfirmInput && form.password !== form.confirmPassword ? 'Passwords do not match.' : undefined;

  const confirmError = errors.confirmPassword || liveConfirmMismatch;
  const confirmSuccess = !confirmError && passwordsMatch ? 'Passwords match' : undefined;

  const validate = () => {
    const nextErrors = {};

    if (!form.fullName.trim()) {
      nextErrors.fullName = 'Full name is required.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email.trim()) {
      nextErrors.email = 'Email address is required.';
    } else if (!emailRegex.test(form.email.trim())) {
      nextErrors.email = 'Please enter a valid email address.';
    }

    // Student ID is optional — only validate length if provided
    if (form.studentId.trim().length > 50) {
      nextErrors.studentId = 'Student ID must not exceed 50 characters.';
    }

    if (!form.password) {
      nextErrors.password = 'Password is required.';
    } else if (!isPasswordStrong) {
      nextErrors.password = 'Password must meet all security requirements.';
    }

    if (!form.confirmPassword) {
      nextErrors.confirmPassword = 'Please confirm your password.';
    } else if (form.password !== form.confirmPassword) {
      nextErrors.confirmPassword = 'Passwords do not match.';
    }

    return nextErrors;
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    const trimmedStudentId = form.studentId.trim();

    try {
      const result = await registerUser({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        studentId: trimmedStudentId || null,
        password: form.password,
        confirmPassword: form.confirmPassword,
      });

      setIsSubmitting(false);

      if (!result.success) {
        const fieldErrors = {};
        if (result.errors?.email?.[0]) fieldErrors.email = result.errors.email[0];
        if (result.errors?.student_id?.[0]) fieldErrors.studentId = result.errors.student_id[0];
        if (result.errors?.password?.[0]) fieldErrors.password = result.errors.password[0];
        if (result.errors?.name?.[0]) fieldErrors.fullName = result.errors.name[0];

        setErrors({
          ...fieldErrors,
          form: result.error,
        });
        return;
      }

      // Sync optional studentId (or empty string if omitted — never invent an ID) to local profile cache
      const userId = result.user?.id;
      const existingProfile = loadStoredProfile(userId);
      saveStoredProfile(
        {
          ...existingProfile,
          fullName: form.fullName.trim(),
          studentId: trimmedStudentId,
        },
        userId
      );

      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem('ojt_resume_onboarding_step', '0');
      }

      onNavigate?.('onboarding');
    } catch {
      setIsSubmitting(false);
      setErrors({ form: 'An unexpected error occurred during registration. Please try again.' });
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
          Create your account
        </h1>
        <p
          style={{
            fontSize: 15,
            lineHeight: 1.5,
            color: '#666662',
            margin: 0,
          }}
        >
          Start tracking your OJT journey.
        </p>
      </div>

      {errors.form && (
        <Banner
          status="error"
          title={errors.form}
        />
      )}

      <form onSubmit={handleSubmit} noValidate style={{ width: '100%' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%' }}>
          {/* 1. Full Name — REQUIRED */}
          <AuthInput
            id="register-fullname"
            name="fullName"
            label="Full Name"
            required
            autoComplete="name"
            placeholder="Enter your full name"
            value={form.fullName}
            onChange={(val) => {
              setForm((p) => ({ ...p, fullName: val }));
              if (errors.fullName) setErrors((p) => ({ ...p, fullName: undefined }));
            }}
            error={errors.fullName}
            disabled={isSubmitting}
          />

          {/* 2. Email Address — REQUIRED */}
          <AuthInput
            id="register-email"
            name="email"
            type="email"
            label="Email Address"
            required
            autoComplete="email"
            placeholder="name@school.edu.ph"
            value={form.email}
            onChange={(val) => {
              setForm((p) => ({ ...p, email: val }));
              if (errors.email) setErrors((p) => ({ ...p, email: undefined }));
            }}
            error={errors.email}
            disabled={isSubmitting}
          />

          {/* 3. Student ID — OPTIONAL */}
          <AuthInput
            id="register-student-id"
            name="studentId"
            label="Student ID"
            optionalLabel="Optional"
            placeholder="Enter your student ID"
            value={form.studentId}
            onChange={(val) => {
              setForm((p) => ({ ...p, studentId: val }));
              if (errors.studentId) setErrors((p) => ({ ...p, studentId: undefined }));
            }}
            error={errors.studentId}
            disabled={isSubmitting}
          />

          {/* 4. Password — REQUIRED + Interactive Password Requirements */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <AuthPasswordInput
              id="register-password"
              name="password"
              label="Password"
              required
              autoComplete="new-password"
              placeholder="Create a password"
              value={form.password}
              onChange={(val) => {
                setForm((p) => ({ ...p, password: val }));
                if (errors.password) setErrors((p) => ({ ...p, password: undefined }));
              }}
              showPassword={showPassword}
              onToggleShow={() => setShowPassword((prev) => !prev)}
              error={errors.password}
              disabled={isSubmitting}
            />

            <PasswordRequirements password={form.password} />
          </div>

          {/* 5. Confirm Password — REQUIRED */}
          <AuthPasswordInput
            id="register-confirm-password"
            name="confirmPassword"
            label="Confirm Password"
            required
            autoComplete="new-password"
            placeholder="Re-enter your password"
            value={form.confirmPassword}
            onChange={(val) => {
              setForm((p) => ({ ...p, confirmPassword: val }));
              if (errors.confirmPassword) {
                setErrors((p) => ({ ...p, confirmPassword: undefined }));
              }
            }}
            showPassword={showConfirmPassword}
            onToggleShow={() => setShowConfirmPassword((prev) => !prev)}
            error={confirmError}
            successMessage={confirmSuccess}
            disabled={isSubmitting}
          />

          {/* Primary Create Account Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="ojt-auth-primary-btn"
            style={{ marginTop: 4 }}
          >
            {isSubmitting ? 'Creating account...' : 'Create Account'}
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
        <span>Already have an account?</span>
        <button
          type="button"
          onClick={() => onNavigate?.('login')}
          className="ojt-auth-link-btn"
        >
          Sign In
        </button>
      </div>
    </AuthSplitLayout>
  );
}
