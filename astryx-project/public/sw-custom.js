// Custom Service Worker script for OJT Hours Tracker
// Handles Web Push events and Notification Clicks (focus / navigation to /app/timelogs)

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/app/timelogs';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If a window is already open, focus it and navigate
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          if ('navigate' in client) {
            client.navigate(targetUrl);
          }
          return client.focus();
        }
      }
      // Otherwise open a new window
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

self.addEventListener('push', (event) => {
  let payload = {
    title: 'OJT Hours Tracker Reminder',
    body: "Don't forget to record your OJT training hours and daily activities.",
    icon: '/icons/icon-192.png',
    badge: '/favicon.svg',
    data: { url: '/app/timelogs' },
  };

  if (event.data) {
    try {
      const parsed = event.data.json();
      payload = { ...payload, ...parsed };
    } catch {
      payload.body = event.data.text() || payload.body;
    }
  }

  const notificationOptions = {
    body: payload.body,
    icon: payload.icon || '/icons/icon-192.png',
    badge: payload.badge || '/favicon.svg',
    data: payload.data || { url: '/app/timelogs' },
    vibrate: [200, 100, 200],
    tag: 'ojt-daily-reminder',
    renotify: true,
  };

  event.waitUntil(
    self.registration.showNotification(payload.title, notificationOptions)
  );
});

