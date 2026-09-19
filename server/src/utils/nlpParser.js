/**
 * Extrae un número entero a partir de un texto que indica frecuencia en horas.
 * Ejemplos: "Cada 8 horas" -> 8, "Cada 12 hrs" -> 12, "1 al día" -> 24.
 * Si no puede parsear, devuelve null.
 */
const parsearFrecuencia = (texto) => {
  if (!texto) return null;
  const str = texto.toLowerCase();

  // Buscar dígitos explícitos "cada 8 horas" o "cada 12 hrs"
  const matchHoras = str.match(/(?:cada\s*)?(\d+)\s*(?:hora|hr|h)/i);
  if (matchHoras && matchHoras[1]) {
    return parseInt(matchHoras[1], 10);
  }

  // Buscar "al día" o "veces al día"
  if (str.includes('al día') || str.includes('al dia')) {
    const matchVeces = str.match(/(\d+)\s*(?:vez|veces)/i);
    if (matchVeces && matchVeces[1]) {
      const veces = parseInt(matchVeces[1], 10);
      return veces > 0 ? Math.floor(24 / veces) : 24;
    }
    return 24; // Por defecto "1 al día" = 24 horas
  }

  // Buscar "cada día" o "diario"
  if (str.includes('diario') || str.includes('cada día') || str.includes('cada dia')) {
    return 24;
  }

  return null;
};

/**
 * Extrae un número entero (en días) a partir de un texto de duración.
 * Ejemplos: "7 días" -> 7, "1 mes" -> 30.
 * Si no puede parsear, devuelve null.
 */
const parsearDuracion = (texto) => {
  if (!texto) return null;
  const str = texto.toLowerCase();

  // Buscar "días"
  const matchDias = str.match(/(\d+)\s*d[ií]a/i);
  if (matchDias && matchDias[1]) {
    return parseInt(matchDias[1], 10);
  }

  // Buscar "semanas"
  const matchSemanas = str.match(/(\d+)\s*semana/i);
  if (matchSemanas && matchSemanas[1]) {
    return parseInt(matchSemanas[1], 10) * 7;
  }

  // Buscar "mes"
  const matchMeses = str.match(/(\d+)\s*mes/i);
  if (matchMeses && matchMeses[1]) {
    return parseInt(matchMeses[1], 10) * 30;
  }

  if (str.includes('1 mes')) return 30;
  if (str.includes('1 semana')) return 7;

  return null;
};

module.exports = {
  parsearFrecuencia,
  parsearDuracion
};
