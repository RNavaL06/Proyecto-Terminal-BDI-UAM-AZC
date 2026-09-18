const { GoogleGenerativeAI } = require('@google/generative-ai');
const pool = require('../config/db');
const config = require('../config/env');
const { optimizarImagenBase64 } = require('../services/imageService');

const genAI = config.ai.geminiKey ? new GoogleGenerativeAI(config.ai.geminiKey) : null;

/**
 * Normaliza fechas a formato estándar YYYY-MM-DD
 */
const parsearFecha = (fechaStr) => {
  if (!fechaStr) return new Date().toISOString().split('T')[0];
  if (/^\d{4}-\d{2}-\d{2}$/.test(fechaStr)) return fechaStr;

  const partes = fechaStr.split('/');
  if (partes.length === 3) {
    const dia = partes[0].padStart(2, '0');
    const mes = partes[1].padStart(2, '0');
    let anio = partes[2];
    if (anio.length === 2) {
      anio = parseInt(anio, 10) > 50 ? '19' + anio : '20' + anio;
    }
    return `${anio}-${mes}-${dia}`;
  }

  const d = new Date(fechaStr);
  return !isNaN(d.getTime()) ? d.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
};

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
    // 1. Optimizar y comprimir imagen con Sharp antes de enviar al modelo
    const imagenOptimizada = await optimizarImagenBase64(rawBase64, 1280, 80);
    const cleanBase64 = imagenOptimizada.replace(/^data:image\/[a-zA-Z+]+;base64,/, '');

    if (!genAI) {
      console.warn('[Receta Controller] GEMINI_API_KEY no configurada. Devolviendo análisis simulado.');
      return res.status(200).json({
        exito: true,
        mensaje: 'Análisis simulado (clave API de IA no configurada en .env)',
        datos_clinicos: {
          paciente_nombre: 'Paciente de Ejemplo',
          medico_nombre: 'Dr. Roberto Martínez Esquivel',
          medico_cedula: 'CED-MED-8492011',
          fecha_emision: new Date().toISOString().split('T')[0],
          diagnostico: 'Faringitis Aguda',
          codigo_cie10: 'J02.9',
          indicaciones: 'Reposo relativo por 48 horas y abundantes líquidos.',
          medicamentos: [
            {
              nombre_medicamento: 'Amoxil',
              sustancia_activa: 'Amoxicilina',
              dosis: '500mg',
              formato: 'Cápsulas',
              indicaciones: 'Tomar 1 cápsula cada 8 horas por 7 días',
              frecuencia: 'Cada 8 horas',
              duracion: '7 días',
            },
            {
              nombre_medicamento: 'Tylenol 500',
              sustancia_activa: 'Paracetamol',
              dosis: '500mg',
              formato: 'Tabletas',
              indicaciones: 'Tomar 1 tableta cada 8 horas en caso de fiebre',
              frecuencia: 'Cada 8 horas (SOS)',
              duracion: '3 días',
            },
          ],
        },
        imagen_procesada: imagenOptimizada,
      });
    }

    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });

    const prompt = `Eres un asistente clínico experto en digitalización de recetas médicas.
    Analiza la imagen adjunta y extrae la información clínica estrictamente en este esquema JSON:
    {
      "paciente_nombre": "Nombre del paciente o null",
      "medico_nombre": "Nombre del médico o null",
      "medico_cedula": "Cédula profesional o null",
      "fecha_emision": "YYYY-MM-DD o null",
      "diagnostico": "Diagnóstico médico principal o motivo de consulta",
      "codigo_cie10": "Código CIE-10 aproximado (ej. J02.9, R51) o null",
      "indicaciones": "Instrucciones generales de reposo o dieta",
      "medicamentos": [
        {
          "nombre_medicamento": "Nombre comercial o sustancia",
          "sustancia_activa": "Principio activo si es legible",
          "dosis": "Concentración (ej. 500mg, 10ml)",
          "formato": "Tabletas, Cápsulas, Jarabe, etc.",
          "indicaciones": "Instrucciones específicas de toma",
          "frecuencia": "Frecuencia horaria",
          "duracion": "Duración del tratamiento"
        }
      ]
    }
    Si algún dato no es visible, usa null. Devuelve ÚNICAMENTE el objeto JSON sin bloques de texto adicionales.`;

    const imagePart = {
      inlineData: {
        data: cleanBase64,
        mimeType: 'image/jpeg',
      },
    };

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const responseText = response.text();
    const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const datosClinicos = JSON.parse(cleanJson);

    res.status(200).json({
      exito: true,
      mensaje: 'Receta analizada con éxito por IA multimodal',
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
 * Actualiza médicos, recetas, catálogo maestro de medicamentos, recetas_detalles
 * y, opcionalmente, vuelca los medicamentos al botiquín físico del paciente.
 */
const guardarReceta = async (req, res, next) => {
  const idUsuario = req.usuario.id_usuario;
  const payload = req.body.datos_clinicos || req.body;

  const {
    paciente_nombre,
    medico_nombre,
    medico_cedula,
    fecha_emision,
    diagnostico,
    codigo_cie10,
    indicaciones,
    imagen_base64,
    imagenBase64,
    medicamentos,
    agregar_al_botiquin,
  } = payload;

  const imagenFinal = imagen_base64 || imagenBase64 || '';
  let connection;

  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // 1. Resolver médico: buscar por cédula o nombre, o insertar
    let idMedico = null;
    const cedulaLimpia = medico_cedula && medico_cedula.trim() ? medico_cedula.trim() : null;
    const nombreMedLimpio = medico_nombre && medico_nombre.trim() ? medico_nombre.trim() : 'Médico No Especificado';

    if (cedulaLimpia) {
      const [medRows] = await connection.query('SELECT id_medico FROM medicos WHERE cedula_profesional = ?', [
        cedulaLimpia,
      ]);
      if (medRows.length > 0) idMedico = medRows[0].id_medico;
    }

    if (!idMedico && nombreMedLimpio !== 'Médico No Especificado') {
      const [medRowsName] = await connection.query('SELECT id_medico FROM medicos WHERE nombre_medico = ?', [
        nombreMedLimpio,
      ]);
      if (medRowsName.length > 0) idMedico = medRowsName[0].id_medico;
    }

    if (!idMedico) {
      const [medResult] = await connection.query(
        'INSERT INTO medicos (nombre_medico, cedula_profesional) VALUES (?, ?)',
        [nombreMedLimpio, cedulaLimpia]
      );
      idMedico = medResult.insertId;
    }

    // 2. Resolver código CIE-10 (si existe en catalogo_cie10)
    let codigoCieFinal = null;
    if (codigo_cie10) {
      const [cieRows] = await connection.query('SELECT codigo_cie10 FROM catalogo_cie10 WHERE codigo_cie10 = ?', [
        codigo_cie10.trim(),
      ]);
      if (cieRows.length > 0) {
        codigoCieFinal = cieRows[0].codigo_cie10;
      }
    }

    // 3. Insertar encabezado de la receta
    const fechaExpFinal = parsearFecha(fecha_emision);
    const [recetaResult] = await connection.query(
      `INSERT INTO recetas (id_usuario, id_medico, paciente_nombre, fecha_expedicion, diagnostico, codigo_cie10, indicaciones, imagen_base64, estado)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'procesada')`,
      [
        idUsuario,
        idMedico,
        paciente_nombre || null,
        fechaExpFinal,
        diagnostico || 'Consulta médica general',
        codigoCieFinal,
        indicaciones || null,
        imagenFinal,
      ]
    );

    const idReceta = recetaResult.insertId;

    // 4. Iterar medicamentos para catálogos y recetas_detalles
    const listaMedicamentos = Array.isArray(medicamentos) ? medicamentos : [];

    for (const med of listaMedicamentos) {
      const nombreComercial = med.nombre_medicamento || med.nombre || 'Medicamento No Especificado';
      const sustanciaActiva = med.sustancia_activa || null;
      const formato = med.formato || 'Tabletas';

      // 4.1 Buscar o crear en catalogo_medicamentos
      let idCatalogo = null;
      const [catRows] = await connection.query(
        'SELECT id_catalogo FROM catalogo_medicamentos WHERE nombre_comercial = ?',
        [nombreComercial]
      );

      if (catRows.length > 0) {
        idCatalogo = catRows[0].id_catalogo;
      } else {
        const [catResult] = await connection.query(
          'INSERT INTO catalogo_medicamentos (nombre_comercial, sustancia_activa, formato) VALUES (?, ?, ?)',
          [nombreComercial, sustanciaActiva, formato]
        );
        idCatalogo = catResult.insertId;
      }

      // 4.2 Insertar en recetas_detalles
      await connection.query(
        `INSERT INTO recetas_detalles (id_receta, id_catalogo, dosis, instrucciones_uso, frecuencia, duracion)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          idReceta,
          idCatalogo,
          med.dosis || null,
          med.indicaciones || med.instrucciones_uso || null,
          med.frecuencia || null,
          med.duracion || null,
        ]
      );

      // 4.3 Opcional: Agregar automáticamente al botiquín físico
      if (agregar_al_botiquin) {
        const cantidadDefault = parseInt(med.cantidad, 10) || 10;
        const fechaCadDefault = new Date();
        fechaCadDefault.setMonth(fechaCadDefault.getMonth() + 12);

        await connection.query(
          `INSERT INTO botiquin (id_usuario, id_catalogo, id_receta, cantidad_disponible, unidad, fecha_caducidad, estado)
           VALUES (?, ?, ?, ?, 'piezas', ?, 'vigente')`,
          [idUsuario, idCatalogo, idReceta, cantidadDefault, fechaCadDefault.toISOString().split('T')[0]]
        );
      }
    }

    await connection.commit();

    res.status(201).json({
      exito: true,
      mensaje: 'Receta y medicamentos registrados exitosamente en la base de datos.',
      id_receta: idReceta,
      medicamentos_guardados: listaMedicamentos.length,
      botiquin_sincronizado: Boolean(agregar_al_botiquin),
    });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('[Receta Controller Error] Error en guardarReceta:', error);
    next(error);
  } finally {
    if (connection) connection.release();
  }
};

/**
 * Listado paginado de recetas del usuario autenticado.
 */
const listarRecetas = async (req, res, next) => {
  const idUsuario = req.usuario.id_usuario;
  const page = Math.max(1, parseInt(req.query.page || '1', 10));
  const limit = Math.max(1, Math.min(50, parseInt(req.query.limit || '10', 10)));
  const offset = (page - 1) * limit;

  try {
    const [[{ total }]] = await pool.query(
      'SELECT COUNT(*) AS total FROM recetas WHERE id_usuario = ?',
      [idUsuario]
    );

    const [recetas] = await pool.query(
      `SELECT r.id_receta, r.paciente_nombre, r.fecha_expedicion, r.diagnostico, r.codigo_cie10,
              r.indicaciones, r.estado, r.created_at,
              m.nombre_medico, m.cedula_profesional,
              (SELECT COUNT(*) FROM recetas_detalles rd WHERE rd.id_receta = r.id_receta) AS total_medicamentos
       FROM recetas r
       LEFT JOIN medicos m ON r.id_medico = m.id_medico
       WHERE r.id_usuario = ?
       ORDER BY r.fecha_expedicion DESC, r.id_receta DESC
       LIMIT ? OFFSET ?`,
      [idUsuario, limit, offset]
    );

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
    const [recetaRows] = await pool.query(
      `SELECT r.*, m.nombre_medico, m.cedula_profesional, m.especialidad
       FROM recetas r
       LEFT JOIN medicos m ON r.id_medico = m.id_medico
       WHERE r.id_receta = ? AND r.id_usuario = ?`,
      [idReceta, idUsuario]
    );

    if (recetaRows.length === 0) {
      return res.status(404).json({ exito: false, error: 'Receta no encontrada o no pertenece al usuario.' });
    }

    const receta = recetaRows[0];

    // Obtener detalles de medicamentos prescritos
    const [medicamentos] = await pool.query(
      `SELECT rd.id_receta_detalle, rd.dosis, rd.instrucciones_uso, rd.frecuencia, rd.duracion,
              cm.id_catalogo, cm.nombre_comercial, cm.sustancia_activa, cm.formato
       FROM recetas_detalles rd
       JOIN catalogo_medicamentos cm ON rd.id_catalogo = cm.id_catalogo
       WHERE rd.id_receta = ?`,
      [idReceta]
    );

    res.status(200).json({
      exito: true,
      data: {
        ...receta,
        medicamentos,
      },
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
  const { paciente_nombre, fecha_expedicion, diagnostico, codigo_cie10, indicaciones, medicamentos } = req.body;

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Verificar propiedad
    const [ownerCheck] = await connection.query('SELECT id_receta FROM recetas WHERE id_receta = ? AND id_usuario = ?', [
      idReceta,
      idUsuario,
    ]);
    if (ownerCheck.length === 0) {
      await connection.rollback();
      return res.status(404).json({ exito: false, error: 'Receta no encontrada.' });
    }

    await connection.query(
      `UPDATE recetas SET 
         paciente_nombre = IFNULL(?, paciente_nombre),
         fecha_expedicion = IFNULL(?, fecha_expedicion),
         diagnostico = IFNULL(?, diagnostico),
         codigo_cie10 = IFNULL(?, codigo_cie10),
         indicaciones = IFNULL(?, indicaciones)
       WHERE id_receta = ?`,
      [paciente_nombre, fecha_expedicion ? parsearFecha(fecha_expedicion) : null, diagnostico, codigo_cie10, indicaciones, idReceta]
    );

    // Si se envía una nueva lista de medicamentos, reemplazar detalles
    if (Array.isArray(medicamentos)) {
      await connection.query('DELETE FROM recetas_detalles WHERE id_receta = ?', [idReceta]);

      for (const med of medicamentos) {
        const nombre = med.nombre_medicamento || med.nombre_comercial || 'Medicamento';
        let idCat = med.id_catalogo;

        if (!idCat) {
          const [cRows] = await connection.query('SELECT id_catalogo FROM catalogo_medicamentos WHERE nombre_comercial = ?', [nombre]);
          if (cRows.length > 0) {
            idCat = cRows[0].id_catalogo;
          } else {
            const [cIns] = await connection.query('INSERT INTO catalogo_medicamentos (nombre_comercial, sustancia_activa) VALUES (?, ?)', [
              nombre,
              med.sustancia_activa || null,
            ]);
            idCat = cIns.insertId;
          }
        }

        await connection.query(
          'INSERT INTO recetas_detalles (id_receta, id_catalogo, dosis, instrucciones_uso, frecuencia, duracion) VALUES (?, ?, ?, ?, ?, ?)',
          [idReceta, idCat, med.dosis || null, med.instrucciones_uso || med.indicaciones || null, med.frecuencia || null, med.duracion || null]
        );
      }
    }

    await connection.commit();
    res.status(200).json({ exito: true, mensaje: 'Receta actualizada exitosamente.' });
  } catch (error) {
    if (connection) await connection.rollback();
    next(error);
  } finally {
    if (connection) connection.release();
  }
};

/**
 * Elimina una receta médica del historial (con borrado en cascada en recetas_detalles).
 */
const eliminarReceta = async (req, res, next) => {
  const idUsuario = req.usuario.id_usuario;
  const idReceta = parseInt(req.params.id, 10);

  try {
    const [result] = await pool.query('DELETE FROM recetas WHERE id_receta = ? AND id_usuario = ?', [idReceta, idUsuario]);

    if (result.affectedRows === 0) {
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
