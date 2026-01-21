/**
 * Navigation Service
 * Fetches dynamic navigation items from the API
 */
import api from './api';

export interface NavigationItem {
    id: number;
    label: string;
    url: string;
    icon: string;
    parent_id: number | null;
    section: string;
    link_type: string;
    badge_text: string | null;
    css_class: string | null;
    order_index: number;
    is_active: boolean;
    requires_auth: boolean;
    roles_allowed: string[] | null;
    country_code: string | null;
}

export interface NavigationResponse {
    navigation: Record<string, NavigationItem[]>;
    items: NavigationItem[];
}

// Cache to avoid repeated fetches
let navigationCache: NavigationResponse | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 60000; // 1 minute cache

/**
 * Fetch all navigation items from API
 */
export async function fetchNavigation(): Promise<NavigationResponse> {
    const now = Date.now();

    // Return cached if still valid
    if (navigationCache && (now - lastFetchTime) < CACHE_DURATION) {
        return navigationCache;
    }

    try {
        const response = await api.get<NavigationResponse>('/navigation');
        navigationCache = response;
        lastFetchTime = now;
        return response;
    } catch (error) {
        console.error('Failed to fetch navigation:', error);
        // Return empty structure on error
        return { navigation: {}, items: [] };
    }
}

/**
 * Get items for a specific section
 */
export function getSection(navigation: NavigationResponse, section: string): NavigationItem[] {
    return navigation.navigation[section] || [];
}

/**
 * Clear navigation cache (call when admin updates navigation)
 */
export function clearNavigationCache(): void {
    navigationCache = null;
    lastFetchTime = 0;
}

export default {
    fetchNavigation,
    getSection,
    clearNavigationCache,
};
