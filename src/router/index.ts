import { createRouter, createWebHashHistory } from 'vue-router'

import Swipe from '@/pages/Swipe.vue'
import Test from '@/pages/Test.vue'
import Profile from '@/pages/Profile.vue'
import Settings from '@/pages/Settings.vue'
import Admin from '@/pages/Admin.vue'
import BasedTest from '@/pages/tests/BasedTest.vue'
import { api } from '@/api/client'

const routes = [
  { path: '/', redirect: '/swipe' },
  { path: '/swipe', component: Swipe, meta: { scroll: 'none', header: 'filters' } },
  { path: '/test', component: Test, meta: { scroll: 'content' } },
  { path: '/profile', component: Profile, meta: { scroll: 'content' } },
  { path: '/settings', component: Settings, meta: { scroll: 'content' } },
  { path: '/admin', component: Admin, meta: { scroll: 'content' } },
  { path: '/basedtest', component: BasedTest, meta: { scroll: 'content' } },
]

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

// Simple guard: prevent access to the app until basic profile fields are filled.
// Allowed paths (white-list): /profile, /settings, /admin (so user can edit/create profile)
const WHITELIST = ['/profile', '/settings', '/admin']

router.beforeEach(async (to) => {
  try {
    if (WHITELIST.includes(to.path)) return true

    // fetch current user (server will return the user by tg_id header)
    const user: any = await api.get('/users/me')

    const hasFullName = user?.full_name && String(user.full_name).trim().length > 0
    const hasCity = user?.city && String(user.city).trim().length > 0
    const hasAge = user?.age != null && Number(user.age) >= 18
    const hasGender = user?.gender === 'male' || user?.gender === 'female'

    const ok = hasFullName && hasCity && hasAge && hasGender
    if (!ok) {
      return { path: '/profile' }
    }

    return true
  } catch (err) {
    // If API fails (no user yet), redirect to profile to create it.
    return { path: '/profile' }
  }
})

export default router
