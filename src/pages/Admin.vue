<template>
  <div class="p-4">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-xl font-semibold text-primary">Мой профиль</h1>
      <button @click="loadData" :disabled="isLoading" class="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
        {{ isLoading ? 'Загрузка...' : 'Обновить' }}
      </button>
    </div>

    <div v-if="isLoading" class="text-center py-8">
      <div class="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
      <p class="text-muted-foreground">Загрузка данных...</p>
    </div>

    <div v-else-if="error" class="text-center py-8">
      <div class="bg-destructive/10 border border-destructive/20 rounded-2xl p-6">
        <svg class="w-12 h-12 text-destructive mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 18.5c-.77.833.192 2.5 1.732 2.5z"></path>
        </svg>
        <p class="text-destructive font-medium">Ошибка загрузки профиля</p>
        <p class="text-muted-foreground text-sm mt-1">{{ error }}</p>
      </div>
    </div>

    <div v-else-if="userProfile" class="space-y-6">
      <div class="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6">
        <div class="flex items-center space-x-4 mb-6">
          <div class="w-20 h-20 rounded-full overflow-hidden bg-muted">
            <img 
              v-if="userProfile.local_photo_path || userProfile.photo_url" 
              :src="getUserPhoto(userProfile)"
              :alt="userProfile.full_name || 'User'"
              class="w-full h-full object-cover"
            />
            <div v-else class="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">
              <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
            </div>
          </div>
          
          <div class="flex-1">
            <h2 class="text-xl font-semibold text-foreground">
              {{ userProfile.full_name || userProfile.username || `Пользователь ${userProfile.id}` }}
            </h2>
            <div class="flex items-center space-x-2 mt-1">
              <span class="text-xs px-2 py-1 rounded-full" 
                    :class="userProfile.testCompleted ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'">
                {{ userProfile.testCompleted ? 'Тест пройден' : 'Тест не пройден' }}
              </span>
            </div>
            <div class="text-sm text-muted-foreground mt-2 space-x-2">
              <span>ID: {{ userProfile.id }}</span>
              <span>•</span>
              <span>TG: {{ userProfile.tg_id }}</span>
              <span v-if="userProfile.city">• {{ userProfile.city }}</span>
              <span v-if="userProfile.age">• {{ userProfile.age }} лет</span>
              <span v-if="userProfile.gender">• {{ userProfile.gender }}</span>
            </div>
          </div>
        </div>

        <div v-if="userProfile.bio" class="mb-4">
          <h3 class="text-sm font-medium text-foreground mb-2">О себе:</h3>
          <p class="text-sm text-muted-foreground">{{ userProfile.bio }}</p>
        </div>

        <div class="text-xs text-muted-foreground">
          Регистрация: {{ formatDate(userProfile.created_at) }}
        </div>
      </div>

      <div v-if="userProfile.has_apartment !== undefined || userProfile.budget_min || userProfile.budget_max" class="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-4">
        <h3 class="font-medium text-foreground mb-3">Дополнительная информация</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div v-if="userProfile.has_apartment !== undefined">
            <span class="text-muted-foreground">Статус жилья:</span>
            <span class="ml-2 text-foreground">
              {{ userProfile.has_apartment ? 'Есть квартира' : 'Ищет жилье' }}
            </span>
          </div>
          <div v-if="userProfile.budget_min || userProfile.budget_max">
            <span class="text-muted-foreground">Бюджет:</span>
            <span class="ml-2 text-foreground">
              {{ formatBudget(userProfile.budget_min, userProfile.budget_max) }}
            </span>
          </div>
        </div>
      </div>

      <div class="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-4">
        <div class="flex flex-col space-y-3">
          <AlertDialog>
            <AlertDialogTrigger as-child>
              <button 
                v-if="userProfile.testCompleted"
                :disabled="isActionLoading"
                class="flex items-center justify-center px-4 py-2 text-sm bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
                {{ isActionLoading ? 'Сброс...' : 'Сбросить результаты теста' }}
              </button>
            </AlertDialogTrigger>
            
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Сбросить результаты теста?</AlertDialogTitle>
                <AlertDialogDescription>
                  Вы сможете пройти тест заново.
                  <br><br>
                  Это действие нельзя отменить.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Отмена</AlertDialogCancel>
                <AlertDialogAction @click="handleResetTest" class="bg-orange-600 hover:bg-orange-700">
                  Сбросить
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          
          <AlertDialog>
            <AlertDialogTrigger as-child>
              <button 
                :disabled="isActionLoading"
                class="flex items-center justify-center px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
                {{ isActionLoading ? 'Удаление...' : 'Удалить аккаунт' }}
              </button>
            </AlertDialogTrigger>
            
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Удалить аккаунт</AlertDialogTitle>
                <AlertDialogDescription>
                  Вы уверены, что хотите удалить свой аккаунт?
                  <br><br>
                  Это действие нельзя отменить. Все ваши данные будут удалены.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Отмена</AlertDialogCancel>
                <AlertDialogAction @click="handleDeleteAccount" class="bg-destructive hover:bg-destructive/90">
                  Удалить
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        
        <div class="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p class="text-xs text-yellow-800 dark:text-yellow-200">
            <strong>Внимание:</strong> Удаление аккаунта или сброс теста — необратимые действия. 
            При удалении аккаунта все ваши данные, лайки и матчи будут безвозвратно утеряны.
          </p>
        </div>
      </div>
    </div>
    
    <AlertDialog v-model:open="showResultDialog">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {{ resultTitle }}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {{ resultMessage }}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction @click="handleResultClose">
            ОК
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getCurrentUser, deleteMyAccount, resetMyTest } from '@/api/user'
import { API_URL } from '@/api/client'
import type { UserProfile } from '@/api/user'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

