import { ref, onMounted } from 'vue'

export type Theme = 'light' | 'dark'
const theme = ref<Theme>('light')

function apply(mode: Theme) {
    theme.value = mode
    const root = document.documentElement
    root.classList.toggle('dark', mode === 'dark')
    try { localStorage.setItem('theme', mode) } catch {}
}

function init() {
    let saved: Theme | null = null
    try { saved = (localStorage.getItem('theme') as Theme | null) } catch {}
    const tgMode = (window as any)?.Telegram?.WebApp?.colorScheme as Theme | undefined
    const systemDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches

    apply(saved ?? (tgMode ?? (systemDark ? 'dark' : 'light')))
}

export function useTheme() {
    onMounted(init)
    const toggle = () => apply(theme.value === 'dark' ? 'light' : 'dark')
    const set = (mode: Theme) => apply(mode)
    return { theme, toggle, set }
}
