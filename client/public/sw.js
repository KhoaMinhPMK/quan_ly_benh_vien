// This is the Service Worker for MedBoard Push Notifications

self.addEventListener('push', function(event) {
  if (event.data) {
    try {
      const data = event.data.json();
      const notificationData = data.notification || {};
      
      const options = {
        body: notificationData.body,
        icon: notificationData.icon || '/favicon.svg',
        badge: notificationData.badge || '/favicon.svg',
        vibrate: notificationData.vibrate || [100, 50, 100],
        data: notificationData.data,
      };

      event.waitUntil(
        self.registration.showNotification(notificationData.title, options)
      );
    } catch (e) {
      console.error('Error parsing push data', e);
      // Fallback if not JSON
      event.waitUntil(
        self.registration.showNotification('MedBoard Notification', {
          body: event.data.text(),
          icon: '/favicon.svg'
        })
      );
    }
  }
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  // Handle clicking the notification. Navigate to the app.
  const urlToOpen = new URL('/', self.location.origin).href;

  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then(function(windowClients) {
      // If a window is already open, focus it
      let matchingClient = null;
      for (let i = 0; i < windowClients.length; i++) {
        const windowClient = windowClients[i];
        if (windowClient.url === urlToOpen) {
          matchingClient = windowClient;
          break;
        }
      }

      if (matchingClient) {
        return matchingClient.focus();
      } else {
        // Otherwise, open a new window
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
