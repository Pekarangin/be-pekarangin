// ============================================================
// src/config/env.js — Load & validate environment variables
// ============================================================
import 'dotenv/config';

const required = ['DATABASE_URL', 'JWT_SECRET'];

for (const key of required) {
  if (!process.env[key]) {
    console.error(`❌ Missing required env var: ${key}`);
    process.exit(1);
  }
}

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3000,

  // Database
  databaseUrl: process.env.DATABASE_URL,

  // Auth
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  googleClientId: process.env.GOOGLE_CLIENT_ID || '',

  // External APIs
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  geminiModel:
    !process.env.GEMINI_MODEL || process.env.GEMINI_MODEL === 'gemini-1.5-flash'
      ? 'gemini-2.5-flash'
      : process.env.GEMINI_MODEL,
  aiServiceUrl: process.env.AI_SERVICE_URL || 'https://ai-pekarangin-production.up.railway.app',

  // Flags
  isDev: (process.env.NODE_ENV || 'development') === 'development',
  isProd: process.env.NODE_ENV === 'production',
};

export default env;
