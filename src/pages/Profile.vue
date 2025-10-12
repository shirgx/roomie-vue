<template>
  <div class="p-4 space-y-4">
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
              <li v-for="field in missingFieldLabels" :key="field">{{ field }}</li>
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

    <div class="relative border rounded-2xl shadow-lg overflow-hidden backdrop-blur-lg">
      <div class="p-6">
        <div class="flex items-center space-x-4">
          <div class="relative">
            <div class="w-20 h-20 rounded-full overflow-hidden bg-muted border-2 border-white shadow-lg">
              <img 
                v-if="avatarUrl" 
                :src="avatarUrl" 
                :alt="me?.full_name || 'Аватар'"
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

            <button 
              @click="triggerFileUpload"
              class="absolute -bottom-1 -right-1 w-7 h-7 bg-primary text-primary-foreground rounded-full shadow-lg flex items-center justify-center hover:bg-primary/90 transition-colors"
              title="Изменить фото"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
            </button>
            <Input 
              ref="fileInput"
              type="file" 
              accept="image/*"
              @change="uploadAvatar"
              class="hidden"
            />
          </div>

          <div class="flex-1">
            <h1 class="text-xl font-semibold text-foreground">
              {{ me?.full_name || 'Без имени' }}
            </h1>
            <p class="text-sm text-muted-foreground">
              {{ me?.username ? '@' + me.username : 'Telegram пользователь' }}
            </p>
            <div class="flex items-center mt-2 space-x-2">
              <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                    :class="me?.auth ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'">
                {{ me?.auth ? 'Авторизован' : 'Не авторизован' }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="border rounded-2xl shadow-lg overflow-hidden backdrop-blur-lg">
      <div class="p-6 space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold text-foreground">Информация о профиле</h2>
          <button 
            @click="toggleEdit"
            class="p-2 rounded-lg border border-border hover:bg-accent hover:text-accent-foreground transition-colors"
            :title="isEditing ? 'Отменить редактирование' : 'Редактировать профиль'"
          >
            <Pencil class="w-4 h-4" />
          </button>
        </div>

        <div class="grid grid-cols-1 gap-4">
          <div>
            <div class="flex items-center space-x-2 mb-2">
              <Label class="block text-md">Имя</Label>
              <span class="text-red-500 text-sm font-bold">*</span>
            </div>
            <Input 
              v-if="isEditing"
              v-model="editForm.full_name"
              type="text"
              placeholder="Введите ваше имя"
              class="flex h-9 items-center gap-2 border rounded-sm px-8"
              :class="!editForm.full_name ? 'border-red-500' : 'border-primary/40'"
            />
            <p v-else :class="!me?.full_name ? 'text-red-500' : 'text-foreground'">
              {{ me?.full_name || 'Не указано' }}
            </p>
          </div>
          
          <div>
            <div class="flex items-center space-x-2 mb-2">
              <Label class="block text-md">Город</Label>
              <span class="text-red-500 text-sm font-bold">*</span>
            </div>
            <div v-if="isEditing">
              <Combobox v-model="selectedCity">
                <ComboboxAnchor class="block w-full">
                  <div class="relative w-full items-center">
                    <ComboboxInput 
                      class="w-full pl-10 pr-4 py-2 rounded-md" 
                      :class="!editForm.city ? 'border-red-500' : ''"
                      :display-value="(val) => val?.label ?? editForm.city ?? ''" 
                      placeholder="Выберите или введите город" 
                    />
                    <span class="absolute start-0 inset-y-0 flex items-center justify-center px-3">
                      <Search class="size-4 text-muted-foreground" />
                    </span>
                  </div>
                </ComboboxAnchor>

                <ComboboxList class="mt-1 max-h-60 overflow-auto bg-background border rounded-md shadow-lg">
                  <ComboboxEmpty class="p-2 text-sm text-muted-foreground">
                    Город не найден
                  </ComboboxEmpty>

                  <ComboboxGroup>
                    <ComboboxItem
                        v-for="city in cities"
                        :key="city.value"
                        :value="city"
                        class="px-3 py-2 cursor-pointer hover:bg-accent"
                    >
                      {{ city.label }}

                      <ComboboxItemIndicator>
                        <Check class="w-4 h-4 ml-auto" />
                      </ComboboxItemIndicator>
                    </ComboboxItem>
                  </ComboboxGroup>
                </ComboboxList>
              </Combobox>
            </div>
            <p v-else :class="!me?.city ? 'text-red-500' : 'text-foreground'">
              {{ me?.city || 'Не указано' }}
            </p>
          </div>

          <div v-if="showDistrictSelect">
            <Label class="block text-md mb-2">Район</Label>
            <Combobox v-if="isEditing" v-model="selectedDistrict">
              <ComboboxAnchor class="block w-full">
                <div class="relative w-full items-center">
                  <ComboboxInput 
                    class="w-full pl-10 pr-4 py-2 rounded-md" 
                    :display-value="(val) => val ?? editForm.district ?? ''" 
                    placeholder="Выберите район" 
                  />
                  <span class="absolute start-0 inset-y-0 flex items-center justify-center px-3">
                    <Search class="size-4 text-muted-foreground" />
                  </span>
                </div>
              </ComboboxAnchor>

              <ComboboxList class="mt-1 max-h-60 overflow-auto bg-background border rounded-md shadow-lg">
                <ComboboxEmpty class="p-2 text-sm text-muted-foreground">
                  Район не найден
                </ComboboxEmpty>

                <ComboboxGroup>
                  <ComboboxItem
                      v-for="district in kazanDistricts"
                      :key="district"
                      :value="district"
                      class="px-3 py-2 cursor-pointer hover:bg-accent"
                  >
                    {{ district }}

                    <ComboboxItemIndicator>
                      <Check class="w-4 h-4 ml-auto" />
                    </ComboboxItemIndicator>
                  </ComboboxItem>
                </ComboboxGroup>
              </ComboboxList>
            </Combobox>
            <p v-else class="text-foreground">
              {{ me?.district || 'Не указано' }}
            </p>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <div class="flex items-center space-x-2 mb-2">
                <Label class="text-md block">Возраст</Label>
                <span class="text-red-500 text-sm font-bold">*</span>
              </div>
              <NumberField
                v-if="isEditing"
                v-model="editForm.age"
                :min="18"
                :max="100"
                :step="1"
              >
                <NumberFieldContent :class="!editForm.age || editForm.age < 18 ? 'border-red-500' : ''">
                  <NumberFieldDecrement />
                  <NumberFieldInput placeholder="Возраст" />
                  <NumberFieldIncrement />
                </NumberFieldContent>
              </NumberField>
              <p v-else :class="!me?.age || me.age < 18 ? 'text-red-500' : 'text-foreground'">
                {{ me?.age || 'Не указано' }}
              </p>
            </div>
            
            <div>
              <div class="flex items-center space-x-2 mb-2">
                <Label class="text-md block">Пол</Label>
                <span class="text-red-500 text-sm font-bold">*</span>
              </div>
              <RadioGroup v-if="isEditing" v-model="editForm.gender">
                <div class="flex items-center space-x-2">
                  <RadioGroupItem id="profile-male" value="male" class="w-5 h-5 border-primary/30" />
                  <Label for="profile-male">Мужской</Label>
                </div>
                <div class="flex items-center space-x-2">
                  <RadioGroupItem id="profile-female" value="female" class="w-5 h-5 border-primary/30" />
                  <Label for="profile-female">Женский</Label>
                </div>
              </RadioGroup>
              <p v-else :class="!me?.gender || (me.gender !== 'male' && me.gender !== 'female') ? 'text-red-500' : 'text-foreground'">
                {{ me?.gender === 'male' ? 'Мужской' : me?.gender === 'female' ? 'Женский' : 'Не указано' }}
              </p>
            </div>
          </div>

          <div>
            <div class="flex items-center space-x-2">
              <Checkbox 
                v-if="isEditing"
                id="has-apartment" 
                class="w-5 h-5"
                v-model:checked="editForm.has_apartment"
              />
              <Label
                v-if="isEditing"
                for="has-apartment"
                class="leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                У меня есть квартира
              </Label>
              <span v-else class="text-sm font-medium text-foreground">
                {{ me?.has_apartment ? 'Есть квартира' : 'Нет квартиры' }}
              </span>
            </div>
          </div>

          <div>
            <Label class="text-md mb-2 block">Бюджет</Label>
            <div v-if="isEditing" class="flex justify-between gap-2">
              <NumberField
                v-model="editForm.budget_min"
                :min="0"
                :step="1000"
                :format-options="{
                  style: 'currency',
                  currency: 'RUB',
                  currencyDisplay: 'narrowSymbol',
                  currencySign: 'accounting',
                  maximumFractionDigits: 0,
                }"
              >
                <Label for="budget-min">Мин: </Label>
                <NumberFieldContent>
                  <NumberFieldDecrement />
                  <NumberFieldInput />
                  <NumberFieldIncrement />
                </NumberFieldContent>
              </NumberField>
              
              <NumberField
                v-model="editForm.budget_max"
                :min="0"
                :step="1000"
                :format-options="{
                  style: 'currency',
                  currency: 'RUB',
                  currencyDisplay: 'narrowSymbol',
                  currencySign: 'accounting',
                  maximumFractionDigits: 0,
                }"
              >
                <Label for="budget-max">Макс: </Label>
                <NumberFieldContent>
                  <NumberFieldDecrement />
                  <NumberFieldInput />
                  <NumberFieldIncrement />
                </NumberFieldContent>
              </NumberField>
            </div>
            <p v-else class="text-foreground">
              {{ budgetText }}
            </p>
          </div>

          <div>
            <div class="flex items-center space-x-2">
              <Label class="block text-md">О себе</Label>
            </div>
            <Textarea 
              v-if="isEditing"
              v-model="editForm.bio"
              rows="3"
              placeholder="Расскажите о себе..."
              class="w-full px-3 py-2 rounded-md resize-none"
            />
            <p v-else class="text-foreground">{{ me?.bio || 'Не указано' }}</p>
          </div>

          <div>
            <div class="flex items-center space-x-2">
              <Label class="block text-md">О квартире</Label>
            </div>
            <Textarea 
              v-if="isEditing"
              v-model="editForm.apartment_description"
              rows="3"
              placeholder="Расскажите о вашей квартире..."
              class="w-full px-3 py-2 rounded-md resize-none"
            />
            <p v-else class="text-foreground">{{ me?.apartment_description || 'Не указано' }}</p>
          </div>
        </div>

        <div v-if="isEditing" class="flex justify-end space-x-2 pt-4">
          <button 
            @click="cancelEdit"
            class="px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors"
          >
            Отмена
          </button>
          <button 
            @click="saveProfile"
            :disabled="isSaving || !canSaveProfile"
            class="px-4 py-2 bg-primary/90 text-primary-foreground rounded-lg hover:bg-primary backdrop-blur-sm disabled:opacity-50 transition-colors shadow-lg"
          >
            {{ isSaving ? 'Сохранение...' : 'Сохранить' }}
          </button>
        </div>
      </div>
    </div>

    <div class="border rounded-2xl shadow-lg overflow-hidden backdrop-blur-lg">
      <div class="p-6">
        <h3 class="text-lg font-semibold text-foreground mb-4">Статистика</h3>
        <div class="grid grid-cols-3 gap-4 text-center">
          <div>
            <div class="text-2xl font-bold text-primary">{{ stats.matches || 0 }}</div>
            <div class="text-sm text-muted-foreground">Мэтчи</div>
          </div>
          <div>
            <div class="text-2xl font-bold text-green-600 dark:text-green-400">{{ stats.likes || 0 }}</div>
            <div class="text-sm text-muted-foreground">Лайки</div>
          </div>
        </div>
      </div>
    </div>
    
    <AlertDialog v-model:open="showResultDialog">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{{ resultTitle }}</AlertDialogTitle>
          <AlertDialogDescription>
            {{ resultMessage }}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction @click="showResultDialog = false">
            ОК
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>

