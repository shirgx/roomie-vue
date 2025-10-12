<script setup lang="ts">
import { useTheme } from '@/composables/useTheme'
import { Moon, Sun } from 'lucide-vue-next'
const { theme, toggle } = useTheme()
</script>

<template>
  <button
      class="flex items-center justify-center"
      :aria-pressed="theme === 'dark'"
      @click="toggle"
      :aria-label="theme === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему'"
  >
    <Sun v-if="theme !== 'dark'" class="text-icon" :size="24" />
    <Moon v-else class="text-icon" :size="24" />
  </button>
</template>
