const pool = require('../config/db');
const { parsearFrecuencia, parsearDuracion } = require('../utils/nlpParser');

// Obtener las tomas programadas para el día actual del usuario
const getTomasHoy = async (req, res, next) => {
  try {
    const idUsuario = req.usuario.id_usuario;

    // Auto-marcar como omitidas las tomas pendientes con más de 48 horas de antigüedad
    await pool.query(`
      UPDATE tomas_diarias 
      SET estado = 'omitido' 
      WHERE id_usuario = ? 
        AND estado = 'pendiente' 
        AND fecha_hora_programada < DATE_SUB(NOW(), INTERVAL 48 HOUR)
    `, [idUsuario]);

    // Buscar tomas de hoy, ordenadas por hora
    const [tomas] = await pool.query(`
      SELECT 
        td.id_toma,
        td.fecha_hora_programada,
        td.estado,
        r.medicamento_nombre,
        r.formato
      FROM tomas_diarias td
      JOIN recordatorios r ON td.id_recordatorio = r.id_recordatorio
      WHERE td.id_usuario = ? 
        AND DATE(td.fecha_hora_programada) = CURDATE()
      ORDER BY td.fecha_hora_programada ASC
    `, [idUsuario]);

    res.status(200).json({
      exito: true,
      tomas: tomas.map(t => ({
        id: t.id_toma,
        medicamento: t.medicamento_nombre,
        tipo: t.formato,
        hora: new Date(t.fecha_hora_programada).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
        horaReal: t.fecha_hora_programada,
        estado: t.estado
      }))
    });
  } catch (error) {
    console.error('Error al obtener tomas de hoy:', error);
    next(error);
  }
};

// Marcar una toma como completada
const marcarToma = async (req, res, next) => {
  try {
    const idUsuario = req.usuario.id_usuario;
    const { id_toma } = req.params;

    const [toma] = await pool.query('SELECT estado, fecha_hora_programada FROM tomas_diarias WHERE id_toma = ? AND id_usuario = ?', [id_toma, idUsuario]);
    if (toma.length === 0) {
      return res.status(404).json({ exito: false, mensaje: 'Toma no encontrada o no autorizada' });
    }

    const fechaHoraProgramada = new Date(toma[0].fecha_hora_programada);
    const ahora = new Date();

    if (fechaHoraProgramada > ahora) {
      return res.status(400).json({ exito: false, mensaje: 'Aún no es hora de tomar este medicamento' });
    }

    await pool.query(
      "UPDATE tomas_diarias SET estado = 'tomado', fecha_hora_toma = NOW() WHERE id_toma = ?",
      [id_toma]
    );

    res.status(200).json({ exito: true, mensaje: 'Toma marcada como completada' });
  } catch (error) {
    next(error);
  }
};

// Marcar una toma como omitida
const omitirToma = async (req, res, next) => {
  try {
    const idUsuario = req.usuario.id_usuario;
    const { id_toma } = req.params;

    const [toma] = await pool.query('SELECT estado FROM tomas_diarias WHERE id_toma = ? AND id_usuario = ?', [id_toma, idUsuario]);
    if (toma.length === 0) {
      return res.status(404).json({ exito: false, mensaje: 'Toma no encontrada o no autorizada' });
    }

    await pool.query(
      "UPDATE tomas_diarias SET estado = 'omitido' WHERE id_toma = ?",
      [id_toma]
    );

    res.status(200).json({ exito: true, mensaje: 'Toma marcada como omitida' });
  } catch (error) {
    next(error);
  }
};

// Obtener tomas pendientes de ayer
const getTomasPendientesAyer = async (req, res, next) => {
  try {
    const idUsuario = req.usuario.id_usuario;

    const [tomas] = await pool.query(`
      SELECT 
        td.id_toma,
        td.fecha_hora_programada,
        td.estado,
        r.medicamento_nombre,
        r.formato
      FROM tomas_diarias td
      JOIN recordatorios r ON td.id_recordatorio = r.id_recordatorio
      WHERE td.id_usuario = ? 
        AND td.estado = 'pendiente'
        AND DATE(td.fecha_hora_programada) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)
      ORDER BY td.fecha_hora_programada ASC
    `, [idUsuario]);

    res.status(200).json({
      exito: true,
      tomas: tomas.map(t => ({
        id: t.id_toma,
        medicamento: t.medicamento_nombre,
        tipo: t.formato,
        hora: new Date(t.fecha_hora_programada).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
        horaReal: t.fecha_hora_programada,
        estado: t.estado
      }))
    });
  } catch (error) {
    next(error);
  }
};