<script setup lang="ts">
import { h, defineComponent } from 'vue'
import { useRouter } from 'vue-router'
import { useHeader } from '@/stores/ui'
import { Settings, Pencil } from 'lucide-vue-next'
import { ref, onMounted, computed, watch } from 'vue'
import { api, API_URL } from '@/api/client'
import { Check, Search } from "lucide-vue-next"
import { checkProfileCompleteness, getFieldLabel } from '@/api/user'
import { 
  Combobox, 
  ComboboxAnchor, 
  ComboboxEmpty, 
  ComboboxGroup, 
  ComboboxInput, 
  ComboboxItem, 
  ComboboxItemIndicator, 
  ComboboxList 
} from "@/components/ui/combobox"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Label } from '@/components/ui/label'
import { NumberField, NumberFieldContent, NumberFieldDecrement, NumberFieldIncrement, NumberFieldInput } from '@/components/ui/number-field'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Textarea } from "@/components/ui/textarea"

const router = useRouter()
const header = useHeader()

const SettingsBtn = defineComponent({
  name: 'SettingsBtn',
  setup() {
    const go = () => router.push('/settings')
    return () =>
        h('button',
            { class: 'inline-flex items-center', onClick: go },
            [ h(Settings, { size: 24 }) ]
        )
  }
})

