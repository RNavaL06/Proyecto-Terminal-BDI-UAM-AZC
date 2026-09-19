const pool = require('../config/db');
const { computeEstado, calcularDiasRestantes } = require('../utils/expirationLogic');

const obtenerInventarioCompleto = async (idUsuario) => {
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

    return { ...r, estado, dias_restantes: diasRestantes };
  });

  return {
    items,
    resumen: {
      total: items.length,
      vigentes,
      porVencer,
      caducados,
      alertas: porVencer + caducados,
    }
  };
};

const obtenerAlertasBotiquin = async (idUsuario, diasUmbral) => {
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

  return rows.map((r) => ({
    ...r,
    estado: computeEstado(r.fecha_caducidad),
    dias_restantes: calcularDiasRestantes(r.fecha_caducidad),
  }));
};

const agregarMedicamentoDB = async (idUsuario, payload) => {
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
  } = payload;

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const nombreLimpio = nombre_medicamento.trim();
    let idCatalogo;

    const [catRows] = await connection.query('SELECT id_catalogo FROM catalogo_medicamentos WHERE nombre_comercial = ?', [nombreLimpio]);

    if (catRows.length > 0) {
      idCatalogo = catRows[0].id_catalogo;
    } else {
      const [catResult] = await connection.query(
        'INSERT INTO catalogo_medicamentos (nombre_comercial, sustancia_activa, formato) VALUES (?, ?, ?)',
        [nombreLimpio, sustancia_activa || null, formato || 'Tabletas']
      );
      idCatalogo = catResult.insertId;
    }

    const estado = computeEstado(fecha_caducidad);
    const cantidad = Math.max(0, parseInt(cantidad_disponible || '1', 10));

    const [botiquinResult] = await connection.query(
      `INSERT INTO botiquin (id_usuario, id_catalogo, cantidad_disponible, unidad, fecha_caducidad, lote, codigo_barras, notas, estado)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [idUsuario, idCatalogo, cantidad, unidad || 'piezas', fecha_caducidad || null, lote || null, codigo_barras || null, notas || null, estado]
    );

    await connection.commit();
    return botiquinResult.insertId;
  } catch (error) {
    if (connection) await connection.rollback();
    throw error;
  } finally {
    if (connection) connection.release();
  }
};

const agregarLoteMedicamentosDB = async (idUsuario, medicamentos) => {
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
        const [cRows] = await connection.query('SELECT id_catalogo FROM catalogo_medicamentos WHERE nombre_comercial = ?', [nombre.trim()]);
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
        [idUsuario, idCat, parseInt(med.cantidad, 10) || 10, med.unidad || 'piezas', med.fecha_caducidad || null, med.lote || null, estado]
      );
      agregados++;
    }

    await connection.commit();
    return agregados;
  } catch (error) {
    if (connection) await connection.rollback();
    throw error;
  } finally {
    if (connection) connection.release();
  }
};

const actualizarMedicamentoDB = async (idBotiquin, idUsuario, payload) => {
  const { nombre_medicamento, sustancia_activa, formato, cantidad_disponible, unidad, fecha_caducidad, lote, notas } = payload;
  
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    let idCatalogo = null;
    if (nombre_medicamento) {
      const nombreLimpio = nombre_medicamento.trim();
      const [catRows] = await connection.query('SELECT id_catalogo FROM catalogo_medicamentos WHERE nombre_comercial = ?', [nombreLimpio]);
      if (catRows.length > 0) {
        idCatalogo = catRows[0].id_catalogo;
      } else {
        const [catResult] = await connection.query(
          'INSERT INTO catalogo_medicamentos (nombre_comercial, sustancia_activa, formato) VALUES (?, ?, ?)',
          [nombreLimpio, sustancia_activa || null, formato || 'Tabletas']
        );
        idCatalogo = catResult.insertId;
      }
    }

    const estado = computeEstado(fecha_caducidad);

    const [result] = await connection.query(
      `UPDATE botiquin SET 
         id_catalogo = IFNULL(?, id_catalogo),
         cantidad_disponible = IFNULL(?, cantidad_disponible),
         unidad = IFNULL(?, unidad),
         fecha_caducidad = IFNULL(?, fecha_caducidad),
         lote = IFNULL(?, lote),
         notas = IFNULL(?, notas),
         estado = ?
       WHERE id_botiquin = ? AND id_usuario = ?`,
      [idCatalogo, cantidad_disponible, unidad, fecha_caducidad, lote, notas, estado, idBotiquin, idUsuario]
    );

    await connection.commit();
    return result.affectedRows > 0;
  } catch (error) {
    if (connection) await connection.rollback();
    throw error;
  } finally {
    if (connection) connection.release();
  }
};

const borrarMedicamentoDB = async (idBotiquin, idUsuario) => {
  const [result] = await pool.query('DELETE FROM botiquin WHERE id_botiquin = ? AND id_usuario = ?', [idBotiquin, idUsuario]);
  return result.affectedRows > 0;
};

module.exports = {
  obtenerInventarioCompleto,
  obtenerAlertasBotiquin,
  agregarMedicamentoDB,
  agregarLoteMedicamentosDB,
  actualizarMedicamentoDB,
  borrarMedicamentoDB
};
