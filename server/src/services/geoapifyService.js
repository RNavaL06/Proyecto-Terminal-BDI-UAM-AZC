const axios = require('axios');
const config = require('../config/env');

const API_KEY = config.geoapify.apiKey;

/**
 * Busca farmacias cercanas a un punto geográfico utilizando Geoapify Places API.
 * 
 * @param {number} lat - Latitud
 * @param {number} lng - Longitud
 * @param {number} radioMetros - Radio de búsqueda en metros (default 3000)
 */
const buscarFarmaciasCercanas = async (lat, lng, radioMetros = 3000) => {
  if (!API_KEY) {
    console.warn('[Geoapify] API Key no configurada, devolviendo datos simulados locales.');
    return [
      { id: 'f1', nombre: 'Farmacia San Pablo (Sucursal Centro)', lat: Number(lat) + 0.002, lng: Number(lng) + 0.003, distanciaMetros: 350, horario: '24 Horas' },
      { id: 'f2', nombre: 'Farmacias del Ahorro', lat: Number(lat) - 0.003, lng: Number(lng) - 0.002, distanciaMetros: 520, horario: '07:00 - 23:00' },
      { id: 'f3', nombre: 'Farmacias Similares', lat: Number(lat) + 0.005, lng: Number(lng) - 0.004, distanciaMetros: 780, horario: '08:00 - 22:00' },
    ];
  }

  const url = `https://api.geoapify.com/v2/places?categories=healthcare.pharmacy&filter=circle:${lng},${lat},${radioMetros}&bias=proximity:${lng},${lat}&limit=25&apiKey=${API_KEY}`;

  try {
    const response = await axios.get(url, { timeout: 8000 });
    const features = response.data?.features || [];

    const farmacias = features
      .filter((f) => f.properties && f.properties.name)
      .map((f) => ({
        id: f.properties.place_id || String(Math.random()),
        nombre: f.properties.name,
        direccion: f.properties.formatted || f.properties.address_line2 || 'Dirección no especificada',
        lat: f.properties.lat,
        lng: f.properties.lon,
        distanciaMetros: f.properties.distance || null,
        horario: f.properties.opening_hours || 'Horario no especificado',
        telefono: f.properties.contact?.phone || null,
      }));

    farmacias.sort((a, b) => (a.distanciaMetros || 0) - (b.distanciaMetros || 0));
    return farmacias;
  } catch (error) {
    console.error('[Geoapify Error] Error al buscar farmacias:', error.message);
    throw new Error('No se pudieron obtener las farmacias cercanas.');
  }
};

/**
 * Autocompletado predictivo de direcciones para México mediante Geoapify Geocoding API.
 * 
 * @param {string} texto - Término de búsqueda tecleado por el usuario
 */
const buscarSugerenciasDireccion = async (texto) => {
  if (!texto || texto.trim().length === 0) {
    return [];
  }

  if (!API_KEY) {
    return [
      { id: 's1', direccionFormateada: `${texto}, Ciudad de México, CDMX, México`, lat: 19.4326, lng: -99.1332 },
    ];
  }

  const url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(texto)}&limit=5&filter=countrycode:mx&apiKey=${API_KEY}`;

  try {
    const response = await axios.get(url, { timeout: 6000 });
    const features = response.data?.features || [];
    return features.map((f) => ({
      id: f.properties.place_id || String(Math.random()),
      direccionFormateada: f.properties.formatted,
      lat: f.properties.lat,
      lng: f.properties.lon,
    }));
  } catch (error) {
    console.error('[Geoapify Error] Error en autocompletado de dirección:', error.message);
    throw new Error('No se pudieron obtener sugerencias de dirección.');
  }
};

/**
 * Obtiene la dirección legible a partir de coordenadas geográficas (Reverse Geocoding).
 * Utiliza Geoapify con fallback a Nominatim (OpenStreetMap).
 * 
 * @param {number} lat - Latitud
 * @param {number} lng - Longitud
 */
const obtenerDireccionPorCoordenadas = async (lat, lng) => {
  if (lat === undefined || lng === undefined || lat === null || lng === null) return null;

  if (API_KEY) {
    const url = `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lng}&lang=es&apiKey=${API_KEY}`;
    try {
      const response = await axios.get(url, { timeout: 6000 });
      const feature = response.data?.features?.[0];

      if (feature && feature.properties) {
        const p = feature.properties;
        const direccion = p.formatted || [p.address_line1, p.address_line2].filter(Boolean).join(', ') || `${p.street || ''} ${p.housenumber || ''}, ${p.city || ''}`.trim();
        return {
          id: p.place_id || String(Math.random()),
          direccionFormateada: direccion,
          calle: p.street || null,
          numero: p.housenumber || null,
          colonia: p.neighbourhood || p.suburb || null,
          ciudad: p.city || p.county || null,
          estado: p.state || null,
          codigoPostal: p.postcode || null,
          lat: p.lat || Number(lat),
          lng: p.lon || Number(lng),
        };
      }
    } catch (error) {
      console.warn('[Geoapify Reverse Geocoding Warning]:', error.message);
    }
  }

  // Fallback a OpenStreetMap Nominatim
  try {
    const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
    const nomRes = await axios.get(nominatimUrl, {
      timeout: 5000,
      headers: { 'User-Agent': 'BotiquinDigitalInteligente-UAM/1.0' }
    });
    if (nomRes.data && nomRes.data.display_name) {
      return {
        id: String(nomRes.data.place_id || Math.random()),
        direccionFormateada: nomRes.data.display_name,
        lat: Number(lat),
        lng: Number(lng),
      };
    }
  } catch (nomErr) {
    console.warn('[Nominatim Reverse Fallback Warning]:', nomErr.message);
  }

  return {
    direccionFormateada: `Ubicación GPS (${Number(lat).toFixed(4)}, ${Number(lng).toFixed(4)})`,
    lat: Number(lat),
    lng: Number(lng),
  };
};

module.exports = {
  buscarFarmaciasCercanas,
  buscarSugerenciasDireccion,
  obtenerDireccionPorCoordenadas,
};
