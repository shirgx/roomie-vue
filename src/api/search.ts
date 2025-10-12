import { api } from './client'

export interface UserCard {
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
  apartment_description?: string
  compatibility_percentage?: number
}

export interface SearchFilters {
  city?: string
  district?: string
  age_min?: number
  age_max?: number
  budget_min?: number
  budget_max?: number
  looking_for_apartment?: boolean
  has_apartment?: boolean
}

export async function findUsers(filters: SearchFilters = {}): Promise<UserCard[]> {
  return api.post<UserCard[]>('/search/', filters)
}
