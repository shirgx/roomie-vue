import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './assets/index.css'

async function init() {
  try {
    if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
      const tg = (window as any).Telegram.WebApp
      
      console.log('Initializing Telegram Mini App with WebApp API...')
      
      tg.ready?.()
      tg.expand?.()
      tg.disableVerticalSwipes?.()
      
      console.log('Telegram WebApp initialized:', {
        initData: !!tg.initData,
        initDataUnsafe: tg.initDataUnsafe,
        user: tg.initDataUnsafe?.user,
        platform: tg.platform,
        version: tg.version,
        colorScheme: tg.colorScheme
      })
      
      if (tg.themeParams) {
        console.log('Theme params available:', tg.themeParams)
      }
      
      if (tg.initData) {
        console.log('InitData length:', tg.initData.length)
        console.log('InitData sample (first 100 chars):', tg.initData.substring(0, 100) + '...')
      }
    } else {
      console.log('Telegram WebApp not available (probably running in browser for development)')
    }
  } catch (error) {
    console.log('Failed to initialize Telegram WebApp:', error)
  }
  
  const app = createApp(App)
  app.use(createPinia())
  app.use(router)
  app.mount('#app')
}

init()
