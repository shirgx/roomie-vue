<template>
  <div class="max-h-[80vh] overflow-y-auto backdrop-blur-sm rounded-xl relative bg-secondary/30">
    <div class="sticky top-0 bg-secondary/30 backdrop-blur-md z-10 px-4 pt-4 pb-2 border-b">
      <h2 class="text-lg font-medium">Фильтры</h2>
    </div>
    
    <div class="px-4 py-4 space-y-4">
      <div class="flex items-center space-x-2">
        <input
          id="apartment"
          type="checkbox"
          v-model="localFilters.looking_for_apartment"
          :class="[
            'w-5 h-5 rounded focus:ring-2 focus:ring-ring focus:ring-offset-2 peer',
            localFilters.looking_for_apartment ? 'border-0' : 'border border-border'
          ]"
        />
        <Label
            for="apartment"  
            class="leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Ищу квартиру
        </Label>
      </div>
      
      <div>
        <Label class="flex justify-start w-full text-md mb-2">Город</Label>
        <Combobox v-model="selectedCity">
          <ComboboxAnchor class="block w-full">
            <div class="relative w-full items-center">
              <ComboboxInput 
                class="w-full pl-10 pr-4 py-2 rounded-md" 
                :display-value="(val) => val?.Label ?? ''" 
                placeholder="Выберите город" 
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
                {{ city.Label }}

                <ComboboxItemIndicator>
                  <Check class="w-4 h-4 ml-auto" />
                </ComboboxItemIndicator>
              </ComboboxItem>
            </ComboboxGroup>
          </ComboboxList>
        </Combobox>
      </div>
      
      <div v-if="showDistrictFilter">
        <Label class="flex justify-start w-full text-md mb-2">Район</Label>
        <Combobox v-model="selectedDistrict">
          <ComboboxAnchor class="block w-full">
            <div class="relative w-full items-center">
              <ComboboxInput 
                class="w-full pl-10 pr-4 py-2 rounded-md" 
                :display-value="(val) => val ?? ''" 
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
      </div>
      
      <div>
        <Label class="text-md mb-2 block">Возраст</Label>
        <div class="flex justify-between gap-2">
          <NumberField
              v-model="localFilters.age_min"
              :min="18"
              :max="80"
              :step="1"
          >
            <Label for="age-min">От: </Label>
            <NumberFieldContent>
              <NumberFieldDecrement />
              <NumberFieldInput />
              <NumberFieldIncrement />
            </NumberFieldContent>
          </NumberField>
          
          <NumberField
              v-model="localFilters.age_max"
              :min="18"
              :max="80"
              :step="1"
          >
            <Label for="age-max">До: </Label>
            <NumberFieldContent>
              <NumberFieldDecrement />
              <NumberFieldInput />
              <NumberFieldIncrement />
            </NumberFieldContent>
          </NumberField>
        </div>
      </div>
      
      <div>
        <Label class="text-md mb-2 block">Бюджет</Label>
        <div class="flex justify-between gap-2">
          <NumberField
              v-model="localFilters.budget_min"
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
              v-model="localFilters.budget_max"
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
      </div>
    </div>

    <div class="sticky bottom-0 bg-secondary/30 backdrop-blur-md z-10 px-4 pb-4 pt-2 border-t">
      <div class="flex gap-2">
        <Button class="px-4 py-2 rounded-md border border-border w-full" @click="cancel">
          Отмена
        </Button>
        <Button class="px-4 py-2 rounded-md bg-destructive text-destructive-foreground w-full" @click="resetFilters">
          Сбросить
        </Button>
        <Button class="px-4 py-2 rounded-md bg-primary text-primary-foreground w-full" @click="apply">
          Применить
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, watch, computed, onMounted } from 'vue'
import { Check, Search } from 'lucide-vue-next'
import { Combobox, ComboboxAnchor, ComboboxEmpty, ComboboxGroup, ComboboxInput, ComboboxItem, ComboboxItemIndicator, ComboboxList } from '@/components/ui/combobox'
import { Label } from '@/components/ui/label'
import { NumberField, NumberFieldContent, NumberFieldDecrement, NumberFieldIncrement, NumberFieldInput } from '@/components/ui/number-field'
import { Button } from '@/components/ui/button'
import { useHeader } from '@/stores/ui'

