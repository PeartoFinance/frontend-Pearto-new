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
    turnover?: number;  // Volume * Price
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
 * Sector analysis data for market visualization
 */
export interface SectorAnalysisData {
    sector: string;
    turnover: number;
    turnoverPercent: number;
    volume: number;
    volumePercent: number;
    transactions: number;
    transactionsPercent: number;
    avgChangePercent: number;
    advancers: number;
    decliners: number;
    unchanged: number;
}

export interface SectorAnalysisResponse {
    sectors: SectorAnalysisData[];
    totals: {
        turnover: number;
        volume: number;
        transactions: number;
        sectorCount: number;
    };
}

/**
 * Get comprehensive sector analysis for pie charts and bar charts
 */
export async function getSectorAnalysis(): Promise<SectorAnalysisResponse> {
    return get<SectorAnalysisResponse>('/market/sector-analysis');
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
export interface PriceHistoryPoint {
    date: string;
    open: number | null;
    high: number | null;
    low: number | null;
    close: number | null;
    volume: number | null;
}

export interface StockHistoryResponse {
    symbol: string;
    period: string;
    interval: string;
    data: PriceHistoryPoint[];
}

export async function getStockHistory(symbol: string, period = '1mo', interval = '1d'): Promise<StockHistoryResponse> {
    return get<StockHistoryResponse>(`/stocks/history/${symbol}`, { period, interval });
}

/**
 * Get stock profile (detailed info)
 */
export async function getStockProfile(symbol: string): Promise<MarketStock & { marketIssues?: MarketIssue[]; news?: NewsArticle[] }> {
    return get<MarketStock & { marketIssues?: MarketIssue[]; news?: NewsArticle[] }>(`/stocks/profile/${symbol}`);
}

// ============================================================================
// BUSINESS PROFILE TYPES & API (for tabbed stock detail page)
// ============================================================================

/**
 * Company financial statement record (from /stocks/financials/:symbol)
 */
export interface CompanyFinancial {
    id: number;
    symbol: string;
    period: 'annual' | 'quarterly';
    fiscalDateEnding: string;
    revenue: number | null;
    totalRevenue?: number | null;  // Alias for revenue
    netIncome: number | null;
    grossProfit: number | null;
    operatingIncome?: number | null;
    ebitda: number | null;
    totalAssets: number | null;
    totalLiabilities: number | null;
    totalEquity?: number | null;
    shareholderEquity?: number | null;  // Alias for totalEquity
    operatingCashFlow?: number | null;
    freeCashFlow?: number | null;
    epsActual: number | null;
    currency: string;
    // Allow dynamic access for comparison tables
    [key: string]: string | number | null | undefined;
}

/**
 * Analyst forecast and price targets (from /stocks/forecast/:symbol)
 * Enhanced with earnings estimates and recommendation trends
 */
export interface EarningsEstimate {
    fiscalYear: string;
    periodType: string;
    revenueEstimate?: number | null;
    revenueLow?: number | null;
    revenueHigh?: number | null;
    revenueAvg?: number | null;
    revenueGrowth?: number | null;
    numRevenueAnalysts?: number | null;
    epsEstimate?: number | null;
    epsLow?: number | null;
    epsHigh?: number | null;
    epsAvg?: number | null;
    epsGrowth?: number | null;
    numEpsAnalysts?: number | null;
}

export interface RecommendationTrend {
    periodLabel: string;
    periodDate: string;
    strongBuy: number;
    buy: number;
    hold: number;
    sell: number;
    strongSell: number;
}

export interface DetailedForecast {
    priceTarget: {
        low: number | null;
        mean: number | null;
        high: number | null;
        current: number | null;
        upside: number | null;
    };
    analystConsensus: {
        consensus: string;
        strongBuy: number;
        buy: number;
        hold: number;
        sell: number;
        strongSell: number;
        total: number;
    };
    earningsEstimates: {
        annual: EarningsEstimate[];
        quarterly: EarningsEstimate[];
    };
    recommendationTrends: RecommendationTrend[];
}

// Legacy interface for backward compatibility
export interface AnalystForecast {
    symbol: string;
    targetHigh: number | null;
    targetLow: number | null;
    targetMean: number | null;
    targetMedian: number | null;
    currentPrice: number | null;
    strongBuy: number;
    buy: number;
    hold: number;
    sell: number;
    strongSell: number;
    recommendations?: {
        firm: string;
        toGrade: string;
        fromGrade?: string;
        action: string;
        date: string;
    }[];
}

/**
 * Dividend record (from /stocks/dividends/:symbol)
 */
export interface DividendRecord {
    id: number;
    symbol: string;
    companyName: string;
    dividendType: 'cash' | 'bonus' | 'both';
    cashPercent: number;
    bonusPercent: number;
    totalPercent: number;
    dividendAmount: number | null;
    exDividendDate: string | null;
    recordDate: string | null;
    paymentDate: string | null;
    fiscalYear: string;
    status: 'proposed' | 'approved' | 'paid';
}

/**
 * Market issue/alert (from profile response)
 */
export interface MarketIssue {
    id: number;
    symbol: string;
    title: string;
    description: string;
    severity: 'info' | 'warning' | 'critical';
    issueDate: string;
    isActive: boolean;
}

/**
 * News article (simplified for stock profile)
 */
export interface NewsArticle {
    id: string | number;
    title: string;
    summary?: string;
    link?: string;
    url?: string;
    image?: string;
    source?: string;
    publishedAt?: string;
    slug?: string;
}

/**
 * Get company financials (for Financials tab)
 */
export async function getStockFinancials(symbol: string, period: 'annual' | 'quarterly' = 'annual'): Promise<CompanyFinancial[]> {
    return get<CompanyFinancial[]>(`/stocks/financials/${symbol}`, { period });
}

/**
 * Get detailed analyst forecast (for Forecast tab)
 * Returns price targets, consensus, earnings estimates, and recommendation trends
 */
export async function getStockForecast(symbol: string): Promise<DetailedForecast> {
    return get<DetailedForecast>(`/stocks/forecast/${symbol}`);
}

/**
 * Get stock statistics (extended fundamental data)
 */
export async function getStockStatistics(symbol: string) {
    return get<{
        symbol: string;
        marketCap: number | null;
        peRatio: number | null;
        forwardPe: number | null;
        eps: number | null;
        beta: number | null;
        dividendYield: number | null;
        dividendRate: number | null;
        sharesOutstanding: number | null;
        floatShares: number | null;
        bookValue: number | null;
        priceToBook: number | null;
        shortRatio: number | null;
        high52w: number | null;
        low52w: number | null;
        avgVolume: number | null;
    }>(`/stocks/statistics/${symbol}`);
}

/**
 * Get dividend history (for Dividends tab)
 */
export async function getStockDividends(symbol: string): Promise<DividendRecord[]> {
    return get<DividendRecord[]>(`/stocks/dividends/${symbol}`);
}

/**
 * Get detailed crypto profile
 */
export async function getCryptoProfile(symbol: string): Promise<MarketStock> {
    return get<MarketStock>(`/crypto/coin/${symbol}`);
}

/**
 * Get crypto history
 */
export async function getCryptoHistory(symbol: string, period = '1mo', interval = '1d'): Promise<StockHistoryResponse> {
    return get<StockHistoryResponse>(`/crypto/history/${symbol}`, { period, interval });
}

export interface EconomicEvent {
    id: string;
    title: string;
    country: string;
    eventDate: string;
    importance: 'low' | 'medium' | 'high';
    forecast?: string;
    previous?: string;
    actual?: string;
    currency?: string;
    source?: string;
}

/**
 * Get economic calendar events
 */
export async function getEconomicCalendar(start?: string, end?: string, limit = 50): Promise<EconomicEvent[]> {
    const params: any = { limit };
    if (start) params.start = start;
    if (end) params.end = end;
    return get<EconomicEvent[]>('/market/calendar', params);
}

/**
 * Get forex history
 */
export async function getForexHistory(symbol: string, period = '1mo', interval = '1d'): Promise<PriceHistoryPoint[]> {
    return get<PriceHistoryPoint[]>(`/market/forex/history/${symbol}`, { period, interval });
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
    getSectorAnalysis,
    getSectorPerformance,
    getStockHistory,
    getStockProfile,
    // Crypto
    getCryptoProfile,
    getCryptoHistory,
    // Calendar
    getEconomicCalendar,
    // Forex
    getForexHistory,
    // Business Profile APIs
    getStockFinancials,
    getStockForecast,
    getStockStatistics,
    getStockDividends,
};
