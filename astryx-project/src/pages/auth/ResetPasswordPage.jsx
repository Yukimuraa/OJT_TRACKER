import React, { useState, useEffect } from 'react';
import { VStack } from '@astryxdesign/core/VStack';
import { HStack } from '@astryxdesign/core/HStack';
import { Card } from '@astryxdesign/core/Card';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { TextInput } from '@astryxdesign/core/TextInput';
import { InputGroup } from '@astryxdesign/core/InputGroup';
import { Button } from '@astryxdesign/core/Button';
import { Icon } from '@astryxdesign/core/Icon';
import { Divider } from '@astryxdesign/core/Divider';
import { Banner } from '@astryxdesign/core/Banner';
import { StatusDot } from '@astryxdesign/core/StatusDot';
import { GraduationCapIcon } from '../../components/common/BrandIcons';
import { resetPassword } from '../../services/authService';

const CURRENT_YEAR = new Date().getFullYear();

export function ResetPasswordPage({ onNavigate }) {
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isLinkInvalid, setIsLinkInvalid] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  // Parse token, email, and detect standalone PWA mode
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const urlToken = searchParams.get('token') || '';
      const urlEmail = searchParams.get('email') || '';

      if (!urlToken || !urlEmail) {
        setIsLinkInvalid(true);
      } else {
        setToken(urlToken.trim());
        setEmail(urlEmail.trim());
      }

      // Check whether this page was opened inside the standalone PWA window
      const standalone = Boolean(
        window.matchMedia?.('(display-mode: standalone)')?.matches ||
        window.matchMedia?.('(display-mode: fullscreen)')?.matches ||
        window.matchMedia?.('(display-mode: minimal-ui)')?.matches ||
        window.navigator?.standalone === true ||
        document.referrer?.includes('android-app://')
      );
      setIsStandalone(standalone);
    }
  }, []);

  // Opens the current URL in an external web browser (Chrome/Safari) rather than inside the PWA
  const handleOpenInBrowser = () => {
    if (typeof window === 'undefined') return;
    const currentUrl = window.location.href;
    const isAndroid = /Android/i.test(navigator.userAgent || '');

    if (isAndroid) {
      // Android Intent scheme forces Android OS to hand off the link directly to Google Chrome app
      const cleanUrl = currentUrl.replace(/^https?:\/\//i, '');
      const intentUrl = `intent://${cleanUrl}#Intent;scheme=https;package=com.android.chrome;end`;
      window.location.href = intentUrl;
    } else {
      window.open(currentUrl, '_blank', 'noopener,noreferrer');
    }
  };

  // Password requirements checks
  const hasMinLength = password.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const isPasswordStrong = hasMinLength && hasLetter && hasNumber;

  const validate = () => {
    const nextErrors = {};

    if (!password) {
      nextErrors.password = 'New password is required.';
    } else if (!isPasswordStrong) {
      nextErrors.password = 'Password must meet all security requirements.';
    }

    if (!confirmPassword) {
      nextErrors.confirmPassword = 'Confirm your new password.';
    } else if (password !== confirmPassword) {
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

    try {
      const result = await resetPassword({
        token,
        email,
        password,
        password_confirmation: confirmPassword,
      });

      setIsSubmitting(false);

      if (result.success) {
        setIsSuccess(true);
        setSuccessMessage(result.message || 'Your password has been successfully reset.');
      } else {
        setErrors({ general: result.error || 'Failed to reset password. The link may be invalid or expired.' });
      }
    } catch {
      setIsSubmitting(false);
      setErrors({ general: 'An unexpected error occurred. Please try again or request a new reset link.' });
    }
  };

  return (
    <div className="ojt-landing-root" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Top Header Bar */}
      <header
        style={{
          borderBottom: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-background-surface)',
          padding: '16px 24px',
        }}
      >
        <div className="ojt-landing-container">
          <HStack justify="between" align="center">
            <HStack
              gap={2}
              align="center"
              style={{ cursor: 'pointer' }}
              onClick={() => onNavigate?.('landing')}
            >
              <Icon icon={GraduationCapIcon} size="md" color="accent" />
              <Heading level={3}>OJT Tracker</Heading>
            </HStack>

            <Button
              label="Back to Home"
              variant="ghost"
              size="sm"
              icon={<Icon icon="chevronLeft" size="sm" />}
              onClick={() => onNavigate?.('landing')}
            />
          </HStack>
        </div>
      </header>

      {/* Main Content */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 16px',
        }}
      >
        <Card
          elevation="low"
          padding={6}
          style={{ width: '100%', maxWidth: 480 }}
        >
          <VStack gap={6}>
            <VStack gap={2} align="center">
              <Heading level={1} align="center">
                Set New Password
              </Heading>
              <Text type="body" color="secondary" align="center">
                Create a strong, new password for your student account.
              </Text>
            </VStack>

            {/* Standalone PWA Detection Banner: gives student 1-tap breakout to Chrome/Safari */}
            {isStandalone && !isSuccess && (
              <div
                style={{
                  padding: '12px 14px',
                  backgroundColor: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  borderRadius: 10,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: '1rem' }}>🌐</span>
                  <Text size="sm" weight="semibold" color="primary">
                    Opened inside Installed App
                  </Text>
                </div>
                <Text size="sm" color="secondary">
                  You can reset your password right here, or open this page in your normal web browser.
                </Text>
                <HStack justify="end">
                  <Button
                    label="Open in Web Browser"
                    variant="secondary"
                    size="sm"
                    onClick={handleOpenInBrowser}
                  />
                </HStack>
              </div>
            )}

            {/* Invalid or Missing Link Alert */}
            {isLinkInvalid ? (
              <VStack gap={4}>
                <Banner
                  status="error"
                  title="Invalid or expired reset link. The reset token or email address is missing from the URL. Please request a new link."
                />
                <Button
                  label="Request New Reset Link"
                  variant="primary"
                  onClick={() => onNavigate?.('forgot-password')}
                  width="100%"
                />
              </VStack>
            ) : isSuccess ? (
              /* Success Confirmation */
              <VStack gap={5}>
                <Banner
                  status="success"
                  title={successMessage}
                />
                <Text size="sm" color="secondary" align="center">
                  You can now log in using your updated password.
                </Text>
                <Button
                  label="Proceed to Login"
                  variant="primary"
                  size="lg"
                  onClick={() => {
                    try {
                      if (email) sessionStorage.setItem('ojt_prefill_email', email);
                    } catch {}
                    onNavigate?.('login');
                  }}
                  width="100%"
                />
                {isStandalone && (
                  <Button
                    label="Open Login in Web Browser"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const loginUrl = `${window.location.origin}/login`;
                      if (/Android/i.test(navigator.userAgent || '')) {
                        window.location.href = `intent://${loginUrl.replace(/^https?:\/\//i, '')}#Intent;scheme=https;package=com.android.chrome;end`;
                      } else {
                        window.open(loginUrl, '_blank', 'noopener,noreferrer');
                      }
                    }}
                    width="100%"
                  />
                )}
              </VStack>
            ) : (
              /* Reset Password Form */
              <form onSubmit={handleSubmit} noValidate>
                <VStack gap={4}>
                  {errors.general && (
                    <Banner
                      status="error"
                      title={errors.general}
                    />
                  )}

                  {/* Registered Email (Read-Only) */}
                  <TextInput
                    type="email"
                    label="Account Email"
                    value={email}
                    disabled
                    readOnly
                    width="100%"
                  />

                  {/* New Password */}
                  <InputGroup
                    label="New Password"
                    isRequired
                    status={errors.password ? { type: 'error', message: errors.password } : undefined}
                  >
                    <TextInput
                      type={showPassword ? 'text' : 'password'}
                      label="New Password"
                      isLabelHidden
                      placeholder="Enter new password"
                      value={password}
                      onChange={(val) => {
                        setPassword(val);
                        if (errors.password) setErrors((p) => ({ ...p, password: undefined }));
                      }}
                      width="100%"
                    />
                    <Button
                      label={showPassword ? 'Hide' : 'Show'}
                      variant="ghost"
                      onClick={() => setShowPassword(!showPassword)}
                    />
                  </InputGroup>

                  {/* Password Requirements Checklist */}
                  <div
                    style={{
                      padding: 12,
                      backgroundColor: '#f8fafc',
                      borderRadius: 8,
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 6,
                    }}
                  >
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>
                      Password Requirements:
                    </span>
                    <HStack gap={2} align="center">
                      <StatusDot variant={hasMinLength ? 'success' : 'neutral'} />
                      <Text size="sm" color={hasMinLength ? 'primary' : 'secondary'}>
                        At least 8 characters
                      </Text>
                    </HStack>
                    <HStack gap={2} align="center">
                      <StatusDot variant={hasLetter ? 'success' : 'neutral'} />
                      <Text size="sm" color={hasLetter ? 'primary' : 'secondary'}>
                        Contains letters (a-z, A-Z)
                      </Text>
                    </HStack>
                    <HStack gap={2} align="center">
                      <StatusDot variant={hasNumber ? 'success' : 'neutral'} />
                      <Text size="sm" color={hasNumber ? 'primary' : 'secondary'}>
                        Contains at least one number (0-9)
                      </Text>
                    </HStack>
                  </div>

                  {/* Confirm New Password */}
                  <InputGroup
                    label="Confirm New Password"
                    isRequired
                    status={errors.confirmPassword ? { type: 'error', message: errors.confirmPassword } : undefined}
                  >
                    <TextInput
                      type={showConfirmPassword ? 'text' : 'password'}
                      label="Confirm New Password"
                      isLabelHidden
                      placeholder="Re-enter new password"
                      value={confirmPassword}
                      onChange={(val) => {
                        setConfirmPassword(val);
                        if (errors.confirmPassword) setErrors((p) => ({ ...p, confirmPassword: undefined }));
                      }}
                      width="100%"
                    />
                    <Button
                      label={showConfirmPassword ? 'Hide' : 'Show'}
                      variant="ghost"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    />
                  </InputGroup>

                  <Button
                    label="Reset Password"
                    variant="primary"
                    size="lg"
                    type="submit"
                    isLoading={isSubmitting}
                    disabled={!password || !confirmPassword || !isPasswordStrong}
                    width="100%"
                  />
                </VStack>
              </form>
            )}

            <Divider variant="subtle" />

            <HStack justify="center" align="center" gap={1}>
              <Text size="sm" color="secondary">
                Remembered your password?
              </Text>
              <Button
                label="Back to Login"
                variant="ghost"
                size="sm"
                onClick={() => onNavigate?.('login')}
              />
            </HStack>
          </VStack>
        </Card>
      </main>

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-background-surface)',
          padding: '16px 24px',
          textAlign: 'center',
        }}
      >
        <Text type="supporting" color="secondary" size="sm">
          © {CURRENT_YEAR} OJT Tracker. All rights reserved.
        </Text>
      </footer>
    </div>
  );
}
