import React from 'react';
import { Section } from '@astryxdesign/core/Section';
import { VStack } from '@astryxdesign/core/VStack';
import { HStack } from '@astryxdesign/core/HStack';
import { StackItem } from '@astryxdesign/core/Stack';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { Button } from '@astryxdesign/core/Button';
import { Card } from '@astryxdesign/core/Card';
import { ProgressBar } from '@astryxdesign/core/ProgressBar';
import { StatusDot } from '@astryxdesign/core/StatusDot';
import { Icon } from '@astryxdesign/core/Icon';
import { CheckCircleIcon, HourglassIcon } from '../../components/common/BrandIcons';

const DEMO_COMPLETED = 142;
const DEMO_REQUIRED = 600;
const DEMO_REMAINING = DEMO_REQUIRED - DEMO_COMPLETED;
const DEMO_RATE = Math.round((DEMO_COMPLETED / DEMO_REQUIRED) * 100);

const DEMO_RECORDS = [
  { date: 'Nov 08, 2026', activity: 'Development', hours: 8 },
  { date: 'Nov 07, 2026', activity: 'Team Meeting', hours: 2 },
  { date: 'Nov 06, 2026', activity: 'Research', hours: 6 },
];

function DashboardPreview() {
  return (
    <Card elevation="low" padding={4}>
      <VStack gap={4}>
        <HStack justify="between" align="center" wrap="wrap" gap={1}>
          <Heading level={3}>OJT Dashboard</Heading>
          <Text size="sm" type="supporting" color="secondary">
            Illustrative preview · not real data
          </Text>
        </HStack>

        {/* KPI strip */}
        <HStack gap={2} wrap="wrap">
          <StackItem size="fill">
            <Card variant="muted" padding={3}>
              <VStack gap={1}>
                <HStack gap={1} align="center">
                  <Icon icon="clock" size="sm" color="accent" />
                  <Text size="sm" weight="medium" color="secondary">Required</Text>
                </HStack>
                <Heading level={3}>{DEMO_REQUIRED} hrs</Heading>
              </VStack>
            </Card>
          </StackItem>
          <StackItem size="fill">
            <Card variant="muted" padding={3}>
              <VStack gap={1}>
                <HStack gap={1} align="center">
                  <Icon icon={CheckCircleIcon} size="sm" color="accent" />
                  <Text size="sm" weight="medium" color="secondary">Completed</Text>
                </HStack>
                <Heading level={3}>{DEMO_COMPLETED} hrs</Heading>
              </VStack>
            </Card>
          </StackItem>
          <StackItem size="fill">
            <Card variant="muted" padding={3}>
              <VStack gap={1}>
                <HStack gap={1} align="center">
                  <Icon icon={HourglassIcon} size="sm" color="accent" />
                  <Text size="sm" weight="medium" color="secondary">Remaining</Text>
                </HStack>
                <Heading level={3}>{DEMO_REMAINING} hrs</Heading>
              </VStack>
            </Card>
          </StackItem>
        </HStack>

        {/* Progress bar */}
        <VStack gap={1.5}>
          <HStack justify="between" align="center">
            <Text size="sm" weight="medium">Overall Progress</Text>
            <Text size="sm" weight="semibold" color="accent">{DEMO_RATE}%</Text>
          </HStack>
          <ProgressBar
            label="OJT completion progress"
            value={DEMO_COMPLETED}
            max={DEMO_REQUIRED}
            variant="accent"
            hasValueLabel
            formatValueLabel={(v, m) => `${v} / ${m} hrs`}
          />
        </VStack>

        {/* Recent activity */}
        <VStack gap={2}>
          <Text size="sm" weight="medium">Recent Activity</Text>
          {DEMO_RECORDS.map((r, i) => (
            <HStack key={i} justify="between" align="center">
              <HStack gap={2} align="center">
                <StatusDot variant="success" label="Approved" />
                <VStack gap={0}>
                  <Text size="sm" weight="medium">{r.activity}</Text>
                  <Text size="sm" color="secondary">{r.date}</Text>
                </VStack>
              </HStack>
              <Text size="sm" weight="semibold" hasTabularNumbers>
                {r.hours} hrs
              </Text>
            </HStack>
          ))}
        </VStack>
      </VStack>
    </Card>
  );
}

export function HeroSection({ onRegister }) {
  return (
    <Section id="home" variant="transparent" paddingBlock={10} paddingInline={6}>
      <div className="ojt-landing-container">
        <HStack gap={8} align="center" wrap="wrap">
          {/* Left Column: Heading, description, CTA buttons */}
          <StackItem size="fill">
            <VStack gap={6}>
              <VStack gap={3}>
                <Text weight="semibold" color="accent" size="sm">
                  Student OJT Management
                </Text>
                <Heading level={1}>
                  Track Your Internship Hours.{' '}
                  Stay on Track.{' '}
                  Reach Your Goals.
                </Heading>
                <Text type="body" color="secondary">
                  An easier way to organize your On-the-Job Training journey.
                  Record your daily hours, monitor your progress, and stay on
                  track toward completing your required training hours.
                </Text>
              </VStack>
              <HStack gap={3} wrap="wrap">
                <Button
                  label="Get Started"
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
          </StackItem>

          {/* Right Column: Dashboard preview */}
          <StackItem size="fill">
            <DashboardPreview />
          </StackItem>
        </HStack>
      </div>
    </Section>
  );
}
