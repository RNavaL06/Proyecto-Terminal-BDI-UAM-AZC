const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

module.exports = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  db: {
    uri: process.env.DB_URI || '',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'bdi_final_db',
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'bdi_secret_jwt_key_default_2026',
    expiresIn: '72h',
  },

  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
  },

  ai: {
    geminiKeys: [
      process.env.GEMINI_API_KEY,
      process.env.GEMINI_API_KEY_2,
      process.env.GEMINI_API_KEY_3,
      process.env.GEMINI_API_KEY_4
    ].filter(Boolean),
    groqKey: process.env.GROQ_API_KEY || '',
  },

  geoapify: {
    apiKey: process.env.GEOAPIFY_API_KEY || '',
  },

  serpapi: {
    apiKey: process.env.SERPAPI_API_KEY || process.env.SERPAPI_KEY || process.env.VITE_SERPAPI_KEY || '',
  },

  email: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.EMAIL_FROM || 'Botiquín Digital Inteligente <noreply@bdi.salud>',
    cronEnabled: process.env.NOTIF_CRON_ENABLED === 'true',
  },

  vapid: {
    publicKey: process.env.VAPID_PUBLIC_KEY || '',
    privateKey: process.env.VAPID_PRIVATE_KEY || '',
    subject: process.env.VAPID_SUBJECT || 'mailto:soporte@bdi.salud',
  },

  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
};
