export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export function getInitData(): string | null {
    const isInTelegram = typeof window !== 'undefined' && (window as any).Telegram?.WebApp
    
    if (isInTelegram) {
        try {
            const tg = (window as any).Telegram.WebApp
            if (tg.initData) {
                console.log('Found Telegram initData using WebApp API')
                console.log('InitData length:', tg.initData.length)
                return tg.initData
            } else {
                console.log('Telegram WebApp available but initData is empty')
                return null 
            }
        } catch (error) {
            console.log('Failed to get init data from Telegram WebApp:', error)
            return null 
        }
    }
    
    if (typeof window !== 'undefined' && 
        (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') &&
        !isInTelegram) {
        console.log('Creating mock user for local development')
        
        const mockUser = {
            id: 999999,
            first_name: 'Test',
            last_name: 'User',
            username: 'testuser'
        }
        
        const mockData = {
            user: JSON.stringify(mockUser),
            auth_date: String(Math.floor(Date.now() / 1000)),
            hash: 'mock_hash_for_development'
        }
        
        return new URLSearchParams(mockData).toString()
    }
    
    console.log('No initData available and not in development mode')
    return null
}

export async function uploadFile(endpoint: string, file: File): Promise<any> {
    const formData = new FormData()
    formData.append('avatar', file)

    const headers = new Headers()
    const initData = getInitData()
    if (initData) {
        headers.set('Authorization', `tma ${initData}`)
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers,
        body: formData
    })

    if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Upload failed: ${errorText}`)
    }

    return response.json()
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const headers = new Headers(init.headers || {});
    headers.set("Content-Type", "application/json");
    
    const initData = getInitData()
    if (initData) {
        headers.set("Authorization", `tma ${initData}`)
    }

    const res = await fetch(`${API_URL}${path}`, { ...init, headers });
    if (!res.ok) {
        const msg = await res.text();
        throw new Error(`${res.status} ${msg}`);
    }
    return res.json();
}

export const api = {
    get: <T>(path: string) => request<T>(path),
    post: <T>(path: string, body?: unknown) =>
        request<T>(path, { method: "POST", body: JSON.stringify(body ?? {}) }),
    put: <T>(path: string, body?: unknown) =>
        request<T>(path, { method: "PUT", body: JSON.stringify(body ?? {}) }),
    patch: <T>(path: string, body?: unknown) =>
        request<T>(path, { method: "PATCH", body: JSON.stringify(body ?? {}) }),
    delete: <T>(path: string) =>
        request<T>(path, { method: "DELETE" }),
};
