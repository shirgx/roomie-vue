<template>
  <div class="p-4 space-y-6">
    <h2 class="text-xl font-semibold text-primary">Настройки</h2>
    
    <div class="space-y-4">
      <div class="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-4">
        <h3 class="font-medium text-foreground mb-3">Аккаунт</h3>
        <div class="space-y-3">
          <button 
            @click="goToProfile"
            class="w-full flex items-center justify-between p-3 bg-muted/30 hover:bg-muted/50 rounded-xl transition-colors"
          >
            <div class="flex items-center space-x-3">
              <svg class="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
              <span class="text-foreground">Редактировать профиль</span>
            </div>
            <svg class="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </button>
          
          <button 
            @click="retakeTest"
            class="w-full flex items-center justify-between p-3 bg-muted/30 hover:bg-muted/50 rounded-xl transition-colors"
          >
            <div class="flex items-center space-x-3">
              <svg class="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              <span class="text-foreground">Пройти тест заново</span>
            </div>
            <svg class="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </button>
        </div>
      </div>
      
      <div v-if="isAdmin" class="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-4">
        <h3 class="font-medium text-foreground mb-3">Администрирование</h3>
        <button 
          @click="goToAdmin"
          class="w-full flex items-center justify-between p-3 bg-primary/10 hover:bg-primary/20 rounded-xl transition-colors"
        >
          <div class="flex items-center space-x-3">
            <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
            <span class="text-primary font-medium">Админ панель</span>
          </div>
          <svg class="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </button>
      </div>
      
      <div class="bg-card/50 backdrop-blur-sm border border-destructive/20 rounded-2xl p-4">
        <AlertDialog>
          <AlertDialogTrigger as-child>
            <button class="w-full flex items-center justify-between p-3 bg-destructive/10 hover:bg-destructive/20 rounded-xl transition-colors">
              <div class="flex items-center space-x-3">
                <svg class="w-5 h-5 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
                <span class="text-destructive">Удалить аккаунт</span>
              </div>
              <svg class="w-4 h-4 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>
          </AlertDialogTrigger>
          
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Удалить аккаунт</AlertDialogTitle>
              <AlertDialogDescription>
                Вы уверены, что хотите удалить свой аккаунт?
                <br><br>
                Это действие нельзя отменить. Все ваши данные, лайки и матчи будут удалены.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Отмена</AlertDialogCancel>
              <AlertDialogAction
                @click="showFinalConfirmation = true"
                class="bg-destructive hover:bg-destructive/90"
              >
                Удалить
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>

    <AlertDialog v-model:open="showFinalConfirmation">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle class="text-destructive">Последнее предупреждение!</AlertDialogTitle>
          <AlertDialogDescription>
            Вы действительно хотите безвозвратно удалить аккаунт?
            <br><br>
            <strong>Это действие нельзя отменить!</strong>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel @click="showFinalConfirmation = false">
            Отмена
          </AlertDialogCancel>
          <AlertDialogAction
            @click="handleDeleteAccount"
            class="bg-destructive hover:bg-destructive/90"
          >
            Удалить навсегда
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    <AlertDialog v-model:open="showResultDialog">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {{ deleteSuccess ? 'Аккаунт удален' : 'Ошибка' }}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {{ deleteMessage }}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction @click="handleResultDialogClose">
            ОК
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { checkAdminAccess } from '@/api/admin'
import { deleteAccount } from '@/api/auth'
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

const router = useRouter()
const isAdmin = ref(false)
const showFinalConfirmation = ref(false)
const showResultDialog = ref(false)
const deleteSuccess = ref(false)
const deleteMessage = ref('')

function goToProfile() {
  router.push('/profile')
}

function retakeTest() {
  router.push('/test')
}

function goToAdmin() {
  router.push('/admin')
}

async function handleDeleteAccount() {
  showFinalConfirmation.value = false
  
  try {
    await deleteAccount()
    deleteSuccess.value = true
    deleteMessage.value = 'Ваш аккаунт был успешно удален'
  } catch (error) {
    console.error('Error deleting account:', error)
    deleteSuccess.value = false
    deleteMessage.value = 'Произошла ошибка при удалении аккаунта. Попробуйте еще раз.'
  }
  
  showResultDialog.value = true
}

function handleResultDialogClose() {
  showResultDialog.value = false
  if (deleteSuccess.value) {
    window.location.reload()
  }
}

async function checkIfAdmin() {
  try {
    isAdmin.value = await checkAdminAccess()
  } catch (error) {
    isAdmin.value = false
  }
}

onMounted(checkIfAdmin)
</script>
