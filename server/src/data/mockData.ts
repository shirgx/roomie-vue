import { nanoid } from 'nanoid'
import { User, TestQuestion, Match, Like, UserStats } from '../types/telegram.js'

// Mock users data
export const mockUsers: User[] = [
  {
    id: nanoid(),
    telegramId: 111111111,
    username: 'anna_roomie',
    fullName: 'Анна Петрова',
    age: 23,
    gender: 'female',
    city: 'Казань',
    district: 'Вахитовский',
    hasApartment: true,
    budgetMin: 15000,
    budgetMax: 25000,
    bio: 'Студентка КФУ, ищу соседку. Люблю чистоту и порядок, не курю. Готова делить расходы пополам.',
    apartmentDescription: '2-комнатная квартира в центре, есть вся техника, интернет. Рядом остановки и магазины.',
    preferences: {
      ageMin: 20,
      ageMax: 28,
      genderPreference: 'female',
      hasApartmentPreference: false
    },
    testCompleted: true,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-20T15:30:00Z'
  },
  {
    id: nanoid(),
    telegramId: 222222222,
    username: 'max_student',
    fullName: 'Максим Иванов',
    age: 25,
    gender: 'male',
    city: 'Казань',
    district: 'Советский',
    hasApartment: false,
    budgetMin: 10000,
    budgetMax: 20000,
    bio: 'Программист, работаю удаленно. Тихий, аккуратный, не пью и не курю. Ищу комнату или квартиру на двоих.',
    preferences: {
      ageMin: 20,
      ageMax: 30,
      genderPreference: 'any',
      hasApartmentPreference: true,
      budgetMax: 20000
    },
    testCompleted: true,
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-01-25T12:00:00Z'
  },
  {
    id: nanoid(),
    telegramId: 333333333,
    username: 'sofia_design',
    fullName: 'София Козлова',
    age: 22,
    gender: 'female',
    city: 'Казань',
    district: 'Приволжский',
    hasApartment: false,
    budgetMin: 12000,
    budgetMax: 18000,
    bio: 'Дизайнер интерьеров, творческая личность. Ищу единомышленницу для съема квартиры. Люблю растения и уют.',
    preferences: {
      ageMin: 20,
      ageMax: 26,
      genderPreference: 'female',
      hasApartmentPreference: null
    },
    testCompleted: true,
    createdAt: '2024-01-12T14:00:00Z',
    updatedAt: '2024-01-22T09:15:00Z'
  },
  {
    id: nanoid(),
    telegramId: 444444444,
    username: 'dmitry_med',
    fullName: 'Дмитрий Смирнов',
    age: 27,
    gender: 'male',
    city: 'Казань',
    district: 'Кировский',
    hasApartment: true,
    budgetMin: 20000,
    budgetMax: 30000,
    bio: 'Врач-интерн, работаю в больнице. Есть 3-комнатная квартира, ищу соседа. Спокойный, ответственный.',
    apartmentDescription: '3-комнатная квартира, отдельные комнаты, общая кухня и ванная. Тихий район, хорошая транспортная доступность.',
    preferences: {
      ageMin: 24,
      ageMax: 32,
      genderPreference: 'male',
      hasApartmentPreference: false
    },
    testCompleted: true,
    createdAt: '2024-01-08T16:00:00Z',
    updatedAt: '2024-01-28T11:45:00Z'
  },
  {
    id: nanoid(),
    telegramId: 555555555,
    username: 'elena_teacher',
    fullName: 'Елена Волкова',
    age: 24,
    gender: 'female',
    city: 'Казань',
    district: 'Ново-Савиновский',
    hasApartment: false,
    budgetMin: 8000,
    budgetMax: 15000,
    bio: 'Учитель в школе, люблю книги и фильмы. Ищу тихую соседку, которая разделяет мои интересы.',
    preferences: {
      ageMin: 22,
      ageMax: 28,
      genderPreference: 'female',
      hasApartmentPreference: true,
      budgetMax: 15000
    },
    testCompleted: false,
    createdAt: '2024-01-20T13:00:00Z',
    updatedAt: '2024-01-26T10:30:00Z'
  }
]

