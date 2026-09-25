// Service Worker para BDI - Notificaciones Push

self.addEventListener('push', function(event) {
  let data = { title: 'Recordatorio BDI', body: 'Es hora de tu medicamento', url: '/' };
  
  if (event.data) {
    data = event.data.json();
  }

  const options = {
    body: data.body,
    icon: '/logo-app.jpg', // Logo personalizado de la app
    badge: '/vite.svg', // Idealmente en el futuro usar un icono mono color blanco
    vibrate: [200, 100, 200, 100, 200, 100, 200],
    data: {
      url: data.url,
      id_toma: data.id_toma // Asumiendo que enviamos el ID de la toma desde el backend
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
  
  const action = event.action;
  const data = event.notification.data;

  if (action === 'tomado') {
    // Comunicarnos con las ventanas abiertas del cliente para que la UI haga el fetch (ya que ella tiene el token JWT)
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then(windowClients => {
        for (let i = 0; i < windowClients.length; i++) {
          let client = windowClients[i];
          if (client.url.includes('/') && 'focus' in client) {
            // Mandamos un mensaje a la app React
            client.postMessage({ type: 'MARCAR_TOMADO', id_toma: data.id_toma });
            return client.focus();
          }
        }
        // Si no hay ventana abierta, igual la abrimos
        if (clients.openWindow) {
          return clients.openWindow(data.url + '?action=tomado&id_toma=' + data.id_toma);
        }
      })
    );
  } else if (action === 'posponer') {
    // Lógica para posponer (se puede implementar luego en frontend)
    console.log("El usuario pospuso la toma");
  } else {
    // Click normal
    event.waitUntil(
      clients.openWindow(data.url)
    );
  }
});
