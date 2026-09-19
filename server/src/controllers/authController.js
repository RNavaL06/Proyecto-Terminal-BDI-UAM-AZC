const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const config = require('../config/env');

const client = new OAuth2Client(config.google.clientId);

/**
 * Autenticación mediante Google OAuth: valida el idToken de Google,
 * crea el usuario si es nuevo o actualiza su último acceso, y emite un JWT.
 */
const googleLogin = async (req, res, next) => {
  const { credential, token } = req.body;
  const idToken = credential || token;

  if (!idToken) {
    return res.status(400).json({
      exito: false,
      error: 'Se requiere el token de credenciales de Google (credential).',
    });
  }

  try {
    let payload;

    // Si hay un clientId configurado, validar contra Google
    if (config.google.clientId && config.google.clientId !== 'tu_google_client_id.apps.googleusercontent.com') {
      const ticket = await client.verifyIdToken({
        idToken,
        audience: config.google.clientId,
      });
      payload = ticket.getPayload();
    } else {
      // Modo desarrollo / fallback: decodificar payload de prueba si no hay client_id
      const decoded = jwt.decode(idToken);
      payload = decoded || {
        sub: 'mock_google_id_' + Date.now(),
        email: 'usuario.demo@bdi.salud',
        name: 'Usuario Demo BDI',
        picture: 'https://lh3.googleusercontent.com/a/default-user',
      };
    }

    const { sub: googleId, email, name, picture } = payload;

    // Buscar si el usuario ya existe en la base de datos
    const [rows] = await pool.query('SELECT * FROM usuarios WHERE google_id = ? OR correo_electronico = ?', [
      googleId,
      email,
    ]);

    let usuario;

    if (rows.length > 0) {
      usuario = rows[0];
      // Actualizar fecha de último acceso y foto si cambió
      await pool.query(
        'UPDATE usuarios SET fecha_ultimo_acceso = NOW(), foto_perfil = IFNULL(?, foto_perfil) WHERE id_usuario = ?',
        [picture || null, usuario.id_usuario]
      );
    } else {
      // Registrar nuevo usuario
      const [insertResult] = await pool.query(
        'INSERT INTO usuarios (google_id, correo_electronico, nombre_completo, foto_perfil, rol) VALUES (?, ?, ?, ?, ?)',
        [googleId, email, name || 'Usuario BDI', picture || null, 'paciente']
      );

      const [newUserRows] = await pool.query('SELECT * FROM usuarios WHERE id_usuario = ?', [insertResult.insertId]);
      usuario = newUserRows[0];
    }

    // Generar JWT propio de sesión
    const tokenJwt = jwt.sign(
      {
        id_usuario: usuario.id_usuario,
        id: usuario.id_usuario,
        email: usuario.correo_electronico,
        rol: usuario.rol,
      },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    res.status(200).json({
      exito: true,
      mensaje: 'Inicio de sesión exitoso',
      token: tokenJwt,
      usuario: {
        id_usuario: usuario.id_usuario,
        nombre_completo: usuario.nombre_completo,
        correo_electronico: usuario.correo_electronico,
        foto_perfil: usuario.foto_perfil,
        rol: usuario.rol,
        notif_activas: usuario.notif_activas,
        notif_umbral_dias: usuario.notif_umbral_dias,
      },
    });
  } catch (error) {
    console.error('[Auth Error] Error en googleLogin:', error.message);
    res.status(401).json({
      exito: false,
      error: 'Credencial de Google inválida o expirada.',
      detalles: error.message,
    });
  }
};

/**
 * Retorna el perfil del usuario autenticado a partir del token JWT.
 */
const getProfile = async (req, res, next) => {
  try {
    const idUsuario = req.usuario.id_usuario;
    const [rows] = await pool.query(
      'SELECT id_usuario, correo_electronico, nombre_completo, foto_perfil, rol, notif_activas, notif_umbral_dias, fecha_registro FROM usuarios WHERE id_usuario = ?',
      [idUsuario]
    );

    if (rows.length === 0) {
      return res.status(404).json({ exito: false, error: 'Usuario no encontrado.' });
    }

    res.status(200).json({
      exito: true,
      usuario: rows[0],
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  googleLogin,
  getProfile,
};
