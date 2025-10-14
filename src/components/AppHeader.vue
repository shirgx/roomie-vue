<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useHeader } from '@/stores/ui'
import { SlidersHorizontal, X, Settings } from 'lucide-vue-next'
import ThemeToggle from "@/components/ui/theme/ThemeToggle.vue";

const header = useHeader()
const route = useRoute()
const router = useRouter()

const onSwipe = computed(() => route.meta.header === 'filters')
const isExpanded = ref(false)

onMounted(() => {
  const tg = (window as any).Telegram?.WebApp
  if (tg) {
    isExpanded.value = tg.isExpanded || false
    
    tg.onEvent('viewportChanged', () => {
      isExpanded.value = tg.isExpanded || false
    })

    const checkExpanded = () => {
      const viewportHeight = tg.viewportHeight || window.innerHeight
      const screenHeight = window.screen.height
      isExpanded.value = viewportHeight > screenHeight * 0.85
    }
    
    checkExpanded()
    window.addEventListener('resize', checkExpanded)
  }
})

const headerPadding = computed(() => {
  if (isExpanded.value) {
    return 'calc(var(--tg-safe-top, env(safe-area-inset-top)) + 60px)'
  } else {
    return 'calc(var(--tg-safe-top, env(safe-area-inset-top)) + 16px)'
  }
})

function go(path: string) {
  if (route.path !== path) router.push(path)
}
</script>

<template>
  <header class="inline-flex items-center justify-center border-b gap-6 transition-all duration-300"
          :class="{
            'py-2': isExpanded,
            'py-3': !isExpanded
          }"
          :style="{ paddingTop: headerPadding }">
    
    <div class="flex items-center gap-2">
      <ThemeToggle :size="24" />
      
      <button v-if="onSwipe" 
              :aria-label="header.filtersOpen ? 'Закрыть фильтры' : 'Открыть фильтры'"
              @click="header.toggleFilters()"
              class="relative">
        <component :is="header.filtersOpen ? X : SlidersHorizontal" :size="24" />
        <span v-if="header.hasActiveFilters"
              class="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-primary animate-pulse"></span>
      </button>
      
      <button aria-label="Настройки" @click="go('/settings')">
        <Settings :size="24" />
      </button>
    </div>
  </header>
</template>
