/**
 * Live Chart Service
 * API calls for real-time quotes and intraday data
 */

import { get } from './api';

// Types for live data
export interface LiveQuote {
    symbol: string;
    name: string;
    price: number | null;
    change: number | null;
    changePercent: number | null;
    dayHigh: number | null;
    dayLow: number | null;
    volume: number | null;
    open: number | null;
    previousClose: number | null;
    lastUpdated: string | null;
    assetType: string;
    cached: boolean;
}

export interface IntradayPoint {
    date: string;
    open: number | null;
    high: number | null;
    low: number | null;
    close: number | null;
    volume: number | null;
}

export interface IntradayResponse {
    symbol: string;
    interval: string;
    data: IntradayPoint[];
    cached: boolean;
}

export interface MarketPulse {
    gainers: MiniQuote[];
    losers: MiniQuote[];
    mostActive: MiniQuote[];
    timestamp: string;
}

export interface MiniQuote {
    symbol: string;
    name: string;
    price: number | null;
    changePercent: number | null;
}

/**
 * Get real-time quote for a single symbol
 */
export async function getLiveQuote(symbol: string): Promise<LiveQuote> {
    return get<LiveQuote>(`/live/quote/${symbol.toUpperCase()}`);
}

/**
 * Get real-time quotes for multiple symbols
 */
export async function getLiveQuotes(symbols: string[]): Promise<LiveQuote[]> {
    return get<LiveQuote[]>('/live/quotes', { symbols: symbols.join(',') });
}

/**
 * Get intraday data for live chart
 */
export async function getLiveIntraday(symbol: string): Promise<IntradayResponse> {
    return get<IntradayResponse>(`/live/intraday/${symbol.toUpperCase()}`);
}

/**
 * Get market pulse data (gainers, losers, most active)
 */
export async function getMarketPulse(): Promise<MarketPulse> {
    return get<MarketPulse>('/live/market-pulse');
}

// Search result type for live search
export interface SearchResult {
    symbol: string;
    name: string;
    price: number | null;
    change: number | null;
    changePercent: number | null;
    assetType: 'stock' | 'crypto' | 'index' | 'commodity';
    volume?: number | null;
    unit?: string | null;
}

// Dashboard data type
export interface LiveDashboardData {
    indices: SearchResult[];
    commodities: SearchResult[];
    gainers: SearchResult[];
    losers: SearchResult[];
    mostActive: SearchResult[];
    crypto: SearchResult[];
    timestamp: string;
}

/**
 * Search symbols with live prices
 * Supports stocks, crypto, indices, and commodities
 */
export async function searchLiveSymbols(
    query: string,
    type?: 'stock' | 'crypto' | 'index' | 'commodity',
    limit = 20
): Promise<SearchResult[]> {
    const params: Record<string, string> = { q: query };
    if (type) params.type = type;
    if (limit) params.limit = String(limit);
    return get<SearchResult[]>('/live/search', params);
}

/**
 * Get comprehensive live dashboard data
 * Returns indices, commodities, top movers, and crypto
 */
export async function getLiveDashboard(): Promise<LiveDashboardData> {
    return get<LiveDashboardData>('/live/dashboard');
}

export default {
    getLiveQuote,
    getLiveQuotes,
    getLiveIntraday,
    getMarketPulse,
    searchLiveSymbols,
    getLiveDashboard
};

