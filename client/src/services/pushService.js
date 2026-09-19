import api from './api';

const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

export const subscribeToPushNotifications = async () => {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('El navegador no soporta notificaciones Push.');
    return { exito: false, error: 'No soportado' };
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      return { exito: false, error: 'Permiso denegado' };
    }

    // 1. Registrar el SW (si no está ya)
    const registration = await navigator.serviceWorker.register('/sw.js');

    // 2. Obtener la clave pública desde el backend
    const keyData = await api.get('/push/vapidPublicKey');
    const applicationServerKey = urlBase64ToUint8Array(keyData.publicKey);

    // 3. Suscribirse
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey
    });

    // 4. Enviar suscripción al backend
    await api.post('/push/suscribir', {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('p256dh')))),
        auth: btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('auth'))))
      }
    });

    return { exito: true };
  } catch (error) {
    console.error('Error suscribiendo a notificaciones push:', error);
    return { exito: false, error: error.message };
  }
};
