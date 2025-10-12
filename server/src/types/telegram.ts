// Telegram Mini App types
export interface TelegramUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  language_code?: string
  is_premium?: boolean
  allows_write_to_pm?: boolean
  photo_url?: string
}

export interface TelegramWebApp {
  initData: string
  initDataUnsafe: {
    user?: TelegramUser
    chat_type?: string
    chat_instance?: string
    auth_date?: number
    hash?: string
  }
  version: string
  platform: string
  colorScheme: 'light' | 'dark'
  themeParams: {
    bg_color?: string
    text_color?: string
    hint_color?: string
    link_color?: string
    button_color?: string
    button_text_color?: string
    secondary_bg_color?: string
  }
  isExpanded: boolean
  viewportHeight: number
  viewportStableHeight: number
}

// Application types
export interface User {
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

export interface Match {
  id: string
  user1Id: string
  user2Id: string
  status: 'pending' | 'matched' | 'rejected'
  createdAt: string
  matchedAt?: string
}

export interface Like {
  fromUserId: string
  toUserId: string
  isLike: boolean
  createdAt: string
}

export interface TestQuestion {
  id: string
  title: string
  type: 'single' | 'multiple' | 'scale'
  options: string[]
  category: 'personality' | 'lifestyle' | 'preferences'
}

export interface TestAnswer {
  userId: string
  questionId: string
  answers: number[] // indices of selected options
}

export interface UserStats {
  totalLikes: number
  totalMatches: number
  profileViews: number
  testScore?: number
}
