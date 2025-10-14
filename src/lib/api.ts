import type { RoomieCard, Filters } from '@/stores/main'
const BASE = (import.meta as any)?.env?.VITE_API_URL || ''
async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const initData = getInitDataString()
  const res = await fetch(BASE + url, { ...init, headers: { 'Content-Type': 'application/json', 'X-Telegram-Init-Data': initData || '', ...(init?.headers||{}) } })
  if (!res.ok) throw new Error(`API ${res.status}`)
  return res.json() as Promise<T>
}
export const api = {
  me: () => request('/api/me'),
  feed: (filters: Filters) => request<RoomieCard[]>('/api/feed', { method: 'POST', body: JSON.stringify(filters) }),
  saveQuiz: (answers: any) => request('/api/quiz', { method: 'POST', body: JSON.stringify(answers) }),
  like: (id: string) => request('/api/like', { method: 'POST', body: JSON.stringify({ id }) }),
  pass: (id: string) => request('/api/pass', { method: 'POST', body: JSON.stringify({ id }) }),
  health: () => request('/api/health'),
}
