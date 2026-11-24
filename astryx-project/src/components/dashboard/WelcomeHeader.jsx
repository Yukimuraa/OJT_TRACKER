import React from 'react';
import { HStack } from '@astryxdesign/core/HStack';
import { VStack } from '@astryxdesign/core/VStack';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { Button } from '@astryxdesign/core/Button';
import { getCurrentUser } from '../../services/authService';

export function WelcomeHeader({ onLogHours }) {
  const user = getCurrentUser();
  const firstName = user?.fullName ? user.fullName.split(' ')[0] : 'Student';

  return (
    <HStack justify="between" align="center" wrap="wrap" gap={3}>
      <VStack gap={1}>
        <Heading level={1}>
          Welcome back, {firstName}!
        </Heading>
        <Text type="supporting" color="secondary">
          Here's an overview of your On-the-Job Training progress.
        </Text>
      </VStack>

      <Button
        label="+ Log Hours"
        variant="primary"
        className="ojt-btn-black"
        onClick={onLogHours}
      />
    </HStack>
  );
}
