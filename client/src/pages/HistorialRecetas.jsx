import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { FileText, Plus, Search, ChevronLeft, ChevronRight, Calendar, User, Pill, ArrowRight } from 'lucide-react';

export default function HistorialRecetas() {
  const [recetas, setRecetas] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 8, total: 0, totalPages: 0 });
  const [filtroTexto, setFiltroTexto] = useState('');
  const [loading, setLoading] = useState(true);

  const cargarRecetas = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.get(`/recetas?page=${page}&limit=${pagination.limit}`);
      if (res.data) {
        setRecetas(res.data);
        if (res.pagination) setPagination(res.pagination);
      }
    } catch (err) {
      console.error('Error cargando recetas:', err);
    } finally {
      setLoading(false);
    }
  }, [pagination.limit]);

  useEffect(() => {
    cargarRecetas(1);
  }, [cargarRecetas]);

  const recetasFiltradas = recetas.filter((r) => {
    if (!filtroTexto.trim()) return true;
    const q = filtroTexto.toLowerCase();
    return (
      (r.diagnostico && r.diagnostico.toLowerCase().includes(q)) ||
      (r.nombre_medico && r.nombre_medico.toLowerCase().includes(q)) ||
      (r.codigo_cie10 && r.codigo_cie10.toLowerCase().includes(q))
    );
  });

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-6 animate-fade-in">
      
      {/* Encabezado y Acción */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#4f83f5]">Expediente Clínico Digital</span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5">
            Historial de Recetas
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Consulta y administra todas las recetas médicas digitalizadas.
          </p>
        </div>

        <Link to="/escanear-receta" className="btn-rose py-2.5 px-5 self-start sm:self-auto text-xs sm:text-sm font-bold shadow-md">
          <Plus className="w-4 h-4 mr-1.5" /> Escanear Receta
        </Link>
      </div>

      {/* Buscador de Recetas */}
      <div className="card p-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filtroTexto}
            onChange={(e) => setFiltroTexto(e.target.value)}
            placeholder="Buscar por diagnóstico, médico o código CIE-10..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#4f83f5] focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Lista de Recetas */}
      {loading ? (
        <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center text-slate-400 text-sm shadow-sm">
          Cargando historial de recetas...
        </div>
      ) : recetasFiltradas.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recetasFiltradas.map((rec) => (
            <Link
              key={rec.id_receta}
              to={`/recetas/${rec.id_receta}`}
              className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm hover:border-blue-300 hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-bold text-slate-800 group-hover:text-[#4f83f5] transition-colors">
                      {rec.diagnostico || 'Receta Médica'}
                    </h3>
                    {rec.codigo_cie10 && (
                      <span className="inline-block text-[11px] font-extrabold bg-blue-50 text-[#4f83f5] px-2.5 py-0.5 rounded-full border border-blue-200 mt-1">
                        CIE-10: {rec.codigo_cie10}
                      </span>
                    )}
                  </div>

                  <span className="text-xs px-3 py-1 rounded-full bg-slate-100 text-slate-600 font-bold">
                    #{rec.id_receta}
                  </span>
                </div>

                <div className="space-y-1 text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>{rec.nombre_medico || 'Médico no especificado'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Expedida el: {rec.fecha_expedicion}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500">
                <span className="flex items-center gap-1.5 text-[#4f83f5] font-bold">
                  <Pill className="w-4 h-4" /> {rec.total_medicamentos || 0} fármacos prescritos
                </span>
                <span className="inline-flex items-center gap-1 text-slate-400 group-hover:text-[#4f83f5] transition-colors font-bold">
                  Ver detalle e imagen <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-100 p-16 text-center space-y-3 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#4f83f5] mx-auto flex items-center justify-center">
            <FileText className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-700">No se encontraron recetas</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {filtroTexto ? 'No hay coincidencias con tu término de búsqueda.' : 'Aún no has digitalizado ninguna receta médica en tu cuenta.'}
          </p>
        </div>
      )}

      {/* Paginación */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <button
            type="button"
            onClick={() => pagination.page > 1 && cargarRecetas(pagination.page - 1)}
            disabled={pagination.page <= 1}
            className="btn-secondary py-2 px-3 text-xs flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" /> Anterior
          </button>

          <span className="text-xs font-bold text-slate-500">
            Página {pagination.page} de {pagination.totalPages} ({pagination.total} recetas)
          </span>

          <button
            type="button"
            onClick={() => pagination.page < pagination.totalPages && cargarRecetas(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
            className="btn-secondary py-2 px-3 text-xs flex items-center gap-1"
          >
            Siguiente <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

    </div>
  );
}
