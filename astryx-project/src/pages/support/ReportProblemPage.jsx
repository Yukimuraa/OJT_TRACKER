import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@astryxdesign/core/Card';
import { Button } from '@astryxdesign/core/Button';
import { Divider } from '@astryxdesign/core/Divider';
import { Selector } from '@astryxdesign/core/Selector';
import { TextArea } from '@astryxdesign/core/TextArea';
import { TextInput } from '@astryxdesign/core/TextInput';
import { Banner } from '@astryxdesign/core/Banner';
import { VStack } from '@astryxdesign/core/VStack';
import { APP_CONFIG } from '../../config/appConfig';
import { GraduationCapIcon, CheckCircleIcon } from '../../components/common/BrandIcons';
import { getCurrentUser, fetchCurrentUser } from '../../services/authService';
import { PROBLEM_CATEGORIES, submitProblemReport } from '../../services/reportService';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ReportProblemPage({ onNavigate }) {
  const [authenticatedUser, setAuthenticatedUser] = useState(() => getCurrentUser());
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const submitLockRef = useRef(false);

  // Sync live Sanctum authentication state on mount so expired cached sessions
  // fall back to public visitor mode (requiring visitor Email Address).
  useEffect(() => {
    let isMounted = true;
    fetchCurrentUser()
      .then((liveUser) => {
        if (isMounted) {
          setAuthenticatedUser(liveUser);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  const isSignedIn = Boolean(authenticatedUser);

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back();
      return;
    }
    onNavigate?.(isSignedIn ? 'dashboard' : 'landing');
  };

  const handleBackToHome = () => {
    onNavigate?.('landing');
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!category || !PROBLEM_CATEGORIES.includes(category)) {
      nextErrors.category = 'Please select a problem category.';
    }

    const trimmedDesc = description.trim();
    if (!trimmedDesc) {
      nextErrors.description = 'Please describe the problem you encountered.';
    } else if (trimmedDesc.length < 5) {
      nextErrors.description = 'Please provide at least 5 characters describing the problem.';
    }

    if (!isSignedIn) {
      const trimmedEmail = email.trim();
      if (!trimmedEmail) {
        nextErrors.email = 'Please enter your email address so we can contact you if needed.';
      } else if (!EMAIL_REGEX.test(trimmedEmail)) {
        nextErrors.email = 'Please enter a valid email address.';
      }
    }

    return nextErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitLockRef.current || isSubmitting) return;

    setSubmitError('');
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    submitLockRef.current = true;
    setIsSubmitting(true);
    setErrors({});

    try {
      const result = await submitProblemReport({
        category,
        description,
        email,
        isAuthenticated: isSignedIn,
      });

      if (result.success) {
        setIsSubmitted(true);
        return;
      }

      if (result.errors?.email && isSignedIn) {
        // Server session expired between page load and submit; reveal email input
        // while preserving entered category and description.
        setAuthenticatedUser(null);
      }

      if (result.errors && Object.keys(result.errors).length > 0) {
        setErrors(result.errors);
      }
      setSubmitError(result.message || 'Unable to submit your report. Please try again.');
    } finally {
      submitLockRef.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#FCFCFB', minHeight: '100vh', padding: 'clamp(20px, 4vw, 48px) 16px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Top Header & Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                backgroundColor: 'rgba(16, 185, 129, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#10b981',
              }}
            >
              <GraduationCapIcon style={{ width: 22, height: 22 }} />
            </div>
            <div>
              <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#142b49', display: 'block' }}>
                {APP_CONFIG.name}
              </span>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Support Desk
              </span>
            </div>
          </div>

          <Button label="Return to Previous Page" variant="secondary" size="sm" onClick={handleBack} />
        </div>

        {/* Main Content Card */}
        <Card elevation="low" padding={6} style={{ backgroundColor: '#ffffff', borderRadius: 16 }}>
          {isSubmitted ? (
            <div
              role="status"
              aria-live="polite"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                padding: '24px 8px',
                gap: 16,
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  backgroundColor: 'rgba(16, 185, 129, 0.12)',
                  color: '#10b981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CheckCircleIcon style={{ width: 30, height: 30 }} />
              </div>

              <div style={{ maxWidth: 460 }}>
                <h1 style={{ fontSize: 'clamp(1.375rem, 3vw, 1.75rem)', fontWeight: 800, color: '#142b49', margin: '0 0 8px 0' }}>
                  Report Submitted Successfully!
                </h1>
                <p style={{ margin: 0, fontSize: '0.975rem', color: '#64748b', lineHeight: 1.6 }}>
                  Thank you for reporting this issue. Your feedback helps us improve OJT Hours Tracker.
                </p>
              </div>

              <div style={{ paddingTop: 8 }}>
                <Button
                  label="Back to Home"
                  variant="primary"
                  className="ojt-btn-black"
                  onClick={handleBackToHome}
                />
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <VStack gap={5}>
                <div>
                  <h1 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2rem)', fontWeight: 800, color: '#142b49', margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>
                    Report a Problem
                  </h1>
                  <p style={{ margin: 0, fontSize: '0.975rem', color: '#64748b', lineHeight: 1.6 }}>
                    Encountered an issue while using OJT Hours Tracker? Let us know what happened so we can investigate and improve your experience.
                  </p>
                </div>

                <Divider variant="subtle" />

                {submitError && (
                  <Banner
                    status="error"
                    title={submitError}
                    isDismissable
                    onDismiss={() => setSubmitError('')}
                  />
                )}

                {isSignedIn && (
                  <div
                    style={{
                      padding: '10px 14px',
                      borderRadius: 10,
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      fontSize: '0.85rem',
                      color: '#475569',
                    }}
                  >
                    You are currently signed in. Your report will automatically be linked to your student account.
                  </div>
                )}

                {/* Field 1: Problem Category (Required) */}
                <Selector
                  label="Problem Category"
                  isRequired
                  description="Select the type of issue you're experiencing."
                  placeholder="Select a problem category"
                  options={PROBLEM_CATEGORIES}
                  value={category}
                  onChange={(val) => {
                    setCategory(val);
                    setErrors((prev) => ({ ...prev, category: undefined }));
                  }}
                  status={errors.category ? { type: 'error', message: errors.category } : undefined}
                  width="100%"
                  isDisabled={isSubmitting}
                />

                {/* Public Visitor Only: Required Email Address */}
                {!isSignedIn && (
                  <TextInput
                    label="Email Address"
                    type="email"
                    isRequired
                    description="Required for public visitors so we can follow up regarding this report."
                    placeholder="you@example.com"
                    value={email}
                    onChange={(val) => {
                      setEmail(val);
                      setErrors((prev) => ({ ...prev, email: undefined }));
                    }}
                    status={errors.email ? { type: 'error', message: errors.email } : undefined}
                    width="100%"
                    isDisabled={isSubmitting}
                    autoComplete="email"
                  />
                )}

                {/* Field 2: Describe the Problem (Required) */}
                <TextArea
                  label="Describe the Problem"
                  isRequired
                  description="Please provide enough details to help us understand the issue."
                  placeholder="Tell us what happened and what you expected to happen..."
                  rows={5}
                  value={description}
                  onChange={(val) => {
                    setDescription(val);
                    setErrors((prev) => ({ ...prev, description: undefined }));
                  }}
                  status={errors.description ? { type: 'error', message: errors.description } : undefined}
                  width="100%"
                  isDisabled={isSubmitting}
                />

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 12, flexWrap: 'wrap', paddingTop: 4 }}>
                  <Button
                    type="button"
                    label="Cancel"
                    variant="secondary"
                    isDisabled={isSubmitting}
                    onClick={handleBack}
                  />
                  <Button
                    type="submit"
                    label={isSubmitting ? 'Submitting...' : 'Submit Report'}
                    variant="primary"
                    className="ojt-btn-black"
                    isLoading={isSubmitting}
                    isDisabled={isSubmitting}
                  />
                </div>
              </VStack>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}

export default ReportProblemPage;
