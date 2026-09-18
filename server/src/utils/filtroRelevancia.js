/**
 * Algoritmo determinista de filtro de relevancia para diagnósticos clínicos.
 * Aplica scoring por nivel de certidumbre (accuracy), umbral de corte del 50%,
 * desempate por cantidad de coincidencias y limita al Top-3.
 * 
 * @param {Array<Object>} diagnosticosBrutos - Registros de catalogo_cie10
 * @param {Array<Object>} entidadesDetectadas - Entidades clínicas arrojadas por NER
 * @returns {Array<Object>} Top-3 diagnósticos más relevantes
 */
const aplicarFiltroRelevancia = (diagnosticosBrutos, entidadesDetectadas) => {
  if (!Array.isArray(diagnosticosBrutos) || diagnosticosBrutos.length === 0) {
    return [];
  }

  // 1. Calcular scoring para cada diagnóstico
  const diagnosticosConPuntaje = diagnosticosBrutos.map((diagnostico) => {
    const entidadesMatch = entidadesDetectadas.filter((e) => e.entity === diagnostico.codigo_cie10);

    let sumaAccuracy = 0;
    entidadesMatch.forEach((e) => {
      sumaAccuracy += e.accuracy !== undefined ? e.accuracy : 0.8;
    });

    let porcentajeCerteza = 0;
    if (entidadesMatch.length > 0) {
      porcentajeCerteza = (sumaAccuracy / entidadesMatch.length) * 100;
    }

    return {
      ...diagnostico,
      probabilidad: Math.round(porcentajeCerteza),
      numero_coincidencias: entidadesMatch.length,
    };
  });

  // 2. Filtrar diagnósticos con probabilidad mínima del 50%
  const diagnosticosFiltrados = diagnosticosConPuntaje.filter((d) => d.probabilidad >= 50);

  // 3. Ordenamiento con desempate:
  //    Primero por mayor probabilidad; en caso de empate, por mayor número de palabras clave
  diagnosticosFiltrados.sort((a, b) => {
    if (b.probabilidad !== a.probabilidad) {
      return b.probabilidad - a.probabilidad;
    }
    return b.numero_coincidencias - a.numero_coincidencias;
  });

  // 4. Retornar el Top-3 de diagnósticos
  return diagnosticosFiltrados.slice(0, 3);
};

module.exports = { aplicarFiltroRelevancia };
