import React from 'react';
import { TopNav } from '@astryxdesign/core/TopNav';
import { HStack } from '@astryxdesign/core/HStack';
import { IconButton } from '@astryxdesign/core/IconButton';
import { DropdownMenu } from '@astryxdesign/core/DropdownMenu';
import { UserAvatar } from '../common/UserAvatar';
import { BrandLogo } from '../auth/AuthFormControls';
import { loadStoredProfile } from '../../services/profileService';
import { logoutUser, getCurrentUser } from '../../services/authService';

export function TopNavigation({ onNavigate }) {
  const user = getCurrentUser();
  const isAdmin = user?.role === 'admin';
  const profile = isAdmin ? null : loadStoredProfile(user?.id);
  const displayName = user?.fullName || profile?.fullName || (isAdmin ? 'Administrator' : 'Student Trainee');
  const avatarPhoto = isAdmin ? null : (user?.photoUrl || profile?.avatarUrl);

  const handleSignOut = async () => {
    await logoutUser();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('storage'));
    }
    onNavigate('landing');
  };

  const accountMenuItems = isAdmin
    ? [
        {
          label: 'Admin Settings',
          onClick: () => onNavigate('admin-settings'),
        },
        { type: 'divider' },
        {
          label: 'Sign Out',
          onClick: handleSignOut,
        },
      ]
    : [
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
        !isAdmin ? (
          <div className="ojt-dashboard-navbar-brand">
            <BrandLogo size={30} alt="Tempus Logo" />
            <span>Tempus</span>
          </div>
        ) : undefined
      }
      endContent={
        <HStack gap={2} align="center">
          <DropdownMenu
            items={accountMenuItems}
            renderTrigger={(triggerProps) => (
              <IconButton
                label={isAdmin ? 'Administrator Account Menu' : 'Student Account Menu'}
                icon={<UserAvatar src={avatarPhoto} alt={displayName} size={28} />}
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
