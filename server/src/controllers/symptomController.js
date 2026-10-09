const { buscarDiagnosticos } = require('../services/nlpService');
const { aplicarFiltroRelevancia } = require('../utils/filtroRelevancia');
const pool = require('../config/db');

/**
 * Analiza la descripción de síntomas en lenguaje natural mediante el motor NLP,
 * clasifica a CIE-10, aplica filtro de relevancia determinista (Top-3) y cruza
 * los hallazgos con el historial clínico y el stock físico del botiquín.
 */
const analizarSintomas = async (req, res, next) => {
  const { frase } = req.body;
  const idUsuario = req.usuario ? req.usuario.id_usuario : null;

  if (!frase || typeof frase !== 'string' || frase.trim().length === 0) {
    return res.status(400).json({
      exito: false,
      error: "Debes proporcionar una 'frase' válida con la descripción de los síntomas.",
    });
  }

  try {
    // 1. Extracción de entidades clínicas mediante NLP NER
    const extraccion = await buscarDiagnosticos(frase);

    if (extraccion.resultadosBrutos.length === 0) {
      return res.status(200).json({
        exito: true,
        mensaje: 'No se detectaron entidades clínicas específicas en la frase dictada.',
        resultados: [],
        historial: [],
      });
    }

    // 2. Aplicar algoritmo de relevancia (Scoring >= 50% y Top-3)
    const resultadosFinales = aplicarFiltroRelevancia(
      extraccion.resultadosBrutos,
      extraccion.entidadesDetectadas
    );

    // 3. Extraer historial clínico del paciente cruzado con diagnósticos y existencias en botiquín
    let historialReal = [];
    const terminosEncontrados = resultadosFinales.map((d) => d.termino_medico.toLowerCase());

    if (idUsuario && terminosEncontrados.length > 0) {
      try {
        const [filasHistorial] = await pool.query(
          `SELECT 
              cm.nombre_comercial AS medicamento,
              cm.sustancia_activa,
              rd.dosis,
              r.diagnostico,
              r.codigo_cie10,
              r.fecha_expedicion,
              IFNULL(b.cantidad_disponible, 0) AS cantidad_disponible,
              b.unidad,
              b.estado AS estado_caducidad
           FROM recetas r
           JOIN recetas_detalles rd ON r.id_receta = rd.id_receta
           JOIN catalogo_medicamentos cm ON rd.id_catalogo = cm.id_catalogo
           LEFT JOIN botiquin b ON b.id_usuario = r.id_usuario AND b.id_catalogo = cm.id_catalogo
           WHERE r.id_usuario = ?
           ORDER BY r.fecha_expedicion DESC`,
          [idUsuario]
        );

        // Extraer los códigos CIE-10, términos oficiales y palabras dictadas por NLP
        const codigosCie10NLP = resultadosFinales.map(d => d.codigo_cie10);
        const terminosOficiales = resultadosFinales.flatMap(d => d.termino_medico.toLowerCase().split(' ').filter(w => w.length > 3));
        const palabrasClaveNLP = extraccion.entidadesDetectadas.map(e => e.utteranceText.toLowerCase());

        // Filtrar coincidencias: Prioridad 1: Código CIE-10. Prioridad 2: Texto coloquial y clínico
        historialReal = filasHistorial.filter((receta) => {
          // 1. Cruce exacto por código CIE-10 (Si la receta lo tiene registrado)
          if (receta.codigo_cie10 && codigosCie10NLP.includes(receta.codigo_cie10)) {
            return true;
          }

          // 2. Cruce por texto (Contingencia si la receta NO tiene código CIE-10 o no empató)
          if (!receta.diagnostico) return false;
          const diagReceta = receta.diagnostico.toLowerCase();
          
          // Verificamos si alguna palabra dictada ("codo") o algún término oficial ("cefalea") está en el diagnóstico del doctor
          const coincidePalabraDictada = palabrasClaveNLP.some((palabra) => diagReceta.includes(palabra));
          const coincideTerminoOficial = terminosOficiales.some((termino) => diagReceta.includes(termino));

          return coincidePalabraDictada || coincideTerminoOficial;
        });
      } catch (dbError) {
        console.error('[Symptom Controller] Error al consultar historial médico:', dbError.message);
      }
    }

    res.status(200).json({
      exito: true,
      mensaje: 'Análisis clínico y cruce de expediente completado con éxito',
      resultados: resultadosFinales,
      historial: historialReal,
    });
  } catch (error) {
    console.error('[Symptom Controller Error] Error al procesar síntomas:', error);
    next(error);
  }
};

module.exports = {
  analizarSintomas,
};
