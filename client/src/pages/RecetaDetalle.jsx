import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
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
  Clock
} from 'lucide-react';

export default function RecetaDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [receta, setReceta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalZoom, setModalZoom] = useState(false);
  const [eliminando, setEliminando] = useState(false);

  useEffect(() => {
    const cargarReceta = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/recetas/${id}`);
        if (res.data) {
          setReceta(res.data);
        }
      } catch (err) {
        toast.error(err.message || 'No se pudo cargar la receta médica.');
      } finally {
        setLoading(false);
      }
    };

    cargarReceta();
  }, [id]);

  const handleEliminar = async () => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta receta del historial? Esta acción no se puede deshacer.')) {
      return;
    }

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
        <Link to="/recetas" className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-[#497dfe] transition-colors">
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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Columna Izquierda: Visor de Imagen Escaneada (Cristian) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-[#497dfe]" /> Documento Original Escaneado
              </span>
              <button
                type="button"
                onClick={() => setModalZoom(true)}
                title="Ampliar imagen"
                className="text-slate-400 hover:text-[#497dfe] p-1 rounded-lg transition-colors flex items-center gap-1 text-xs font-bold"
              >
                <ZoomIn className="w-4 h-4" /> Zoom
              </button>
            </div>

            {receta.imagen_base64 ? (
              <div
                onClick={() => setModalZoom(true)}
                className="relative rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 cursor-pointer group aspect-[3/4] flex items-center justify-center"
              >
                <img
                  src={receta.imagen_base64}
                  alt="Receta médica original"
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1.5">
                  <ZoomIn className="w-5 h-5" /> Clic para ampliar
                </div>
              </div>
            ) : (
              <div className="aspect-[3/4] bg-slate-50 rounded-2xl border border-dashed border-slate-200 flex items-center justify-center text-xs text-slate-400">
                Sin imagen adjunta
              </div>
            )}
          </div>
        </div>

        {/* Columna Derecha: Ficha Técnica y Medicamentos (Ricardo + Cristian) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Ficha Clínica General */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-extrabold text-[#497dfe] uppercase tracking-wider">Detalle del Registro</span>
                <h1 className="text-2xl font-black text-slate-900 mt-0.5">
                  {receta.diagnostico || 'Receta Médica General'}
                </h1>
                {receta.codigo_cie10 && (
                  <span className="inline-block text-xs font-extrabold bg-blue-50 text-[#497dfe] px-3 py-1 rounded-full border border-blue-200 mt-2">
                    CIE-10: {receta.codigo_cie10}
                  </span>
                )}
              </div>

              <span className="badge-vigente py-1 px-3">
                {receta.estado || 'Procesada'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-600">
              <div className="space-y-1">
                <span className="font-bold text-slate-400 uppercase tracking-wider block">Paciente</span>
                <span className="text-sm font-bold text-slate-800">{receta.paciente_nombre || 'No registrado'}</span>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-slate-400 uppercase tracking-wider block">Fecha de Expedición</span>
                <span className="text-sm font-bold text-slate-800">{receta.fecha_expedicion}</span>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-slate-400 uppercase tracking-wider block">Médico Emisor</span>
                <span className="text-sm font-bold text-slate-800">{receta.nombre_medico || 'Médico no especificado'}</span>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-slate-400 uppercase tracking-wider block">Cédula Profesional</span>
                <span className="text-sm font-bold text-slate-800">{receta.cedula_profesional || 'Sin cédula registrada'}</span>
              </div>
            </div>

            {receta.indicaciones && (
              <div className="pt-3 border-t border-slate-100 space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Indicaciones Clínicas</span>
                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                  {receta.indicaciones}
                </p>
              </div>
            )}
          </div>

          {/* Listado de Medicamentos Prescritos */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Pill className="w-5 h-5 text-[#497dfe]" /> Medicamentos Prescritos ({receta.medicamentos?.length || 0})
            </h2>

            {receta.medicamentos && receta.medicamentos.length > 0 ? (
              <div className="space-y-3">
                {receta.medicamentos.map((med, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-sm text-slate-900">{med.nombre_comercial}</h3>
                        {med.sustancia_activa && (
                          <p className="text-xs text-slate-500 font-medium">
                            Principio activo: <span className="text-slate-700">{med.sustancia_activa}</span>
                          </p>
                        )}
                      </div>

                      {med.dosis && (
                        <span className="text-xs font-bold bg-white text-[#497dfe] px-3 py-1 rounded-full border border-slate-200 shadow-sm">
                          {med.dosis}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 pt-1 border-t border-slate-200/50">
                      {med.frecuencia && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" /> {med.frecuencia}
                        </span>
                      )}
                      {med.duracion && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" /> {med.duracion}
                        </span>
                      )}
                    </div>

                    {med.instrucciones_uso && (
                      <p className="text-xs text-slate-500 italic pt-1">
                        Instrucciones: {med.instrucciones_uso}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic py-4 text-center">
                No hay renglones de medicamentos registrados en esta receta.
              </p>
            )}
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
