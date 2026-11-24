import React, { useState, useEffect, useCallback } from 'react';
import { PageLayout } from '../../components/layout/PageLayout';
import { VStack } from '@astryxdesign/core/VStack';
import { HStack } from '@astryxdesign/core/HStack';
import { Grid } from '@astryxdesign/core/Grid';
import { Card } from '@astryxdesign/core/Card';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { Button } from '@astryxdesign/core/Button';
import { TextInput } from '@astryxdesign/core/TextInput';
import { Selector } from '@astryxdesign/core/Selector';
import { Banner } from '@astryxdesign/core/Banner';
import { Dialog, DialogHeader } from '@astryxdesign/core/Dialog';
import { Divider } from '@astryxdesign/core/Divider';
import { Pagination } from '@astryxdesign/core/Pagination';
import { Icon } from '@astryxdesign/core/Icon';
import { SummaryCard } from '../../components/dashboard/SummaryCard';
import {
  StarIcon,
  CheckCircleIcon,
  RefreshCwIcon,
} from '../../components/common/BrandIcons';
import {
  fetchAdminFeedback,
  moderateAdminFeedback,
} from '../../services/adminService';

const RATING_FILTER_OPTIONS = [
  { label: 'All Ratings', value: 'all' },
  { label: '5 Stars', value: '5' },
  { label: '4 Stars', value: '4' },
  { label: '3 Stars', value: '3' },
  { label: '2 Stars', value: '2' },
  { label: '1 Star', value: '1' },
];

const MODERATION_FILTER_OPTIONS = [
  { label: 'All Statuses', value: 'all' },
  { label: 'Pending', value: 'Pending' },
  { label: 'Approved', value: 'Approved' },
  { label: 'Rejected', value: 'Rejected' },
];

const MODERATION_BADGE_STYLES = {
  Pending: {
    backgroundColor: 'rgba(245, 158, 11, 0.14)',
    color: '#b45309',
  },
  Approved: {
    backgroundColor: 'rgba(16, 185, 129, 0.14)',
    color: '#059669',
  },
  Rejected: {
    backgroundColor: 'rgba(239, 68, 68, 0.14)',
    color: '#dc2626',
  },
};

function formatDateTime(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function StarRatingDisplay({ rating }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }} aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <StarIcon
          key={star}
          filled={star <= rating}
          style={{
            width: 15,
            height: 15,
            color: star <= rating ? '#f59e0b' : '#cbd5e1',
          }}
        />
      ))}
      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#142b49', marginLeft: 4 }}>
        {rating}/5
      </span>
    </div>
  );
}

function ModerationPill({ status }) {
  const palette = MODERATION_BADGE_STYLES[status] || MODERATION_BADGE_STYLES.Pending;
  return (
    <span
      style={{
        display: 'inline-block',
        fontSize: '0.75rem',
        fontWeight: 700,
        padding: '3px 10px',
        borderRadius: 9999,
        whiteSpace: 'nowrap',
        ...palette,
      }}
    >
      {status}
    </span>
  );
}

