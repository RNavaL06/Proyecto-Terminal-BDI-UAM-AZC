const express = require('express');
const router = express.Router();
const inventarioController = require('../controllers/inventarioController');
const authMiddleware = require('../middlewares/authMiddleware');
const validateSchema = require('../middlewares/validateSchema');
const { inventarioSchema, inventarioBatchSchema } = require('../validators/inventarioSchema');
const { visionLimiter } = require('../middlewares/rateLimiter');

router.use(authMiddleware);

// GET /api/inventario -> Listado con resumen de caducidades
router.get('/', inventarioController.listarInventario);

// GET /api/inventario/alertas -> Alertas de vencimiento próximo
router.get('/alertas', inventarioController.obtenerAlertas);

// POST /api/inventario/analizar -> OCR caja de medicamento
router.post('/analizar', visionLimiter, inventarioController.analizarCajaMedicamento);

// POST /api/inventario -> Agregar medicamento individual
router.post('/', validateSchema(inventarioSchema), inventarioController.agregarMedicamento);

// POST /api/inventario/batch -> Agregar lote de medicamentos
router.post('/batch', validateSchema(inventarioBatchSchema), inventarioController.agregarBatch);

// PUT /api/inventario/:id -> Actualizar medicamento
router.put('/:id', inventarioController.actualizarMedicamento);

// DELETE /api/inventario/:id -> Eliminar medicamento
router.delete('/:id', inventarioController.eliminarMedicamento);

module.exports = router;
