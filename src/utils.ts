export function cn(...inputs: any[]): string {
    const out: string[] = []

    const walk = (v: any): void => {
        if (!v) return
        if (typeof v === 'string') { out.push(v); return }
        if (Array.isArray(v)) { v.forEach(walk); return }
        if (typeof v === 'object') {
            for (const [k, val] of Object.entries(v)) if (val) out.push(k)
        }
    }

    inputs.forEach(walk)
    return out.join(' ')
}
