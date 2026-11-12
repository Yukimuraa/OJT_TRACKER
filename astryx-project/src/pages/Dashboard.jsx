import React from 'react';
import { VStack } from '@astryxdesign/core/VStack';
import { Grid } from '@astryxdesign/core/Grid';
import { Icon } from '@astryxdesign/core/Icon';
import { useTraining } from '../hooks/useTraining';
import { WelcomeHeader } from '../components/dashboard/WelcomeHeader';
import { SummaryCard } from '../components/dashboard/SummaryCard';
import { OJTProgress } from '../components/dashboard/OJTProgress';
import { RecentActivity } from '../components/dashboard/RecentActivity';
import { CheckCircleIcon, HourglassIcon, TrendingUpIcon } from '../components/common/BrandIcons';

export function Dashboard({ onNavigate }) {
  const {
    requiredHours,
    completedHours,
    remainingHours,
    completionRate,
    recentRecords,
  } = useTraining();

  const handleLogHours = () => {
    if (onNavigate) {
      onNavigate('timelogs');
    }
  };

  return (
    <VStack gap={4}>
      <WelcomeHeader onLogHours={handleLogHours} />

      <Grid columns={{ minWidth: 220, max: 4 }} gap={3}>
        <SummaryCard
          title="Required Hours"
          value={`${requiredHours} hrs`}
          description="Total training requirement"
          icon={<Icon icon="clock" color="primary" size="md" label="Required Hours Clock" />}
        />
        <SummaryCard
          title="Completed Hours"
          value={`${completedHours} hrs`}
          description="Successfully recorded training hours"
          icon={<Icon icon={CheckCircleIcon} color="success" size="md" label="Completed Hours Check" />}
        />
        <SummaryCard
          title="Remaining Hours"
          value={`${remainingHours} hrs`}
          description="Hours left to complete"
          icon={<Icon icon={HourglassIcon} color="warning" size="md" label="Remaining Hours Hourglass" />}
        />
        <SummaryCard
          title="Completion Rate"
          value={`${completionRate}%`}
          description="Overall training progress"
          icon={<Icon icon={TrendingUpIcon} color="accent" size="md" label="Completion Rate Trend" />}
        />
      </Grid>

      <OJTProgress
        completedHours={completedHours}
        requiredHours={requiredHours}
        remainingHours={remainingHours}
        completionRate={completionRate}
      />

      <RecentActivity
        records={recentRecords}
        onLogHours={handleLogHours}
        onViewAll={handleLogHours}
      />
    </VStack>
  );
}

export default Dashboard;
