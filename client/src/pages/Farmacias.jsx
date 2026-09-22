import { ShoppingBag, MapPin } from 'lucide-react';
import { useFarmacias } from '../hooks/useFarmacias';
import BuscadorPrecios from '../components/farmacias/BuscadorPrecios';
import MapaFarmacias from '../components/farmacias/MapaFarmacias';

export default function Farmacias() {
  const {
    seccionActiva,
    setSeccionActiva,
    coords,
    farmacias,
    cargandoFarmacias,
    terminoPrecios,
    setTerminoPrecios,
    precios,
    buscandoPrecios,
    historialCotizaciones,
    ordenPrecio,
    setOrdenPrecio,
    listening,
    toggleVoz,
    handleUsarGPS,
    handleMoverUbicacion,
    handleSeleccionarUbicacion,
    handleCotizarPrecios
  } = useFarmacias();

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-6 animate-fade-in">
      {/* Encabezado */}
      <div className="text-center space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Farmacias y Comparativa de Precios
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
          Encuentra los medicamentos que necesitas al mejor precio o busca las farmacias más cercanas a tu ubicación en el mapa.
        </p>
      </div>

      {/* Selector de Modo */}
      <div className="flex bg-white p-1 rounded-full max-w-xs sm:max-w-sm mx-auto w-full shadow-sm border border-slate-100">
        <button
          type="button"
          onClick={() => setSeccionActiva('precios')}
          className={`flex-1 py-2 px-3 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold transition-all ${
            seccionActiva === 'precios'
              ? 'bg-blue-50 text-[#4f83f5] shadow-sm'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5 mr-1.5" />
          Precios
        </button>
        <button
          type="button"
          onClick={() => setSeccionActiva('mapa')}
          className={`flex-1 py-2 px-3 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold transition-all ${
            seccionActiva === 'mapa'
              ? 'bg-blue-50 text-[#4f83f5] shadow-sm'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <MapPin className="w-3.5 h-3.5 mr-1.5" />
          Mapa de Sucursales
        </button>
      </div>

      {/* SECCIÓN 1: Cotizador de Precios */}
      {seccionActiva === 'precios' && (
        <BuscadorPrecios 
          terminoPrecios={terminoPrecios}
          setTerminoPrecios={setTerminoPrecios}
          handleCotizarPrecios={handleCotizarPrecios}
          buscandoPrecios={buscandoPrecios}
          listening={listening}
          toggleVoz={toggleVoz}
          historialCotizaciones={historialCotizaciones}
          precios={precios}
          ordenPrecio={ordenPrecio}
          setOrdenPrecio={setOrdenPrecio}
        />
      )}

      {/* SECCIÓN 2: Mapa y Geolocalización */}
      {seccionActiva === 'mapa' && coords && (
        <MapaFarmacias 
          coords={coords}
          farmacias={farmacias}
          cargandoFarmacias={cargandoFarmacias}
          handleUsarGPS={handleUsarGPS}
          handleMoverUbicacion={handleMoverUbicacion}
          handleSeleccionarUbicacion={handleSeleccionarUbicacion}
        />
      )}
      {seccionActiva === 'mapa' && !coords && (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-3xl border border-slate-100 shadow-sm min-h-[400px]">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-[#4f83f5] rounded-full animate-spin mb-4"></div>
          <p className="text-slate-500 font-bold text-sm">Obteniendo ubicación GPS...</p>
          <p className="text-slate-400 text-xs mt-1">Por favor, acepta los permisos de ubicación en tu navegador.</p>
        </div>
      )}
    </div>
  );
}
