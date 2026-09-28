/**
 * server/src/services/llmAdapter.js
 */
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Groq = require('groq-sdk');
const config = require('../config/env');

const procesarConGroq = async (prompt, base64Image) => {
  const groq = new Groq({ apiKey: config.ai.groqApiKey });
  const response = await groq.chat.completions.create({
    model: 'qwen-2.5-vl-72b-instruct',
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          {
            type: 'image_url',
            image_url: { url: `data:image/jpeg;base64,${base64Image}` },
          },
        ],
      },
    ],
    response_format: { type: 'json_object' },
  });
  return response.choices[0]?.message?.content;
};

const procesarVisionLLM = async (prompt, cleanBase64) => {
  const provider = process.env.AI_PROVIDER || 'gemini';
  if (provider === 'groq') {
    return await procesarConGroq(prompt, cleanBase64);
  }
  // Fallback por defecto a Gemini
  const imagePart = { inlineData: { data: cleanBase64, mimeType: 'image/jpeg' } };
  return await require('./visionService').procesarConGemini(prompt, imagePart);
};

module.exports = { procesarVisionLLM };
