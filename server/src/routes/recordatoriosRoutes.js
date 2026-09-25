const express = require('express');
const router = express.Router();
const recordatoriosController = require('../controllers/recordatoriosController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/hoy', authMiddleware, recordatoriosController.getTomasHoy);
router.post('/', authMiddleware, recordatoriosController.crearRecordatorio);
router.put('/toma/:id_toma/completar', authMiddleware, recordatoriosController.marcarToma);

router.get('/pendientes', authMiddleware, recordatoriosController.getTomasPendientesAyer);
router.put('/toma/:id_toma/omitir', authMiddleware, recordatoriosController.omitirToma);

// Rutas de integración con Recetas
router.get('/receta/:id_receta', authMiddleware, recordatoriosController.getRecordatoriosPorReceta);
router.post('/toggle-receta', authMiddleware, recordatoriosController.toggleRecordatorioReceta);

module.exports = router;