header.setCustomRight(SettingsBtn)

const me = ref<any>(null)
const isEditing = ref(false)
const isSaving = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const stats = ref({ matches: 0, likes: 0, views: 0 })
const selectedCity = ref<{value: string, label: string} | null>(null)
const selectedDistrict = ref<string | null>(null)

const cities = [
  { value: "Москва", label: "Москва" },
  { value: "Казань", label: "Казань" },
  { value: "Челябинск", label: "Челябинск" },
  { value: "Уфа", label: "Уфа" },
  { value: "Екатеринбург", label: "Екатеринбург" },
  { value: "Санкт-Петербург", label: "Санкт-Петербург" },
  { value: "Нижний Новгород", label: "Нижний Новгород" },
  { value: "Самара", label: "Самара" },
  { value: "Ростов-на-Дону", label: "Ростов-на-Дону" },
  { value: "Краснодар", label: "Краснодар" }
]

const editForm = ref({
  full_name: '',
  city: '',
  district: '',
  age: null as number | null,
  gender: '',
  has_apartment: false,
  budget_min: null as number | null,
  budget_max: null as number | null,
  bio: '',
  apartment_description: ''
})

const avatarUrl = computed(() => {
  if (me.value?.local_photo_path) {
    return `${API_URL}/uploads/${me.value.local_photo_path}`
  }
  return me.value?.photo_url || null
})

