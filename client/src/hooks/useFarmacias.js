import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

export const useFarmacias = () => {
  const [seccionActiva, setSeccionActiva] = useState('precios');
  
  // Estado del Mapa
  const [coords, setCoords] = useState({ lat: 19.5033, lng: -99.1878, nombre: 'UAM Azcapotzalco / CDMX' });
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
    if (listening && transcript) {
      setTerminoPrecios(transcript);
    }
  }, [transcript, listening]);

  useEffect(() => {
    if (!listening && transcript && terminoPrecios === transcript) {
      handleCotizarPrecios(transcript);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listening]);

  const toggleVoz = async () => {
    if (!browserSupportsSpeechRecognition) {
      toast.error('Tu navegador no soporta reconocimiento de voz.');
      return;
    }
    if (listening) {
      SpeechRecognition.stopListening();
    } else {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        resetTranscript();
        SpeechRecognition.startListening({ continuous: false, language: 'es-MX' });
      } catch (err) {
        toast.error('Permiso de micrófono denegado');
      }
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

  useEffect(() => {
    cargarFarmacias(coords.lat, coords.lng);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      () => {
        toast.error('No se pudo obtener la ubicación GPS. Puedes buscar por dirección.');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
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
    handleSeleccionarUbicacion,
    handleCotizarPrecios
  };
};
