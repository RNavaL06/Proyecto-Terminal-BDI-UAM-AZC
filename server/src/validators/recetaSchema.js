/**
 * server/src/validators/recetaSchema.js
 */
const { z } = require('zod');

const recetaSchema = z.object({
  paciente_nombre: z.string().min(1).nullable().optional(),
  medico_nombre: z.string().min(1).nullable().optional(),
  medico_cedula: z.string().nullable().optional(),
  fecha_emision: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  diagnostico: z.string().min(2),
  codigo_cie10: z.string().nullable().optional(),
  indicaciones: z.string().nullable().optional(),
  medicamentos: z.array(
    z.object({
      nombre_medicamento: z.string().min(1),
      sustancia_activa: z.string().nullable().optional(),
      dosis: z.string().nullable().optional(),
      formato: z.string().nullable().optional(),
      frecuencia: z.string().nullable().optional(),
      duracion: z.string().nullable().optional(),
    })
  ).min(1, 'La receta debe contener al menos un medicamento.'),
});

module.exports = { recetaSchema };
