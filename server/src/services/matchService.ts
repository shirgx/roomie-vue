import { nanoid } from 'nanoid'
import { Like, Match } from '../types/telegram.js'
import { mockLikes, mockMatches, mockUserStats } from '../data/mockData.js'
import { logger } from '../utils/logger.js'

export class MatchService {
  static async createLike(fromUserId: string, toUserId: string, isLike: boolean): Promise<{ like: Like; isMatch: boolean; match?: Match }> {
    // Check if like already exists
    const existingLikeIndex = mockLikes.findIndex(
      like => like.fromUserId === fromUserId && like.toUserId === toUserId
    )
    
    const newLike: Like = {
      fromUserId,
      toUserId,
      isLike,
      createdAt: new Date().toISOString()
    }
    
    if (existingLikeIndex !== -1) {
      // Update existing like
      mockLikes[existingLikeIndex] = newLike
    } else {
      // Create new like
      mockLikes.push(newLike)
    }
    
    // Update stats
    if (isLike) {
      const fromStats = mockUserStats.get(fromUserId) || { totalLikes: 0, totalMatches: 0, profileViews: 0 }
      fromStats.totalLikes++
      mockUserStats.set(fromUserId, fromStats)
    }
    
    let isMatch = false
    let match: Match | undefined
    
    // Check for mutual like (match)
    if (isLike) {
      const mutualLike = mockLikes.find(
        like => like.fromUserId === toUserId && 
               like.toUserId === fromUserId && 
               like.isLike === true
      )
      
      if (mutualLike) {
        // Create match
        const existingMatch = mockMatches.find(
          m => (m.user1Id === fromUserId && m.user2Id === toUserId) ||
               (m.user1Id === toUserId && m.user2Id === fromUserId)
        )
        
        if (!existingMatch) {
          match = {
            id: nanoid(),
            user1Id: fromUserId,
            user2Id: toUserId,
            status: 'matched',
            createdAt: new Date().toISOString(),
            matchedAt: new Date().toISOString()
          }
          
          mockMatches.push(match)
          isMatch = true
          
          // Update match stats for both users
          const fromStats = mockUserStats.get(fromUserId) || { totalLikes: 0, totalMatches: 0, profileViews: 0 }
          const toStats = mockUserStats.get(toUserId) || { totalLikes: 0, totalMatches: 0, profileViews: 0 }
          
          fromStats.totalMatches++
          toStats.totalMatches++
          
          mockUserStats.set(fromUserId, fromStats)
          mockUserStats.set(toUserId, toStats)
          
          logger.info(`New match created between users ${fromUserId} and ${toUserId}`)
        }
      }
    }
    
    return { like: newLike, isMatch, match }
  }
  
  static async getUserMatches(userId: string): Promise<Match[]> {
    return mockMatches.filter(
      match => (match.user1Id === userId || match.user2Id === userId) && 
               match.status === 'matched'
    )
  }
  
  static async getUserLikes(userId: string): Promise<{ sent: Like[]; received: Like[] }> {
    const sent = mockLikes.filter(like => like.fromUserId === userId)
    const received = mockLikes.filter(like => like.toUserId === userId)
    
    return { sent, received }
  }
  
  static async hasUserLiked(fromUserId: string, toUserId: string): Promise<boolean> {
    const like = mockLikes.find(
      like => like.fromUserId === fromUserId && like.toUserId === toUserId
    )
    return like ? like.isLike : false
  }
  
  static async getMatchDetails(matchId: string): Promise<Match | null> {
    return mockMatches.find(match => match.id === matchId) || null
  }
  
  static async getPotentialMatches(
    userId: string, 
    excludeIds: string[] = []
  ): Promise<string[]> {
    // Get users that current user hasn't interacted with yet
    const userLikes = mockLikes.filter(like => like.fromUserId === userId)
    const likedUserIds = userLikes.map(like => like.toUserId)
    
    // This would normally come from user service, but for now return mock user IDs
    // excluding current user, already liked users, and any specified exclusions
    const allUserIds = Array.from(mockUserStats.keys())
    
    return allUserIds.filter(id => 
      id !== userId && 
      !likedUserIds.includes(id) && 
      !excludeIds.includes(id)
    )
  }
}
