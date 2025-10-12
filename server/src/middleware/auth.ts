import { Request, Response, NextFunction } from 'express'
import { validate, parse } from '@telegram-apps/init-data-node'
import { config } from '../config/index.js'
import { logger } from '../utils/logger.js'
import { TelegramUser } from '../types/telegram.js'

export interface AuthenticatedRequest extends Request {
  telegramUser?: TelegramUser
  isAuthenticated: boolean
}

export const telegramAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization
    
    // Development mode with mock data
    if (config.ENABLE_MOCK_DATA && (!authHeader || authHeader === 'mock')) {
      logger.info('Using mock authentication for development')
      req.telegramUser = {
        id: config.MOCK_USER_ID,
        first_name: 'Тестовый',
        last_name: 'Пользователь',
        username: 'test_user',
        language_code: 'ru',
        is_premium: false,
        allows_write_to_pm: true
      }
      req.isAuthenticated = true
      return next()
    }

    if (!authHeader) {
      return res.status(401).json({
        error: 'UNAUTHORIZED',
        message: 'Authorization header required'
      })
    }

    const [scheme, initData] = authHeader.split(' ')
    
    if (scheme !== 'tma' || !initData) {
      return res.status(401).json({
        error: 'INVALID_AUTH_SCHEME',
        message: 'Expected "tma <initData>" format'
      })
    }

    if (!config.TELEGRAM_BOT_TOKEN) {
      logger.error('TELEGRAM_BOT_TOKEN not configured')
      return res.status(500).json({
        error: 'SERVER_CONFIG_ERROR',
        message: 'Bot token not configured'
      })
    }

    // Validate Telegram init data
    validate(initData, config.TELEGRAM_BOT_TOKEN, {
      expiresIn: config.INIT_DATA_TTL
    })

    const parsedData = parse(initData)
    
    if (!parsedData.user) {
      return res.status(401).json({
        error: 'NO_USER_DATA',
        message: 'No user data in init data'
      })
    }

    req.telegramUser = parsedData.user
    req.isAuthenticated = true
    
    logger.info(`Authenticated user: ${parsedData.user.id} (${parsedData.user.username || parsedData.user.first_name})`)
    
    next()
  } catch (error) {
    logger.error('Authentication error:', error)
    
    if (error instanceof Error) {
      if (error.message.includes('expired')) {
        return res.status(401).json({
          error: 'INIT_DATA_EXPIRED',
          message: 'Init data has expired, please restart the app'
        })
      }
      
      if (error.message.includes('invalid')) {
        return res.status(401).json({
          error: 'INVALID_INIT_DATA',
          message: 'Invalid init data signature'
        })
      }
    }
    
    return res.status(401).json({
      error: 'AUTHENTICATION_FAILED',
      message: 'Authentication failed'
    })
  }
}
