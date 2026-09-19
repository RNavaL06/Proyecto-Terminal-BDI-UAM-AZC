const sharp = require('sharp');

/**
 * Comprime y redimensiona una imagen en formato Data URL Base64
 * para reducir el tamaño de almacenamiento y acelerar el consumo de tokens en LLMs.
 * 
 * @param {string} dataUrl - Cadena en formato data:image/...;base64,...
 * @param {number} maxWidth - Ancho máximo permitido (default 1280px)
 * @param {number} quality - Calidad JPEG (1-100, default 80)
 * @returns {Promise<string>} Data URL en Base64 optimizada
 */
const optimizarImagenBase64 = async (dataUrl, maxWidth = 1280, quality = 80) => {
  if (!dataUrl || typeof dataUrl !== 'string') {
    return dataUrl;
  }

  const match = dataUrl.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
  if (!match) {
    return dataUrl; // Si no tiene el formato clásico de Data URL, retornar original
  }

  try {
    const buffer = Buffer.from(match[2], 'base64');
    const bufferComprimido = await sharp(buffer)
      .resize({ width: maxWidth, withoutEnlargement: true })
      .jpeg({ quality, progressive: true })
      .toBuffer();

    return `data:image/jpeg;base64,${bufferComprimido.toString('base64')}`;
  } catch (error) {
    console.warn('[Sharp] No se pudo optimizar la imagen, usando original:', error.message);
    return dataUrl;
  }
};

module.exports = { optimizarImagenBase64 };
