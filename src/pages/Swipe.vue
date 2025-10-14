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
import { ref, onMounted, watch, computed, onActivated } from 'vue'
import { findUsers, type UserCard } from '@/api/search'
import { sendLike } from '@/api/likes'
import SwipeCard from '@/components/SwipeCard.vue'
import { useHeader } from '@/stores/ui'
import { useRoute } from 'vue-router'

const headerStore = useHeader()
const route = useRoute()
const queue = ref<UserCard[]>([])
const idx = ref(0)
const isLoading = ref(false)

const currentUser = computed(() => {
  const user = queue.value[idx.value]
  return user && typeof user === 'object' ? user : null
})

async function loadFeed() {
  if (isLoading.value) return
  
  isLoading.value = true
  try {
    const filters = headerStore.getFilters() || {}
    console.log('Loading feed with filters:', filters)

    const users = await findUsers(filters)
    console.log('Loaded users:', users)
    
    queue.value = Array.isArray(users) ? users : []
    idx.value = 0
    
    console.log('Queue updated:', queue.value.length, 'users')

    if (queue.value.length > 1) {
      console.log('User compatibility order:', queue.value.map(u => ({
        name: u.full_name,
        compatibility: u.compatibility_percentage
      })))
    }
  } catch (e: any) {
    console.error('Error loading feed:', e)
    if (e?.message && e.message.includes('403')) {
      console.log('Test required, redirecting...')
      window.location.hash = '#/basedtest'
      return
    }
    
    queue.value = []
    idx.value = 0
    
    console.warn('Failed to load user feed. Please try again.')
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  console.log('Swipe component mounted, loading feed immediately...')
  await loadFeed()
})

onActivated(async () => {
  console.log('Route activated, reloading feed...')
  await loadFeed()
})

watch(() => headerStore.currentFilters, (newFilters) => {
  if (!isLoading.value) {
    console.log('Filters changed via getter, reloading feed...', newFilters)
    loadFeed()
  }
}, { deep: true, immediate: false })

watch(() => JSON.stringify(headerStore.currentFilters), (newFiltersStr, oldFiltersStr) => {
  if (newFiltersStr !== oldFiltersStr && !isLoading.value) {
    console.log('Filters JSON changed, reloading feed...')
    loadFeed()
  }
}, { immediate: false })

async function likeTop() {
  const user = currentUser.value
  if (!user || !user.id) {
    console.warn('No user to like')
    return
  }
  
  try {
    console.log('Liking user:', user.id)
    await sendLike(user.id, true)
    idx.value++
  } catch (error) {
    console.error('Error sending like:', error)
  }
}

async function passTop() {
  const user = currentUser.value
  if (!user || !user.id) {
    console.warn('No user to pass')
    return
  }
  
  try {
    console.log('Passing user:', user.id)
    await sendLike(user.id, false)
    idx.value++
  } catch (error) {
    console.error('Error sending pass:', error)
  }
}
</script>