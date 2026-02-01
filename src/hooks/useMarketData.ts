/**
 * Shared React Query hooks for data fetching with built-in caching
 * Use these hooks across pages to avoid redundant API calls
 */

import { useQuery } from '@tanstack/react-query';
import {
    getMarketIndices,
    getCommodities,
    getMarketOverview,
    getTopMovers,
    getCryptoMarkets,
    MarketIndex,
    Commodity,
    MarketOverviewData,
    MarketStock
} from '@/services/marketService';

// Query keys for consistent cache management
export const queryKeys = {
    marketIndices: ['market', 'indices'] as const,
    commodities: ['market', 'commodities'] as const,
    marketOverview: ['market', 'overview'] as const,
    topMovers: (type: string) => ['market', 'movers', type] as const,
    crypto: (limit: number) => ['market', 'crypto', limit] as const,
};

/**
 * Hook for market indices with 30s cache
 */
export function useMarketIndices() {
    return useQuery({
        queryKey: queryKeys.marketIndices,
        queryFn: getMarketIndices,
        staleTime: 30 * 1000, // 30 seconds
    });
}

/**
 * Hook for commodities with 60s cache
 */
export function useCommodities() {
    return useQuery({
        queryKey: queryKeys.commodities,
        queryFn: getCommodities,
        staleTime: 60 * 1000, // 60 seconds
    });
}

/**
 * Hook for market overview (indices, gainers, losers, most active)
 */
export function useMarketOverview() {
    return useQuery({
        queryKey: queryKeys.marketOverview,
        queryFn: getMarketOverview,
        staleTime: 30 * 1000,
    });
}

/**
 * Hook for top movers (gainers/losers)
 */
export function useTopMovers(type: 'gainers' | 'losers' | 'both' = 'both', limit = 10) {
    return useQuery({
        queryKey: queryKeys.topMovers(type),
        queryFn: () => getTopMovers(type, limit),
        staleTime: 30 * 1000,
    });
}

/**
 * Hook for crypto markets
 */
export function useCryptoMarkets(limit = 50) {
    return useQuery({
        queryKey: queryKeys.crypto(limit),
        queryFn: () => getCryptoMarkets(limit),
        staleTime: 30 * 1000,
    });
}

// Re-export types for convenience
export type { MarketIndex, Commodity, MarketOverviewData, MarketStock } from '@/services/marketService';
