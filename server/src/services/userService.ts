import { nanoid } from 'nanoid'
import { User, TelegramUser } from '../types/telegram.js'
import { 
  mockUsers, 
  findUserByTelegramId, 
  createUserFromTelegram,
  mockUserStats
} from '../data/mockData.js'
import { logger } from '../utils/logger.js'

export class UserService {
  static async getOrCreateUser(telegramUser: TelegramUser): Promise<User> {
    let user = findUserByTelegramId(telegramUser.id)
    
    if (!user) {
      logger.info(`Creating new user for Telegram ID: ${telegramUser.id}`)
      user = createUserFromTelegram(telegramUser)
    } else {
      // Update user info from Telegram data if needed
      const updates: Partial<User> = {}
      
      if (telegramUser.username && user.username !== telegramUser.username) {
        updates.username = telegramUser.username
      }
      
      const fullName = [telegramUser.first_name, telegramUser.last_name].filter(Boolean).join(' ')
      if (user.fullName !== fullName) {
        updates.fullName = fullName
      }
      
      if (telegramUser.photo_url && user.photoUrl !== telegramUser.photo_url) {
        updates.photoUrl = telegramUser.photo_url
      }
      
      if (Object.keys(updates).length > 0) {
        user = { ...user, ...updates, updatedAt: new Date().toISOString() }
        const userIndex = mockUsers.findIndex(u => u.id === user!.id)
        if (userIndex !== -1) {
          mockUsers[userIndex] = user
        }
        logger.info(`Updated user ${user.id} from Telegram data`)
      }
    }
    
    return user
  }

  static async getUserById(userId: string): Promise<User | null> {
    return mockUsers.find(user => user.id === userId) || null
  }

  static async updateUser(userId: string, updates: Partial<User>): Promise<User | null> {
    const userIndex = mockUsers.findIndex(user => user.id === userId)
    
    if (userIndex === -1) {
      return null
    }
    
    const updatedUser = {
      ...mockUsers[userIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    }
    
    mockUsers[userIndex] = updatedUser
    logger.info(`Updated user ${userId}`)
    
    return updatedUser
  }

  static async searchUsers(
    currentUserId: string,
    filters: {
      ageMin?: number
      ageMax?: number
      gender?: string
      city?: string
      hasApartment?: boolean
      budgetMin?: number
      budgetMax?: number
    } = {}
  ): Promise<User[]> {
    return mockUsers.filter(user => {
      // Exclude current user
      if (user.id === currentUserId) return false
      
      // Apply filters
      if (filters.ageMin && user.age && user.age < filters.ageMin) return false
      if (filters.ageMax && user.age && user.age > filters.ageMax) return false
      if (filters.gender && user.gender !== filters.gender) return false
      if (filters.city && user.city !== filters.city) return false
      if (filters.hasApartment !== undefined && user.hasApartment !== filters.hasApartment) return false
      
      // Budget compatibility check
      if (filters.budgetMin && user.budgetMax && user.budgetMax < filters.budgetMin) return false
      if (filters.budgetMax && user.budgetMin && user.budgetMin > filters.budgetMax) return false
      
      return true
    })
  }

  static async getUserStats(userId: string) {
    return mockUserStats.get(userId) || {
      totalLikes: 0,
      totalMatches: 0,
      profileViews: 0
    }
  }

  static async incrementProfileViews(userId: string): Promise<void> {
    const stats = mockUserStats.get(userId) || {
      totalLikes: 0,
      totalMatches: 0,
      profileViews: 0
    }
    
    stats.profileViews++
    mockUserStats.set(userId, stats)
  }
}