const userProfile = ref<UserProfile | null>(null)
const isLoading = ref(true)
const error = ref<string | null>(null)
const isActionLoading = ref(false)
const showResultDialog = ref(false)
const resultTitle = ref('')
const resultMessage = ref('')

function getUserPhoto(user: UserProfile) {
  return user.photoUrl || undefined
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

function formatBudget(min?: number, max?: number) {
  if (min === undefined && max === undefined) return ''
  if (min !== undefined && max !== undefined) return `${min} - ${max} ₽`
  return `${min !== undefined ? min : max} ₽`
}

async function loadData() {
  isLoading.value = true
  error.value = null
  try {
    userProfile.value = await getCurrentUser()
  } catch (err) {
    console.error('Error loading user profile:', err)
    error.value = 'Не удалось загрузить профиль. Попробуйте позже.'
  } finally {
    isLoading.value = false
  }
}

async function handleDeleteAccount() {
  isActionLoading.value = true
  try {
    await deleteMyAccount()
    resultTitle.value = 'Аккаунт удален'
    resultMessage.value = 'Ваш аккаунт был успешно удален.'
    showResultDialog.value = true
  } catch (error) {
    console.error('Error deleting account:', error)
    resultTitle.value = 'Ошибка'
    resultMessage.value = 'Ошибка при удалении аккаунта'
    showResultDialog.value = true
  } finally {
    isActionLoading.value = false
  }
}

async function handleResetTest() {
  isActionLoading.value = true
  try {
    await resetMyTest()
    resultTitle.value = 'Тест сброшен'
    resultMessage.value = 'Результаты теста сброшены. Пройдите тест заново.'
    showResultDialog.value = true
    await loadData()
  } catch (error) {
    console.error('Error resetting test:', error)
    resultTitle.value = 'Ошибка'
    resultMessage.value = 'Ошибка при сбросе теста'
    showResultDialog.value = true
  } finally {
    isActionLoading.value = false
  }
}

function handleResultClose() {
  showResultDialog.value = false
  if (resultTitle.value === 'Аккаунт удален') {
    window.location.href = '/'
  }
}

onMounted(loadData)
</script>
