import { api } from "./client";

export type AdminUser = {
    id: number;
    tg_id: number;
    username?: string;
    full_name?: string;
    local_photo_path?: string;
    photo_url?: string;
    has_apartment?: boolean;
    city?: string;
    age?: number;
    gender?: string;
    budget_min?: number;
    budget_max?: number;
    bio?: string;
    created_at: string;
    testCompleted: boolean;
};

export type AdminStats = {
    totalUsers: number;
    activeUsers: number;
    testCompletedUsers: number;
    totalLikes: number;
    totalMatches: number;
    averageAge: number;
    topCities: Array<{ city: string; count: number }>;
};

export async function checkAdminAccess(): Promise<boolean> {
    try {
        await api.get('/admin/stats')
        return true
    } catch (error) {
        return false
    }
}

export async function getAdminStats(): Promise<any> {
    return api.get('/admin/stats')
}

export async function deleteUser(userId: number): Promise<void> {
    return api.delete(`/admin/users/${userId}`)
}

export async function resetUserTest(userId: number): Promise<void> {
    return api.delete(`/admin/users/${userId}/test`)
}

export async function resetToMockUsers(): Promise<any> {
    return api.post('/admin/reset-mocks')
}
