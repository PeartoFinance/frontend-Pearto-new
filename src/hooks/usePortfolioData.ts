/**
 * Shared React Query hooks for portfolio data
 */

import { useQuery } from '@tanstack/react-query';
import { get } from '@/services/api';

// Types
export interface Holding {
    id: number;
    symbol: string;
    name: string;
    quantity: number;
    avgPrice: number;
    currentPrice: number;
    totalValue: number;
    profitLoss: number;
    profitLossPercent: number;
}

export interface Transaction {
    id: number;
    type: 'buy' | 'sell';
    symbol: string;
    quantity: number;
    price: number;
    total: number;
    date: string;
}

export interface PortfolioSummary {
    totalValue: number;
    totalCost: number;
    profitLoss: number;
    profitLossPercent: number;
    holdingsCount: number;
}

// Query keys
export const portfolioQueryKeys = {
    summary: () => ['portfolio', 'summary'] as const,
    holdings: () => ['portfolio', 'holdings'] as const,
    transactions: (limit?: number) => ['portfolio', 'transactions', limit] as const,
    watchlist: () => ['portfolio', 'watchlist'] as const,
};

/**
 * Hook for portfolio summary - cached for 30s
 */
export function usePortfolioSummary() {
    return useQuery({
        queryKey: portfolioQueryKeys.summary(),
        queryFn: () => get<PortfolioSummary>('/portfolio/summary'),
        staleTime: 30 * 1000,
    });
}

/**
 * Hook for holdings list - cached for 30s
 */
export function useHoldings() {
    return useQuery({
        queryKey: portfolioQueryKeys.holdings(),
        queryFn: () => get<Holding[]>('/portfolio/holdings'),
        staleTime: 30 * 1000,
    });
}

/**
 * Hook for transactions - cached for 1 minute
 */
export function useTransactions(limit = 50) {
    return useQuery({
        queryKey: portfolioQueryKeys.transactions(limit),
        queryFn: () => get<Transaction[]>('/portfolio/transactions', { limit }),
        staleTime: 60 * 1000,
    });
}

/**
 * Hook for watchlist - cached for 30s
 */
export function useWatchlist() {
    return useQuery({
        queryKey: portfolioQueryKeys.watchlist(),
        queryFn: () => get<any[]>('/portfolio/watchlist'),
        staleTime: 30 * 1000,
    });
}
