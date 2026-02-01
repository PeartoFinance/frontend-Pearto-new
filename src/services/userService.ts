/**
 * User Profile Service
 * Handles user profile API calls
 */

import { get, put, post } from './api';

// --- Types ---

export interface UserProfile {
    id: number;
    name: string;
    email: string;
    role: string;
    avatarUrl?: string;
    phone?: string;
    countryCode?: string;
    currency?: string;
    languagePref?: string;
    emailVerified?: boolean;
    phoneVerified?: boolean;
    idVerified?: boolean;
    verifiedBadge?: boolean;
    accountStatus?: string;
    totalRewardPoints?: number;
    createdAt?: string;
    lastLoginAt?: string;
}

export interface UserPreferences {
    currency: string;
    taxResidency?: string;
    languagePref: string;
    countryCode: string;
}

export interface NotificationPreferences {
    // Email preferences
    emailSecurity: boolean;
    emailAccount: boolean;
    emailPriceAlerts: boolean;
    emailDailyDigest: boolean;
    emailEarnings: boolean;
    emailNews: boolean;
    emailMarketing: boolean;
    emailNewsletter: boolean;
    emailPortfolioSummary: boolean; // NEW: Daily P&L summary
    // Push preferences
    pushSecurity: boolean;
    pushPriceAlerts: boolean;
    pushNews: boolean;
    pushEarnings: boolean;
    // SMS preferences
    smsSecurity: boolean;
    smsPriceAlerts: boolean;
    // Quiet hours
    quietHoursEnabled: boolean;
    quietHoursStart: string | null;
    quietHoursEnd: string | null;
}

export interface Specialization {
    id: string;
    name: string;
    selected: boolean;
}

export interface Certification {
    id: string;
    name: string;
    level?: boolean;
}

export interface ProfileData {
    profile: UserProfile;
    preferences: UserPreferences;
    specializations?: Specialization[];
    certifications?: Certification[];
    hourlyRate?: number;
    // FIXED: Added | null to allow the explicit null assignments in getFullProfile
    netWorth?: number | null;
    netWorthChange?: number | null;
    netWorthChangePercent?: number | null;
    memberSince?: string;
}

// --- API Functions ---

/**
 * Get current user profile
 */
export async function getProfile(): Promise<UserProfile> {
    return get<UserProfile>('/user/profile');
}

/**
 * Update user profile
 */
export async function updateProfile(data: Partial<UserProfile>): Promise<{ success: boolean; user: UserProfile }> {
    return put<{ success: boolean; user: UserProfile }>('/user/profile', data);
}

/**
 * Get user preferences
 */
export async function getPreferences(): Promise<UserPreferences> {
    return get<UserPreferences>('/user/preferences');
}

/**
 * Update user preferences
 */
export async function updatePreferences(data: Partial<UserPreferences>): Promise<{ success: boolean; message: string }> {
    return put<{ success: boolean; message: string }>('/user/preferences', data);
}

/**
 * Get user profile with extended data
 */
export async function getFullProfile(): Promise<ProfileData> {
    try {
        const [profile, preferences, netWorthData] = await Promise.all([
            getProfile().catch((error) => {
                console.error('Failed to fetch profile:', error);
                return {
                    id: 0,
                    name: 'User',
                    email: '',
                    role: 'user',
                    createdAt: new Date().toISOString(),
                } as UserProfile;
            }),
            getPreferences().catch((error) => {
                console.error('Failed to fetch preferences:', error);
                return {
                    currency: 'USD',
                    languagePref: 'en',
                    countryCode: 'US',
                } as UserPreferences;
            }),
            getNetWorth().catch((error) => {
                console.error('Failed to fetch net worth:', error);
                return { netWorth: 0, netWorthChange: 0, netWorthChangePercent: 0 };
            }),
        ]);

        return {
            profile,
            preferences,
            specializations: [
                { id: '1', name: 'Equities', selected: false },
                { id: '2', name: 'ETFs', selected: false },
                { id: '3', name: 'Options', selected: false },
                { id: '4', name: 'Crypto', selected: true },
                { id: '5', name: 'Commodities', selected: false },
                { id: '6', name: 'Macro', selected: false },
                { id: '7', name: 'FX', selected: false }
            ],
            certifications: [
                { id: '1', name: 'CFA Level I', level: true },
                { id: '2', name: 'CMT', level: false },
                { id: '3', name: 'Risk Mgmt', level: false },
                { id: '4', name: 'Derivatives', level: false }
            ],
            hourlyRate: 45,
            netWorth: netWorthData.netWorth,
            netWorthChange: netWorthData.netWorthChange,
            netWorthChangePercent: netWorthData.netWorthChangePercent,
            memberSince: profile.createdAt || new Date().toISOString(),
        };
    } catch (error) {
        console.error('Error in getFullProfile:', error);
        throw error;
    }
}

/**
 * Get user net worth data
 */
export async function getNetWorth(): Promise<{ netWorth: number; netWorthChange: number; netWorthChangePercent: number }> {
    return get<{ netWorth: number; netWorthChange: number; netWorthChangePercent: number }>('/user/net-worth');
}

/**
 * Change user password
 */
export async function changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    return post<{ success: boolean; message: string }>('/user/change-password', {
        currentPassword,
        newPassword,
    });
}

/**
 * Get notification preferences
 */
export async function getNotificationPreferences(): Promise<NotificationPreferences> {
    return get<NotificationPreferences>('/user/notification-preferences');
}

/**
 * Update notification preferences
 */
export async function updateNotificationPreferences(
    data: Partial<NotificationPreferences>
): Promise<{ success: boolean; message: string; preferences: NotificationPreferences }> {
    return put<{ success: boolean; message: string; preferences: NotificationPreferences }>(
        '/user/notification-preferences',
        data
    );
}

// --- News Preferences ---

export interface NewsPreferences {
    id?: number;
    userId?: number;
    companies: string[];
    categories: string[];
    newsType: 'company' | 'independent';
    createdAt?: string;
    updatedAt?: string;
}

/**
 * Get user news preferences
 */
export async function getNewsPreferences(): Promise<NewsPreferences> {
    return get<NewsPreferences>('/user/news-preferences');
}

/**
 * Create user news preferences
 */
export async function createNewsPreferences(data: Partial<NewsPreferences>): Promise<NewsPreferences> {
    return post<NewsPreferences>('/user/news-preferences', data);
}

/**
 * Update user news preferences
 */
export async function updateNewsPreferences(data: Partial<NewsPreferences>): Promise<NewsPreferences> {
    return put<NewsPreferences>('/user/news-preferences', data);
}

export default {
    getProfile,
    updateProfile,
    getPreferences,
    updatePreferences,
    changePassword,
    getFullProfile,
    getNotificationPreferences,
    updateNotificationPreferences,
    getNewsPreferences,
    createNewsPreferences,
    updateNewsPreferences,
};