import React from 'react';
import { Section } from '@astryxdesign/core/Section';
import { VStack } from '@astryxdesign/core/VStack';
import { HStack } from '@astryxdesign/core/HStack';
import { Grid } from '@astryxdesign/core/Grid';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { Card } from '@astryxdesign/core/Card';
import { Icon } from '@astryxdesign/core/Icon';

const STEPS = [
  {
    number: '01',
    icon: 'wrench',
    title: 'Create Your Account',
    description:
      'Register your student account with your name, school, and training company. Setup takes less than a minute.',
  },
  {
    number: '02',
    icon: 'clock',
    title: 'Record Your Training Hours',
    description:
      'Log your daily OJT attendance, activities, and hours rendered. Every entry is automatically approved and counted.',
  },
  {
    number: '03',
    icon: 'arrowUp',
    title: 'Monitor Your Progress',
    description:
      'Track your cumulative hours in real time. Watch your progress bar grow until you complete all 600 required hours.',
  },
];

export function HowItWorksSection() {
  return (
    <Section id="how-it-works" variant="transparent" paddingBlock={10} paddingInline={6}>
      <div className="ojt-landing-container">
        <VStack gap={8}>
          {/* Header */}
          <VStack gap={2} align="center">
            <Heading level={2} align="center">
              Three Simple Steps to Stay on Track
            </Heading>
            <Text type="body" color="secondary" align="center" maxWidth={600}>
              From setup to completion — OJT Tracker keeps it simple for students.
            </Text>
          </VStack>

          {/* Steps Grid */}
          <Grid columns={{ minWidth: 280, max: 3 }} gap={4}>
            {STEPS.map(({ number, icon, title, description }) => (
              <Card key={title} padding={5} elevation="low">
                <VStack gap={4}>
                  <HStack justify="between" align="center">
                    <HStack
                      align="center"
                      justify="center"
                      style={{
                        width: 52,
                        height: 52,
                        borderRadius: 'var(--radius-full)',
                        background: 'var(--color-accent-muted)',
                      }}
                    >
                      <Icon icon={icon} size="md" color="accent" />
                    </HStack>
                    <Text
                      weight="bold"
                      color="accent"
                      size="lg"
                      hasTabularNumbers
                    >
                      {number}
                    </Text>
                  </HStack>

                  <VStack gap={1.5}>
                    <Heading level={3}>{title}</Heading>
                    <Text type="body" color="secondary">
                      {description}
                    </Text>
                  </VStack>
                </VStack>
              </Card>
            ))}
          </Grid>
        </VStack>
      </div>
    </Section>
  );
}
