import React, { useState, useEffect, useCallback } from 'react';
import { PageLayout } from '../../components/layout/PageLayout';
import { VStack } from '@astryxdesign/core/VStack';
import { HStack } from '@astryxdesign/core/HStack';
import { Grid } from '@astryxdesign/core/Grid';
import { Card } from '@astryxdesign/core/Card';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { Button } from '@astryxdesign/core/Button';
import { Banner } from '@astryxdesign/core/Banner';
import { Icon } from '@astryxdesign/core/Icon';
import { Divider } from '@astryxdesign/core/Divider';
import { SummaryCard } from '../../components/dashboard/SummaryCard';
import {
  UserIcon,
  AlertCircleIcon,
  StarIcon,
  CheckCircleIcon,
  RefreshCwIcon,
} from '../../components/common/BrandIcons';
import { fetchAdminDashboard } from '../../services/adminService';

function formatShortDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function AdminDashboardPage({ onNavigate }) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await fetchAdminDashboard();
      setData(res);
    } catch (err) {
      setError(err?.message || 'Failed to load dashboard overview.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const stats = data?.stats || {};
  const recentStudents = data?.recent_students || [];
  const recentReports = data?.recent_reports || [];
  const recentFeedback = data?.recent_feedback || [];

  const avgDisplay =
    (stats.total_feedback ?? 0) > 0
      ? `${Number(stats.average_rating || 0).toFixed(2)} / 5.0`
      : 'No ratings yet';

  return (
    <PageLayout
      title="Admin Dashboard"
      description="System overview of student accounts, problem reports, and feedback ratings."
      actions={
        <Button
          label="Refresh"
          variant="secondary"
          size="sm"
          icon={<Icon icon={RefreshCwIcon} size="sm" />}
          isDisabled={isLoading}
          onClick={loadDashboard}
        />
      }
    >
      <VStack gap={4}>
        {error && (
          <Banner
            status="error"
            title={error}
            isDismissable
            onDismiss={() => setError('')}
          />
        )}

        <Grid columns={{ minWidth: 220, max: 4 }} gap={3}>
          <SummaryCard
            title="Total Student Accounts"
            value={isLoading && !data ? '—' : String(stats.total_students ?? 0)}
            description={
              isLoading && !data
                ? 'Loading accounts...'
                : `${stats.active_students ?? 0} active accounts`
            }
            icon={<Icon icon={UserIcon} color="primary" size="md" label="Student Accounts" />}
          />
          <SummaryCard
            title="Total Problem Reports"
            value={isLoading && !data ? '—' : String(stats.total_problem_reports ?? 0)}
            description="Submitted technical & account issues"
            icon={<Icon icon={AlertCircleIcon} color="warning" size="md" label="Problem Reports" />}
          />
          <SummaryCard
            title="Total Feedback"
            value={isLoading && !data ? '—' : String(stats.total_feedback ?? 0)}
            description="Student ratings & suggestions"
            icon={<Icon icon={CheckCircleIcon} color="success" size="md" label="Feedback Submissions" />}
          />
          <SummaryCard
            title="Average Feedback Rating"
            value={isLoading && !data ? '—' : avgDisplay}
            description={
              (stats.total_feedback ?? 0) > 0
                ? `Across ${stats.total_feedback} rating${stats.total_feedback === 1 ? '' : 's'}`
                : 'Awaiting first rating'
            }
            icon={<Icon icon={StarIcon} color="accent" size="md" label="Average Rating" />}
          />
        </Grid>

        {/* Recent Activity Sections */}
        <Grid columns={{ minWidth: 280, max: 3 }} gap={4}>
          {/* Recent Student Accounts */}
          <Card elevation="low" padding={4}>
            <VStack gap={3}>
              <HStack justify="between" align="center">
                <Heading level={3}>Recent Students</Heading>
                <Button
                  label="View All"
                  variant="ghost"
                  size="sm"
                  onClick={() => onNavigate?.('admin-students')}
                />
              </HStack>
              <Divider variant="subtle" />
              {isLoading && !data ? (
                <Text size="sm" color="secondary">Loading recent students...</Text>
              ) : recentStudents.length === 0 ? (
                <Text size="sm" color="secondary">No student accounts registered yet.</Text>
              ) : (
                <VStack gap={2}>
                  {recentStudents.map((s) => (
                    <div
                      key={s.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 8,
                        padding: '8px 10px',
                        borderRadius: 8,
                        backgroundColor: 'var(--color-background-muted, #f8fafc)',
                        border: '1px solid var(--color-border, #e2e8f0)',
                      }}
                    >
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary, #142b49)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {s.name}
                        </div>
                        <div style={{ fontSize: 11.5, color: 'var(--color-text-secondary, #64748b)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {s.email}
                        </div>
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 600, color: s.is_active ? '#059669' : '#dc2626', flexShrink: 0 }}>
                        {s.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  ))}
                </VStack>
              )}
            </VStack>
          </Card>

          {/* Recent Problem Reports */}
          <Card elevation="low" padding={4}>
            <VStack gap={3}>
              <HStack justify="between" align="center">
                <Heading level={3}>Recent Problem Reports</Heading>
                <Button
                  label="View All"
                  variant="ghost"
                  size="sm"
                  onClick={() => onNavigate?.('admin-problem-reports')}
                />
              </HStack>
              <Divider variant="subtle" />
              {isLoading && !data ? (
                <Text size="sm" color="secondary">Loading recent reports...</Text>
              ) : recentReports.length === 0 ? (
                <Text size="sm" color="secondary">No problem reports submitted yet.</Text>
              ) : (
                <VStack gap={2}>
                  {recentReports.map((r) => (
                    <div
                      key={r.id}
                      style={{
                        padding: '8px 10px',
                        borderRadius: 8,
                        backgroundColor: 'var(--color-background-muted, #f8fafc)',
                        border: '1px solid var(--color-border, #e2e8f0)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                        <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--color-text-primary, #142b49)' }}>
                          #{r.id} · {r.category}
                        </span>
                        <span style={{ fontSize: 11, fontWeight: 600, color: '#64748b', flexShrink: 0 }}>
                          {r.status}
                        </span>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--color-text-secondary, #64748b)', lineHeight: 1.4 }}>
                        {r.description_preview}
                      </div>
                      <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
                        {r.submitter_name} · {formatShortDate(r.created_at)}
                      </div>
                    </div>
                  ))}
                </VStack>
              )}
            </VStack>
          </Card>

          {/* Recent Feedback & Ratings */}
          <Card elevation="low" padding={4}>
            <VStack gap={3}>
              <HStack justify="between" align="center">
                <Heading level={3}>Recent Feedback</Heading>
                <Button
                  label="View All"
                  variant="ghost"
                  size="sm"
                  onClick={() => onNavigate?.('admin-feedback')}
                />
              </HStack>
              <Divider variant="subtle" />
              {isLoading && !data ? (
                <Text size="sm" color="secondary">Loading recent feedback...</Text>
              ) : recentFeedback.length === 0 ? (
                <Text size="sm" color="secondary">No feedback submissions yet.</Text>
              ) : (
                <VStack gap={2}>
                  {recentFeedback.map((fb) => (
                    <div
                      key={fb.id}
                      style={{
                        padding: '8px 10px',
                        borderRadius: 8,
                        backgroundColor: 'var(--color-background-muted, #f8fafc)',
                        border: '1px solid var(--color-border, #e2e8f0)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                        <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--color-text-primary, #142b49)' }}>
                          {fb.student_name}
                        </span>
                        <span style={{ fontSize: 11.5, fontWeight: 700, color: '#059669' }}>
                          {fb.rating} / 5
                        </span>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--color-text-secondary, #64748b)', lineHeight: 1.4 }}>
                        {fb.comment_preview}
                      </div>
                      <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
                        {formatShortDate(fb.created_at)}
                      </div>
                    </div>
                  ))}
                </VStack>
              )}
            </VStack>
          </Card>
        </Grid>
      </VStack>
    </PageLayout>
  );
}

export default AdminDashboardPage;
