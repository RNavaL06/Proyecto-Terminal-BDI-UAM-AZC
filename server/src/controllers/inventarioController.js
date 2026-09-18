const pool = require('../config/db');
const config = require('../config/env');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { optimizarImagenBase64 } = require('../services/imageService');
const { computeEstado, calcularDiasRestantes } = require('../utils/expirationLogic');

const genAI = config.ai.geminiKey ? new GoogleGenerativeAI(config.ai.geminiKey) : null;

/**
 * Listado de medicamentos del botiquín con cálculo dinámico de caducidad y resumen de alertas.
 */
const listarInventario = async (req, res, next) => {
  const idUsuario = req.usuario.id_usuario;

  try {
    const [rows] = await pool.query(
      `SELECT b.id_botiquin, b.id_catalogo, b.id_receta, b.cantidad_disponible, b.unidad,
              b.fecha_caducidad, b.lote, b.codigo_barras, b.notas, b.created_at, b.updated_at,
              cm.nombre_comercial, cm.sustancia_activa, cm.formato, cm.laboratorio
       FROM botiquin b
       JOIN catalogo_medicamentos cm ON b.id_catalogo = cm.id_catalogo
       WHERE b.id_usuario = ?
       ORDER BY b.fecha_caducidad ASC, b.id_botiquin DESC`,
      [idUsuario]
    );

    let vigentes = 0;
    let porVencer = 0;
    let caducados = 0;

    const items = rows.map((r) => {
      const estado = computeEstado(r.fecha_caducidad);
      const diasRestantes = calcularDiasRestantes(r.fecha_caducidad);

      if (estado === 'vigente') vigentes++;
      else if (estado === 'por_vencer') porVencer++;
      else if (estado === 'caducado') caducados++;

      return {
        ...r,
        estado,
        dias_restantes: diasRestantes,
      };
    });

    res.status(200).json({
      exito: true,
      data: items,
      resumen: {
        total: items.length,
        vigentes,
        porVencer,
        caducados,
        alertas: porVencer + caducados,
      },
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
    const [rows] = await pool.query(
      `SELECT b.id_botiquin, b.cantidad_disponible, b.unidad, b.fecha_caducidad,
              cm.nombre_comercial, cm.sustancia_activa, cm.formato
       FROM botiquin b
       JOIN catalogo_medicamentos cm ON b.id_catalogo = cm.id_catalogo
       WHERE b.id_usuario = ?
         AND b.fecha_caducidad IS NOT NULL
         AND b.fecha_caducidad <= DATE_ADD(CURDATE(), INTERVAL ? DAY)
       ORDER BY b.fecha_caducidad ASC`,
      [idUsuario, diasUmbral]
    );

    const alertas = rows.map((r) => ({
      ...r,
      estado: computeEstado(r.fecha_caducidad),
      dias_restantes: calcularDiasRestantes(r.fecha_caducidad),
    }));

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
    const imagenOptimizada = await optimizarImagenBase64(rawBase64, 1280, 80);
    const cleanBase64 = imagenOptimizada.replace(/^data:image\/[a-zA-Z+]+;base64,/, '');

    if (!genAI) {
      return res.status(200).json({
        exito: true,
        data: {
          nombre_medicamento: 'Ibuprofeno Genérico',
          sustancia_activa: 'Ibuprofeno',
          gramaje: '400mg',
          formato: 'Tabletas',
          fecha_caducidad: null,
        },
      });
    }

    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: { responseMimeType: 'application/json' },
    });

    const prompt = `Analiza esta imagen de una caja o empaque de medicamento.
    Extrae la siguiente información y devuélvela ESTRICTAMENTE en este formato JSON:
    {
      "nombre_medicamento": "Nombre comercial del fármaco",
      "sustancia_activa": "Nombre de la sustancia o principio activo",
      "gramaje": "Concentración (ej. 500mg, 10ml)",
      "formato": "Tabletas, Jarabe, Cápsulas, Gel, etc.",
      "fecha_caducidad": "YYYY-MM-DD o null si no es visible"
    }
    Si algún dato no es visible, pon null. No incluyas ningún texto fuera del JSON.`;

    const result = await model.generateContent([
      prompt,
      { inlineData: { data: cleanBase64, mimeType: 'image/jpeg' } },
    ]);

    const response = await result.response;
    const cleanJson = response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    const dataExtraida = JSON.parse(cleanJson);

    res.status(200).json({
      exito: true,
      data: dataExtraida,
    });
  } catch (error) {
    console.error('[Inventario OCR Error]:', error);
    next(error);
  }
};

/**
 * Agrega un medicamento individual al botiquín físico.
 */
