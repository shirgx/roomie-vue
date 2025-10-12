<template>
  <article
      class="[
      'relative overflow-hidden shadow select-none bg-black rounded-2xl',
      fill ? 'h-full w-full' : 'mx-auto w-full max-w-sm aspect-[3/4]'
    ]"
      @touchstart.passive="onTouchStart"
      @touchmove.passive="onTouchMove"
      @touchend.passive="onTouchEnd"
  >
    <div class="absolute inset-0 rounded-2xl overflow-hidden">
      <img
          :src="photoSrc"
          :alt="displayName"
          class="h-full w-full object-cover"
          @error="onImgError"
          :key="currentIndex"
      />
    </div>
    
    <div class="absolute inset-0 grid grid-cols-2">
      <button class="h-full" @click.stop="prevPhoto" aria-label="Previous"></button>
      <button class="h-full" @click.stop="nextPhoto" aria-label="Next"></button>
    </div>
    
    <div class="absolute top-3 right-3 z-10">
      <Button
        @click.stop="showDetailModal = true"
        size="icon"
        variant="secondary"
        class="h-8 w-8 bg-black/40 hover:bg-black/60 border-0 backdrop-blur-sm transition-all duration-200"
        aria-label="Подробная информация"
      >
        <Info class="h-4 w-4 text-white" />
      </Button>
    </div>
    
    <div class="absolute top-2 inset-x-0 flex justify-center gap-1 px-3">
      <div
          v-for="(p, i) in photos"
          :key="i"
          class="h-1.5 flex-1 max-w-16 rounded-full"
          :class="i <= currentIndex ? 'bg-white' : 'bg-white/40'"
      />
    </div>
    
    <div v-if="showSwipeIndicator" class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-center animate-pulse">
      <div class="flex flex-col items-center">
        <svg class="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"/>
        </svg>
        <span class="text-sm bg-black/50 px-2 py-1 rounded">Свайп вверх для подробностей</span>
      </div>
    </div>
    
    <div class="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/70 to-transparent"></div>
    
    <div class="absolute inset-x-0 bottom-0 p-4 pb-5 space-y-2">
      <div class="text-white text-xl font-semibold drop-shadow-sm">
        {{ displayName }}{{ userAge ? `, ${userAge}` : '' }}{{ userCity ? ` • ${userCity}` : '' }}
      </div>
      <div class="text-white/90 text-sm drop-shadow-sm line-clamp-2">
        {{ userBio || 'Нет описания' }}
      </div>

      <div v-if="user?.has_apartment" class="text-white/80 text-xs drop-shadow-sm">
        <span class="inline-flex items-center bg-white/20 px-2 py-1 rounded-full">
          {{ user.apartment_type || 'Квартира' }}
          <span v-if="user.apartment_rooms" class="ml-1">• {{ user.apartment_rooms }} комн.</span>
        </span>
      </div>

      <div class="grid grid-cols-3 items-center">
        <Button
            @click="onPass"
            size="icon"
            class="justify-self-start [&>svg]:!h-8 [&>svg]:!w-8 bg-white"
            aria-label="Dislike"
        >
          <HeartOff class="text-black"/>
        </Button>

        <div class="justify-self-center">
          <div
              class="h-12 w-12 rounded-full bg-white/95 text-black grid place-items-center font-semibold shadow"
              :title="`Совместимость: ${compat}%`"
          >
            {{ compat }}%
          </div>
        </div>

        <Button
            @click="onLike"
            size="icon"
            class="justify-self-end [&>svg]:!h-8 [&>svg]:!w-8 bg-white"
            aria-label="Like"
        >
          <Heart class="text-black"/>
        </Button>
      </div>
    </div>
    
    <UserDetailModal 
      :user="user"
      v-model:open="showDetailModal"
      @like="onLike"
      @pass="onPass"
    />
  </article>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Button } from '@/components/ui/button'
import { Heart, HeartOff, Info } from 'lucide-vue-next'
import { UserProfile } from '@/api/user'
import UserDetailModal from './UserDetailModal.vue'

interface Props {
  user: UserProfile
  fill?: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  like: []
  pass: []
}>()

const currentIndex = ref(0)
const showDetailModal = ref(false)
const showSwipeIndicator = ref(true)

// Hide swipe indicator after 3 seconds
onMounted(() => {
  setTimeout(() => {
    showSwipeIndicator.value = false
  }, 3000)
})

const displayName = computed(() => {
  return props.user?.fullName || 'Неизвестный пользователь'
})

const userAge = computed(() => props.user?.age)
const userCity = computed(() => props.user?.city)
const userBio = computed(() => props.user?.bio)

const photos = computed(() => {
  const userPhoto = props.user?.photoUrl
  if (userPhoto) {
    return [userPhoto]
  }
  
  // Default avatar
  return ['/src/assets/images/avatar-placeholder.jpeg']
})

const photoSrc = computed(() => {
  const photo = photos.value[currentIndex.value]
  return photo || '/src/assets/images/avatar-placeholder.jpeg'
})

const compat = computed(() => {
  return props.user?.compatibilityScore || Math.floor(Math.random() * 30) + 60
})

function nextPhoto() {
  if (currentIndex.value < photos.value.length - 1) {
    currentIndex.value++
  }
}

function prevPhoto() {
  if (currentIndex.value > 0) {
    currentIndex.value--
  }
}

function onImgError(event: Event) {
  const img = event.target as HTMLImageElement
  img.src = '/src/assets/images/avatar-placeholder.jpeg'
}

function onLike() {
  emit('like')
}

function onPass() {
  emit('pass')
}

// Touch handling for swipe gestures
let startY = 0
let currentY = 0
let isDragging = false

function onTouchStart(event: TouchEvent) {
  startY = event.touches[0].clientY
  currentY = startY
  isDragging = false
}

function onTouchMove(event: TouchEvent) {
  if (!startY) return
  
  currentY = event.touches[0].clientY
  const deltaY = startY - currentY
  
  if (Math.abs(deltaY) > 10) {
    isDragging = true
  }
}

function onTouchEnd() {
  if (!isDragging || !startY) return
  
  const deltaY = startY - currentY
  
  // Swipe up to show details
  if (deltaY > 50) {
    showDetailModal.value = true
  }
  
  startY = 0
  currentY = 0
  isDragging = false
}
</script>