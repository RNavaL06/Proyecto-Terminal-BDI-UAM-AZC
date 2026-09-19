import { Edit3, Trash2 } from 'lucide-react';

const formatFecha = (fechaStr) => {
  if (!fechaStr) return 'Sin fecha';
  if (fechaStr.includes('T')) {
    const parts = fechaStr.split('T')[0].split('-');
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return fechaStr;
};

export default function InventarioList({ inventario, onEdit, onDelete }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
      {inventario.map((item) => (
        <div
          key={item.id_botiquin}
          className="card flex flex-col justify-between hover:shadow-md transition-all group border-slate-200/80 p-4 sm:p-5"
        >
          <div>
            <div className="flex items-start justify-between gap-2 mb-2">
              <span className={
                item.estado === 'vigente' 
                  ? 'badge-vigente' 
                  : item.estado === 'por_vencer' 
                    ? 'badge-por_vencer' 
                    : 'badge-caducado'
              }>
                {item.estado === 'vigente' ? 'Vigente' : item.estado === 'por_vencer' ? 'Por Vencer' : 'Caducado'}
              </span>
              <span className="text-[11px] font-bold text-slate-400">
                Stock: {item.cantidad_disponible} {item.unidad}
              </span>
            </div>

            <h2 className="text-base font-bold text-slate-900 leading-tight">
              {item.nombre_comercial}
            </h2>
            {item.sustancia_activa && (
              <p className="text-xs text-[#4f83f5] font-medium mt-0.5">
                {item.sustancia_activa}
              </p>
            )}

            <div className="mt-3 pt-3 border-t border-slate-100 space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Caducidad:</span>
                <span className="font-bold text-slate-800">
                  {formatFecha(item.fecha_caducidad)}
                </span>
              </div>
              {item.formato && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Presentación:</span>
                  <span className="font-medium text-slate-700">{item.formato}</span>
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] text-slate-400">
              {item.id_receta ? 'Vía receta digital' : 'Libre venta (OTC)'}
            </span>

            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => onEdit(item)}
                title="Editar medicamento"
                className="text-slate-400 hover:text-[#4f83f5] p-1.5 rounded-full hover:bg-blue-50 transition-colors"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => onDelete(item.id_botiquin)}
                title="Eliminar del botiquín"
                className="text-slate-400 hover:text-rose-600 p-1.5 rounded-full hover:bg-rose-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
