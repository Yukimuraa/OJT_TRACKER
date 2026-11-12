import React, { useMemo } from 'react';
import { PageLayout } from '../components/layout/PageLayout';
import { VStack } from '@astryxdesign/core/VStack';
import { HStack } from '@astryxdesign/core/HStack';
import { Grid } from '@astryxdesign/core/Grid';
import { Card } from '@astryxdesign/core/Card';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { Button } from '@astryxdesign/core/Button';
import { ProgressBar } from '@astryxdesign/core/ProgressBar';
import { Table, pixel, proportional } from '@astryxdesign/core/Table';
import { EmptyState } from '@astryxdesign/core/EmptyState';
import { StatusDot } from '@astryxdesign/core/StatusDot';
import { Icon } from '@astryxdesign/core/Icon';
import { Divider } from '@astryxdesign/core/Divider';
import { useTraining } from '../hooks/useTraining';
import {
  calculateHoursByCategory,
  calculateTrainingAnalytics,
  calculateMilestones,
} from '../services/trainingService';
import {
  ChartBarIcon,
  CheckCircleIcon,
  HourglassIcon,
  TrendingUpIcon,
} from '../components/common/BrandIcons';

export function Reports({ onNavigate }) {
  const { records, requiredHours } = useTraining();

  const analytics = useMemo(
    () => calculateTrainingAnalytics(records, requiredHours),
    [records, requiredHours]
  );

  const categoryBreakdown = useMemo(
    () => calculateHoursByCategory(records),
    [records]
  );

  const milestones = useMemo(
    () => calculateMilestones(analytics.completed, requiredHours),
    [analytics.completed, requiredHours]
  );

  const categoryColumns = [
    {
      key: 'category',
      header: 'Category / Activity',
      width: proportional(2),
      renderCell: (row) => <Text weight="medium">{row.category}</Text>,
    },
    {
      key: 'hours',
      header: 'Rendered Hours',
      width: pixel(140),
      align: 'end',
      renderCell: (row) => (
        <Text hasTabularNumbers weight="semibold">
          {row.hours} hrs
        </Text>
      ),
    },
    {
      key: 'percentage',
      header: '% of Total',
      width: pixel(140),
      align: 'end',
      renderCell: (row) => (
        <HStack gap={2} align="center" justify="end">
          <Text hasTabularNumbers weight="medium" color="accent">
            {row.percentage}%
          </Text>
        </HStack>
      ),
    },
  ];

  const handlePrint = () => {
    window.print();
  };

  return (
    <PageLayout
      title="Reports & Analytics"
      description={`Detailed progress metrics, activity distribution, and completion pace for your ${requiredHours}-hour requirement.`}
      actions={
        records.length > 0 && (
          <Button
            label="Print / Export Report"
            variant="secondary"
            icon={<Icon icon="externalLink" size="sm" />}
            onClick={handlePrint}
          />
        )
      }
    >
      {records.length === 0 ? (
        <Card padding={5} elevation="low">
          <EmptyState
            title="No training data to analyze"
            description="Once you start recording daily hours in the Time Logs, your metrics, pace estimates, and category summaries will appear here."
            icon={<Icon icon={ChartBarIcon} size="lg" color="accent" />}
            actions={
              <Button
                label="Go to Time Logs"
                variant="primary"
                onClick={() => onNavigate?.('timelogs')}
              />
            }
          />
        </Card>
      ) : (
        <VStack gap={6}>
          {/* Top Analytics Cards */}
          <Grid columns={{ minWidth: 200, max: 4 }} gap={3}>
            <Card elevation="low" padding={4}>
              <VStack gap={2}>
                <HStack justify="between" align="center">
                  <Text size="sm" color="secondary" weight="medium">
                    Total Completed
                  </Text>
                  <Icon icon={CheckCircleIcon} size="sm" color="accent" />
                </HStack>
                <Heading level={2}>{analytics.completed} hrs</Heading>
                <Text size="sm" type="supporting" color="secondary">
                  Target: {requiredHours} hrs ({analytics.rate}%)
                </Text>
              </VStack>
            </Card>

            <Card elevation="low" padding={4}>
              <VStack gap={2}>
                <HStack justify="between" align="center">
                  <Text size="sm" color="secondary" weight="medium">
                    Days Rendered
                  </Text>
                  <Icon icon="calendar" size="sm" color="accent" />
                </HStack>
                <Heading level={2}>{analytics.daysRendered} days</Heading>
                <Text size="sm" type="supporting" color="secondary">
                  Distinct training sessions
                </Text>
              </VStack>
            </Card>

            <Card elevation="low" padding={4}>
              <VStack gap={2}>
                <HStack justify="between" align="center">
                  <Text size="sm" color="secondary" weight="medium">
                    Average Pace
                  </Text>
                  <Icon icon={TrendingUpIcon} size="sm" color="accent" />
                </HStack>
                <Heading level={2}>{analytics.avgHoursPerDay} hrs</Heading>
                <Text size="sm" type="supporting" color="secondary">
                  Per logged training day
                </Text>
              </VStack>
            </Card>

            <Card elevation="low" padding={4}>
              <VStack gap={2}>
                <HStack justify="between" align="center">
                  <Text size="sm" color="secondary" weight="medium">
                    Estimated Pace
                  </Text>
                  <Icon icon={HourglassIcon} size="sm" color="accent" />
                </HStack>
                <Heading level={2}>
                  {analytics.estimatedDaysLeft != null
                    ? `${analytics.estimatedDaysLeft} days`
                    : '—'}
                </Heading>
                <Text size="sm" type="supporting" color="secondary">
                  {analytics.remaining > 0
                    ? `${analytics.remaining} hrs remaining`
                    : 'Target completed!'}
                </Text>
              </VStack>
            </Card>
          </Grid>

          {/* Milestone Tracking Card */}
          <Card elevation="low" padding={5}>
            <VStack gap={4}>
              <VStack gap={0.5}>
                <Heading level={2}>Requirement Milestones</Heading>
                <Text type="supporting" color="secondary">
                  Track your journey toward completing your {requiredHours} required training hours.
                </Text>
              </VStack>

              <ProgressBar
                label="OJT overall requirement progress"
                value={analytics.completed}
                max={requiredHours}
                variant="accent"
                hasValueLabel
                formatValueLabel={(val, max) =>
                  `${val} / ${max} hrs (${analytics.rate}%)`
                }
              />

              <Divider variant="subtle" />

              <Grid columns={{ minWidth: 200, max: 4 }} gap={3}>
                {milestones.map((m) => (
                  <Card
                    key={m.label}
                    variant={m.isCompleted ? 'default' : 'muted'}
                    padding={3}
                  >
                    <VStack gap={1.5}>
                      <HStack justify="between" align="center">
                        <Text size="sm" weight="semibold">
                          {m.targetPercent}% Goal
                        </Text>
                        <StatusDot
                          variant={m.isCompleted ? 'success' : 'neutral'}
                          label={m.isCompleted ? 'Completed' : 'Pending'}
                        />
                      </HStack>
                      <Text size="sm" color="secondary">
                        {m.label}
                      </Text>
                      <Text size="sm" weight="medium" color={m.isCompleted ? 'accent' : 'secondary'}>
                        {m.isCompleted ? 'Achieved' : `${m.targetHours} hrs required`}
                      </Text>
                    </VStack>
                  </Card>
                ))}
              </Grid>
            </VStack>
          </Card>

          {/* Hours by Activity Category Table */}
          <Card elevation="low" padding={5}>
            <VStack gap={4}>
              <VStack gap={0.5}>
                <Heading level={2}>Hours by Activity Category</Heading>
                <Text type="supporting" color="secondary">
                  Distribution of your logged time across different task types.
                </Text>
              </VStack>

              <Table
                data={categoryBreakdown}
                columns={categoryColumns}
                idKey="category"
                density="balanced"
                dividers="rows"
              />
            </VStack>
          </Card>
        </VStack>
      )}
    </PageLayout>
  );
}
