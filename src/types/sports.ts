/**
 * Sports Event Types
 * Matches API response from /api/sports/fixtures (DB-backed)
 */
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
