import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Bell, Mail, Send, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function PreferenciasNotificaciones() {
  const [preferencias, setPreferencias] = useState({
    notif_activas: true,
    notif_umbral_dias: 30,
    correo_electronico: '',
  });
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [enviandoPrueba, setEnviandoPrueba] = useState(false);

  useEffect(() => {
    const cargarPreferencias = async () => {
      try {
        const res = await api.get('/notificaciones/preferencias');
        if (res.preferencias) {
          setPreferencias(res.preferencias);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    cargarPreferencias();
  }, []);

  const handleGuardar = async (e) => {
    e.preventDefault();
    setGuardando(true);
    try {
      await api.put('/notificaciones/preferencias', {
        notif_activas: preferencias.notif_activas,
        notif_umbral_dias: preferencias.notif_umbral_dias,
      });
      toast.success('Preferencias de notificación guardadas.');
    } catch (err) {
      toast.error(err.message || 'Error al guardar preferencias.');
    } finally {
      setGuardando(false);
    }
  };

  const handleEnviarPrueba = async () => {
    setEnviandoPrueba(true);
    try {
      const res = await api.post('/notificaciones/probar');
      toast.success(res.mensaje || 'Correo de prueba enviado.');
    } catch (err) {
      toast.error(err.message || 'Error al enviar correo de prueba.');
    } finally {
      setEnviandoPrueba(false);
    }
  };

  if (loading) {
    return <div className="max-w-xl mx-auto px-4 py-16 text-center text-slate-400 text-sm">Cargando configuración...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      
      {/* Encabezado */}
      <div>
        <span className="text-xs font-extrabold uppercase tracking-widest text-[#497dfe]">Servicio Automatizado</span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5">
          Alertas de Caducidad por Correo
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Configura la antelación con la que deseas recibir avisos preventivos automáticos vía Nodemailer y Cron.
        </p>
      </div>

      <form onSubmit={handleGuardar} className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-6">
        
        {/* Toggle de Notificaciones */}
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
          <div className="space-y-0.5">
            <span className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#497dfe]" /> Recordatorios Diarios Automáticos
            </span>
            <p className="text-xs text-slate-500 max-w-sm">
              El servidor revisará tu botiquín cada mañana y enviará un correo si tienes medicamentos próximos a vencer o ya caducados.
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={preferencias.notif_activas}
              onChange={(e) => setPreferencias({ ...preferencias, notif_activas: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#497dfe]"></div>
          </label>
        </div>

        {/* Umbral de días */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Umbral de Aviso Preventivo (Días de Antelación)
          </label>
          <p className="text-xs text-slate-400">
            Te avisaremos cuando a un medicamento le queden estos días o menos para alcanzar su fecha de vencimiento:
          </p>

          <div className="grid grid-cols-4 gap-2 pt-1">
            {[7, 15, 30, 60].map((dias) => (
              <button
                key={dias}
                type="button"
                onClick={() => setPreferencias({ ...preferencias, notif_umbral_dias: dias })}
                className={`py-3 rounded-2xl text-xs font-bold border transition-all ${
                  preferencias.notif_umbral_dias === dias
                    ? 'bg-blue-50 text-[#497dfe] border-[#497dfe] shadow-sm ring-1 ring-[#497dfe]'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {dias} días
              </button>
            ))}
          </div>
        </div>

        {/* Correo Destino */}
        <div className="space-y-1">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Correo Electrónico Destino
          </label>
          <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs font-semibold text-slate-700 flex items-center gap-2">
            <Mail className="w-4 h-4 text-slate-400" />
            <span>{preferencias.correo_electronico || 'Asociado a tu cuenta de Google'}</span>
          </div>
        </div>

        {/* Botón Guardar */}
        <div className="flex justify-end pt-2">
          <button type="submit" disabled={guardando} className="btn-primary py-2.5 px-6 text-xs font-bold">
            {guardando ? 'Guardando...' : 'Guardar Preferencias'}
          </button>
        </div>

      </form>

      {/* Tarjeta de Prueba de Envío */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Mail className="w-5 h-5 text-emerald-600" /> Comprobación de Entrega Inmediata
            </h3>
            <p className="text-xs text-slate-500 max-w-md">
              Envía un correo de prueba a tu bandeja de entrada ahora mismo con el estado real de tu botiquín para verificar la plantilla y la entrega de Nodemailer.
            </p>
          </div>

          <button
            type="button"
            onClick={handleEnviarPrueba}
            disabled={enviandoPrueba}
            className="btn-secondary py-2.5 px-4 text-xs font-bold flex items-center gap-2 flex-shrink-0 self-start sm:self-auto"
          >
            <Send className="w-4 h-4 text-[#497dfe]" />
            {enviandoPrueba ? 'Enviando...' : 'Enviar Correo de Prueba'}
          </button>
        </div>
      </div>

    </div>
  );
}
