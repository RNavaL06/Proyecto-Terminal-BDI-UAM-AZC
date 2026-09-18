const config = require('../config/env');

const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    exito: false,
    error: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
  });
};

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const mensaje = err.message || 'Error interno del servidor';

  console.error(`[Error Handler] ${req.method} ${req.originalUrl} - ${statusCode}: ${mensaje}`);
  if (statusCode === 500 && err.stack) {
    console.error(err.stack);
  }

  res.status(statusCode).json({
    exito: false,
    error: mensaje,
    detalles: err.detalles || undefined,
    stack: config.nodeEnv === 'development' ? err.stack : undefined,
  });
};

module.exports = { notFoundHandler, errorHandler };
