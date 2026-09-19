import { AlertTriangle, Clock, XCircle, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AlertasInventario({ alertasCaducidad }) {
  return (
    <div className="bg-white rounded-[2rem] p-6 sm:p-8 border border-slate-100 shadow-sm flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          Alertas de Caducidad
        </h3>
        <Link to="/botiquin" className="text-xs font-bold text-[#4f83f5] hover:underline px-3 py-1.5 bg-blue-50 rounded-full">
          Ver botiquín
        </Link>
      </div>
      
      <div className="space-y-3 flex-1">
        {alertasCaducidad.length > 0 ? (
          alertasCaducidad.slice(0, 4).map((item, idx) => (
            <div key={idx} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-sm flex-shrink-0 ${item.estado === 'caducado' ? 'bg-[#f27a71]' : 'bg-amber-400'}`}>
                {item.estado === 'caducado' ? <XCircle className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-slate-800 text-sm truncate">{item.nombre_comercial}</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Vencimiento: {item.fecha_caducidad}</p>
              </div>
              <div className="flex-shrink-0 text-right">
                {item.estado === 'caducado' ? (
                  <span className="text-[10px] font-black text-[#f27a71] bg-[#f27a71]/10 px-2.5 py-1.5 rounded-lg uppercase tracking-wider">Vencido</span>
                ) : (
                  <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-2.5 py-1.5 rounded-lg uppercase tracking-wider">En {item.dias_restantes}d</span>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="h-full min-h-[150px] flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <ShieldCheck className="w-12 h-12 mb-3 opacity-20" />
            <p className="text-sm font-medium">Todo en orden. No tienes alertas.</p>
          </div>
        )}
      </div>
    </div>
  );
}
