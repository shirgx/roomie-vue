<template>
  <div class="p-4 space-y-4">
    <!-- Profile completeness warning -->
    <div v-if="!profileComplete" class="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-500 rounded-2xl p-4">
      <div class="flex items-start space-x-3">
        <svg class="w-6 h-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
        </svg>
        <div class="flex-1">
          <h3 class="font-semibold text-yellow-800 dark:text-yellow-200 mb-1">Заполните профиль</h3>
          <p class="text-sm text-yellow-700 dark:text-yellow-300 mb-2">
            Для использования приложения необходимо заполнить обязательные поля:
          </p>
          <div class="text-sm text-yellow-700 dark:text-yellow-300">
            <ul class="list-disc list-inside mt-1">
              <li v-for="field in missingFields" :key="field">{{ field }}</li>
            </ul>
          </div>
          <button 
            v-if="!isEditing"
            @click="toggleEdit"
            class="mt-3 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors text-sm font-medium"
          >
            Заполнить профиль
          </button>
        </div>
      </div>
    </div>

    <!-- Profile header -->
    <div class="relative border rounded-2xl shadow-lg overflow-hidden backdrop-blur-lg">
      <div class="p-6">
        <div class="flex items-center space-x-4">
          <div class="relative">
            <div class="w-20 h-20 rounded-full overflow-hidden bg-muted border-2 border-white shadow-lg">
              <img 
                v-if="user?.photoUrl" 
                :src="user.photoUrl" 
                :alt="user?.fullName || 'Аватар'"
                class="w-full h-full object-cover"
                @error="onAvatarError"
              />
              <img 
                v-else
                src="@/assets/images/avatar-placeholder.jpeg"
                alt="Placeholder avatar"
                class="w-full h-full object-cover opacity-60"
              />
            </div>
          </div>

          <div class="flex-1">
            <h1 class="text-xl font-semibold text-foreground">
              {{ user?.fullName || 'Без имени' }}
            </h1>
            <p class="text-sm text-muted-foreground">
              {{ user?.username ? '@' + user.username : 'Telegram пользователь' }}
            </p>
            <div class="flex items-center mt-2 space-x-2">
              <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                Авторизован
              </span>
              <span v-if="user?.testCompleted" class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                Тест пройден
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Profile information -->
    <div class="border rounded-2xl shadow-lg overflow-hidden backdrop-blur-lg">
      <div class="p-6 space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold text-foreground">Информация о профиле</h2>
          <button 
            @click="toggleEdit"
            class="p-2 rounded-lg border border-border hover:bg-accent hover:text-accent-foreground transition-colors"
            :title="isEditing ? 'Отменить редактирование' : 'Редактировать профиль'"
            :disabled="loading"
          >
            <Pencil class="w-4 h-4" />
          </button>
        </div>

        <form @submit.prevent="saveProfile" class="grid grid-cols-1 gap-4">
          <!-- Full Name -->
          <div>
            <Label class="block text-sm font-medium mb-2">Полное имя *</Label>
            <Input 
              v-if="isEditing"
              v-model="editForm.fullName"
              type="text"
              placeholder="Введите ваше имя"
              required
            />
            <p v-else class="text-sm text-muted-foreground py-2">
              {{ user?.fullName || 'Не указано' }}
            </p>
          </div>

          <!-- Age -->
          <div>
            <Label class="block text-sm font-medium mb-2">Возраст *</Label>
            <Input 
              v-if="isEditing"
              v-model.number="editForm.age"
              type="number"
              min="16"
              max="100"
              placeholder="Ваш возраст"
              required
            />
            <p v-else class="text-sm text-muted-foreground py-2">
              {{ user?.age || 'Не указано' }}
            </p>
          </div>

          <!-- Gender -->
          <div>
            <Label class="block text-sm font-medium mb-2">Пол *</Label>
            <select 
              v-if="isEditing"
              v-model="editForm.gender"
              class="w-full px-3 py-2 border border-input bg-background rounded-md"
              required
            >
              <option value="">Выберите пол</option>
              <option value="male">Мужской</option>
              <option value="female">Женский</option>
              <option value="other">Другой</option>
            </select>
            <p v-else class="text-sm text-muted-foreground py-2">
              {{ getGenderLabel(user?.gender) }}
            </p>
          </div>

          <!-- City -->
          <div>
            <Label class="block text-sm font-medium mb-2">Город *</Label>
            <Input 
              v-if="isEditing"
              v-model="editForm.city"
              type="text"
              placeholder="Ваш город"
              required
            />
            <p v-else class="text-sm text-muted-foreground py-2">
              {{ user?.city || 'Не указано' }}
            </p>
          </div>

          <!-- District -->
          <div>
            <Label class="block text-sm font-medium mb-2">Район</Label>
            <Input 
              v-if="isEditing"
              v-model="editForm.district"
              type="text"
              placeholder="Район города"
            />
            <p v-else class="text-sm text-muted-foreground py-2">
              {{ user?.district || 'Не указано' }}
            </p>
          </div>

          <!-- Has Apartment -->
          <div>
            <Label class="block text-sm font-medium mb-2">Жилье</Label>
            <div v-if="isEditing" class="space-y-2">
              <label class="flex items-center space-x-2">
                <input 
                  type="radio" 
                  :value="true" 
                  v-model="editForm.hasApartment"
                  class="text-primary"
                >
                <span class="text-sm">У меня есть квартира/комната</span>
              </label>
              <label class="flex items-center space-x-2">
                <input 
                  type="radio" 
                  :value="false" 
                  v-model="editForm.hasApartment"
                  class="text-primary"
                >
                <span class="text-sm">Ищу квартиру/комнату</span>
              </label>
            </div>
            <p v-else class="text-sm text-muted-foreground py-2">
              {{ user?.hasApartment ? 'Есть жилье' : 'Ищет жилье' }}
            </p>
          </div>

          <!-- Budget -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <Label class="block text-sm font-medium mb-2">Бюджет от (₽)</Label>
              <Input 
                v-if="isEditing"
                v-model.number="editForm.budgetMin"
                type="number"
                min="0"
                placeholder="Минимум"
              />
              <p v-else class="text-sm text-muted-foreground py-2">
                {{ user?.budgetMin ? `${user.budgetMin} ₽` : 'Не указано' }}
              </p>
            </div>
            <div>
              <Label class="block text-sm font-medium mb-2">Бюджет до (₽)</Label>
              <Input 
                v-if="isEditing"
                v-model.number="editForm.budgetMax"
                type="number"
                min="0"
                placeholder="Максимум"
              />
              <p v-else class="text-sm text-muted-foreground py-2">
                {{ user?.budgetMax ? `${user.budgetMax} ₽` : 'Не указано' }}
              </p>
            </div>
          </div>

          <!-- Bio -->
          <div>
            <Label class="block text-sm font-medium mb-2">О себе *</Label>
            <Textarea 
              v-if="isEditing"
              v-model="editForm.bio"
              placeholder="Расскажите о себе..."
              rows="3"
              required
            />
            <p v-else class="text-sm text-muted-foreground py-2">
              {{ user?.bio || 'Не указано' }}
            </p>
          </div>

          <!-- Apartment Description (if has apartment) -->
          <div v-if="(isEditing && editForm.hasApartment) || (!isEditing && user?.hasApartment)">
            <Label class="block text-sm font-medium mb-2">Описание жилья</Label>
            <Textarea 
              v-if="isEditing"
              v-model="editForm.apartmentDescription"
              placeholder="Опишите ваше жилье..."
              rows="2"
            />
            <p v-else class="text-sm text-muted-foreground py-2">
              {{ user?.apartmentDescription || 'Не указано' }}
            </p>
          </div>

          <!-- Save/Cancel buttons -->
          <div v-if="isEditing" class="flex space-x-3 pt-4">
            <Button 
              type="submit" 
              class="flex-1"
              :disabled="loading"
            >
              {{ loading ? 'Сохранение...' : 'Сохранить' }}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              @click="cancelEdit"
              :disabled="loading"
            >
              Отмена
            </Button>
          </div>
        </form>
      </div>
    </div>

    <!-- Statistics -->
    <div v-if="stats" class="border rounded-2xl shadow-lg overflow-hidden backdrop-blur-lg">
      <div class="p-6">
        <h2 class="text-lg font-semibold text-foreground mb-4">Статистика</h2>
        <div class="grid grid-cols-2 gap-4">
          <div class="text-center">
            <div class="text-2xl font-bold text-primary">{{ stats.totalLikes }}</div>
            <div class="text-sm text-muted-foreground">Лайков</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-primary">{{ stats.totalMatches }}</div>
            <div class="text-sm text-muted-foreground">Матчей</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-primary">{{ stats.profileViews }}</div>
            <div class="text-sm text-muted-foreground">Просмотров</div>
          </div>
          <div v-if="stats.testScore" class="text-center">
            <div class="text-2xl font-bold text-primary">{{ stats.testScore }}</div>
            <div class="text-sm text-muted-foreground">Тест-скор</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Test button -->
    <div class="border rounded-2xl shadow-lg overflow-hidden backdrop-blur-lg">
      <div class="p-6">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="font-semibold">Тест совместимости</h3>
            <p class="text-sm text-muted-foreground">
              {{ user?.testCompleted ? 'Тест пройден' : 'Пройдите тест для лучшего подбора' }}
            </p>
          </div>
          <Button 
            @click="goToTest"
            :variant="user?.testCompleted ? 'outline' : 'default'"
          >
            {{ user?.testCompleted ? 'Пересдать' : 'Пройти тест' }}
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { checkProfileCompleteness } from '@/api/user'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Pencil } from 'lucide-vue-next'

