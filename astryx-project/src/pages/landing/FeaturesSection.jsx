import React from 'react';
import { Section } from '@astryxdesign/core/Section';
import { VStack } from '@astryxdesign/core/VStack';
import { HStack } from '@astryxdesign/core/HStack';
import { Grid } from '@astryxdesign/core/Grid';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { Card } from '@astryxdesign/core/Card';
import { Icon } from '@astryxdesign/core/Icon';

const FEATURES = [
  {
    icon: 'clock',
    title: 'Easy Time Tracking',
    description:
      'Record your daily training hours and activities in seconds. Log the date, category, and hours rendered — your progress updates automatically.',
  },
  {
    icon: 'arrowUp',
    title: 'Monitor Your Progress',
    description:
      'See completed hours and remaining hours toward your 600-hour requirement in real time. A clear progress bar keeps you on track every day.',
  },
  {
    icon: 'arrowsUpDown',
    title: 'Training Reports',
    description:
      'Review your complete recorded training history. Filter and sort your logs to understand how your time is being spent throughout your internship.',
  },
];

export function FeaturesSection() {
  return (
    <Section id="features" variant="muted" paddingBlock={10} paddingInline={6}>
      <div className="ojt-landing-container">
        <VStack gap={8}>
          {/* Header */}
          <VStack gap={2} align="center">
            <Heading level={2} align="center">
              Everything You Need to Manage Your OJT
            </Heading>
            <Text type="body" color="secondary" align="center" maxWidth={600}>
              Purpose-built tools for student interns to stay organized throughout their training.
            </Text>
          </VStack>

          {/* Feature cards */}
          <Grid columns={{ minWidth: 280, max: 3 }} gap={4}>
            {FEATURES.map(({ icon, title, description }) => (
              <Card key={title} padding={5} elevation="low">
                <VStack gap={4}>
                  <HStack
                    align="center"
                    justify="center"
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--color-accent-muted)',
                    }}
                  >
                    <Icon icon={icon} size="md" color="accent" />
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
