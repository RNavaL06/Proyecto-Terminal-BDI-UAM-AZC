const pool = require('../config/db');
const { buscarPreciosMedicamento, buscarFarmaciasCercanas: buscarFarmaciasCercanasSerpApi } = require('../services/serpapiService');
const { 
  buscarFarmaciasCercanas: buscarFarmaciasCercanasGeoapify, 
  buscarSugerenciasDireccion, 
  obtenerDireccionPorCoordenadas 
} = require('../services/geoapifyService');

/**
 * Cotiza ofertas comerciales con SerpApi (Google Shopping México) y guarda en historial.
 */
const buscarPrecios = async (req, res, next) => {
  const idUsuario = req.usuario.id_usuario;
  const { medicamento } = req.body;

  if (!medicamento || typeof medicamento !== 'string' || medicamento.trim().length === 0) {
    return res.status(400).json({ exito: false, error: 'Se requiere el nombre del medicamento a buscar.' });
  }

  const nombreLimpio = medicamento.trim().slice(0, 100);

  try {
    const resultados = await buscarPreciosMedicamento(nombreLimpio);

    // Guardar en historial de búsquedas del usuario
    try {
      await pool.query(
        'INSERT INTO busquedas_precios (id_usuario, medicamento_nombre, resultados, fuente) VALUES (?, ?, ?, ?)',
        [idUsuario, nombreLimpio, JSON.stringify(resultados), 'google_shopping']
      );
    } catch (dbError) {
      console.warn('[Farmacia Controller] No se pudo guardar historial:', dbError.message);
    }

    res.status(200).json({
      exito: true,
      medicamento: nombreLimpio,
      total: resultados.length,
      data: resultados,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Retorna las últimas 10 búsquedas de precios realizadas por el usuario.
 */
const historialBusquedas = async (req, res, next) => {
  const idUsuario = req.usuario.id_usuario;

  try {
    const [rows] = await pool.query(
      'SELECT id_busqueda, medicamento_nombre, resultados, fuente, created_at FROM busquedas_precios WHERE id_usuario = ? ORDER BY created_at DESC LIMIT 10',
      [idUsuario]
    );

    const data = rows.map((r) => ({
      ...r,
      resultados: typeof r.resultados === 'string' ? JSON.parse(r.resultados) : r.resultados,
    }));

    res.status(200).json({ exito: true, data });
  } catch (error) {
    next(error);
  }
};

/**
 * Busca farmacias cercanas por coordenadas GPS mediante SerpApi (Google Maps) con fallback a Geoapify.
 * Incluye puntuación (rating), reseñas, estado de apertura y horario detallado.
 */
const obtenerFarmaciasCercanas = async (req, res, next) => {
  const lat = parseFloat(req.body.lat || req.query.lat);
  const lng = parseFloat(req.body.lng || req.query.lng);

  if (Number.isNaN(lat) || Number.isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return res.status(400).json({ exito: false, error: 'Coordenadas latitud y longitud inválidas.' });
  }

  try {
    let farmacias = [];

    // 1. Intentar con SerpApi Google Maps (da estado abierto/cerrado, rating y opiniones reales)
    try {
      farmacias = await buscarFarmaciasCercanasSerpApi(lat, lng);
    } catch (serpError) {
      console.warn('[Farmacias] Error en SerpApi Google Maps, recurriendo a Geoapify:', serpError.message);
    }

    // 2. Si SerpApi no trajo resultados o no está configurada, usar Geoapify Places
    if (!farmacias || farmacias.length === 0) {
      farmacias = await buscarFarmaciasCercanasGeoapify(lat, lng);
    }

    res.status(200).json({ exito: true, total: farmacias.length, data: farmacias });
  } catch (error) {
    next(error);
  }
};

/**
 * Autocompletado predictivo de direcciones en México para búsqueda manual sin GPS.
 */
const autocompletarDireccion = async (req, res, next) => {
  const texto = req.query.q || req.query.texto;

  if (!texto || texto.trim().length === 0) {
    return res.status(200).json({ exito: true, data: [] });
  }

  try {
    const sugerencias = await buscarSugerenciasDireccion(texto.trim());
    res.status(200).json({ exito: true, data: sugerencias });
  } catch (error) {
    next(error);
  }
};

/**
 * Geocodificación inversa: obtiene la dirección postal formateada a partir de coordenadas GPS.
 */
const obtenerDireccionReversa = async (req, res, next) => {
  const lat = parseFloat(req.query.lat ?? req.body.lat);
  const lng = parseFloat(req.query.lng ?? req.query.lon ?? req.body.lng ?? req.body.lon);

  if (Number.isNaN(lat) || Number.isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return res.status(400).json({ exito: false, error: 'Coordenadas latitud y longitud inválidas.' });
  }

  try {
    const data = await obtenerDireccionPorCoordenadas(lat, lng);
    res.status(200).json({ exito: true, data });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  buscarPrecios,
  historialBusquedas,
  obtenerFarmaciasCercanas,
  autocompletarDireccion,
  obtenerDireccionReversa,
};
