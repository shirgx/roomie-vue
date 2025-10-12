<template>
  <div class="p-4">
    <h1 class="text-lg font-semibold">Тестирование</h1>
    
    <div v-if="isLoading" class="mt-6 text-center">
      <p class="text-muted-foreground">Загрузка статуса тестов...</p>
    </div>
    
    <div v-else class="flex-col space-y-4 mt-4">
      <TestCard 
        name="Базовый тест на совместимость" 
        text="Мини-тест определяет ваши привычки и ценности, чтобы подобрать соседа с максимально близким стилем жизни"
        :is-completed="testStatus?.testCompleted"
        :progress="progressPercent"
        :question-count="testStatus?.total"
        :answered-count="testStatus?.answered"
        @click="handleTestCardClick"
        class="cursor-pointer hover:bg-accent/5 transition-colors"
      />
      
      <TestCard 
        name="Тест на финансовую совместимость" 
        text="Определяет ваши взгляды на управление финансами и совместные траты"
        class="opacity-50 cursor-not-allowed"
      >
        <template #status>
          <span class="text-xs text-muted-foreground font-medium">Скоро</span>
        </template>
      </TestCard>
      
      <TestCard 
        name="Тест на бытовые привычки" 
        text="Выявляет ваши предпочтения в ведении домашнего хозяйства и распределении обязанностей"
        class="opacity-50 cursor-not-allowed"
      >
        <template #status>
          <span class="text-xs text-muted-foreground font-medium">Скоро</span>
        </template>
      </TestCard>
    </div>
    
    <div v-if="!isLoading && testStatus" class="mt-6 p-4 bg-muted/30 rounded-lg">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="font-medium">Прогресс тестирования</h3>
          <p class="text-sm text-muted-foreground">
            {{ testStatus.testCompleted ? 'Все обязательные тесты пройдены!' : 'Пройдите тест для доступа к поиску' }}
          </p>
        </div>
        <div class="text-right">
          <div class="text-2xl font-bold" :class="testStatus.testCompleted ? 'text-green-600' : 'text-yellow-600'">
            {{ progressPercent }}%
          </div>
          <div class="text-xs text-muted-foreground">
            {{ testStatus.answered }}/{{ testStatus.total }}
          </div>
        </div>
      </div>
    </div>
    
    <AlertDialog v-model:open="showRetakeDialog">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Пройти тест заново?</AlertDialogTitle>
          <AlertDialogDescription>
            Тест уже пройден. Хотите пройти его заново?
            <br><br>
            Предыдущие результаты будут заменены новыми.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel @click="showRetakeDialog = false">Отмена</AlertDialogCancel>
          <AlertDialogAction @click="goToTest">
            Пройти заново
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, onActivated } from 'vue'
import { useRouter } from 'vue-router'
import TestCard from '@/components/TestCard.vue'
import { getTestProgress, type TestProgress } from '@/api/test'
import { useUserStore } from '@/stores/user'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

const router = useRouter()
const userStore = useUserStore()
const testStatus = ref<TestProgress | null>(null)
const isLoading = ref(true)
const showRetakeDialog = ref(false)

const progressPercent = computed(() => {
  if (!testStatus.value || testStatus.value.total === 0) return 0
  return testStatus.value.progress || 0
})

async function loadTestStatus() {
  try {
    isLoading.value = true
    testStatus.value = await getTestProgress()
    console.log('Test status loaded:', testStatus.value)
  } catch (error) {
    console.error('Error loading test status:', error)
    testStatus.value = null
  } finally {
    isLoading.value = false
  }
}

function handleTestCardClick() {
  if (testStatus.value?.testCompleted) {
    showRetakeDialog.value = true
  } else {
    goToTest()
  }
}

function goToTest() {
  showRetakeDialog.value = false
  router.push('/basedtest')
}

onMounted(loadTestStatus)
onActivated(loadTestStatus)

onMounted(() => {
  const handleTestCompleted = () => {
    console.log('Test completed event received, reloading status...')
    loadTestStatus()
  }
  
  window.addEventListener('testCompleted', handleTestCompleted)

  return () => {
    window.removeEventListener('testCompleted', handleTestCompleted)
  }
})
</script>
