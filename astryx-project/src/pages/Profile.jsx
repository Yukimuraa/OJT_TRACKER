import React, { useState } from 'react';
import { PageLayout } from '../components/layout/PageLayout';
import { VStack } from '@astryxdesign/core/VStack';
import { HStack } from '@astryxdesign/core/HStack';
import { Grid } from '@astryxdesign/core/Grid';
import { Card } from '@astryxdesign/core/Card';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { UserAvatar } from '../components/common/UserAvatar';
import { Button } from '@astryxdesign/core/Button';
import { StatusDot } from '@astryxdesign/core/StatusDot';
import { Divider } from '@astryxdesign/core/Divider';
import { Dialog, DialogHeader } from '@astryxdesign/core/Dialog';
import { TextInput } from '@astryxdesign/core/TextInput';
import { DateInput } from '@astryxdesign/core/DateInput';
import { TextArea } from '@astryxdesign/core/TextArea';
import { StackItem } from '@astryxdesign/core/Stack';
import {
  loadStoredProfile,
  saveStoredProfile,
} from '../services/profileService';
import { useTraining } from '../hooks/useTraining';
import { loadOnboardingData } from '../services/onboardingService';

function EditProfileDialog({ isOpen, onOpenChange, profile, onSave }) {
  const [formData, setFormData] = useState(profile);

  const handleClose = (open) => {
    if (!open) {
      setFormData(profile);
    }
    onOpenChange(open);
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setFormData((prev) => ({ ...prev, avatarUrl: event.target?.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    onSave(formData);
    onOpenChange(false);
  };

  return (
    <Dialog isOpen={isOpen} onOpenChange={handleClose} purpose="form" width={540} maxHeight="90dvh">
      <DialogHeader
        title="Edit Student Profile"
        subtitle="Update your student credentials, profile photo, and training details."
        onOpenChange={handleClose}
      />
      <VStack
        gap={4}
        padding={4}
        isScrollable
        style={{
          maxHeight: 'calc(90dvh - 120px)',
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {/* Profile Avatar Upload Section */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            padding: 12,
            backgroundColor: '#f8fafc',
            borderRadius: 12,
            border: '1px solid #e2e8f0',
          }}
        >
          <UserAvatar src={formData.avatarUrl} alt={formData.fullName} size={64} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#142b49' }}>
              Profile Avatar
            </span>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                type="file"
                id="profile-photo-file-input"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handlePhotoUpload}
              />
              <Button
                label="Choose Photo"
                variant="secondary"
                size="sm"
                onClick={() => document.getElementById('profile-photo-file-input')?.click()}
              />
              {formData.avatarUrl && (
                <Button
                  label="Remove"
                  variant="ghost"
                  size="sm"
                  onClick={() => setFormData((p) => ({ ...p, avatarUrl: '' }))}
                />
              )}
            </div>
          </div>
        </div>

        <TextInput
          label="Full Name"
          isRequired
          value={formData.fullName}
          onChange={(val) => setFormData((p) => ({ ...p, fullName: val }))}
          width="100%"
        />
        <TextInput
          label="Student ID Number"
          isRequired
          value={formData.studentId}
          onChange={(val) => setFormData((p) => ({ ...p, studentId: val }))}
          width="100%"
        />
        <TextInput
          label="Degree / Academic Program"
          isRequired
          value={formData.program}
          onChange={(val) => setFormData((p) => ({ ...p, program: val }))}
          width="100%"
        />
        <TextInput
          label="Educational Institution"
          isRequired
          value={formData.institution}
          onChange={(val) => setFormData((p) => ({ ...p, institution: val }))}
          width="100%"
        />
        <TextInput
          label="Host Training Establishment (Company)"
          isRequired
          value={formData.company}
          onChange={(val) => setFormData((p) => ({ ...p, company: val }))}
          width="100%"
        />
        <TextInput
          label="Assigned Department"
          value={formData.department}
          onChange={(val) => setFormData((p) => ({ ...p, department: val }))}
          width="100%"
        />
        <TextInput
          label="Industry Supervisor / Mentor"
          value={formData.supervisor}
          onChange={(val) => setFormData((p) => ({ ...p, supervisor: val }))}
          width="100%"
        />
        <TextInput
          label="Supervisor Contact Email"
          type="email"
          value={formData.supervisorEmail}
          onChange={(val) => setFormData((p) => ({ ...p, supervisorEmail: val }))}
          width="100%"
        />
        <DateInput
          label="Training Start Date"
          value={formData.startDate}
          onChange={(val) => setFormData((p) => ({ ...p, startDate: val || '' }))}
          width="100%"
        />
        <DateInput
          label="Target Completion Date"
          value={formData.targetEndDate}
          onChange={(val) => setFormData((p) => ({ ...p, targetEndDate: val || '' }))}
          width="100%"
        />
        <TextArea
          label="Notes / Special Instructions"
          value={formData.notes}
          onChange={(val) => setFormData((p) => ({ ...p, notes: val }))}
          rows={3}
          width="100%"
        />
        <HStack gap={2} justify="end">
          <Button
            label="Cancel"
            variant="secondary"
            onClick={() => handleClose(false)}
          />
          <Button
            label="Save Changes"
            variant="primary"
            onClick={handleSave}
          />
        </HStack>
      </VStack>
    </Dialog>
  );
}

export function Profile() {
  const [profile, setProfile] = useState(() => loadStoredProfile());
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { requiredHours } = useTraining();
  const onboarding = loadOnboardingData();

  const handleSaveProfile = (updated) => {
    setProfile(updated);
    saveStoredProfile(updated);
  };

  return (
    <PageLayout
      title="Student Profile"
      description="Manage your student intern information, academic background, and training placement details."
      actions={
        <Button
          label="Edit Profile"
          variant="primary"
          onClick={() => setIsEditDialogOpen(true)}
        />
      }
    >
      <VStack gap={6}>
        {/* Profile Header Hero Card */}
        <Card elevation="low" padding={5}>
          <HStack gap={5} align="center" wrap="wrap">
            <UserAvatar
              src={profile.avatarUrl}
              alt={profile.fullName}
              size={76}
            />
            <StackItem size="fill">
              <VStack gap={1}>
                <HStack gap={3} align="center" wrap="wrap">
                  <Heading level={2}>{profile.fullName}</Heading>
                  <HStack gap={1} align="center">
                    <StatusDot variant="success" label="Active Trainee" />
                    <Text size="sm" color="accent" weight="semibold">
                      Active Trainee
                    </Text>
                  </HStack>
                </HStack>
                <Text type="body" color="secondary">
                  {profile.program} · {profile.studentId}
                </Text>
                <Text size="sm" color="secondary">
                  {profile.institution}
                </Text>
              </VStack>
            </StackItem>
          </HStack>
        </Card>

        {/* Two-Column Details Grid */}
        <Grid columns={{ minWidth: 260, max: 2 }} gap={4}>
          {/* Card 1: Academic Information */}
          <Card elevation="low" padding={5}>
            <VStack gap={4}>
              <Heading level={3}>Academic Information</Heading>
              <Divider variant="subtle" />
              <VStack gap={3}>
                <VStack gap={0.5}>
                  <Text size="sm" color="secondary">Institution / College</Text>
                  <Text weight="medium">{profile.institution || '—'}</Text>
                </VStack>
                <VStack gap={0.5}>
                  <Text size="sm" color="secondary">Degree Program</Text>
                  <Text weight="medium">{profile.program || '—'}</Text>
                </VStack>
                <VStack gap={0.5}>
                  <Text size="sm" color="secondary">Student ID Number</Text>
                  <Text weight="medium" hasTabularNumbers>{profile.studentId || '—'}</Text>
                </VStack>
                <VStack gap={0.5}>
                  <Text size="sm" color="secondary">Required OJT Hours Target</Text>
                  <Text weight="semibold" color="accent">{requiredHours} Hours</Text>
                </VStack>
              </VStack>
            </VStack>
          </Card>

          {/* Card 2: Training Placement Details */}
          <Card elevation="low" padding={5}>
            <VStack gap={4}>
              <Heading level={3}>Training Establishment</Heading>
              <Divider variant="subtle" />
              <VStack gap={3}>
                <VStack gap={0.5}>
                  <Text size="sm" color="secondary">Host Company</Text>
                  <Text weight="medium">{profile.company || '—'}</Text>
                </VStack>
                <VStack gap={0.5}>
                  <Text size="sm" color="secondary">Assigned Department</Text>
                  <Text weight="medium">{profile.department || '—'}</Text>
                </VStack>
                <VStack gap={0.5}>
                  <Text size="sm" color="secondary">Designated Supervisor</Text>
                  <Text weight="medium">{profile.supervisor || '—'}</Text>
                </VStack>
                <VStack gap={0.5}>
                  <Text size="sm" color="secondary">Supervisor Email</Text>
                  <Text weight="medium">{profile.supervisorEmail || '—'}</Text>
                </VStack>
                <VStack gap={0.5}>
                  <Text size="sm" color="secondary">Regular Daily Schedule</Text>
                  <Text weight="medium">
                    {onboarding.morningEnabled ? `AM: ${onboarding.morningTimeIn}–${onboarding.morningTimeOut}` : 'AM: Off'}
                    {' · '}
                    {onboarding.afternoonEnabled ? `PM: ${onboarding.afternoonTimeIn}–${onboarding.afternoonTimeOut}` : 'PM: Off'}
                  </Text>
                </VStack>
                <HStack gap={4} wrap="wrap">
                  <VStack gap={0.5}>
                    <Text size="sm" color="secondary">Start Date</Text>
                    <Text weight="medium" hasTabularNumbers>{profile.startDate || '—'}</Text>
                  </VStack>
                  <VStack gap={0.5}>
                    <Text size="sm" color="secondary">Target End Date</Text>
                    <Text weight="medium" hasTabularNumbers>{profile.targetEndDate || '—'}</Text>
                  </VStack>
                </HStack>
              </VStack>
            </VStack>
          </Card>
        </Grid>

        {/* Notes Card */}
        {profile.notes && (
          <Card elevation="low" padding={4}>
            <VStack gap={1}>
              <Text size="sm" weight="semibold">Training Notes & Guidelines</Text>
              <Text size="sm" color="secondary">{profile.notes}</Text>
            </VStack>
          </Card>
        )}
      </VStack>

      <EditProfileDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        profile={profile}
        onSave={handleSaveProfile}
      />
    </PageLayout>
  );
}
