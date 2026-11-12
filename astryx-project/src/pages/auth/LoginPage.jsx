import React, { useState } from 'react';
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
import { GraduationCapIcon } from '../../components/common/BrandIcons';
import { isOnboardingCompleted } from '../../services/onboardingService';
import { loginUser } from '../../services/authService';

const CURRENT_YEAR = new Date().getFullYear();

export function LoginPage({ onNavigate }) {
  const [email, setEmail] = useState('');
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
      const result = await loginUser({ email: trimmedEmail, password });
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

      // Successful verified login
      const destination = isOnboardingCompleted() ? 'dashboard' : 'onboarding';
      onNavigate?.(destination);
    } catch {
      setIsSubmitting(false);
      setErrors({ general: 'An unexpected authentication error occurred. Please try again.' });
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

      {/* Main Login Content */}
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
                Welcome Back
              </Heading>
              <Text type="body" color="secondary" align="center">
                Sign in to continue tracking your OJT training hours.
              </Text>
            </VStack>

            {errors.general && (
              <Banner
                status="error"
                title={errors.general}
              />
            )}

            <form onSubmit={handleSubmit} noValidate>
              <VStack gap={4}>
                <TextInput
                  type="email"
                  label="Email Address"
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

                <InputGroup
                  label="Password"
                  isRequired
                  status={errors.password ? { type: 'error', message: errors.password } : undefined}
                >
                  <TextInput
                    type={showPassword ? 'text' : 'password'}
                    label="Password"
                    isLabelHidden
                    placeholder="Enter your password"
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

                <Button
                  label="Log In"
                  variant="primary"
                  size="lg"
                  type="submit"
                  isLoading={isSubmitting}
                  width="100%"
                />
              </VStack>
            </form>

            <Divider variant="subtle" />

            <HStack justify="center" align="center" gap={1}>
              <Text size="sm" color="secondary">
                Don't have an account?
              </Text>
              <Button
                label="Sign Up"
                variant="ghost"
                size="sm"
                onClick={() => onNavigate?.('register')}
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
