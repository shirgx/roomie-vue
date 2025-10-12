import { api } from './client'
import { UserProfile } from './user'

export interface SearchFilters {
  city?: string
  district?: string
  ageMin?: number
  ageMax?: number
  budgetMin?: number
  budgetMax?: number
  gender?: string
  hasApartment?: boolean
}

export async function searchUsers(filters: SearchFilters): Promise<UserProfile[]> {
  const params = new URLSearchParams()
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      params.append(key, String(value))
    }
  })
  
  const queryString = params.toString()
  return api.get<UserProfile[]>(`/users/search${queryString ? `?${queryString}` : ''}`)
}

export async function getPotentialMatches(limit = 10): Promise<UserProfile[]> {
  return api.get<UserProfile[]>(`/matches/potential?limit=${limit}`)
}
