import { defineStore } from 'pinia'
import type { Component } from 'vue'

function sanitizeFilters(raw: any): any {
    const f = raw || {}
    const clean: any = {}
    if (typeof f.looking_for_apartment === 'boolean' && f.looking_for_apartment === true) clean.looking_for_apartment = true
    if (typeof f.city === 'string' && f.city) clean.city = f.city
    if (typeof f.district === 'string' && f.district) clean.district = f.district
    if (Number.isFinite(Number(f.age_min)) && Number(f.age_min) > 0) clean.age_min = Number(f.age_min)
    if (Number.isFinite(Number(f.age_max)) && Number(f.age_max) > 0) clean.age_max = Number(f.age_max)
    if (Number.isFinite(Number(f.budget_min)) && Number(f.budget_min) > 0) clean.budget_min = Number(f.budget_min)
    if (Number.isFinite(Number(f.budget_max)) && Number(f.budget_max) > 0) clean.budget_max = Number(f.budget_max)
    return clean
}

export const useHeader = defineStore('header', {
    state: () => {
        let savedFilters: any = {}
        try {
            const raw = localStorage.getItem('filters')
            if (raw) savedFilters = JSON.parse(raw)
        } catch {}
        const initial = sanitizeFilters(savedFilters)
        return {
            rightKind: 'none' as 'none' | 'filters' | 'custom',
            rightComponent: null as Component | null,
            filtersOpen: false,
            filters: initial as any,
        }
    },
    getters: {
        currentFilters: (state) => state.filters,
        hasActiveFilters: (state) => Object.keys(state.filters || {}).length > 0,
    },
    actions: {
        showFilters() { this.rightKind = 'filters' },
        toggleFilters() { this.filtersOpen = !this.filtersOpen },
        closeFilters() { this.filtersOpen = false },
        setCustomRight(c: Component) { this.rightKind = 'custom'; this.rightComponent = c },
        clearRight() { this.rightKind = 'none'; this.rightComponent = null; this.filtersOpen = false },
        setFilters(filters: any) {
            const clean = sanitizeFilters(filters)
            this.filters = clean
            try { localStorage.setItem('filters', JSON.stringify(clean)) } catch {}
            console.log('Filters set in store:', this.filters)
        },
        getFilters() {
            return this.filters
        },
        clearFilters() {
            this.filters = {}
            try { localStorage.removeItem('filters') } catch {}
            console.log('Filters cleared')
        }
    },
})
