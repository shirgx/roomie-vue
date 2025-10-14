<template>
  <div :style="{ backgroundImage: bg }"
       class="min-h-dvh flex flex-col bg-cover bg-center bg-no-repeat bg-fixed">
    <AppHeader/>

    <main class="absolute inset-x-0 min-h-[calc(100dvh-3.5rem-3.5rem) bottom-[calc(3.5rem+env(safe-area-inset-bottom))] p-6
    [--header-extra-gap:20px] md:[--header-extra-gap:10px] lg:[--header-extra-gap:10px]"
    :class="scrollMode === 'content' ? 'overflow-auto' : 'overflow-hidden'"
    :style="{
    top:    `calc(3.5rem + var(--tg-safe-top, env(safe-area-inset-top)) + var(--header-extra-gap))`,
    bottom: `calc(3.5rem + var(--tg-safe-bottom, env(safe-area-inset-bottom)))`
  }">
      <router-view />
    </main>

    <Transition
        enter-from-class="opacity-0 -translate-y-3"
        enter-active-class="transition transform duration-250 ease-out"
        enter-to-class="opacity-100 translate-y-0"
        leave-from-class="opacity-100 translate-y-0"
        leave-active-class="transition transform duration-200 ease-in"
        leave-to-class="opacity-0 -translate-y-2"
        class="backdrop-blur-sm"
    >
      <div v-if="header.filtersOpen"
           class="fixed inset-x-0 top-[3.5rem] z-50 border rounded-2xl transition-all m-6
           [--header-extra-gap:20px] md:[--header-extra-gap:10px] lg:[--header-extra-gap:10px]"
           :style="{
             marginTop: `calc(var(--tg-safe-top, env(safe-area-inset-top)) + var(--header-extra-gap))`,
             marginBottom: '3.5rem'
           }">
        <Filters @close="header.closeFilters()" />
      </div>
    </Transition>
    
    <FooterNav />
  </div>
</template>

<script setup lang="ts">
import AppHeader from '@/components/AppHeader.vue'
import Filters from '@/components/Filters.vue'
import FooterNav from "@/components/FooterNav.vue";
import { useHeader } from '@/stores/ui'
import { useRoute } from 'vue-router'
import { watch, computed } from 'vue'
import bgLight from '@/assets/bg/background_light.jpg'
import bgDark  from '@/assets/bg/background_dark.jpg'
import { useTheme } from '@/composables/useTheme'
import { onMounted } from 'vue'

onMounted(async () => {
  try {
    const tg = (window as any)?.Telegram?.WebApp
    
    if (tg) {
      console.log('Telegram WebApp detected in App.vue')
      
      if (tg.expand) {
        tg.expand()
      }
      
      if (tg.requestFullscreen) {
        try {
          tg.requestFullscreen()
        } catch (e) {
          console.warn('Fullscreen request failed:', e)
        }
      }
    } else {
      console.warn('Telegram WebApp not available in App.vue')
    }
  } catch (e) {
    console.warn('[TMA] init failed:', e)
  }
})

// Use background depending on theme
const { theme } = useTheme()
const bg = computed(() => `url(${theme.value === 'dark' ? bgDark : bgLight})`)

const header = useHeader()
const route = useRoute()
const scrollMode = computed(() => (route.meta.scroll as 'none'|'content') ?? 'none')

watch(() => route.fullPath, () => header.closeFilters())
</script>
