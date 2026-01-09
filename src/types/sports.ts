/**
 * Sports Event Types
 * Matches API response from /api/media/sports-events
 */
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

// Legacy type alias for backward compatibility
export type LegacySportsEvent = {
    id: string;
    name: string;
    description: string;
    category: string;
    status: string;
    logo: string;
    embed_url?: string;
    venue?: string;
    match_type?: string;
    team_home?: string;
    team_away?: string;
    score_home?: string;
    score_away?: string;
    event_date?: string;
    result?: string;
    series?: string;
};
