const express = require('express');
const router = express.Router();
const farmaciaController = require('../controllers/farmaciaController');
const authMiddleware = require('../middlewares/authMiddleware');

// Rutas protegidas que guardan o consultan historial
router.post('/buscar', authMiddleware, farmaciaController.buscarPrecios);
router.get('/historial', authMiddleware, farmaciaController.historialBusquedas);

// Rutas de geolocalización y mapa
router.post('/cercanas', farmaciaController.obtenerFarmaciasCercanas);
router.get('/cercanas', farmaciaController.obtenerFarmaciasCercanas);
router.get('/autocompletar', farmaciaController.autocompletarDireccion);
router.get('/reversa', farmaciaController.obtenerDireccionReversa);
router.post('/reversa', farmaciaController.obtenerDireccionReversa);

module.exports = router;
