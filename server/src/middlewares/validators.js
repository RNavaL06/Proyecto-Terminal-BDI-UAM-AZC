const { validationResult } = require('express-validator');

// Middleware para verificar errores de validación de express-validator
const checkValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      exito: false,
      error: 'Parámetros de entrada inválidos',
      detalles: errors.array(),
    });
  }
  next();
};

module.exports = { checkValidation };
