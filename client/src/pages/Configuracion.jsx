import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useAccessibility } from '../context/AccessibilityContext';
import { 
  Bell, 
  Mail, 
  Send, 
  Type, 
  Eye, 
  Volume2, 
  Settings,
  VolumeX,
  Gauge
} from 'lucide-react';

export default function Configuracion() {
  const {
    fontSize,
    setFontSize,
    highContrast,
    setHighContrast,
    voiceFeedback,
    setVoiceFeedback,
    voiceSpeed,
    setVoiceSpeed,
    speak
  } = useAccessibility();

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

  const handleGuardarNotificaciones = async (e) => {
    e.preventDefault();
    setGuardando(true);
    try {
      await api.put('/notificaciones/preferencias', {
        notif_activas: preferencias.notif_activas,
        notif_umbral_dias: preferencias.notif_umbral_dias,
      });
      toast.success('Preferencias de notificación guardadas.');
      if (voiceFeedback) speak('Preferencias de notificación guardadas correctamente.');
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
      if (voiceFeedback) speak('Correo de prueba enviado. Por favor, revisa tu bandeja de entrada.');
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
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      
      {/* Encabezado */}
      <div>
        <span className="text-xs font-extrabold uppercase tracking-widest text-[#4f83f5]">Ajustes de la Aplicación</span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5 flex items-center gap-2">
          <Settings className="w-8 h-8 text-[#f27a71]" /> Configuración
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Adapta el Botiquín Digital a tus necesidades visuales, auditivas y de alertas.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* BLOQUE IZQUIERDO: ACCESIBILIDAD */}
        <div className="space-y-6">
          
          {/* Tarjeta: Accesibilidad Visual */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Eye className="w-5 h-5 text-[#4f83f5]" /> Visualización
            </h3>

            {/* Tamaño de Letra */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Type className="w-4 h-4 text-slate-400" /> Tamaño del Texto
              </label>
              <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-200/80">
                {['normal', 'grande', 'extragrande'].map(size => (
                  <button
                    key={size}
                    onClick={() => {
                      setFontSize(size);
                      if(voiceFeedback) speak(`Tamaño de letra cambiado a ${size}`);
                    }}
                    className={`flex-1 py-2.5 text-xs font-bold rounded-xl capitalize transition-all ${
                      fontSize === size 
                        ? 'bg-white text-[#4f83f5] shadow-sm ring-1 ring-slate-200/50' 
                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Alto Contraste */}
            <div className="flex items-center justify-between pt-2">
              <div className="space-y-0.5">
                <span className="text-sm font-bold text-slate-800">Alto Contraste</span>
                <p className="text-xs text-slate-500">Mejora la legibilidad con un fondo oscuro.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={highContrast}
                  onChange={(e) => {
                    setHighContrast(e.target.checked);
                    if(voiceFeedback && e.target.checked) speak('Modo de alto contraste activado');
                  }}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4f83f5]"></div>
              </label>
            </div>
          </div>

          {/* Tarjeta: Accesibilidad Auditiva */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Volume2 className="w-5 h-5 text-emerald-500" /> Asistente de Voz
            </h3>

            {/* Activar/Desactivar Voz */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  {voiceFeedback ? <Volume2 className="w-4 h-4 text-emerald-500" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
                  Lectura en Voz Alta
                </span>
                <p className="text-xs text-slate-500 pr-4">La app te leerá confirmaciones y alertas.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={voiceFeedback}
                  onChange={(e) => {
                    setVoiceFeedback(e.target.checked);
                    if(e.target.checked) {
                      // Usar un setTimeout para que el setState termine antes de hablar
                      setTimeout(() => {
                         const u = new SpeechSynthesisUtterance('Lectura en voz alta activada.');
                         u.rate = voiceSpeed === 'lenta' ? 0.7 : 1.0;
                         window.speechSynthesis.speak(u);
                      }, 100);
                    } else {
                      window.speechSynthesis.cancel();
                    }
                  }}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>

            {/* Velocidad de la Voz */}
            {voiceFeedback && (
              <div className="space-y-3 pt-2 animate-fade-in">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Gauge className="w-4 h-4 text-slate-400" /> Velocidad de Dicción
                </label>
                <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-200/80">
                  {['lenta', 'normal'].map(speed => (
                    <button
                      key={speed}
                      onClick={() => {
                        setVoiceSpeed(speed);
                        setTimeout(() => {
                           const u = new SpeechSynthesisUtterance(`Velocidad de voz cambiada a ${speed}.`);
                           u.rate = speed === 'lenta' ? 0.7 : 1.0;
                           window.speechSynthesis.speak(u);
                        }, 100);
                      }}
                      className={`flex-1 py-2.5 text-xs font-bold rounded-xl capitalize transition-all ${
                        voiceSpeed === speed 
                          ? 'bg-white text-emerald-600 shadow-sm ring-1 ring-slate-200/50' 
                          : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
                      }`}
                    >
                      {speed}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>


        {/* BLOQUE DERECHO: NOTIFICACIONES (Lo que ya existía) */}
        <div className="space-y-6">
          <form onSubmit={handleGuardarNotificaciones} className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Bell className="w-5 h-5 text-amber-500" /> Alertas por Correo
            </h3>
            
            {/* Toggle de Notificaciones */}
            <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
              <div className="space-y-0.5 pr-4">
                <span className="text-sm font-bold text-slate-800">Correos Diarios</span>
                <p className="text-xs text-slate-500">Recibir resumen automático de medicamentos próximos a vencer.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferencias.notif_activas}
                  onChange={(e) => setPreferencias({ ...preferencias, notif_activas: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
              </label>
            </div>

            {/* Umbral de días */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Avisarme con Antelación de:
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[7, 15, 30, 60].map((dias) => (
                  <button
                    key={dias}
                    type="button"
                    onClick={() => setPreferencias({ ...preferencias, notif_umbral_dias: dias })}
                    className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                      preferencias.notif_umbral_dias === dias
                        ? 'bg-amber-500 text-white border-amber-600 shadow-md'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {dias}d
                  </button>
                ))}
              </div>
            </div>

            {/* Correo Destino */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Correo Destino
              </label>
              <div className="p-3 bg-slate-100/50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-500 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 truncate">
                  <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span className="truncate">{preferencias.correo_electronico || 'Asociado a tu cuenta Google'}</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase tracking-widest bg-slate-200/50 px-2 py-1 rounded-md flex-shrink-0">
                  Solo Lectura
                </div>
              </div>
            </div>

            {/* Botón Guardar */}
            <div className="pt-2">
              <button type="submit" disabled={guardando} className="w-full inline-flex items-center justify-center px-6 py-3.5 bg-blue-600 text-white font-bold rounded-xl shadow-md shadow-blue-200/50 hover:bg-blue-700 transition-all duration-200 disabled:opacity-50">
                {guardando ? 'Guardando...' : 'Guardar Preferencias'}
              </button>
            </div>
          </form>

          {/* Tarjeta de Prueba de Envío */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
            <div className="space-y-2 mb-4">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Send className="w-4 h-4 text-slate-400" /> Probar Envío
              </h3>
              <p className="text-xs text-slate-500">
                Envía un correo ahora mismo con el estado de tu botiquín.
              </p>
            </div>
            <button
              type="button"
              onClick={handleEnviarPrueba}
              disabled={enviandoPrueba}
              className="w-full btn-secondary py-3 text-xs font-bold"
            >
              {enviandoPrueba ? 'Enviando comprobación...' : 'Enviar Correo de Prueba'}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