// Crear recordatorio (y sus tomas físicas)
const crearRecordatorio = async (req, res, next) => {
  try {
    const idUsuario = req.usuario.id_usuario;
    const { medicamento_nombre, formato, frecuencia_horas, dias_duracion } = req.body;

    if (!medicamento_nombre || !frecuencia_horas || !dias_duracion) {
      return res.status(400).json({ exito: false, mensaje: 'Faltan datos obligatorios para el recordatorio' });
    }

    const fechaInicio = new Date();
    // Sumar días para fecha_fin
    const fechaFin = new Date();
    fechaFin.setDate(fechaFin.getDate() + parseInt(dias_duracion));

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const [resRecordatorio] = await conn.query(
        'INSERT INTO recordatorios (id_usuario, medicamento_nombre, formato, frecuencia_horas, fecha_inicio, fecha_fin) VALUES (?, ?, ?, ?, ?, ?)',
        [idUsuario, medicamento_nombre, formato || 'Tableta', frecuencia_horas, fechaInicio, fechaFin]
      );
      
      const idRecordatorio = resRecordatorio.insertId;

      // Generar tomas físicas
      let currentTime = new Date(fechaInicio.getTime());
      // Para efectos de demo, ajustamos la primera toma al futuro cercano si queremos probar push
      currentTime.setMinutes(currentTime.getMinutes() + 2); // Primera toma en 2 mins para pruebas

      const tomasValues = [];
      while (currentTime <= fechaFin) {
        tomasValues.push([idRecordatorio, idUsuario, new Date(currentTime.getTime())]);
        currentTime.setHours(currentTime.getHours() + parseInt(frecuencia_horas));
      }

      if (tomasValues.length > 0) {
        await conn.query(
          'INSERT INTO tomas_diarias (id_recordatorio, id_usuario, fecha_hora_programada) VALUES ?',
          [tomasValues]
        );
      }

      await conn.commit();
      res.status(201).json({ exito: true, mensaje: 'Recordatorio y tomas generados', total_tomas: tomasValues.length });
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }
  } catch (error) {
    console.error('Error al crear recordatorio:', error);
    next(error);
  }
};

// Obtener estado de recordatorios vinculados a una receta específica
const getRecordatoriosPorReceta = async (req, res, next) => {
  try {
    const idUsuario = req.usuario.id_usuario;
    const idReceta = req.params.id_receta;

    const [rows] = await pool.query(`
      SELECT r.id_recordatorio, r.id_receta_detalle, rd.id_catalogo, rd.dosis
      FROM recordatorios r
      JOIN recetas_detalles rd ON r.id_receta_detalle = rd.id_receta_detalle
      WHERE r.id_usuario = ? AND rd.id_receta = ?
    `, [idUsuario, idReceta]);

    // Devolvemos un array con los IDs de receta_detalle que tienen alarma activa
    const activos = rows.map(r => r.id_receta_detalle);
    
    res.status(200).json({ exito: true, activos });
  } catch (error) {
    next(error);
  }
};

// Alternar (crear/borrar) un recordatorio para un detalle de receta
const toggleRecordatorioReceta = async (req, res, next) => {
  try {
    const idUsuario = req.usuario.id_usuario;
    const { id_receta_detalle, activo, medicamento_nombre, formato, frecuencia_texto, duracion_texto } = req.body;

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      if (!activo) {
        // Borrar recordatorio si se desactiva
        await conn.query('DELETE FROM recordatorios WHERE id_receta_detalle = ? AND id_usuario = ?', [id_receta_detalle, idUsuario]);
        await conn.commit();
        return res.status(200).json({ exito: true, mensaje: 'Recordatorio desactivado', estado: false });
      } else {
        // Crear recordatorio si se activa
        // Primero verificamos si ya existe para no duplicar
        const [existe] = await conn.query('SELECT id_recordatorio FROM recordatorios WHERE id_receta_detalle = ? AND id_usuario = ?', [id_receta_detalle, idUsuario]);
        if (existe.length > 0) {
          await conn.commit();
          return res.status(200).json({ exito: true, mensaje: 'Ya estaba activo', estado: true });
        }

        const freqHoras = parsearFrecuencia(frecuencia_texto);
        const dias = parsearDuracion(duracion_texto);

        if (!freqHoras || !dias) {
          await conn.rollback();
          return res.status(400).json({ 
            exito: false, 
            error: 'No se pudo entender la frecuencia o duración automáticamente. Por favor ingrésalo manualmente en la pestaña Recordatorios.'
          });
        }

        const fechaInicio = new Date();
        const fechaFin = new Date();
        fechaFin.setDate(fechaFin.getDate() + dias);

        const [resRecordatorio] = await conn.query(
          'INSERT INTO recordatorios (id_usuario, medicamento_nombre, formato, frecuencia_horas, fecha_inicio, fecha_fin, id_receta_detalle) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [idUsuario, medicamento_nombre, formato || 'Tableta', freqHoras, fechaInicio, fechaFin, id_receta_detalle]
        );
        
        const idRecordatorio = resRecordatorio.insertId;

        let currentTime = new Date(fechaInicio.getTime());
        const tomasValues = [];
        
        // Empezamos la primera toma ajustada a la próxima hora que aplique o de inmediato
        while (currentTime <= fechaFin) {
          tomasValues.push([idRecordatorio, idUsuario, new Date(currentTime.getTime())]);
          currentTime.setHours(currentTime.getHours() + freqHoras);
        }

        if (tomasValues.length > 0) {
          await conn.query(
            'INSERT INTO tomas_diarias (id_recordatorio, id_usuario, fecha_hora_programada) VALUES ?',
            [tomasValues]
          );
        }

        await conn.commit();
        return res.status(201).json({ exito: true, mensaje: 'Recordatorio generado', estado: true });
      }
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTomasHoy,
  getTomasPendientesAyer,
  marcarToma,
  omitirToma,
  crearRecordatorio,
  getRecordatoriosPorReceta,
  toggleRecordatorioReceta
};
