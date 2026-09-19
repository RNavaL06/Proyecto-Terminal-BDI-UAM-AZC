import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  FileText, 
  Pill, 
  Trash2, 
  ZoomIn, 
  X, 
  ShieldCheck,
  Building2,
  Clock,
  Bell,
  Activity,
  Stethoscope
} from 'lucide-react';

export default function RecetaDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [receta, setReceta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalZoom, setModalZoom] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [alarmasActivas, setAlarmasActivas] = useState([]);
  const [loadingAlarma, setLoadingAlarma] = useState({});

  useEffect(() => {
    const cargarReceta = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/recetas/${id}`);
        if (res.data) {
          setReceta(res.data);
          
          // Cargar alarmas activas
          try {
            const resAlarmas = await api.get(`/recordatorios/receta/${id}`);
            if (resAlarmas.exito) {
              setAlarmasActivas(resAlarmas.activos);
            }
          } catch (err) {
            console.error('Error al cargar alarmas:', err);
          }
        }
      } catch (err) {
        toast.error(err.message || 'No se pudo cargar la receta médica.');
      } finally {
        setLoading(false);
      }
    };

    cargarReceta();
  }, [id]);

  const formatearFecha = (fechaStr) => {
    if (!fechaStr) return 'No registrada';
    try {
      const date = new Date(fechaStr);
      // Ajuste de zona horaria para evitar desfase de día
      const userTimezoneOffset = date.getTimezoneOffset() * 60000;
      const adjustedDate = new Date(date.getTime() + userTimezoneOffset);
      return adjustedDate.toLocaleDateString('es-MX', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return fechaStr;
    }
  };

  const handleToggleAlarma = async (med) => {
    // Si ya está procesando esta alarma, no hacer nada (evita doble click)
    if (loadingAlarma[med.id_receta_detalle]) return;

    setLoadingAlarma(prev => ({ ...prev, [med.id_receta_detalle]: true }));
    const isActiva = alarmasActivas.includes(med.id_receta_detalle);
    
    try {
      const payload = {
        id_receta_detalle: med.id_receta_detalle,
        activo: !isActiva,
        medicamento_nombre: med.nombre_comercial,
        formato: med.formato || 'Tableta',
        frecuencia_texto: med.frecuencia,
        duracion_texto: med.duracion
      };

      const res = await api.post('/recordatorios/toggle-receta', payload);
      
      if (res.exito) {
        if (!isActiva) {
          setAlarmasActivas([...alarmasActivas, med.id_receta_detalle]);
          toast.success('Alarma activada con éxito');
        } else {
          setAlarmasActivas(alarmasActivas.filter(id => id !== med.id_receta_detalle));
          toast.success('Alarma desactivada');
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || 'Error al configurar la alarma');
    } finally {
      setLoadingAlarma(prev => ({ ...prev, [med.id_receta_detalle]: false }));
    }
  };

  const handleEliminar = async () => {
    const result = await Swal.fire({
      title: '¿Eliminar receta?',
      text: 'Esta acción eliminará la receta del historial de forma permanente y no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      customClass: {
        container: 'font-sans'
      }
    });

    if (!result.isConfirmed) return;

    setEliminando(true);
    try {
      await api.delete(`/recetas/${id}`);
      toast.success('Receta eliminada del historial exitosamente.');
      navigate('/recetas');
    } catch (err) {
      toast.error(err.message || 'Error al eliminar la receta.');
    } finally {
      setEliminando(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center text-slate-400 text-sm">
        Cargando detalle de la receta...
      </div>
    );
  }

  if (!receta) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Receta no encontrada</h2>
        <Link to="/recetas" className="btn-primary">
          Regresar al historial
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      
      {/* Botón de regreso y acciones */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link to="/recetas" className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-[#4f83f5] transition-colors">
          <ArrowLeft className="w-4 h-4" /> Volver al historial de recetas
        </Link>

        <button
          type="button"
          onClick={handleEliminar}
          disabled={eliminando}
          className="btn-danger py-2 px-4 text-xs font-bold self-start sm:self-auto flex items-center gap-1.5"
        >
          <Trash2 className="w-4 h-4" /> Eliminar Receta
        </button>
      </div>

      {/* Grid Dual: Imagen Original Escaneada a la Izquierda, Ficha Clínica a la Derecha */}
      <div className="relative">
        {/* Elemento decorativo de fondo */}
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-blue-400/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 relative z-10">
        
        {/* Columna Izquierda: Visor de Imagen Escaneada */}
        <div className="lg:col-span-5 space-y-3">
          <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] border border-white/40 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-4 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300">
            <div className="flex items-center justify-between border-b border-slate-100/50 pb-3">
              <span className="text-xs font-black text-slate-700 flex items-center gap-2 uppercase tracking-widest">
                <div className="p-1.5 bg-blue-50 rounded-lg">
                  <FileText className="w-4 h-4 text-[#4f83f5]" /> 
                </div>
                Documento Original
              </span>
              <button
                type="button"
                onClick={() => setModalZoom(true)}
                title="Ampliar imagen"
                className="text-slate-400 hover:text-[#4f83f5] hover:bg-blue-50 p-1.5 rounded-xl transition-all flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider"
              >
                <ZoomIn className="w-3.5 h-3.5" /> Ampliar
              </button>
            </div>

            {receta.imagen_base64 ? (
              <div
                onClick={() => setModalZoom(true)}
                className="relative rounded-2xl overflow-hidden bg-slate-50 border border-slate-200/60 cursor-pointer group aspect-[3/4] flex items-center justify-center shadow-inner"
              >
                <img
                  src={receta.imagen_base64}
                  alt="Receta médica original"
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6 text-white text-xs font-bold gap-2">
                  <ZoomIn className="w-4 h-4" /> Toque para expandir
                </div>
              </div>
            ) : (
              <div className="aspect-[3/4] bg-slate-50 rounded-2xl border border-dashed border-slate-200 flex flex-col items-center justify-center text-xs text-slate-400 gap-3">
                <FileText className="w-8 h-8 opacity-20" />
                Sin imagen adjunta
              </div>
            )}
          </div>
        </div>

        {/* Columna Derecha: Ficha Técnica y Medicamentos */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Ficha Clínica General */}
          <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] border border-white/40 p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-6 relative overflow-hidden group">
            <div className="absolute right-0 top-0 w-64 h-64 bg-[#4f83f5]/5 rounded-full blur-3xl -z-10 group-hover:bg-[#4f83f5]/10 transition-colors duration-700"></div>

            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-100/60 pb-6">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-[#4f83f5] uppercase tracking-widest flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" /> Ficha Médica
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-800 leading-tight">
                  {receta.diagnostico || 'Receta Médica General'}
                </h1>
                {receta.codigo_cie10 && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-black bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-xl border border-indigo-100/50 mt-2 shadow-sm">
                    <ShieldCheck className="w-3.5 h-3.5" /> CIE-10: {receta.codigo_cie10}
                  </span>
                )}
              </div>

              <span className={`text-[10px] font-bold px-3 py-1.5 rounded-xl uppercase tracking-widest shadow-sm self-start ${receta.estado === 'procesada' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/50' : 'bg-amber-50 text-amber-600 border border-amber-200/50'}`}>
                {receta.estado || 'Procesada'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4">
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> Paciente</span>
                <span className="text-sm font-black text-slate-700 capitalize block">{receta.paciente_nombre || 'No registrado'}</span>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Expedición</span>
                <span className="text-sm font-black text-slate-700 capitalize block">{formatearFecha(receta.fecha_expedicion)}</span>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Stethoscope className="w-3.5 h-3.5" /> Médico Tratante</span>
                <span className="text-sm font-black text-slate-700 capitalize block">{receta.nombre_medico || 'No especificado'}</span>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5" /> Cédula Profesional</span>
                <span className="text-sm font-black text-slate-700 block">{receta.cedula_profesional || 'No registrada'}</span>
              </div>
            </div>

            {receta.indicaciones && (
              <div className="pt-5 border-t border-slate-100/60">
                <span className="text-[10px] font-black text-[#f27a71] uppercase tracking-widest mb-2 block">Indicaciones Especiales</span>
                <p className="text-sm font-medium text-slate-600 leading-relaxed bg-orange-50/50 p-4 rounded-2xl border border-orange-100/50 shadow-inner">
                  {receta.indicaciones}
                </p>
              </div>
            )}
          </div>

          {/* Listado de Medicamentos Prescritos */}
          <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] border border-white/40 p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-5">
            <h2 className="text-base font-black text-slate-800 flex items-center gap-2.5 pb-2 border-b border-slate-100/60">
              <div className="p-1.5 bg-blue-50 rounded-lg">
                <Pill className="w-4 h-4 text-[#4f83f5]" />
              </div>
              Tratamiento Prescrito ({receta.medicamentos?.length || 0})
            </h2>

            {receta.medicamentos && receta.medicamentos.length > 0 ? (
              <div className="space-y-4 mt-4">
                {receta.medicamentos.map((med, idx) => (
                  <div key={idx} className="group relative p-5 bg-white border border-slate-100 rounded-[1.5rem] shadow-sm hover:shadow-md hover:border-blue-100 transition-all duration-300 ease-out flex flex-col gap-3 overflow-hidden">
                    {/* Deco Background */}
                    <div className="absolute right-0 top-0 w-32 h-32 bg-gradient-to-bl from-blue-50 to-transparent rounded-bl-full -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                    <div className="flex items-start justify-between gap-3 relative z-10">
                      <div className="flex gap-3 items-start">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0 group-hover:bg-[#4f83f5] group-hover:text-white transition-colors duration-300">
                          <Pill className="w-5 h-5 text-slate-400 group-hover:text-white" />
                        </div>
                        <div>
                          <h3 className="font-black text-slate-800 text-base">{med.nombre_comercial}</h3>
                          {med.sustancia_activa && (
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                              {med.sustancia_activa}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        {med.dosis && (
                          <span className="text-[11px] font-black bg-blue-50 text-[#4f83f5] px-3 py-1 rounded-xl border border-blue-100/50 shadow-sm">
                            {med.dosis}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-50 relative z-10">
                      <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs font-bold text-slate-500">
                        {med.frecuencia && (
                          <span className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg">
                            <Clock className="w-3.5 h-3.5 text-[#f27a71]" /> {med.frecuencia}
                          </span>
                        )}
                        {med.duracion && (
                          <span className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg">
                            <Calendar className="w-3.5 h-3.5 text-[#4f83f5]" /> {med.duracion}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => handleToggleAlarma(med)}
                        disabled={loadingAlarma[med.id_receta_detalle]}
                        className={`px-3 py-1.5 rounded-xl border transition-all duration-300 flex items-center gap-1.5 text-xs font-black shadow-sm ${
                          loadingAlarma[med.id_receta_detalle] ? 'opacity-50 cursor-wait bg-slate-100 text-slate-400 scale-95' :
                          alarmasActivas.includes(med.id_receta_detalle)
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100 hover:shadow-md'
                            : 'bg-white text-slate-500 border-slate-200 hover:text-slate-700 hover:border-slate-300 hover:bg-slate-50 hover:shadow-md'
                        }`}
                        title={alarmasActivas.includes(med.id_receta_detalle) ? 'Desactivar alarma' : 'Activar alarma'}
                      >
                        <Bell className={`w-3.5 h-3.5 ${alarmasActivas.includes(med.id_receta_detalle) ? 'animate-pulse' : ''}`} />
                        {alarmasActivas.includes(med.id_receta_detalle) ? 'Alarma Activa' : 'Activar Alarma'}
                      </button>
                    </div>

                    {med.instrucciones_uso && (
                      <div className="bg-slate-50/80 rounded-xl p-3 text-xs font-medium text-slate-600 border border-slate-100 mt-1 relative z-10">
                        <span className="font-bold text-slate-400 block mb-0.5">Instrucciones:</span>
                        {med.instrucciones_uso}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                  <Pill className="w-8 h-8 text-slate-300" />
                </div>
                <p className="text-sm font-bold text-slate-400">
                  No hay medicamentos registrados en esta receta.
                </p>
              </div>
            )}
          </div>

        </div>

      </div>
      </div>

      {/* Modal de Zoom de Imagen */}
      {modalZoom && receta.imagen_base64 && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="relative max-w-4xl w-full max-h-[90vh] bg-slate-900 rounded-2xl overflow-hidden border border-slate-700 flex flex-col">
            <div className="flex items-center justify-between p-3 bg-slate-950 text-white border-b border-slate-800">
              <span className="text-xs font-bold">Fotografía Original de la Receta</span>
              <button
                type="button"
                onClick={() => setModalZoom(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-auto flex items-center justify-center max-h-[82vh]">
              <img
                src={receta.imagen_base64}
                alt="Receta médica ampliada"
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
