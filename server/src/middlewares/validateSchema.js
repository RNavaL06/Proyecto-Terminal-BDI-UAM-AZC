/**
 * server/src/middlewares/validateSchema.js
 */
const validateSchema = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (err) {
    return res.status(400).json({
      exito: false,
      error: 'Error de validación de datos',
      detalles: err.errors
    });
  }
};

module.exports = validateSchema;
