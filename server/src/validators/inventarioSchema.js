/**
 * server/src/validators/inventarioSchema.js
 */
const { z } = require('zod');

const inventarioSchema = z.object({
  nombre_medicamento: z.string().min(1, 'El nombre del medicamento es obligatorio.'),
  sustancia_activa: z.string().nullable().optional(),
  gramaje: z.string().nullable().optional(),
  formato: z.string().nullable().optional(),
  cantidad: z.number().int().min(1).optional().or(z.string().regex(/^\d+$/).transform(Number)),
  fecha_caducidad: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
});

const inventarioBatchSchema = z.object({
  medicamentos: z.array(inventarioSchema).min(1, 'Se requiere una lista de medicamentos.'),
});

module.exports = { inventarioSchema, inventarioBatchSchema };