const agregarMedicamento = async (req, res, next) => {
  const idUsuario = req.usuario.id_usuario;
  const {
    nombre_medicamento,
    sustancia_activa,
    formato,
    cantidad_disponible,
    unidad,
    fecha_caducidad,
    lote,
    codigo_barras,
    notas,
  } = req.body;

  if (!nombre_medicamento || !nombre_medicamento.trim()) {
    return res.status(400).json({ exito: false, error: 'El nombre del medicamento es obligatorio.' });
  }

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // 1. Buscar o crear en catálogo maestro
    const nombreLimpio = nombre_medicamento.trim();
    let idCatalogo;

    const [catRows] = await connection.query('SELECT id_catalogo FROM catalogo_medicamentos WHERE nombre_comercial = ?', [
      nombreLimpio,
    ]);

    if (catRows.length > 0) {
      idCatalogo = catRows[0].id_catalogo;
    } else {
      const [catResult] = await connection.query(
        'INSERT INTO catalogo_medicamentos (nombre_comercial, sustancia_activa, formato) VALUES (?, ?, ?)',
        [nombreLimpio, sustancia_activa || null, formato || 'Tabletas']
      );
      idCatalogo = catResult.insertId;
    }

    // 2. Insertar en botiquín
    const estado = computeEstado(fecha_caducidad);
    const cantidad = Math.max(0, parseInt(cantidad_disponible || '1', 10));

    const [botiquinResult] = await connection.query(
      `INSERT INTO botiquin (id_usuario, id_catalogo, cantidad_disponible, unidad, fecha_caducidad, lote, codigo_barras, notas, estado)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        idUsuario,
        idCatalogo,
        cantidad,
        unidad || 'piezas',
        fecha_caducidad || null,
        lote || null,
        codigo_barras || null,
        notas || null,
        estado,
      ]
    );

    await connection.commit();

    res.status(201).json({
      exito: true,
      mensaje: 'Medicamento agregado al botiquín exitosamente.',
      id_botiquin: botiquinResult.insertId,
    });
  } catch (error) {
    if (connection) await connection.rollback();
    next(error);
  } finally {
    if (connection) connection.release();
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

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    let agregados = 0;

    for (const med of medicamentos.slice(0, 50)) {
      const nombre = med.nombre_medicamento || med.nombre;
      if (!nombre || !nombre.trim()) continue;

      let idCat = med.id_catalogo;
      if (!idCat) {
        const [cRows] = await connection.query('SELECT id_catalogo FROM catalogo_medicamentos WHERE nombre_comercial = ?', [
          nombre.trim(),
        ]);
        if (cRows.length > 0) {
          idCat = cRows[0].id_catalogo;
        } else {
          const [cIns] = await connection.query(
            'INSERT INTO catalogo_medicamentos (nombre_comercial, sustancia_activa, formato) VALUES (?, ?, ?)',
            [nombre.trim(), med.sustancia_activa || null, med.formato || 'Tabletas']
          );
          idCat = cIns.insertId;
        }
      }

      const estado = computeEstado(med.fecha_caducidad);
      await connection.query(
        `INSERT INTO botiquin (id_usuario, id_catalogo, cantidad_disponible, unidad, fecha_caducidad, lote, estado)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          idUsuario,
          idCat,
          parseInt(med.cantidad, 10) || 10,
          med.unidad || 'piezas',
          med.fecha_caducidad || null,
          med.lote || null,
          estado,
        ]
      );
      agregados++;
    }

    await connection.commit();
    res.status(201).json({ exito: true, mensaje: `${agregados} medicamentos agregados al botiquín.` });
  } catch (error) {
    if (connection) await connection.rollback();
    next(error);
  } finally {
    if (connection) connection.release();
  }
};

/**
 * Actualiza un medicamento del botiquín.
 */
const actualizarMedicamento = async (req, res, next) => {
  const idUsuario = req.usuario.id_usuario;
  const idBotiquin = parseInt(req.params.id, 10);
  const { cantidad_disponible, unidad, fecha_caducidad, lote, notas } = req.body;

  try {
    const estado = computeEstado(fecha_caducidad);

    const [result] = await pool.query(
      `UPDATE botiquin SET 
         cantidad_disponible = IFNULL(?, cantidad_disponible),
         unidad = IFNULL(?, unidad),
         fecha_caducidad = IFNULL(?, fecha_caducidad),
         lote = IFNULL(?, lote),
         notas = IFNULL(?, notas),
         estado = ?
       WHERE id_botiquin = ? AND id_usuario = ?`,
      [cantidad_disponible, unidad, fecha_caducidad, lote, notas, estado, idBotiquin, idUsuario]
    );

    if (result.affectedRows === 0) {
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
    const [result] = await pool.query('DELETE FROM botiquin WHERE id_botiquin = ? AND id_usuario = ?', [
      idBotiquin,
      idUsuario,
    ]);

    if (result.affectedRows === 0) {
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
