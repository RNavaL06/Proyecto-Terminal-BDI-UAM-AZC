const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../config/env');
const { optimizarImagenBase64 } = require('./imageService');

const GEMINI_MODEL = 'gemini-3.5-flash-lite';

/**
 * Función auxiliar para intentar procesar la imagen rotando entre las API Keys disponibles.
 * Inicia con una llave al azar (balanceo de carga) y si falla, intenta con la siguiente (fallback).
 */
const procesarConGemini = async (prompt, imagePart) => {
  const keys = config.ai.geminiKeys;
  if (!keys || keys.length === 0) return null;

  let lastError;
  const startIndex = Math.floor(Math.random() * keys.length);

  for (let i = 0; i < keys.length; i++) {
    const keyIndex = (startIndex + i) % keys.length;
    const currentKey = keys[keyIndex];

    try {
      const genAI = new GoogleGenerativeAI(currentKey);
      const model = genAI.getGenerativeModel({
        model: GEMINI_MODEL,
        generationConfig: { responseMimeType: 'application/json' },
      });

      const result = await model.generateContent([prompt, imagePart]);
      return result.response.text();
    } catch (err) {
      console.warn(`[Vision Service] Fallo con la API Key ${keyIndex + 1}/${keys.length}. Intentando con la siguiente... Error:`, err.message);
      lastError = err;
    }
  }

  throw lastError || new Error('No se pudo procesar la imagen con ninguna API Key disponible.');
};

/**
 * Analiza la imagen de una receta médica y extrae sus datos clínicos.
 * @param {string} rawBase64 - Imagen en formato Base64.
 * @returns {Object} { datosClinicos, imagenOptimizada }
 */
const analizarImagenReceta = async (rawBase64) => {
  const imagenOptimizada = await optimizarImagenBase64(rawBase64, 1280, 80);
  const cleanBase64 = imagenOptimizada.replace(/^data:image\/[a-zA-Z+]+;base64,/, '');

  if (!config.ai.geminiKeys || config.ai.geminiKeys.length === 0) {
    console.warn('[Vision Service] GEMINI_API_KEY no configurada. Devolviendo mock.');
    return {
      datosClinicos: _getMockReceta(),
      imagenOptimizada
    };
  }

  const prompt = `Eres un asistente clínico experto en digitalización de recetas médicas.
    Analiza la imagen adjunta y extrae la información clínica estrictamente en este esquema JSON:
    {
      "paciente_nombre": "Nombre del paciente o null",
      "medico_nombre": "Nombre del médico o null",
      "medico_cedula": "Cédula profesional o null",
      "fecha_emision": "YYYY-MM-DD o null",
      "diagnostico": "Diagnóstico médico principal o motivo de consulta",
      "codigo_cie10": "Código CIE-10 aproximado (ej. J02.9, R51) o null",
      "indicaciones": "Instrucciones generales de reposo o dieta",
      "medicamentos": [
        {
          "nombre_medicamento": "Nombre comercial o sustancia",
          "sustancia_activa": "Principio activo si es legible",
          "dosis": "Concentración (ej. 500mg, 10ml)",
          "formato": "Tabletas, Cápsulas, Jarabe, etc.",
          "indicaciones": "Instrucciones específicas de toma",
          "frecuencia": "Frecuencia horaria",
          "duracion": "Duración del tratamiento"
        }
      ]
    }
    Si algún dato no es visible, usa null. Devuelve ÚNICAMENTE el objeto JSON sin bloques de texto adicionales.`;

  const imagePart = {
    inlineData: {
      data: cleanBase64,
      mimeType: 'image/jpeg',
    },
  };

  const responseText = await procesarConGemini(prompt, imagePart);
  const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();

  return {
    datosClinicos: JSON.parse(cleanJson),
    imagenOptimizada
  };
};

/**
 * Analiza la fotografía de una caja de medicamento para prellenar datos del botiquín.
 * @param {string} rawBase64 - Imagen en formato Base64.
 * @returns {Object} { datosExtraidos }
 */
const analizarCajaMedicamento = async (rawBase64) => {
  const imagenOptimizada = await optimizarImagenBase64(rawBase64, 1280, 80);
  const cleanBase64 = imagenOptimizada.replace(/^data:image\/[a-zA-Z+]+;base64,/, '');

  if (!config.ai.geminiKeys || config.ai.geminiKeys.length === 0) {
    return {
      datosExtraidos: {
        nombre_medicamento: 'Ibuprofeno Genérico',
        sustancia_activa: 'Ibuprofeno',
        gramaje: '400mg',
        formato: 'Tabletas',
        cantidad: 10,
        fecha_caducidad: null,
      }
    };
  }

  const prompt = `Analiza esta imagen de una caja o empaque de medicamento.
    Extrae la siguiente información y devuélvela ESTRICTAMENTE en este formato JSON:
    {
      "nombre_medicamento": "Nombre comercial del fármaco",
      "sustancia_activa": "Nombre de la sustancia o principio activo",
      "gramaje": "Concentración (ej. 500mg, 10ml)",
      "formato": "Tabletas, Jarabe, Cápsulas, Gel, etc.",
      "cantidad": "Cantidad total de unidades numéricas en la caja (ej. 30, 20, 1). Si es un inhalador, tubo o frasco y no dice unidades exactas, devuelve 1.",
      "fecha_caducidad": "YYYY-MM-DD o null si no es visible"
    }
    Si algún dato no es visible, pon null. No incluyas ningún texto fuera del JSON.`;

  const imagePart = { inlineData: { data: cleanBase64, mimeType: 'image/jpeg' } };
  const responseText = await procesarConGemini(prompt, imagePart);
  const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();

  return {
    datosExtraidos: JSON.parse(cleanJson)
  };
};

const _getMockReceta = () => ({
  paciente_nombre: 'Paciente de Ejemplo',
  medico_nombre: 'Dr. Roberto Martínez Esquivel',
  medico_cedula: 'CED-MED-8492011',
  fecha_emision: new Date().toISOString().split('T')[0],
  diagnostico: 'Faringitis Aguda',
  codigo_cie10: 'J02.9',
  indicaciones: 'Reposo relativo por 48 horas y abundantes líquidos.',
  medicamentos: [
    {
      nombre_medicamento: 'Amoxil',
      sustancia_activa: 'Amoxicilina',
      dosis: '500mg',
      formato: 'Cápsulas',
      indicaciones: 'Tomar 1 cápsula cada 8 horas por 7 días',
      frecuencia: 'Cada 8 horas',
      duracion: '7 días',
    }
  ],
});

module.exports = {
  analizarImagenReceta,
  analizarCajaMedicamento
};
