/**
 * User Profile Service
 * Handles user profile API calls
 */

import { get, put, post } from './api';

// Types
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

export interface Specialization {
    id: string;
    name: string;
    selected: boolean;
}

export interface Certification {
    id: string;
    name: string;
    level?: string;
}

export interface ProfileData {
    profile: UserProfile;
    preferences: UserPreferences;
    specializations?: Specialization[];
    certifications?: Certification[];
    hourlyRate?: number;
    netWorth?: number;
    netWorthChange?: number;
    netWorthChangePercent?: number;
    memberSince?: string;
}

// API Functions

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
 * Get user profile with extended data (including specializations, certifications, etc.)
 * This combines multiple API calls for convenience
 */
export async function getFullProfile(): Promise<ProfileData> {
    try {
        const [profile, preferences] = await Promise.all([
            getProfile().catch((error) => {
                console.error('Failed to fetch profile:', error);
                // Return fallback profile data
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
                // Return default preferences
                return {
                    currency: 'USD',
                    languagePref: 'en',
                    countryCode: 'US',
                } as UserPreferences;
            }),
        ]);

        // For now, return mock data for fields not yet in backend
        // These can be added to backend later
        return {
            profile,
            preferences,
            specializations: [
                { id: 'equities', name: 'Equities', selected: true },
                { id: 'etfs', name: 'ETFs', selected: true },
                { id: 'options', name: 'Options', selected: true },
                { id: 'crypto', name: 'Crypto', selected: true },
                { id: 'commodities', name: 'Commodities', selected: false },
                { id: 'macro', name: 'Macro', selected: false },
                { id: 'fx', name: 'FX', selected: false },
            ],
            certifications: [
                { id: 'cfa1', name: 'CFA Level I', level: 'Level I' },
                { id: 'cmt', name: 'CMT' },
                { id: 'risk', name: 'Risk Mgmt.' },
                { id: 'derivatives', name: 'Derivatives' },
            ],
            hourlyRate: 45,
            netWorth: 125450,
            netWorthChange: 12545,
            netWorthChangePercent: 12.5,
            memberSince: profile.createdAt || new Date().toISOString(),
        };
    } catch (error) {
        console.error('Error in getFullProfile:', error);
        throw error;
    }
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

export default {
    getProfile,
    updateProfile,
    getPreferences,
    updatePreferences,
    changePassword,
    getFullProfile,
};
