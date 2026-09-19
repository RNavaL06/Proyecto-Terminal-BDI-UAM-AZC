const pool = require('./src/config/db');

async function addColumn() {
  try {
    const [rows] = await pool.query("SHOW COLUMNS FROM recordatorios LIKE 'id_receta_detalle'");
    if (rows.length === 0) {
      await pool.query("ALTER TABLE recordatorios ADD COLUMN id_receta_detalle INT UNSIGNED NULL");
      await pool.query("ALTER TABLE recordatorios ADD CONSTRAINT fk_rec_det FOREIGN KEY (id_receta_detalle) REFERENCES recetas_detalles(id_receta_detalle) ON DELETE SET NULL");
      console.log("Columna agregada exitosamente.");
    } else {
      console.log("La columna ya existe.");
    }
  } catch (error) {
    console.error("Error", error);
  } finally {
    process.exit();
  }
}
addColumn();
