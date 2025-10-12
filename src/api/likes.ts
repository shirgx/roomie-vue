import { api } from './client'

export async function sendLike(userId: number, isLike: boolean): Promise<void> {
  return api.post('/likes/', { to_user_id: userId, is_like: isLike })
}

export async function getMatches(): Promise<any[]> {
  return api.get('/likes/matches')
}

export async function getSentLikes(): Promise<any[]> {
  return api.get('/likes/sent')
}

export async function getReceivedLikes(): Promise<any[]> {
  return api.get('/likes/received')
}
