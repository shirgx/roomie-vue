<template>
  <div class="flex-col justify-center relative border p-4 rounded shadow overflow-hidden backdrop-blur-lg">
    <div class="flex items-start justify-between">
      <div class="flex-1">
        <div class="flex items-center space-x-2 mb-2">
          <h2 class="text-md font-semibold">{{ props.name }}</h2>
          <div v-if="props.isCompleted" class="flex items-center space-x-1">
            <div class="w-2 h-2 bg-green-500 rounded-full"></div>
            <span class="text-xs text-green-600 font-medium">Пройден</span>
          </div>
          <div v-else-if="props.progress !== undefined" class="flex items-center space-x-1">
            <div class="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <span class="text-xs text-yellow-600 font-medium">{{ props.progress }}%</span>
          </div>
        </div>
        <p class="text-sm">
          {{ props.text }}
        </p>
        <div v-if="props.questionCount && props.answeredCount !== undefined" class="mt-2 text-xs text-muted-foreground">
          Отвечено: {{ props.answeredCount }}/{{ props.questionCount }}
        </div>
      </div>
      <div class="ml-3 flex-shrink-0">
        <div v-if="props.isCompleted" class="w-6 h-6 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
          <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <div v-else class="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
          <svg class="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  name: string
  text: string
  isCompleted?: boolean
  progress?: number
  questionCount?: number
  answeredCount?: number
}>()
</script>