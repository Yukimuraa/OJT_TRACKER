/**
 * DttrTemplateSelectorModal
 *
 * Step 1 of the DTTR flow — "Choose Your DTTR Template"
 * Shows:
 *   • Official System Template card (always present, cannot be deleted)
 *   • One card per user-uploaded template
 *   • "Upload Your Own Template" card
 *
 * Props:
 *   isOpen         – boolean
 *   onOpenChange   – (bool) => void
 *   currentUser    – object | null
 *   onSelectSystem – () => void   (user picked the official CHMSU template)
 *   onSelectCustom – (tmpl) => void (user picked an uploaded template)
 *   onUploadNew    – () => void   (user wants to upload a new template)
 */
import React, { useState, useCallback } from 'react';
import { Dialog, DialogHeader } from '@astryxdesign/core/Dialog';
import { VStack } from '@astryxdesign/core/VStack';
import { HStack } from '@astryxdesign/core/HStack';
import { Text } from '@astryxdesign/core/Text';
import { Button } from '@astryxdesign/core/Button';
import { Banner } from '@astryxdesign/core/Banner';
import {
  loadUserTemplates,
  deleteUserTemplate,
  updateUserTemplate,
  COMPUTER_STUDIES_TEMPLATE,
  SYSTEM_TEMPLATE,
} from '../../services/dttrTemplateService';
import { PrinterIcon } from '../common/BrandIcons';

/* ── Small SVG icons ─────────────────────────────────────────────────────── */
function UploadIcon({ size = 20, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 16 12 12 8 16" />
      <line x1="12" y1="12" x2="12" y2="21" />
      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
    </svg>
  );
}

