<template>
  <div class="p-4 space-y-4">
    <div v-if="profileIncomplete" class="flex-col justify-center relative border p-4 rounded shadow overflow-hidden backdrop-blur-lg">
      <div class="flex flex-col">
        <div>
          <div class="flex items-center space-x-2 mb-2 text-red-700">
            <h2 class="text-md font-semibold">Пожалуйста, заполните обязательные поля профиля</h2>
          </div>
          <p class="text-sm">Имя, город, возраст и пол необходимы для использования приложения</p>
        </div>
        <div class="mt-4">
          <Button @click="toggleEdit" variant="secondary" class="w-full">Заполнить профиль</Button>
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

            <Button 
              @click="triggerFileUpload"
              class="absolute -bottom-1 -right-1 w-7 h-7 bg-primary text-primary-foreground rounded-full shadow-lg flex items-center justify-center hover:bg-primary/90 transition-colors"
              title="Изменить фото"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
            </Button>
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

        <div v-if="isEditing && formErrors.global" class="p-3 rounded-md bg-destructive/10 text-destructive">
          {{ formErrors.global }}
        </div>

        <div class="grid grid-cols-1 gap-4">
          <div>
            <Label class="block text-xl mb-2">Имя <span class="text-destructive">*</span></Label>
            <Input 
              v-if="isEditing"
              v-model.trim="editForm.full_name"
              type="text"
              placeholder="Введите ваше имя"
              :class="['flex h-9 items-center gap-2 border rounded-sm px-8', formErrors.full_name ? 'border-destructive' : 'border-primary/40']"
            />
            <p v-if="isEditing && formErrors.full_name" class="text-xs text-destructive mt-1">{{ formErrors.full_name }}</p>
            <p v-else-if="!isEditing" class="text-foreground">{{ me?.full_name || '—' }}</p>
          </div>
          
          <div>
            <Label class="block text-md mb-2">Город <span class="text-destructive">*</span></Label>
            <div v-if="isEditing">
              <Combobox v-model="selectedCity">
                <ComboboxAnchor class="block w-full">
                  <div class="relative w-full items-center">
                    <ComboboxInput 
                      class="w-full pl-10 pr-4 py-2 rounded-md" 
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
              <p v-if="formErrors.city" class="text-xs text-destructive mt-1">{{ formErrors.city }}</p>
            </div>
            <p v-else class="text-foreground">{{ me?.city || '—' }}</p>
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
              {{ me?.district }}
            </p>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <Label class="text-md mb-2 block">Возраст <span class="text-destructive">*</span></Label>
              <NumberField
                v-if="isEditing"
                v-model="editForm.age"
                :min="18"
                :max="100"
                :step="1"
              >
                <NumberFieldContent :class="formErrors.age ? 'border-destructive rounded-md' : ''">
                  <NumberFieldDecrement />
                  <NumberFieldInput placeholder="Возраст" />
                  <NumberFieldIncrement />
                </NumberFieldContent>
              </NumberField>
              <p v-if="isEditing && formErrors.age" class="text-xs text-destructive mt-1">{{ formErrors.age }}</p>
              <p v-else-if="!isEditing" class="text-foreground">{{ me?.age ?? '—' }}</p>
            </div>
            
            <div>
              <Label class="text-md mb-2 block">Пол <span class="text-destructive">*</span></Label>
              <div v-if="isEditing" class="space-y-3">
                <div class="flex items-center space-x-3">
                  <label class="relative cursor-pointer">
                    <input 
                      type="radio" 
                      name="gender" 
                      value="male"
                      v-model="editForm.gender"
                      class="sr-only peer"
                    />
                    <div class="w-4 h-4 rounded-full border-2 border-input bg-background transition-all duration-200 peer-checked:border-primary peer-focus:ring-0.5 peer-focus:ring-ring flex items-center justify-center">
                      <div class="w-2 h-2 rounded-full bg-primary opacity-0 "></div>
                    </div>
                  </label>
                  <Label for="profile-male" class="cursor-pointer text-sm font-medium leading-none select-none">
                    Мужской
                  </Label>
                </div>
                <div class="flex items-center space-x-3">
                  <label class="relative cursor-pointer">
                    <input 
                      type="radio" 
                      name="gender" 
                      value="female"
                      v-model="editForm.gender"
                      class="sr-only peer"
                    />
                    <div class="w-4 h-4 rounded-full border-2 border-input bg-background transition-all duration-200 peer-checked:border-primary peer-focus:ring-0.5 peer-focus:ring-ring flex items-center justify-center">
                      <div class="w-2 h-2 rounded-full bg-primary opacity-0 "></div>
                    </div>
                  </label>
                  <Label for="profile-female" class="cursor-pointer text-sm font-medium leading-none select-none">
                    Женский
                  </Label>
                </div>
              </div>
              <p v-if="isEditing && formErrors.gender" class="text-xs text-destructive mt-1">{{ formErrors.gender }}</p>
              <p v-else-if="!isEditing" class="text-foreground">
                {{ me?.gender === 'male' ? 'Мужской' : me?.gender === 'female' ? 'Женский' : '—' }}
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
            <Label class="block text-md mb-2">О себе</Label>
            <Textarea 
              v-if="isEditing"
              v-model="editForm.bio"
              rows="3"
              placeholder="Расскажите о себе..."
              class="w-full px-3 py-2 rounded-md resize-none"
            />
            <p v-else class="text-foreground">{{ me?.bio }}</p>
          </div>

          <div>
            <Label class="block text-md mb-2">О квартире</Label>
            <Textarea 
              v-if="isEditing"
              v-model="editForm.apartment_description"
              rows="3"
              placeholder="Расскажите о вашей квартире..."
              class="w-full px-3 py-2 rounded-md resize-none"
            />
            <p v-else class="text-foreground">{{ me?.apartment_description }}</p>
          </div>
        </div>
        
        <div v-if="isEditing" class="flex justify-between space-x-3 pt-6">
          <Button 
            @click="cancelEdit"
            :disabled="isSaving"
            variant="outline"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
            Отменить
          </Button>
          <Button 
            @click="saveProfile"
            :disabled="isSaving || !isValid"
          >
            <svg v-if="isSaving" class="w-4 h-4 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            <svg v-else class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
            {{ isSaving ? 'Сохранение...' : 'Сохранить' }}
          </Button>
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
import { authWithTelegram } from '@/api/auth'
import { api, API_URL } from '@/api/client'
import { Check, Search } from "lucide-vue-next"
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
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

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

