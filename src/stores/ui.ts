import { defineStore } from 'pinia'
import type { Component } from 'vue'

export const useHeader = defineStore('header', {
    state: () => ({
        rightKind: 'none' as 'none' | 'filters' | 'custom',
        rightComponent: null as Component | null,
        filtersOpen: false,
        filters: {} as any,
        filtersAppliedTimestamp: 0,
    }),
    getters: {
        currentFilters: (state) => state.filters,
        hasActiveFilters: (state) => Object.keys(state.filters).length > 0,
    },
    actions: {
        showFilters() { this.rightKind = 'filters' },
        toggleFilters() { this.filtersOpen = !this.filtersOpen },
        closeFilters() { this.filtersOpen = false },
        setCustomRight(c: Component) { this.rightKind = 'custom'; this.rightComponent = c },
        clearRight() { this.rightKind = 'none'; this.rightComponent = null; this.filtersOpen = false },
        setFilters(filters: any) {
            this.filters = { ...filters }
            this.filtersAppliedTimestamp = Date.now() 
        },
        getFilters() {
            return this.filters
        },
        clearFilters() {
            this.filters = {}
            this.filtersAppliedTimestamp = Date.now() 
        }
    },
})
