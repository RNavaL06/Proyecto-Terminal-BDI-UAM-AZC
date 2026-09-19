const express = require('express');
const router = express.Router();
const inventarioController = require('../controllers/inventarioController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

// GET /api/inventario -> Listado con resumen de caducidades
router.get('/', inventarioController.listarInventario);

// GET /api/inventario/alertas -> Alertas de vencimiento próximo
router.get('/alertas', inventarioController.obtenerAlertas);

// POST /api/inventario/analizar -> OCR caja de medicamento
router.post('/analizar', inventarioController.analizarCajaMedicamento);

// POST /api/inventario -> Agregar medicamento individual
router.post('/', inventarioController.agregarMedicamento);

// POST /api/inventario/batch -> Agregar lote de medicamentos
router.post('/batch', inventarioController.agregarBatch);

// PUT /api/inventario/:id -> Actualizar medicamento
router.put('/:id', inventarioController.actualizarMedicamento);

// DELETE /api/inventario/:id -> Eliminar medicamento
router.delete('/:id', inventarioController.eliminarMedicamento);

module.exports = router;
