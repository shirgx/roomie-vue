import { api } from './client'

export interface UserProfile {
  id: number
  tg_id: number
  username?: string
  full_name?: string
  photo_url?: string
  local_photo_path?: string
  has_apartment?: boolean
  city?: string
  district?: string
  age?: number
  gender?: string
  budget_min?: number
  budget_max?: number
  bio?: string
  auth?: boolean
  testCompleted?: boolean
  created_at: string
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

export async function deleteMyAccount(): Promise<void> {
  return api.delete('/users/me')
}

export async function resetMyTest(): Promise<void> {
  return api.delete('/users/me/test')
}

export function checkProfileCompleteness(user: UserProfile | null): ProfileCompleteness {
  if (!user) {
    return {
      isComplete: false,
      missingFields: ['full_name', 'gender', 'city', 'age']
    }
  }

  const missingFields: string[] = []
  
  if (!user.full_name || user.full_name.trim() === '') {
    missingFields.push('full_name')
  }
  
  if (!user.gender || (user.gender !== 'male' && user.gender !== 'female')) {
    missingFields.push('gender')
  }
  
  if (!user.city || user.city.trim() === '') {
    missingFields.push('city')
  }
  
  if (!user.age || user.age < 18) {
    missingFields.push('age')
  }

  return {
    isComplete: missingFields.length === 0,
    missingFields
  }
}

export function getFieldLabel(fieldName: string): string {
  const labels: Record<string, string> = {
    full_name: 'Имя',
    gender: 'Пол',
    city: 'Город',
    age: 'Возраст'
  }
  return labels[fieldName] || fieldName
}
