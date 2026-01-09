/**
 * Sports Configuration
 * Sport-specific configurations for enhanced streaming experience
 */

export interface SportConfig {
    id: string;
    name: string;
    emoji: string;
    color: string;
    bgGradient: string;
    features: {
        hasLiveStats: boolean;
        hasPlayerStats: boolean;
        hasCommentary: boolean;
    };
    statsLabels: {
        primary: string;
        secondary: string;
        tertiary: string;
    };
    matchTypes: string[];
    popularLeagues: string[];
}

export const sportsConfigurations: Record<string, SportConfig> = {
    football: {
        id: 'football',
        name: 'Football',
        emoji: '⚽',
        color: 'text-green-500',
        bgGradient: 'from-green-500 to-emerald-600',
        features: {
            hasLiveStats: true,
            hasPlayerStats: true,
            hasCommentary: true,
        },
        statsLabels: {
            primary: 'Possession',
            secondary: 'Shots',
            tertiary: 'Corners',
        },
        matchTypes: ['Premier League', 'Champions League', 'World Cup', 'La Liga', 'Serie A', 'Bundesliga'],
        popularLeagues: ['EPL', 'UCL', 'FIFA WC', 'La Liga', 'Bundesliga'],
    },
    cricket: {
        id: 'cricket',
        name: 'Cricket',
        emoji: '🏏',
        color: 'text-orange-500',
        bgGradient: 'from-orange-500 to-red-600',
        features: {
            hasLiveStats: true,
            hasPlayerStats: true,
            hasCommentary: true,
        },
        statsLabels: {
            primary: 'Runs/Wickets',
            secondary: 'Overs',
            tertiary: 'Run Rate',
        },
        matchTypes: ['Test Match', 'ODI', 'T20', 'IPL', 'World Cup', 'NPL'],
        popularLeagues: ['IPL', 'BBL', 'PSL', 'CPL', 'The Hundred', 'NPL'],
    },
    basketball: {
        id: 'basketball',
        name: 'Basketball',
        emoji: '🏀',
        color: 'text-orange-600',
        bgGradient: 'from-orange-500 to-orange-600',
        features: {
            hasLiveStats: true,
            hasPlayerStats: true,
            hasCommentary: true,
        },
        statsLabels: {
            primary: 'Points',
            secondary: 'Rebounds',
            tertiary: 'Assists',
        },
        matchTypes: ['NBA Regular', 'NBA Playoffs', 'NCAA', 'EuroLeague', 'FIBA'],
        popularLeagues: ['NBA', 'NCAA', 'EuroLeague', 'WNBA', 'G League'],
    },
    tennis: {
        id: 'tennis',
        name: 'Tennis',
        emoji: '🎾',
        color: 'text-yellow-500',
        bgGradient: 'from-yellow-500 to-green-600',
        features: {
            hasLiveStats: true,
            hasPlayerStats: true,
            hasCommentary: true,
        },
        statsLabels: {
            primary: 'Sets',
            secondary: 'Games',
            tertiary: '1st Serve %',
        },
        matchTypes: ['Grand Slam', 'ATP Masters', 'WTA', 'Davis Cup', 'Olympics'],
        popularLeagues: ['Wimbledon', 'US Open', 'French Open', 'Australian Open', 'ATP Finals'],
    },
    hockey: {
        id: 'hockey',
        name: 'Hockey',
        emoji: '🏑',
        color: 'text-blue-500',
        bgGradient: 'from-blue-500 to-cyan-600',
        features: {
            hasLiveStats: true,
            hasPlayerStats: true,
            hasCommentary: true,
        },
        statsLabels: {
            primary: 'Goals',
            secondary: 'Penalty Corners',
            tertiary: 'Shots',
        },
        matchTypes: ['World Cup', 'Olympics', 'Asia Cup', 'Champions Trophy'],
        popularLeagues: ['FIH Pro League', 'Asia Cup', 'Olympics'],
    },
    rugby: {
        id: 'rugby',
        name: 'Rugby',
        emoji: '🏉',
        color: 'text-emerald-600',
        bgGradient: 'from-emerald-600 to-teal-700',
        features: {
            hasLiveStats: true,
            hasPlayerStats: true,
            hasCommentary: true,
        },
        statsLabels: {
            primary: 'Tries',
            secondary: 'Conversions',
            tertiary: 'Possession',
        },
        matchTypes: ['World Cup', 'Six Nations', 'Rugby Championship', 'Super Rugby'],
        popularLeagues: ['Six Nations', 'Rugby Championship', 'Super Rugby', 'Premiership'],
    },
};

export function getSportConfig(sportType: string): SportConfig | null {
    const normalizedType = sportType?.toLowerCase() || '';
    return sportsConfigurations[normalizedType] || null;
}

export function getSportEmoji(sportType: string): string {
    const config = getSportConfig(sportType);
    return config?.emoji || '🏆';
}

export function getSportColor(sportType: string): string {
    const config = getSportConfig(sportType);
    return config?.bgGradient || 'from-slate-500 to-slate-600';
}

export const allSportTypes = Object.keys(sportsConfigurations);
