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
  return initData !== null
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
  
  const initData = getInitData()
  if (initData && initData.includes('mock_hash_for_development')) {
    return {
      id: 999999,
      first_name: 'Test',
      last_name: 'User',
      username: 'testuser'
    }
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
