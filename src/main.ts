import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './assets/index.css'
import { authWithTelegram } from './api/auth'

async function init() {
  try {
    const tg = (window as any)?.Telegram?.WebApp
    if (tg) {
      console.log('Initializing Telegram WebApp...')
      tg.ready?.()
      tg.expand?.()
      tg.disableVerticalSwipes?.()

      if (tg.initDataUnsafe?.user?.id) {
        localStorage.setItem('tg_id', String(tg.initDataUnsafe.user.id))
        console.log('Saved Telegram user ID:', tg.initDataUnsafe.user.id)
      }
    }
  } catch (e) {
    console.warn('Telegram WebApp init failed (continuing in dev mode):', e)
  }

  try {
    console.log('Starting authentication...')
    await authWithTelegram()
    console.log('Authentication completed successfully')
  } catch (e) {
    console.error('Authentication failed:', e)
  }

  const app = createApp(App)
  app.use(createPinia())
  app.use(router)
  app.mount('#app')
  
  console.log('Vue app initialized and mounted')
}

init()
