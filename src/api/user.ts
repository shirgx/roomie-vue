import { api } from './client'

export interface CompatibilityData {
  score: number
  strengths: string[]
  concerns: string[]
}

export interface UserProfile {
  id: string
  telegramId: number
  username?: string
  fullName: string
  photoUrl?: string
  age?: number
  gender?: 'male' | 'female' | 'other'
  city?: string
  district?: string
  hasApartment: boolean
  budgetMin?: number
  budgetMax?: number
  bio?: string
  apartmentDescription?: string
  preferences?: UserPreferences
  testCompleted: boolean
  createdAt: string
  updatedAt: string
  stats?: UserStats
}

export interface UserPreferences {
  ageMin?: number
  ageMax?: number
  genderPreference?: 'male' | 'female' | 'any'
  cityPreference?: string
  hasApartmentPreference?: boolean | null
  budgetMin?: number
  budgetMax?: number
}

export interface UserStats {
  totalLikes: number
  totalMatches: number
  profileViews: number
  testScore?: number
}

export interface ProfileCompleteness {
  isComplete: boolean
  missingFields: string[]
}

export async function getCurrentUser(): Promise<UserProfile> {
  return api.get<UserProfile>('/users/me')
}

export async function updateUser(data: Partial<UserProfile>): Promise<UserProfile> {
  return api.put<UserProfile>('/users/me', data)
}

export async function getUser(userId: string): Promise<UserProfile> {
  return api.get<UserProfile>(`/users/${userId}`)
}

export async function getUserStats(): Promise<UserStats> {
  return api.get<UserStats>('/users/stats')
}

export async function searchUsers(filters: {
  ageMin?: number
  ageMax?: number
  gender?: string
  city?: string
  hasApartment?: boolean
  budgetMin?: number
  budgetMax?: number
}): Promise<UserProfile[]> {
  const params = new URLSearchParams()
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      params.append(key, String(value))
    }
  })
  
  const queryString = params.toString()
  return api.get<UserProfile[]>(`/users/search${queryString ? `?${queryString}` : ''}`)
}

export function checkProfileCompleteness(user: UserProfile | null): ProfileCompleteness {
  if (!user) {
    return {
      isComplete: false,
      missingFields: ['fullName', 'gender', 'city', 'age']
    }
  }

  const requiredFields = [
    { key: 'fullName', name: 'Имя' },
    { key: 'age', name: 'Возраст' },
    { key: 'gender', name: 'Пол' },
    { key: 'city', name: 'Город' },
    { key: 'bio', name: 'О себе' }
  ]

  const missingFields = requiredFields
    .filter(field => !user[field.key as keyof UserProfile])
    .map(field => field.name)

  return {
    isComplete: missingFields.length === 0,
    missingFields
  }
}

export async function getCompatibilityWithUser(userId: string): Promise<CompatibilityData> {
  return api.get<CompatibilityData>(`/test/compatibility/${userId}`)
}

export async function deleteMyAccount(): Promise<void> {
  return api.delete('/users/me')
}

export async function resetMyTest(): Promise<void> {
  // Since we don't have a specific reset endpoint, we can implement this differently
  // For now, this is a placeholder that could trigger test retaking
  throw new Error('Test reset functionality needs to be implemented in the backend')
}
