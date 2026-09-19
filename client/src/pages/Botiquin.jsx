import CameraCapture from '../components/recetas/CameraCapture';
import { useBotiquin } from '../hooks/useBotiquin';
import BotiquinFormModal from '../components/botiquin/BotiquinFormModal';
import InventarioList from '../components/botiquin/InventarioList';
import { Pill, Plus, Camera, Search, Box } from 'lucide-react';

export default function Botiquin() {
  const {
    inventario,
    resumen,
    filtroEstado,
    setFiltroEstado,
    busqueda,
    setBusqueda,
    loading,
    modalAgregar,
    modalEscanerCaja,
    setModalEscanerCaja,
    formMed,
    setFormMed,
    editId,
    abrirModalNuevo,
    cerrarModalAgregar,
    handleGuardarMedicamento,
    handleEditar,
    handleEliminar,
    handleEscanearCaja
  } = useBotiquin();

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-6 animate-fade-in">
      
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#4f83f5]">Inventario Doméstico</span>
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
            onClick={abrirModalNuevo}
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
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#4f83f5] focus:bg-white transition-all"
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
                    ? 'bg-[#4f83f5] text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* Listado de Inventario */}
      {loading ? (
        <div className="card py-16 text-center text-slate-400 text-sm">
          Cargando inventario del botiquín...
        </div>
      ) : inventario.length > 0 ? (
        <InventarioList 
          inventario={inventario} 
          onEdit={handleEditar} 
          onDelete={handleEliminar} 
        />
      ) : (
        /* Estado Vacío */
        <div className="card py-12 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-300">
          <div className="relative mb-5">
            <div className="w-24 h-24 sm:w-28 sm:h-28 bg-blue-50 rounded-full flex items-center justify-center shadow-sm">
              <Box className="w-12 h-12 sm:w-14 sm:h-14 text-[#4f83f5]" />
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
              onClick={abrirModalNuevo}
              className="btn-secondary text-xs sm:text-sm py-3 px-6"
            >
              <Plus className="w-4 h-4 mr-1.5" /> Agregar Manual
            </button>
          </div>
        </div>
      )}

      {/* Modales */}
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

      {modalAgregar && (
        <BotiquinFormModal
          formMed={formMed}
          setFormMed={setFormMed}
          editId={editId}
          onSubmit={handleGuardarMedicamento}
          onClose={cerrarModalAgregar}
        />
      )}

    </div>
  );
}
