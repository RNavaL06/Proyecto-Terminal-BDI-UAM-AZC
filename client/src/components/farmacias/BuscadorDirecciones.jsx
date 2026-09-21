import React, { useState, useEffect, useRef } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Search, Loader2, MapPin, Mic, MicOff, X } from 'lucide-react';

/**
 * Componente BuscadorDirecciones
 * Permite buscar direcciones en México con autocompletado en tiempo real (debounced),
 * ejecución por botón "Buscar", ejecución con tecla Enter, y dictado por voz (Speech-to-Text).
 */
export default function BuscadorDirecciones({ onSeleccion, cargandoExterno = false, direccionActual = '' }) {
  const [query, setQuery] = useState(direccionActual && direccionActual !== 'UAM Azcapotzalco / CDMX' ? direccionActual : '');
  const [resultados, setResultados] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [mostrarDropdown, setMostrarDropdown] = useState(false);
  const [permisoVozDenegado, setPermisoVozDenegado] = useState(false);

  const ignorarBusqueda = useRef(false);
  const contenedorRef = useRef(null);

  // Hook de reconocimiento de voz de navegador
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  // Sincronizar campo cuando la dirección cambie por GPS o selección externa
  useEffect(() => {
    if (direccionActual && direccionActual !== 'UAM Azcapotzalco / CDMX') {
      ignorarBusqueda.current = true;
      setQuery(direccionActual);
    }
  }, [direccionActual]);

  // Actualizar el query cuando se detecte voz
  useEffect(() => {
    if (listening && transcript) {
      setQuery(transcript);
    }
  }, [transcript, listening]);

  // Si el usuario deja de hablar, mantener el texto y permitir que el debounce busque
  useEffect(() => {
    if (!listening && transcript && query === transcript) {
      // Búsqueda automática una vez terminado el dictado
      buscarDireccionManual(transcript);
    }
  }, [listening]);

  // Cerrar dropdown al hacer click fuera del componente
  useEffect(() => {
    const handleClickAfuera = (event) => {
      if (contenedorRef.current && !contenedorRef.current.contains(event.target)) {
        setMostrarDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickAfuera);
    return () => document.removeEventListener('mousedown', handleClickAfuera);
  }, []);

  // Debounce en tiempo real al escribir
  useEffect(() => {
    if (ignorarBusqueda.current) {
      ignorarBusqueda.current = false;
      return;
    }

    if (!query.trim() || query.trim().length < 3) {
      setResultados([]);
      setMostrarDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setCargando(true);
      try {
        const res = await api.get(`/farmacias/autocompletar?texto=${encodeURIComponent(query.trim())}`);
        const data = res.data || [];
        setResultados(data);
        if (data.length > 0) {
          setMostrarDropdown(true);
        }
      } catch (err) {
        console.error('Error al autocompletar dirección:', err);
      } finally {
        setCargando(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  // Seleccionar una dirección sugerida
  const handleSelect = (sugerencia) => {
    ignorarBusqueda.current = true;
    setQuery(sugerencia.direccionFormateada);
    setResultados([]);
    setMostrarDropdown(false);

    if (listening) {
      SpeechRecognition.stopListening();
    }

    if (onSeleccion) {
      onSeleccion(sugerencia.lat, sugerencia.lng, sugerencia.direccionFormateada);
    }
  };

  // Búsqueda inmediata (Botón "Buscar" o Tecla "Enter")
  const buscarDireccionManual = async (textoABuscar) => {
    const texto = (textoABuscar || query).trim();
    if (!texto) {
      toast.error('Por favor escribe o dicta una dirección.');
      return;
    }

    if (listening) {
      SpeechRecognition.stopListening();
    }

    // Si ya tenemos sugerencias visibles y la primera es relevante, tomarla
    if (resultados.length > 0) {
      handleSelect(resultados[0]);
      return;
    }

    // Búsqueda forzada inmediata en el servidor
    setCargando(true);
    setMostrarDropdown(false);
    try {
      const res = await api.get(`/farmacias/autocompletar?texto=${encodeURIComponent(texto)}`);
      const data = res.data || [];

      if (data.length > 0) {
        handleSelect(data[0]);
        toast.success('Ubicación encontrada en el mapa');
      } else {
        toast.error(`No se encontraron resultados para "${texto}". Intenta ser más específico (colonia, alcaldía o código postal).`);
      }
    } catch (err) {
      console.error(err);
      toast.error('Error al buscar la dirección especificada.');
    } finally {
      setCargando(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      buscarDireccionManual();
    }
  };

  // Alternar dictado por voz
  const toggleDictadoVoz = () => {
    if (!browserSupportsSpeechRecognition) {
      toast.error('Tu navegador no soporta reconocimiento de voz nativo. Utiliza Google Chrome o Microsoft Edge.');
      return;
    }

    if (listening) {
      SpeechRecognition.stopListening();
    } else {
      setPermisoVozDenegado(false);
      resetTranscript();
      setQuery('');
      setResultados([]);
      SpeechRecognition.startListening({ continuous: false, language: 'es-MX' });
      toast('Escuchando tu dirección...', { icon: '🎙️' });
    }
  };

  const limpiarInput = () => {
    setQuery('');
    setResultados([]);
    setMostrarDropdown(false);
    resetTranscript();
    if (listening) SpeechRecognition.stopListening();
  };

  return (
    <div ref={contenedorRef} className="relative w-full z-[1000]">
      {/* Barra de Búsqueda con Botones Integrados */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1 flex items-center">
          {/* Icono izquierdo / Loader */}
          <div className="absolute left-3.5 text-slate-400 pointer-events-none z-10">
            {cargando || cargandoExterno ? (
              <Loader2 className="w-4 h-4 text-[#4f83f5] animate-spin" />
            ) : (
              <Search className="w-4 h-4 text-slate-400" />
            )}
          </div>

          {/* Campo de Entrada */}
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (!mostrarDropdown && resultados.length > 0) setMostrarDropdown(true);
            }}
            onFocus={() => {
              if (resultados.length > 0) setMostrarDropdown(true);
            }}
            onKeyDown={handleKeyDown}
            placeholder={
              listening
                ? 'Escuchando... habla ahora'
                : '¿Sin GPS? Escribe calle, colonia o alcaldía...'
            }
            className={`w-full pl-10 pr-20 py-2.5 sm:py-3 bg-slate-50 border rounded-2xl text-xs sm:text-sm font-medium text-slate-800 transition-all focus:outline-none focus:bg-white ${
              listening
                ? 'border-rose-400 ring-2 ring-rose-100 bg-rose-50/40'
                : 'border-slate-200 focus:ring-2 focus:ring-[#4f83f5]'
            }`}
          />

          {/* Acciones del Input (Limpiar + Micrófono) */}
          <div className="absolute right-2.5 flex items-center gap-1">
            {query && (
              <button
                type="button"
                onClick={limpiarInput}
                title="Borrar texto"
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Botón de Dictado de Voz */}
            <button
              type="button"
              onClick={toggleDictadoVoz}
              title={
                listening
                  ? 'Detener dictado por voz'
                  : 'Dictar dirección por voz'
              }
              className={`p-1.5 rounded-full transition-all relative ${
                listening
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-200 ring-2 ring-rose-300'
                  : permisoVozDenegado
                  ? 'text-slate-300 hover:text-slate-400'
                  : 'text-slate-400 hover:text-[#4f83f5] hover:bg-blue-50'
              }`}
            >
              {listening ? (
                <>
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-rose-600 rounded-full animate-ping"></span>
                  <Mic className="w-4 h-4 animate-pulse" />
                </>
              ) : permisoVozDenegado ? (
                <MicOff className="w-4 h-4 text-slate-300" />
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Botón Buscar Manual */}
        <button
          type="button"
          onClick={() => buscarDireccionManual()}
          disabled={cargando || !query.trim()}
          className="btn-rose py-2.5 sm:py-3 px-5 rounded-2xl text-xs sm:text-sm font-bold shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {cargando ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
          <span>Buscar</span>
        </button>
      </div>

      {/* Indicador de Escucha Activa por Voz */}
      {listening && (
        <div className="mt-1.5 px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2 text-xs animate-fade-in shadow-sm">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
          <span className="font-bold">Dictado activo:</span>
          <span className="truncate italic">
            {transcript ? `"${transcript}"` : 'Habla claramente (ej. "Avenida Insurgentes Sur 1200")...'}
          </span>
        </div>
      )}

      {/* Menú Flotante de Sugerencias Predictivas (Alta visibilidad con z-[10000]) */}
      {mostrarDropdown && resultados.length > 0 && (
        <ul className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden divide-y divide-slate-100 z-[10000] max-h-72 overflow-y-auto animate-fade-in">
          <li className="px-4 py-1.5 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Sugerencias de Direcciones ({resultados.length})
          </li>
          {resultados.map((dir) => (
            <li
              key={dir.id}
              onClick={() => handleSelect(dir)}
              className="px-4 py-2.5 hover:bg-blue-50/80 cursor-pointer flex items-start gap-2.5 transition-colors group"
            >
              <MapPin className="w-4 h-4 text-[#4f83f5] flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-slate-800 font-semibold leading-snug truncate">
                  {dir.direccionFormateada}
                </p>
                <span className="text-[10px] text-slate-400">
                  {dir.lat.toFixed(4)}, {dir.lng.toFixed(4)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
