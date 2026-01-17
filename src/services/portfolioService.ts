/**
 * Portfolio Service
 * Handles watchlist and portfolio API calls
 */

import { get, post, del } from './api';

// Types
export interface WatchlistItem {
    id: number;
    symbol: string;
    name: string;
    price: number;
    change: number;
    changePercent: number;
    addedAt: string;
}

export interface Watchlist {
    id: number;
    name: string;
    items: WatchlistItem[];
    createdAt: string;
}

export interface PortfolioHolding {
    id: number;
    symbol: string;
    name: string;
    shares: number;
    avgCost: number;
    currentPrice: number;
    totalValue: number;
    gain: number;
    gainPercent: number;
}

export interface Portfolio {
    id: number;
    name: string;
    holdings: PortfolioHolding[];
    totalValue: number;
    totalGain: number;
    totalGainPercent: number;
}

// API Functions

/**
 * Get user's watchlists
 */
export async function getWatchlists(): Promise<Watchlist[]> {
    return get<Watchlist[]>('/portfolio/watchlists');
}

/**
 * Get default watchlist items
 */
export async function getWatchlist(): Promise<WatchlistItem[]> {
    return get<WatchlistItem[]>('/portfolio/watchlist');
}

/**
 * Add stock to watchlist
 */
export async function addToWatchlist(symbol: string): Promise<{ message: string }> {
    return post<{ message: string }>('/portfolio/watchlist', { symbol });
}

/**
 * Remove stock from watchlist
 */
export async function removeFromWatchlist(symbol: string): Promise<{ message: string }> {
    return del<{ message: string }>(`/portfolio/watchlist/${symbol}`);
}

/**
 * Get user's portfolios
 */
export async function getPortfolios(): Promise<Portfolio[]> {
    return get<Portfolio[]>('/portfolio/list');
}

/**
 * Get portfolio by ID
 */
export async function getPortfolio(portfolioId: number): Promise<Portfolio> {
    return get<Portfolio>(`/portfolio/${portfolioId}`);
}

/**
 * Create new portfolio
 */
export async function createPortfolio(name: string): Promise<Portfolio> {
    return post<Portfolio>('/portfolio', { name });
}

/**
 * Add holding to portfolio
 */
export async function addHolding(
    portfolioId: string,
    symbol: string,
    shares: number,
    avgBuyPrice: number
): Promise<{ id: string; message: string; holding: PortfolioHolding }> {
    return post<{ id: string; message: string; holding: PortfolioHolding }>(
        `/portfolio/${portfolioId}/holdings`,
        { symbol, shares, avgBuyPrice }
    );
}

/**
 * Delete holding from portfolio
 */
export async function deleteHolding(portfolioId: string, holdingId: string): Promise<{ message: string }> {
    return del<{ message: string }>(`/portfolio/${portfolioId}/holdings/${holdingId}`);
}

// Transaction Types
export interface PortfolioTransaction {
    id: string;
    symbol: string;
    type: 'buy' | 'sell' | 'dividend' | 'split';
    shares: number;
    pricePerShare: number;
    totalAmount: number;
    fees: number;
    notes?: string;
    date: string;
    createdAt: string;
}

export interface HoldingDetail {
    holding: {
        id: string;
        symbol: string;
        shares: number;
        avgCost: number;
        currentPrice: number;
        totalValue: number;
        totalCost: number;
        totalGain: number;
        gainPercent: number;
        portfolioWeight: number;
        firstBuyDate?: string;
    };
    market: {
        name: string;
        sector?: string;
        industry?: string;
        dayChange: number;
        dayChangePercent: number;
        high52w?: number;
        low52w?: number;
        peRatio?: number;
        marketCap?: number;
    } | null;
    transactions: {
        id: string;
        type: string;
        shares: number;
        price: number;
        total: number;
        date: string;
    }[];
}

export interface WealthHistoryPoint {
    date: string;
    totalValue: number;
    totalCash: number;
    totalInvestments: number;
    dailyChange: number;
}

export interface PortfolioAnalytics {
    totalValue: number;
    totalGain: number;
    totalGainPercent: number;
    holdingsCount: number;
    allocation: {
        symbol: string;
        name: string;
        value: number;
        gain: number;
        gainPercent: number;
        shares: number;
        sector: string;
        weight: number;
    }[];
    sectorBreakdown: {
        sector: string;
        value: number;
        weight: number;
    }[];
    topPerformers: any[];
    worstPerformers: any[];
}

/**
 * Get portfolio transactions
 */
export async function getTransactions(
    portfolioId: string,
    options?: { symbol?: string; type?: string; limit?: number }
): Promise<PortfolioTransaction[]> {
    const params = new URLSearchParams();
    if (options?.symbol) params.set('symbol', options.symbol);
    if (options?.type) params.set('type', options.type);
    if (options?.limit) params.set('limit', String(options.limit));
    const query = params.toString() ? `?${params.toString()}` : '';
    return get<PortfolioTransaction[]>(`/portfolio/${portfolioId}/transactions${query}`);
}

/**
 * Add transaction to portfolio
 */
export async function addTransaction(
    portfolioId: string,
    data: {
        symbol: string;
        type: 'buy' | 'sell' | 'dividend' | 'split';
        shares: number;
        price: number;
        fees?: number;
        notes?: string;
        date?: string;
    }
): Promise<{ id: string; message: string; transaction: any }> {
    return post<{ id: string; message: string; transaction: any }>(
        `/portfolio/${portfolioId}/transactions`,
        data
    );
}

/**
 * Get holding detail with transactions
 */
export async function getHoldingDetail(portfolioId: string, holdingId: string): Promise<HoldingDetail> {
    return get<HoldingDetail>(`/portfolio/${portfolioId}/holdings/${holdingId}`);
}

/**
 * Get wealth history for net worth chart
 */
export async function getWealthHistory(days = 30): Promise<WealthHistoryPoint[]> {
    return get<WealthHistoryPoint[]>(`/portfolio/wealth-history?days=${days}`);
}

/**
 * Get portfolio analytics
 */
export async function getPortfolioAnalytics(portfolioId: string): Promise<PortfolioAnalytics> {
    return get<PortfolioAnalytics>(`/portfolio/${portfolioId}/analytics`);
}

export default {
    getWatchlists,
    getWatchlist,
    addToWatchlist,
    removeFromWatchlist,
    getPortfolios,
    getPortfolio,
    createPortfolio,
    addHolding,
    deleteHolding,
    getTransactions,
    addTransaction,
    getHoldingDetail,
    getWealthHistory,
    getPortfolioAnalytics,
};
