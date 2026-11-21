/**
 * DTTR Template Service
 *
 * Manages per-user custom PDF DTTR templates with backend synchronization and local caching.
 * Each template is associated with the authenticated user account and stored on the Laravel server,
 * with local caching for instantaneous rendering and offline support.
 *
 * Storage key pattern:  ojt_dttr_templates_<userId>
 * Each entry shape:
 * {
 *   id: string | number, // Backend template ID or local ID
 *   name: string,        // User-supplied label
 *   fileName: string,    // Original filename
 *   dataUrl: string,     // base64 PDF data URL (data:application/pdf;base64,...)
 *   fileUrl?: string,    // Server download URL (/api/dttr-templates/<id>/file)
 *   fileSizeKb: number,
 *   uploadedAt: string,  // ISO timestamp
 *   fieldMap: { ... },   // Field mapping coordinates/configuration
 *   notes?: string,      // User notes / description
 * }
 */

import { getCurrentUser } from './authService.js';
import apiClient from './apiClient.js';

function getTemplatesKey(userId = null) {
  const uid = userId || getCurrentUser()?.id || 'guest';
  return `ojt_dttr_templates_${uid}`;
}

/**
 * Converts a Blob to a base64 Data URL.
 */
export function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    if (!blob) {
      resolve(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Failed to read PDF blob.'));
    reader.readAsDataURL(blob);
  });
}

/**
 * Converts a base64 Data URL to a File object.
 */
