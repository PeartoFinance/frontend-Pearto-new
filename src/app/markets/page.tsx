'use client';

import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useQuery } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/layout/Sidebar';
import TickerTape from '@/components/layout/TickerTape';
import Header from '@/components/layout/Header';
import VolumeLeaders from '@/components/widgets/VolumeLeaders';
import ProposedDividends from '@/components/widgets/ProposedDividends';
import PublicOfferings from '@/components/widgets/PublicOfferings';
import MarketOverview from '@/components/widgets/MarketOverview';
import MarketAnalysisCharts from '@/components/markets/MarketAnalysisCharts';
import RelatedTools from '@/components/tools/RelatedTools';
import SectorHeatmap from '@/components/home/SectorHeatmap';
import EarningsCalendar from '@/components/home/EarningsCalendar';
import { AIWidget } from '@/components/ai';
import { AIAnalysisPanel } from '@/components/ai/AIAnalysisPanel';
import { useCurrency } from '@/contexts/CurrencyContext';
import {
    getMarketOverview,
    getStocks,
    getStockHistory,
    getCryptoMarkets,
    getCommodities,
    getFloorsheet,
    type MarketOverviewData,
    type MarketStock,
    type MarketIndex,
    type PriceHistoryPoint,
    type Commodity,
    type ForexRate,
    type FloorsheetTrade,
    getForexRates
} from '@/services/marketService';
import { createChart, ColorType, AreaSeries, type IChartApi } from 'lightweight-charts';
import {
    TrendingUp, TrendingDown, Activity, BarChart2, Loader2, Search,
    ArrowUpRight, ArrowDownRight, RefreshCw, Clock, LineChart, PieChart, Coins, Zap, Globe, Hammer
} from 'lucide-react';
import { TableExportButton } from '@/components/common/TableExportButton';

// Dynamic imports for performance
const ForexTab = dynamic(() => import('@/components/markets/ForexTab'), { loading: () => <LoadingTab /> });
const CommoditiesTab = dynamic(() => import('@/components/markets/CommoditiesTab'), { loading: () => <LoadingTab /> });

const LoadingTab = () => (
    <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-emerald-500" size={32} />
    </div>
);

