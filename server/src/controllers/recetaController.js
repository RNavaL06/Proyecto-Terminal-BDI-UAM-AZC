const { analizarImagenReceta } = require('../services/visionService');
const recetaService = require('../services/recetaService');

/**
 * Analiza la fotografía de una receta médica con IA de visión multimodal (Gemini / Sharp).
 */
const analizarReceta = async (req, res, next) => {
  const { imagenBase64, imagen_base64 } = req.body;
  const rawBase64 = imagenBase64 || imagen_base64;

  if (!rawBase64) {
    return res.status(400).json({
      exito: false,
      error: 'Se requiere la imagen de la receta médica en formato Base64.',
    });
  }

  try {
    const { datosClinicos, imagenOptimizada } = await analizarImagenReceta(rawBase64);

    res.status(200).json({
      exito: true,
      mensaje: 'Receta analizada con éxito',
      datos_clinicos: datosClinicos,
      imagen_procesada: imagenOptimizada,
    });
  } catch (error) {
    console.error('[Receta Controller Error] Error al analizar receta:', error);
    res.status(500).json({
      exito: false,
      error: 'Error al comunicarse con el motor de visión de IA.',
      detalles: error.message,
    });
  }
};

/**
 * Guarda transaccionalmente en MySQL la receta médica validada por el usuario en 3NF.
 */
const guardarReceta = async (req, res, next) => {
  const idUsuario = req.usuario.id_usuario;
  const payload = req.body.datos_clinicos || req.body;

  try {
    const { idReceta, countMedicamentos } = await recetaService.guardarRecetaDB(idUsuario, payload);

    res.status(201).json({
      exito: true,
      mensaje: 'Receta y medicamentos registrados exitosamente en la base de datos.',
      id_receta: idReceta,
      medicamentos_guardados: countMedicamentos,
      botiquin_sincronizado: Boolean(payload.agregar_al_botiquin),
    });
  } catch (error) {
    console.error('[Receta Controller Error] Error en guardarReceta:', error);
    next(error);
  }
};

/**
 * Listado paginado de recetas del usuario autenticado.
 */
const listarRecetas = async (req, res, next) => {
  const idUsuario = req.usuario.id_usuario;
  const page = Math.max(1, parseInt(req.query.page || '1', 10));
  const limit = Math.max(1, Math.min(50, parseInt(req.query.limit || '10', 10)));

  try {
    const { total, recetas } = await recetaService.listarRecetasUsuario(idUsuario, page, limit);

    res.status(200).json({
      exito: true,
      data: recetas,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtiene el detalle completo de una receta por ID, incluyendo fotografía Base64 y medicamentos.
 */
const obtenerReceta = async (req, res, next) => {
  const idUsuario = req.usuario.id_usuario;
  const idReceta = parseInt(req.params.id, 10);

  try {
    const receta = await recetaService.obtenerRecetaPorId(idReceta, idUsuario);

    if (!receta) {
      return res.status(404).json({ exito: false, error: 'Receta no encontrada o no pertenece al usuario.' });
    }

    res.status(200).json({
      exito: true,
      data: receta,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Actualiza los datos de una receta y sus renglones de medicamentos.
 */
const actualizarReceta = async (req, res, next) => {
  const idUsuario = req.usuario.id_usuario;
  const idReceta = parseInt(req.params.id, 10);
  const payload = req.body;

  try {
    const actualizado = await recetaService.actualizarRecetaDB(idReceta, idUsuario, payload);

    if (!actualizado) {
      return res.status(404).json({ exito: false, error: 'Receta no encontrada o sin permisos.' });
    }

    res.status(200).json({ exito: true, mensaje: 'Receta actualizada exitosamente.' });
  } catch (error) {
    next(error);
  }
};

/**
 * Elimina una receta médica del historial (con borrado en cascada).
 */
const eliminarReceta = async (req, res, next) => {
  const idUsuario = req.usuario.id_usuario;
  const idReceta = parseInt(req.params.id, 10);

  try {
    const borrado = await recetaService.borrarRecetaDB(idReceta, idUsuario);

    if (!borrado) {
      return res.status(404).json({ exito: false, error: 'Receta no encontrada.' });
    }

    res.status(200).json({ exito: true, mensaje: 'Receta eliminada del historial exitosamente.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  analizarReceta,
  guardarReceta,
  listarRecetas,
  obtenerReceta,
  actualizarReceta,
  eliminarReceta,
};