const formErrors = ref<{ [k: string]: string | undefined; global?: string }>({})

const isValid = computed(() => {
  formErrors.value = {}
  const errs: any = {}
  if (!editForm.value.full_name || editForm.value.full_name.trim().length === 0) errs.full_name = 'Введите имя'
  if (!editForm.value.city || editForm.value.city.trim().length === 0) errs.city = 'Выберите город'
  const age = editForm.value.age
  if (age == null || !Number.isFinite(Number(age)) || Number(age) < 18) errs.age = 'Возраст от 18 лет'
  if (editForm.value.gender !== 'male' && editForm.value.gender !== 'female') errs.gender = 'Выберите пол'
  formErrors.value = errs
  return Object.keys(errs).length === 0
})

function toggleEdit() {
  if (isEditing.value) {
    isEditing.value = false
    selectedCity.value = null
    selectedDistrict.value = null
  } else {
    editForm.value = {
      full_name: me.value?.full_name || '',
      city: me.value?.city || '',
      district: me.value?.district || '',
      age: me.value?.age || null,
      gender: me.value?.gender === 'male' || me.value?.gender === 'female' ? me.value.gender : '',
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
  if (!isValid.value) {
    formErrors.value.global = 'Заполните обязательные поля'
    return
  }
  isSaving.value = true
  try {
    await api.put('/users/me', editForm.value)
    me.value = await api.get('/users/me')
    isEditing.value = false
    
    resultTitle.value = 'Успешно'
    resultMessage.value = 'Профиль успешно сохранен'
    showResultDialog.value = true
  } catch (error: any) {
    console.error('Error saving profile:', error)
    resultTitle.value = 'Ошибка'
    try {
      const msg = String(error?.message || '')
      if (msg.includes('400')) {
        resultMessage.value = 'Заполните обязательные поля корректно'
      } else {
        resultMessage.value = 'Ошибка при сохранении профиля'
      }
    } catch {
      resultMessage.value = 'Ошибка при сохранении профиля'
    }
    showResultDialog.value = true
  } finally {
    isSaving.value = false
  }
}

function cancelEdit() {
  isEditing.value = false
  selectedCity.value = null
  selectedDistrict.value = null
  formErrors.value = {}
}

function triggerFileUpload() {
  fileInput.value?.click()
}

async function uploadAvatar(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  const formData = new FormData()
  formData.append('avatar', file)

  try {
    const response = await fetch(`${API_URL}/users/avatar`, {
      method: 'POST',
      headers: {
        'X-User-TgId': String(me.value?.tg_id)
      },
      body: formData
    })

    if (response.ok) {
      await response.json()
      me.value = await api.get('/users/me')
    } else {
      throw new Error('Upload failed')
    }
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
  await authWithTelegram()
  me.value = await api.get('/users/me')
  await loadStats()
})

const profileIncomplete = computed(() => {
  return !me.value?.full_name || !me.value?.city || me.value?.age == null || !me.value?.gender
})
</script>
