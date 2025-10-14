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
    const existing = localStorage.getItem('tg_id')
    let fallbackTgId: number
    if (existing && /^\d+$/.test(existing)) {
      fallbackTgId = Number(existing)
    } else {
      fallbackTgId = Math.floor(1_000_000_000 + Math.random() * 9_000_000_000)
      localStorage.setItem('tg_id', String(fallbackTgId))
    }

    try {
      await api.get('/users/me')
      console.log('Fallback user exists (tg_id=', fallbackTgId, ')')
    } catch (error) {
      console.log('Creating fallback user with tg_id:', fallbackTgId)
      const mockInitData = `user=${encodeURIComponent(JSON.stringify({
        id: fallbackTgId,
        first_name: 'Dev',
        last_name: 'User', 
        username: `dev_${fallbackTgId}`,
        photo_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face'
      }))}&hash=mock_hash_for_dev`
      try {
        await api.post('/auth/telegram', { initData: mockInitData })
        console.log('Fallback user created')
      } catch (authError) {
        console.warn('Fallback auth failed:', authError)
      }
    }
    
  } catch (error) {
    console.error('Authentication failed:', error)
    throw error
  }
}

export async function deleteAccount(): Promise<void> {
  return api.delete('/users/me')
}
