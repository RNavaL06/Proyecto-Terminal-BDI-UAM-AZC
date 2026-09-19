const inventarioService = require('../services/inventarioService');
const { analizarCajaMedicamento: analizarCajaIA } = require('../services/visionService');

/**
 * Listado de medicamentos del botiquín con cálculo dinámico de caducidad y resumen de alertas.
 */
const listarInventario = async (req, res, next) => {
  const idUsuario = req.usuario.id_usuario;

  try {
    const { items, resumen } = await inventarioService.obtenerInventarioCompleto(idUsuario);

    res.status(200).json({
      exito: true,
      data: items,
      resumen,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Retorna las alertas de medicamentos caducados o por vencer dentro de un umbral en días.
 */
const obtenerAlertas = async (req, res, next) => {
  const idUsuario = req.usuario.id_usuario;
  const diasUmbral = Math.max(1, Math.min(365, parseInt(req.query.dias || '30', 10)));

  try {
    const alertas = await inventarioService.obtenerAlertasBotiquin(idUsuario, diasUmbral);

    res.status(200).json({
      exito: true,
      umbral_dias: diasUmbral,
      total_alertas: alertas.length,
      data: alertas,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Analiza la fotografía de una caja de medicamento para prellenar datos del botiquín.
 */
const analizarCajaMedicamento = async (req, res, next) => {
  const { imageBase64, imagen_base64 } = req.body;
  const rawBase64 = imageBase64 || imagen_base64;

  if (!rawBase64) {
    return res.status(400).json({ exito: false, error: 'Se requiere la imagen en formato Base64.' });
  }

  try {
    const { datosExtraidos } = await analizarCajaIA(rawBase64);

    res.status(200).json({
      exito: true,
      data: datosExtraidos,
    });
  } catch (error) {
    console.error('[Inventario Controller OCR Error]:', error);
    next(error);
  }
};

/**
 * Agrega un medicamento individual al botiquín físico.
 */
const agregarMedicamento = async (req, res, next) => {
  const idUsuario = req.usuario.id_usuario;
  const payload = req.body;

  if (!payload.nombre_medicamento || !payload.nombre_medicamento.trim()) {
    return res.status(400).json({ exito: false, error: 'El nombre del medicamento es obligatorio.' });
  }

  try {
    const idBotiquin = await inventarioService.agregarMedicamentoDB(idUsuario, payload);

    res.status(201).json({
      exito: true,
      mensaje: 'Medicamento agregado al botiquín exitosamente.',
      id_botiquin: idBotiquin,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Agrega un lote de medicamentos al botiquín de forma transaccional (máx. 50 items).
 */
const agregarBatch = async (req, res, next) => {
  const idUsuario = req.usuario.id_usuario;
  const { medicamentos } = req.body;

  if (!Array.isArray(medicamentos) || medicamentos.length === 0) {
    return res.status(400).json({ exito: false, error: 'Se requiere una lista de medicamentos.' });
  }

  try {
    const agregados = await inventarioService.agregarLoteMedicamentosDB(idUsuario, medicamentos);

    res.status(201).json({ 
      exito: true, 
      mensaje: `${agregados} medicamentos agregados al botiquín.` 
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Actualiza un medicamento del botiquín.
 */
const actualizarMedicamento = async (req, res, next) => {
  const idUsuario = req.usuario.id_usuario;
  const idBotiquin = parseInt(req.params.id, 10);
  const payload = req.body;

  try {
    const actualizado = await inventarioService.actualizarMedicamentoDB(idBotiquin, idUsuario, payload);

    if (!actualizado) {
      return res.status(404).json({ exito: false, error: 'Medicamento no encontrado en el botiquín.' });
    }

    res.status(200).json({ exito: true, mensaje: 'Medicamento actualizado exitosamente.' });
  } catch (error) {
    next(error);
  }
};

/**
 * Elimina un medicamento del botiquín físico.
 */
const eliminarMedicamento = async (req, res, next) => {
  const idUsuario = req.usuario.id_usuario;
  const idBotiquin = parseInt(req.params.id, 10);

  try {
    const borrado = await inventarioService.borrarMedicamentoDB(idBotiquin, idUsuario);

    if (!borrado) {
      return res.status(404).json({ exito: false, error: 'Medicamento no encontrado.' });
    }

    res.status(200).json({ exito: true, mensaje: 'Medicamento eliminado del botiquín.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listarInventario,
  obtenerAlertas,
  analizarCajaMedicamento,
  agregarMedicamento,
  agregarBatch,
  actualizarMedicamento,
  eliminarMedicamento,
};
