import React, { useState } from 'react';
import { PageLayout } from '../../components/layout/PageLayout';
import { VStack } from '@astryxdesign/core/VStack';
import { Grid } from '@astryxdesign/core/Grid';
import { Card } from '@astryxdesign/core/Card';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { Button } from '@astryxdesign/core/Button';
import { TextInput } from '@astryxdesign/core/TextInput';
import { Divider } from '@astryxdesign/core/Divider';
import { Banner } from '@astryxdesign/core/Banner';
import { getCurrentUser, updateCurrentUserSession } from '../../services/authService';
import { updateAdminProfile, updateAdminPassword } from '../../services/adminService';

export function AdminSettingsPage() {
  const initialUser = getCurrentUser();
  const [name, setName] = useState(initialUser?.fullName || initialUser?.name || '');
  const [email, setEmail] = useState(initialUser?.email || '');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileBanner, setProfileBanner] = useState(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordBanner, setPasswordBanner] = useState(null);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (profileSaving) return;

    if (!name.trim() || !email.trim()) {
      setProfileBanner({ type: 'error', message: 'Name and email address are required.' });
      return;
    }

    setProfileSaving(true);
    setProfileBanner(null);
    try {
      const res = await updateAdminProfile({
        name: name.trim(),
        email: email.trim().toLowerCase(),
      });
      if (res?.user) {
        updateCurrentUserSession({
          fullName: res.user.name,
          name: res.user.name,
          email: res.user.email,
        });
      }
      setProfileBanner({
        type: 'success',
        message: res?.message || 'Administrator profile updated successfully.',
      });
    } catch (err) {
      const firstErr =
        err?.errors && Object.values(err.errors)[0]?.[0]
          ? Object.values(err.errors)[0][0]
          : err?.message || 'Unable to update profile.';
      setProfileBanner({ type: 'error', message: firstErr });
    } finally {
      setProfileSaving(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (passwordSaving) return;

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordBanner({ type: 'error', message: 'All password fields are required.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordBanner({ type: 'error', message: 'New password and confirmation do not match.' });
      return;
    }

    setPasswordSaving(true);
    setPasswordBanner(null);
    try {
      const res = await updateAdminPassword({
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: confirmPassword,
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordBanner({
        type: 'success',
        message: res?.message || 'Password updated successfully.',
      });
    } catch (err) {
      const firstErr =
        err?.errors && Object.values(err.errors)[0]?.[0]
          ? Object.values(err.errors)[0][0]
          : err?.message || 'Unable to update password.';
      setPasswordBanner({ type: 'error', message: firstErr });
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <PageLayout
      title="Admin Settings"
      description="Manage your administrator display profile and account password."
    >
      <Grid columns={{ minWidth: 280, max: 2 }} gap={4}>
        {/* Profile Card */}
        <Card elevation="low" padding={5}>
          <form onSubmit={handleSaveProfile} noValidate>
            <VStack gap={4}>
              <VStack gap={1}>
                <Heading level={3}>Administrator Profile</Heading>
                <Text size="sm" color="secondary">
                  Update the name and email linked to your administrator session.
                </Text>
              </VStack>

              <Divider variant="subtle" />

              {profileBanner && (
                <Banner
                  status={profileBanner.type}
                  title={profileBanner.message}
                  isDismissable
                  onDismiss={() => setProfileBanner(null)}
                />
              )}

              <TextInput
                label="Full Name"
                isRequired
                value={name}
                onChange={(val) => setName(val)}
                width="100%"
                isDisabled={profileSaving}
              />

              <TextInput
                label="Email Address"
                type="email"
                isRequired
                value={email}
                onChange={(val) => setEmail(val)}
                width="100%"
                isDisabled={profileSaving}
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  type="submit"
                  label={profileSaving ? 'Saving...' : 'Save Profile'}
                  variant="primary"
                  className="ojt-btn-black"
                  isLoading={profileSaving}
                  isDisabled={profileSaving}
                />
              </div>
            </VStack>
          </form>
        </Card>

        {/* Password Card */}
        <Card elevation="low" padding={5}>
          <form onSubmit={handleUpdatePassword} noValidate>
            <VStack gap={4}>
              <VStack gap={1}>
                <Heading level={3}>Change Password</Heading>
                <Text size="sm" color="secondary">
                  Use at least 8 characters including letters and numbers.
                </Text>
              </VStack>

              <Divider variant="subtle" />

              {passwordBanner && (
                <Banner
                  status={passwordBanner.type}
                  title={passwordBanner.message}
                  isDismissable
                  onDismiss={() => setPasswordBanner(null)}
                />
              )}

              <TextInput
                label="Current Password"
                type="password"
                isRequired
                value={currentPassword}
                onChange={(val) => setCurrentPassword(val)}
                width="100%"
                isDisabled={passwordSaving}
                autoComplete="current-password"
              />

              <TextInput
                label="New Password"
                type="password"
                isRequired
                value={newPassword}
                onChange={(val) => setNewPassword(val)}
                width="100%"
                isDisabled={passwordSaving}
                autoComplete="new-password"
              />

              <TextInput
                label="Confirm New Password"
                type="password"
                isRequired
                value={confirmPassword}
                onChange={(val) => setConfirmPassword(val)}
                width="100%"
                isDisabled={passwordSaving}
                autoComplete="new-password"
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  type="submit"
                  label={passwordSaving ? 'Updating...' : 'Update Password'}
                  variant="primary"
                  className="ojt-btn-black"
                  isLoading={passwordSaving}
                  isDisabled={passwordSaving}
                />
              </div>
            </VStack>
          </form>
        </Card>
      </Grid>
    </PageLayout>
  );
}

export default AdminSettingsPage;
