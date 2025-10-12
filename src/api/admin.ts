import { api } from "./client";
import { UserProfile, UserStats } from "./user";

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
        // Since we're using mock data, admin access is determined by development mode
        if (import.meta.env.DEV) {
            return true;
        }
        
        // In production, you could check against specific admin user IDs
        const user = await api.get('/users/me');
        return user.telegramId === 999999999; // Mock admin ID
    } catch {
        return false;
    }
}

export async function getAllUsers(): Promise<UserProfile[]> {
    // Since we don't have admin endpoints in the new backend, 
    // we'll use search without filters to get all users
    return api.get<UserProfile[]>('/users/search');
}

export async function getAdminStats(): Promise<AdminStats> {
    // Mock admin stats for now since we don't have admin endpoints
    const users = await getAllUsers();
    
    const stats: AdminStats = {
        totalUsers: users.length,
        activeUsers: users.filter(u => new Date(u.updatedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length,
        testCompletedUsers: users.filter(u => u.testCompleted).length,
        totalLikes: users.reduce((sum, u) => sum + (u.stats?.totalLikes || 0), 0),
        totalMatches: users.reduce((sum, u) => sum + (u.stats?.totalMatches || 0), 0) / 2, // Divide by 2 since matches are counted for both users
        averageAge: users.filter(u => u.age).reduce((sum, u) => sum + (u.age || 0), 0) / users.filter(u => u.age).length || 0,
        topCities: Object.entries(
            users.filter(u => u.city).reduce((acc: Record<string, number>, u) => {
                acc[u.city!] = (acc[u.city!] || 0) + 1;
                return acc;
            }, {})
        )
        .map(([city, count]) => ({ city, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
    };
    
    return stats;
}
