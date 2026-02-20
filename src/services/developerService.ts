import api from './api';

export interface ApiKey {
    id: number;
    name: string;
    keyPrefix: string;
    isActive: boolean;
    expiresAt: string | null;
    createdAt: string;
    lastUsedAt: string | null;
    rawKey?: string; // Only returned on creation
}



export interface ApiUsage {
    totalRequests: number;
    todayRequests: number;
    dailyLimit: number;
    endpoints: Record<string, number>;
}

export const developerService = {
    /**
     * Fetch all API keys for the current user
     */
    getKeys: (): Promise<ApiKey[]> => {
        return api.get<ApiKey[]>('/developer/keys');
    },

    /**
     * Generate a new API key
     */
    generateKey: (name: string): Promise<ApiKey> => {
        return api.post<ApiKey>('/developer/keys', { name });
    },

    /**
     * Revoke (deactivate) an API key
     */
    revokeKey: (id: number): Promise<{ success: boolean; message: string }> => {
        return api.del<{ success: boolean; message: string }>(`/developer/keys/${id}`);
    },

    /**
     * Get API usage statistics for the user
     */
    getUsage: (): Promise<ApiUsage> => {
        return api.get<ApiUsage>('/developer/usage');
    }
};
