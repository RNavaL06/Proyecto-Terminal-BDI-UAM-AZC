const jwt = require('jsonwebtoken');
const config = require('../config/env');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({
      exito: false,
      error: 'Acceso no autorizado. Se requiere un token Bearer válido.',
    });
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    // Unificar id_usuario en el objeto req.usuario
    req.usuario = {
      id_usuario: decoded.id_usuario || decoded.id,
      id: decoded.id_usuario || decoded.id,
      email: decoded.email,
      rol: decoded.rol || 'paciente',
    };
    next();
  } catch (error) {
    return res.status(401).json({
      exito: false,
      error: 'Token inválido o expirado. Inicia sesión nuevamente.',
    });
  }
};

module.exports = authMiddleware;
