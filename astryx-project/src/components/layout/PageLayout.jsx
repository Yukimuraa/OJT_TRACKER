import React from 'react';
import { VStack } from '@astryxdesign/core/VStack';
import { HStack } from '@astryxdesign/core/HStack';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { Section } from '@astryxdesign/core/Section';
import { StackItem } from '@astryxdesign/core/Stack';

export function PageLayout({ title, description, actions, children }) {
  return (
    <VStack gap={4}>
      <HStack gap={3} align="center">
        <StackItem size="fill">
          <VStack gap={1}>
            <Heading level={1}>{title}</Heading>
            {description && (
              <Text type="supporting" color="secondary">
                {description}
              </Text>
            )}
          </VStack>
        </StackItem>
        {actions && <StackItem size="static">{actions}</StackItem>}
      </HStack>

      <Section variant="section" padding={4}>
        {children}
      </Section>
    </VStack>
  );
}

