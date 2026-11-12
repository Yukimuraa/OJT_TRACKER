import React, { useEffect, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { Banner } from '@astryxdesign/core/Banner';
import { Button } from '@astryxdesign/core/Button';
import { VStack } from '@astryxdesign/core/VStack';

export function PwaStatusBanners() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator === 'undefined' ? true : navigator.onLine
  );
  const [offlineDismissed, setOfflineDismissed] = useState(false);

  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    immediate: true,
    onRegisteredSW(swUrl, registration) {
      if (import.meta.env.DEV) {
        console.info('[PWA] Service worker registered', swUrl);
      }
      if (registration) {
        window.setInterval(() => {
          registration.update().catch(() => {});
        }, 60 * 60 * 1000);
      }
    },
    onRegisterError(error) {
      console.error('[PWA] Service worker registration failed', error);
    },
  });

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setOfflineDismissed(false);
    };
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const showOffline = !isOnline && !offlineDismissed;

  if (!showOffline && !needRefresh) return null;

  return (
    <VStack gap={3} padding={3}>
      {showOffline && (
        <Banner
          status="warning"
          container="card"
          title="You are offline"
          description="Previously saved records on this device remain available. An internet connection is required to load a new app version. Attendance is not synchronized to a remote server."
          isDismissable
          onDismiss={() => setOfflineDismissed(true)}
        />
      )}
      {needRefresh && (
        <Banner
          status="info"
          container="card"
          title="A new version of OJT Hours Tracker is available"
          description="Refresh to apply the update. Unsaved form fields on this screen may be reset."
          endContent={
            <Button
              label="Refresh"
              variant="primary"
              size="sm"
              onClick={() => updateServiceWorker(true)}
            />
          }
          isDismissable
          onDismiss={() => setNeedRefresh(false)}
        />
      )}
    </VStack>
  );
}
