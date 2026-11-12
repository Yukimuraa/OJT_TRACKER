import React, { useState } from 'react';
import { VStack } from '@astryxdesign/core/VStack';
import { HStack } from '@astryxdesign/core/HStack';
import { Card } from '@astryxdesign/core/Card';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { TextInput } from '@astryxdesign/core/TextInput';
import { InputGroup } from '@astryxdesign/core/InputGroup';
import { CheckboxInput } from '@astryxdesign/core/CheckboxInput';
import { Button } from '@astryxdesign/core/Button';
import { Icon } from '@astryxdesign/core/Icon';
import { StatusDot } from '@astryxdesign/core/StatusDot';
import { Divider } from '@astryxdesign/core/Divider';
import { Banner } from '@astryxdesign/core/Banner';
import { GraduationCapIcon } from '../../components/common/BrandIcons';
import { registerUser } from '../../services/authService';

const CURRENT_YEAR = new Date().getFullYear();

export function RegisterPage({ onNavigate }) {
  const [form, setForm] = useState({
    fullName: '',
    studentId: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Password requirements checks
  const hasMinLength = form.password.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(form.password);
  const hasNumber = /[0-9]/.test(form.password);
  const isPasswordStrong = hasMinLength && hasLetter && hasNumber;

  const validate = () => {
    const nextErrors = {};

    if (!form.fullName.trim()) {
      nextErrors.fullName = 'Full name is required.';
    }

    if (!form.studentId.trim()) {
      nextErrors.studentId = 'Student ID number is required.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email.trim()) {
      nextErrors.email = 'Email address is required.';
    } else if (!emailRegex.test(form.email)) {
      nextErrors.email = 'Please enter a valid email address.';
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

    if (!form.agreeToTerms) {
      nextErrors.agreeToTerms = 'You must accept the Terms and Conditions to proceed.';
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
      const result = await registerUser({
        fullName: form.fullName,
        studentId: form.studentId,
        email: form.email,
        password: form.password,
      });

      setIsSubmitting(false);

      if (!result.success) {
        setErrors({ form: result.error });
        return;
      }

      setIsSuccess(true);
    } catch {
      setIsSubmitting(false);
      setErrors({ form: 'An unexpected error occurred during registration. Please try again.' });
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

      {/* Main Registration Content */}
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
          style={{ width: '100%', maxWidth: 540 }}
        >
          <VStack gap={6}>
            {/* Header Titles */}
            <VStack gap={2} align="center">
              <Heading level={1} align="center">
                Create Your Account
              </Heading>
              <Text type="body" color="secondary" align="center">
                Join OJT Tracker and start organizing your internship journey.
              </Text>
            </VStack>

            {/* Success Feedback Banner */}
            {isSuccess ? (
              <VStack gap={4}>
                <Banner
                  status="success"
                  title="Account Created Successfully"
                  description="Your student account has been registered. You can now log in with your email address and password."
                />
                <Button
                  label="Proceed to Login"
                  variant="primary"
                  onClick={() => onNavigate?.('login')}
                  width="100%"
                />
              </VStack>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <VStack gap={4}>
                  {errors.form && (
                    <Banner
                      status="error"
                      title={errors.form}
                    />
                  )}
                  {/* Full Name */}
                  <TextInput
                    label="Full Name"
                    isRequired
                    placeholder="e.g. Alex Morgan"
                    value={form.fullName}
                    onChange={(val) => {
                      setForm((p) => ({ ...p, fullName: val }));
                      if (errors.fullName) setErrors((p) => ({ ...p, fullName: undefined }));
                    }}
                    status={errors.fullName ? { type: 'error', message: errors.fullName } : undefined}
                    width="100%"
                  />

                  {/* Student ID */}
                  <TextInput
                    label="Student ID Number"
                    isRequired
                    placeholder="e.g. 2026-OJT-001"
                    value={form.studentId}
                    onChange={(val) => {
                      setForm((p) => ({ ...p, studentId: val }));
                      if (errors.studentId) setErrors((p) => ({ ...p, studentId: undefined }));
                    }}
                    status={errors.studentId ? { type: 'error', message: errors.studentId } : undefined}
                    width="100%"
                  />

                  {/* Email Address */}
                  <TextInput
                    type="email"
                    label="Email Address"
                    isRequired
                    placeholder="name@school.edu.ph"
                    value={form.email}
                    onChange={(val) => {
                      setForm((p) => ({ ...p, email: val }));
                      if (errors.email) setErrors((p) => ({ ...p, email: undefined }));
                    }}
                    status={errors.email ? { type: 'error', message: errors.email } : undefined}
                    width="100%"
                  />

                  {/* Password with Visibility Toggle */}
                  <InputGroup
                    label="Password"
                    isRequired
                    status={errors.password ? { type: 'error', message: errors.password } : undefined}
                  >
                    <TextInput
                      type={showPassword ? 'text' : 'password'}
                      label="Password"
                      isLabelHidden
                      placeholder="At least 8 characters"
                      value={form.password}
                      onChange={(val) => {
                        setForm((p) => ({ ...p, password: val }));
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

                  {/* Password Strength / Requirements Indicator */}
                  {form.password.length > 0 && (
                    <Card variant="muted" padding={3}>
                      <VStack gap={1.5}>
                        <Text size="sm" weight="semibold">
                          Password Requirements:
                        </Text>
                        <HStack gap={2} align="center">
                          <StatusDot
                            variant={hasMinLength ? 'success' : 'neutral'}
                            label={hasMinLength ? 'Met' : 'Pending'}
                          />
                          <Text size="sm" color={hasMinLength ? 'accent' : 'secondary'}>
                            At least 8 characters
                          </Text>
                        </HStack>
                        <HStack gap={2} align="center">
                          <StatusDot
                            variant={hasLetter ? 'success' : 'neutral'}
                            label={hasLetter ? 'Met' : 'Pending'}
                          />
                          <Text size="sm" color={hasLetter ? 'accent' : 'secondary'}>
                            Contains at least one letter
                          </Text>
                        </HStack>
                        <HStack gap={2} align="center">
                          <StatusDot
                            variant={hasNumber ? 'success' : 'neutral'}
                            label={hasNumber ? 'Met' : 'Pending'}
                          />
                          <Text size="sm" color={hasNumber ? 'accent' : 'secondary'}>
                            Contains at least one number
                          </Text>
                        </HStack>
                      </VStack>
                    </Card>
                  )}

                  {/* Confirm Password with Visibility Toggle */}
                  <InputGroup
                    label="Confirm Password"
                    isRequired
                    status={errors.confirmPassword ? { type: 'error', message: errors.confirmPassword } : undefined}
                  >
                    <TextInput
                      type={showConfirmPassword ? 'text' : 'password'}
                      label="Confirm Password"
                      isLabelHidden
                      placeholder="Re-enter your password"
                      value={form.confirmPassword}
                      onChange={(val) => {
                        setForm((p) => ({ ...p, confirmPassword: val }));
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

                  {/* Terms and Conditions Checkbox */}
                  <CheckboxInput
                    label="I agree to the OJT Tracker Terms and Conditions"
                    description="I acknowledge that my training attendance and logs are subject to institutional guidelines."
                    value={form.agreeToTerms}
                    onChange={(checked) => {
                      setForm((p) => ({ ...p, agreeToTerms: checked }));
                      if (errors.agreeToTerms) setErrors((p) => ({ ...p, agreeToTerms: undefined }));
                    }}
                    status={errors.agreeToTerms ? { type: 'error', message: errors.agreeToTerms } : undefined}
                  />

                  {/* Create Account Button */}
                  <Button
                    label="Create Account"
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

            {/* Link to Login */}
            <HStack justify="center" align="center" gap={1}>
              <Text size="sm" color="secondary">
                Already have an account?
              </Text>
              <Button
                label="Log In"
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
