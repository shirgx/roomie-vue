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
