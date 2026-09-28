/**
 * server/src/utils/jsonParser.js
 * Extrae y parsea objetos JSON devueltos por LLMs de manera tolerante a fallos.
 */
const extraerJsonSeguro = (texto) => {
  if (!texto || typeof texto !== 'string') {
    throw new Error('La respuesta del modelo está vacía o es inválida.');
  }

  try {
    const clean = texto.replace(/```json/gi, '').replace(/```/g, '').trim();
    return JSON.parse(clean);
  } catch (err) {
    const jsonMatch = texto.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (innerErr) {
        throw new Error(`Estructura JSON malformada en la salida del modelo: ${innerErr.message}`);
      }
    }
    throw new Error('No se encontró una estructura JSON reconocible en la respuesta del LLM.');
  }
};

module.exports = { extraerJsonSeguro };