const budgetText = computed(() => {
  const min = me.value?.budget_min
  const max = me.value?.budget_max
  if (min && max) return `${min} - ${max} ₽`
  if (min) return `от ${min} ₽`
  if (max) return `до ${max} ₽`
  return 'Не указано'
})

const showResultDialog = ref(false)
const resultTitle = ref('')
const resultMessage = ref('')

const kazanDistricts = [
  'Вахитовский',
  'Авиастроительный', 
  'Кировский',
  'Московский',
  'Ново-Савиновский',
  'Советский',
  'Приволжский'
]

const showDistrictSelect = computed(() => {
  return editForm.value.city.toLowerCase() === 'казань' || me.value?.city?.toLowerCase() === 'казань'
})

watch(selectedCity, (newCity) => {
  if (newCity) {
    editForm.value.city = newCity.value
  }
})

watch(selectedDistrict, (newDistrict) => {
  if (newDistrict) {
    editForm.value.district = newDistrict
  }
})

watch(() => editForm.value.city, (newCity) => {
  if (newCity?.toLowerCase() !== 'казань') {
    editForm.value.district = ''
    selectedDistrict.value = null
  }
})

const profileComplete = computed(() => {
  if (!me.value) return false
  const { isComplete } = checkProfileCompleteness(me.value)
  return isComplete
})

