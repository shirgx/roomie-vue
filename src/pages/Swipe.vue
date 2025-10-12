<template>
  <div class="relative h-full">
    <div class="absolute inset-0 p-4">
      <SwipeCard
          v-if="currentUser"
          :user="currentUser" 
          @like="likeTop" 
          @pass="passTop"
          :fill="true"
          class="rounded-2xl"
      />
      <div v-else-if="!isLoading" class="h-full grid place-items-center">
        <div class="text-center space-y-3">
          <p class="text-base">{{ queue.length === 0 ? 'Карточек больше нет.' : 'Загрузка...' }}</p>
          <button 
            class="px-4 py-2 rounded-md bg-primary text-primary-foreground" 
            @click="loadFeed"
            :disabled="isLoading"
          >
            {{ isLoading ? 'Загрузка...' : 'Обновить ленту' }}
          </button>
        </div>
      </div>
      <div v-else class="h-full grid place-items-center">
        <div class="text-center">
          <p class="text-base">Загрузка карточек...</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, onActivated, watch } from 'vue'
import { getPotentialMatches } from '@/api/search'
import { sendLike } from '@/api/likes'
import { UserProfile } from '@/api/user'
import SwipeCard from '@/components/SwipeCard.vue'
import { useHeader } from '@/stores/ui'
import { useUserStore } from '@/stores/user'

const headerStore = useHeader()
const userStore = useUserStore()
const queue = ref<UserProfile[]>([])
const idx = ref(0)
const isLoading = ref(false)

const currentUser = computed(() => {
  const user = queue.value[idx.value]
  return user && typeof user === 'object' ? user : null
})

watch(() => headerStore.filtersAppliedTimestamp, (newVal, oldVal) => {
  if (newVal !== oldVal && newVal > 0) {
    loadFeed()
  }
})

async function loadFeed() {
  if (isLoading.value) return
  
  isLoading.value = true
  try {
    // Check if user is authenticated and profile is complete
    if (!userStore.isAuthenticated) {
      await userStore.checkAuthentication()
      if (!userStore.isAuthenticated) {
        return
      }
    }

    // Check if test is completed
    if (!userStore.hasCompletedTest) {
      window.location.hash = '#/test'
      return
    }

    // Load potential matches
    const users = await getPotentialMatches(20)
    queue.value = Array.isArray(users) ? users : []
    idx.value = 0
  } catch (e: any) {
    console.error('Error loading feed:', e)
    
    if (e?.message && (e.message.includes('403') || e.message.includes('TEST_NOT_COMPLETED'))) {
      window.location.hash = '#/test'
      return
    }
    
    queue.value = []
    idx.value = 0
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  if (!userStore.user) {
    await userStore.fetchUser()
  }
  loadFeed()
})

onActivated(loadFeed)

async function likeTop() {
  const user = currentUser.value
  if (!user?.id) return
  
  try {
    const result = await sendLike(user.id, true)
    
    // Show match notification if there's a match
    if (result.isMatch && result.match) {
      // You could show a match modal here
      console.log('New match!', result.match)
    }
    
    idx.value++
  } catch (error) {
    console.error('Error sending like:', error)
  }
}

async function passTop() {
  const user = currentUser.value
  if (!user?.id) return
  
  try {
    await sendLike(user.id, false)
    idx.value++
  } catch (error) {
    console.error('Error sending pass:', error)
  }
}
</script>