const { NlpManager } = require('node-nlp');
const pool = require('../config/db');

// Configuración del motor NLP en español con NER forzado
const manager = new NlpManager({
  languages: ['es'],
  forceNER: true,
  nlu: { log: false },
});

let isInitialized = false;

/**
 * Carga el catálogo de diagnósticos CIE-10 desde MySQL y entrena el motor NER.
 */
const inicializarMotorNLP = async () => {
  try {
    console.log('[NLP Service] Cargando catálogo CIE-10 desde MySQL...');
    const [diagnosticos] = await pool.query('SELECT codigo_cie10, keywords FROM catalogo_cie10');

    if (!diagnosticos || diagnosticos.length === 0) {
      console.warn('[NLP Service] No se encontraron registros en catalogo_cie10. Ejecuta el seed SQL.');
      return;
    }

    diagnosticos.forEach((diag) => {
      const idEntidad = diag.codigo_cie10;
      let keywords = diag.keywords;

      if (typeof keywords === 'string') {
        try {
          keywords = JSON.parse(keywords);
        } catch (e) {
          keywords = [];
        }
      }

      if (Array.isArray(keywords) && keywords.length > 0) {
        manager.addNamedEntityText(idEntidad, idEntidad, ['es'], keywords);
      }
    });

    await manager.train();
    isInitialized = true;
    console.log(`[NLP Service] Motor NER entrenado exitosamente con ${diagnosticos.length} categorías CIE-10.`);
  } catch (error) {
    console.error('[NLP Service Error] Error al inicializar el motor NLP:', error.message);
  }
};

/**
 * Procesa una frase del usuario para identificar entidades y códigos CIE-10 correspondientes.
 * 
 * @param {string} frase - Texto o transcripción de síntomas
 * @returns {Promise<Object>} { resultadosBrutos, entidadesDetectadas }
 */
const buscarDiagnosticos = async (frase) => {
  if (!isInitialized) {
    await inicializarMotorNLP();
  }

  const analisis = await manager.process('es', frase);

  if (!analisis.entities || analisis.entities.length === 0) {
    return { resultadosBrutos: [], entidadesDetectadas: [] };
  }

  const codigosEncontrados = [...new Set(analisis.entities.map((e) => e.entity))];

  try {
    const [resultadosBrutos] = await pool.query(
      'SELECT id_diagnostico, codigo_cie10, termino_medico, capitulo, keywords FROM catalogo_cie10 WHERE codigo_cie10 IN (?)',
      [codigosEncontrados]
    );

    return {
      resultadosBrutos,
      entidadesDetectadas: analisis.entities,
    };
  } catch (error) {
    console.error('[NLP Service Error] Error al consultar diagnósticos en BD:', error.message);
    return { resultadosBrutos: [], entidadesDetectadas: [] };
  }
};

module.exports = {
  inicializarMotorNLP,
  buscarDiagnosticos,
  manager,
};
