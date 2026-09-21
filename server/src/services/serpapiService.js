const { getJson } = require('serpapi');
const config = require('../config/env');

/**
 * Consulta ofertas comerciales de medicamentos en Google Shopping México vía SerpApi.
 * 
 * @param {string} medicamentoNombre - Término de búsqueda (ej. "Paracetamol 500mg")
 * @returns {Promise<Array<Object>>} Lista de ofertas normalizadas
 */
const buscarPreciosMedicamento = async (medicamentoNombre) => {
  const apiKey = config.serpapi.apiKey;

  if (!apiKey || apiKey === 'YOUR_SERPAPI_KEY_HERE') {
    console.warn('[SerpApi] Clave API no configurada, devolviendo datos simulados locales.');
    return [
      {
        title: `${medicamentoNombre} 20 tabletas`,
        price: '$42.50',
        store: 'Farmacias del Ahorro',
        link: 'https://www.fahorro.com',
        thumbnail: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=150',
      },
      {
        title: `${medicamentoNombre} Genérico 500mg`,
        price: '$28.00',
        store: 'Farmacias Similares',
        link: 'https://farmaciasdesimilares.com',
        thumbnail: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=150',
      },
      {
        title: `${medicamentoNombre} Patente Caja c/24`,
        price: '$98.00',
        store: 'Farmacia San Pablo',
        link: 'https://www.farmaciasanpablo.com.mx',
        thumbnail: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=150',
      },
    ];
  }

  try {
    const axios = require('axios');
    const { data } = await axios.get('https://serpapi.com/search.json', {
      params: {
        api_key: apiKey,
        engine: 'google_shopping',
        q: `${medicamentoNombre} medicamento farmacia`,
        gl: 'mx',
        hl: 'es',
        google_domain: 'google.com.mx',
        num: 15,
      },
      timeout: 15000 // 15 segundos máximo
    });

    if (!data) {
      throw new Error('Respuesta vacía de SerpApi');
    }
    if (data.error) {
      if (data.error.includes("Google hasn't returned any results")) {
        return []; // Retorna lista vacía en lugar de lanzar error
      }
      throw new Error(`Error de SerpApi: ${data.error}`);
    }

    const items = data.shopping_results || [];
    const resultados = items.map((item) => ({
      title: item.title,
      price: item.price || item.extracted_price ? `$${item.extracted_price}` : 'Consultar tienda',
      store: item.source || item.merchant?.name || 'Farmacia en línea',
      link: item.link || item.product_link || '#',
      thumbnail: item.thumbnail || null,
    }));

    return resultados;
  } catch (error) {
    if (error.response && error.response.data && error.response.data.error) {
       const apiError = error.response.data.error;
       if (apiError.includes("Google hasn't returned any results")) return [];
       throw new Error(`Error de SerpApi: ${apiError}`);
    }
    throw new Error(error.message || 'Error al conectar con SerpApi');
  }
};

/**
 * Calcula la distancia en metros entre dos coordenadas geográficas mediante la fórmula de Haversine.
 */
const calcularDistanciaMetros = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
};

/**
 * Busca farmacias físicas cercanas utilizando SerpApi (Google Maps Engine).
 * Retorna nombre, coordenadas, puntuación (rating), número de reseñas,
 * teléfono, estado abierto/cerrado y horario completo.
 * 
 * @param {number} lat - Latitud
 * @param {number} lng - Longitud
 * @returns {Promise<Array<Object>>}
 */
const buscarFarmaciasCercanas = async (lat, lng) => {
  const apiKey = config.serpapi.apiKey;
  if (!apiKey || apiKey === 'YOUR_SERPAPI_KEY_HERE') {
    return [];
  }

  try {
    const axios = require('axios');
    const { data } = await axios.get('https://serpapi.com/search.json', {
      params: {
        engine: 'google_maps',
        q: 'farmacias',
        ll: `@${lat},${lng},14z`,
        type: 'search',
        hl: 'es',
        api_key: apiKey,
      },
      timeout: 15000
    });

    if (!data || data.error) {
      if (data?.error) console.warn('[SerpApi Google Maps Warning]:', data.error);
      return [];
    }

    const items = data.local_results || [];
    const farmacias = items
      .filter((r) => r.title && r.gps_coordinates?.latitude && r.gps_coordinates?.longitude)
      .map((r) => {
        const fLat = r.gps_coordinates.latitude;
        const fLng = r.gps_coordinates.longitude;
        const dist = calcularDistanciaMetros(lat, lng, fLat, fLng);

        return {
          id: r.place_id || r.data_id || String(Math.random()),
          nombre: r.title,
          direccion: r.address || 'Dirección no especificada',
          lat: fLat,
          lng: fLng,
          rating: typeof r.rating === 'number' ? r.rating : null,
          reviews: typeof r.reviews === 'number' ? r.reviews : null,
          telefono: r.phone || null,
          abierto: r.open_state || r.hours || null,
          horario: r.open_state || r.hours || 'Consulta horario',
          distanciaMetros: dist,
          thumbnail: r.thumbnail || null,
          website: r.website || null,
        };
      });

    farmacias.sort((a, b) => (a.distanciaMetros || 0) - (b.distanciaMetros || 0));
    return farmacias;
  } catch (error) {
    console.warn('[SerpApi Google Maps Error]:', error.message);
    return [];
  }
};

module.exports = { 
  buscarPreciosMedicamento,
  buscarFarmaciasCercanas,
};
