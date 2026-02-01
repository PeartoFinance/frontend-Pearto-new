/**
 * Shared React Query hooks for media data (TV, Radio)
 */

import { useQuery } from '@tanstack/react-query';
import { get } from '@/services/api';

// Types
export interface TVChannel {
    id: number;
    name: string;
    logo?: string;
    logoUrl?: string;
    streamUrl: string;
    category: string;
    countryCode?: string;
    language?: string;
    isLive: boolean;
    viewerCount?: number;
}

export interface RadioStation {
    id: number;
    name: string;
    logo?: string;
    streamUrl: string;
    genre: string;
    country: string;
    isLive: boolean;
}

export interface TrendingTopic {
    id: number;
    title: string;
    category: string;
    rank: number;
    change?: number;
}

// Query keys
export const mediaQueryKeys = {
    tvChannels: (limit?: number, category?: string) => ['media', 'tv', limit, category] as const,
    radioStations: (limit?: number, genre?: string) => ['media', 'radio', limit, genre] as const,
    trending: (limit?: number) => ['media', 'trending', limit] as const,
};

/**
 * Hook for TV channels - cached for 2 minutes
 */
export function useTVChannels(limit = 20, category?: string) {
    return useQuery({
        queryKey: mediaQueryKeys.tvChannels(limit, category),
        queryFn: () => get<TVChannel[]>('/content/tv', { limit, ...(category && { category }) }),
        staleTime: 2 * 60 * 1000,
    });
}

/**
 * Hook for radio stations - cached for 2 minutes
 */
export function useRadioStations(limit = 20, genre?: string) {
    return useQuery({
        queryKey: mediaQueryKeys.radioStations(limit, genre),
        queryFn: () => get<RadioStation[]>('/content/radio', { limit, ...(genre && { genre }) }),
        staleTime: 2 * 60 * 1000,
    });
}

/**
 * Hook for trending topics - cached for 1 minute
 */
export function useTrendingTopics(limit = 10) {
    return useQuery({
        queryKey: mediaQueryKeys.trending(limit),
        queryFn: () => get<TrendingTopic[]>('/content/trending', { limit }),
        staleTime: 60 * 1000,
    });
}