function DocumentIcon({ size = 32, color = '#10b981' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

function PencilIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function TrashIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

/* ── Shared card shell ───────────────────────────────────────────────────── */
function TemplateCard({ children, selected = false, onClick, style = {} }) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick?.(); }}
      style={{
        border: selected ? '2px solid #10b981' : '1.5px solid #e2e8f0',
        borderRadius: 14,
        backgroundColor: selected ? 'rgba(16,185,129,0.04)' : '#ffffff',
        padding: '20px 20px 16px 20px',
        cursor: 'pointer',
        transition: 'border-color 0.15s, box-shadow 0.15s',
        boxShadow: selected ? '0 0 0 3px rgba(16,185,129,0.15)' : '0 1px 4px rgba(20,43,73,0.05)',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        outline: 'none',
        userSelect: 'none',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ── Inline rename input ─────────────────────────────────────────────────── */
function RenameInline({ value, onSave, onCancel }) {
  const [draft, setDraft] = useState(value);
  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }} onClick={(e) => e.stopPropagation()}>
      <input
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') onSave(draft); if (e.key === 'Escape') onCancel(); }}
        style={{
          flex: 1,
          fontSize: 14,
          fontWeight: 600,
          border: '1.5px solid #10b981',
          borderRadius: 8,
          padding: '4px 10px',
          outline: 'none',
          color: '#142b49',
          backgroundColor: '#fff',
        }}
      />
      <button
        type="button"
        onClick={() => onSave(draft)}
        style={{ fontSize: 12, fontWeight: 700, color: '#10b981', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px' }}
      >
        Save
      </button>
      <button
        type="button"
        onClick={onCancel}
        style={{ fontSize: 12, color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 6px' }}
      >
        Cancel
      </button>
    </div>
  );
}

/* ── Main content ────────────────────────────────────────────────────────── */
function TemplateSelectorContent({ onOpenChange, currentUser, onSelectSystem, onSelectCustom, onUploadNew }) {
  const userId = currentUser?.id || null;

  const [templates, setTemplates] = useState(() => loadUserTemplates(userId));
  const [selectedId, setSelectedId] = useState('system_chmsu_ccs');
  const [renamingId, setRenamingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const refresh = useCallback(() => setTemplates(loadUserTemplates(userId)), [userId]);

  const handleRename = (id, newName) => {
    if (!newName.trim()) return;
    updateUserTemplate(id, { name: newName.trim() }, userId);
    refresh();
    setRenamingId(null);
  };

  const handleDelete = (id) => {
    deleteUserTemplate(id, userId);
    refresh();
    setDeletingId(null);
    if (selectedId === id) setSelectedId('system_chmsu_ccs');
    setFeedback({ type: 'success', message: 'Template deleted.' });
    setTimeout(() => setFeedback(null), 2500);
  };

  const handleProceed = () => {
    if (selectedId === COMPUTER_STUDIES_TEMPLATE.id || selectedId === 'system_chmsu_ccs') {
      onSelectSystem('system_chmsu_ccs');
    } else if (selectedId === SYSTEM_TEMPLATE.id || selectedId === 'system_default') {
      onSelectSystem('system_default');
    } else {
      const tmpl = templates.find((t) => t.id === selectedId);
      if (tmpl) onSelectCustom(tmpl);
    }
  };

  return (
    <>
      <div className="no-print">
        <DialogHeader
          title="Choose Your DTTR Template"
          subtitle="Select a template to generate your Daily Time & Tasks Record."
          onOpenChange={onOpenChange}
        />
      </div>

      <VStack
        gap={4}
        padding={4}
        isScrollable
        style={{ maxHeight: 'calc(90dvh - 160px)', overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}
      >
        {feedback && (
          <Banner status={feedback.type} title={feedback.message} isDismissable onDismiss={() => setFeedback(null)} />
        )}

        {/* ── Grid of template cards ── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 16,
          }}
        >
          {/* 1. Computer Studies – Main Campus, Talisay Template */}
          <TemplateCard
            selected={selectedId === COMPUTER_STUDIES_TEMPLATE.id}
            onClick={() => setSelectedId(COMPUTER_STUDIES_TEMPLATE.id)}
          >
            {/* Thumbnail — CHMSU header preview */}
            <div
              style={{
                width: '100%',
                height: 120,
                borderRadius: 8,
                overflow: 'hidden',
                border: '1px solid #e2e8f0',
                backgroundColor: '#f8fafc',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'stretch',
              }}
            >
              <img
                src="/assets/chmsu-header.png"
                alt="CHMSU Header preview"
                style={{ width: '100%', objectFit: 'cover', objectPosition: 'top', maxHeight: 80 }}
                draggable={false}
              />
              <div style={{ flex: 1, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <DocumentIcon size={24} color="#94a3b8" />
              </div>
            </div>

            {/* Title */}
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#142b49', lineHeight: 1.3 }}>
                {COMPUTER_STUDIES_TEMPLATE.name}
              </div>
            </div>

            {selectedId === COMPUTER_STUDIES_TEMPLATE.id && (
              <div style={{ fontSize: 12, fontWeight: 600, color: '#10b981', textAlign: 'right' }}>✓ Selected</div>
            )}
          </TemplateCard>

          {/* 2. System Template */}
          <TemplateCard
            selected={selectedId === SYSTEM_TEMPLATE.id}
            onClick={() => setSelectedId(SYSTEM_TEMPLATE.id)}
          >
            {/* Thumbnail — System Template */}
            <div
              style={{
                width: '100%',
                height: 120,
                borderRadius: 8,
                overflow: 'hidden',
                border: '1px solid #e2e8f0',
                backgroundColor: '#f8fafc',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  backgroundColor: 'rgba(16,185,129,0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#10b981',
                }}
              >
                <DocumentIcon size={26} color="#10b981" />
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                Standard Form
              </span>
            </div>

            {/* Title */}
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#142b49', lineHeight: 1.3 }}>
                {SYSTEM_TEMPLATE.name}
              </div>
            </div>

            {selectedId === SYSTEM_TEMPLATE.id && (
              <div style={{ fontSize: 12, fontWeight: 600, color: '#10b981', textAlign: 'right' }}>✓ Selected</div>
            )}
          </TemplateCard>

          {/* 3. Upload Your Own Template */}
          <TemplateCard
            onClick={onUploadNew}
            style={{
              border: '1.5px dashed #cbd5e1',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 220,
              backgroundColor: '#f8fafc',
            }}
          >
            <div
              style={{
                width: 52, height: 52, borderRadius: 14,
                backgroundColor: 'rgba(16,185,129,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#10b981',
              }}
            >
              <UploadIcon size={24} color="#10b981" />
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#142b49', marginBottom: 4 }}>
                Upload Your Own Template
              </div>
              <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.4 }}>
                Upload a DTTR/DTR PDF template provided by your college or training agency.
              </div>
            </div>
          </TemplateCard>

          {/* User-uploaded custom templates (if any) */}
          {templates.map((tmpl) => (
            <TemplateCard
              key={tmpl.id}
              selected={selectedId === tmpl.id}
              onClick={() => { if (deletingId !== tmpl.id && renamingId !== tmpl.id) setSelectedId(tmpl.id); }}
            >
              {/* PDF preview thumbnail */}
              <div
                style={{
                  width: '100%',
                  height: 120,
                  borderRadius: 8,
                  overflow: 'hidden',
                  border: '1px solid #e2e8f0',
                  backgroundColor: '#f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                }}
              >
                <iframe
                  src={`${tmpl.dataUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                  title={`Preview of ${tmpl.name}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    pointerEvents: 'none',
                    transform: 'scale(1)',
                    transformOrigin: 'top left',
                  }}
                />
              </div>

              {/* Name row + action buttons */}
              <div onClick={(e) => e.stopPropagation()}>
                {renamingId === tmpl.id ? (
                  <RenameInline
                    value={tmpl.name}
                    onSave={(n) => handleRename(tmpl.id, n)}
                    onCancel={() => setRenamingId(null)}
                  />
                ) : (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#142b49', lineHeight: 1.3 }}>{tmpl.name}</div>
                      <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
                        {tmpl.fileName} · {tmpl.fileSizeKb} KB
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 4, flexShrink: 0, marginTop: 2 }}>
                      <button
                        type="button"
                        title="Rename"
                        onClick={() => { setRenamingId(tmpl.id); setDeletingId(null); }}
                        style={{
                          width: 28, height: 28, borderRadius: 7,
                          border: '1px solid #e2e8f0', background: '#fff',
                          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#475569',
                        }}
                      >
                        <PencilIcon size={13} />
                      </button>
                      <button
                        type="button"
                        title="Delete"
                        onClick={() => setDeletingId(tmpl.id)}
                        style={{
                          width: 28, height: 28, borderRadius: 7,
                          border: '1px solid #fee2e2', background: '#fff9f9',
                          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#ef4444',
                        }}
                      >
                        <TrashIcon size={13} />
                      </button>
                    </div>
                  </div>
                )}

                {/* Delete confirmation */}
                {deletingId === tmpl.id && (
                  <div
                    style={{
                      marginTop: 8, padding: '8px 10px', borderRadius: 8,
                      backgroundColor: '#fff5f5', border: '1px solid #fee2e2',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
                    }}
                  >
                    <span style={{ fontSize: 12, color: '#dc2626' }}>Delete this template?</span>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        type="button"
                        onClick={() => setDeletingId(null)}
                        style={{ fontSize: 12, color: '#64748b', background: 'none', border: 'none', cursor: 'pointer' }}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(tmpl.id)}
                        style={{
                          fontSize: 12, fontWeight: 700, color: '#fff',
                          background: '#dc2626', border: 'none', borderRadius: 6,
                          padding: '3px 10px', cursor: 'pointer',
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {selectedId === tmpl.id && (
                <div style={{ fontSize: 12, fontWeight: 600, color: '#10b981', textAlign: 'right' }}>✓ Selected</div>
              )}
            </TemplateCard>
          ))}
        </div>
      </VStack>

      {/* Footer */}
      <div
        className="no-print"
        style={{
          borderTop: '1px solid #e2e8f0',
          padding: '12px 16px',
          backgroundColor: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <Text size="sm" color="secondary">
          {selectedId === 'system_chmsu_ccs' || selectedId === COMPUTER_STUDIES_TEMPLATE.id
            ? 'Computer Studies – Main Campus, Talisay template selected.'
            : selectedId === 'system_default' || selectedId === SYSTEM_TEMPLATE.id
            ? 'System Template selected.'
            : `Custom template: "${templates.find((t) => t.id === selectedId)?.name ?? ''}"`}
        </Text>
        <HStack gap={2}>
          <Button label="Cancel" variant="secondary" onClick={() => onOpenChange(false)} />
          <Button
            label="Use This Template →"
            variant="primary"
            icon={<PrinterIcon style={{ width: 15, height: 15 }} />}
            onClick={handleProceed}
          />
        </HStack>
      </div>
    </>
  );
}

export function DttrTemplateSelectorModal({
  isOpen,
  onOpenChange,
  currentUser = null,
  onSelectSystem,
  onSelectCustom,
  onUploadNew,
}) {
  if (!isOpen) return null;
  return (
    <Dialog isOpen={isOpen} onOpenChange={onOpenChange} purpose="form" width={880} maxHeight="92dvh">
      <TemplateSelectorContent
        onOpenChange={onOpenChange}
        currentUser={currentUser}
        onSelectSystem={onSelectSystem}
        onSelectCustom={onSelectCustom}
        onUploadNew={onUploadNew}
      />
    </Dialog>
  );
}

