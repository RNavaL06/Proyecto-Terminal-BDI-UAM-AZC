const mysql = require('mysql2/promise');
const config = require('./env');

let poolConfig = {
  waitForConnections: true,
  connectionLimit: 15,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
};

if (config.db.uri) {
  try {
    const dbUrl = new URL(config.db.uri);
    poolConfig.host = dbUrl.hostname;
    poolConfig.port = dbUrl.port || 3306;
    poolConfig.user = dbUrl.username;
    poolConfig.password = decodeURIComponent(dbUrl.password);
    poolConfig.database = dbUrl.pathname.slice(1);
    poolConfig.ssl = { rejectUnauthorized: false }; // Requerido para Aiven y otros servicios Cloud
  } catch (error) {
    console.error('[MySQL Error] Error al parsear DB_URI:', error.message);
  }
} else {
  poolConfig.host = config.db.host;
  poolConfig.port = config.db.port;
  poolConfig.user = config.db.user;
  poolConfig.password = config.db.password;
  poolConfig.database = config.db.database;
}

const pool = mysql.createPool(poolConfig);

// Función de diagnóstico para probar conectividad al inicio
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log(`[MySQL] Conexión establecida exitosamente con la base de datos: ${config.db.database}`);
    connection.release();
    return true;
  } catch (error) {
    console.error(`[MySQL Error] No se pudo conectar a la base de datos: ${error.message}`);
    return false;
  }
};

module.exports = pool;
module.exports.testConnection = testConnection;
