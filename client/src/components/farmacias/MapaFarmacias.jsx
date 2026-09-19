import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Navigation, Star, Clock, Phone, Store } from 'lucide-react';
import BuscadorDirecciones from './BuscadorDirecciones';

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

function ChangeMapView({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords) {
      map.flyTo([coords.lat, coords.lng], 14, { duration: 1.5 });
    }
  }, [coords, map]);
  return null;
}

export default function MapaFarmacias({
  coords,
  farmacias,
  handleUsarGPS,
  handleSeleccionarUbicacion,
  cargandoFarmacias
}) {
  return (
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
          <Navigation className="w-3.5 h-3.5 text-[#4f83f5]" /> Usar mi GPS
        </button>
      </div>

      <BuscadorDirecciones
        onSeleccion={handleSeleccionarUbicacion}
        cargandoExterno={cargandoFarmacias}
      />

      <div className="relative z-0 rounded-3xl overflow-hidden border border-slate-200 h-[380px] sm:h-[480px] shadow-lg">
        <MapContainer
          center={[coords.lat, coords.lng]}
          zoom={14}
          scrollWheelZoom={false}
          className="w-full h-full"
        >
          <ChangeMapView coords={coords} />
          <TileLayer
            attribution='&copy; OpenStreetMap &copy; Geoapify'
            url={`https://maps.geoapify.com/v1/tile/positron/{z}/{x}/{y}.png?apiKey=${import.meta.env.VITE_GEOAPIFY_API_KEY || '5d49805e7b124e2f915289c504e631de'}`}
          />

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
                  <p className="text-[11px] text-[#4f83f5] font-medium pt-1 border-t border-slate-100">{coords.nombre}</p>
                )}
              </div>
            </Popup>
          </Marker>

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

                <Popup className="popup-google">
                  <div className="flex flex-col w-full bg-white font-sans">
                    <div className="h-24 w-full bg-emerald-50 relative overflow-hidden flex flex-col items-center justify-center border-b border-emerald-100">
                      {farmacia.thumbnail ? (
                        <img
                          src={farmacia.thumbnail}
                          alt={farmacia.nombre}
                          className="w-full h-full object-cover absolute inset-0"
                        />
                      ) : (
                        <>
                          <Store className="w-8 h-8 text-emerald-300 mb-1" />
                          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Farmacia</span>
                        </>
                      )}
                    </div>

                    <div className="p-4 relative">
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

                      <div className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-100 flex flex-col gap-1.5">
                        {farmacia.direccion && (
                          <p className="line-clamp-2 text-slate-600 leading-snug">{farmacia.direccion}</p>
                        )}
                        {farmacia.distanciaMetros && (
                          <span className="flex items-center gap-1 text-[#4f83f5] font-semibold">
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

      <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
        <span>{farmacias.length} farmacias en el radio de 3 km.</span>
        <span className="flex items-center gap-2">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-sky-600 inline-block"></span> Tu ubicación</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span> Farmacia</span>
        </span>
      </div>

      {farmacias.length > 0 && (
        <div className="space-y-3 pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#4f83f5]" /> Sucursales en tu zona ({farmacias.length})
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

                  {f.rating != null && (
                    <span className="flex-shrink-0 inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                      {f.rating.toFixed(1)}
                    </span>
                  )}
                </div>

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
                    <span className="text-[11px] font-semibold text-[#4f83f5] ml-auto">
                      a {Math.round(f.distanciaMetros)} m
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-50 text-xs">
                  {f.telefono ? (
                    <a
                      href={`tel:${f.telefono}`}
                      className="text-slate-600 hover:text-[#4f83f5] flex items-center gap-1 font-medium text-[11px]"
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
                    className="text-[#4f83f5] hover:underline font-bold flex items-center gap-1 text-[11px]"
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
  );
}
