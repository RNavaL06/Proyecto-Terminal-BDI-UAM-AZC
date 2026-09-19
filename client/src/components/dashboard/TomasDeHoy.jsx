import { CheckCircle2, BellRing } from 'lucide-react';

export default function TomasDeHoy({
  tomasDeHoy,
  loadingTomas,
  pushStatus,
  handleActivarNotificaciones,
  handleMarcarTomado
}) {
  return (
    <div className="bg-white rounded-[2rem] p-6 sm:p-8 border border-slate-100 shadow-sm flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          Tus tomas de hoy
        </h3>
        {pushStatus !== 'granted' && (
          <button 
            onClick={handleActivarNotificaciones}
            className="flex items-center gap-1.5 text-[10px] sm:text-xs font-bold text-[#4f83f5] bg-blue-50 px-2.5 py-1.5 rounded-full hover:bg-blue-100 transition-colors"
            title="Recibir notificaciones cuando sea la hora"
          >
            <BellRing className="w-3.5 h-3.5" />
            Activar Alertas
          </button>
        )}
      </div>
      
      <div className="space-y-4 flex-1">
        {loadingTomas ? (
           <p className="text-sm text-slate-500 italic">Cargando tomas...</p>
        ) : tomasDeHoy.length === 0 ? (
           <div className="h-full flex flex-col items-center justify-center text-center p-4 text-slate-400 opacity-60">
             <CheckCircle2 className="w-10 h-10 mb-2" />
             <p className="text-xs font-medium">No tienes medicamentos programados para hoy.</p>
           </div>
        ) : (
          <div className="relative pl-4 border-l-2 border-slate-100 space-y-6">
            {tomasDeHoy.map((toma) => (
              <div key={toma.id} className="relative">
                <div className={`absolute -left-[21px] top-1 w-3 h-3 rounded-full border-2 border-white ${toma.estado === 'tomado' ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className={`text-xs font-bold mb-1 block ${toma.estado === 'tomado' ? 'text-slate-400 line-through' : 'text-[#4f83f5]'}`}>{toma.hora}</span>
                    <h4 className={`text-sm font-bold ${toma.estado === 'tomado' ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{toma.medicamento}</h4>
                    <p className="text-[11px] text-slate-500">{toma.tipo}</p>
                  </div>
                  {toma.estado === 'pendiente' && (
                    <button 
                      onClick={() => handleMarcarTomado(toma.id)}
                      className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-colors border border-emerald-100 shadow-sm"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
