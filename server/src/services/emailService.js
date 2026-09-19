const nodemailer = require('nodemailer');
const config = require('../config/env');

let transporter = null;

const obtenerTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.port === 465,
      auth: {
        user: config.email.user,
        pass: config.email.pass,
      },
    });
  }
  return transporter;
};

/**
 * Genera el cuerpo HTML para el correo de notificación de caducidad.
 */
const construirHtml = ({ nombre, alertas, umbralDias, esPrueba = false }) => {
  const badgePrueba = esPrueba
    ? '<div style="background:#fef3c7;border:1px solid #f59e0b;padding:8px 12px;border-radius:6px;margin-bottom:16px;color:#92400e;font-size:13px;text-align:center;"><strong>Modo de Prueba:</strong> Este es un correo de verificación generado a solicitud del usuario.</div>'
    : '';

  const filas = alertas.map((item) => {
    const esCaducado = item.estado === 'caducado' || (item.dias_restantes !== null && item.dias_restantes < 0);
    const colorFondo = esCaducado ? '#fee2e2' : '#fef3c7';
    const colorTexto = esCaducado ? '#991b1b' : '#92400e';
    const estadoTexto = esCaducado ? 'CADUCADO' : `POR VENCER (${item.dias_restantes} días)`;

    return `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 10px 12px; font-weight: bold; color: #1e293b;">${item.nombre_comercial}</td>
        <td style="padding: 10px 12px; color: #64748b;">${item.sustancia_activa || 'N/A'}</td>
        <td style="padding: 10px 12px; color: #334155;">${item.cantidad_disponible} ${item.unidad || 'uds.'}</td>
        <td style="padding: 10px 12px; color: #334155;">${item.fecha_caducidad || 'Sin fecha'}</td>
        <td style="padding: 10px 12px; text-align: center;">
          <span style="background: ${colorFondo}; color: ${colorTexto}; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: bold;">
            ${estadoTexto}
          </span>
        </td>
      </tr>
    `;
  }).join('');

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
      <div style="background: #0284c7; padding: 20px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 20px; letter-spacing: -0.5px;">Botiquín Digital Inteligente (BDI)</h1>
        <p style="color: #e0f2fe; margin: 4px 0 0 0; font-size: 13px;">Alerta Preventiva de Caducidad de Medicamentos</p>
      </div>

      <div style="padding: 24px;">
        ${badgePrueba}
        <p style="color: #334155; font-size: 15px; margin-top: 0;">Hola <strong>${nombre || 'Usuario'}</strong>,</p>
        <p style="color: #475569; font-size: 14px; line-height: 1.5;">
          Hemos detectado <strong>${alertas.length} medicamento(s)</strong> en tu botiquín personal que requieren tu atención inmediata por encontrarse caducados o próximos a vencer dentro del umbral de <strong>${umbralDias} días</strong>.
        </p>

        <div style="overflow-x: auto; margin: 20px 0;">
          <table style="width: 100%; border-collapse: collapse; font-size: 13px; text-align: left;">
            <thead>
              <tr style="background: #f8fafc; border-bottom: 2px solid #cbd5e1; color: #475569;">
                <th style="padding: 10px 12px;">Medicamento</th>
                <th style="padding: 10px 12px;">Sustancia</th>
                <th style="padding: 10px 12px;">Cantidad</th>
                <th style="padding: 10px 12px;">Caducidad</th>
                <th style="padding: 10px 12px; text-align: center;">Estado</th>
              </tr>
            </thead>
            <tbody>
              ${filas}
            </tbody>
          </table>
        </div>

        <div style="background: #f1f5f9; padding: 14px; border-radius: 6px; font-size: 12px; color: #64748b; line-height: 1.4;">
          <strong>Aviso de seguridad sanitaria:</strong> No consumas medicamentos caducados, ya que pueden perder su eficacia terapéutica o generar metabolitos tóxicos. Consulta con tu médico o farmacia local para su disposición segura.
        </div>
      </div>

      <div style="background: #f8fafc; padding: 14px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8;">
        Universidad Autónoma Metropolitana — Unidad Azcapotzalco (CBI)
      </div>
    </div>
  `;
};

/**
 * Envía un correo electrónico a través del transporte configurado.
 */
const enviarCorreo = async ({ to, subject, html }) => {
  const mailer = obtenerTransporter();
  const mailOptions = {
    from: config.email.from,
    to,
    subject,
    html,
  };

  return mailer.sendMail(mailOptions);
};

module.exports = {
  enviarCorreo,
  construirHtml,
};
