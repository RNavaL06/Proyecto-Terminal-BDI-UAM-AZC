const express = require('express');
const router = express.Router();
const symptomController = require('../controllers/symptomController');
const authMiddleware = require('../middlewares/authMiddleware');

// POST /api/sintomas/analizar -> Procesa síntomas por NLP y cruza con expediente
// Puede llamarse autenticado (para cruzar con historial médico) o sin autenticación
router.post('/analizar', (req, res, next) => {
  // Intentar extraer token opcionalmente
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authMiddleware(req, res, next);
  }
  next();
}, symptomController.analizarSintomas);

module.exports = router;
