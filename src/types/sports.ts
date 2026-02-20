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

/* ─── Match Detail (enriched data from API-Sports) ─── */

export interface MatchEvent {
    time: number | null;
    extra: number | null;
    team: string;
    teamId: number | null;
    player: string;
    assist: string | null;
    type: string;       // Goal, Card, subst, Var
    detail: string;     // Normal Goal, Yellow Card, Red Card, Substitution 1, etc.
    comments: string | null;
}

export interface TeamStatistics {
    team: string;
    teamId: number | null;
    logo: string | null;
    stats: Record<string, string | number | null>;
}

export interface LineupPlayer {
    id: number | null;
    name: string;
    number: number | null;
    pos: string | null;
    grid?: string | null;
}

export interface TeamLineup {
    team: string;
    teamId: number | null;
    logo: string | null;
    formation: string | null;
    coach: string | null;
    startXI: LineupPlayer[];
    substitutes: LineupPlayer[];
}

export interface PlayerStatEntry {
    id: number | null;
    name: string;
    stats: Record<string, string | number | null>;
}

export interface TeamPlayerStats {
    team: string;
    teamId: number | null;
    players: PlayerStatEntry[];
}

export interface MatchDetail {
    events: MatchEvent[];
    statistics: TeamStatistics[];
    lineups: TeamLineup[];
    periods: unknown[];
    players: TeamPlayerStats[];
    error?: string | null;
}

/* ─── Standings ─── */

export interface StandingRow {
    rank: number | null;
    team: string;
    teamId: number | null;
    logo: string | null;
    points: number | null;
    played: number | null;
    won: number | null;
    drawn: number | null;
    lost: number | null;
    goalsFor?: number | null;
    goalsAgainst?: number | null;
    goalDiff?: number | null;
    form?: string | null;
    description?: string | null;
    // NBA-specific
    winPct?: string | null;
    streak?: number | null;
    gamesBehind?: string | null;
}

export interface StandingGroup {
    name: string;
    rows: StandingRow[];
}

/* ─── Head-to-Head ─── */
// Re-uses SportsEvent[] (past matches)

/* ─── Predictions (Football only) ─── */

export interface MatchPrediction {
    winner: {
        id: number | null;
        name: string | null;
        comment: string | null;
    };
    winOrDraw: boolean | null;
    underOver: string | null;
    goals: Record<string, string | null>;
    advice: string | null;
    percent: Record<string, string | null>;
    comparison: Record<string, Record<string, string | null>>;
    teams: {
        home: PredictionTeam;
        away: PredictionTeam;
    };
}

export interface PredictionTeam {
    name: string | null;
    logo: string | null;
    lastFive: Record<string, string | number | null>;
    league: Record<string, string | number | null>;
}
