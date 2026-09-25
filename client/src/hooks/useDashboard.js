import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { subscribeToPushNotifications } from '../services/pushService';
import { useAuth } from '../context/AuthContext';

export const useDashboard = () => {
  const { user } = useAuth();
  const [recetasRecientes, setRecetasRecientes] = useState([]);
  const [alertasCaducidad, setAlertasCaducidad] = useState([]);
  const [loading, setLoading] = useState(true);

  const [tomasDeHoy, setTomasDeHoy] = useState([]);
  const [tomasPendientesAyer, setTomasPendientesAyer] = useState([]);
  const [loadingTomas, setLoadingTomas] = useState(true);
  const [pushStatus, setPushStatus] = useState(Notification.permission);

  const ultimoDiagnostico = null; // Sin diagnósticos previos para cuentas nuevas

  const tipsDeSalud = [
    "Recuerda que los antibióticos deben tomarse por el ciclo completo, incluso si ya te sientes bien.",
    "Beber suficiente agua ayuda a que los medicamentos se absorban mejor en tu organismo.",
    "Revisa tu botiquín cada mes para desechar correctamente los medicamentos caducados.",
    "No compartas medicamentos recetados con otras personas, aunque tengan síntomas similares.",
    "Toma tus medicinas a la misma hora todos los días para crear un hábito y evitar olvidos."
  ];

  const diaDelAño = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
  const tipActual = tipsDeSalud[diaDelAño % tipsDeSalud.length];

  useEffect(() => {
    const cargarDashboard = async () => {
      try {
        const [recRes, altRes, tomasRes, pendientesRes] = await Promise.all([
          api.get('/recetas?page=1&limit=4'),
          api.get('/inventario/alertas?dias=30'),
          api.get('/recordatorios/hoy'),
          api.get('/recordatorios/pendientes')
        ]);

        if (recRes && recRes.data) setRecetasRecientes(recRes.data);
        if (altRes && altRes.data) setAlertasCaducidad(altRes.data);
        if (tomasRes && tomasRes.tomas) setTomasDeHoy(tomasRes.tomas);
        if (pendientesRes && pendientesRes.data?.tomas) {
          setTomasPendientesAyer(pendientesRes.data.tomas);
        } else if (pendientesRes && pendientesRes.tomas) {
          setTomasPendientesAyer(pendientesRes.tomas);
        }
      } catch (err) {
        console.error('Error cargando datos del dashboard:', err);
      } finally {
        setLoading(false);
        setLoadingTomas(false);
      }
    };

    cargarDashboard();
  }, []);

  const handleMarcarTomado = async (idToma) => {
    try {
      await api.put(`/recordatorios/toma/${idToma}/completar`);
      setTomasDeHoy(prev => prev.map(t => t.id === idToma ? { ...t, estado: 'tomado' } : t));
      setTomasPendientesAyer(prev => prev.filter(t => t.id !== idToma));
      toast.success('¡Toma registrada! Buen trabajo.', { icon: '✅' });
    } catch (err) {
      toast.error(err.response?.data?.mensaje || 'Error al registrar toma.');
    }
  };

  const handleOmitirToma = async (idToma) => {
    try {
      await api.put(`/recordatorios/toma/${idToma}/omitir`);
      setTomasPendientesAyer(prev => prev.filter(t => t.id !== idToma));
      toast.success('Toma marcada como omitida.', { icon: '❌' });
    } catch (err) {
      toast.error('Error al omitir toma.');
    }
  };

  const handleActivarNotificaciones = async () => {
    const res = await subscribeToPushNotifications();
    if (res.exito) {
      setPushStatus('granted');
      toast.success('Notificaciones activadas. ¡Te avisaremos a tiempo!', { icon: '🔔' });
    } else {
      toast.error('No se pudieron activar las notificaciones.');
    }
  };

  return {
    user,
    loading,
    loadingTomas,
    tomasDeHoy,
    alertasCaducidad,
    recetasRecientes,
    ultimoDiagnostico,
    tipActual,
    pushStatus,
    tomasPendientesAyer,
    handleMarcarTomado,
    handleOmitirToma,
    handleActivarNotificaciones
  };
};
