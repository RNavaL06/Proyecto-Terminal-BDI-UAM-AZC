const pool = require('./src/config/db');
const fs = require('fs');

async function dumpSchema() {
  try {
    const [tables] = await pool.query('SHOW TABLES');
    const dbName = Object.values(tables[0] || {})[0] ? Object.keys(tables[0])[0] : 'Tables_in_bdi_final_db';
    
    let schema = {};
    for (const row of tables) {
      const tableName = row[dbName];
      const [columns] = await pool.query(`SHOW COLUMNS FROM ${tableName}`);
      schema[tableName] = columns.map(c => ({ Field: c.Field, Type: c.Type }));
    }
    
    fs.writeFileSync('schema_dump.json', JSON.stringify(schema, null, 2));
    console.log('Schema dumped successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error dumping schema:', error);
    process.exit(1);
  }
}

dumpSchema();
