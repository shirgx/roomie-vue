import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { UserProfile, getCurrentUser, updateUser, getUserStats, UserStats } from '@/api/user'
import { checkAuth } from '@/api/auth'

export const useUserStore = defineStore('user', () => {
  const user = ref<UserProfile | null>(null)
  const stats = ref<UserStats | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!user.value)
  const isProfileComplete = computed(() => {
    if (!user.value) return false
    return !!(
      user.value.fullName &&
      user.value.age &&
      user.value.gender &&
      user.value.city &&
      user.value.bio
    )
  })

  const hasCompletedTest = computed(() => user.value?.testCompleted || false)

  async function fetchUser() {
    try {
      loading.value = true
      error.value = null
      user.value = await getCurrentUser()
      if (user.value.stats) {
        stats.value = user.value.stats
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch user'
      console.error('Failed to fetch user:', err)
    } finally {
      loading.value = false
    }
  }

  async function updateProfile(updates: Partial<UserProfile>) {
    try {
      loading.value = true
      error.value = null
      const updatedUser = await updateUser(updates)
      user.value = updatedUser
      return updatedUser
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update profile'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function refreshStats() {
    try {
      stats.value = await getUserStats()
    } catch (err) {
      console.error('Failed to refresh stats:', err)
    }
  }

  async function checkAuthentication() {
    try {
      const authenticated = await checkAuth()
      if (authenticated) {
        await fetchUser()
      }
      return authenticated
    } catch (err) {
      console.error('Auth check failed:', err)
      return false
    }
  }

  function logout() {
    user.value = null
    stats.value = null
    error.value = null
  }

  return {
    // State
    user,
    stats,
    loading,
    error,
    
    // Getters
    isAuthenticated,
    isProfileComplete,
    hasCompletedTest,
    
    // Actions
    fetchUser,
    updateProfile,
    refreshStats,
    checkAuthentication,
    logout
  }
})
