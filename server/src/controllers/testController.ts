import { Response } from 'express'
import { AuthenticatedRequest } from '../middleware/auth.js'
import { UserService } from '../services/userService.js'
import { TestService } from '../services/testService.js'
import { asyncHandler, createError } from '../middleware/errorHandler.js'
import { z } from 'zod'

const submitAnswerSchema = z.object({
  questionId: z.string().min(1),
  answers: z.array(z.number().min(0))
})

const submitTestSchema = z.object({
  answers: z.array(submitAnswerSchema)
})

export const TestController = {
  // Get all test questions
  getQuestions: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const questions = await TestService.getTestQuestions()
    
    res.json({
      success: true,
      data: questions,
      total: questions.length
    })
  }),

  // Get specific question
  getQuestion: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { questionId } = req.params
    
    const question = await TestService.getQuestion(questionId)
    
    if (!question) {
      throw createError('Question not found', 404, 'QUESTION_NOT_FOUND')
    }

    res.json({
      success: true,
      data: question
    })
  }),

  // Submit answer for a single question
  submitAnswer: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.telegramUser) {
      throw createError('User not authenticated', 401, 'NOT_AUTHENTICATED')
    }

    const validationResult = submitAnswerSchema.safeParse(req.body)
    if (!validationResult.success) {
      throw createError('Invalid data', 400, 'VALIDATION_ERROR')
    }

    const { questionId, answers } = validationResult.data
    const currentUser = await UserService.getOrCreateUser(req.telegramUser)

    // Validate question exists
    const question = await TestService.getQuestion(questionId)
    if (!question) {
      throw createError('Question not found', 404, 'QUESTION_NOT_FOUND')
    }

    // Validate answers
    const maxIndex = question.options.length - 1
    const invalidAnswers = answers.filter(answer => answer < 0 || answer > maxIndex)
    if (invalidAnswers.length > 0) {
      throw createError('Invalid answer indices', 400, 'INVALID_ANSWERS')
    }

    await TestService.saveAnswer(currentUser.id, questionId, answers)

    // Check if test is now completed
    const isCompleted = await TestService.isTestCompleted(currentUser.id)
    
    if (isCompleted) {
      // Update user's test completion status
      await UserService.updateUser(currentUser.id, { testCompleted: true })
    }

    res.json({
      success: true,
      data: {
        questionId,
        answers,
        testCompleted: isCompleted
      }
    })
  }),

  // Submit complete test (all answers at once)
  submitTest: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.telegramUser) {
      throw createError('User not authenticated', 401, 'NOT_AUTHENTICATED')
    }

    const validationResult = submitTestSchema.safeParse(req.body)
    if (!validationResult.success) {
      throw createError('Invalid data', 400, 'VALIDATION_ERROR')
    }

    const { answers } = validationResult.data
    const currentUser = await UserService.getOrCreateUser(req.telegramUser)

    // Validate all questions exist and answers are valid
    for (const answer of answers) {
      const question = await TestService.getQuestion(answer.questionId)
      if (!question) {
        throw createError(`Question ${answer.questionId} not found`, 404, 'QUESTION_NOT_FOUND')
      }

      const maxIndex = question.options.length - 1
      const invalidAnswers = answer.answers.filter(idx => idx < 0 || idx > maxIndex)
      if (invalidAnswers.length > 0) {
        throw createError(`Invalid answer indices for question ${answer.questionId}`, 400, 'INVALID_ANSWERS')
      }
    }

    // Save all answers
    for (const answer of answers) {
      await TestService.saveAnswer(currentUser.id, answer.questionId, answer.answers)
    }

    // Update user's test completion status
    await UserService.updateUser(currentUser.id, { testCompleted: true })

    const testScore = await TestService.getUserTestScore(currentUser.id)

    res.json({
      success: true,
      data: {
        testCompleted: true,
        testScore,
        answersSubmitted: answers.length
      }
    })
  }),

  // Get user's test answers
  getUserAnswers: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.telegramUser) {
      throw createError('User not authenticated', 401, 'NOT_AUTHENTICATED')
    }

    const currentUser = await UserService.getOrCreateUser(req.telegramUser)
    const userAnswers = await TestService.getUserAnswers(currentUser.id)
    const isCompleted = await TestService.isTestCompleted(currentUser.id)

    res.json({
      success: true,
      data: {
        answers: userAnswers,
        testCompleted: isCompleted,
        progress: {
          answered: userAnswers.length,
          total: (await TestService.getTestQuestions()).length
        }
      }
    })
  }),

  // Get test progress
  getProgress: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.telegramUser) {
      throw createError('User not authenticated', 401, 'NOT_AUTHENTICATED')
    }

    const currentUser = await UserService.getOrCreateUser(req.telegramUser)
    const userAnswers = await TestService.getUserAnswers(currentUser.id)
    const totalQuestions = (await TestService.getTestQuestions()).length
    const isCompleted = await TestService.isTestCompleted(currentUser.id)

    const progress = totalQuestions > 0 ? (userAnswers.length / totalQuestions) * 100 : 0

    res.json({
      success: true,
      data: {
        answered: userAnswers.length,
        total: totalQuestions,
        progress: Math.round(progress),
        testCompleted: isCompleted
      }
    })
  }),

  // Calculate compatibility between two users
  getCompatibility: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.telegramUser) {
      throw createError('User not authenticated', 401, 'NOT_AUTHENTICATED')
    }

    const { userId } = req.params
    const currentUser = await UserService.getOrCreateUser(req.telegramUser)

    // Check if target user exists
    const targetUser = await UserService.getUserById(userId)
    if (!targetUser) {
      throw createError('User not found', 404, 'USER_NOT_FOUND')
    }

    // Check if both users completed the test
    const currentUserCompleted = await TestService.isTestCompleted(currentUser.id)
    const targetUserCompleted = await TestService.isTestCompleted(userId)

    if (!currentUserCompleted || !targetUserCompleted) {
      throw createError('Both users must complete the test', 400, 'TEST_NOT_COMPLETED')
    }

    const compatibilityData = await TestService.getCompatibilityInsights(currentUser.id, userId)

    res.json({
      success: true,
      data: compatibilityData
    })
  }),

  // Get user's test score
  getTestScore: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.telegramUser) {
      throw createError('User not authenticated', 401, 'NOT_AUTHENTICATED')
    }

    const currentUser = await UserService.getOrCreateUser(req.telegramUser)
    const testScore = await TestService.getUserTestScore(currentUser.id)
    const isCompleted = await TestService.isTestCompleted(currentUser.id)

    res.json({
      success: true,
      data: {
        testScore,
        testCompleted: isCompleted
      }
    })
  })
}
