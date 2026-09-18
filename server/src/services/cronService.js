const cron = require('node-cron');
const pool = require('../config/db');
const config = require('../config/env');
const emailService = require('./emailService');
const { computeEstado, calcularDiasRestantes } = require('../utils/expirationLogic');

/**
 * Ejecuta el barrido de revisión de medicamentos y envío de correos preventivos.
 */
const ejecutarRevisionCaducidades = async () => {
  console.log('[Cron Notificaciones] Iniciando revisión programada de caducidades...');

  try {
    // 1. Obtener usuarios con notificaciones activas
    const [usuarios] = await pool.query(
      'SELECT id_usuario, correo_electronico, nombre_completo, notif_umbral_dias FROM usuarios WHERE notif_activas = 1'
    );

    if (usuarios.length === 0) {
      console.log('[Cron Notificaciones] No hay usuarios con notificaciones activas.');
      return { procesados: 0, enviados: 0 };
    }

    let correosEnviados = 0;

    for (const usuario of usuarios) {
      // 2. Buscar medicamentos caducados o por vencer dentro del umbral del usuario
      const [rows] = await pool.query(
        `SELECT b.id_botiquin, b.cantidad_disponible, b.unidad, b.fecha_caducidad,
                cm.nombre_comercial, cm.sustancia_activa
         FROM botiquin b
         JOIN catalogo_medicamentos cm ON b.id_catalogo = cm.id_catalogo
         WHERE b.id_usuario = ? 
           AND b.fecha_caducidad IS NOT NULL
           AND b.fecha_caducidad <= DATE_ADD(CURDATE(), INTERVAL ? DAY)
         ORDER BY b.fecha_caducidad ASC`,
        [usuario.id_usuario, usuario.notif_umbral_dias]
      );

      if (rows.length === 0) continue;

      const alertas = rows.map((r) => ({
        ...r,
        estado: computeEstado(r.fecha_caducidad),
        dias_restantes: calcularDiasRestantes(r.fecha_caducidad),
      }));

      const html = emailService.construirHtml({
        nombre: usuario.nombre_completo,
        alertas,
        umbralDias: usuario.notif_umbral_dias,
        esPrueba: false,
      });

      try {
        await emailService.enviarCorreo({
          to: usuario.correo_electronico,
          subject: `BDI Alerta: ${alertas.length} medicamento(s) caducado(s) o por vencer`,
          html,
        });
        correosEnviados++;
        console.log(`[Cron Notificaciones] Correo enviado a ${usuario.correo_electronico}`);
      } catch (mailError) {
        console.error(`[Cron Notificaciones Error] Fallo al enviar a ${usuario.correo_electronico}:`, mailError.message);
      }
    }

    console.log(`[Cron Notificaciones] Revisión finalizada. Correos enviados: ${correosEnviados}/${usuarios.length}`);
    return { procesados: usuarios.length, enviados: correosEnviados };
  } catch (error) {
    console.error('[Cron Notificaciones Error] Error general durante el barrido:', error.message);
    return { procesados: 0, enviados: 0, error: error.message };
  }
};

/**
 * Inicializa la tarea programada con node-cron (por defecto todos los días a las 08:00 AM).
 */
const iniciarCronNotificaciones = () => {
  if (!config.email.cronEnabled) {
    console.log('[Cron Notificaciones] Tarea automática deshabilitada (NOTIF_CRON_ENABLED=false).');
    return null;
  }

  // Expresión: A las 08:00 todos los días ('0 8 * * *')
  const tarea = cron.schedule('0 8 * * *', async () => {
    await ejecutarRevisionCaducidades();
  });

  console.log('[Cron Notificaciones] Tarea programada registrada (diariamente a las 08:00 AM).');
  return tarea;
};

module.exports = {
  iniciarCronNotificaciones,
  ejecutarRevisionCaducidades,
};
