const pool = require('./src/config/db');

async function seedDemoData() {
  console.log('Iniciando seed para usuario Demo...');

  try {
    // 1. Verificar o crear el usuario de prueba
    const googleId = 'demo_google_id_uam';
    const email = 'version.demo@bdi.salud';
    
    let [rows] = await pool.query('SELECT id_usuario FROM usuarios WHERE google_id = ?', [googleId]);
    let idUsuario;
    
    if (rows.length === 0) {
      console.log('Creando usuario de prueba...');
      const [insertUser] = await pool.query(
        'INSERT INTO usuarios (google_id, correo_electronico, nombre_completo, foto_perfil, rol) VALUES (?, ?, ?, ?, ?)',
        [googleId, email, 'Usuario de Prueba', 'https://cdn-icons-png.flaticon.com/512/2950/2950993.png', 'paciente']
      );
      idUsuario = insertUser.insertId;
    } else {
      idUsuario = rows[0].id_usuario;
      console.log('Usuario de prueba ya existe. ID:', idUsuario);
    }

    // 2. Insertar algunos medicamentos de prueba si no tiene
    const [meds] = await pool.query('SELECT COUNT(*) as total FROM botiquin WHERE id_usuario = ?', [idUsuario]);
    
    if (meds[0].total === 0) {
      console.log('Insertando medicamentos de prueba...');
      const inventarioService = require('./src/services/inventarioService');
      
      const medsData = [
        { nombre_medicamento: 'Paracetamol', sustancia_activa: 'Paracetamol', formato: 'Tabletas', cantidad: 20, unidad: 'piezas', fecha_caducidad: '2027-12-31', lote: 'LOTE-123' },
        { nombre_medicamento: 'Ibuprofeno', sustancia_activa: 'Ibuprofeno', formato: 'Cápsulas', cantidad: 15, unidad: 'piezas', fecha_caducidad: '2028-05-15', lote: 'LOTE-456' },
        { nombre_medicamento: 'Amoxicilina', sustancia_activa: 'Amoxicilina', formato: 'Suspensión', cantidad: 1, unidad: 'frascos', fecha_caducidad: '2025-02-10', lote: 'LOTE-789' }
      ];
      
      await inventarioService.agregarLoteMedicamentosDB(idUsuario, medsData);
      console.log('Medicamentos de prueba insertados con éxito.');
    } else {
      console.log('El usuario de prueba ya tiene medicamentos en su botiquín.');
    }

  } catch (error) {
    console.error('Error al inicializar datos demo:', error);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

seedDemoData();
