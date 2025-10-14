import { defineStore } from 'pinia'
import { z } from 'zod'

export type UserType = 'with_apartment' | 'without_apartment'
export const QuizAnswer = z.object({ key: z.string(), value: z.union([z.string(), z.number(), z.boolean()]) })
export type QuizAnswer = z.infer<typeof QuizAnswer>
export type Filters = { city?: string; budgetMin?: number; budgetMax?: number; roommates?: number; type?: UserType | 'any' }
export type RoomieCard = { id: string; name: string; age: number; city: string; about: string; hasApartment: boolean; avatar?: string; budget?: number; compatibility?: number }
type Me = { id?: string; name?: string; hasApartment?: boolean } | undefined
export const useMain = defineStore('main', {
  state: () => ({ me: undefined as Me, filters: { type: 'any', budgetMin: 0, budgetMax: 2000, roommates: 1 } as Filters, quiz: [] as QuizAnswer[], queue: [] as RoomieCard[], liked: [] as RoomieCard[], passed: [] as string[], }),
  actions: {
    setFilters(f: Partial<Filters>) { this.filters = { ...this.filters, ...f } },
    setMe(m?: Me) { this.me = { ...(this.me||{} as any), ...(m||{}) } },
    setQuiz(qs: QuizAnswer[]) { this.quiz = qs },
    seedQueue(cards: RoomieCard[]) { this.queue = cards },
    likeTop() { const top = this.queue[0]; if (!top) return; this.liked.unshift(top); this.queue.shift() },
    passTop() { const top = this.queue[0]; if (!top) return; this.passed.unshift(top.id); this.queue.shift() },
  }
})
