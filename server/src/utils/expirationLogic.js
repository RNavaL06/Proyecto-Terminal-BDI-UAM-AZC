/**
 * Determina el estado de vigencia de un medicamento a partir de su fecha de caducidad.
 * 
 * @param {string|Date} fechaCaducidad - Fecha en formato YYYY-MM-DD o Date
 * @returns {'vigente'|'por_vencer'|'caducado'}
 */
const computeEstado = (fechaCaducidad) => {
  if (!fechaCaducidad) return 'vigente';

  const fechaExp = new Date(fechaCaducidad);
  if (Number.isNaN(fechaExp.getTime())) return 'vigente';

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const diffMs = fechaExp.getTime() - hoy.getTime();
  const diffDias = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDias < 0) return 'caducado';
  if (diffDias <= 30) return 'por_vencer';
  return 'vigente';
};

/**
 * Calcula el número de días restantes hasta la fecha de caducidad.
 * Retorna un valor negativo si el medicamento ya caducó.
 */
const calcularDiasRestantes = (fechaCaducidad) => {
  if (!fechaCaducidad) return null;

  const fechaExp = new Date(fechaCaducidad);
  if (Number.isNaN(fechaExp.getTime())) return null;

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const diffMs = fechaExp.getTime() - hoy.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
};

module.exports = {
  computeEstado,
  calcularDiasRestantes,
};
