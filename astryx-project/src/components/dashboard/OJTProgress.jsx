import React from 'react';
import { Card } from '@astryxdesign/core/Card';
import { VStack } from '@astryxdesign/core/VStack';
import { HStack } from '@astryxdesign/core/HStack';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { ProgressBar } from '@astryxdesign/core/ProgressBar';

export function OJTProgress({ completedHours, requiredHours, remainingHours, completionRate }) {
  const marks = [
    { value: Math.round(requiredHours * 0.25), label: '25%' },
    { value: Math.round(requiredHours * 0.5), label: '50%' },
    { value: Math.round(requiredHours * 0.75), label: '75%' },
    { value: requiredHours, label: `${requiredHours}h Goal` },
  ];

  return (
    <Card padding={4} elevation="low">
      <VStack gap={4}>
        <HStack justify="between" align="center" wrap="wrap" gap={2}>
          <VStack gap={0.5}>
            <Heading level={2}>
              Overall OJT Progress
            </Heading>
            <Text type="supporting" color="secondary">
              Track milestone progress toward your degree completion requirements.
            </Text>
          </VStack>

          <VStack align="end" gap={0.5}>
            <Heading level={3} color="accent">
              {completedHours} / {requiredHours} hours
            </Heading>
            <Text type="supporting" color="secondary">
              {completionRate}% completed
            </Text>
          </VStack>
        </HStack>

        <ProgressBar
          label="Overall OJT Training Progress"
          isLabelHidden={true}
          value={completedHours}
          max={requiredHours}
          variant="accent"
          marks={marks}
        />

        <HStack justify="between" align="center" wrap="wrap" gap={2}>
          <Text type="supporting">
            <Text as="span" weight="semibold">{completedHours} / {requiredHours} hours</Text> rendered
          </Text>
          <Text type="supporting">
            <Text as="span" weight="semibold" color="accent">{completionRate}%</Text> completed
          </Text>
          <Text type="supporting">
            <Text as="span" weight="semibold">{remainingHours} hours</Text> remaining
          </Text>
        </HStack>
      </VStack>
    </Card>
  );
}

