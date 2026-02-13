/**
 * Sports API Service
 * Centralized controller for all sports-related API requests
 * Fetches from our DB-backed endpoints (not direct external API)
 */

import { get, post, put, del } from './api';

export interface SportsEvent {
    id: number;
    externalId?: string;
    name: string;
    sportType: string;
    league: string;
    status: 'scheduled' | 'live' | 'completed' | 'postponed';
    venue: string;
    teamHome: string;
    teamAway: string;
    scoreHome: string | null;
    scoreAway: string | null;
    eventDate: string;
    streamUrl: string | null;
    thumbnailUrl: string | null;
    countryCode: string;
    isLive: boolean;
    updatedAt?: string;
}

export interface FavoriteSport {
    id: number;
    userId: number;
    eventId: number;
    notifyEmail: boolean;
    notifyPush: boolean;
    createdAt: string;
    event: SportsEvent | null;
}

interface APIResponse<T> {
    success: boolean;
    count: number;
    data: T;
}

/**
 * Fetch all sports events for a given date (from our DB)
 */
export async function getSportsEvents(date?: string): Promise<SportsEvent[]> {
    try {
        const queryParams = new URLSearchParams({ status: 'all' });
        if (date) queryParams.append('date', date);

        const response = await get<APIResponse<SportsEvent[]>>(`sports/fixtures?${queryParams.toString()}`);
        return response.data || [];
    } catch (error) {
        console.error('Error fetching sports events:', error);
        return [];
    }
}

/**
 * Fetch live sports events only
 */
export async function getLiveSportsEvents(): Promise<SportsEvent[]> {
    try {
        const response = await get<APIResponse<SportsEvent[]>>('sports/fixtures?status=live');
        return response.data || [];
    } catch (error) {
        console.error('Error fetching live sports events:', error);
        return [];
    }
}

/**
 * Fetch upcoming sports events
 */
export async function getUpcomingSportsEvents(): Promise<SportsEvent[]> {
    try {
        const response = await get<APIResponse<SportsEvent[]>>('sports/fixtures?status=upcoming');
        return response.data || [];
    } catch (error) {
        console.error('Error fetching upcoming sports events:', error);
        return [];
    }
}

/**
 * Fetch a single event by ID (with real-time refresh for live games)
 */
export async function getSportsEventById(eventId: number): Promise<SportsEvent | null> {
    try {
        const response = await get<{ success: boolean; data: SportsEvent }>(`sports/events/${eventId}`);
        return response.data || null;
    } catch (error) {
        console.error('Error fetching sports event detail:', error);
        return null;
    }
}

/**
 * Batch-refresh multiple events by IDs (live events get fresh API data)
 */
export async function batchRefreshEvents(ids: number[]): Promise<SportsEvent[]> {
    try {
        const response = await post<{ success: boolean; data: SportsEvent[] }>('sports/events/batch-refresh', { ids });
        return response.data || [];
    } catch (error) {
        console.error('Error batch-refreshing sports events:', error);
        return [];
    }
}

/**
 * Fetch sports events by sport type
 */
export async function getSportsEventsByType(sportType: string, date?: string): Promise<SportsEvent[]> {
    try {
        const queryParams = new URLSearchParams({ status: 'all', sport: sportType });
        if (date) queryParams.append('date', date);

        const response = await get<APIResponse<SportsEvent[]>>(`sports/fixtures?${queryParams.toString()}`);
        return response.data || [];
    } catch (error) {
        console.error('Error fetching sports events by type:', error);
        return [];
    }
}

/**
 * Fetch active sports categories
 */
export async function getSportsCategories(): Promise<{ id: number, name: string, key: string, isActive: boolean, icon: string }[]> {
    try {
        const response = await get<APIResponse<{ id: number, name: string, key: string, isActive: boolean, icon: string }[]>>('sports/categories');
        return response.data || [];
    } catch (error) {
        console.error('Error fetching sports categories:', error);
        return [];
    }
}

// ─── Favorites / Pins ───

/**
 * Get user's favorite/pinned sports events
 */
export async function getFavoriteSports(): Promise<FavoriteSport[]> {
    try {
        const response = await get<APIResponse<FavoriteSport[]>>('sports/favorites');
        return response.data || [];
    } catch (error) {
        console.error('Error fetching favorite sports:', error);
        return [];
    }
}

/**
 * Get just the event IDs of user's favorites (lightweight)
 */
export async function getFavoriteIds(): Promise<number[]> {
    try {
        const response = await get<{ success: boolean; data: number[] }>('sports/favorites/ids');
        return response.data || [];
    } catch (error) {
        console.error('Error fetching favorite IDs:', error);
        return [];
    }
}

/**
 * Add a sports event to favorites/pin
 */
export async function addFavoriteSport(eventId: number): Promise<FavoriteSport | null> {
    try {
        const response = await post<{ success: boolean; data: FavoriteSport }>('sports/favorites', { eventId });
        return response.data || null;
    } catch (error) {
        console.error('Error adding favorite sport:', error);
        return null;
    }
}

/**
 * Remove a sports event from favorites
 */
export async function removeFavoriteSport(eventId: number): Promise<boolean> {
    try {
        await del<{ success: boolean }>(`sports/favorites/${eventId}`);
        return true;
    } catch (error) {
        console.error('Error removing favorite sport:', error);
        return false;
    }
}

/**
 * Update notification preferences for a favorited event
 */
export async function updateFavoriteNotifications(eventId: number, prefs: { notifyEmail?: boolean; notifyPush?: boolean }): Promise<boolean> {
    try {
        await put<{ success: boolean }>(`sports/favorites/${eventId}/notifications`, prefs);
        return true;
    } catch (error) {
        console.error('Error updating favorite notifications:', error);
        return false;
    }
}

export default {
    getSportsEvents,
    getLiveSportsEvents,
    getUpcomingSportsEvents,
    getSportsEventById,
    getSportsEventsByType,
    getSportsCategories,
    getFavoriteSports,
    getFavoriteIds,
    addFavoriteSport,
    removeFavoriteSport,
    updateFavoriteNotifications,
};
