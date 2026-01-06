/**
 * Market Data Service
 * Handles all market-related API calls
 */

import { get } from './api';

// Types
export interface MarketStock {
    id: number;
    symbol: string;
    name: string;
    price: number;
    change: number;
    changePercent: number;
    volume: number;
    marketCap?: number;
    high52w?: number;
    low52w?: number;
    sector?: string;
    exchange?: string;
}

export interface MarketIndex {
    id: number;
    symbol: string;
    name: string;
    value: number;
    change: number;
    changePercent: number;
    region?: string;
    icon?: string;
}

export interface Commodity {
    id: number;
    symbol: string;
    name: string;
    price: number;
    change: number;
    changePercent: number;
    unit: string;
    currency: string;
}

export interface StockOffer {
    id: string;
    symbol: string;
    companyName: string;
    offerType: 'ipo' | 'fpo' | 'rights';
    priceRange: string;
    openDate: string;
    closeDate: string;
    listingDate?: string;
    status: 'upcoming' | 'open' | 'closed' | 'listed';
}

export interface MarketOverviewData {
    indices: MarketIndex[];
    topGainers: MarketStock[];
    topLosers: MarketStock[];
    mostActive: MarketStock[];
    totalTurnover?: number;
    totalVolume?: number;
    advancers?: number;
    decliners?: number;
    unchanged?: number;
}

// API Functions

/**
 * Get market overview data
 */
export async function getMarketOverview(): Promise<MarketOverviewData> {
    return get<MarketOverviewData>('/market/overview');
}

/**
 * Get market indices
 */
export async function getMarketIndices(): Promise<MarketIndex[]> {
    return get<MarketIndex[]>('/market/indices');
}

/**
 * Get top movers (gainers/losers)
 */
export async function getTopMovers(type: 'gainers' | 'losers' | 'both' = 'both', limit = 10) {
    return get<{ gainers?: MarketStock[]; losers?: MarketStock[] }>('/stocks/movers', { type, limit });
}

/**
 * Get most active stocks
 */
export async function getMostActive(limit = 10): Promise<MarketStock[]> {
    return get<MarketStock[]>('/stocks/most-active', { limit });
}

/**
 * Get stock quotes
 */
export async function getQuotes(symbols: string[]): Promise<MarketStock[]> {
    return get<MarketStock[]>('/stocks/quotes', { symbols: symbols.join(',') });
}

/**
 * Search stocks
 */
export async function searchStocks(query: string, limit = 10): Promise<MarketStock[]> {
    return get<MarketStock[]>('/stocks/search', { q: query, limit });
}

/**
 * Get commodities data
 */
export async function getCommodities(): Promise<Commodity[]> {
    return get<Commodity[]>('/market/commodities');
}

/**
 * Get stock offers (IPO, FPO)
 */
export async function getStockOffers(status?: 'upcoming' | 'open' | 'closed'): Promise<StockOffer[]> {
    return get<StockOffer[]>('/market/offers', status ? { status } : {});
}

/**
 * Get sector performance
 */
export async function getSectorPerformance() {
    return get<{ sector: string; change: number; ytdChange: number }[]>('/stocks/sectors');
}

/**
 * Get stock history
 */
export async function getStockHistory(symbol: string, range = '1m', interval = '1d') {
    return get<{ symbol: string; range: string; data: unknown[] }>(`/stocks/history/${symbol}`, { range, interval });
}

export default {
    getMarketOverview,
    getMarketIndices,
    getTopMovers,
    getMostActive,
    getQuotes,
    searchStocks,
    getCommodities,
    getStockOffers,
    getSectorPerformance,
    getStockHistory,
};