// ── Floorsheet Section ─────────────────────────────────────────────
function FloorsheetSection() {
    const [symbolFilter, setSymbolFilter] = useState('');
    const { formatPrice } = useCurrency();

    const { data, isLoading, refetch } = useQuery({
        queryKey: ['floorsheet', symbolFilter],
        queryFn: () => getFloorsheet(200, symbolFilter || undefined),
        staleTime: 30 * 1000,
        refetchInterval: 60 * 1000,
    });

    const trades = data?.trades ?? [];

    return (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="flex items-center gap-2">
                    <BarChart2 size={18} className="text-emerald-500" />
                    <span className="font-semibold text-slate-900 dark:text-white">Transaction Floorsheet</span>
                    {data?.source && (
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${data.source === 'live'
                            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600'
                            : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600'
                            }`}>
                            {data.source === 'live' ? '● LIVE' : '● DB'}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2 ml-auto">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                        <input
                            type="text"
                            placeholder="Filter symbol…"
                            value={symbolFilter}
                            onChange={(e) => setSymbolFilter(e.target.value.toUpperCase())}
                            className="pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 w-36"
                        />
                    </div>
                    <button onClick={() => refetch()} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition">
                        <RefreshCw size={14} className="text-slate-500" />
                    </button>
                </div>
            </div>

            {/* Table */}
            {isLoading ? (
                <div className="flex items-center justify-center py-16">
                    <Loader2 className="animate-spin text-emerald-500" size={28} />
                </div>
            ) : trades.length === 0 ? (
                <div className="p-8 text-center">
                    <BarChart2 size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                    <p className="text-slate-500">No transactions found{symbolFilter ? ` for ${symbolFilter}` : ''}.</p>
                </div>
            ) : (
                <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                    <table className="w-full text-sm">
                        <thead className="sticky top-0 bg-slate-50 dark:bg-slate-800 z-10">
                            <tr className="border-b border-slate-200 dark:border-slate-700 text-xs text-slate-500 uppercase tracking-wider">
                                <th className="px-4 py-2.5 text-left">Time</th>
                                <th className="px-4 py-2.5 text-left">Symbol</th>
                                <th className="px-4 py-2.5 text-center">Side</th>
                                <th className="px-4 py-2.5 text-right">Price</th>
                                <th className="px-4 py-2.5 text-right">Qty</th>
                                <th className="px-4 py-2.5 text-right">Amount</th>
                                <th className="px-4 py-2.5 text-right">High</th>
                                <th className="px-4 py-2.5 text-right">Low</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                            {trades.map((t: FloorsheetTrade, idx: number) => {
                                const isBuy = t.side === 'buy';
                                const time = t.transactionDate
                                    ? new Date(t.transactionDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                                    : '—';
                                return (
                                    <tr key={t.id || idx} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                        <td className="px-4 py-2 text-xs text-slate-500 font-mono whitespace-nowrap">{time}</td>
                                        <td className="px-4 py-2 font-semibold text-slate-900 dark:text-white whitespace-nowrap">{t.symbol}</td>
                                        <td className="px-4 py-2 text-center">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isBuy
                                                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                                                : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                                                }`}>
                                                {isBuy ? 'BUY' : 'SELL'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2 text-right font-mono text-slate-700 dark:text-slate-300">{formatPrice(t.price)}</td>
                                        <td className="px-4 py-2 text-right text-slate-600 dark:text-slate-400">{t.quantity?.toLocaleString()}</td>
                                        <td className="px-4 py-2 text-right font-medium text-slate-700 dark:text-slate-300">{formatPrice(t.amount)}</td>
                                        <td className="px-4 py-2 text-right text-xs text-slate-500">{t.high != null ? formatPrice(t.high) : '—'}</td>
                                        <td className="px-4 py-2 text-right text-xs text-slate-500">{t.low != null ? formatPrice(t.low) : '—'}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Footer */}
            {trades.length > 0 && (
                <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-between text-xs text-slate-400">
                    <span>{trades.length} transactions</span>
                    <span>{data?.source === 'live' ? 'Intraday 1-min data' : 'Database records'}</span>
                </div>
            )}
        </div>
    );
}

type TabType = 'overview' | 'live' | 'crypto' | 'forex' | 'commodities' | 'floorsheet' | 'charts' | 'analysis';

export default function MarketPage() {
    return (
        <Suspense fallback={
            <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-slate-900">
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="animate-spin text-emerald-500" size={32} />
                </div>
            </div>
        }>
            <MarketPageContent />
        </Suspense>
    );
}

function MarketPageContent() {
    const searchParams = useSearchParams();
    const tabParam = searchParams.get('tab') as TabType | null;

    const [activeTab, setActiveTab] = useState<TabType>(tabParam || 'overview');
    const [overview, setOverview] = useState<MarketOverviewData | null>(null);
    const [allStocks, setAllStocks] = useState<MarketStock[]>([]);
    const [cryptoData, setCryptoData] = useState<MarketStock[]>([]);
    const [commoditiesData, setCommoditiesData] = useState<Commodity[]>([]);
    const [forexData, setForexData] = useState<ForexRate[]>([]);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
    const { formatPrice } = useCurrency();

    // Load data
    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [overviewData, stocksData, crypto, commodities, forex] = await Promise.all([
                getMarketOverview(),
                getStocks(undefined, 50),
                getCryptoMarkets(100),
                getCommodities(),
                getForexRates('USD')
            ]);
            setOverview(overviewData);
            setAllStocks(stocksData);
            setCryptoData(crypto);
            setCommoditiesData(commodities);
            setForexData(forex);
            setLastUpdated(new Date());
        } catch (err) {
            console.error('Failed to load market data:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 60000);
        return () => clearInterval(interval);
    }, [loadData]);

    // Update active tab when URL parameter changes
    useEffect(() => {
        if (tabParam && tabs.some(t => t.id === tabParam)) {
            setActiveTab(tabParam);
        }
    }, [tabParam]);

    const formatNumber = (num: number | null | undefined, decimals = 2) => {
        if (num == null) return '-';
        return num.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    };

    const formatLargeNumber = (num: number | null | undefined) => {
        if (num == null) return '-';
        if (num >= 1e12) return `${(num / 1e12).toFixed(2)}T`;
        if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
        if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
        if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
        return num.toLocaleString();
    };

    const tabs: { id: TabType; label: string; icon?: React.ReactNode }[] = [
        { id: 'overview', label: 'Overview', icon: <Activity size={16} /> },
        { id: 'live', label: 'Live Market', icon: <TrendingUp size={16} /> },
        { id: 'crypto', label: 'Crypto', icon: <Coins size={16} /> },
        { id: 'forex', label: 'Forex', icon: <Globe size={16} /> },
        { id: 'commodities', label: 'Commodities', icon: <Hammer size={16} /> },
        { id: 'floorsheet', label: 'Floorsheet', icon: <BarChart2 size={16} /> },
        { id: 'charts', label: 'Charts', icon: <LineChart size={16} /> },
        { id: 'analysis', label: 'Analysis', icon: <PieChart size={16} /> },
    ];

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-slate-900">
            <Sidebar />

            <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
                <div className="sticky top-0 z-40 bg-gray-50/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
                    <TickerTape />
                    <Header />
                </div>

                <div className="flex-1 overflow-x-hidden">
                    <div className="p-4 lg:p-6 space-y-6 w-full">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Markets</h1>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Live market data and analytics</p>
                            </div>
                            <div className="hidden md:flex items-center gap-6">
                                <Link
                                    href="/markets/live"
                                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-400 text-white rounded-lg font-medium hover:scale-105 transition-transform shadow-lg shadow-emerald-500/25"
                                >
                                    <Zap size={16} className="animate-pulse" />
                                    Go Live
                                </Link>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-sm text-gray-500">Market Open</span>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-500">Last Updated</p>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        {lastUpdated.toLocaleTimeString()}
                                    </p>
                                </div>
                                <button
                                    onClick={loadData}
                                    disabled={loading}
                                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                                >
                                    <RefreshCw size={16} className={`text-slate-500 ${loading ? 'animate-spin' : ''}`} />
                                </button>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition ${activeTab === tab.id
                                        ? 'bg-emerald-500 text-white'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800'
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Forex Tab */}
                        {activeTab === 'forex' && (
                            <div className="space-y-8">
                                <ForexTab initialRates={forexData} isLoading={loading} />
                                <RelatedTools category="Utilities" title="Forex Tools & Converters" limit={4} layout="grid" />
                            </div>
                        )}
                        {/* Overview Tab - Use existing widgets */}
                        {activeTab === 'overview' && (
                            <>
                                {/* AI Market Insights Panel - Full Market Data */}
                                <AIAnalysisPanel
                                    title="Market Insights"
                                    pageType="markets"
                                    pageData={{
                                        // Full market overview data
                                        indices: overview?.indices || [],
                                        topGainers: overview?.topGainers || [],
                                        topLosers: overview?.topLosers || [],
                                        mostActive: overview?.mostActive || [],
                                        advancers: overview?.advancers || 0,
                                        decliners: overview?.decliners || 0,
                                        unchanged: overview?.unchanged || 0,
                                        totalVolume: overview?.totalVolume || 0,
                                        // All loaded stocks
                                        allStocks: allStocks,
                                        stockCount: allStocks.length,
                                        // Timestamp
                                        lastUpdated: lastUpdated.toISOString()
                                    }}
                                    autoAnalyze={!!overview}
                                    quickPrompts={[
                                        'Market sentiment analysis',
                                        'Top opportunities today',
                                        'Sector performance summary'
                                    ]}
                                    className="mb-6"
                                />

                                <MarketOverview />
                                <SectorHeatmap />
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <VolumeLeaders />
                                    <ProposedDividends />
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <PublicOfferings />
                                    <EarningsCalendar />
                                </div>

                                <RelatedTools category="Investing" title="Market Analysis Tools" limit={4} layout="grid" />
                            </>
                        )}

                        {/* Commodities Tab */}
                        {activeTab === 'commodities' && (
                            <CommoditiesTab commodities={commoditiesData} isLoading={loading} />
                        )}

                        {/* Live Market Tab */}
                        {activeTab === 'live' && (
                            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                                <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Activity size={18} className="text-emerald-500" />
                                        <span className="font-semibold text-slate-900 dark:text-white">Live Market Data</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2 text-xs text-slate-500">
                                            <Clock size={12} />
                                            Real-time prices • Auto-updates every 60s
                                        </div>
                                        <TableExportButton
                                            data={allStocks.slice(0, 25)}
                                            columns={[
                                                { key: 'symbol', label: 'Symbol' },
                                                { key: 'name', label: 'Name' },
                                                { key: 'price', label: 'Price', format: 'currency' },
                                                { key: 'change', label: 'Change', format: 'currency' },
                                                { key: 'changePercent', label: 'Change %', format: 'percent' },
                                                { key: 'volume', label: 'Volume', format: 'largeNumber' },
                                                { key: 'marketCap', label: 'Market Cap', format: 'largeNumber' },
                                            ]}
                                            filename="live-market"
                                            title="Live Market Data"
                                            variant="compact"
                                        />
                                    </div>
                                </div>

                                {loading && !allStocks.length ? (
                                    <div className="flex items-center justify-center py-12">
                                        <Loader2 className="animate-spin text-emerald-500" size={24} />
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b border-slate-200 dark:border-slate-700">
                                                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Symbol</th>
                                                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Name</th>
                                                    <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Price</th>
                                                    <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Change</th>
                                                    <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">% Change</th>
                                                    <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Volume</th>
                                                    <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Market Cap</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                                                {allStocks.slice(0, 25).map((stock) => {
                                                    const isPositive = (stock.changePercent || 0) >= 0;
                                                    return (
                                                        <tr key={stock.symbol} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                                            <td className="px-4 py-3">
                                                                <Link href={`/stocks/${stock.symbol}`} className="flex items-center gap-2 hover:underline">
                                                                    <span className="w-7 h-7 rounded bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                                                                        {stock.symbol?.slice(0, 2)}
                                                                    </span>
                                                                    <span className="font-medium text-emerald-600 dark:text-emerald-400">{stock.symbol}</span>
                                                                </Link>
                                                            </td>
                                                            <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300 truncate max-w-[200px]">
                                                                {stock.name}
                                                            </td>
                                                            <td className="px-4 py-3 text-right font-semibold text-slate-900 dark:text-white">
                                                                {formatPrice(stock.price || 0)}
                                                            </td>
                                                            <td className={`px-4 py-3 text-right font-medium ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                                                                {isPositive ? '+' : ''}{formatNumber(stock.change)}
                                                            </td>
                                                            <td className="px-4 py-3 text-right">
                                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${isPositive
                                                                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                                                                    : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                                                                    }`}>
                                                                    {isPositive ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                                                                    {isPositive ? '+' : ''}{formatNumber(stock.changePercent)}%
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-300">
                                                                {formatLargeNumber(stock.volume)}
                                                            </td>
                                                            <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-300">
                                                                {formatLargeNumber(stock.marketCap)}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                <div className="px-5 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-center">
                                    <Link href="/stocks" className="text-emerald-500 hover:text-emerald-600 text-sm font-medium flex items-center justify-center gap-1">
                                        View All Stocks <ArrowUpRight size={14} />
                                    </Link>
                                </div>
                            </div>
                        )}

                        {/* Crypto Tab */}
                        {activeTab === 'crypto' && (
                            <>
                                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                                    <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Coins size={18} className="text-amber-500" />
                                            <span className="font-semibold text-slate-900 dark:text-white">Crypto Market</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                                <Clock size={12} />
                                                Real-time prices • Auto-updates every 60s
                                            </div>
                                            <TableExportButton
                                                data={cryptoData}
                                                columns={[
                                                    { key: 'symbol', label: 'Symbol' },
                                                    { key: 'name', label: 'Name' },
                                                    { key: 'price', label: 'Price', format: 'currency' },
                                                    { key: 'change', label: 'Change', format: 'currency' },
                                                    { key: 'changePercent', label: 'Change %', format: 'percent' },
                                                    { key: 'volume', label: 'Volume', format: 'largeNumber' },
                                                    { key: 'marketCap', label: 'Market Cap', format: 'largeNumber' },
                                                ]}
                                                filename="crypto-market"
                                                title="Crypto Market Data"
                                                variant="compact"
                                            />
                                        </div>
                                    </div>

                                    {loading && !cryptoData.length ? (
                                        <div className="flex items-center justify-center py-12">
                                            <Loader2 className="animate-spin text-emerald-500" size={24} />
                                        </div>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead>
                                                    <tr className="border-b border-slate-200 dark:border-slate-700">
                                                        <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Symbol</th>
                                                        <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Name</th>
                                                        <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Price</th>
                                                        <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Change</th>
                                                        <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">% Change</th>
                                                        <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Volume</th>
                                                        <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Market Cap</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                                                    {cryptoData.map((coin) => {
                                                        const isPositive = (coin.changePercent || 0) >= 0;
                                                        return (
                                                            <tr key={coin.symbol} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                                                <td className="px-4 py-3">
                                                                    <Link href={`/crypto/${coin.symbol}`} className="flex items-center gap-2 hover:underline">
                                                                        <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-xs font-bold text-amber-600 dark:text-amber-400">
                                                                            {coin.symbol?.slice(0, 3)}
                                                                        </div>
                                                                        <span className="font-medium text-amber-600 dark:text-amber-400">{coin.symbol}</span>
                                                                    </Link>
                                                                </td>
                                                                <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300 truncate max-w-[200px]">
                                                                    {coin.name}
                                                                </td>
                                                                <td className="px-4 py-3 text-right font-semibold text-slate-900 dark:text-white">
                                                                    {formatPrice(coin.price)}
                                                                </td>
                                                                <td className={`px-4 py-3 text-right font-medium ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                                                                    {isPositive ? '+' : ''}{formatPrice(coin.change)}
                                                                </td>
                                                                <td className="px-4 py-3 text-right">
                                                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${isPositive
                                                                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                                                                        : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                                                                        }`}>
                                                                        {isPositive ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                                                                        {isPositive ? '+' : ''}{formatNumber(coin.changePercent)}%
                                                                    </span>
                                                                </td>
                                                                <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-300">
                                                                    {formatLargeNumber(coin.volume)}
                                                                </td>
                                                                <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-300">
                                                                    {formatLargeNumber(coin.marketCap)}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                                <div className="mt-8">
                                    <RelatedTools category="Crypto" title="Crypto Trading Tools" limit={4} layout="grid" />
                                </div>
                            </>
                        )}

                        {/* Floorsheet Tab */}
                        {activeTab === 'floorsheet' && (
                            <FloorsheetSection />
                        )}

                        {/* Charts Tab */}
                        {activeTab === 'charts' && overview && (
                            <div className="space-y-6">
                                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                                    <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center gap-2">
                                        <LineChart size={18} className="text-emerald-500" />
                                        <span className="font-semibold text-slate-900 dark:text-white">Market Index Charts</span>
                                    </div>
                                    <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {overview.indices.slice(0, 4).map((index) => (
                                            <MiniChart key={index.symbol} index={index} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Analysis Tab */}
                        {activeTab === 'analysis' && overview && (
                            <div className="space-y-6">
                                {/* Sector Analysis Charts - Pie charts and bar charts */}
                                <MarketAnalysisCharts />

                                {/* Market Breadth */}
                                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                                    <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center gap-2">
                                        <PieChart size={18} className="text-emerald-500" />
                                        <span className="font-semibold text-slate-900 dark:text-white">Market Breadth</span>
                                    </div>
                                    <div className="p-5">
                                        <div className="grid grid-cols-3 gap-4 mb-6">
                                            <div className="text-center p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                                                <p className="text-3xl font-bold text-emerald-500">{overview.advancers || 0}</p>
                                                <p className="text-sm text-slate-500 mt-1">Advancers</p>
                                            </div>
                                            <div className="text-center p-4 bg-slate-100 dark:bg-slate-700/50 rounded-xl">
                                                <p className="text-3xl font-bold text-slate-600 dark:text-slate-300">{overview.unchanged || 0}</p>
                                                <p className="text-sm text-slate-500 mt-1">Unchanged</p>
                                            </div>
                                            <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
                                                <p className="text-3xl font-bold text-red-500">{overview.decliners || 0}</p>
                                                <p className="text-sm text-slate-500 mt-1">Decliners</p>
                                            </div>
                                        </div>

                                        {/* Breadth Bar */}
                                        <div className="h-6 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden flex">
                                            <div
                                                className="bg-emerald-500 h-full flex items-center justify-center text-[10px] text-white font-bold"
                                                style={{ width: `${((overview.advancers || 0) / ((overview.advancers || 0) + (overview.decliners || 0) + (overview.unchanged || 0))) * 100}%` }}
                                            >
                                                ▲
                                            </div>
                                            <div
                                                className="bg-slate-400 h-full"
                                                style={{ width: `${((overview.unchanged || 0) / ((overview.advancers || 0) + (overview.decliners || 0) + (overview.unchanged || 0))) * 100}%` }}
                                            />
                                            <div
                                                className="bg-red-500 h-full flex items-center justify-center text-[10px] text-white font-bold"
                                                style={{ width: `${((overview.decliners || 0) / ((overview.advancers || 0) + (overview.decliners || 0) + (overview.unchanged || 0))) * 100}%` }}
                                            >
                                                ▼
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Top Movers Summary */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Top 5 Gainers */}
                                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                                        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center gap-2">
                                            <TrendingUp size={18} className="text-emerald-500" />
                                            <span className="font-semibold text-slate-900 dark:text-white">Top 5 Gainers</span>
                                        </div>
                                        <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                                            {(overview.topGainers || []).slice(0, 5).map((stock, idx) => (
                                                <Link key={stock.symbol} href={`/stocks/${stock.symbol}`} className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition">
                                                    <div className="flex items-center gap-3">
                                                        <span className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold">{idx + 1}</span>
                                                        <div>
                                                            <p className="font-medium text-slate-900 dark:text-white">{stock.symbol}</p>
                                                            <p className="text-xs text-slate-500 truncate max-w-[150px]">{stock.name}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-semibold text-slate-900 dark:text-white">{formatPrice(stock.price)}</p>
                                                        <p className="text-sm text-emerald-500">+{formatNumber(stock.changePercent)}%</p>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Top 5 Losers */}
                                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                                        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center gap-2">
                                            <TrendingDown size={18} className="text-red-500" />
                                            <span className="font-semibold text-slate-900 dark:text-white">Top 5 Losers</span>
                                        </div>
                                        <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                                            {(overview.topLosers || []).slice(0, 5).map((stock, idx) => (
                                                <Link key={stock.symbol} href={`/stocks/${stock.symbol}`} className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition">
                                                    <div className="flex items-center gap-3">
                                                        <span className="w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center text-xs font-bold">{idx + 1}</span>
                                                        <div>
                                                            <p className="font-medium text-slate-900 dark:text-white">{stock.symbol}</p>
                                                            <p className="text-xs text-slate-500 truncate max-w-[150px]">{stock.name}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-semibold text-slate-900 dark:text-white">{formatPrice(stock.price)}</p>
                                                        <p className="text-sm text-red-500">{formatNumber(stock.changePercent)}%</p>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Volume Analysis */}
                                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                                    <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center gap-2">
                                        <BarChart2 size={18} className="text-emerald-500" />
                                        <span className="font-semibold text-slate-900 dark:text-white">Most Active by Volume</span>
                                    </div>
                                    <div className="p-5">
                                        <div className="space-y-4">
                                            {(overview.mostActive || []).slice(0, 5).map((stock) => {
                                                const maxVolume = Math.max(...(overview.mostActive || []).map(s => s.volume || 0));
                                                const widthPercent = ((stock.volume || 0) / maxVolume) * 100;
                                                const isPositive = (stock.changePercent || 0) >= 0;
                                                return (
                                                    <div key={stock.symbol} className="flex items-center gap-4">
                                                        <Link href={`/stocks/${stock.symbol}`} className="w-16 font-medium text-emerald-600 dark:text-emerald-400 hover:underline">
                                                            {stock.symbol}
                                                        </Link>
                                                        <div className="flex-1">
                                                            <div className="h-6 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                                                <div
                                                                    className={`h-full rounded-full ${isPositive ? 'bg-emerald-500/80' : 'bg-red-500/80'}`}
                                                                    style={{ width: `${widthPercent}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                        <span className="w-20 text-right text-sm text-slate-600 dark:text-slate-300">
                                                            {formatLargeNumber(stock.volume)}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main >

            <AIWidget
                type="floating"
                position="bottom-right"
                pageType="markets"
                quickPrompts={["Top gainers today", "Market analysis"]}
            />
        </div >
    );
}

// Mini Chart Component
function MiniChart({ index }: { index: MarketIndex }) {
    const chartRef = useRef<HTMLDivElement>(null);
    const chartInstanceRef = useRef<IChartApi | null>(null);
    const [data, setData] = useState<PriceHistoryPoint[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadHistory = async () => {
            try {
                const response = await getStockHistory(index.symbol, '1mo', '1d');
                setData(response?.data || []);
            } catch (e) {
                console.error('Failed to load chart:', e);
            } finally {
                setLoading(false);
            }
        };
        loadHistory();
    }, [index.symbol]);

    useEffect(() => {
        if (!chartRef.current || data.length === 0) return;

        if (chartInstanceRef.current) {
            chartInstanceRef.current.remove();
        }

        const isDark = document.documentElement.classList.contains('dark');
        const isPositive = (index.changePercent || 0) >= 0;

        const chart = createChart(chartRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: 'transparent' },
                textColor: isDark ? '#64748b' : '#94a3b8',
                attributionLogo: false,
            },
            grid: { vertLines: { visible: false }, horzLines: { color: isDark ? '#1e293b' : '#f1f5f9' } },
            width: chartRef.current.clientWidth,
            height: 180,
            rightPriceScale: { borderColor: isDark ? '#334155' : '#e2e8f0' },
            timeScale: { borderColor: isDark ? '#334155' : '#e2e8f0', timeVisible: true },
        });

        chartInstanceRef.current = chart;

        // Deduplicate data
        const dataMap = new Map<string, PriceHistoryPoint>();
        data.forEach(d => dataMap.set(d.date, d));
        const sortedData = Array.from(dataMap.values()).sort((a, b) => a.date.localeCompare(b.date));

        const series = chart.addSeries(AreaSeries, {
            lineColor: isPositive ? '#10b981' : '#ef4444',
            topColor: isPositive ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)',
            bottomColor: isPositive ? 'rgba(16, 185, 129, 0.02)' : 'rgba(239, 68, 68, 0.02)',
            lineWidth: 2,
        });

        const chartData = sortedData.filter(d => d.close != null).map(d => ({
            time: d.date.split('T')[0], // Fix: Ensure strictly yyyy-mm-dd
            value: d.close!,
        }));

        series.setData(chartData as any);
        chart.timeScale().fitContent();

        return () => {
            if (chartInstanceRef.current) {
                chartInstanceRef.current.remove();
                chartInstanceRef.current = null;
            }
        };
    }, [data, index.changePercent]);

    const isPositive = (index.changePercent || 0) >= 0;

    return (
        <div className="bg-slate-50 dark:bg-slate-700/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
                <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white">{index.name}</h4>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                        {index.value?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                </div>
                <div className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${isPositive
                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                    : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                    }`}>
                    {isPositive ? '+' : ''}{index.changePercent?.toFixed(2)}%
                </div>
            </div>
            {loading ? (
                <div className="h-[180px] flex items-center justify-center">
                    <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
                </div>
            ) : (
                <div ref={chartRef} className="w-full h-[180px]" />
            )}
        </div>
    );
}
