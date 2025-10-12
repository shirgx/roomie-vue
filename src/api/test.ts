import { api } from './client'

export interface TestQuestion {
  id: string
  title: string
  type: 'single' | 'multiple' | 'scale'
  options: string[]
  category: 'personality' | 'lifestyle' | 'preferences'
}

export interface TestAnswer {
  userId: string
  questionId: string
  answers: number[]
}

export interface TestProgress {
  answered: number
  total: number
  progress: number
  testCompleted: boolean
}

export interface CompatibilityData {
  score: number
  strengths: string[]
  concerns: string[]
}

export interface TestSubmissionResult {
  testCompleted: boolean
  testScore?: number
  answersSubmitted: number
}

export async function getTestQuestions(): Promise<TestQuestion[]> {
  return api.get<TestQuestion[]>('/test/questions')
}

export async function getQuestion(questionId: string): Promise<TestQuestion> {
  return api.get<TestQuestion>(`/test/questions/${questionId}`)
}

export async function submitAnswer(questionId: string, answers: number[]): Promise<{
  questionId: string
  answers: number[]
  testCompleted: boolean
}> {
  return api.post('/test/answer', { questionId, answers })
}

export async function submitCompleteTest(answers: Array<{
  questionId: string
  answers: number[]
}>): Promise<TestSubmissionResult> {
  return api.post<TestSubmissionResult>('/test/submit', { answers })
}

export async function getUserAnswers(): Promise<{
  answers: TestAnswer[]
  testCompleted: boolean
  progress: {
    answered: number
    total: number
  }
}> {
  return api.get('/test/answers')
}

export async function getTestProgress(): Promise<TestProgress> {
  return api.get<TestProgress>('/test/progress')
}

export async function getTestScore(): Promise<{
  testScore: number | null
  testCompleted: boolean
}> {
  return api.get('/test/score')
}

export async function getCompatibilityWithUser(userId: string): Promise<CompatibilityData> {
  return api.get<CompatibilityData>(`/test/compatibility/${userId}`)
}