export function dataUrlToFile(dataUrl, fileName = 'template.pdf') {
  if (!dataUrl) return null;
  const parts = dataUrl.split(',');
  const mimeMatch = parts[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'application/pdf';
  const bstr = atob(parts[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], fileName, { type: mime });
}

/**
 * Loads all custom templates for the given user from local cache.
 * Returns [] if none saved.
 */
export function loadUserTemplates(userId = null) {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(getTemplatesKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Saves the full templates array for the given user to local cache.
 */
export function saveUserTemplates(templates, userId = null) {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(getTemplatesKey(userId), JSON.stringify(templates));
  } catch (err) {
    console.warn('[dttrTemplateService] Failed to save templates in local cache', err);
  }
}

/**
 * Ensures a template has a populated dataUrl by fetching the PDF from the backend if needed.
 */
export async function ensureTemplateDataUrl(template, userId = null) {
  if (template?.dataUrl) return template.dataUrl;
  if (!template?.id) return null;

  const url = template.fileUrl || `/api/dttr-templates/${template.id}/file`;
  try {
    const blob = await apiClient.getBlob(url);
    const dataUrl = await blobToDataUrl(blob);
    if (dataUrl) {
      template.dataUrl = dataUrl;
      const cached = loadUserTemplates(userId);
      const idx = cached.findIndex((t) => String(t.id) === String(template.id));
      if (idx !== -1) {
        cached[idx].dataUrl = dataUrl;
        saveUserTemplates(cached, userId);
      }
    }
    return dataUrl;
  } catch (err) {
    console.warn(`[dttrTemplateService] Failed to load PDF file for template ${template.id}:`, err);
    return null;
  }
}

/**
 * Fetches user templates from the Laravel backend and synchronizes with local storage.
 * Downloads missing PDF files so previews and generation work across browsers seamlessly.
 */
export async function fetchAndSyncUserTemplates(userId = null) {
  const currentUserId = userId || getCurrentUser()?.id || null;
  const localTemplates = loadUserTemplates(currentUserId);

  try {
    const response = await apiClient.get('/api/dttr-templates');
    const remoteTemplates = (response?.templates || []).filter((t) => {
      if (t.scope === 'user') return true;
      if (currentUserId && String(t.user_id) === String(currentUserId)) return true;
      return false;
    });

    const syncedTemplates = await Promise.all(
      remoteTemplates.map(async (rt) => {
        const existing = localTemplates.find((lt) => String(lt.id) === String(rt.id));
        let dataUrl = existing?.dataUrl || null;

        // If Browser 2 has no local dataUrl for this template, download from server
        if (!dataUrl && rt.id) {
          try {
            const blob = await apiClient.getBlob(rt.file_url || `/api/dttr-templates/${rt.id}/file`);
            dataUrl = await blobToDataUrl(blob);
          } catch (fetchErr) {
            console.warn(`[dttrTemplateService] Could not fetch PDF file for template ${rt.id}:`, fetchErr);
          }
        }

        return {
          id: String(rt.id),
          name: rt.name || 'Custom Template',
          fileName: rt.file_name || `${rt.name || 'template'}.pdf`,
          fileUrl: rt.file_url || `/api/dttr-templates/${rt.id}/file`,
          dataUrl,
          fileSizeKb: Number(rt.file_size_kb) || existing?.fileSizeKb || 0,
          uploadedAt: rt.created_at || existing?.uploadedAt || new Date().toISOString(),
          fieldMap: rt.field_map || existing?.fieldMap || {},
          notes: rt.description || existing?.notes || '',
        };
      })
    );

    saveUserTemplates(syncedTemplates, currentUserId);
    return syncedTemplates;
  } catch (err) {
    console.warn('[dttrTemplateService] Failed to sync templates from backend (falling back to cache):', err);
    return localTemplates;
  }
}

/**
 * Adds a new custom template for the user.
 * Uploads the PDF file to the Laravel backend and caches the result locally.
 */
export async function addUserTemplate({ name, fileName, file = null, dataUrl, fileSizeKb, fieldMap = {}, notes = '' }, userId = null) {
  const currentUserId = userId || getCurrentUser()?.id || null;
  let remoteTemplate = null;

  // 1. Upload to backend server
  try {
    let uploadFile = file;
    if (!uploadFile && dataUrl) {
      uploadFile = dataUrlToFile(dataUrl, fileName || 'template.pdf');
    }

    if (uploadFile) {
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('name', String(name || fileName || 'My Template').trim());
      if (notes) formData.append('description', String(notes).trim());
      if (fieldMap) formData.append('field_map', JSON.stringify(fieldMap));

      const res = await apiClient.post('/api/dttr-templates', formData);
      remoteTemplate = res?.template;
    }
  } catch (backendErr) {
    console.error('[dttrTemplateService] Failed to upload template to server:', backendErr);
    if (backendErr?.status && backendErr.status >= 400 && backendErr.status < 500) {
      throw backendErr;
    }
  }

  // 2. Update local cache
  const templates = loadUserTemplates(currentUserId);
  const tmpl = {
    id: remoteTemplate?.id ? String(remoteTemplate.id) : `tmpl_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    name: String(remoteTemplate?.name || name || fileName || 'My Template').trim(),
    fileName: String(remoteTemplate?.file_name || fileName || '').trim(),
    dataUrl,
    fileUrl: remoteTemplate?.file_url || null,
    fileSizeKb: Number(remoteTemplate?.file_size_kb || fileSizeKb) || 0,
    uploadedAt: remoteTemplate?.created_at || new Date().toISOString(),
    fieldMap: remoteTemplate?.field_map || { ...fieldMap },
    notes: String(notes || remoteTemplate?.description || '').trim(),
  };

  const existingIdx = templates.findIndex((t) => String(t.id) === String(tmpl.id));
  if (existingIdx !== -1) {
    templates[existingIdx] = tmpl;
  } else {
    templates.push(tmpl);
  }

  saveUserTemplates(templates, currentUserId);
  return tmpl;
}

/**
 * Updates name, fieldMap, or notes of an existing template.
 * Persists updates both locally and on the Laravel backend.
 */
export async function updateUserTemplate(id, patch, userId = null) {
  const currentUserId = userId || getCurrentUser()?.id || null;
  const templates = loadUserTemplates(currentUserId);
  const idx = templates.findIndex((t) => String(t.id) === String(id));
  if (idx === -1) throw new Error('Template not found.');

  const updated = { ...templates[idx], ...patch, id: String(id) };
  templates[idx] = updated;
  saveUserTemplates(templates, currentUserId);

  // Sync to backend if numeric ID
  if (!isNaN(Number(id))) {
    try {
      const payload = {};
      if (patch.name) payload.name = patch.name;
      if (patch.notes !== undefined) payload.description = patch.notes;
      if (patch.fieldMap) payload.field_map = patch.fieldMap;
      await apiClient.put(`/api/dttr-templates/${id}`, payload);
    } catch (err) {
      console.warn('[dttrTemplateService] Failed to sync template update to backend:', err);
    }
  }

  return updated;
}

/**
 * Deletes a template by id from local cache and the Laravel backend.
 */
export async function deleteUserTemplate(id, userId = null) {
  const currentUserId = userId || getCurrentUser()?.id || null;
  const templates = loadUserTemplates(currentUserId);
  saveUserTemplates(templates.filter((t) => String(t.id) !== String(id)), currentUserId);

  if (!isNaN(Number(id))) {
    try {
      await apiClient.delete(`/api/dttr-templates/${id}`);
    } catch (err) {
      console.warn('[dttrTemplateService] Failed to delete template from backend:', err);
    }
  }
}

/**
 * Reads a File object as a base64 data URL.
 * Returns a Promise<{ dataUrl, fileSizeKb }>.
 */
export function readPdfFile(file) {
  return new Promise((resolve, reject) => {
    if (!file || file.type !== 'application/pdf') {
      reject(new Error('Only PDF files are accepted.'));
      return;
    }
    const maxMB = 10;
    if (file.size > maxMB * 1024 * 1024) {
      reject(new Error(`PDF file must be under ${maxMB} MB.`));
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      resolve({
        dataUrl: e.target.result,
        fileSizeKb: Math.round(file.size / 1024),
      });
    };
    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.readAsDataURL(file);
  });
}

/**
 * Built-in System Templates
 */
export const COMPUTER_STUDIES_TEMPLATE = {
  id: 'system_chmsu_ccs',
  name: 'Computer Studies – Main Campus, Talisay',
  description: '',
  label: 'College Template',
  isSystem: true,
};

export const SYSTEM_TEMPLATE = {
  id: 'system_default',
  name: 'System Template',
  description: '',
  label: 'System Template',
  isSystem: true,
};

// Backward compatibility alias
export const OFFICIAL_TEMPLATE = COMPUTER_STUDIES_TEMPLATE;

/**
 * Fetches all templates visible to the user from the Laravel backend (/api/dttr-templates).
 */
export async function fetchRemoteTemplates() {
  try {
    const data = await apiClient.get('/api/dttr-templates');
    return data?.templates || [];
  } catch (err) {
    console.warn('Failed to fetch DTTR templates from backend', err);
    return [];
  }
}

/**
 * Creates a new custom template on the Laravel backend.
 */
export async function createRemoteTemplate({ name, description = '', filePath, templateType = 'pdf' }) {
  try {
    const data = await apiClient.post('/api/dttr-templates', {
      name,
      description,
      file_path: filePath,
      template_type: templateType,
    });
    return { success: true, template: data?.template };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Deletes a custom template on the Laravel backend.
 */
export async function deleteRemoteTemplate(templateId) {
  try {
    await apiClient.delete(`/api/dttr-templates/${templateId}`);
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}


