const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

// POST /api/auth/google -> Login con credenciales de Google
router.post('/google', authController.googleLogin);

// GET /api/auth/me -> Perfil del usuario autenticado
router.get('/me', authMiddleware, authController.getProfile);

module.exports = router;
