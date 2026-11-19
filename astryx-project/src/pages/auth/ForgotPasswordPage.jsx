import React, { useState } from 'react';
import { VStack } from '@astryxdesign/core/VStack';
import { HStack } from '@astryxdesign/core/HStack';
import { Card } from '@astryxdesign/core/Card';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { TextInput } from '@astryxdesign/core/TextInput';
import { Button } from '@astryxdesign/core/Button';
import { Icon } from '@astryxdesign/core/Icon';
import { Divider } from '@astryxdesign/core/Divider';
import { Banner } from '@astryxdesign/core/Banner';
import { GraduationCapIcon } from '../../components/common/BrandIcons';
import { requestPasswordReset } from '../../services/authService';

const CURRENT_YEAR = new Date().getFullYear();

export function ForgotPasswordPage({ onNavigate }) {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const validate = () => {
    const nextErrors = {};
    const trimmed = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!trimmed) {
      nextErrors.email = 'Email address is required.';
    } else if (!emailRegex.test(trimmed)) {
      nextErrors.email = 'Please enter a valid email address.';
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
      const result = await requestPasswordReset(email.trim());
      setIsSubmitting(false);

      if (result.success) {
        setIsSuccess(true);
        setSuccessMessage(
          result.message ||
            "We've received your request. If an account exists with this email address, you will receive a password reset link shortly. Please check your inbox."
        );
      } else {
        setErrors({ general: result.error || 'Failed to send password reset email. Please try again.' });
      }
    } catch {
      setIsSubmitting(false);
      setErrors({ general: 'An unexpected network error occurred. Please check your connection and try again.' });
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
          style={{ width: '100%', maxWidth: 460 }}
        >
          <VStack gap={6}>
            <VStack gap={2} align="center">
              <Heading level={1} align="center">
                Reset Password
              </Heading>
              <Text type="body" color="secondary" align="center">
                Enter your registered student email address and we'll send you a secure link to reset your password.
              </Text>
            </VStack>

            {errors.general && (
              <Banner
                status="error"
                title={errors.general}
              />
            )}

            {isSuccess ? (
              <VStack gap={5}>
                <Banner
                  status="success"
                  title={successMessage}
                />

                <Text size="sm" color="secondary" align="center">
                  Did not receive an email? Check your spam/junk folder or request another link below.
                </Text>

                <HStack gap={3} justify="center">
                  <Button
                    label="Resend Reset Link"
                    variant="secondary"
                    onClick={() => {
                      setIsSuccess(false);
                      setSuccessMessage('');
                    }}
                  />
                  <Button
                    label="Back to Login"
                    variant="primary"
                    onClick={() => onNavigate?.('login')}
                  />
                </HStack>
              </VStack>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <VStack gap={4}>
                  <TextInput
                    type="email"
                    label="Registered Email Address"
                    isRequired
                    placeholder="name@school.edu.ph"
                    value={email}
                    onChange={(val) => {
                      setEmail(val);
                      if (errors.email) setErrors((p) => ({ ...p, email: undefined }));
                    }}
                    status={errors.email ? { type: 'error', message: errors.email } : undefined}
                    width="100%"
                  />

                  <Button
                    label="Send Reset Link"
                    variant="primary"
                    size="lg"
                    type="submit"
                    isLoading={isSubmitting}
                    width="100%"
                  />
                </VStack>
              </form>
            )}

            <Divider variant="subtle" />

            <HStack justify="center" align="center" gap={1}>
              <Text size="sm" color="secondary">
                Remember your password?
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
