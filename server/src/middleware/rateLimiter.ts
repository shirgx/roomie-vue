import { RateLimiterMemory } from 'rate-limiter-flexible'
import { Request, Response, NextFunction } from 'express'
import { config } from '../config/index.js'
import { logger } from '../utils/logger.js'

const rateLimiter = new RateLimiterMemory({
  keyGenerator: (req: Request) => {
    // Use Telegram user ID if available, otherwise IP
    const telegramReq = req as any
    return telegramReq.telegramUser?.id?.toString() || req.ip
  },
  points: config.RATE_LIMIT_MAX,
  duration: Math.floor(config.RATE_LIMIT_WINDOW / 1000), // seconds
})

export const rateLimiterMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await rateLimiter.consume(req.ip)
    next()
  } catch (rejRes) {
    const remainingPoints = rejRes?.remainingPoints || 0
    const msBeforeNext = rejRes?.msBeforeNext || 0
    
    logger.warn(`Rate limit exceeded for ${req.ip}`)
    
    res.set({
      'Retry-After': Math.round(msBeforeNext / 1000) || 1,
      'X-RateLimit-Limit': config.RATE_LIMIT_MAX,
      'X-RateLimit-Remaining': remainingPoints,
      'X-RateLimit-Reset': new Date(Date.now() + msBeforeNext).toISOString()
    })
    
    res.status(429).json({
      error: 'TOO_MANY_REQUESTS',
      message: 'Rate limit exceeded. Please try again later.',
      retryAfter: Math.round(msBeforeNext / 1000)
    })
  }
}

export { rateLimiterMiddleware as rateLimiter }
