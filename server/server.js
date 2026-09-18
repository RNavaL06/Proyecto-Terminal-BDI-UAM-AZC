const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const app = require('./src/app');
const config = require('./src/config/env');
const { testConnection } = require('./src/config/db');
const { inicializarMotorNLP } = require('./src/services/nlpService');
const { iniciarCronNotificaciones } = require('./src/services/cronService');

const startServer = async () => {
  console.log('====================================================');
  console.log('  Botiquín Digital Inteligente (BDI) — Backend Final');
  console.log('  UAM Azcapotzalco (CBI) - Proyecto Terminal');
  console.log('====================================================');

  // 1. Probar conectividad con MySQL
  await testConnection();

  // 2. Inicializar y entrenar motor NLP con catalogo_cie10
  await inicializarMotorNLP();

  // 3. Registrar cron de notificaciones por correo
  iniciarCronNotificaciones();

  // 4. Iniciar servidor Express
  app.listen(config.port, () => {
    console.log(`[Servidor] Escuchando en el puerto ${config.port} (${config.nodeEnv})`);
    console.log(`[Servidor] Rutas base disponibles en http://localhost:${config.port}/api`);
    console.log(`[Servidor] Health Check: http://localhost:${config.port}/api/health`);
  });
};

startServer().catch((err) => {
  console.error('[Error Fatal al iniciar servidor]:', err);
  process.exit(1);
});
