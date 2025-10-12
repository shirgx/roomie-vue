<template>
  <nav class="fixed bottom-0 inset-x-0 z-50 h-14 
  border-t bg-t grid grid-cols-3 pb-[env(safe-area-inset-bottom)]">
    <button class="flex items-center justify-center hover:bg-accent/90 transition-colors" @click="$router.push('/swipe')" :aria-current="$route.path === '/swipe'">
      <House class="text-icon" :size="24" />
    </button>
    <button class="flex items-center justify-center hover:bg-accent/90 transition-colors" @click="$router.push('/test')" :aria-current="$route.path === '/test'">
      <BookCheck class="text-icon" :size="24" />
    </button>
    <button class="flex items-center justify-center hover:bg-accent/90 transition-colors" @click="$router.push('/profile')" :aria-current="$route.path === '/profile'">
      <User class="text-icon" :size="24" />
    </button>
  </nav>
</template>
<script setup lang="ts">
import { House } from 'lucide-vue-next';
import { User } from 'lucide-vue-next';
import { BookCheck } from 'lucide-vue-next';
</script>
