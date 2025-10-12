import { Request, Response, NextFunction } from 'express'
import { logger } from '../utils/logger.js'
import { config } from '../config/index.js'

export interface AppError extends Error {
  statusCode?: number
  code?: string
  isOperational?: boolean
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500
  const isDevelopment = config.NODE_ENV === 'development'
  
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    statusCode,
    url: req.url,
    method: req.method,
    userAgent: req.get('User-Agent'),
    ip: req.ip
  })

  const errorResponse: any = {
    error: err.code || 'INTERNAL_SERVER_ERROR',
    message: err.message || 'An unexpected error occurred'
  }

  if (isDevelopment) {
    errorResponse.stack = err.stack
    errorResponse.details = {
      url: req.url,
      method: req.method,
      headers: req.headers,
      body: req.body
    }
  }

  res.status(statusCode).json(errorResponse)
}

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

export const createError = (message: string, statusCode = 500, code?: string): AppError => {
  const error = new Error(message) as AppError
  error.statusCode = statusCode
  error.code = code
  error.isOperational = true
  return error
}
