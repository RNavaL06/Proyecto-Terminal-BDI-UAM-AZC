/**
 * server/scripts/poblar_cie10.js
 * 
 * Script automatizado para importar los 1,917 archivos SQL de códigos CIE-10
 * generados por IA a la base de datos MySQL (local o Aiven Cloud) de forma
 * transaccional, con soporte para reintentos y actualización de registros frecuentes (SUIVE 2025).
 * 
 * Uso:
 *   node scripts/poblar_cie10.js
 *   npm run seed:cie10
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const pool = require('../src/config/db');

// Rutas base
const RUTA_GENERADOS = path.resolve(__dirname, '../../CIE-10/Generados_SQL');
const RUTA_SUIVE_SQL = path.resolve(__dirname, '../../database/poblacion/05_marcar_cie10_frecuentes_suive.sql');

/**
 * Encuentra de forma recursiva todos los archivos .sql en un directorio.
 */
const buscarArchivosSql = (directorio) => {
  let resultados = [];
  if (!fs.existsSync(directorio)) {
    return resultados;
  }

  const elementos = fs.readdirSync(directorio, { withFileTypes: true });
  for (const elemento of elementos) {
    const rutaCompleta = path.join(directorio, elemento.name);
    if (elemento.isDirectory()) {
      resultados = resultados.concat(buscarArchivosSql(rutaCompleta));
    } else if (elemento.isFile() && elemento.name.endsWith('.sql')) {
      resultados.push(rutaCompleta);
    }
  }

  return resultados.sort();
};

/**
 * Ejecuta la importación por lotes de todos los archivos SQL.
 */
const poblarCie10 = async () => {
  const inicioTiempo = Date.now();
  console.log('================================================================');
  console.log('  BDI - Importador Masivo de Catálogo CIE-10 (74,260 Registros)');
  console.log('================================================================\n');

  // 1. Probar conectividad con la base de datos
  try {
    const connTest = await pool.getConnection();
    console.log(`[BD] Conectado exitosamente a la base de datos MySQL.`);
    connTest.release();
  } catch (dbError) {
    console.error(`[Error de Conexión] No se pudo conectar a MySQL:`, dbError.message);
    process.exit(1);
  }

  // 2. Escanear archivos SQL
  console.log(`[Escáner] Buscando archivos SQL en: ${RUTA_GENERADOS}...`);
  const archivosSql = buscarArchivosSql(RUTA_GENERADOS);

  if (archivosSql.length === 0) {
    console.error(`[Error] No se encontraron archivos SQL en la ruta indicada.`);
    process.exit(1);
  }

  console.log(`[Escáner] Se encontraron ${archivosSql.length} archivos SQL para procesar.\n`);

  // 3. Procesamiento en lotes concurrentes para optimizar velocidad sobre red/Aiven
  const TAMANIO_LOTE_CONCURRENTE = 10;
  let archivosProcesados = 0;
  let consultasExitosas = 0;
  let archivosConError = [];

  console.log(`[Importación] Iniciando procesamiento con concurrencia de ${TAMANIO_LOTE_CONCURRENTE} conexiones...`);

  for (let i = 0; i < archivosSql.length; i += TAMANIO_LOTE_CONCURRENTE) {
    const loteActual = archivosSql.slice(i, i + TAMANIO_LOTE_CONCURRENTE);

    await Promise.all(
      loteActual.map(async (rutaArchivo) => {
        try {
          let sqlContent = fs.readFileSync(rutaArchivo, 'utf-8').trim();

          // Ignorar archivos vacíos o que solo tengan comentarios
          if (!sqlContent || !sqlContent.includes('INSERT INTO')) {
            archivosProcesados++;
            return;
          }

          // Convertir a INSERT IGNORE para que sea idempotente (re-ejecutable sin errores de duplicados)
          sqlContent = sqlContent.replace(/^INSERT INTO catalogo_cie10/i, 'INSERT IGNORE INTO catalogo_cie10');

          await pool.query(sqlContent);
          consultasExitosas++;
        } catch (error) {
          archivosConError.push({ archivo: path.basename(rutaArchivo), error: error.message });
        } finally {
          archivosProcesados++;
        }
      })
    );

    // Barra de progreso en consola cada 100 archivos o al final
    if (archivosProcesados % 100 === 0 || archivosProcesados === archivosSql.length) {
      const porcentaje = ((archivosProcesados / archivosSql.length) * 100).toFixed(1);
      const segundosTranscurridos = ((Date.now() - inicioTiempo) / 1000).toFixed(1);
      process.stdout.write(
        `\r[Progreso] ${archivosProcesados}/${archivosSql.length} archivos (${porcentaje}%) | Exitosos: ${consultasExitosas} | Tiempo: ${segundosTranscurridos}s`
      );
    }
  }

  console.log('\n\n[Importación] Carga de archivos SQL completada.');

  if (archivosConError.length > 0) {
    console.warn(`[Aviso] ${archivosConError.length} archivos tuvieron advertencias o errores:`);
    archivosConError.slice(0, 5).forEach((err) => console.warn(`  - ${err.archivo}: ${err.error}`));
    if (archivosConError.length > 5) {
      console.warn(`  ... y ${archivosConError.length - 5} más.`);
    }
  }

  // 4. Activar diagnósticos frecuentes con el script oficial SUIVE 2025
  if (fs.existsSync(RUTA_SUIVE_SQL)) {
    console.log('\n[SUIVE 2025] Aplicando marcas de diagnósticos frecuentes (es_frecuente = 1)...');
    try {
      const suiveSql = fs.readFileSync(RUTA_SUIVE_SQL, 'utf-8');
      
      // Separar por punto y coma para ejecutar cada sentencia del script
      const sentencias = suiveSql
        .split(';')
        .map((s) => s.trim())
        .filter((s) => s.length > 0 && !s.startsWith('--') && !s.toLowerCase().startsWith('use '));

      for (const sentencia of sentencias) {
        if (sentencia.toUpperCase().includes('UPDATE') || sentencia.toUpperCase().includes('SELECT')) {
          await pool.query(sentencia);
        }
      }
      console.log('[SUIVE 2025] Diagnósticos oficiales de alta incidencia activados exitosamente.');
    } catch (suiveErr) {
      console.error('[SUIVE Error] Error al ejecutar script de diagnósticos frecuentes:', suiveErr.message);
    }
  }

  // 5. Métricas finales de la base de datos
  try {
    const [[{ totalRegistros }]] = await pool.query('SELECT COUNT(*) AS totalRegistros FROM catalogo_cie10');
    const [[{ totalFrecuentes }]] = await pool.query('SELECT COUNT(*) AS totalFrecuentes FROM catalogo_cie10 WHERE es_frecuente = 1');

    const tiempoTotal = ((Date.now() - inicioTiempo) / 1000).toFixed(2);
    console.log('\n================================================================');
    console.log('  RESUMEN DE POBLACIÓN DE LA BASE DE DATOS');
    console.log('================================================================');
    console.log(`  • Total de códigos CIE-10 en la BD:    ${totalRegistros.toLocaleString()} registros`);
    console.log(`  • Diagnósticos frecuentes para NLP:   ${totalFrecuentes.toLocaleString()} registros (es_frecuente = 1)`);
    console.log(`  • Tiempo total de ejecución:          ${tiempoTotal} segundos`);
    console.log('================================================================\n');
  } catch (metricError) {
    console.error('[Métricas Error] No se pudieron obtener los conteos finales:', metricError.message);
  } finally {
    process.exit(0);
  }
};

poblarCie10();
