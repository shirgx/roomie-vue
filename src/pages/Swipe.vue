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
import { findUsers, type UserCard } from '@/api/search'
import { sendLike } from '@/api/likes'
import SwipeCard from '@/components/SwipeCard.vue'
import { useHeader } from '@/stores/ui'

const headerStore = useHeader()
const queue = ref<UserCard[]>([])
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
    const filters = headerStore.getFilters() || {}
    const users = await findUsers(filters)
    
    queue.value = Array.isArray(users) ? users : []
    idx.value = 0
  } catch (e: any) {
    if (e?.message && e.message.includes('403')) {
      window.location.hash = '#/basedtest'
      return
    }
    
    queue.value = []
    idx.value = 0
  } finally {
    isLoading.value = false
  }
}

onMounted(loadFeed)
onActivated(loadFeed)

async function likeTop() {
  const user = currentUser.value
  if (!user?.id) return
  
  try {
    await sendLike(user.id, true)
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