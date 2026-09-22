import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

export const useFarmacias = () => {
  const [seccionActiva, setSeccionActiva] = useState('precios');
  
  // Estado del Mapa
  const [coords, setCoords] = useState(() => {
    const savedCoords = localStorage.getItem('bdi_last_location');
    if (savedCoords) {
      try {
        return JSON.parse(savedCoords);
      } catch (e) {
        // Ignorar error de parseo
      }
    }
    return null;
  });

  useEffect(() => {
    localStorage.setItem('bdi_last_location', JSON.stringify(coords));
  }, [coords]);
  const [farmacias, setFarmacias] = useState([]);
  const [cargandoFarmacias, setCargandoFarmacias] = useState(false);

  // Estado de Precios
  const [terminoPrecios, setTerminoPrecios] = useState('');
  const [precios, setPrecios] = useState([]);
  const [buscandoPrecios, setBuscandoPrecios] = useState(false);
  const [historialCotizaciones, setHistorialCotizaciones] = useState([]);
  const [ordenPrecio, setOrdenPrecio] = useState('popularidad');

  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();

  useEffect(() => {
    if (seccionActiva === 'precios' && listening && transcript) {
      setTerminoPrecios(transcript);
    }
  }, [transcript, listening, seccionActiva]);

  useEffect(() => {
    if (seccionActiva === 'precios' && !listening && transcript && terminoPrecios === transcript) {
      handleCotizarPrecios(transcript);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listening, seccionActiva]);

  const toggleVoz = () => {
    if (!browserSupportsSpeechRecognition) {
      toast.error('Tu navegador no soporta reconocimiento de voz.');
      return;
    }
    if (listening) {
      SpeechRecognition.stopListening();
    } else {
      resetTranscript();
      SpeechRecognition.startListening({ continuous: false, language: 'es-MX' });
    }
  };

  useEffect(() => {
    const cargarHistorial = async () => {
      try {
        const res = await api.get('/farmacias/historial');
        if (res.data) setHistorialCotizaciones(res.data);
      } catch (e) {
        // Silencioso
      }
    };
    cargarHistorial();
  }, []);

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

  const handleUsarGPS = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocalización no soportada por el navegador.');
      const fallback = { lat: 19.4326, lng: -99.1332, nombre: 'Ciudad de México (Centro)' };
      setCoords(fallback);
      cargarFarmacias(fallback.lat, fallback.lng);
      return;
    }

    const toastId = toast.loading('Obteniendo ubicación GPS precisa...');

    const obtenerPosicion = (opts) =>
      new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, opts);
      });

    (async () => {
      let pos;
      try {
        pos = await obtenerPosicion({ enableHighAccuracy: true, timeout: 9000, maximumAge: 0 });
      } catch (errHigh) {
        console.warn('GPS alta precisión falló o demoró, intentando precisión estándar...', errHigh);
        try {
          pos = await obtenerPosicion({ enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 });
        } catch (errFallback) {
          throw errFallback;
        }
      }

      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      const accuracy = pos.coords.accuracy;

      let direccionLegible = `Ubicación GPS (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
      try {
        const res = await api.get(`/farmacias/reversa?lat=${lat}&lng=${lng}`);
        if (res.data?.direccionFormateada) {
          direccionLegible = res.data.direccionFormateada;
        }
      } catch (e) {
        console.warn('Error en reverse geocoding:', e);
      }

      const nuevasCoords = {
        lat,
        lng,
        nombre: direccionLegible,
      };

      setCoords(nuevasCoords);
      cargarFarmacias(lat, lng);

      if (accuracy && accuracy > 800) {
        toast.success(
          `GPS aproximado (~${Math.round(accuracy)}m). Puedes afinar haciendo clic en el mapa.`,
          { id: toastId, duration: 6000 }
        );
      } else {
        toast.success('Ubicación GPS detectada con éxito.', { id: toastId });
      }
    })().catch((error) => {
      console.error('Error al obtener GPS:', error);
      let msg = 'No se pudo obtener la ubicación GPS.';
      if (error?.code === 1) {
        msg = 'Permiso de ubicación denegado en tu navegador. Puedes escribir tu dirección en el buscador.';
      } else if (error?.code === 2) {
        msg = 'Señal de ubicación no disponible. Puedes buscar tu colonia o alcaldía en la barra.';
      } else if (error?.code === 3) {
        msg = 'Tiempo de espera de GPS agotado. Escribe tu calle o colonia para localizar farmacias.';
      }
      toast.error(msg, { id: toastId, duration: 6000 });
      
      // Fallback
      const fallback = { lat: 19.4326, lng: -99.1332, nombre: 'Ciudad de México (Centro)' };
      setCoords(fallback);
      cargarFarmacias(fallback.lat, fallback.lng);
    });
  };

  useEffect(() => {
    if (coords) {
      cargarFarmacias(coords.lat, coords.lng);
    } else {
      handleUsarGPS();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);



  const handleMoverUbicacion = async (lat, lng) => {
    let direccionLegible = `Ubicación ajustada (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
    try {
      const res = await api.get(`/farmacias/reversa?lat=${lat}&lng=${lng}`);
      if (res.data?.direccionFormateada) {
        direccionLegible = res.data.direccionFormateada;
      }
    } catch (e) {
      console.warn('Error en reverse geocoding al mover:', e);
    }

    const nuevasCoords = { lat, lng, nombre: direccionLegible };
    setCoords(nuevasCoords);
    cargarFarmacias(lat, lng);
    toast.success('Ubicación actualizada en el mapa.');
  };

  const handleSeleccionarUbicacion = (lat, lng, direccion) => {
    const nuevasCoords = { lat, lng, nombre: direccion };
    setCoords(nuevasCoords);
    cargarFarmacias(lat, lng);
    toast.success(`Ubicación establecida: ${direccion || 'Coordenadas seleccionadas'}`);
  };

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

  return {
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
  };
};
