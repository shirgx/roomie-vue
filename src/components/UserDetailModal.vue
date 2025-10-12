<template>
  <Dialog v-model:open="isOpen">
    <DialogContent class="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle class="text-xl font-semibold">
          {{ user?.full_name || 'Пользователь' }}
        </DialogTitle>
      </DialogHeader>
      
      <div class="space-y-6">
        <div class="flex justify-center">
          <div class="w-32 h-32 rounded-full overflow-hidden bg-muted border-4 border-white shadow-lg">
            <img 
              :src="photoSrc" 
              :alt="user?.full_name || 'Аватар'"
              class="w-full h-full object-cover"
              @error="onImgError"
            />
          </div>
        </div>

        <div class="bg-background/50 rounded-lg p-4 space-y-3">
          <h3 class="text-lg font-semibold text-foreground">Основная информация</h3>
          
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span class="text-muted-foreground">Возраст:</span>
              <span class="ml-2 text-foreground">{{ user?.age || 'Не указано' }}</span>
            </div>
            <div>
              <span class="text-muted-foreground">Пол:</span>
              <span class="ml-2 text-foreground">
                {{ user?.gender === 'male' ? 'Мужской' : user?.gender === 'female' ? 'Женский' : 'Не указано' }}
              </span>
            </div>
            <div>
              <span class="text-muted-foreground">Город:</span>
              <span class="ml-2 text-foreground">{{ user?.city || 'Не указано' }}</span>
            </div>
            <div v-if="user?.district">
              <span class="text-muted-foreground">Район:</span>
              <span class="ml-2 text-foreground">{{ user.district }}</span>
            </div>
          </div>

          <div class="pt-2">
            <span class="text-muted-foreground">Бюджет:</span>
            <span class="ml-2 text-foreground">{{ budgetText }}</span>
          </div>
        </div>
        
        <div v-if="user?.bio" class="bg-background/50 rounded-lg p-4 space-y-3">
          <h3 class="text-lg font-semibold text-foreground">О себе</h3>
          <p class="text-foreground leading-relaxed">{{ user.bio }}</p>
        </div>
        
        <div class="bg-background/50 rounded-lg p-4 space-y-3">
          <h3 class="text-lg font-semibold text-foreground">О квартире</h3>
          
          <div class="space-y-3">
            <div class="flex items-center">
              <span class="text-muted-foreground">Статус жилья:</span>
              <span class="ml-2 text-foreground">
                {{ user?.has_apartment ? 'Есть квартира' : 'Ищет квартиру' }}
              </span>
            </div>
            
            <div v-if="user?.apartment_description" class="mt-3">
              <span class="text-muted-foreground block mb-2">Описание:</span>
              <p class="text-foreground leading-relaxed">{{ user.apartment_description }}</p>
            </div>
            
            <div v-else class="mt-3">
              <span class="text-muted-foreground">Описание квартиры не указано</span>
            </div>
          </div>
        </div>
        
        <div v-if="testResults.length > 0" class="bg-background/50 rounded-lg p-4 space-y-3">
          <h3 class="text-lg font-semibold text-foreground">Пройденные тесты</h3>
          
          <div class="space-y-2">
            <div v-for="test in testResults" :key="test.test_name" class="flex justify-between items-center">
              <span class="text-foreground">{{ test.test_name }}</span>
              <span class="text-sm text-muted-foreground">{{ formatDate(test.completed_at) }}</span>
            </div>
          </div>
        </div>
        
        <div class="bg-primary/10 rounded-lg p-4 space-y-3">
          <h3 class="text-lg font-semibold text-foreground">Совместимость</h3>
          
          <div class="flex items-center justify-center">
            <div class="w-20 h-20 rounded-full bg-primary/20 text-primary grid place-items-center">
              <span class="text-2xl font-bold">{{ Math.round(user?.compatibility_percentage || 0) }}%</span>
            </div>
          </div>
        </div>
        
        <div class="flex justify-center space-x-4 pt-4">
          <Button
            @click="$emit('pass')"
            variant="outline"
            size="lg"
            class="min-w-[120px]"
          >
            <HeartOff class="w-5 h-5 mr-2" />
            Пропустить
          </Button>
          
          <Button
            @click="$emit('like')"
            variant="default"
            size="lg"
            class="min-w-[120px]"
          >
            <Heart class="w-5 h-5 mr-2" />
            Лайк
          </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { UserCard } from '@/api/search'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Heart, HeartOff } from 'lucide-vue-next'
import { API_URL } from '@/api/client'
import placeholder from '@/assets/images/avatar-placeholder.jpeg'

const props = defineProps<{
  user: UserCard | null
  open: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  like: []
  pass: []
}>()

const isOpen = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value)
})

const testResults = ref<any[]>([])

const photoSrc = computed(() => {
  if (!props.user) return placeholder
  
  const photoPath = props.user.local_photo_path || props.user.photo_url
  
  if (!photoPath) return placeholder
  if (photoPath.startsWith('http')) return photoPath
  
  const cleanPath = photoPath.startsWith('/') ? photoPath.slice(1) : photoPath
  return `${API_URL.replace(/\/$/, '')}/${cleanPath}`
})

const budgetText = computed(() => {
  const min = props.user?.budget_min
  const max = props.user?.budget_max
  if (min && max) return `${min} - ${max} ₽`
  if (min) return `от ${min} ₽`
  if (max) return `до ${max} ₽`
  return 'Не указано'
})

function onImgError(e: Event) {
  const target = e.target as HTMLImageElement
  target.onerror = null
  target.src = placeholder
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('ru-RU')
}

watch(() => props.open, (isOpen) => {
  if (isOpen && props.user) {
    testResults.value = [
      { test_name: 'Тест личности', completed_at: new Date().toISOString() }
    ]
  }
})
</script>
