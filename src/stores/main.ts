import { defineStore } from 'pinia'

export interface Filters {
  city?: string
  district?: string
  budgetMin?: number
  budgetMax?: number
  type?: 'with_apartment' | 'without_apartment' | 'any'
}

export const useMain = defineStore('main', {
  state: () => ({
    filters: {
      type: 'any',
      budgetMin: 0,
      budgetMax: 2000
    } as Filters
  }),
  actions: {
    setFilters(f: Partial<Filters>) {
      this.filters = { ...this.filters, ...f }
    }
  }
})