const missingFieldLabels = computed(() => {
  if (!me.value) return []
  const { missingFields } = checkProfileCompleteness(me.value)
  return missingFields.map(field => getFieldLabel(field))
})

const canSaveProfile = computed(() => {
  if (!editForm.value.full_name || editForm.value.full_name.trim() === '') return false
  if (!editForm.value.city || editForm.value.city.trim() === '') return false
  if (!editForm.value.age || editForm.value.age < 18) return false
  if (!editForm.value.gender || (editForm.value.gender !== 'male' && editForm.value.gender !== 'female')) return false
  return true
})

function cancelEdit() {
  isEditing.value = false
  selectedCity.value = null
  selectedDistrict.value = null
}

function toggleEdit() {
  if (isEditing.value) {
    cancelEdit()
  } else {
    editForm.value = {
      full_name: me.value?.full_name || '',
      city: me.value?.city || '',
      district: me.value?.district || '',
      age: me.value?.age || null,
      gender: me.value?.gender || '',
      has_apartment: !!me.value?.has_apartment,
      budget_min: me.value?.budget_min || null,
      budget_max: me.value?.budget_max || null,
      bio: me.value?.bio || '',
      apartment_description: me.value?.apartment_description || ''
    }

    if (editForm.value.city) {
      selectedCity.value = cities.find(c => c.value === editForm.value.city) || null
    }

    if (editForm.value.district) {
      selectedDistrict.value = editForm.value.district
    }
    
    isEditing.value = true
  }
}

async function saveProfile() {
  if (!canSaveProfile.value) {
    resultTitle.value = 'Ошибка'
    resultMessage.value = 'Пожалуйста, заполните все обязательные поля (Имя, Пол, Город, Возраст)'
    showResultDialog.value = true
    return
  }

  isSaving.value = true
  try {
    await api.put('/users/me', editForm.value)
    me.value = await api.get('/users/me')
    isEditing.value = false
    
    resultTitle.value = 'Успешно'
    resultMessage.value = 'Профиль успешно сохранён'
    showResultDialog.value = true
  } catch (error) {
    console.error('Error saving profile:', error)
    resultTitle.value = 'Ошибка'
    resultMessage.value = 'Ошибка при сохранении профиля'
    showResultDialog.value = true
  } finally {
    isSaving.value = false
  }
}

function triggerFileUpload() {
  fileInput.value?.click()
}

async function uploadAvatar(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  try {
    const { uploadFile } = await import('@/api/client')
    await uploadFile('/users/avatar', file)
    me.value = await api.get('/users/me')
  } catch (error) {
    console.error('Error uploading avatar:', error)
    resultTitle.value = 'Ошибка'
    resultMessage.value = 'Ошибка при загрузке фото'
    showResultDialog.value = true
  }
}

function onAvatarError() {
  console.log('Avatar failed to load')
}

async function loadStats() {
  try {
    const [matches, sent, received] = await Promise.all([
      api.get<any[]>('/likes/matches'),
      api.get<any[]>('/likes/sent'),
      api.get<any[]>('/likes/received')
    ])
    
    stats.value = {
      matches: matches.length,
      likes: received.length,
      views: sent.length
    }
  } catch (error) {
    console.error('Error loading stats:', error)
  }
}

onMounted(async () => {
  me.value = await api.get('/users/me')
  await loadStats()
})
</script>