export function AdminFeedbackPage({ onNavigate }) {
  const [items, setItems] = useState([]);
  const [summary, setSummary] = useState({
    total_approved: 0,
    total_submissions: 0,
    average_rating: 0,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    status_counts: { Pending: 0, Approved: 0, Rejected: 0, Total: 0 },
  });
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, per_page: 10, total: 0 });
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [moderationFilter, setModerationFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  // Pending confirmation dialog state: { item, targetStatus: 'Approved' | 'Rejected' }
  const [confirmAction, setConfirmAction] = useState(null);
  const [isModerating, setIsModerating] = useState(false);

  const loadFeedback = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await fetchAdminFeedback({
        search: searchQuery,
        rating: ratingFilter,
        moderationStatus: moderationFilter,
        page,
        perPage: pageSize,
      });
      setItems(res?.feedback || []);
      if (res?.summary) {
        setSummary(res.summary);
      }
      setPagination(res?.pagination || { current_page: 1, last_page: 1, per_page: pageSize, total: 0 });
    } catch (err) {
      setError(err?.message || 'Unable to load feedback and ratings.');
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, ratingFilter, moderationFilter, page, pageSize]);

  useEffect(() => {
    loadFeedback();
  }, [loadFeedback]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
      setPage(1);
    }, 280);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleConfirmModeration = async () => {
    if (!confirmAction || isModerating) return;
    const { item, targetStatus } = confirmAction;
    setIsModerating(true);
    setError('');
    setNotice('');
    try {
      const res = await moderateAdminFeedback(item.id, targetStatus);
      const updated = res?.feedback;
      if (updated) {
        setItems((prev) => prev.map((entry) => (entry.id === updated.id ? updated : entry)));
      }
      if (res?.summary) {
        setSummary(res.summary);
      }
      setNotice(res?.message || `Feedback marked as ${targetStatus}.`);
      setConfirmAction(null);
      if (moderationFilter !== 'all' && moderationFilter !== targetStatus) {
        loadFeedback();
      }
    } catch (err) {
      setError(err?.message || 'Failed to update moderation status.');
    } finally {
      setIsModerating(false);
    }
  };

  const totalApproved = Number(summary.total_approved ?? 0);
  const statusCounts = summary.status_counts || {};
  const distribution = summary.distribution || {};

  return (
    <PageLayout
      title="Feedback &amp; Ratings"
      description="Review student and visitor feedback, approve public reviews, and monitor approved rating statistics."
      actions={
        <HStack gap={2} wrap="wrap">
          {onNavigate && (
            <Button
              label="View Public Page"
              variant="secondary"
              size="sm"
              onClick={() => onNavigate('feedback')}
            />
          )}
          <Button
            label="Refresh"
            variant="secondary"
            size="sm"
            icon={<Icon icon={RefreshCwIcon} size="sm" />}
            isDisabled={isLoading}
            onClick={loadFeedback}
          />
        </HStack>
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

        {notice && (
          <Banner
            status="success"
            title={notice}
            isDismissable
            onDismiss={() => setNotice('')}
          />
        )}

        {/* Top Approved-Only Summary & Rating Distribution */}
        <Grid columns={{ minWidth: 260, max: 2 }} gap={4}>
          <Grid columns={{ minWidth: 180, max: 2 }} gap={3}>
            <SummaryCard
              title="Approved Average Rating"
              value={totalApproved > 0 ? `${Number(summary.average_rating || 0).toFixed(2)} / 5.0` : 'No approved yet'}
              description="Computed from approved reviews only"
              icon={<Icon icon={StarIcon} color="accent" size="md" label="Average Rating" />}
            />
            <SummaryCard
              title="Approved Reviews"
              value={String(totalApproved)}
              description={`${statusCounts.Pending ?? 0} pending • ${statusCounts.Rejected ?? 0} rejected • ${summary.total_submissions ?? totalApproved} total`}
              icon={<Icon icon={CheckCircleIcon} color="success" size="md" label="Approved Reviews Count" />}
            />
          </Grid>

          <Card elevation="low" padding={4}>
            <VStack gap={2.5}>
              <Heading level={3}>Approved Rating Distribution</Heading>
              <Divider variant="subtle" />
              {[5, 4, 3, 2, 1].map((star) => {
                const count = Number(distribution[String(star)] ?? distribution[star] ?? 0);
                const pct = totalApproved > 0 ? Math.round((count / totalApproved) * 100) : 0;
                return (
                  <div
                    key={star}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      fontSize: '0.82rem',
                    }}
                  >
                    <span style={{ width: 52, fontWeight: 700, color: '#142b49' }}>{star} Star{star > 1 ? 's' : ''}</span>
                    <div
                      style={{
                        flex: 1,
                        height: 8,
                        borderRadius: 9999,
                        backgroundColor: '#e2e8f0',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: `${pct}%`,
                          height: '100%',
                          backgroundColor: '#10b981',
                          borderRadius: 9999,
                          transition: 'width 0.25s ease',
                        }}
                      />
                    </div>
                    <span style={{ width: 64, textAlign: 'right', color: '#475569', fontWeight: 600 }}>
                      {count} ({pct}%)
                    </span>
                  </div>
                );
              })}
            </VStack>
          </Card>
        </Grid>

        {/* Feedback Moderation Queue Card */}
        <Card elevation="low" padding={4}>
          <VStack gap={4}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-end', justifyContent: 'space-between' }}>
              <div style={{ flex: '1 1 240px', minWidth: 200 }}>
                <TextInput
                  label="Search Feedback"
                  placeholder="Search comments, student name, or email..."
                  value={searchInput}
                  onChange={(val) => setSearchInput(val)}
                  width="100%"
                />
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                <div style={{ flex: '0 1 180px', minWidth: 155 }}>
                  <Selector
                    label="Moderation Status"
                    options={MODERATION_FILTER_OPTIONS.map((o) => o.label)}
                    value={MODERATION_FILTER_OPTIONS.find((o) => o.value === moderationFilter)?.label || 'All Statuses'}
                    onChange={(label) => {
                      const matched = MODERATION_FILTER_OPTIONS.find((o) => o.label === label);
                      setModerationFilter(matched?.value || 'all');
                      setPage(1);
                    }}
                    width="100%"
                  />
                </div>

                <div style={{ flex: '0 1 170px', minWidth: 145 }}>
                  <Selector
                    label="Filter by Rating"
                    options={RATING_FILTER_OPTIONS.map((o) => o.label)}
                    value={RATING_FILTER_OPTIONS.find((o) => o.value === ratingFilter)?.label || 'All Ratings'}
                    onChange={(label) => {
                      const matched = RATING_FILTER_OPTIONS.find((o) => o.label === label);
                      setRatingFilter(matched?.value || 'all');
                      setPage(1);
                    }}
                    width="100%"
                  />
                </div>
              </div>
            </div>

            {isLoading && items.length === 0 ? (
              <div style={{ padding: '32px 12px', textAlign: 'center' }}>
                <Text color="secondary">Loading feedback submissions...</Text>
              </div>
            ) : items.length === 0 ? (
              <div style={{ padding: '32px 12px', textAlign: 'center' }}>
                <Text color="secondary">No feedback submissions match your current search or filters.</Text>
              </div>
            ) : (
              <>
                <VStack gap={3}>
                  {items.map((item) => {
                    const status = item.moderation_status || 'Pending';
                    return (
                      <div
                        key={item.id}
                        style={{
                          backgroundColor: '#ffffff',
                          border: '1px solid #e2e8f0',
                          borderRadius: 12,
                          padding: 16,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 10,
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                              <span style={{ fontWeight: 700, fontSize: '0.94rem', color: '#142b49' }}>
                                {item.student_name}
                              </span>
                              <span
                                style={{
                                  fontSize: '0.72rem',
                                  fontWeight: 600,
                                  color: '#475569',
                                  backgroundColor: '#f1f5f9',
                                  padding: '2px 8px',
                                  borderRadius: 9999,
                                }}
                              >
                                {item.submitter_type || (item.student_email ? 'Student Account' : 'Public Visitor')}
                              </span>
                              <ModerationPill status={status} />
                            </div>
                            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                              {item.student_email ? `${item.student_email} • ` : ''}
                              Public name preference:{' '}
                              <strong>
                                {item.display_name_preference === 'first_name'
                                  ? `First name (${item.public_display_name || 'First Name'})`
                                  : 'Anonymous'}
                              </strong>
                            </div>
                          </div>

                          <StarRatingDisplay rating={item.rating} />
                        </div>

                        <p style={{ margin: 0, fontSize: '0.92rem', color: '#334155', lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>
                          {item.comment}
                        </p>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, paddingTop: 4 }}>
                          <Text size="xs" color="secondary">
                            Submitted {formatDateTime(item.created_at)}
                            {item.moderated_at ? ` • Moderated ${formatDateTime(item.moderated_at)}` : ''}
                          </Text>

                          <HStack gap={2} wrap="wrap">
                            {status !== 'Approved' && (
                              <Button
                                label="Approve"
                                variant="primary"
                                className="ojt-btn-black"
                                size="sm"
                                onClick={() => setConfirmAction({ item, targetStatus: 'Approved' })}
                              />
                            )}
                            {status !== 'Rejected' && (
                              <Button
                                label="Reject"
                                variant="destructive"
                                className="ojt-btn-red"
                                size="sm"
                                onClick={() => setConfirmAction({ item, targetStatus: 'Rejected' })}
                              />
                            )}
                          </HStack>
                        </div>
                      </div>
                    );
                  })}
                </VStack>

                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 12,
                    paddingTop: 10,
                    borderTop: '1px solid #e2e8f0',
                  }}
                >
                  <Text size="sm" color="secondary">
                    Showing {items.length} of {pagination.total} submission{pagination.total === 1 ? '' : 's'}
                  </Text>
                  <Pagination
                    page={pagination.current_page}
                    onChange={(nextPage) => setPage(nextPage)}
                    totalItems={pagination.total}
                    pageSize={pageSize}
                    pageSizeOptions={[5, 10, 20, 50]}
                    onPageSizeChange={(nextSize) => {
                      setPageSize(nextSize);
                      setPage(1);
                    }}
                    variant="pages"
                    size="sm"
                    label="Feedback submissions pagination"
                  />
                </div>
              </>
            )}
          </VStack>
        </Card>
      </VStack>

      {/* Moderation Confirmation Dialog */}
      <Dialog
        isOpen={Boolean(confirmAction)}
        onOpenChange={(open) => {
          if (!open && !isModerating) setConfirmAction(null);
        }}
        purpose="required"
        width={460}
      >
        <DialogHeader
          title={
            confirmAction?.targetStatus === 'Approved'
              ? 'Approve feedback for public display?'
              : 'Reject this feedback submission?'
          }
          subtitle={
            confirmAction?.targetStatus === 'Approved'
              ? `This ${confirmAction?.item?.rating}-star review will be published to the public Feedback & Ratings carousel as "${confirmAction?.item?.public_display_name || 'Anonymous'}" and included in overall rating statistics.`
              : 'This submission will be marked Rejected and excluded from the public carousel and approved rating statistics.'
          }
          onOpenChange={(open) => {
            if (!open && !isModerating) setConfirmAction(null);
          }}
        />
        {confirmAction?.item && (
          <div style={{ padding: '0 24px 12px 24px' }}>
            <div
              style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 10,
                padding: '10px 12px',
                fontSize: '0.85rem',
                color: '#334155',
                maxHeight: 120,
                overflowY: 'auto',
                whiteSpace: 'pre-wrap',
              }}
            >
              “{confirmAction.item.comment}”
            </div>
          </div>
        )}
        <div style={{ padding: '8px 24px 20px 24px', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <Button
            label="Cancel"
            variant="secondary"
            isDisabled={isModerating}
            onClick={() => setConfirmAction(null)}
          />
          <Button
            label={
              isModerating
                ? 'Updating...'
                : confirmAction?.targetStatus === 'Approved'
                  ? 'Confirm Approve'
                  : 'Confirm Reject'
            }
            variant={confirmAction?.targetStatus === 'Rejected' ? 'destructive' : 'primary'}
            className={confirmAction?.targetStatus === 'Rejected' ? 'ojt-btn-red' : 'ojt-btn-black'}
            isLoading={isModerating}
            isDisabled={isModerating}
            onClick={handleConfirmModeration}
          />
        </div>
      </Dialog>
    </PageLayout>
  );
}

export default AdminFeedbackPage;