const emit = defineEmits<{ (e: 'close'): void }>()
const headerStore = useHeader()

const cities = [
  { value: 'Москва', Label: 'Москва' },
  { value: 'Казань', Label: 'Казань' },
  { value: 'Челябинск', Label: 'Челябинск' },
  { value: 'Уфа', Label: 'Уфа' },
  { value: 'Екатеринбург', Label: 'Екатеринбург' },
]

const selectedCity = ref<any>()
const selectedDistrict = ref<string>()
const localFilters = reactive({
  looking_for_apartment: undefined as boolean | undefined,
  city: '',
  district: '',
  age_min: undefined as number | undefined,
  age_max: undefined as number | undefined,
  budget_min: undefined as number | undefined,
  budget_max: undefined as number | undefined,
})

watch(selectedCity, (newCity) => {
  localFilters.city = newCity?.value || ''
})

watch(selectedDistrict, (newDistrict) => {
  localFilters.district = newDistrict || ''
})

const kazanDistricts = [
  'Вахитовский',
  'Авиастроительный',
  'Кировский',
  'Московский',
  'Ново-Савиновский',
  'Советский',
  'Приволжский',
]

const showDistrictFilter = computed(() => {
  return localFilters.city?.toLowerCase() === 'казань'
})

watch(
  () => localFilters.city,
  (newCity) => {
    if (newCity?.toLowerCase() !== 'казань') {
      localFilters.district = ''
      selectedDistrict.value = ''
    }
  }
)

function seedFromStore() {
  const saved = headerStore.getFilters() || {}
  localFilters.looking_for_apartment = saved.looking_for_apartment === true ? true : undefined
  localFilters.city = saved.city || ''
  localFilters.district = saved.district || ''
  localFilters.age_min = typeof saved.age_min === 'number' ? saved.age_min : undefined
  localFilters.age_max = typeof saved.age_max === 'number' ? saved.age_max : undefined
  localFilters.budget_min = typeof saved.budget_min === 'number' ? saved.budget_min : undefined
  localFilters.budget_max = typeof saved.budget_max === 'number' ? saved.budget_max : undefined

  selectedCity.value = cities.find((c) => c.value === localFilters.city)
  selectedDistrict.value = localFilters.district || ''
}

onMounted(() => {
  seedFromStore()
})

async function apply() {
  const filters: any = {}

  filters.looking_for_apartment = localFilters.looking_for_apartment || false
  
  if (localFilters.city) {
    filters.city = localFilters.city
  }
  if (localFilters.district) {
    filters.district = localFilters.district
  }
  if (localFilters.age_min !== undefined && localFilters.age_min > 0) {
    filters.age_min = localFilters.age_min
  }
  if (localFilters.age_max !== undefined && localFilters.age_max > 0) {
    filters.age_max = localFilters.age_max
  }
  if (localFilters.budget_min !== undefined && localFilters.budget_min > 0) {
    filters.budget_min = localFilters.budget_min
  }
  if (localFilters.budget_max !== undefined && localFilters.budget_max > 0) {
    filters.budget_max = localFilters.budget_max
  }

  headerStore.setFilters(filters)
  emit('close')
}

function cancel() {
  emit('close')
}

function resetFilters() {
  headerStore.clearFilters()
  localFilters.looking_for_apartment = undefined
  localFilters.city = ''
  localFilters.district = ''
  localFilters.age_min = undefined
  localFilters.age_max = undefined
  localFilters.budget_min = undefined
  localFilters.budget_max = undefined
  selectedCity.value = undefined
  selectedDistrict.value = ''
  emit('close')
}
</script>
