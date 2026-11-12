import React from 'react';
import { TopNav } from '@astryxdesign/core/TopNav';
import { Heading } from '@astryxdesign/core/Heading';
import { HStack } from '@astryxdesign/core/HStack';
import { IconButton } from '@astryxdesign/core/IconButton';
import { Icon } from '@astryxdesign/core/Icon';
import { Avatar } from '@astryxdesign/core/Avatar';
import { DropdownMenu } from '@astryxdesign/core/DropdownMenu';
import { BellIcon } from '../common/BrandIcons';
import { loadStoredProfile } from '../../services/profileService';
import { logoutUser, getCurrentUser } from '../../services/authService';

export function TopNavigation({ pageTitle, onNavigate }) {
  const user = getCurrentUser();
  const profile = loadStoredProfile(user?.id);
  const studentName = user?.fullName || profile?.fullName || 'Student Trainee';

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
      heading={
        <Heading level={2} weight="semibold">
          {pageTitle}
        </Heading>
      }
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
                icon={<Avatar name={studentName} size="sm" tooltip={false} />}
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
