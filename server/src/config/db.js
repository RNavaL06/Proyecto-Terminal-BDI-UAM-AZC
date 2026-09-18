const mysql = require('mysql2/promise');
const config = require('./env');

const pool = mysql.createPool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  waitForConnections: true,
  connectionLimit: 15,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

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
