import React from 'react';
import { Section } from '@astryxdesign/core/Section';
import { VStack } from '@astryxdesign/core/VStack';
import { HStack } from '@astryxdesign/core/HStack';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { Button } from '@astryxdesign/core/Button';

export function CTASection({ onRegister }) {
  return (
    <Section id="about" variant="muted" paddingBlock={10} paddingInline={6}>
      <div className="ojt-landing-container">
        <VStack gap={6} align="center">
          <VStack gap={3} align="center">
            <Heading level={2} align="center">
              Your OJT Journey Starts Here.
            </Heading>
            <Text type="body" color="secondary" align="center" maxWidth={560}>
              Stay organized, track your hours, and make every training day count.
              OJT Tracker is designed to take the stress out of managing your internship hours.
            </Text>
          </VStack>
          <HStack gap={3} wrap="wrap" justify="center">
            <Button
              label="Get Started Today"
              variant="primary"
              size="lg"
              onClick={onRegister}
            />
            <Button
              label="Explore Features"
              variant="secondary"
              size="lg"
              onClick={() =>
                document
                  .getElementById('features')
                  ?.scrollIntoView({ behavior: 'smooth' })
              }
            />
          </HStack>
        </VStack>
      </div>
    </Section>
  );
}
