import dotenv from 'dotenv'

dotenv.config()

export const config = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3000', 10),
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
  TELEGRAM_BOT_USERNAME: process.env.TELEGRAM_BOT_USERNAME,
  WEBAPP_URL: process.env.WEBAPP_URL || 'https://your-app.vercel.app',
  ALLOWED_ORIGINS: [
    'https://web.telegram.org',
    'https://k.web.telegram.org',
    process.env.WEBAPP_URL || 'https://your-app.vercel.app',
    ...(process.env.NODE_ENV === 'development' ? ['http://localhost:5173', 'http://127.0.0.1:5173'] : [])
  ],
  
  // Telegram Mini App specific settings
  INIT_DATA_TTL: 24 * 60 * 60, // 24 hours in seconds
  SESSION_TTL: 7 * 24 * 60 * 60, // 7 days in seconds
  
  // Rate limiting
  RATE_LIMIT_WINDOW: 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX: 100, // requests per window
  
  // Mock data settings
  ENABLE_MOCK_DATA: process.env.NODE_ENV === 'development' || process.env.ENABLE_MOCK === 'true',
  MOCK_USER_ID: 999999999
}

export const validateConfig = () => {
  if (!config.TELEGRAM_BOT_TOKEN && config.NODE_ENV === 'production') {
    throw new Error('TELEGRAM_BOT_TOKEN is required in production')
  }
}
