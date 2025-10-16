import { api } from './client'

export async function authWithTelegram(): Promise<void> {
  try {
    const tg = (window as any)?.Telegram?.WebApp
    
    if (tg) {
      const hasInitDataString = typeof tg.initData === 'string' && tg.initData.length > 0
      const unsafeUserId: number | undefined = tg.initDataUnsafe?.user?.id

      if (unsafeUserId) {
        localStorage.setItem('tg_id', String(unsafeUserId))
        console.log('Saved tg_id from initDataUnsafe:', unsafeUserId)
      }

      if (hasInitDataString) {
        console.log('Telegram WebApp detected, authenticating with initData...')
        const initData = tg.initData as string
        const response = await api.post('/auth/telegram', { initData })
        console.log('Authentication successful:', response)
        if ((response as any).tg_id) {
          localStorage.setItem('tg_id', String((response as any).tg_id))
          console.log('Saved tg_id to localStorage from server:', (response as any).tg_id)
        }
        return
      } else if (unsafeUserId) {
        console.warn('Telegram WebApp detected but initData is empty. Proceeding with unsafe user id only.')
        return
      }
    }

    console.log('No Telegram WebApp detected, using fallback auth...')
    const fallbackTgId = Math.floor(1_000_000_000 + Math.random() * 9_000_000_000)
    localStorage.setItem('tg_id', String(fallbackTgId))

    console.log('Fallback tg_id set:', fallbackTgId)
    // Removed automatic profile creation
    
  } catch (error) {
    console.error('Authentication failed:', error)
    throw error
  }
}

export async function deleteAccount(): Promise<void> {
  return api.delete('/users/me')
}
