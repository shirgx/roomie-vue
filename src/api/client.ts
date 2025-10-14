export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const tgId = localStorage.getItem("tg_id");
    const headers = new Headers(init.headers || {});
    headers.set("Content-Type", "application/json");
    if (tgId) headers.set("X-User-TgId", tgId);

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
