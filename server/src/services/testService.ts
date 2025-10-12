import { nanoid } from 'nanoid'
import { TestQuestion, TestAnswer } from '../types/telegram.js'
import { mockTestQuestions } from '../data/mockData.js'
import { logger } from '../utils/logger.js'

// In-memory storage for test answers
const mockTestAnswers: TestAnswer[] = []

export class TestService {
  static async getTestQuestions(): Promise<TestQuestion[]> {
    return mockTestQuestions
  }

  static async getQuestion(questionId: string): Promise<TestQuestion | null> {
    return mockTestQuestions.find(q => q.id === questionId) || null
  }

  static async saveAnswer(userId: string, questionId: string, answers: number[]): Promise<void> {
    const existingAnswerIndex = mockTestAnswers.findIndex(
      answer => answer.userId === userId && answer.questionId === questionId
    )

    const testAnswer: TestAnswer = {
      userId,
      questionId,
      answers
    }

    if (existingAnswerIndex !== -1) {
      mockTestAnswers[existingAnswerIndex] = testAnswer
    } else {
      mockTestAnswers.push(testAnswer)
    }

    logger.info(`Saved answer for user ${userId}, question ${questionId}`)
  }

  static async getUserAnswers(userId: string): Promise<TestAnswer[]> {
    return mockTestAnswers.filter(answer => answer.userId === userId)
  }

  static async isTestCompleted(userId: string): Promise<boolean> {
    const userAnswers = await this.getUserAnswers(userId)
    return userAnswers.length >= mockTestQuestions.length
  }

  static async calculateCompatibilityScore(user1Id: string, user2Id: string): Promise<number> {
    const user1Answers = await this.getUserAnswers(user1Id)
    const user2Answers = await this.getUserAnswers(user2Id)

    if (user1Answers.length === 0 || user2Answers.length === 0) {
      return 0
    }

    let totalQuestions = 0
    let matchingAnswers = 0

    for (const answer1 of user1Answers) {
      const answer2 = user2Answers.find(a => a.questionId === answer1.questionId)
      if (answer2) {
        totalQuestions++
        
        // Calculate similarity based on question type
        const question = await this.getQuestion(answer1.questionId)
        if (question) {
          const similarity = this.calculateAnswerSimilarity(
            question,
            answer1.answers,
            answer2.answers
          )
          matchingAnswers += similarity
        }
      }
    }

    if (totalQuestions === 0) return 0

    const score = Math.round((matchingAnswers / totalQuestions) * 100)
    return Math.max(0, Math.min(100, score))
  }

  private static calculateAnswerSimilarity(
    question: TestQuestion,
    answers1: number[],
    answers2: number[]
  ): number {
    switch (question.type) {
      case 'single':
        // For single choice, either match or don't
        return answers1[0] === answers2[0] ? 1 : 0

      case 'multiple':
        // For multiple choice, calculate Jaccard similarity
        const set1 = new Set(answers1)
        const set2 = new Set(answers2)
        const intersection = new Set([...set1].filter(x => set2.has(x)))
        const union = new Set([...set1, ...set2])
        return union.size > 0 ? intersection.size / union.size : 0

      case 'scale':
        // For scale questions, use inverse distance
        if (answers1.length > 0 && answers2.length > 0) {
          const diff = Math.abs(answers1[0] - answers2[0])
          const maxDiff = question.options.length - 1
          return maxDiff > 0 ? 1 - (diff / maxDiff) : 1
        }
        return 0

      default:
        return 0
    }
  }

  static async getUserTestScore(userId: string): Promise<number | null> {
    const userAnswers = await this.getUserAnswers(userId)
    
    if (userAnswers.length === 0) return null

    // Calculate a general personality score based on answers
    let score = 0
    let totalWeight = 0

    for (const answer of userAnswers) {
      const question = await this.getQuestion(answer.questionId)
      if (question) {
        // Weight different categories differently
        let weight = 1
        switch (question.category) {
          case 'personality':
            weight = 1.5
            break
          case 'lifestyle':
            weight = 1.2
            break
          case 'preferences':
            weight = 1.0
            break
        }

        // Simple scoring based on answer choices
        const answerScore = answer.answers.reduce((sum, idx) => sum + idx, 0) / answer.answers.length
        const normalizedScore = (answerScore / (question.options.length - 1)) * 100

        score += normalizedScore * weight
        totalWeight += weight
      }
    }

    return totalWeight > 0 ? Math.round(score / totalWeight) : null
  }

  static async getCompatibilityInsights(user1Id: string, user2Id: string): Promise<{
    score: number
    strengths: string[]
    concerns: string[]
  }> {
    const score = await this.calculateCompatibilityScore(user1Id, user2Id)
    const user1Answers = await this.getUserAnswers(user1Id)
    const user2Answers = await this.getUserAnswers(user2Id)

    const strengths: string[] = []
    const concerns: string[] = []

    // Analyze specific compatibility aspects
    for (const answer1 of user1Answers) {
      const answer2 = user2Answers.find(a => a.questionId === answer1.questionId)
      const question = await this.getQuestion(answer1.questionId)
      
      if (answer2 && question) {
        const similarity = this.calculateAnswerSimilarity(question, answer1.answers, answer2.answers)
        
        if (similarity >= 0.8) {
          strengths.push(`Схожие взгляды на: ${question.title.toLowerCase()}`)
        } else if (similarity <= 0.3) {
          concerns.push(`Разные предпочтения: ${question.title.toLowerCase()}`)
        }
      }
    }

    return { score, strengths, concerns }
  }
}
