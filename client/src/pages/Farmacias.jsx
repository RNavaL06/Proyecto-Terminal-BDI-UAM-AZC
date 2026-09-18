import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import api from '../services/api';
import toast from 'react-hot-toast';
import BuscadorDirecciones from '../components/farmacias/BuscadorDirecciones';
import { 
  MapPin, 
  Search, 
  Navigation, 
  ExternalLink, 
  ShoppingBag, 
  Clock, 
  Phone, 
  ChevronRight,
  Pill,
  Sparkles,
  Star
} from 'lucide-react';

// Iconos personalizados de Leaflet (Estilo SVG de Proyecto Terminal Ricardo)
const svgUsuario = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" fill="#3b82f6" fill-opacity="0.3" stroke="#3b82f6" stroke-width="1" /><circle cx="12" cy="12" r="6" fill="#3b82f6" stroke="white" stroke-width="2" /></svg>`;
const iconoUsuario = new L.divIcon({ 
  className: 'bg-transparent', 
  html: `<div style="width: 28px; height: 28px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">${svgUsuario}</div>`, 
  iconSize: [28, 28], 
  iconAnchor: [14, 14], 
  popupAnchor: [0, -14] 
});

const svgFarmacia = `<svg viewBox="0 0 24 24" fill="#10b981" stroke="white" stroke-width="1.5" xmlns="http://www.w3.org/2000/svg"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><path d="M10.5 5.5h3v2.5h2.5v3h-2.5v2.5h-3v-2.5h-2.5v-3h2.5z" fill="white" stroke="none"/></svg>`;
const iconoFarmacia = new L.divIcon({ 
  className: 'bg-transparent', 
  html: `<div style="width: 34px; height: 34px; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));">${svgFarmacia}</div>`, 
  iconSize: [34, 34], 
  iconAnchor: [17, 34], 
  popupAnchor: [0, -34] 
});

// Componente auxiliar para recentrar mapa
function ChangeMapView({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords) {
      map.flyTo([coords.lat, coords.lng], 14, { duration: 1.5 });
    }
  }, [coords, map]);
  return null;
}

