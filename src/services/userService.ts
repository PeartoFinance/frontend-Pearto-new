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
    level?: boolean;
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
            netWorth: null,
            netWorthChange: null,
            netWorthChangePercent: null,
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
