/**
 * server/src/middlewares/rateLimiter.js
 */
const rateLimit = require('express-rate-limit');

const visionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 30, // Máximo 30 solicitudes por IP
  message: {
    exito: false,
    error: 'Has alcanzado el límite de digitalización de recetas por ahora. Intenta más tarde.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const symptomLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutos
  max: 50,
  message: {
    exito: false,
    error: 'Demasiadas consultas de síntomas. Espera unos minutos.',
  },
});

module.exports = { visionLimiter, symptomLimiter };
