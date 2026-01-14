/**
 * Alerts Service
 * API calls for user price/event alerts
 */

import { get, post, put, del } from './api';

export interface Alert {
    id: string;
    symbol: string;
    alertType: 'price' | 'percent' | 'volume';
    condition: 'above' | 'below' | 'equals';
    targetValue: number;
    isActive: boolean;
    isTriggered: boolean;
    triggeredAt: string | null;
    notifyEmail: boolean;
    notifyPush: boolean;
    createdAt: string;
}

export interface CreateAlertData {
    symbol: string;
    alertType?: string;
    condition: 'above' | 'below' | 'equals';
    targetValue: number;
    notifyEmail?: boolean;
    notifyPush?: boolean;
}

/**
 * Get all user alerts
 */
export async function getAlerts(): Promise<Alert[]> {
    return get<Alert[]>('/user/alerts');
}

/**
 * Create a new alert
 */
export async function createAlert(data: CreateAlertData): Promise<{ id: string; message: string }> {
    return post<{ id: string; message: string }>('/user/alerts', data);
}

/**
 * Update an alert
 */
export async function updateAlert(alertId: string, data: Partial<Alert>): Promise<{ message: string }> {
    return put<{ message: string }>(`/user/alerts/${alertId}`, data);
}

/**
 * Delete an alert
 */
export async function deleteAlert(alertId: string): Promise<{ message: string }> {
    return del<{ message: string }>(`/user/alerts/${alertId}`);
}

/**
 * Toggle alert active status
 */
export async function toggleAlert(alertId: string): Promise<{ isActive: boolean; message: string }> {
    return post<{ isActive: boolean; message: string }>(`/user/alerts/${alertId}/toggle`);
}

export default {
    getAlerts,
    createAlert,
    updateAlert,
    deleteAlert,
    toggleAlert,
};
