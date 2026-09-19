const cron = require('node-cron');
const pool = require('../config/db');
const config = require('../config/env');
const emailService = require('./emailService');
const { computeEstado, calcularDiasRestantes } = require('../utils/expirationLogic');
const webpush = require('web-push');

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT || 'mailto:example@yourdomain.org',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

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
    console.log('[Cron Notificaciones] Tarea automática de emails deshabilitada.');
  } else {
    // Expresión: A las 08:00 todos los días ('0 8 * * *')
    cron.schedule('0 8 * * *', async () => {
      await ejecutarRevisionCaducidades();
    });
    console.log('[Cron Notificaciones] Tarea de emails registrada (diariamente a las 08:00 AM).');
  }

  // Cron para Recordatorios (Notificaciones Web Push) - Corre cada minuto
  cron.schedule('* * * * *', async () => {
    try {
      // Buscar tomas pendientes programadas para los próximos 5 minutos que no hayan sido notificadas
      // NOTA: Para simplificar, buscamos tomas cuya hora coincida en este minuto exacto (o esté en el pasado sin tomar).
      // Aquí notificamos si faltan 0-5 mins
      const [tomasPorNotificar] = await pool.query(`
        SELECT td.id_toma, td.id_usuario, td.fecha_hora_programada, r.medicamento_nombre, r.formato
        FROM tomas_diarias td
        JOIN recordatorios r ON td.id_recordatorio = r.id_recordatorio
        WHERE td.estado = 'pendiente'
          AND td.fecha_hora_programada > NOW()
          AND td.fecha_hora_programada <= DATE_ADD(NOW(), INTERVAL 5 MINUTE)
      `);

      if (tomasPorNotificar.length > 0) {
        // En un app real, habría que marcar que la notif ya se envió para no spam.
        // Aquí asumimos que corre cada minuto y notifica a los que están EXACTAMENTE a 5,4,3,2,1 min.
        // Lo mejor es buscar las que están entre 4 y 5 minutos para enviarlas 1 sola vez.
        const [exactamente5Mins] = await pool.query(`
          SELECT td.id_toma, td.id_usuario, td.fecha_hora_programada, r.medicamento_nombre, r.formato
          FROM tomas_diarias td
          JOIN recordatorios r ON td.id_recordatorio = r.id_recordatorio
          WHERE td.estado = 'pendiente'
            AND td.fecha_hora_programada > DATE_ADD(NOW(), INTERVAL 4 MINUTE)
            AND td.fecha_hora_programada <= DATE_ADD(NOW(), INTERVAL 5 MINUTE)
        `);

        for (const toma of exactamente5Mins) {
          const [suscripciones] = await pool.query(
            'SELECT * FROM suscripciones_push WHERE id_usuario = ?',
            [toma.id_usuario]
          );

          for (const sub of suscripciones) {
            const pushSubscription = {
              endpoint: sub.endpoint,
              keys: {
                p256dh: sub.keys_p256dh,
                auth: sub.keys_auth
              }
            };

            const payload = JSON.stringify({
              title: 'Recordatorio de Medicamento',
              body: `Te toca tomar ${toma.medicamento_nombre} (${toma.formato}) en 5 minutos.`,
              url: '/dashboard'
            });

            try {
              await webpush.sendNotification(pushSubscription, payload);
              console.log(`[Push] Enviado recordatorio a usuario ${toma.id_usuario} para ${toma.medicamento_nombre}`);
            } catch (err) {
              console.error('[Push Error]', err);
              if (err.statusCode === 410) {
                // Gone - Suscripción expirada o revocada
                await pool.query('DELETE FROM suscripciones_push WHERE id_suscripcion = ?', [sub.id_suscripcion]);
              }
            }
          }
        }
      }
    } catch (e) {
      console.error('[Cron Push Error]', e);
    }
  });

  console.log('[Cron Recordatorios] Tarea push registrada (ejecución cada minuto).');
};

module.exports = {
  iniciarCronNotificaciones,
  ejecutarRevisionCaducidades,
};
