import { api } from './client'

export interface Question {
  id: number
  title: string
  type: string
  answers: Array<{ id: number; text: string }>
}

export interface TestStatus {
  questionCount: number
  answeredCount: number
  isCompleted: boolean
}

export async function fetchQuestions(): Promise<Question[]> {
  return api.get<Question[]>('/tests/questions')
}

export async function submitAnswers(answers: Array<[number, number]>): Promise<any> {
  return api.post('/tests/submit', { answers })
}

export async function getTestStatus(): Promise<TestStatus> {
  return api.get<TestStatus>('/tests/status')
}

export async function getMyAnswers(): Promise<Record<string, number>> {
  return api.get<Record<string, number>>('/tests/my-answers')
}
