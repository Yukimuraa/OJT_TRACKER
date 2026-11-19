/**
 * IndexedDB Service for Offline-First PWA Storage & Synchronization Queue
 * 
 * Stores:
 * - training_records: Offline persistent store for training logs
 * - profile: Offline store for student profile
 * - reminders: Offline store for reminders
 * - sync_queue: Outbox of offline mutations waiting to be synced to the Laravel backend
 */

const DB_NAME = 'ojt_tracker_db';
const DB_VERSION = 1;

let dbPromise = null;

export function openDatabase() {
  if (typeof window === 'undefined' || !('indexedDB' in window)) {
    return Promise.reject(new Error('IndexedDB not supported in this environment.'));
  }

  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // 1. Training Records Store
      if (!db.objectStoreNames.contains('training_records')) {
        const recordStore = db.createObjectStore('training_records', { keyPath: 'id' });
        recordStore.createIndex('userId', 'userId', { unique: false });
        recordStore.createIndex('date', 'date', { unique: false });
        recordStore.createIndex('syncStatus', 'syncStatus', { unique: false });
      }

      // 2. Student Profile Store
      if (!db.objectStoreNames.contains('profile')) {
        db.createObjectStore('profile', { keyPath: 'userId' });
      }

      // 3. User Reminders Store
      if (!db.objectStoreNames.contains('reminders')) {
        const reminderStore = db.createObjectStore('reminders', { keyPath: 'id' });
        reminderStore.createIndex('userId', 'userId', { unique: false });
      }

      // 4. Offline Sync Queue (Outbox)
      if (!db.objectStoreNames.contains('sync_queue')) {
        const queueStore = db.createObjectStore('sync_queue', { keyPath: 'queueId', autoIncrement: true });
        queueStore.createIndex('userId', 'userId', { unique: false });
        queueStore.createIndex('createdAt', 'createdAt', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => {
      dbPromise = null;
      reject(request.error);
    };
  });

  return dbPromise;
}

// ----------------------------------------------------
// Training Records Operations
// ----------------------------------------------------

export async function idbGetRecords(userId) {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('training_records', 'readonly');
      const store = tx.objectStore('training_records');
      const req = store.getAll();

      req.onsuccess = () => {
        const all = req.result || [];
        if (userId) {
          resolve(all.filter((r) => !r.userId || r.userId === userId));
        } else {
          resolve(all);
        }
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('IDB fallback to memory/empty', err);
    return [];
  }
}

export async function idbSaveRecord(record) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('training_records', 'readwrite');
    const store = tx.objectStore('training_records');
    const req = store.put(record);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function idbSaveRecords(records) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('training_records', 'readwrite');
    const store = tx.objectStore('training_records');
    for (const r of records) {
      store.put(r);
    }
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function idbDeleteRecord(recordId) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('training_records', 'readwrite');
    const store = tx.objectStore('training_records');
    const req = store.delete(recordId);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

// ----------------------------------------------------
// Sync Queue Operations
// ----------------------------------------------------

export async function idbEnqueueMutation(userId, action, data) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('sync_queue', 'readwrite');
    const store = tx.objectStore('sync_queue');
    const req = store.add({
      userId,
      action, // 'create' | 'update' | 'delete'
      data,
      createdAt: new Date().toISOString(),
      attempts: 0,
    });
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function idbGetSyncQueue(userId) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('sync_queue', 'readonly');
    const store = tx.objectStore('sync_queue');
    const req = store.getAll();
    req.onsuccess = () => {
      const items = req.result || [];
      if (userId) {
        resolve(items.filter((item) => item.userId === userId));
      } else {
        resolve(items);
      }
    };
    req.onerror = () => reject(req.error);
  });
}

export async function idbRemoveQueueItem(queueId) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('sync_queue', 'readwrite');
    const store = tx.objectStore('sync_queue');
    const req = store.delete(queueId);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function idbClearSyncQueue() {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('sync_queue', 'readwrite');
    const store = tx.objectStore('sync_queue');
    const req = store.clear();
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}