// Mock test questions
export const mockTestQuestions: TestQuestion[] = [
  {
    id: nanoid(),
    title: 'Как вы предпочитаете проводить вечера?',
    type: 'single',
    category: 'lifestyle',
    options: [
      'Дома с книгой или фильмом',
      'В кафе или ресторане с друзьями', 
      'На прогулке или в спортзале',
      'За работой или учебой'
    ]
  },
  {
    id: nanoid(),
    title: 'Насколько важна для вас чистота в доме?',
    type: 'scale',
    category: 'lifestyle',
    options: [
      'Совсем не важна',
      'Немного важна',
      'Умеренно важна',
      'Очень важна',
      'Критически важна'
    ]
  },
  {
    id: nanoid(),
    title: 'Что из перечисленного вам НЕ подходит в соседе?',
    type: 'multiple',
    category: 'preferences',
    options: [
      'Курение в квартире',
      'Частые гости',
      'Громкая музыка по вечерам',
      'Беспорядок в общих зонах',
      'Домашние животные'
    ]
  },
  {
    id: nanoid(),
    title: 'Как вы относитесь к совместным покупкам?',
    type: 'single',
    category: 'lifestyle',
    options: [
      'Только раздельно',
      'Иногда можно вместе',
      'Предпочитаю совместные',
      'Все равно'
    ]
  },
  {
    id: nanoid(),
    title: 'Ваш режим дня ближе к:',
    type: 'single',
    category: 'lifestyle',
    options: [
      'Жаворонок (рано ложусь, рано встаю)',
      'Сова (поздно ложусь, поздно встаю)',
      'Смешанный режим',
      'Зависит от обстоятельств'
    ]
  }
]

// Mock likes and matches
export const mockLikes: Like[] = [
  {
    fromUserId: mockUsers[0].id,
    toUserId: mockUsers[1].id,
    isLike: true,
    createdAt: '2024-01-26T10:00:00Z'
  },
  {
    fromUserId: mockUsers[1].id,
    toUserId: mockUsers[0].id,
    isLike: true,
    createdAt: '2024-01-26T11:00:00Z'
  },
  {
    fromUserId: mockUsers[2].id,
    toUserId: mockUsers[4].id,
    isLike: true,
    createdAt: '2024-01-27T15:00:00Z'
  },
  {
    fromUserId: mockUsers[0].id,
    toUserId: mockUsers[3].id,
    isLike: false,
    createdAt: '2024-01-25T09:00:00Z'
  }
]

export const mockMatches: Match[] = [
  {
    id: nanoid(),
    user1Id: mockUsers[0].id,
    user2Id: mockUsers[1].id,
    status: 'matched',
    createdAt: '2024-01-26T11:00:00Z',
    matchedAt: '2024-01-26T11:00:00Z'
  }
]

// Mock user stats
export const mockUserStats: Map<string, UserStats> = new Map([
  [mockUsers[0].id, { totalLikes: 3, totalMatches: 1, profileViews: 12, testScore: 85 }],
  [mockUsers[1].id, { totalLikes: 2, totalMatches: 1, profileViews: 8, testScore: 78 }],
  [mockUsers[2].id, { totalLikes: 1, totalMatches: 0, profileViews: 5, testScore: 92 }],
  [mockUsers[3].id, { totalLikes: 0, totalMatches: 0, profileViews: 3, testScore: 71 }],
  [mockUsers[4].id, { totalLikes: 1, totalMatches: 0, profileViews: 7 }] // no test completed
])

// Helper function to get user by telegram ID
export const findUserByTelegramId = (telegramId: number): User | undefined => {
  return mockUsers.find(user => user.telegramId === telegramId)
}

// Helper function to create new user from Telegram data
export const createUserFromTelegram = (telegramUser: any): User => {
  const newUser: User = {
    id: nanoid(),
    telegramId: telegramUser.id,
    username: telegramUser.username,
    fullName: [telegramUser.first_name, telegramUser.last_name].filter(Boolean).join(' '),
    photoUrl: telegramUser.photo_url,
    hasApartment: false,
    testCompleted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  
  // Add to mock data
  mockUsers.push(newUser)
  mockUserStats.set(newUser.id, { totalLikes: 0, totalMatches: 0, profileViews: 0 })
  
  return newUser
}
