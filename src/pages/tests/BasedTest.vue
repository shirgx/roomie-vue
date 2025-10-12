<template>
  <div class="p-4">
    <h1 class="text-lg font-semibold">Базовый тест на совместимость</h1>

    <div v-if="!isLoading" class="mt-4">
      <div class="flex justify-between text-sm text-muted-foreground mb-2">
        <span>Прогресс</span>
        <span>{{ answeredCount }}/{{ questions.length }}</span>
      </div>
      <div class="w-full bg-muted rounded-full h-2">
        <div 
          class="bg-primary h-2 rounded-full transition-all duration-300" 
          :style="{ width: `${progressPercent}%` }"
        ></div>
      </div>
    </div>
    
    <div v-if="isLoading" class="mt-6 text-center">
      <p class="text-muted-foreground">Загрузка вопросов...</p>
    </div>
    
    <div v-else>
      <div v-for="q in questions" :key="q.id" class="flex flex-col space-y-2 mt-6">
        <div class="flex items-center space-x-2">
          <label class="text-sm font-medium text-foreground">{{ q.title }}</label>
          <div 
            class="w-2 h-2 rounded-full transition-colors"
            :class="picked[q.id] !== undefined ? 'bg-green-500' : 'bg-muted-foreground/20'"
          ></div>
        </div>
        <RadioGroup
            :model-value="picked[q.id] !== undefined ? String(picked[q.id]) : ''"
            @update:model-value="val => handleAnswerChange(q.id, val)"
        >
          <div
              v-for="(ans, idx) in q.answers"
              :key="idx"
              class="flex items-center space-x-4"
          >
            <RadioGroupItem :id="`${q.id}-${idx}`" :value="String(idx)" class="w-5 h-5" />
            <label :for="`${q.id}-${idx}`" class="text-sm text-foreground cursor-pointer">{{ ans.text }}</label>
          </div>
        </RadioGroup>
      </div>

      <div v-if="!allQuestionsAnswered && answeredCount > 0" class="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <p class="text-sm text-yellow-800 dark:text-yellow-200">
          Ответьте на все вопросы для завершения теста (осталось: {{ questions.length - answeredCount }})
        </p>
      </div>
      
      <div class="flex justify-between mb-6 mt-6">
        <Button class="text-white bg-danger" @click="$router.back">Назад</Button>
        <Button 
          @click="handleSaveClick" 
          :disabled="isSaving || !allQuestionsAnswered"
          :class="{
            'opacity-50 cursor-not-allowed': !allQuestionsAnswered
          }"
        >
          {{ isSaving ? 'Сохранение...' : allQuestionsAnswered ? 'Сохранить тест' : `Ответьте на все (${answeredCount}/${questions.length})` }}
        </Button>
      </div>
    </div>
    
    <AlertDialog v-model:open="showErrorDialog">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Ошибка загрузки</AlertDialogTitle>
          <AlertDialogDescription>
            {{ errorMessage }}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction @click="showErrorDialog = false">
            ОК
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    
    <AlertDialog v-model:open="showIncompleteDialog">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Тест не завершен</AlertDialogTitle>
          <AlertDialogDescription>
            Пожалуйста, ответьте на все вопросы теста. 
            <br><br>
            Осталось вопросов: {{ questions.length - answeredCount }}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction @click="showIncompleteDialog = false">
            ОК
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    
    <AlertDialog v-model:open="showSuccessDialog">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Тест завершен!</AlertDialogTitle>
          <AlertDialogDescription>
            Тест успешно пройден! Теперь вы можете искать соседей.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction @click="handleSuccessClose">
            ОК
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    
    <AlertDialog v-model:open="showSaveErrorDialog">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Ошибка сохранения</AlertDialogTitle>
          <AlertDialogDescription>
            {{ saveErrorMessage }}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction @click="showSaveErrorDialog = false">
            ОК
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Button } from "@/components/ui/button"
import { fetchQuestions, submitAnswers, type Question } from '@/api/test'
import { api } from '@/api/client'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

const router = useRouter()
const questions = ref<Question[]>([])
const picked = reactive<Record<number, number>>({})
const isLoading = ref(true)
const isSaving = ref(false)

const showErrorDialog = ref(false)
const showIncompleteDialog = ref(false)
const showSuccessDialog = ref(false)
const showSaveErrorDialog = ref(false)
const errorMessage = ref('')
const saveErrorMessage = ref('')

const answeredCount = computed(() => Object.keys(picked).length)
const progressPercent = computed(() => 
  questions.value.length > 0 ? Math.round((answeredCount.value / questions.value.length) * 100) : 0
)

const allQuestionsAnswered = computed(() => {
  return questions.value.length > 0 && answeredCount.value === questions.value.length
})

function handleAnswerChange(questionId: number, value: string) {
  const numValue = Number(value)
  if (!isNaN(numValue)) {
    picked[questionId] = numValue
  }
}

function handleSaveClick() {
  if (!allQuestionsAnswered.value) {
    showIncompleteDialog.value = true
    return
  }
  save()
}

function handleSuccessClose() {
  showSuccessDialog.value = false
  router.push('/test')
}

onMounted(async () => {
  try {
    questions.value = await fetchQuestions()
    
    try {
      const existingAnswers = await api.get('/tests/my-answers') as Record<string, number>
      Object.entries(existingAnswers).forEach(([questionId, answerIndex]) => {
        picked[Number(questionId)] = answerIndex
      })
    } catch (error) {
      console.log('No existing answers found or error loading them:', error)
    }
  } catch (error) {
    console.error('Error loading questions:', error)
    errorMessage.value = 'Ошибка при загрузке вопросов. Проверьте подключение к серверу.'
    showErrorDialog.value = true
  } finally {
    isLoading.value = false
  }
})

async function save() {
  isSaving.value = true
  try {
    const pairs = Object.entries(picked).map(([qId, answerIdx]) => {
      return [Number(qId), Number(answerIdx)] as [number, number]
    })
    
    const result = await submitAnswers(pairs)
    console.log('Test submitted successfully:', result)
    
    window.dispatchEvent(new CustomEvent('testCompleted'))
    
    showSuccessDialog.value = true
  } catch (error) {
    console.error('Error saving answers:', error)
    saveErrorMessage.value = `Ошибка при сохранении ответов: ${error}`
    showSaveErrorDialog.value = true
  } finally {
    isSaving.value = false
  }
}
</script>
