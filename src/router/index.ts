import { createRouter, createWebHashHistory } from 'vue-router'
import { getCurrentUser, checkProfileCompleteness } from '@/api/user'

import Swipe from '@/pages/Swipe.vue'
import Test from '@/pages/Test.vue'
import Profile from '@/pages/Profile.vue'
import Settings from '@/pages/Settings.vue'
import Admin from '@/pages/Admin.vue'
import BasedTest from '@/pages/tests/BasedTest.vue'

const routes = [
  { path: '/', redirect: '/swipe' },
  { path: '/swipe', component: Swipe, meta: { scroll: 'none', header: 'filters', requiresProfile: true } },
  { path: '/test', component: Test, meta: { scroll: 'content', requiresProfile: true } },
  { path: '/profile', component: Profile, meta: { scroll: 'content' } },
  { path: '/settings', component: Settings, meta: { scroll: 'content', requiresProfile: true } },
  { path: '/admin', component: Admin, meta: { scroll: 'content', requiresProfile: true } },
  { path: '/basedtest', component: BasedTest, meta: { scroll: 'content', requiresProfile: true } },
]

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

router.beforeEach(async (to, from, next) => {
  if (to.meta.requiresProfile) {
    try {
      const user = await getCurrentUser()
      const { isComplete } = checkProfileCompleteness(user)
      
      if (!isComplete) {
        console.log('Profile incomplete, redirecting to /profile')
        next('/profile')
        return
      }
    } catch (error) {
      console.error('Error checking profile:', error)
      next('/profile')
      return
    }
  }
  
  next()
})

export default router
