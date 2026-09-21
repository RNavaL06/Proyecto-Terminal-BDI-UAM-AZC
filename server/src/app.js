const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const config = require('./config/env');

const authRoutes = require('./routes/authRoutes');
const recetaRoutes = require('./routes/recetaRoutes');
const symptomRoutes = require('./routes/symptomRoutes');
const inventarioRoutes = require('./routes/inventarioRoutes');
const farmaciaRoutes = require('./routes/farmaciaRoutes');
const notificacionRoutes = require('./routes/notificacionRoutes');
const healthRoutes = require('./routes/healthRoutes');
const pushRoutes = require('./routes/pushRoutes');
const recordatoriosRoutes = require('./routes/recordatoriosRoutes');

const { notFoundHandler, errorHandler } = require('./middlewares/errorHandler');

const app = express();

// Middlewares de seguridad y observabilidad
app.use(helmet({
  crossOriginResourcePolicy: false,
}));

app.use(cors({
  origin: config.nodeEnv === 'development' ? true : (config.clientUrl || true),
  credentials: true,
}));

app.use(morgan(config.nodeEnv === 'production' ? 'combined' : 'dev'));

// Admite cargas pesadas en Base64 para escaneo de recetas
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Montaje de rutas de la API
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/recetas', recetaRoutes);
app.use('/api/sintomas', symptomRoutes);
app.use('/api/inventario', inventarioRoutes);
app.use('/api/farmacias', farmaciaRoutes);
app.use('/api/notificaciones', notificacionRoutes);
app.use('/api/push', pushRoutes);
app.use('/api/recordatorios', recordatoriosRoutes);

// Manejo de errores
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
