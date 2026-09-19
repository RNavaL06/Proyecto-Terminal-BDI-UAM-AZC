const express = require('express');
const router = express.Router();
const recetaController = require('../controllers/recetaController');
const authMiddleware = require('../middlewares/authMiddleware');

// Todas las rutas de recetas requieren token JWT
router.use(authMiddleware);

// POST /api/recetas/analizar -> Analiza imagen con IA y Sharp
router.post('/analizar', recetaController.analizarReceta);

// POST /api/recetas/guardar -> Guarda receta validada transaccionalmente en 3NF
router.post('/guardar', recetaController.guardarReceta);

// GET /api/recetas -> Historial paginado de recetas
router.get('/', recetaController.listarRecetas);

// GET /api/recetas/:id -> Detalle completo de receta con imagen
router.get('/:id', recetaController.obtenerReceta);

// PUT /api/recetas/:id -> Actualizar receta
router.put('/:id', recetaController.actualizarReceta);

// DELETE /api/recetas/:id -> Eliminar receta del historial
router.delete('/:id', recetaController.eliminarReceta);

module.exports = router;
