const pool = require('../config/db');
const emailService = require('../services/emailService');
const { computeEstado, calcularDiasRestantes } = require('../utils/expirationLogic');

/**
 * Obtiene las preferencias de notificación por correo del usuario autenticado.
 */
const obtenerPreferencias = async (req, res, next) => {
  const idUsuario = req.usuario.id_usuario;

  try {
    const [rows] = await pool.query(
      'SELECT notif_activas, notif_umbral_dias, correo_electronico FROM usuarios WHERE id_usuario = ?',
      [idUsuario]
    );

    if (rows.length === 0) {
      return res.status(404).json({ exito: false, error: 'Usuario no encontrado.' });
    }

    res.status(200).json({
      exito: true,
      preferencias: {
        notif_activas: Boolean(rows[0].notif_activas),
        notif_umbral_dias: rows[0].notif_umbral_dias,
        correo_electronico: rows[0].correo_electronico,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Actualiza las preferencias de notificación de caducidad.
 */
const actualizarPreferencias = async (req, res, next) => {
  const idUsuario = req.usuario.id_usuario;
  const { notif_activas, notif_umbral_dias } = req.body;

  const umbral = Math.max(1, Math.min(365, parseInt(notif_umbral_dias || '30', 10)));
  const activas = notif_activas !== undefined ? (notif_activas ? 1 : 0) : 1;

  try {
    await pool.query(
      'UPDATE usuarios SET notif_activas = ?, notif_umbral_dias = ? WHERE id_usuario = ?',
      [activas, umbral, idUsuario]
    );

    res.status(200).json({
      exito: true,
      mensaje: 'Preferencias de notificación actualizadas exitosamente.',
      preferencias: {
        notif_activas: Boolean(activas),
        notif_umbral_dias: umbral,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Envía un correo de prueba inmediato al correo del usuario con sus alertas reales.
 */
const enviarCorreoPrueba = async (req, res, next) => {
  const idUsuario = req.usuario.id_usuario;

  try {
    const [userRows] = await pool.query(
      'SELECT nombre_completo, correo_electronico, notif_umbral_dias FROM usuarios WHERE id_usuario = ?',
      [idUsuario]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ exito: false, error: 'Usuario no encontrado.' });
    }

    const usuario = userRows[0];

    // Buscar medicamentos con alerta
    const [rows] = await pool.query(
      `SELECT b.id_botiquin, b.cantidad_disponible, b.unidad, b.fecha_caducidad,
              cm.nombre_comercial, cm.sustancia_activa
       FROM botiquin b
       JOIN catalogo_medicamentos cm ON b.id_catalogo = cm.id_catalogo
       WHERE b.id_usuario = ? 
         AND b.fecha_caducidad IS NOT NULL
         AND b.fecha_caducidad <= DATE_ADD(CURDATE(), INTERVAL ? DAY)
       ORDER BY b.fecha_caducidad ASC`,
      [idUsuario, usuario.notif_umbral_dias]
    );

    const alertas = rows.map((r) => ({
      ...r,
      estado: computeEstado(r.fecha_caducidad),
      dias_restantes: calcularDiasRestantes(r.fecha_caducidad),
    }));

    const html = emailService.construirHtml({
      nombre: usuario.nombre_completo,
      alertas,
      umbralDias: usuario.notif_umbral_dias,
      esPrueba: true,
    });

    await emailService.enviarCorreo({
      to: usuario.correo_electronico,
      subject: `BDI [Prueba]: ${alertas.length} medicamento(s) en seguimiento de caducidad`,
      html,
    });

    res.status(200).json({
      exito: true,
      mensaje: `Correo de prueba enviado con éxito a ${usuario.correo_electronico}`,
      alertas_incluidas: alertas.length,
    });
  } catch (error) {
    console.error('[Notificacion Error] Fallo al enviar correo de prueba:', error);
    next(error);
  }
};

module.exports = {
  obtenerPreferencias,
  actualizarPreferencias,
  enviarCorreoPrueba,
};