export default function Farmacias() {
  // Sección Activa ('precios' o 'mapa')
  const [seccionActiva, setSeccionActiva] = useState('precios');

  // Posición inicial: Ciudad de México (Zócalo / UAM Azcapotzalco)
  const [coords, setCoords] = useState({ lat: 19.5033, lng: -99.1878, nombre: 'UAM Azcapotzalco / CDMX' });
  const [farmacias, setFarmacias] = useState([]);
  const [cargandoFarmacias, setCargandoFarmacias] = useState(false);


  // Cotización de Precios
  const [terminoPrecios, setTerminoPrecios] = useState('');
  const [precios, setPrecios] = useState([]);
  const [buscandoPrecios, setBuscandoPrecios] = useState(false);
  const [historialCotizaciones, setHistorialCotizaciones] = useState([]);

  // Cargar historial de cotizaciones al montar
  useEffect(() => {
    const cargarHistorial = async () => {
      try {
        const res = await api.get('/farmacias/historial');
        if (res.data) setHistorialCotizaciones(res.data);
      } catch (e) {
        // Silencioso si no hay sesión activa
      }
    };
    cargarHistorial();
  }, []);

  // Buscar farmacias cercanas cuando cambien las coordenadas
  const cargarFarmacias = async (lat, lng) => {
    setCargandoFarmacias(true);
    try {
      const res = await api.post('/farmacias/cercanas', { lat, lng });
      if (res.data) setFarmacias(res.data);
    } catch (err) {
      toast.error('Error al localizar farmacias cercanas.');
    } finally {
      setCargandoFarmacias(false);
    }
  };

  useEffect(() => {
    cargarFarmacias(coords.lat, coords.lng);
  }, []);

  // Ubicación por GPS
  const handleUsarGPS = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocalización no soportada por el navegador.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const nuevasCoords = { 
          lat: pos.coords.latitude, 
          lng: pos.coords.longitude,
          nombre: 'Tu ubicación GPS actual'
        };
        setCoords(nuevasCoords);
        cargarFarmacias(nuevasCoords.lat, nuevasCoords.lng);
        toast.success('Ubicación GPS obtenida con éxito.');
      },
      (err) => {
        toast.error('No se pudo obtener la ubicación GPS. Puedes buscar por dirección.');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Selección de dirección desde el BuscadorDirecciones (manual, enter, o voz)
  const handleSeleccionarUbicacion = (lat, lng, direccion) => {
    const nuevasCoords = { lat, lng, nombre: direccion };
    setCoords(nuevasCoords);
    cargarFarmacias(lat, lng);
    toast.success(`Ubicación establecida: ${direccion || 'Coordenadas seleccionadas'}`);
  };

  // Cotizar medicamento con SerpApi (Google Shopping México)
  const handleCotizarPrecios = async (medicamentoAconsultar) => {
    const med = medicamentoAconsultar || terminoPrecios;
    if (!med || !med.trim()) {
      toast.error('Escribe el nombre de un medicamento para cotizar.');
      return;
    }

    setBuscandoPrecios(true);
    setPrecios([]);
    try {
      const res = await api.post('/farmacias/buscar', { medicamento: med.trim() });
      if (res.data) {
        setPrecios(res.data);
        toast.success(`Se encontraron ${res.data.length} ofertas para ${med}.`);
      }
    } catch (err) {
      toast.error(err.message || 'Error al cotizar precios.');
    } finally {
      setBuscandoPrecios(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-6 animate-fade-in">
      
      {/* Encabezado */}
      <div className="text-center space-y-1">
        <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#497dfe]">
          Geolocalización y Ahorro
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Farmacias y Comparativa de Precios
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
          Compara precios en comercios farmacéuticos de México o localiza sucursales cercanas en mapa.
        </p>
      </div>

      {/* Selector de Modo (Tabs estilo Ricardo) */}
      <div className="flex bg-white p-1 rounded-full max-w-xs sm:max-w-sm mx-auto w-full shadow-sm border border-slate-100">
        <button
          type="button"
          onClick={() => setSeccionActiva('precios')}
          className={`flex-1 py-2 px-3 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold transition-all ${
            seccionActiva === 'precios'
              ? 'bg-blue-50 text-[#497dfe] shadow-sm'
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
              ? 'bg-blue-50 text-[#497dfe] shadow-sm'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <MapPin className="w-3.5 h-3.5 mr-1.5" />
          Mapa de Sucursales
        </button>
      </div>

      {/* SECCIÓN 1: Cotizador de Precios (Google Shopping) */}
      {seccionActiva === 'precios' && (
        <div className="card space-y-4 p-5 sm:p-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#497dfe]" /> Comparativa de Precios en Farmacias
            </h2>
            <span className="text-[10px] sm:text-xs text-slate-400">Google Shopping MX</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={terminoPrecios}
                onChange={(e) => setTerminoPrecios(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCotizarPrecios()}
                placeholder="Ej. Paracetamol 500mg, Amoxil, Ibuprofeno..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#497dfe] focus:bg-white"
              />
            </div>

            <button
              type="button"
              onClick={() => handleCotizarPrecios()}
              disabled={buscandoPrecios || !terminoPrecios.trim()}
              className="btn-rose py-2.5 px-6 w-full sm:w-auto text-xs sm:text-sm font-bold shadow-md"
            >
              {buscandoPrecios ? 'Buscando...' : 'Cotizar Precios'}
            </button>
          </div>

          {/* Atajos de Historial Reciente */}
          {historialCotizaciones.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
              <span className="text-slate-400 font-bold text-[11px]">Búsquedas:</span>
              {historialCotizaciones.slice(0, 4).map((h) => (
                <button
                  key={h.id_busqueda}
                  type="button"
                  onClick={() => {
                    setTerminoPrecios(h.medicamento_nombre);
                    handleCotizarPrecios(h.medicamento_nombre);
                  }}
                  className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-[#497dfe] text-[11px] font-medium transition-colors"
                >
                  {h.medicamento_nombre}
                </button>
              ))}
            </div>
          )}

          {/* Tarjetas de Precios Normalizados */}
          {precios.length > 0 ? (
            <div className="pt-3 space-y-3">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Ofertas Comerciales Encontradas ({precios.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {precios.map((oferta, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl border border-slate-200/90 bg-white hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start gap-3">
                        {oferta.thumbnail ? (
                          <img
                            src={oferta.thumbnail}
                            alt={oferta.title}
                            className="w-12 h-12 rounded-xl object-contain bg-slate-50 border border-slate-100 flex-shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 flex-shrink-0">
                            <Pill className="w-6 h-6" />
                          </div>
                        )}
                        <div>
                          <h4 className="font-bold text-xs text-slate-800 line-clamp-2" title={oferta.title}>
                            {oferta.title}
                          </h4>
                          <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-semibold">
                            {oferta.source || 'Tienda en línea'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <span className="text-base font-black text-[#497dfe]">
                        {oferta.price || '$ --'}
                      </span>
                      {oferta.link && (
                        <a
                          href={oferta.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-bold text-slate-500 hover:text-[#497dfe] flex items-center gap-1 transition-colors"
                        >
                          Ver oferta <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : !buscandoPrecios && (
            <div className="py-10 text-center text-slate-400 space-y-2">
              <ShoppingBag className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-xs">Escribe el nombre de un medicamento para cotizar precios en farmacias.</p>
            </div>
          )}
        </div>
      )}

      {/* SECCIÓN 2: Mapa y Geolocalización (GPS + Geoapify) */}
      {seccionActiva === 'mapa' && (
        <div className="card space-y-4 p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-500" /> Farmacias en el Mapa
              </h2>
              <p className="text-xs text-slate-400">Localiza sucursales cercanas con cálculo de distancia.</p>
            </div>

            <button
              type="button"
              onClick={handleUsarGPS}
              className="btn-secondary py-2 px-3.5 text-xs font-bold self-start sm:self-auto flex items-center gap-1.5"
            >
              <Navigation className="w-3.5 h-3.5 text-[#497dfe]" /> Usar mi GPS
            </button>
          </div>

          {/* Buscador de Direcciones Avanzado (Sugerencias en vivo, Botón Buscar, Tecla Enter y Dictado por Voz) */}
          <BuscadorDirecciones 
            onSeleccion={handleSeleccionarUbicacion} 
            cargandoExterno={cargandoFarmacias} 
          />

          {/* Mapa Leaflet estilo CARTO Positron de Ricardo */}
          <div className="relative rounded-3xl overflow-hidden border border-slate-200 h-[380px] sm:h-[480px] shadow-lg">
            <MapContainer
              center={[coords.lat, coords.lng]}
              zoom={14}
              scrollWheelZoom={false}
              className="w-full h-full"
            >
              <ChangeMapView coords={coords} />
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://www.geoapify.com/">Geoapify</a>'
                url={`https://maps.geoapify.com/v1/tile/positron/{z}/{x}/{y}.png?apiKey=${import.meta.env.VITE_GEOAPIFY_API_KEY || '5d49805e7b124e2f915289c504e631de'}`}
              />

              {/* Marcador del Usuario con Tooltip permanente */}
              <Marker position={[coords.lat, coords.lng]} icon={iconoUsuario}>
                <Tooltip 
                  permanent 
                  direction="right" 
                  offset={[12, 0]} 
                  className="tooltip-transparente font-extrabold text-blue-600 text-sm whitespace-nowrap"
                >
                  {coords.nombre ? (coords.nombre.length > 25 ? coords.nombre.substring(0, 25) + '...' : coords.nombre) : 'Tu ubicación actual'}
                </Tooltip>
                <Popup className="popup-google">
                  <div className="p-3 font-sans text-xs space-y-1">
                    <strong className="text-slate-900 text-sm block">Tu Ubicación</strong>
                    <p className="text-slate-500">Punto de referencia para el cálculo de distancias de farmacias.</p>
                    {coords.nombre && (
                      <p className="text-[11px] text-[#497dfe] font-medium pt-1 border-t border-slate-100">{coords.nombre}</p>
                    )}
                  </div>
                </Popup>
              </Marker>

              {/* Marcadores de Farmacias con Tooltip y Popup Google Maps de Ricardo */}
              {farmacias.map((farmacia) => {
                const nombreCorto = farmacia.nombre.length > 18 
                  ? farmacia.nombre.substring(0, 18) + '...' 
                  : farmacia.nombre;

                return (
                  <Marker
                    key={farmacia.id}
                    position={[farmacia.lat, farmacia.lng]}
                    icon={iconoFarmacia}
                  >
                    <Tooltip 
                      permanent 
                      direction="right" 
                      offset={[15, -15]} 
                      className="tooltip-transparente font-extrabold text-emerald-800 text-sm whitespace-nowrap"
                    >
                      {nombreCorto}
                    </Tooltip>

                    {/* Popup Tarjeta Google Maps de Ricardo */}
                    <Popup className="popup-google">
                      <div className="flex flex-col w-full bg-white font-sans">
                        
                        {/* 1. Imagen de Portada */}
                        <div className="h-24 w-full bg-slate-200 relative overflow-hidden">
                          <img 
                            src={farmacia.thumbnail || "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=300&h=120&q=80"} 
                            alt={farmacia.nombre} 
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* 2. Cuerpo de la Tarjeta */}
                        <div className="p-4 relative">
                          
                          {/* Botón Circular Flotante (Cómo llegar con Google Maps) */}
                          <div className="absolute -top-6 right-3">
                            <a 
                              href={`https://www.google.com/maps/dir/?api=1&origin=${coords.lat},${coords.lng}&destination=${farmacia.lat},${farmacia.lng}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-11 h-11 bg-blue-100 hover:bg-blue-200 flex items-center justify-center rounded-full shadow-md border-2 border-white transition-colors"
                              title="Cómo llegar con Google Maps"
                            >
                              <Navigation className="w-5 h-5 text-blue-700" />
                            </a>
                          </div>

                          {/* Título Principal y Puntuación (Estilo Cristian) */}
                          <div className="pr-10 mb-1">
                            <h3 className="font-bold text-gray-800 text-sm sm:text-base leading-tight">
                              {farmacia.nombre}
                            </h3>
                            {farmacia.rating != null && (
                              <div className="flex items-center gap-1 mt-1">
                                <span className="inline-flex items-center gap-1 font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full text-[10px]">
                                  <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                                  {farmacia.rating.toFixed(1)}
                                  {farmacia.reviews != null && (
                                    <span className="text-slate-400 font-normal">({farmacia.reviews})</span>
                                  )}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Estatus y Horario Abierto / Cerrado (Estilo Cristian) */}
                          <div className="text-xs mb-2">
                            {farmacia.abierto ? (
                              farmacia.abierto.toLowerCase().includes('abierto') ? (
                                <span className="inline-flex items-center gap-1.5 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[11px] border border-emerald-200">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                  {farmacia.abierto}
                                </span>
                              ) : farmacia.abierto.toLowerCase().includes('cerrado') ? (
                                <span className="inline-flex items-center gap-1.5 font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full text-[11px] border border-rose-200">
                                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                                  {farmacia.abierto}
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-slate-600 text-[11px]">
                                  <Clock className="w-3 h-3 text-slate-400" /> {farmacia.abierto}
                                </span>
                              )
                            ) : (
                              <span className="inline-flex items-center gap-1 text-slate-500 text-[11px]">
                                <Clock className="w-3 h-3 text-slate-400" /> {farmacia.horario || 'Consulta horario'}
                              </span>
                            )}
                          </div>

                          {/* Dirección, Distancia y Teléfono */}
                          <div className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-100 flex flex-col gap-1.5">
                            {farmacia.direccion && (
                              <p className="line-clamp-2 text-slate-600 leading-snug">{farmacia.direccion}</p>
                            )}
                            {farmacia.distanciaMetros && (
                              <span className="flex items-center gap-1 text-[#497dfe] font-semibold">
                                <MapPin className="w-3.5 h-3.5 flex-shrink-0" /> A {Math.round(farmacia.distanciaMetros)} metros de ti
                              </span>
                            )}
                            {farmacia.telefono && (
                              <span className="flex items-center gap-1 text-slate-500">
                                <Phone className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" /> {farmacia.telefono}
                              </span>
                            )}
                          </div>

                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>

          {/* Resumen de Farmacias Encontradas */}
          <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
            <span>{farmacias.length} farmacias en el radio de 3 km.</span>
            <span className="flex items-center gap-2">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-sky-600 inline-block"></span> Tu ubicación</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span> Farmacia</span>
            </span>
          </div>

          {/* Listado de Sucursales Cercanas con Horario y Puntuación (Estilo Cristian + Ricardo) */}
          {farmacias.length > 0 && (
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#497dfe]" /> Sucursales en tu zona ({farmacias.length})
                </h3>
                <span className="text-[11px] text-slate-400">Ordenadas por distancia</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {farmacias.slice(0, 8).map((f) => (
                  <div
                    key={f.id}
                    className="p-4 rounded-2xl border border-slate-200/90 bg-white hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-sm text-slate-900 leading-snug truncate" title={f.nombre}>
                          {f.nombre}
                        </h4>
                        {f.direccion && (
                          <p className="text-xs text-slate-500 truncate mt-0.5" title={f.direccion}>
                            {f.direccion}
                          </p>
                        )}
                      </div>

                      {/* Puntuación / Rating (Estilo Cristian) */}
                      {f.rating != null && (
                        <span className="flex-shrink-0 inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                          {f.rating.toFixed(1)}
                        </span>
                      )}
                    </div>

                    {/* Horario de Abierto / Cerrado (Estilo Cristian) */}
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      {f.abierto ? (
                        f.abierto.toLowerCase().includes('abierto') ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            {f.abierto}
                          </span>
                        ) : f.abierto.toLowerCase().includes('cerrado') ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                            {f.abierto}
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[11px] flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" /> {f.abierto}
                          </span>
                        )
                      ) : (
                        <span className="text-slate-500 text-[11px] flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" /> {f.horario || 'Consulta horario'}
                        </span>
                      )}

                      {f.distanciaMetros && (
                        <span className="text-[11px] font-semibold text-[#497dfe] ml-auto">
                          a {Math.round(f.distanciaMetros)} m
                        </span>
                      )}
                    </div>

                    {/* Acciones: Cómo llegar y Teléfono */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-50 text-xs">
                      {f.telefono ? (
                        <a
                          href={`tel:${f.telefono}`}
                          className="text-slate-600 hover:text-[#497dfe] flex items-center gap-1 font-medium text-[11px]"
                        >
                          <Phone className="w-3 h-3 text-emerald-500" /> {f.telefono}
                        </a>
                      ) : (
                        <span className="text-[11px] text-slate-400">Sin teléfono</span>
                      )}

                      <a
                        href={`https://www.google.com/maps/dir/?api=1&origin=${coords.lat},${coords.lng}&destination=${f.lat},${f.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#497dfe] hover:underline font-bold flex items-center gap-1 text-[11px]"
                      >
                        <Navigation className="w-3 h-3" /> Cómo llegar
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
