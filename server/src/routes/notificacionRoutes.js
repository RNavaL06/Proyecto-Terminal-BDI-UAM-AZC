const express = require('express');
const router = express.Router();
const notificacionController = require('../controllers/notificacionController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

// GET /api/notificaciones/preferencias -> Consulta umbral y estado de notificaciones
router.get('/preferencias', notificacionController.obtenerPreferencias);

// PUT /api/notificaciones/preferencias -> Actualiza configuración
router.put('/preferencias', notificacionController.actualizarPreferencias);

// POST /api/notificaciones/probar -> Envía correo de prueba inmediato
router.post('/probar', notificacionController.enviarCorreoPrueba);

module.exports = router;
