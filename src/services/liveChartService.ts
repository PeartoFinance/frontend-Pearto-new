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

export default {
    getLiveQuote,
    getLiveQuotes,
    getLiveIntraday,
    getMarketPulse
};
