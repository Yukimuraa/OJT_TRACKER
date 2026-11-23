import React from 'react';
import { TopNav } from '@astryxdesign/core/TopNav';
import { HStack } from '@astryxdesign/core/HStack';
import { IconButton } from '@astryxdesign/core/IconButton';
import { Icon } from '@astryxdesign/core/Icon';
import { DropdownMenu } from '@astryxdesign/core/DropdownMenu';
import { BellIcon } from '../common/BrandIcons';
import { UserAvatar } from '../common/UserAvatar';
import { loadStoredProfile } from '../../services/profileService';
import { logoutUser, getCurrentUser } from '../../services/authService';

export function TopNavigation({ onNavigate }) {
  const user = getCurrentUser();
  const profile = loadStoredProfile(user?.id);
  const studentName = user?.fullName || profile?.fullName || 'Student Trainee';
  const avatarPhoto = user?.photoUrl || profile?.avatarUrl;

  const handleSignOut = () => {
    logoutUser();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('storage'));
    }
    onNavigate('landing');
  };

  const accountMenuItems = [
    {
      label: 'Student Profile',
      onClick: () => onNavigate('profile'),
    },
    {
      label: 'Settings',
      onClick: () => onNavigate('settings'),
    },
    { type: 'divider' },
    {
      label: 'Sign Out',
      onClick: handleSignOut,
    },
  ];

  return (
    <TopNav
      label="Top Application Navigation"
      endContent={
        <HStack gap={2} align="center">
          <IconButton
            label="Notifications"
            icon={<Icon icon={BellIcon} label="Notifications" />}
            variant="ghost"
            tooltip="Notifications (0 unread)"
          />
          <DropdownMenu
            items={accountMenuItems}
            renderTrigger={(triggerProps) => (
              <IconButton
                label="Student Account Menu"
                icon={<UserAvatar src={avatarPhoto} alt={studentName} size={28} />}
                variant="ghost"
                tooltip="Account Menu"
                {...triggerProps}
              />
            )}
          />
        </HStack>
      }
    />
  );
}
