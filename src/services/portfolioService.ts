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
};
