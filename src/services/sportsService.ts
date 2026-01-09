/**
 * Sports API Service
 * Centralized controller for all sports-related API requests
 */

import { get } from './api';

export interface SportsEvent {
    id: string;
    name: string;
    sportType: string;
    league: string;
    status: 'scheduled' | 'live' | 'completed';
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
}

/**
 * Fetch all sports events
 */
export async function getSportsEvents(): Promise<SportsEvent[]> {
    try {
        const events = await get<SportsEvent[]>('/media/sports-events');
        return events || [];
    } catch (error) {
        console.error('Error fetching sports events:', error);
        return [];
    }
}

/**
 * Fetch live sports events only
 */
export async function getLiveSportsEvents(): Promise<SportsEvent[]> {
    const events = await getSportsEvents();
    return events.filter(e => e.isLive || e.status === 'live');
}

/**
 * Fetch upcoming sports events
 */
export async function getUpcomingSportsEvents(): Promise<SportsEvent[]> {
    const events = await getSportsEvents();
    return events.filter(e => e.status === 'scheduled');
}

/**
 * Fetch sports events by sport type
 */
export async function getSportsEventsByType(sportType: string): Promise<SportsEvent[]> {
    const events = await getSportsEvents();
    return events.filter(e => e.sportType?.toLowerCase() === sportType.toLowerCase());
}

/**
 * Get unique sport types from events
 */
export async function getAvailableSportTypes(): Promise<string[]> {
    const events = await getSportsEvents();
    const types = new Set(events.map(e => e.sportType).filter(Boolean));
    return Array.from(types);
}

export default {
    getSportsEvents,
    getLiveSportsEvents,
    getUpcomingSportsEvents,
    getSportsEventsByType,
    getAvailableSportTypes,
};
