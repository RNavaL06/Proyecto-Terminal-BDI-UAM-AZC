const express = require('express');
const router = express.Router();
const pushController = require('../controllers/pushController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/suscribir', authMiddleware, pushController.guardarSuscripcion);
router.post('/desuscribir', authMiddleware, pushController.eliminarSuscripcion);

// Endpoint público para que el frontend obtenga la Public Key de VAPID
router.get('/vapidPublicKey', (req, res) => {
  res.json({ publicKey: process.env.VAPID_PUBLIC_KEY });
});

module.exports = router;
