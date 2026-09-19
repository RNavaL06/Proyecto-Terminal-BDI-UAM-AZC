const pool = require('../config/db');

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
 * Crea una nueva receta de forma transaccional en la DB.
 */
const guardarRecetaDB = async (idUsuario, payload) => {
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

    let idMedico = null;
    const cedulaLimpia = medico_cedula && medico_cedula.trim() ? medico_cedula.trim() : null;
    const nombreMedLimpio = medico_nombre && medico_nombre.trim() ? medico_nombre.trim() : 'Médico No Especificado';

    if (cedulaLimpia) {
      const [medRows] = await connection.query('SELECT id_medico FROM medicos WHERE cedula_profesional = ?', [cedulaLimpia]);
      if (medRows.length > 0) idMedico = medRows[0].id_medico;
    }

    if (!idMedico && nombreMedLimpio !== 'Médico No Especificado') {
      const [medRowsName] = await connection.query('SELECT id_medico FROM medicos WHERE nombre_medico = ?', [nombreMedLimpio]);
      if (medRowsName.length > 0) idMedico = medRowsName[0].id_medico;
    }

    if (!idMedico) {
      const [medResult] = await connection.query(
        'INSERT INTO medicos (nombre_medico, cedula_profesional) VALUES (?, ?)',
        [nombreMedLimpio, cedulaLimpia]
      );
      idMedico = medResult.insertId;
    }

    let codigoCieFinal = null;
    if (codigo_cie10) {
      const [cieRows] = await connection.query('SELECT codigo_cie10 FROM catalogo_cie10 WHERE codigo_cie10 = ?', [codigo_cie10.trim()]);
      if (cieRows.length > 0) {
        codigoCieFinal = cieRows[0].codigo_cie10;
      }
    }

    const fechaExpFinal = parsearFecha(fecha_emision);
    const [recetaResult] = await connection.query(
      `INSERT INTO recetas (id_usuario, id_medico, paciente_nombre, fecha_expedicion, diagnostico, codigo_cie10, indicaciones, imagen_base64, estado)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'procesada')`,
      [idUsuario, idMedico, paciente_nombre || null, fechaExpFinal, diagnostico || 'Consulta médica general', codigoCieFinal, indicaciones || null, imagenFinal]
    );

    const idReceta = recetaResult.insertId;
    const listaMedicamentos = Array.isArray(medicamentos) ? medicamentos : [];

    for (const med of listaMedicamentos) {
      const nombreComercial = med.nombre_medicamento || med.nombre || 'Medicamento No Especificado';
      const sustanciaActiva = med.sustancia_activa || null;
      const formato = med.formato || 'Tabletas';

      let idCatalogo = null;
      const [catRows] = await connection.query('SELECT id_catalogo FROM catalogo_medicamentos WHERE nombre_comercial = ?', [nombreComercial]);

      if (catRows.length > 0) {
        idCatalogo = catRows[0].id_catalogo;
      } else {
        const [catResult] = await connection.query(
          'INSERT INTO catalogo_medicamentos (nombre_comercial, sustancia_activa, formato) VALUES (?, ?, ?)',
          [nombreComercial, sustanciaActiva, formato]
        );
        idCatalogo = catResult.insertId;
      }

      await connection.query(
        `INSERT INTO recetas_detalles (id_receta, id_catalogo, dosis, instrucciones_uso, frecuencia, duracion)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [idReceta, idCatalogo, med.dosis || null, med.indicaciones || med.instrucciones_uso || null, med.frecuencia || null, med.duracion || null]
      );

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
    return { idReceta, countMedicamentos: listaMedicamentos.length };
  } catch (error) {
    if (connection) await connection.rollback();
    throw error;
  } finally {
    if (connection) connection.release();
  }
};

const listarRecetasUsuario = async (idUsuario, page = 1, limit = 10) => {
  const offset = (page - 1) * limit;

  const [[{ total }]] = await pool.query('SELECT COUNT(*) AS total FROM recetas WHERE id_usuario = ?', [idUsuario]);

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

  return { total, recetas };
};

const obtenerRecetaPorId = async (idReceta, idUsuario) => {
  const [recetaRows] = await pool.query(
    `SELECT r.*, m.nombre_medico, m.cedula_profesional, m.especialidad
     FROM recetas r
     LEFT JOIN medicos m ON r.id_medico = m.id_medico
     WHERE r.id_receta = ? AND r.id_usuario = ?`,
    [idReceta, idUsuario]
  );

  if (recetaRows.length === 0) return null;

  const receta = recetaRows[0];
  const [medicamentos] = await pool.query(
    `SELECT rd.id_receta_detalle, rd.dosis, rd.instrucciones_uso, rd.frecuencia, rd.duracion,
            cm.id_catalogo, cm.nombre_comercial, cm.sustancia_activa, cm.formato
     FROM recetas_detalles rd
     JOIN catalogo_medicamentos cm ON rd.id_catalogo = cm.id_catalogo
     WHERE rd.id_receta = ?`,
    [idReceta]
  );

  return { ...receta, medicamentos };
};

const actualizarRecetaDB = async (idReceta, idUsuario, payload) => {
  const { paciente_nombre, fecha_expedicion, diagnostico, codigo_cie10, indicaciones, medicamentos } = payload;
  let connection;
  
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [ownerCheck] = await connection.query('SELECT id_receta FROM recetas WHERE id_receta = ? AND id_usuario = ?', [idReceta, idUsuario]);
    if (ownerCheck.length === 0) {
      await connection.rollback();
      return false; // Not found / Unauthorized
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
            const [cIns] = await connection.query('INSERT INTO catalogo_medicamentos (nombre_comercial, sustancia_activa) VALUES (?, ?)', [nombre, med.sustancia_activa || null]);
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
    return true;
  } catch (error) {
    if (connection) await connection.rollback();
    throw error;
  } finally {
    if (connection) connection.release();
  }
};

const borrarRecetaDB = async (idReceta, idUsuario) => {
  const [result] = await pool.query('DELETE FROM recetas WHERE id_receta = ? AND id_usuario = ?', [idReceta, idUsuario]);
  return result.affectedRows > 0;
};

module.exports = {
  guardarRecetaDB,
  listarRecetasUsuario,
  obtenerRecetaPorId,
  actualizarRecetaDB,
  borrarRecetaDB
};
