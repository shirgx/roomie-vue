import { Response } from 'express'
import { AuthenticatedRequest } from '../middleware/auth.js'
import { UserService } from '../services/userService.js'
import { MatchService } from '../services/matchService.js'
import { TestService } from '../services/testService.js'
import { asyncHandler, createError } from '../middleware/errorHandler.js'
import { z } from 'zod'

const likeUserSchema = z.object({
  toUserId: z.string().min(1),
  isLike: z.boolean()
})

export const MatchController = {
  // Like or dislike a user
  likeUser: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.telegramUser) {
      throw createError('User not authenticated', 401, 'NOT_AUTHENTICATED')
    }

    const validationResult = likeUserSchema.safeParse(req.body)
    if (!validationResult.success) {
      throw createError('Invalid data', 400, 'VALIDATION_ERROR')
    }

    const { toUserId, isLike } = validationResult.data
    const currentUser = await UserService.getOrCreateUser(req.telegramUser)

    // Check if target user exists
    const targetUser = await UserService.getUserById(toUserId)
    if (!targetUser) {
      throw createError('Target user not found', 404, 'USER_NOT_FOUND')
    }

    // Prevent self-liking
    if (currentUser.id === toUserId) {
      throw createError('Cannot like yourself', 400, 'CANNOT_LIKE_SELF')
    }

    const result = await MatchService.createLike(currentUser.id, toUserId, isLike)

    let compatibilityScore = null
    if (result.isMatch) {
      // Calculate compatibility score for new matches
      compatibilityScore = await TestService.calculateCompatibilityScore(
        currentUser.id,
        toUserId
      )
    }

    res.json({
      success: true,
      data: {
        like: result.like,
        isMatch: result.isMatch,
        match: result.match,
        compatibilityScore
      }
    })
  }),

  // Get user's matches
  getMatches: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.telegramUser) {
      throw createError('User not authenticated', 401, 'NOT_AUTHENTICATED')
    }

    const currentUser = await UserService.getOrCreateUser(req.telegramUser)
    const matches = await MatchService.getUserMatches(currentUser.id)

    // Enrich matches with user data
    const enrichedMatches = await Promise.all(
      matches.map(async (match) => {
        const partnerId = match.user1Id === currentUser.id ? match.user2Id : match.user1Id
        const partner = await UserService.getUserById(partnerId)
        
        let compatibilityScore = null
        if (partner) {
          compatibilityScore = await TestService.calculateCompatibilityScore(
            currentUser.id,
            partnerId
          )
        }

        return {
          ...match,
          partner,
          compatibilityScore
        }
      })
    )

    res.json({
      success: true,
      data: enrichedMatches,
      total: enrichedMatches.length
    })
  }),

  // Get match details
  getMatchDetails: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.telegramUser) {
      throw createError('User not authenticated', 401, 'NOT_AUTHENTICATED')
    }

    const { matchId } = req.params
    const currentUser = await UserService.getOrCreateUser(req.telegramUser)
    const match = await MatchService.getMatchDetails(matchId)

    if (!match) {
      throw createError('Match not found', 404, 'MATCH_NOT_FOUND')
    }

    // Verify user is part of this match
    if (match.user1Id !== currentUser.id && match.user2Id !== currentUser.id) {
      throw createError('Access denied', 403, 'ACCESS_DENIED')
    }

    const partnerId = match.user1Id === currentUser.id ? match.user2Id : match.user1Id
    const partner = await UserService.getUserById(partnerId)
    
    const compatibilityData = await TestService.getCompatibilityInsights(
      currentUser.id,
      partnerId
    )

    res.json({
      success: true,
      data: {
        ...match,
        partner,
        compatibility: compatibilityData
      }
    })
  }),

  // Get user's likes (sent and received)
  getLikes: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.telegramUser) {
      throw createError('User not authenticated', 401, 'NOT_AUTHENTICATED')
    }

    const currentUser = await UserService.getOrCreateUser(req.telegramUser)
    const likes = await MatchService.getUserLikes(currentUser.id)

    // Enrich with user data
    const enrichedSent = await Promise.all(
      likes.sent.map(async (like) => {
        const user = await UserService.getUserById(like.toUserId)
        return { ...like, user }
      })
    )

    const enrichedReceived = await Promise.all(
      likes.received.map(async (like) => {
        const user = await UserService.getUserById(like.fromUserId)
        return { ...like, user }
      })
    )

    res.json({
      success: true,
      data: {
        sent: enrichedSent,
        received: enrichedReceived
      }
    })
  }),

  // Get potential matches for swiping
  getPotentialMatches: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.telegramUser) {
      throw createError('User not authenticated', 401, 'NOT_AUTHENTICATED')
    }

    const currentUser = await UserService.getOrCreateUser(req.telegramUser)
    const limit = parseInt(req.query.limit as string) || 10
    
    // Get users based on preferences
    const filters: any = {}
    
    if (currentUser.preferences) {
      if (currentUser.preferences.ageMin) filters.ageMin = currentUser.preferences.ageMin
      if (currentUser.preferences.ageMax) filters.ageMax = currentUser.preferences.ageMax
      if (currentUser.preferences.genderPreference && currentUser.preferences.genderPreference !== 'any') {
        filters.gender = currentUser.preferences.genderPreference
      }
      if (currentUser.preferences.cityPreference) filters.city = currentUser.preferences.cityPreference
      if (currentUser.preferences.hasApartmentPreference !== null) {
        filters.hasApartment = currentUser.preferences.hasApartmentPreference
      }
    }

    const potentialUsers = await UserService.searchUsers(currentUser.id, filters)
    
    // Filter out already liked users
    const likes = await MatchService.getUserLikes(currentUser.id)
    const likedUserIds = likes.sent.map(like => like.toUserId)
    
    const availableUsers = potentialUsers
      .filter(user => !likedUserIds.includes(user.id))
      .slice(0, limit)

    // Calculate compatibility scores for better matches
    const enrichedUsers = await Promise.all(
      availableUsers.map(async (user) => {
        let compatibilityScore = null
        if (currentUser.testCompleted && user.testCompleted) {
          compatibilityScore = await TestService.calculateCompatibilityScore(
            currentUser.id,
            user.id
          )
        }
        return { ...user, compatibilityScore }
      })
    )

    // Sort by compatibility score (if available)
    enrichedUsers.sort((a, b) => {
      if (a.compatibilityScore === null && b.compatibilityScore === null) return 0
      if (a.compatibilityScore === null) return 1
      if (b.compatibilityScore === null) return -1
      return b.compatibilityScore - a.compatibilityScore
    })

    res.json({
      success: true,
      data: enrichedUsers,
      total: enrichedUsers.length
    })
  })
}
