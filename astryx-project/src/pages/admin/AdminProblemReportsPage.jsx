import React, { useState, useEffect, useCallback } from 'react';
import { PageLayout } from '../../components/layout/PageLayout';
import { VStack } from '@astryxdesign/core/VStack';
import { HStack } from '@astryxdesign/core/HStack';
import { Card } from '@astryxdesign/core/Card';
import { Text } from '@astryxdesign/core/Text';
import { Button } from '@astryxdesign/core/Button';
import { TextInput } from '@astryxdesign/core/TextInput';
import { Selector } from '@astryxdesign/core/Selector';
import { Banner } from '@astryxdesign/core/Banner';
import { Dialog, DialogHeader } from '@astryxdesign/core/Dialog';
import { Divider } from '@astryxdesign/core/Divider';
import { Pagination } from '@astryxdesign/core/Pagination';
import { Icon } from '@astryxdesign/core/Icon';
import { RefreshCwIcon } from '../../components/common/BrandIcons';
import { PROBLEM_CATEGORIES } from '../../services/reportService';
import {
  fetchAdminProblemReports,
  updateAdminProblemReportStatus,
} from '../../services/adminService';

const REPORT_STATUSES = ['Pending', 'Under Review', 'Resolved', 'Closed'];

const STATUS_BADGE_STYLES = {
  Pending: { bg: '#fffbeb', color: '#b45309', border: '#fde68a' },
  'Under Review': { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
  Resolved: { bg: '#ecfdf5', color: '#059669', border: '#a7f3d0' },
  Closed: { bg: '#f1f5f9', color: '#475569', border: '#cbd5e1' },
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

function ReportStatusBadge({ status }) {
  const palette = STATUS_BADGE_STYLES[status] || STATUS_BADGE_STYLES.Pending;
  return (
    <span
      style={{
        display: 'inline-block',
        fontSize: '0.75rem',
        fontWeight: 700,
        padding: '3px 9px',
        borderRadius: 9999,
        backgroundColor: palette.bg,
        color: palette.color,
        border: `1px solid ${palette.border}`,
        whiteSpace: 'nowrap',
      }}
    >
      {status || 'Pending'}
    </span>
  );
}

export function AdminProblemReportsPage() {
  const [reports, setReports] = useState([]);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, per_page: 10, total: 0 });
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);

  const [selectedReport, setSelectedReport] = useState(null);
  const [draftStatus, setDraftStatus] = useState('Pending');
  const [isSavingStatus, setIsSavingStatus] = useState(false);

  const loadReports = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetchAdminProblemReports({
        search: searchQuery,
        status: statusFilter === 'All Statuses' ? 'all' : statusFilter,
        category: categoryFilter === 'All Categories' ? 'all' : categoryFilter,
        page,
        perPage: pageSize,
      });
      setReports(res?.reports || []);
      setPagination(res?.pagination || { current_page: 1, last_page: 1, per_page: pageSize, total: 0 });
    } catch (err) {
      setFeedback({ type: 'error', message: err?.message || 'Unable to load problem reports.' });
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, statusFilter, categoryFilter, page, pageSize]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
      setPage(1);
    }, 280);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleOpenReport = (report) => {
    setSelectedReport(report);
    setDraftStatus(report.status || 'Pending');
  };

  const handleUpdateStatus = async () => {
    if (!selectedReport || isSavingStatus) return;
    setIsSavingStatus(true);
    try {
      const res = await updateAdminProblemReportStatus(selectedReport.id, draftStatus);
      setFeedback({
        type: 'success',
        message: res?.message || `Report #${selectedReport.id} updated to ${draftStatus}.`,
      });
      setSelectedReport(null);
      await loadReports();
    } catch (err) {
      setFeedback({ type: 'error', message: err?.message || 'Unable to update report status.' });
    } finally {
      setIsSavingStatus(false);
    }
  };

  return (
    <PageLayout
      title="Problem Reports"
      description="Review submitted technical and account issue reports from students and public visitors."
      actions={
        <Button
          label="Refresh"
          variant="secondary"
          size="sm"
          icon={<Icon icon={RefreshCwIcon} size="sm" />}
          isDisabled={isLoading}
          onClick={loadReports}
        />
      }
    >
      <VStack gap={4}>
        {feedback && (
          <Banner
            status={feedback.type}
            title={feedback.message}
            isDismissable
            onDismiss={() => setFeedback(null)}
          />
        )}

        <Card elevation="low" padding={4}>
          <VStack gap={4}>
            {/* Search & Filters */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-end' }}>
              <div style={{ flex: '1 1 240px' }}>
                <TextInput
                  label="Search Reports"
                  placeholder="Search by description, email, or student..."
                  value={searchInput}
                  onChange={(val) => setSearchInput(val)}
                  width="100%"
                />
              </div>

              <div style={{ flex: '0 1 190px', minWidth: 160 }}>
                <Selector
                  label="Status"
                  options={['All Statuses', ...REPORT_STATUSES]}
                  value={statusFilter}
                  onChange={(val) => {
                    setStatusFilter(val);
                    setPage(1);
                  }}
                  width="100%"
                />
              </div>

              <div style={{ flex: '0 1 230px', minWidth: 180 }}>
                <Selector
                  label="Category"
                  options={['All Categories', ...PROBLEM_CATEGORIES]}
                  value={categoryFilter}
                  onChange={(val) => {
                    setCategoryFilter(val);
                    setPage(1);
                  }}
                  width="100%"
                />
              </div>
            </div>

            {isLoading && reports.length === 0 ? (
              <div style={{ padding: '32px 12px', textAlign: 'center' }}>
                <Text color="secondary">Loading problem reports...</Text>
              </div>
            ) : reports.length === 0 ? (
              <div style={{ padding: '32px 12px', textAlign: 'center' }}>
                <Text color="secondary">No problem reports found matching your criteria.</Text>
              </div>
            ) : (
              <>
                {/* Desktop Table (>= 769px) */}
                <div
                  className="ojt-desktop-only"
                  style={{
                    width: '100%',
                    overflowX: 'auto',
                    borderRadius: 12,
                    border: '1px solid #e2e8f0',
                    backgroundColor: '#ffffff',
                  }}
                >
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 820 }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                        <th style={{ padding: '12px 14px', fontSize: '0.82rem', fontWeight: 700, color: '#142b49' }}>ID</th>
                        <th style={{ padding: '12px 14px', fontSize: '0.82rem', fontWeight: 700, color: '#142b49' }}>Category &amp; Summary</th>
                        <th style={{ padding: '12px 14px', fontSize: '0.82rem', fontWeight: 700, color: '#142b49' }}>Submitter</th>
                        <th style={{ padding: '12px 14px', fontSize: '0.82rem', fontWeight: 700, color: '#142b49' }}>Submitted</th>
                        <th style={{ padding: '12px 14px', fontSize: '0.82rem', fontWeight: 700, color: '#142b49' }}>Status</th>
                        <th style={{ padding: '12px 14px', fontSize: '0.82rem', fontWeight: 700, color: '#142b49', textAlign: 'right' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reports.map((report, idx) => (
                        <tr
                          key={report.id}
                          style={{ borderBottom: idx < reports.length - 1 ? '1px solid #f1f5f9' : 'none' }}
                        >
                          <td style={{ padding: '12px 14px', fontWeight: 700, fontSize: '0.85rem', color: '#142b49' }}>
                            #{report.id}
                          </td>
                          <td style={{ padding: '12px 14px', maxWidth: 320 }}>
                            <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#142b49' }}>{report.category}</div>
                            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 2 }}>{report.description_preview}</div>
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#142b49' }}>{report.submitter_name}</div>
                            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{report.submitter_email || '—'}</div>
                          </td>
                          <td style={{ padding: '12px 14px', fontSize: '0.82rem', color: '#475569', whiteSpace: 'nowrap' }}>
                            {formatDateTime(report.created_at)}
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            <ReportStatusBadge status={report.status} />
                          </td>
                          <td style={{ padding: '12px 14px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                            <Button
                              label="Review"
                              variant="primary"
                              className="ojt-btn-black"
                              size="sm"
                              onClick={() => handleOpenReport(report)}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards (<= 768px) */}
                <div className="ojt-mobile-only" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {reports.map((report) => (
                    <div
                      key={report.id}
                      style={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: 12,
                        padding: 14,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 10,
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontWeight: 700, fontSize: '0.875rem', color: '#142b49' }}>
                          #{report.id} · {report.category}
                        </span>
                        <ReportStatusBadge status={report.status} />
                      </div>
                      <Text size="sm" color="secondary">{report.description_preview}</Text>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                        <div>{report.submitter_name} ({report.submitter_email || 'No email'})</div>
                        <div>{formatDateTime(report.created_at)}</div>
                      </div>
                      <Button
                        label="Open & Update Status"
                        variant="primary"
                        className="ojt-btn-black"
                        size="sm"
                        onClick={() => handleOpenReport(report)}
                      />
                    </div>
                  ))}
                </div>

                {/* Pagination */}
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
                    Showing {reports.length} of {pagination.total} report{pagination.total === 1 ? '' : 's'}
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
                    label="Problem reports pagination"
                  />
                </div>
              </>
            )}
          </VStack>
        </Card>
      </VStack>

      {/* Report Detail & Status Update Modal */}
      <Dialog
        isOpen={Boolean(selectedReport)}
        onOpenChange={(open) => !open && !isSavingStatus && setSelectedReport(null)}
        purpose="info"
        width={540}
      >
        <DialogHeader
          title={selectedReport ? `Problem Report #${selectedReport.id}` : 'Problem Report'}
          subtitle={selectedReport?.category || ''}
          onOpenChange={(open) => !open && !isSavingStatus && setSelectedReport(null)}
        />
        {selectedReport && (
          <VStack gap={4} padding={4}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
              <div>
                <Text size="xs" color="secondary">Submitter Type</Text>
                <Text weight="semibold">{selectedReport.submitter_type}</Text>
              </div>
              <div>
                <Text size="xs" color="secondary">Submitter</Text>
                <Text weight="medium">
                  {selectedReport.submitter_name}
                  {selectedReport.submitter_email ? ` (${selectedReport.submitter_email})` : ''}
                </Text>
              </div>
              <div>
                <Text size="xs" color="secondary">Submitted At</Text>
                <Text weight="medium">{formatDateTime(selectedReport.created_at)}</Text>
              </div>
              <div>
                <Text size="xs" color="secondary">Current Status</Text>
                <div style={{ marginTop: 2 }}>
                  <ReportStatusBadge status={selectedReport.status} />
                </div>
              </div>
            </div>

            <div>
              <Text size="xs" color="secondary">Problem Description</Text>
              <div
                style={{
                  marginTop: 6,
                  padding: 12,
                  borderRadius: 10,
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  fontSize: '0.9rem',
                  color: '#1e293b',
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {selectedReport.description}
              </div>
            </div>

            <Divider variant="subtle" />

            <Selector
              label="Update Status"
              options={REPORT_STATUSES}
              value={draftStatus}
              onChange={(val) => setDraftStatus(val)}
              width="100%"
              isDisabled={isSavingStatus}
            />

            <HStack justify="end" gap={2}>
              <Button
                label="Close"
                variant="secondary"
                isDisabled={isSavingStatus}
                onClick={() => setSelectedReport(null)}
              />
              <Button
                label={isSavingStatus ? 'Saving...' : 'Update Status'}
                variant="primary"
                className="ojt-btn-black"
                isLoading={isSavingStatus}
                isDisabled={isSavingStatus}
                onClick={handleUpdateStatus}
              />
            </HStack>
          </VStack>
        )}
      </Dialog>
    </PageLayout>
  );
}

export default AdminProblemReportsPage;
