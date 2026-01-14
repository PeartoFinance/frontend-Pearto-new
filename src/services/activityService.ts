/**
 * Activity Service
 * API calls for user activity and login history
 */

import { get } from './api';

export interface Activity {
    id: string;
    action: string;
    entityType: string;
    entityId: string;
    details: string;
    ipAddress: string;
    createdAt: string;
}

export interface LoginEvent {
    id: string;
    eventType: string;
    ipAddress: string;
    userAgent: string;
    location: string;
    success: boolean;
    failureReason: string | null;
    createdAt: string;
}

export interface ActivitySummary {
    totalActivities: number;
    recentActivities: number;
    recentLogins: number;
    failedLogins: number;
}

/**
 * Get user activity log
 */
export async function getActivity(limit: number = 50, offset: number = 0): Promise<Activity[]> {
    return get<Activity[]>(`/activity?limit=${limit}&offset=${offset}`);
}

/**
 * Get login history
 */
export async function getLoginHistory(limit: number = 20): Promise<LoginEvent[]> {
    return get<LoginEvent[]>(`/activity/logins?limit=${limit}`);
}

/**
 * Get activity summary
 */
export async function getActivitySummary(): Promise<ActivitySummary> {
    return get<ActivitySummary>('/activity/summary');
}

export default {
    getActivity,
    getLoginHistory,
    getActivitySummary,
};
