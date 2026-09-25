import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDashboard } from '../hooks/useDashboard';
import TomasDeHoy from '../components/dashboard/TomasDeHoy';
import AlertasInventario from '../components/dashboard/AlertasInventario';
  FileText, 
  ArrowRight,
  Lightbulb,
  Stethoscope,
  Activity,
  AlertCircle,
  X
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
    tomasPendientesAyer,
    handleMarcarTomado,
    handleOmitirToma,
    handleActivarNotificaciones
  } = useDashboard();

  const [showModalPendientes, setShowModalPendientes] = useState(false);

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

      {/* Pendientes Banner */}
      {tomasPendientesAyer?.length > 0 && !showModalPendientes && (
        <div className="bg-amber-50 border border-amber-200 rounded-[1.5rem] p-4 flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-3 text-amber-800">
            <AlertCircle className="w-5 h-5 text-amber-500" />
            <span className="text-sm font-bold">Tienes {tomasPendientesAyer.length} toma(s) sin registrar de ayer.</span>
          </div>
          <button 
            onClick={() => setShowModalPendientes(true)}
            className="text-xs font-bold text-amber-700 bg-amber-100 hover:bg-amber-200 px-4 py-2 rounded-xl transition-colors"
          >
            Revisar
          </button>
        </div>
      )}

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
        {ultimoDiagnostico ? (
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
        ) : (
          <div className="bg-white rounded-[2rem] p-6 sm:p-8 border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden group">
            <div className="absolute right-0 top-0 w-48 h-48 bg-slate-100/50 rounded-full blur-3xl transition-colors pointer-events-none"></div>
            <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4 relative z-10">
              <Stethoscope className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2 relative z-10">Sin diagnósticos previos</h3>
            <p className="text-sm text-slate-500 mb-6 max-w-[250px] relative z-10">Aún no has realizado ninguna consulta de síntomas. ¿Te sientes mal?</p>
            <Link to="/sintomas-voz" className="w-full py-3.5 bg-[#f27a71] text-white font-bold text-xs text-center rounded-xl shadow-md hover:bg-[#e06960] transition-colors relative z-10">
              Iniciar Primera Consulta
            </Link>
          </div>
        )}

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

      {/* Modal de Tomas Pendientes de Ayer */}
      {showModalPendientes && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl">
            <div className="p-4 sm:p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-500" />
                Tomas de ayer
              </h3>
              <button onClick={() => setShowModalPendientes(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-slate-400 hover:text-slate-600 shadow-sm">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-4 sm:p-6 max-h-[50vh] overflow-y-auto space-y-4">
              {tomasPendientesAyer.length === 0 ? (
                <p className="text-center text-sm text-slate-500 py-4">Todo al día.</p>
              ) : (
                tomasPendientesAyer.map(toma => (
                  <div key={toma.id} className="bg-slate-50 rounded-2xl p-4 flex flex-col gap-3 border border-slate-100">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[#4f83f5] text-xs font-bold">{toma.hora}</span>
                        <h4 className="text-sm font-bold text-slate-800">{toma.medicamento}</h4>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleMarcarTomado(toma.id)}
                        className="flex-1 py-2 bg-emerald-100 text-emerald-700 font-bold text-xs rounded-xl hover:bg-emerald-200 transition-colors"
                      >
                        ✅ Tomado
                      </button>
                      <button 
                        onClick={() => handleOmitirToma(toma.id)}
                        className="flex-1 py-2 bg-slate-200 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-300 transition-colors"
                      >
                        ❌ Omitido
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div className="p-4 bg-slate-50 border-t border-slate-100">
              <button 
                onClick={() => setShowModalPendientes(false)}
                className="w-full py-3 bg-white border border-slate-200 text-slate-700 font-bold text-sm rounded-xl hover:bg-slate-100 transition-colors shadow-sm"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
