// Service Worker para BDI - Notificaciones Push

self.addEventListener('push', function(event) {
  let data = { title: 'Recordatorio BDI', body: 'Es hora de tu medicamento', url: '/' };
  
  if (event.data) {
    data = event.data.json();
  }

  const options = {
    body: data.body,
    icon: '/vite.svg', // Idealmente usar un logo del BDI
    badge: '/vite.svg',
    vibrate: [200, 100, 200, 100, 200, 100, 200],
    data: {
      url: data.url
    },
    actions: [
      { action: 'tomado', title: '✅ Ya lo tomé' },
      { action: 'posponer', title: '⏰ En 10 min' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  if (event.action === 'tomado') {
    // Aquí podríamos hacer un fetch al backend para marcarlo tomado, 
    // pero requerimos el token JWT. Por ahora abrimos la app.
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    );
  } else {
    // Click normal o posponer
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    );
  }
});
