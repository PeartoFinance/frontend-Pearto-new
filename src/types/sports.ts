/**
 * Sports Event Types
 */
export interface SportsEvent {
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
}
