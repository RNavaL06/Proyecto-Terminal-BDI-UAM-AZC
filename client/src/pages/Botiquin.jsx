import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import CameraCapture from '../components/recetas/CameraCapture';
import { 
  Pill, 
  Plus, 
  Camera, 
  Search, 
  AlertTriangle, 
  Clock, 
  ShieldCheck, 
  Trash2, 
  Edit3, 
  X,
  CheckCircle2,
  Box
} from 'lucide-react';

export default function Botiquin() {
  const [inventario, setInventario] = useState([]);
  const [resumen, setResumen] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState('todos'); // 'todos', 'vigente', 'por_vencer', 'caducado'
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);

  // Modales
  const [modalAgregar, setModalAgregar] = useState(false);
  const [modalEscanerCaja, setModalEscanerCaja] = useState(false);
  const [escanerLoading, setEscanerLoading] = useState(false);

  // Formulario de agregar/editar
  const [formMed, setFormMed] = useState({
    nombre_medicamento: '',
    sustancia_activa: '',
    formato: 'Tabletas',
    cantidad_disponible: 10,
    unidad: 'piezas',
    fecha_caducidad: '',
    lote: '',
    notas: '',
  });

  const cargarInventario = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/inventario');
      if (res.data) setInventario(res.data);
      if (res.resumen) setResumen(res.resumen);
    } catch (err) {
      console.error('Error al cargar botiquín:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarInventario();
  }, [cargarInventario]);

  // Manejador de agregar medicamento
  const handleGuardarMedicamento = async (e) => {
    e.preventDefault();
    try {
      await api.post('/inventario', formMed);
      toast.success('Medicamento registrado en el botiquín.');
      setModalAgregar(false);
      setFormMed({
        nombre_medicamento: '',
        sustancia_activa: '',
        formato: 'Tabletas',
        cantidad_disponible: 10,
        unidad: 'piezas',
        fecha_caducidad: '',
        lote: '',
        notas: '',
      });
      cargarInventario();
    } catch (err) {
      toast.error(err.message || 'Error al registrar medicamento.');
    }
  };

  // Manejador de escaneo de caja con IA
  const handleEscanearCaja = async (dataUrl) => {
    setEscanerLoading(true);
    try {
      const res = await api.post('/inventario/analizar', { imageBase64: dataUrl });
      if (res.data) {
        setFormMed((prev) => ({
          ...prev,
          nombre_medicamento: res.data.nombre_medicamento || '',
          sustancia_activa: res.data.sustancia_activa || '',
          formato: res.data.formato || 'Tabletas',
          fecha_caducidad: res.data.fecha_caducidad || '',
        }));
        setModalEscanerCaja(false);
        setModalAgregar(true);
        toast.success('¡Datos de la caja extraídos con éxito!');
      }
    } catch (err) {
      toast.error(err.message || 'Error al analizar caja con IA.');
    } finally {
      setEscanerLoading(false);
    }
  };

  const handleEliminar = async (idBotiquin) => {
    if (!window.confirm('¿Deseas retirar este medicamento de tu botiquín?')) return;
    try {
      await api.delete(`/inventario/${idBotiquin}`);
      toast.success('Medicamento eliminado del inventario.');
      cargarInventario();
    } catch (err) {
      toast.error(err.message || 'Error al eliminar.');
    }
  };

  const inventarioFiltrado = inventario.filter((item) => {
    const coincideEstado = filtroEstado === 'todos' || item.estado === filtroEstado;
    const coincideBusqueda =
      !busqueda.trim() ||
      item.nombre_comercial.toLowerCase().includes(busqueda.toLowerCase()) ||
      (item.sustancia_activa && item.sustancia_activa.toLowerCase().includes(busqueda.toLowerCase()));
    return coincideEstado && coincideBusqueda;
  });

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-6 animate-fade-in">
      
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#497dfe]">Inventario Doméstico</span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5">
            Mi Botiquín
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Administra tus medicamentos guardados y monitorea fechas de caducidad.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setModalEscanerCaja(true)}
            className="btn-rose py-2.5 px-4 text-xs font-bold flex items-center gap-1.5 shadow-sm"
          >
            <Camera className="w-4 h-4" /> Escanear Caja
          </button>
          <button
            type="button"
            onClick={() => setModalAgregar(true)}
            className="btn-primary py-2.5 px-4 text-xs font-bold flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" /> Agregar Manual
          </button>
        </div>
      </div>

      {/* Barra de Filtros y Buscador */}
      <div className="card p-3.5 sm:p-4 space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre o sustancia activa..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#497dfe] focus:bg-white transition-all"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 -mx-1 px-1 no-scrollbar">
            {[
              { id: 'todos', label: `Todos (${resumen?.total || 0})` },
              { id: 'vigente', label: `Vigentes (${resumen?.vigentes || 0})` },
              { id: 'por_vencer', label: `Por Vencer (${resumen?.porVencer || 0})` },
              { id: 'caducado', label: `Caducados (${resumen?.caducados || 0})` },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFiltroEstado(tab.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  filtroEstado === tab.id
                    ? 'bg-[#497dfe] text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* Cuadrícula de Medicamentos */}
      {loading ? (
        <div className="card py-16 text-center text-slate-400 text-sm">
          Cargando inventario del botiquín...
        </div>
      ) : inventarioFiltrado.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {inventarioFiltrado.map((item) => (
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
                  <p className="text-xs text-[#497dfe] font-medium mt-0.5">
                    {item.sustancia_activa}
                  </p>
                )}

                <div className="mt-3 pt-3 border-t border-slate-100 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Caducidad:</span>
                    <span className="font-bold text-slate-800">
                      {item.fecha_caducidad || 'Sin fecha'}
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

                <button
                  type="button"
                  onClick={() => handleEliminar(item.id_botiquin)}
                  title="Eliminar del botiquín"
                  className="text-slate-400 hover:text-rose-600 p-1.5 rounded-full hover:bg-rose-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Estado Vacío - Diseño Ricardo */
        <div className="card py-12 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-300">
          <div className="relative mb-5">
            <div className="w-24 h-24 sm:w-28 sm:h-28 bg-blue-50 rounded-full flex items-center justify-center shadow-sm">
              <Box className="w-12 h-12 sm:w-14 sm:h-14 text-[#497dfe]" />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-white p-2 rounded-full shadow-md">
              <Pill className="w-6 h-6 sm:w-7 sm:h-7 text-rose-400 rotate-45" />
            </div>
          </div>
          
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2">
            {busqueda ? 'Sin coincidencias' : 'Tu botiquín está vacío'}
          </h2>
          <p className="text-slate-500 max-w-[280px] leading-relaxed mb-6 text-xs sm:text-sm">
            {busqueda
              ? 'No encontramos medicamentos con esos términos. Prueba buscando por sustancia activa.'
              : 'Aún no has agregado ningún medicamento. Comienza escaneando la caja de tus medicinas para llevar un mejor control.'}
          </p>

          <div className="flex flex-wrap gap-2.5 justify-center">
            <button
              type="button"
              onClick={() => setModalEscanerCaja(true)}
              className="btn-rose text-xs sm:text-sm py-3 px-6 shadow-md"
            >
              <Camera className="w-4 h-4 mr-1.5" /> Escanear Caja
            </button>
            <button
              type="button"
              onClick={() => setModalAgregar(true)}
              className="btn-secondary text-xs sm:text-sm py-3 px-6"
            >
              <Plus className="w-4 h-4 mr-1.5" /> Agregar Manual
            </button>
          </div>
        </div>
      )}

      {/* Modal: Escáner de Caja de Medicamento (IA) */}
      {modalEscanerCaja && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-2xl w-full">
            <CameraCapture
              onCapture={handleEscanearCaja}
              onCancel={() => setModalEscanerCaja(false)}
            />
          </div>
        </div>
      )}

      {/* Modal: Agregar Medicamento Manual */}
      {modalAgregar && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="card max-w-lg w-full space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Pill className="w-5 h-5 text-[#497dfe]" /> Registrar Medicamento en Botiquín
              </h3>
              <button
                type="button"
                onClick={() => setModalAgregar(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGuardarMedicamento} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nombre Comercial *</label>
                <input
                  type="text"
                  required
                  value={formMed.nombre_medicamento}
                  onChange={(e) => setFormMed({ ...formMed, nombre_medicamento: e.target.value })}
                  placeholder="Ej. Tylenol 500mg"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#497dfe]"
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
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#497dfe]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Presentación</label>
                  <input
                    type="text"
                    value={formMed.formato}
                    onChange={(e) => setFormMed({ ...formMed, formato: e.target.value })}
                    placeholder="Ej. Tabletas, Jarabe"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#497dfe]"
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
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#497dfe]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Unidad</label>
                  <select
                    value={formMed.unidad}
                    onChange={(e) => setFormMed({ ...formMed, unidad: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#497dfe]"
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
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#497dfe]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalAgregar(false)}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Registrar en Botiquín
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
