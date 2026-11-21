import { useState, useCallback, useEffect } from 'react';
import { APP_CONFIG } from '../config/appConfig';

/**
 * useAppUpdate Hook
 *
 * Checks for Service Worker and application updates using the standard ServiceWorker API
 * and vite-plugin-pwa runtime. Preserves user session and local data upon update.
 */
export function useAppUpdate() {
  const [status, setStatus] = useState('idle'); // 'idle' | 'checking' | 'available' | 'up-to-date' | 'error'
  const [errorMessage, setErrorMessage] = useState(null);
  const [lastChecked, setLastChecked] = useState(null);

  // Listen for waiting service worker
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;

    const checkWaitingWorker = async () => {
      try {
        const reg = await navigator.serviceWorker.getRegistration();
        if (reg?.waiting) {
          setStatus('available');
        }
      } catch {}
    };

    checkWaitingWorker();
  }, []);

  const checkForUpdates = useCallback(async () => {
    setStatus('checking');
    setErrorMessage(null);

    // If offline, inform user
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      setTimeout(() => {
        setStatus('error');
        setErrorMessage('Cannot check for updates while offline. Please connect to the internet.');
      }, 500);
      return;
    }

    try {
      // If service worker is not supported or running in Vite dev mode
      if (typeof navigator === 'undefined' || !('serviceWorker' in navigator) || import.meta.env.DEV) {
        await new Promise((resolve) => setTimeout(resolve, 800));
        setStatus('up-to-date');
        setLastChecked(new Date());
        return;
      }

      const reg = await navigator.serviceWorker.getRegistration();
      if (!reg) {
        await new Promise((resolve) => setTimeout(resolve, 800));
        setStatus('up-to-date');
        setLastChecked(new Date());
        return;
      }

      // Check with browser service worker engine
      await reg.update();
      setLastChecked(new Date());

      if (reg.waiting || reg.installing) {
        setStatus('available');
      } else {
        setStatus('up-to-date');
      }
    } catch (err) {
      console.warn('[AppUpdate] Update check failed:', err);
      setStatus('error');
      setErrorMessage(err.message || 'Failed to check for updates. Please try again.');
    }
  }, []);

  const applyUpdate = useCallback(async () => {
    try {
      if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.getRegistration();
        if (reg?.waiting) {
          let refreshing = false;
          navigator.serviceWorker.addEventListener('controllerchange', () => {
            if (!refreshing) {
              refreshing = true;
              window.location.reload();
            }
          });
          reg.waiting.postMessage({ type: 'SKIP_WAITING' });
          return;
        }
      }
      // Fallback reload
      window.location.reload();
    } catch {
      window.location.reload();
    }
  }, []);

  return {
    status,
    isChecking: status === 'checking',
    isUpdateAvailable: status === 'available',
    isUpToDate: status === 'up-to-date',
    errorMessage,
    lastChecked,
    currentVersion: APP_CONFIG.version,
    checkForUpdates,
    applyUpdate,
  };
}
