/**
 * DTTR Template Service
 *
 * Manages per-user custom PDF DTTR templates in localStorage.
 * Each template is stored as a base64 data URL so it survives page reloads.
 *
 * Storage key pattern:  ojt_dttr_templates_<userId>
 * Each entry shape:
 * {
 *   id: string,          // 'tmpl_<timestamp>_<random>'
 *   name: string,        // User-supplied label
 *   fileName: string,    // Original filename
 *   dataUrl: string,     // base64 PDF data URL (data:application/pdf;base64,...)
 *   fileSizeKb: number,
 *   uploadedAt: string,  // ISO timestamp
 *   fieldMap: {          // Optional manual field-position hints (not enforced)
 *     studentName?: string,
 *     agencyName?: string,
 *     department?: string,
 *     month?: string,
 *     officialSchedule?: string,
 *     amArrival?: string,
 *     amDeparture?: string,
 *     pmArrival?: string,
 *     pmDeparture?: string,
 *     hoursColumn?: string,
 *     tasksColumn?: string,
 *     totalHours?: string,
 *     studentSignature?: string,
 *     supervisorSignature?: string,
 *   },
 *   notes?: string,      // Any user notes about this template
 * }
 */

import { getCurrentUser } from './authService.js';
import apiClient from './apiClient.js';

function getTemplatesKey(userId = null) {
  const uid = userId || getCurrentUser()?.id || 'guest';
  return `ojt_dttr_templates_${uid}`;
}

/**
 * Loads all custom templates for the given user.
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
 * Saves the full templates array for the given user.
 */
function saveUserTemplates(templates, userId = null) {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(getTemplatesKey(userId), JSON.stringify(templates));
  } catch (err) {
    console.error('[dttrTemplateService] Failed to save templates', err);
    throw new Error('Storage quota exceeded. Try removing old templates or use a smaller PDF file.');
  }
}

/**
 * Adds a new custom template for the user. Returns the saved template object.
 */
export function addUserTemplate({ name, fileName, dataUrl, fileSizeKb, fieldMap = {}, notes = '' }, userId = null) {
  const templates = loadUserTemplates(userId);
  const tmpl = {
    id: `tmpl_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    name: String(name || fileName || 'My Template').trim(),
    fileName: String(fileName || '').trim(),
    dataUrl,
    fileSizeKb: Number(fileSizeKb) || 0,
    uploadedAt: new Date().toISOString(),
    fieldMap: { ...fieldMap },
    notes: String(notes || '').trim(),
  };
  saveUserTemplates([...templates, tmpl], userId);
  return tmpl;
}

/**
 * Updates name, fieldMap, or notes of an existing template. Returns updated template.
 */
export function updateUserTemplate(id, patch, userId = null) {
  const templates = loadUserTemplates(userId);
  const idx = templates.findIndex((t) => t.id === id);
  if (idx === -1) throw new Error('Template not found.');
  const updated = { ...templates[idx], ...patch, id };
  templates[idx] = updated;
  saveUserTemplates(templates, userId);
  return updated;
}

/**
 * Deletes a template by id. Silently ignores if not found.
 */
export function deleteUserTemplate(id, userId = null) {
  const templates = loadUserTemplates(userId);
  saveUserTemplates(templates.filter((t) => t.id !== id), userId);
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