const router = useRouter()
const userStore = useUserStore()

const isEditing = ref(false)
const loading = ref(false)
const editForm = ref({
  fullName: '',
  age: null as number | null,
  gender: '',
  city: '',
  district: '',
  hasApartment: false,
  budgetMin: null as number | null,
  budgetMax: null as number | null,
  bio: '',
  apartmentDescription: ''
})

const user = computed(() => userStore.user)
const stats = computed(() => userStore.stats)

const profileCompleteness = computed(() => {
  return checkProfileCompleteness(user.value)
})

const profileComplete = computed(() => profileCompleteness.value.isComplete)
const missingFields = computed(() => profileCompleteness.value.missingFields)

onMounted(async () => {
  if (!user.value) {
    await userStore.fetchUser()
  }
  if (stats.value === null) {
    await userStore.refreshStats()
  }
})

function getGenderLabel(gender?: string) {
  const labels = {
    'male': 'Мужской',
    'female': 'Женский',
    'other': 'Другой'
  }
  return labels[gender as keyof typeof labels] || 'Не указано'
}

function toggleEdit() {
  if (isEditing.value) {
    cancelEdit()
  } else {
    startEdit()
  }
}

function startEdit() {
  if (!user.value) return
  
  editForm.value = {
    fullName: user.value.fullName || '',
    age: user.value.age || null,
    gender: user.value.gender || '',
    city: user.value.city || '',
    district: user.value.district || '',
    hasApartment: user.value.hasApartment || false,
    budgetMin: user.value.budgetMin || null,
    budgetMax: user.value.budgetMax || null,
    bio: user.value.bio || '',
    apartmentDescription: user.value.apartmentDescription || ''
  }
  isEditing.value = true
}

function cancelEdit() {
  isEditing.value = false
  editForm.value = {
    fullName: '',
    age: null,
    gender: '',
    city: '',
    district: '',
    hasApartment: false,
    budgetMin: null,
    budgetMax: null,
    bio: '',
    apartmentDescription: ''
  }
}

async function saveProfile() {
  try {
    loading.value = true
    
    const updates = { ...editForm.value }
    // Remove null values
    Object.keys(updates).forEach(key => {
      if (updates[key as keyof typeof updates] === null || updates[key as keyof typeof updates] === '') {
        delete updates[key as keyof typeof updates]
      }
    })
    
    await userStore.updateProfile(updates)
    isEditing.value = false
  } catch (error) {
    console.error('Error saving profile:', error)
  } finally {
    loading.value = false
  }
}

function onAvatarError(event: Event) {
  const img = event.target as HTMLImageElement
  img.src = '/src/assets/images/avatar-placeholder.jpeg'
}

function goToTest() {
  router.push('/test')
}
</script>
