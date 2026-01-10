/**
 * Market Data Service
 * Handles all market-related API calls
 * Field names match backend API responses exactly
 */

import { get } from './api';

// Types matching backend MarketData.to_dict()
export interface MarketStock {
    id: number;
    symbol: string;
    name: string;
    price: number;
    change: number;
    changePercent: number;
    volume: number;
    marketCap?: number;
    peRatio?: number;
    high52w?: number;
    low52w?: number;
    sector?: string;
    industry?: string;
    exchange?: string;
    currency?: string;
    assetType?: string;
    lastUpdated?: string;
    countryCode?: string;
    // Extended fields
    open?: number;
    previousClose?: number;
    dayHigh?: number;
    dayLow?: number;
    avgVolume?: number;
    beta?: number;
    forwardPe?: number;
    trailingPe?: number;
    eps?: number;
    dividendYield?: number;
    dividendRate?: number;
    bookValue?: number;
    priceToBook?: number;
    sharesOutstanding?: number;
    floatShares?: number;
    shortRatio?: number;
    logoUrl?: string;
    website?: string;
    description?: string;
}

// Types matching backend MarketIndices.to_dict()
export interface MarketIndex {
    id: number;
    symbol: string;
    name: string;
    value: number;  // API returns 'value' not 'price'
    change: number;
    changePercent: number;
    previousClose?: number;
    dayHigh?: number;
    dayLow?: number;
    yearHigh?: number;
    yearLow?: number;
    marketStatus?: string;
    countryCode?: string;
    lastUpdated?: string;
}

// Types matching backend CommodityData.to_dict()
export interface Commodity {
    id: number;
    symbol: string;
    name: string;
    price: number;
    change: number;
    changePercent: number;
    dayHigh?: number;
    dayLow?: number;
    unit?: string;
    currency?: string;
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
    exchange?: string;
    dealType?: string;
    sharesOffered?: number;
    offerPrice?: number;
}

export interface MarketOverviewData {
    indices: MarketIndex[];
    topGainers: MarketStock[];
    topLosers: MarketStock[];
    mostActive: MarketStock[];
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
 * Get all stocks with optional filters
 */
export async function getStocks(sector?: string, limit = 50): Promise<MarketStock[]> {
    const params: Record<string, string | number> = { limit };
    if (sector) params.sector = sector;
    return get<MarketStock[]>('/market/stocks', params);
}

/**
 * Get crypto markets
 */
export async function getCryptoMarkets(limit = 100, page = 1, sortBy = 'market_cap'): Promise<MarketStock[]> {
    return get<MarketStock[]>('/market/crypto', { limit, page, sort: sortBy });
}

/**
 * Get market stats
 */
export async function getMarketStats() {
    return get<{ advancers: number; decliners: number; unchanged: number; totalVolume: number; totalCount: number }>('/market/stats');
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
    getStocks,
    getCryptoMarkets,
    getMarketStats,
    getSectorPerformance,
    getStockHistory,
};
