import { Pill, X } from 'lucide-react';

export default function BotiquinFormModal({
  formMed,
  setFormMed,
  editId,
  onSubmit,
  onClose
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="card max-w-lg w-full space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Pill className="w-5 h-5 text-[#4f83f5]" /> {editId ? 'Editar Medicamento' : 'Registrar Medicamento'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Nombre Comercial *</label>
            <input
              type="text"
              required
              value={formMed.nombre_medicamento}
              onChange={(e) => setFormMed({ ...formMed, nombre_medicamento: e.target.value })}
              placeholder="Ej. Tylenol 500mg"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4f83f5]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Sustancia Activa</label>
              <input
                type="text"
                value={formMed.sustancia_activa}
                onChange={(e) => setFormMed({ ...formMed, sustancia_activa: e.target.value })}
                placeholder="Ej. Paracetamol"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4f83f5]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Presentación</label>
              <input
                type="text"
                value={formMed.formato}
                onChange={(e) => setFormMed({ ...formMed, formato: e.target.value })}
                placeholder="Ej. Tabletas, Jarabe"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4f83f5]"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Cantidad *</label>
              <input
                type="number"
                min="0"
                required
                value={formMed.cantidad_disponible}
                onChange={(e) => setFormMed({ ...formMed, cantidad_disponible: parseInt(e.target.value, 10) || 0 })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4f83f5]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Unidad</label>
              <select
                value={formMed.unidad}
                onChange={(e) => setFormMed({ ...formMed, unidad: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4f83f5]"
              >
                <option value="piezas">piezas</option>
                <option value="tabletas">tabletas</option>
                <option value="capsulas">cápsulas</option>
                <option value="sobres">sobres</option>
                <option value="ml">ml</option>
                <option value="frascos">frascos</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Fecha Caducidad</label>
              <input
                type="date"
                value={formMed.fecha_caducidad}
                onChange={(e) => setFormMed({ ...formMed, fecha_caducidad: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4f83f5]"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              {editId ? 'Guardar Cambios' : 'Registrar en Botiquín'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
