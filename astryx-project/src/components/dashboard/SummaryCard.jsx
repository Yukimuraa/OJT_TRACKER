import React from 'react';
import { Card } from '@astryxdesign/core/Card';
import { VStack } from '@astryxdesign/core/VStack';
import { HStack } from '@astryxdesign/core/HStack';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';

export function SummaryCard({ title, value, description, icon }) {
  return (
    <Card padding={4} elevation="low">
      <VStack gap={2}>
        <HStack justify="between" align="center">
          <Text type="label" color="secondary">
            {title}
          </Text>
          {icon}
        </HStack>

        <Heading level={2} weight="bold">
          {value}
        </Heading>

        <Text type="supporting" color="secondary">
          {description}
        </Text>
      </VStack>
    </Card>
  );
}

