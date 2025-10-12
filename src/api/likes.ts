import { api } from './client'
import { UserProfile } from './user'

export interface Like {
  fromUserId: string
  toUserId: string
  isLike: boolean
  createdAt: string
  user?: UserProfile
}

export interface Match {
  id: string
  user1Id: string
  user2Id: string
  status: 'pending' | 'matched' | 'rejected'
  createdAt: string
  matchedAt?: string
  partner?: UserProfile
  compatibilityScore?: number
}

export interface LikeResponse {
  like: Like
  isMatch: boolean
  match?: Match
  compatibilityScore?: number
}

export interface MatchDetails extends Match {
  compatibility: {
    score: number
    strengths: string[]
    concerns: string[]
  }
}

export async function sendLike(toUserId: string, isLike: boolean): Promise<LikeResponse> {
  return api.post<LikeResponse>('/matches/like', { toUserId, isLike })
}

export async function getMatches(): Promise<Match[]> {
  return api.get<Match[]>('/matches')
}

export async function getMatchDetails(matchId: string): Promise<MatchDetails> {
  return api.get<MatchDetails>(`/matches/${matchId}`)
}

export async function getLikes(): Promise<{ sent: Like[]; received: Like[] }> {
  return api.get<{ sent: Like[]; received: Like[] }>('/likes')
}

export async function getPotentialMatches(limit = 10): Promise<UserProfile[]> {
  return api.get<UserProfile[]>(`/matches/potential?limit=${limit}`)
}
