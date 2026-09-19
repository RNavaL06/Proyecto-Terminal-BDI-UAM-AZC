const pool = require('../config/db');

const guardarSuscripcion = async (req, res, next) => {
  try {
    const { endpoint, keys } = req.body;
    const idUsuario = req.usuario.id_usuario;

    if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
      return res.status(400).json({ exito: false, mensaje: 'Faltan datos de suscripción push' });
    }

    // Verificar si ya existe para este usuario y endpoint
    const [existente] = await pool.query(
      'SELECT id_suscripcion FROM suscripciones_push WHERE id_usuario = ? AND endpoint = ?',
      [idUsuario, endpoint]
    );

    if (existente.length > 0) {
      // Actualizar por si las keys cambiaron
      await pool.query(
        'UPDATE suscripciones_push SET keys_p256dh = ?, keys_auth = ? WHERE id_suscripcion = ?',
        [keys.p256dh, keys.auth, existente[0].id_suscripcion]
      );
    } else {
      await pool.query(
        'INSERT INTO suscripciones_push (id_usuario, endpoint, keys_p256dh, keys_auth) VALUES (?, ?, ?, ?)',
        [idUsuario, endpoint, keys.p256dh, keys.auth]
      );
    }

    res.status(200).json({ exito: true, mensaje: 'Suscripción guardada correctamente' });
  } catch (error) {
    console.error('Error al guardar suscripción push:', error);
    next(error);
  }
};

const eliminarSuscripcion = async (req, res, next) => {
  try {
    const { endpoint } = req.body;
    const idUsuario = req.usuario.id_usuario;

    if (!endpoint) return res.status(400).json({ exito: false, mensaje: 'Se requiere endpoint' });

    await pool.query('DELETE FROM suscripciones_push WHERE id_usuario = ? AND endpoint = ?', [idUsuario, endpoint]);
    res.status(200).json({ exito: true, mensaje: 'Suscripción eliminada' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  guardarSuscripcion,
  eliminarSuscripcion
};
