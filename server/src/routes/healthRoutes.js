const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// GET /api/health -> Estado del servidor y de la base de datos
router.get('/', async (req, res) => {
  let dbStatus = 'ok';
  let dbLatency = null;

  try {
    const inicio = Date.now();
    await pool.query('SELECT 1');
    dbLatency = `${Date.now() - inicio}ms`;
  } catch (err) {
    dbStatus = 'disconnected';
  }

  res.status(dbStatus === 'ok' ? 200 : 503).json({
    status: dbStatus === 'ok' ? 'ok' : 'degraded',
    servicio: 'Botiquín Digital Inteligente (BDI)',
    timestamp: new Date().toISOString(),
    database: {
      status: dbStatus,
      latency: dbLatency,
    },
  });
});

module.exports = router;
