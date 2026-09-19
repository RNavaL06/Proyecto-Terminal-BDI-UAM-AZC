import { Search, Mic, MicOff, Filter, Pill, ExternalLink, ShoppingBag } from 'lucide-react';

export default function BuscadorPrecios({
  terminoPrecios,
  setTerminoPrecios,
  handleCotizarPrecios,
  buscandoPrecios,
  listening,
  toggleVoz,
  historialCotizaciones,
  precios,
  ordenPrecio,
  setOrdenPrecio
}) {
  return (
    <div className="card space-y-4 p-5 sm:p-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-[#4f83f5]" /> Comparativa de Precios en Farmacias
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
            className="w-full pl-10 pr-12 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#4f83f5] focus:bg-white"
          />
          <button
            type="button"
            onClick={toggleVoz}
            className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full transition-colors ${
              listening ? 'bg-rose-100 text-rose-600' : 'text-slate-400 hover:text-[#4f83f5] hover:bg-blue-50'
            }`}
            title={listening ? 'Detener dictado' : 'Dictar por voz'}
          >
            {listening ? <Mic className="w-4 h-4 animate-pulse" /> : <MicOff className="w-4 h-4" />}
          </button>
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
              className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-[#4f83f5] text-[11px] font-medium transition-colors"
            >
              {h.medicamento_nombre}
            </button>
          ))}
        </div>
      )}

      {precios.length > 0 ? (
        <div className="pt-3 space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Ofertas Comerciales Encontradas ({precios.length})
            </h3>
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={ordenPrecio}
                onChange={(e) => setOrdenPrecio(e.target.value)}
                className="bg-transparent text-xs sm:text-sm font-semibold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="popularidad">Relevancia (Popularidad)</option>
                <option value="precio_menor">Menor a Mayor Precio</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[...precios].sort((a, b) => {
              if (ordenPrecio === 'precio_menor') {
                const priceA = parseFloat(a.price.replace(/[^0-9.]/g, '')) || 0;
                const priceB = parseFloat(b.price.replace(/[^0-9.]/g, '')) || 0;
                return priceA - priceB;
              }
              return 0;
            }).map((oferta, idx) => (
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
                  <span className="text-base font-black text-[#4f83f5]">
                    {oferta.price || '$ --'}
                  </span>
                  {oferta.link && (
                    <a
                      href={oferta.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-slate-500 hover:text-[#4f83f5] flex items-center gap-1 transition-colors"
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
  );
}
