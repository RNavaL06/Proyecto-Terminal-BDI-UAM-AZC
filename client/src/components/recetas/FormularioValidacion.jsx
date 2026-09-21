import { useState } from 'react';
import { Plus, Trash2, CheckCircle2, ShieldCheck, Pill, AlertCircle } from 'lucide-react';

export default function FormularioValidacion({
  initialData,
  imagenProcesada,
  onConfirm,
  onCancel,
  isSaving = false,
}) {
  const [formData, setFormData] = useState({
    paciente_nombre: initialData?.paciente_nombre || '',
    medico_nombre: initialData?.medico_nombre || '',
    medico_cedula: initialData?.medico_cedula || '',
    fecha_emision: initialData?.fecha_emision || new Date().toISOString().split('T')[0],
    diagnostico: initialData?.diagnostico || '',
    codigo_cie10: initialData?.codigo_cie10 || '',
    indicaciones: initialData?.indicaciones || '',
    medicamentos: Array.isArray(initialData?.medicamentos) && initialData.medicamentos.length > 0
      ? initialData.medicamentos
      : [{ nombre_medicamento: '', dosis: '', formato: 'Tabletas', indicaciones: '', frecuencia: '', duracion: '' }],
    agregar_al_botiquin: true,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleMedicamentoChange = (index, field, value) => {
    const nuevosMedicamentos = [...formData.medicamentos];
    nuevosMedicamentos[index] = {
      ...nuevosMedicamentos[index],
      [field]: value,
    };
    setFormData((prev) => ({
      ...prev,
      medicamentos: nuevosMedicamentos,
    }));
  };

  // Botón dinámico para agregar renglones manuales de medicamentos
  const addMedicamento = () => {
    setFormData((prev) => ({
      ...prev,
      medicamentos: [
        ...prev.medicamentos,
        {
          nombre_medicamento: '',
          sustancia_activa: '',
          dosis: '',
          formato: 'Tabletas',
          indicaciones: '',
          frecuencia: 'Cada 8 horas',
          duracion: '5 días',
        },
      ],
    }));
  };

  // Eliminar renglón específico
  const removeMedicamento = (index) => {
    if (formData.medicamentos.length <= 1) return;
    const nuevosMedicamentos = [...formData.medicamentos];
    nuevosMedicamentos.splice(index, 1);
    setFormData((prev) => ({
      ...prev,
      medicamentos: nuevosMedicamentos,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm({
      ...formData,
      imagen_base64: imagenProcesada,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in">
      
      {/* Banner de Validación Humana Obligatoria */}
      <div className="bg-blue-50/70 border border-blue-200/80 rounded-3xl p-5 flex items-start gap-3.5">
        <ShieldCheck className="w-6 h-6 text-[#4f83f5] flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="text-sm font-black text-slate-900">Validación Humana Obligatoria</h3>
          <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
            Revisa detenidamente los datos extraídos por la Inteligencia Artificial. Puedes editar cualquier campo,
            corregir dosis o presionar <strong>+ Agregar Medicamento</strong> para añadir fármacos adicionales que no hayan sido capturados con nitidez.
          </p>
        </div>
      </div>

      {/* Datos del Documento y Médico */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-5">
        <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
          <Pill className="w-5 h-5 text-[#4f83f5]" /> Datos Generales de la Receta
        </h3>

        {/* Advertencia si falta el médico o cédula */}
        {(!formData.medico_nombre || !formData.medico_cedula) && (
          <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4 flex items-start gap-3 mt-4 mb-4">
            <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-amber-800">Datos del médico incompletos</h4>
              <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
                No logramos detectar el <strong>nombre del médico</strong> o su <strong>cédula profesional</strong> en la imagen. Por tu seguridad y para un mejor seguimiento, te sugerimos llenarlos manualmente si los conoces.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
              Nombre del Paciente
            </label>
            <input
              type="text"
              name="paciente_nombre"
              value={formData.paciente_nombre}
              onChange={handleChange}
              placeholder="Ej. Juan Pérez"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4f83f5] focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
              Fecha de Expedición
            </label>
            <input
              type="date"
              name="fecha_emision"
              value={formData.fecha_emision}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4f83f5] focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
              Médico que Prescribe
            </label>
            <input
              type="text"
              name="medico_nombre"
              value={formData.medico_nombre}
              onChange={handleChange}
              placeholder="Ej. Dr. Roberto Martínez"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4f83f5] focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
              Cédula Profesional
            </label>
            <input
              type="text"
              name="medico_cedula"
              value={formData.medico_cedula}
              onChange={handleChange}
              placeholder="Ej. CED-1234567"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4f83f5] focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
              Diagnóstico Clínico
            </label>
            <input
              type="text"
              name="diagnostico"
              value={formData.diagnostico}
              onChange={handleChange}
              placeholder="Ej. Faringitis Aguda"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4f83f5] focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
              Código CIE-10 (Opcional)
            </label>
            <input
              type="text"
              name="codigo_cie10"
              value={formData.codigo_cie10}
              onChange={handleChange}
              placeholder="Ej. J02.9"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4f83f5] focus:bg-white transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
            Indicaciones Generales / Reposo / Cuidados
          </label>
          <textarea
            rows="2"
            name="indicaciones"
            value={formData.indicaciones}
            onChange={handleChange}
            placeholder="Ej. Tomar abundantes líquidos y guardar reposo 3 días."
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4f83f5] focus:bg-white transition-all resize-none"
          />
        </div>
      </div>

      {/* Medicamentos Prescritos con Botón Dinámico */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-800">Medicamentos Prescritos ({formData.medicamentos.length})</h3>
            <p className="text-xs text-slate-400">Verifica o añade los medicamentos que contiene la receta.</p>
          </div>
          
          <button
            type="button"
            onClick={addMedicamento}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-full text-xs font-bold transition-all"
          >
            <Plus className="w-4 h-4" /> Agregar Medicamento
          </button>
        </div>

        <div className="space-y-4">
          {formData.medicamentos.map((med, idx) => (
            <div key={idx} className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-2xl relative group">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-extrabold text-[#4f83f5] bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                  Medicamento #{idx + 1}
                </span>

                {formData.medicamentos.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeMedicamento(idx)}
                    title="Eliminar este medicamento"
                    className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Nombre Comercial o Fármaco *</label>
                  <input
                    type="text"
                    value={med.nombre_medicamento || ''}
                    onChange={(e) => handleMedicamentoChange(idx, 'nombre_medicamento', e.target.value)}
                    placeholder="Ej. Amoxil 500mg"
                    required
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4f83f5]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Dosis / Concentración</label>
                  <input
                    type="text"
                    value={med.dosis || ''}
                    onChange={(e) => handleMedicamentoChange(idx, 'dosis', e.target.value)}
                    placeholder="Ej. 500 mg"
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4f83f5]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Frecuencia</label>
                  <input
                    type="text"
                    value={med.frecuencia || ''}
                    onChange={(e) => handleMedicamentoChange(idx, 'frecuencia', e.target.value)}
                    placeholder="Ej. Cada 8 horas"
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4f83f5]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Duración</label>
                  <input
                    type="text"
                    value={med.duracion || ''}
                    onChange={(e) => handleMedicamentoChange(idx, 'duracion', e.target.value)}
                    placeholder="Ej. 7 días"
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4f83f5]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Instrucciones Especiales</label>
                  <input
                    type="text"
                    value={med.indicaciones || ''}
                    onChange={(e) => handleMedicamentoChange(idx, 'indicaciones', e.target.value)}
                    placeholder="Ej. Vía oral con alimentos"
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4f83f5]"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sincronización Automática con Botiquín */}
      <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm">
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            name="agregar_al_botiquin"
            checked={formData.agregar_al_botiquin}
            onChange={handleChange}
            className="w-5 h-5 rounded-lg text-[#4f83f5] focus:ring-[#4f83f5] border-slate-300"
          />
          <div>
            <span className="text-sm font-bold text-slate-800">Añadir automáticamente medicamentos al botiquín físico</span>
            <p className="text-xs text-slate-500">Crea un registro con stock inicial en tu inventario personal para comenzar el monitoreo de caducidades.</p>
          </div>
        </label>
      </div>

      {/* Botones de Acción */}
      <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          className="btn-secondary w-full sm:w-auto"
        >
          Cancelar
        </button>

        <button
          type="submit"
          disabled={isSaving}
          className="btn-rose w-full sm:w-auto min-w-[200px]"
        >
          {isSaving ? (
            <span className="inline-flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
              Guardando receta...
            </span>
          ) : (
            <span className="inline-flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" /> Confirmar y Guardar Receta
            </span>
          )}
        </button>
      </div>

    </form>
  );
}
