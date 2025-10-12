import { Response } from 'express'
import { AuthenticatedRequest } from '../middleware/auth.js'
import { UserService } from '../services/userService.js'
import { asyncHandler, createError } from '../middleware/errorHandler.js'
import { z } from 'zod'

const updateUserSchema = z.object({
  fullName: z.string().min(1).max(100).optional(),
  age: z.number().min(16).max(100).optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  city: z.string().min(1).max(50).optional(),
  district: z.string().min(1).max(50).optional(),
  hasApartment: z.boolean().optional(),
  budgetMin: z.number().min(0).optional(),
  budgetMax: z.number().min(0).optional(),
  bio: z.string().max(500).optional(),
  apartmentDescription: z.string().max(1000).optional(),
  preferences: z.object({
    ageMin: z.number().min(16).max(100).optional(),
    ageMax: z.number().min(16).max(100).optional(),
    genderPreference: z.enum(['male', 'female', 'any']).optional(),
    cityPreference: z.string().optional(),
    hasApartmentPreference: z.boolean().nullable().optional(),
    budgetMin: z.number().min(0).optional(),
    budgetMax: z.number().min(0).optional()
  }).optional()
})

export const UserController = {
  // Get current user profile
  getMe: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.telegramUser) {
      throw createError('User not authenticated', 401, 'NOT_AUTHENTICATED')
    }

    const user = await UserService.getOrCreateUser(req.telegramUser)
    const stats = await UserService.getUserStats(user.id)

    res.json({
      success: true,
      data: {
        ...user,
        stats
      }
    })
  }),

  // Update user profile
  updateMe: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.telegramUser) {
      throw createError('User not authenticated', 401, 'NOT_AUTHENTICATED')
    }

    const validationResult = updateUserSchema.safeParse(req.body)
    if (!validationResult.success) {
      throw createError('Invalid data', 400, 'VALIDATION_ERROR')
    }

    const user = await UserService.getOrCreateUser(req.telegramUser)
    const updatedUser = await UserService.updateUser(user.id, validationResult.data)

    if (!updatedUser) {
      throw createError('User not found', 404, 'USER_NOT_FOUND')
    }

    res.json({
      success: true,
      data: updatedUser
    })
  }),

  // Get user by ID
  getUser: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { userId } = req.params
    
    if (!userId) {
      throw createError('User ID required', 400, 'USER_ID_REQUIRED')
    }

    const user = await UserService.getUserById(userId)
    
    if (!user) {
      throw createError('User not found', 404, 'USER_NOT_FOUND')
    }

    // Increment profile views (but not for own profile)
    if (req.telegramUser) {
      const currentUser = await UserService.getOrCreateUser(req.telegramUser)
      if (currentUser.id !== userId) {
        await UserService.incrementProfileViews(userId)
      }
    }

    const stats = await UserService.getUserStats(user.id)

    res.json({
      success: true,
      data: {
        ...user,
        stats
      }
    })
  }),

  // Search users
  searchUsers: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.telegramUser) {
      throw createError('User not authenticated', 401, 'NOT_AUTHENTICATED')
    }

    const currentUser = await UserService.getOrCreateUser(req.telegramUser)
    
    const filters = {
      ageMin: req.query.ageMin ? parseInt(req.query.ageMin as string) : undefined,
      ageMax: req.query.ageMax ? parseInt(req.query.ageMax as string) : undefined,
      gender: req.query.gender as string,
      city: req.query.city as string,
      hasApartment: req.query.hasApartment ? req.query.hasApartment === 'true' : undefined,
      budgetMin: req.query.budgetMin ? parseInt(req.query.budgetMin as string) : undefined,
      budgetMax: req.query.budgetMax ? parseInt(req.query.budgetMax as string) : undefined
    }

    const users = await UserService.searchUsers(currentUser.id, filters)

    res.json({
      success: true,
      data: users,
      total: users.length
    })
  }),

  // Get user stats
  getUserStats: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.telegramUser) {
      throw createError('User not authenticated', 401, 'NOT_AUTHENTICATED')
    }

    const user = await UserService.getOrCreateUser(req.telegramUser)
    const stats = await UserService.getUserStats(user.id)

    res.json({
      success: true,
      data: stats
    })
  })
}
