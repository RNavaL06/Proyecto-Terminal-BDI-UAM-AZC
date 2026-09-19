import { Link } from 'react-router-dom';
import { useDashboard } from '../hooks/useDashboard';
import TomasDeHoy from '../components/dashboard/TomasDeHoy';
import AlertasInventario from '../components/dashboard/AlertasInventario';
import { 
  FileText, 
  ArrowRight,
  Lightbulb,
  Stethoscope,
  Activity
} from 'lucide-react';

export default function Dashboard() {
  const {
    user,
    loading,
    loadingTomas,
    tomasDeHoy,
    alertasCaducidad,
    recetasRecientes,
    ultimoDiagnostico,
    tipActual,
    pushStatus,
    handleMarcarTomado,
    handleActivarNotificaciones
  } = useDashboard();

  const fechaActual = new Date().toLocaleDateString('es-MX', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] w-full flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 rounded-full border-4 border-[#4f83f5] border-t-transparent animate-spin"></div>
          <p className="mt-4 text-slate-500 font-bold text-sm">Cargando panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full font-sans animate-fade-in pt-4 pb-24 sm:py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-2 mb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-800 tracking-tight">
            Hola, {user?.nombre_completo?.split(' ')[0] || 'Paciente'} 👋
          </h1>
          <p className="text-sm sm:text-base text-slate-600 mt-1 font-medium">
            Aquí tienes el resumen de tu salud y recordatorios de hoy.
          </p>
        </div>
        <div className="text-left md:text-right">
          <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest">
            {fechaActual}
          </span>
        </div>
      </div>

      {/* Tip de Salud del Día */}
      <div className="bg-gradient-to-r from-[#4f83f5] to-[#7a9df8] rounded-[1.5rem] p-5 sm:p-6 text-white shadow-md relative overflow-hidden flex items-center gap-4">
        <div className="absolute right-0 top-0 opacity-10 transform translate-x-4 -translate-y-4">
          <Lightbulb className="w-32 h-32" />
        </div>
        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 backdrop-blur-md">
          <Lightbulb className="w-6 h-6 text-white" />
        </div>
        <div className="relative z-10">
          <h3 className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-blue-100 mb-1">Tip de salud del día</h3>
          <p className="text-sm sm:text-base font-medium leading-snug">
            {tipActual}
          </p>
        </div>
      </div>

      {/* Bento Grid Row 2: Tomas y Diagnóstico */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <TomasDeHoy 
          tomasDeHoy={tomasDeHoy}
          loadingTomas={loadingTomas}
          pushStatus={pushStatus}
          handleActivarNotificaciones={handleActivarNotificaciones}
          handleMarcarTomado={handleMarcarTomado}
        />

        {/* Último Diagnóstico */}
        <div className="bg-white rounded-[2rem] p-6 sm:p-8 border border-slate-100 shadow-sm flex flex-col relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-48 h-48 bg-[#f27a71]/5 rounded-full blur-3xl group-hover:bg-[#f27a71]/10 transition-colors pointer-events-none"></div>
          
          <div className="flex items-center justify-between mb-6 relative z-10">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#f27a71]/10 flex items-center justify-center">
                <Stethoscope className="w-4 h-4 text-[#f27a71]" />
              </div>
              Último Diagnóstico
            </h3>
            <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2.5 py-1.5 rounded-full">{ultimoDiagnostico.fecha}</span>
          </div>
          
          <div className="flex-1 flex flex-col justify-center relative z-10 space-y-4">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Síntomas reportados</p>
              <p className="text-sm font-medium text-slate-600 italic">"{ultimoDiagnostico.sintomas}"</p>
            </div>
            <div className="pt-4 border-t border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Posible Afección</p>
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-[#f27a71]" />
                <h4 className="text-base sm:text-lg font-black text-slate-800">{ultimoDiagnostico.diagnostico}</h4>
              </div>
            </div>
            <Link to="/sintomas-voz" className="mt-4 w-full py-3.5 bg-[#f27a71]/10 text-[#f27a71] font-bold text-xs text-center rounded-xl hover:bg-[#f27a71] hover:text-white transition-colors">
              Iniciar Nueva Consulta
            </Link>
          </div>
        </div>

      </div>

      {/* Bento Grid Row 3: Listas Dinámicas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <AlertasInventario alertasCaducidad={alertasCaducidad} />

        {/* Recetas Recientes */}
        <div className="bg-white rounded-[2rem] p-6 sm:p-8 border border-slate-100 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                <FileText className="w-4 h-4 text-[#4f83f5]" />
              </div>
              Recetas Recientes
            </h3>
            <Link to="/recetas" className="text-xs font-bold text-[#4f83f5] hover:underline px-3 py-1.5 bg-blue-50 rounded-full">Historial completo</Link>
          </div>
          
          <div className="space-y-3 flex-1">
            {recetasRecientes.length > 0 ? (
              recetasRecientes.map((rec) => (
                <Link 
                  key={rec.id_receta} 
                  to={`/recetas/${rec.id_receta}`} 
                  className="flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 group"
                >
                  <div className="w-12 h-12 rounded-xl bg-slate-50 text-slate-400 group-hover:bg-[#4f83f5] group-hover:text-white flex items-center justify-center transition-colors flex-shrink-0">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-800 text-sm truncate group-hover:text-[#4f83f5] transition-colors">{rec.diagnostico || 'Receta sin diagnóstico'}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">{rec.nombre_medico || 'Médico general'} • {rec.total_medicamentos || 0} meds</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-[#4f83f5] group-hover:translate-x-1 transition-all" />
                </Link>
              ))
            ) : (
              <div className="h-full min-h-[150px] flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <FileText className="w-12 h-12 mb-3 opacity-20" />
                <p className="text-sm font-medium">Aún no has escaneado recetas.</p>
                <Link to="/escanear-receta" className="text-xs font-bold text-[#4f83f5] mt-2 hover:underline">Escanear ahora</Link>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
