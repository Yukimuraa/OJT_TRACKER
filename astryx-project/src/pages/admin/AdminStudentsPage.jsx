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
import {
  fetchAdminStudents,
  fetchAdminStudentDetail,
  updateAdminStudentStatus,
} from '../../services/adminService';

const STATUS_FILTER_OPTIONS = [
  { label: 'All Accounts', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Deactivated', value: 'deactivated' },
];

function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function StatusPill({ active, positiveLabel, negativeLabel }) {
  return (
    <span
      style={{
        display: 'inline-block',
        fontSize: '0.75rem',
        fontWeight: 700,
        padding: '3px 9px',
        borderRadius: 9999,
        backgroundColor: active ? '#ecfdf5' : '#fef2f2',
        color: active ? '#059669' : '#dc2626',
        border: `1px solid ${active ? '#a7f3d0' : '#fecaca'}`,
        whiteSpace: 'nowrap',
      }}
    >
      {active ? positiveLabel : negativeLabel}
    </span>
  );
}

export function AdminStudentsPage() {
  const [students, setStudents] = useState([]);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, per_page: 10, total: 0 });
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);

  const [detailStudent, setDetailStudent] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  const [confirmTarget, setConfirmTarget] = useState(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const loadStudents = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetchAdminStudents({
        search: searchQuery,
        status: statusFilter,
        page,
        perPage: pageSize,
      });
      setStudents(res?.students || []);
      setPagination(res?.pagination || { current_page: 1, last_page: 1, per_page: pageSize, total: 0 });
    } catch (err) {
      setFeedback({ type: 'error', message: err?.message || 'Unable to load student accounts.' });
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, statusFilter, page, pageSize]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
      setPage(1);
    }, 280);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleOpenDetail = async (student) => {
    setDetailStudent(student);
    setIsDetailOpen(true);
    setIsLoadingDetail(true);
    try {
      const res = await fetchAdminStudentDetail(student.id);
      if (res?.student) {
        setDetailStudent(res.student);
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err?.message || 'Unable to load student details.' });
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleConfirmStatusToggle = async () => {
    if (!confirmTarget || isUpdatingStatus) return;
    const nextActive = !confirmTarget.is_active;
    setIsUpdatingStatus(true);
    try {
      const res = await updateAdminStudentStatus(confirmTarget.id, nextActive);
      setFeedback({
        type: 'success',
        message: res?.message || `Account ${nextActive ? 'reactivated' : 'deactivated'} successfully.`,
      });
      setConfirmTarget(null);
      await loadStudents();
    } catch (err) {
      setFeedback({ type: 'error', message: err?.message || 'Failed to update account status.' });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <PageLayout
      title="Student Accounts"
      description="Inspect registered student accounts, verification states, and manage account access."
      actions={
        <Button
          label="Refresh"
          variant="secondary"
          size="sm"
          icon={<Icon icon={RefreshCwIcon} size="sm" />}
          isDisabled={isLoading}
          onClick={loadStudents}
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
            {/* Filters */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 12,
                alignItems: 'flex-end',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ flex: '1 1 260px', maxWidth: 420 }}>
                <TextInput
                  label="Search Students"
                  placeholder="Search by student name or email..."
                  value={searchInput}
                  onChange={(val) => setSearchInput(val)}
                  width="100%"
                />
              </div>

              <div style={{ flex: '0 1 220px', minWidth: 180 }}>
                <Selector
                  label="Account Status"
                  options={STATUS_FILTER_OPTIONS.map((o) => o.label)}
                  value={STATUS_FILTER_OPTIONS.find((o) => o.value === statusFilter)?.label || 'All Accounts'}
                  onChange={(label) => {
                    const matched = STATUS_FILTER_OPTIONS.find((o) => o.label === label);
                    setStatusFilter(matched?.value || 'all');
                    setPage(1);
                  }}
                  width="100%"
                />
              </div>
            </div>

            {isLoading && students.length === 0 ? (
              <div style={{ padding: '32px 12px', textAlign: 'center' }}>
                <Text color="secondary">Loading student accounts...</Text>
              </div>
            ) : students.length === 0 ? (
              <div style={{ padding: '32px 12px', textAlign: 'center' }}>
                <Text color="secondary">No student accounts match your current search or filter.</Text>
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
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 760 }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                        <th style={{ padding: '12px 14px', fontSize: '0.82rem', fontWeight: 700, color: '#142b49' }}>Student</th>
                        <th style={{ padding: '12px 14px', fontSize: '0.82rem', fontWeight: 700, color: '#142b49' }}>Registered</th>
                        <th style={{ padding: '12px 14px', fontSize: '0.82rem', fontWeight: 700, color: '#142b49' }}>Verification</th>
                        <th style={{ padding: '12px 14px', fontSize: '0.82rem', fontWeight: 700, color: '#142b49' }}>Account Status</th>
                        <th style={{ padding: '12px 14px', fontSize: '0.82rem', fontWeight: 700, color: '#142b49', textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((student, idx) => (
                        <tr
                          key={student.id}
                          style={{ borderBottom: idx < students.length - 1 ? '1px solid #f1f5f9' : 'none' }}
                        >
                          <td style={{ padding: '12px 14px' }}>
                            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#142b49' }}>{student.name}</div>
                            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{student.email}</div>
                          </td>
                          <td style={{ padding: '12px 14px', fontSize: '0.85rem', color: '#334155', whiteSpace: 'nowrap' }}>
                            {formatDate(student.created_at)}
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            <StatusPill
                              active={student.is_verified}
                              positiveLabel="Verified"
                              negativeLabel="Unverified"
                            />
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            <StatusPill
                              active={student.is_active}
                              positiveLabel="Active"
                              negativeLabel="Deactivated"
                            />
                          </td>
                          <td style={{ padding: '12px 14px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                            <HStack gap={2} justify="end" align="center">
                              <Button
                                label="View Details"
                                variant="secondary"
                                size="sm"
                                onClick={() => handleOpenDetail(student)}
                              />
                              <Button
                                label={student.is_active ? 'Deactivate' : 'Reactivate'}
                                variant={student.is_active ? 'destructive' : 'primary'}
                                className={student.is_active ? 'ojt-btn-red' : 'ojt-btn-black'}
                                size="sm"
                                onClick={() => setConfirmTarget(student)}
                              />
                            </HStack>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards (<= 768px) */}
                <div className="ojt-mobile-only" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {students.map((student) => (
                    <div
                      key={student.id}
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
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 700, color: '#142b49', wordBreak: 'break-word' }}>{student.name}</div>
                          <div style={{ fontSize: '0.8rem', color: '#64748b', wordBreak: 'break-all' }}>{student.email}</div>
                        </div>
                        <StatusPill active={student.is_active} positiveLabel="Active" negativeLabel="Deactivated" />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: '#64748b' }}>
                        <span>Registered: {formatDate(student.created_at)}</span>
                        <StatusPill active={student.is_verified} positiveLabel="Verified" negativeLabel="Unverified" />
                      </div>
                      <HStack gap={2} wrap="wrap">
                        <Button
                          label="View Details"
                          variant="secondary"
                          size="sm"
                          onClick={() => handleOpenDetail(student)}
                        />
                        <Button
                          label={student.is_active ? 'Deactivate' : 'Reactivate'}
                          variant={student.is_active ? 'destructive' : 'primary'}
                          className={student.is_active ? 'ojt-btn-red' : 'ojt-btn-black'}
                          size="sm"
                          onClick={() => setConfirmTarget(student)}
                        />
                      </HStack>
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
                    Showing {students.length} of {pagination.total} student account{pagination.total === 1 ? '' : 's'}
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
                    label="Student accounts pagination"
                  />
                </div>
              </>
            )}
          </VStack>
        </Card>
      </VStack>

      {/* Student Detail Modal (Read-only) */}
      <Dialog isOpen={isDetailOpen} onOpenChange={setIsDetailOpen} purpose="info" width={500}>
        <DialogHeader
          title="Student Account Details"
          subtitle={detailStudent?.email || ''}
          onOpenChange={setIsDetailOpen}
        />
        <VStack gap={3} padding={4}>
          {isLoadingDetail ? (
            <Text size="sm" color="secondary">Loading full account summary...</Text>
          ) : detailStudent ? (
            <VStack gap={3}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
                <div>
                  <Text size="xs" color="secondary">Full Name</Text>
                  <Text weight="semibold">{detailStudent.name}</Text>
                </div>
                <div>
                  <Text size="xs" color="secondary">Email Address</Text>
                  <Text weight="medium" style={{ wordBreak: 'break-all' }}>{detailStudent.email}</Text>
                </div>
                <div>
                  <Text size="xs" color="secondary">Registration Date</Text>
                  <Text weight="medium">{formatDate(detailStudent.created_at)}</Text>
                </div>
                <div>
                  <Text size="xs" color="secondary">Email Verification</Text>
                  <div style={{ marginTop: 2 }}>
                    <StatusPill active={detailStudent.is_verified} positiveLabel="Verified" negativeLabel="Unverified" />
                  </div>
                </div>
                <div>
                  <Text size="xs" color="secondary">Account Status</Text>
                  <div style={{ marginTop: 2 }}>
                    <StatusPill active={detailStudent.is_active} positiveLabel="Active" negativeLabel="Deactivated" />
                  </div>
                </div>
                <div>
                  <Text size="xs" color="secondary">School / Institution</Text>
                  <Text weight="medium">{detailStudent.school_name || 'Not set'}</Text>
                </div>
                <div>
                  <Text size="xs" color="secondary">Host Company</Text>
                  <Text weight="medium">{detailStudent.company_name || 'Not set'}</Text>
                </div>
                <div>
                  <Text size="xs" color="secondary">Student ID</Text>
                  <Text weight="medium">{detailStudent.student_id_number || '—'}</Text>
                </div>
                <div>
                  <Text size="xs" color="secondary">Logged OJT Records</Text>
                  <Text weight="medium">
                    {detailStudent.training_records_count ?? 0} logs ({detailStudent.total_rendered_hours ?? 0} hrs)
                  </Text>
                </div>
                <div>
                  <Text size="xs" color="secondary">Required Target</Text>
                  <Text weight="medium">{detailStudent.required_hours ?? 600} hrs</Text>
                </div>
              </div>
              <Divider variant="subtle" />
              <HStack justify="end">
                <Button label="Close" variant="secondary" onClick={() => setIsDetailOpen(false)} />
              </HStack>
            </VStack>
          ) : null}
        </VStack>
      </Dialog>

      {/* Deactivate / Reactivate Confirmation Modal */}
      <Dialog
        isOpen={Boolean(confirmTarget)}
        onOpenChange={(open) => !open && !isUpdatingStatus && setConfirmTarget(null)}
        purpose="required"
        width={440}
      >
        <DialogHeader
          title={confirmTarget?.is_active ? 'Deactivate Student Account' : 'Reactivate Student Account'}
          subtitle={confirmTarget?.email || ''}
          onOpenChange={(open) => !open && !isUpdatingStatus && setConfirmTarget(null)}
        />
        <VStack gap={4} padding={4}>
          <Text size="sm" color="secondary">
            {confirmTarget?.is_active
              ? `Are you sure you want to deactivate ${confirmTarget?.name}'s account? They will not be able to log in or access student pages, while all training records, profiles, and reports remain safely preserved.`
              : `Reactivate ${confirmTarget?.name}'s account so they can sign in and resume using OJT Hours Tracker?`}
          </Text>
          <HStack justify="end" gap={2}>
            <Button
              label="Cancel"
              variant="secondary"
              isDisabled={isUpdatingStatus}
              onClick={() => setConfirmTarget(null)}
            />
            <Button
              label={
                isUpdatingStatus
                  ? 'Updating...'
                  : confirmTarget?.is_active
                    ? 'Confirm Deactivate'
                    : 'Confirm Reactivate'
              }
              variant={confirmTarget?.is_active ? 'destructive' : 'primary'}
              className={confirmTarget?.is_active ? 'ojt-btn-red' : 'ojt-btn-black'}
              isLoading={isUpdatingStatus}
              isDisabled={isUpdatingStatus}
              onClick={handleConfirmStatusToggle}
            />
          </HStack>
        </VStack>
      </Dialog>
    </PageLayout>
  );
}

export default AdminStudentsPage;
