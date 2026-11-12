import React from 'react';
import { Card } from '@astryxdesign/core/Card';
import { VStack } from '@astryxdesign/core/VStack';
import { HStack } from '@astryxdesign/core/HStack';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { Button } from '@astryxdesign/core/Button';
import { Table, pixel, proportional } from '@astryxdesign/core/Table';
import { EmptyState } from '@astryxdesign/core/EmptyState';
import { StatusDot } from '@astryxdesign/core/StatusDot';
import { Icon } from '@astryxdesign/core/Icon';
import { GraduationCapIcon } from '../common/BrandIcons';

export function RecentActivity({ records = [], onLogHours, onViewAll }) {
  const columns = [
    {
      key: 'date',
      header: 'Date',
      width: pixel(120),
      renderCell: (row) => <Text hasTabularNumbers>{row.date}</Text>,
    },
    {
      key: 'activity',
      header: 'Activity',
      width: proportional(2),
      renderCell: (row) => <Text weight="medium">{row.activity}</Text>,
    },
    {
      key: 'sessions',
      header: 'Sessions',
      width: pixel(180),
      renderCell: (row) => {
        const am = row.morningSession?.attended
          ? `AM: ${row.morningSession.timeIn}–${row.morningSession.timeOut}`
          : null;
        const pm = row.afternoonSession?.attended
          ? `PM: ${row.afternoonSession.timeIn}–${row.afternoonSession.timeOut}`
          : null;
        if (!am && !pm) return <Text size="sm" color="secondary">—</Text>;
        return (
          <VStack gap={0.5}>
            {am && <Text size="xs" color="secondary">{am}</Text>}
            {pm && <Text size="xs" color="secondary">{pm}</Text>}
          </VStack>
        );
      },
    },
    {
      key: 'hours',
      header: 'Hours Rendered',
      width: pixel(140),
      align: 'end',
      renderCell: (row) => (
        <Text hasTabularNumbers weight="semibold">
          {row.hours} hrs
        </Text>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      width: pixel(120),
      renderCell: (row) => (
        <HStack gap={1} align="center">
          <StatusDot variant="success" label="Approved" />
          <Text size="sm">{row.status || 'Approved'}</Text>
        </HStack>
      ),
    },
  ];

  return (
    <Card padding={4} elevation="low">
      <VStack gap={4}>
        <HStack justify="between" align="center">
          <VStack gap={0.5}>
            <Heading level={2}>Recent Activity</Heading>
            <Text type="supporting" color="secondary">
              Latest recorded on-the-job training sessions.
            </Text>
          </VStack>

          {records.length > 0 && (
            <Button
              label="View All Logs"
              variant="ghost"
              size="sm"
              onClick={onViewAll}
            />
          )}
        </HStack>

        {records.length === 0 ? (
          <EmptyState
            title="No training records yet"
            description="Start recording your OJT hours to see your training activity here."
            icon={<Icon icon={GraduationCapIcon} size="lg" color="accent" />}
            actions={
              <Button
                label="Log Your First Hours"
                variant="primary"
                onClick={onLogHours}
              />
            }
          />
        ) : (
          <Table
            data={records}
            columns={columns}
            idKey="id"
            density="balanced"
            dividers="rows"
          />
        )}
      </VStack>
    </Card>
  );
}

