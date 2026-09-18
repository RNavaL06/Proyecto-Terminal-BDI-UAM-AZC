import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  Camera, 
  Pill, 
  AlertTriangle, 
  Clock, 
  Mic, 
  MapPin, 
  FileText, 
  ArrowRight,
  ShieldCheck,
  Plus
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [resumen, setResumen] = useState(null);
  const [recetasRecientes, setRecetasRecientes] = useState([]);
  const [alertasCaducidad, setAlertasCaducidad] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarDashboard = async () => {
      try {
        const [invRes, recRes, altRes] = await Promise.all([
          api.get('/inventario'),
          api.get('/recetas?page=1&limit=4'),
          api.get('/inventario/alertas?dias=30'),
        ]);

        if (invRes.resumen) setResumen(invRes.resumen);
        if (recRes.data) setRecetasRecientes(recRes.data);
        if (altRes.data) setAlertasCaducidad(altRes.data);
      } catch (err) {
        console.error('Error cargando datos del dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    cargarDashboard();
  }, []);

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8">
      
      {/* Saludo y Encabezado */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#497dfe] to-blue-700 text-white p-5 sm:p-8 rounded-3xl shadow-lg shadow-blue-500/15">
        <div className="space-y-1.5">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-blue-200">Panel Principal BDI</span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Hola, {user?.nombre_completo || 'Paciente'}
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 max-w-xl">
            Tu botiquín inteligente está activo. Digitaliza prescripciones médicas, monitorea caducidades y consulta precios.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 pt-1 sm:pt-0">
          <Link to="/escanear-receta" className="btn-rose py-2.5 px-4 text-xs font-bold shadow-md">
            <Camera className="w-4 h-4 mr-1.5" /> Escanear
          </Link>
          <Link to="/sintomas-voz" className="inline-flex items-center justify-center px-4 py-2.5 bg-white/20 hover:bg-white/30 text-white font-bold rounded-full text-xs backdrop-blur-sm transition-all">
            <Mic className="w-4 h-4 mr-1.5" /> Dictar Síntomas
          </Link>
        </div>
      </div>

      {/* Acceso Rápido a Módulos Principales (Estilo Ricardo) */}
      <div className="space-y-2.5">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">Módulos del Sistema</h2>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Link to="/escanear-receta" className="card hover:shadow-md transition-all flex flex-col items-center text-center p-4 sm:p-5 group">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#497dfe] flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Camera className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-xs sm:text-sm text-slate-800">Escanear Receta</h3>
            <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5">Visión con IA</p>
          </Link>

          <Link to="/botiquin" className="card hover:shadow-md transition-all flex flex-col items-center text-center p-4 sm:p-5 group">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Pill className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-xs sm:text-sm text-slate-800">Mi Botiquín</h3>
            <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5">Control de stock</p>
          </Link>

          <Link to="/sintomas-voz" className="card hover:shadow-md transition-all flex flex-col items-center text-center p-4 sm:p-5 group">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-500 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Mic className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-xs sm:text-sm text-slate-800">Captura por Voz</h3>
            <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5">Mapeo CIE-10</p>
          </Link>

          <Link to="/farmacias" className="card hover:shadow-md transition-all flex flex-col items-center text-center p-4 sm:p-5 group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-xs sm:text-sm text-slate-800">Farmacias & Precios</h3>
            <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5">Google Shopping</p>
          </Link>
        </div>
      </div>

      {/* Tarjetas de Métricas Rápidas (Grid 2 columnas en móvil) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="card flex items-center gap-3 p-4 sm:p-5">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-blue-50 text-[#497dfe] flex items-center justify-center flex-shrink-0">
            <Pill className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <span className="text-xl sm:text-2xl font-black text-slate-900">{resumen?.total || 0}</span>
            <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">En Botiquín</p>
          </div>
        </div>

        <div className="card flex items-center gap-3 p-4 sm:p-5">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <span className="text-xl sm:text-2xl font-black text-slate-900">{resumen?.vigentes || 0}</span>
            <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">Vigentes</p>
          </div>
        </div>

        <div className="card flex items-center gap-3 p-4 sm:p-5">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
            <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <span className="text-xl sm:text-2xl font-black text-slate-900">{resumen?.porVencer || 0}</span>
            <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">Por Vencer</p>
          </div>
        </div>

        <div className="card flex items-center gap-3 p-4 sm:p-5">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <span className="text-xl sm:text-2xl font-black text-slate-900">{resumen?.caducados || 0}</span>
            <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">Caducados</p>
          </div>
        </div>
      </div>

      {/* Sección Doble: Alertas de Caducidad y Recetas Recientes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Alertas de Caducidad */}
        <div className="card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" /> Alertas de Caducidad Próxima
            </h2>
            <Link to="/botiquin" className="text-xs font-bold text-[#497dfe] hover:text-[#3b6aec] flex items-center gap-1">
              Ver botiquín <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {alertasCaducidad.length > 0 ? (
            <div className="space-y-2.5">
              {alertasCaducidad.slice(0, 4).map((item, idx) => (
                <div key={idx} className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-slate-800">{item.nombre_comercial}</h3>
                    <p className="text-xs text-slate-400">Caduca: {item.fecha_caducidad}</p>
                  </div>
                  <span className={item.estado === 'caducado' ? 'badge-caducado' : 'badge-por_vencer'}>
                    {item.estado === 'caducado' ? 'Caducado' : `${item.dias_restantes} días`}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-slate-400 text-xs">
              Todo en orden. No tienes medicamentos caducados ni próximos a vencer.
            </div>
          )}
        </div>

        {/* Recetas Digitalizadas Recientes */}
        <div className="card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#497dfe]" /> Recetas Digitalizadas Recientes
            </h2>
            <Link to="/recetas" className="text-xs font-bold text-[#497dfe] hover:text-[#3b6aec] flex items-center gap-1">
              Ver historial <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recetasRecientes.length > 0 ? (
            <div className="space-y-2.5">
              {recetasRecientes.map((rec) => (
                <Link
                  key={rec.id_receta}
                  to={`/recetas/${rec.id_receta}`}
                  className="p-3.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 rounded-xl flex items-center justify-between transition-colors group"
                >
                  <div>
                    <h3 className="font-bold text-sm text-slate-800 group-hover:text-[#497dfe] transition-colors">
                      {rec.diagnostico || 'Receta Médica'}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {rec.nombre_medico || 'Médico no especificado'} • {rec.fecha_expedicion}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                    {rec.total_medicamentos || 0} fármaco(s) <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-slate-400 text-xs">
              Aún no has digitalizado ninguna receta. Toca "Escanear Receta" para comenzar.
            </div>
          )}
        </div>

      </div>

      {/* Accesos Directos a Módulos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/sintomas-voz" className="card hover:shadow-md transition-all group flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Mic className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 group-hover:text-[#497dfe]">Consulta por Voz</h3>
            <p className="text-xs text-slate-400">Dicta tus síntomas y recibe diagnósticos sugeridos CIE-10 hablados.</p>
          </div>
        </Link>

        <Link to="/farmacias" className="card hover:shadow-md transition-all group flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#497dfe] flex items-center justify-center group-hover:scale-105 transition-transform">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 group-hover:text-[#497dfe]">Farmacias y Precios</h3>
            <p className="text-xs text-slate-400">Mapa con GPS o autocompletado y cotización en Google Shopping.</p>
          </div>
        </Link>

        <Link to="/notificaciones" className="card hover:shadow-md transition-all group flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 group-hover:text-[#497dfe]">Avisos por Correo</h3>
            <p className="text-xs text-slate-400">Configura recordatorios automáticos y envía un correo de prueba.</p>
          </div>
        </Link>
      </div>

    </div>
  );
}
