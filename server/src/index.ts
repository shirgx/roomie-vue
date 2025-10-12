import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import { config } from './config/index.js'
import { telegramAuth } from './middleware/auth.js'
import { rateLimiter } from './middleware/rateLimiter.js'
import { errorHandler } from './middleware/errorHandler.js'
import { logger } from './utils/logger.js'
import { routes } from './routes/index.js'

const app = express()

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://telegram.org"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.telegram.org"]
    }
  }
}))

app.use(compression())
app.use(cors({
  origin: config.ALLOWED_ORIGINS,
  credentials: true
}))

app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true, limit: '1mb' }))

// Rate limiting
app.use(rateLimiter)

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '1.0.0' 
  })
})

// Telegram Mini App authentication
app.use('/api', telegramAuth)

// API routes
app.use('/api', routes)

// Error handling
app.use(errorHandler)

const PORT = config.PORT || 3000

app.listen(PORT, () => {
  logger.info(`🚀 Telegram Mini App Backend started on port ${PORT}`)
  logger.info(`Environment: ${config.NODE_ENV}`)
  logger.info(`Bot configured: ${!!config.TELEGRAM_BOT_TOKEN}`)
})

export default app
