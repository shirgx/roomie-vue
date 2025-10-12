import { api, getInitData } from './client'

export async function checkAuth(): Promise<boolean> {
  try {
    await api.get('/users/me')
    return true
  } catch (error) {
    console.error('Auth check failed:', error)
    return false
  }
}

export function isAuthenticated(): boolean {
  const initData = getInitData()
  return initData !== null || import.meta.env.DEV
}

export function getTelegramUser() {
  try {
    if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
      const tg = (window as any).Telegram.WebApp
      return tg.initDataUnsafe?.user || null
    }
  } catch (error) {
    console.log('Failed to get Telegram user:', error)
  }
  
  // Return mock user for development
  if (import.meta.env.DEV) {
    return {
      id: 999999999,
      first_name: 'Тестовый',
      last_name: 'Пользователь',
      username: 'test_user'
    }
  }
  
  return null
}

export function getTelegramWebApp() {
  if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
    return (window as any).Telegram.WebApp
  }
  return null
}

export async function logout(): Promise<void> {
  try {
    if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
      const tg = (window as any).Telegram.WebApp
      if (tg.close) {
        tg.close()
        return
      }
    }
  } catch (error) {
    console.log('Failed to close Telegram WebApp:', error)
  }
  
  if (typeof window !== 'undefined') {
    window.location.reload()
  }
}

export async function deleteAccount(): Promise<void> {
  return api.delete('/users/me')
}
