'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/layout/Sidebar';
import TickerTape from '@/components/layout/TickerTape';
import Header from '@/components/layout/Header';
import { AIWidget } from '@/components/ai';
import { useCurrency } from '@/contexts/CurrencyContext';
import {
    getLiveDashboard,
    searchLiveSymbols,
    type LiveDashboardData,
    type SearchResult
} from '@/services/liveChartService';
import {
    getStocks,
    getCryptoMarkets,
    getMarketIndices,
    getCommodities,
    getForexRates,
    type MarketStock,
    type SectorAnalysisData
} from '@/services/marketService';
import { DonutChart, SECTOR_COLORS, getSectorColor } from './MarketAnalysisCharts';
import { getAssetDetailPath } from '@/utils/assetRoutes';
import {
    Search,
    RefreshCw,
    TrendingUp,
    TrendingDown,
    ArrowUpRight,
    ArrowDownRight,
    RotateCcw,
    ChevronUp,
    ChevronDown,
    Coins,
    BarChart2,
    Activity,
    DollarSign,
    Banknote,
    PieChart,
    Users,
    Layers
} from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";

type SortField = 'symbol' | 'price' | 'change' | 'changePercent' | 'open' | 'high' | 'low' | 'volume' | 'turnover' | 'previousClose';
type SortDirection = 'asc' | 'desc';
type TabType = 'All' | 'Stocks' | 'Crypto' | 'Indices' | 'Commodities' | 'Forex';

export default function LiveMarketsPage() {
    // Currency formatting
    const { formatPrice, symbol } = useCurrency();

    // State
    const [dashboard, setDashboard] = useState<LiveDashboardData | null>(null);
    const [stocks, setStocks] = useState<MarketStock[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [refreshRate, setRefreshRate] = useState(30);
    const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
    const [sortField, setSortField] = useState<SortField>('volume');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
    const [activeTab, setActiveTab] = useState<TabType>('All');
    const [selectedSector, setSelectedSector] = useState<string>('All'); // Kept for sub-filtering stocks
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(20);

    // Market stats
    const marketStats = useMemo(() => {
        const advancers = stocks.filter(s => (s.changePercent || 0) > 0).length;
        const decliners = stocks.filter(s => (s.changePercent || 0) < 0).length;
        const unchanged = stocks.filter(s => (s.changePercent || 0) === 0).length;
        // Calculate turnover: use provided value or compute from volume * price
        const totalTurnover = stocks.reduce((sum, s) => {
            const turnover = s.turnover || ((s.volume || 0) * (s.price || 0));
            return sum + turnover;
        }, 0);
        const totalVolume = stocks.reduce((sum, s) => sum + (s.volume || 0), 0);
        const positiveCircuit = stocks.filter(s => (s.changePercent || 0) >= 10).length;
        const negativeCircuit = stocks.filter(s => (s.changePercent || 0) <= -10).length;

        return {
            advancers,
            decliners,
            unchanged,
            totalTurnover,
            totalVolume,
            totalTransactions: stocks.length,
            positiveCircuit,
            negativeCircuit
        };
    }, [stocks]);

    // Filtered and sorted stocks
    const filteredStocks = useMemo(() => {
        let filtered = [...stocks];

        // Search filter
        if (searchQuery) {
            filtered = filtered.filter(s =>
                s.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
                s.name?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Sector filter
        if (selectedSector !== 'All') {
            filtered = filtered.filter(s => s.sector === selectedSector);
        }

        // Sort
        filtered.sort((a, b) => {
            let aVal: number | string = 0;
            let bVal: number | string = 0;

            switch (sortField) {
                case 'symbol': aVal = a.symbol; bVal = b.symbol; break;
                case 'price': aVal = a.price || 0; bVal = b.price || 0; break;
                case 'change': aVal = a.change || 0; bVal = b.change || 0; break;
                case 'changePercent': aVal = a.changePercent || 0; bVal = b.changePercent || 0; break;
                case 'volume': aVal = a.volume || 0; bVal = b.volume || 0; break;
                case 'turnover':
                    aVal = a.turnover || ((a.volume || 0) * (a.price || 0));
                    bVal = b.turnover || ((b.volume || 0) * (b.price || 0));
                    break;
                case 'high': aVal = a.dayHigh || 0; bVal = b.dayHigh || 0; break;
                case 'low': aVal = a.dayLow || 0; bVal = b.dayLow || 0; break;
                case 'open': aVal = a.open || 0; bVal = b.open || 0; break;
                case 'previousClose': aVal = a.previousClose || 0; bVal = b.previousClose || 0; break;
            }

            if (typeof aVal === 'string') {
                return sortDirection === 'asc'
                    ? aVal.localeCompare(bVal as string)
                    : (bVal as string).localeCompare(aVal);
            }
            return sortDirection === 'asc' ? aVal - (bVal as number) : (bVal as number) - aVal;
        });

        return filtered;
    }, [stocks, searchQuery, selectedSector, sortField, sortDirection]);

    // Pagination
    const paginatedStocks = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredStocks.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredStocks, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(filteredStocks.length / itemsPerPage);

    // Reset pagination when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, selectedSector, activeTab]);

    // Load data based on activeTab
    const loadData = useCallback(async () => {
        try {
            // Fetch Dashboard always for the top ticker/etc
            const dashboardData = await getLiveDashboard();
            setDashboard(dashboardData);

            let newStocks: MarketStock[] = [];

            if (activeTab === 'All' || activeTab === 'Stocks') {
                const s = await getStocks(selectedSector !== 'All' ? selectedSector : undefined, 100);
                newStocks = [...newStocks, ...s];
            }
            if (activeTab === 'All' || activeTab === 'Crypto') {
                const c = await getCryptoMarkets(activeTab === 'Crypto' ? 50 : 10);
                // Map crypto to MarketStock shape
                const mappedCrypto = c.map(i => ({ ...i, sector: 'Crypto', assetType: 'crypto' as const }));
                newStocks = [...newStocks, ...mappedCrypto];
            }
            if (activeTab === 'All' || activeTab === 'Indices') {
                const i = await getMarketIndices();
                // Map indices (use value as price)
                const mappedIndices = i.map(idx => ({
                    ...idx,
                    price: idx.value,
                    sector: 'Indices',
                    assetType: 'index',
                    volume: 0, // Indices often don't have volume in same way
                } as unknown as MarketStock));
                newStocks = [...newStocks, ...mappedIndices];
            }
            if (activeTab === 'All' || activeTab === 'Commodities') {
                const comm = await getCommodities();
                const mappedComm = comm.map(c => ({
                    ...c,
                    sector: 'Commodities',
                    assetType: 'commodity',
                    volume: 0
                } as unknown as MarketStock));
                newStocks = [...newStocks, ...mappedComm];
            }
            if (activeTab === 'All' || activeTab === 'Forex') {
                const forex = await getForexRates();
                const mappedForex = forex.map(f => ({
                    id: 0, // Placeholder
                    symbol: f.pair,
                    name: f.pair,
                    price: f.rate,
                    change: f.change,
                    changePercent: f.changePercent,
                    dayHigh: f.high,
                    dayLow: f.low,
                    sector: 'Forex',
                    assetType: 'forex',
                    volume: 0,
                    turnover: 0
                } as unknown as MarketStock));
                newStocks = [...newStocks, ...mappedForex];
            }

            setStocks(newStocks);
            setLastUpdate(new Date());
        } catch (err) {
            console.error('Failed to load data:', err);
        } finally {
            setLoading(false);
        }
    }, [activeTab, selectedSector]);

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, refreshRate * 1000);
        return () => clearInterval(interval);
    }, [loadData, refreshRate]);

    // Sort handler
    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('desc');
        }
    };

    // Reset filters
    const resetFilters = () => {
        setSearchQuery('');
        setSelectedSector('All');
        setActiveTab('All');
        setSortField('volume');
        setSortDirection('desc');
    };

    // Calculate Sector Analysis for Charts
    const sectorAnalysis = useMemo(() => {
        const analysis: Record<string, SectorAnalysisData> = {};
        let totalTurnover = 0;
        let totalVolume = 0;
        let totalTransactions = 0;

        // Use filteredStocks to reflect current view
        filteredStocks.forEach(stock => {
            let sector = stock.sector;

            // Special grouping logic for specific tabs
            if (activeTab === 'Crypto') {
                sector = stock.symbol; // Group by Symbol for Crypto to show breakdown
            } else if (!sector) {
                // Fallback sectors if missing
                sector = stock.assetType === 'crypto' ? 'Crypto' :
                    stock.assetType === 'index' ? 'Indices' :
                        stock.assetType === 'commodity' ? 'Commodities' : 'Others';
            }

            if (!analysis[sector]) {
                analysis[sector] = {
                    sector,
                    turnover: 0,
                    turnoverPercent: 0,
                    volume: 0,
                    volumePercent: 0,
                    transactions: 0,
                    transactionsPercent: 0,
                    avgChangePercent: 0,
                    avgYtdReturn: 0,
                    weight: 0,
                    advancers: 0,
                    decliners: 0,
                    unchanged: 0,
                    stockCount: 0
                };
            }

            const turnover = stock.turnover || ((stock.price || 0) * (stock.volume || 0));
            analysis[sector].turnover += turnover;
            analysis[sector].volume += (stock.volume || 0);
            analysis[sector].transactions += 1; // Simplification
            analysis[sector].stockCount += 1;

            // Accumulate change percent for average calculation (temporarily store sum)
            analysis[sector].avgChangePercent += (stock.changePercent || 0);
            analysis[sector].avgYtdReturn += (stock.ytdReturn || 0);

            totalTurnover += turnover;
            totalVolume += (stock.volume || 0);
            totalTransactions += 1;

            if ((stock.changePercent || 0) > 0) analysis[sector].advancers++;
            else if ((stock.changePercent || 0) < 0) analysis[sector].decliners++;
            else analysis[sector].unchanged++;
        });

        // Calculate percents and final averages
        return Object.values(analysis).map(s => {
            const count = s.advancers + s.decliners + s.unchanged;
            return {
                ...s,
                transactionsPercent: totalTransactions ? (s.transactions / totalTransactions) * 100 : 0,
                turnoverPercent: totalTurnover ? (s.turnover / totalTurnover) * 100 : 0,
                volumePercent: totalVolume ? (s.volume / totalVolume) * 100 : 0,
                avgChangePercent: count > 0 ? (s.avgChangePercent / count) : 0,
                avgYtdReturn: count > 0 ? (s.avgYtdReturn / count) : 0,
                weight: totalTurnover ? (s.turnover / totalTurnover) * 100 : 0, // Using turnover weight as proxy for now
                stockCount: s.stockCount
            };
        }).sort((a, b) => b.turnoverPercent - a.turnoverPercent);
    }, [filteredStocks, activeTab]);

    // Format helpers
    const formatNumber = (num: number | null | undefined, decimals = 2) => {
        if (num == null) return '-';
        return num.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    };

    const formatLargeNumber = (num: number | null | undefined) => {
        if (num == null) return '-';
        if (num >= 1e12) return `${(num / 1e12).toFixed(2)} Kharab`;
        if (num >= 1e9) return `${(num / 1e9).toFixed(2)} Arab`;
        if (num >= 1e7) return `${(num / 1e7).toFixed(2)} Cr`;
        if (num >= 1e5) return `${(num / 1e5).toFixed(2)} L`;
        if (num >= 1e3) return `${(num / 1e3).toFixed(1)} K`;
        return num.toLocaleString();
    };

    const SortIcon = ({ field }: { field: SortField }) => (
        <span className="ml-1 inline-flex flex-col">
            <ChevronUp size={10} className={`${sortField === field && sortDirection === 'asc' ? 'text-emerald-500' : 'text-slate-400'}`} />
            <ChevronDown size={10} className={`-mt-1 ${sortField === field && sortDirection === 'desc' ? 'text-emerald-500' : 'text-slate-400'}`} />
        </span>
    );

    return (
        <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
            <Sidebar />

            <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
                <div className="fixed top-0 right-0 left-0 lg:left-64 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md">
                    <TickerTape />
                    <Header />
                </div>

                <div className="flex-1 pt-[140px] md:pt-[160px] overflow-x-hidden">
                    <div className="p-4 lg:p-6 space-y-4 w-full">

                        {/* Market Overview Banner */}
                        {dashboard && (
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
                                {[
                                    ...(dashboard.indices || []).slice(0, 4),
                                    ...(dashboard.commodities || []).slice(0, 2),
                                    ...(dashboard.crypto || []).slice(0, 2)
                                ].map((item, idx) => {
                                    const isPositive = (item.changePercent || 0) >= 0;
                                    return (
                                        <div key={`${item.symbol}-${idx}`} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 hover:border-slate-300 dark:hover:border-slate-700 transition shadow-sm dark:shadow-none">
                                            <div className="flex justify-between items-start mb-1">
                                                <p className="text-xs text-slate-500 dark:text-slate-400 truncate font-medium">{item.name || item.symbol}</p>
                                                {item.assetType === 'crypto' && <Coins size={10} className="text-slate-400 dark:text-slate-500" />}
                                                {item.assetType === 'commodity' && <DollarSign size={10} className="text-slate-400 dark:text-slate-500" />}
                                            </div>
                                            <p className={`text-lg font-bold ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
                                                {formatPrice(item.price || 0)}
                                            </p>
                                            <div className="flex items-center gap-2 text-xs">
                                                <span className={isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}>
                                                    {isPositive ? '↗' : '↘'} {formatNumber(item.changePercent)}%
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Main Content Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                            {/* Left Section - Live Table */}
                            <div className="lg:col-span-3 space-y-4">
                                {/* Header with Search and Stats */}
                                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-sm dark:shadow-none">
                                    {/* Header Title Row */}
                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                                    <Activity size={20} className="text-white" />
                                                </div>
                                                <div>
                                                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                                        Live Markets
                                                    </h1>
                                                    <p className="text-sm text-slate-500 dark:text-slate-400">Real-time prices across all markets</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-bold border border-emerald-500/20">
                                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                                LIVE
                                            </span>

                                            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-700">
                                                <RefreshCw size={14} className={`text-slate-400 ml-2 ${loading ? 'animate-spin' : ''}`} />
                                                <select
                                                    value={refreshRate}
                                                    onChange={(e) => setRefreshRate(Number(e.target.value))}
                                                    className="bg-transparent border-none text-xs font-medium text-slate-700 dark:text-slate-300 focus:ring-0 py-1 pl-1 pr-6 cursor-pointer"
                                                >
                                                    <option value={5}>5s</option>
                                                    <option value={10}>10s</option>
                                                    <option value={30}>30s</option>
                                                </select>
                                                <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1"></div>
                                                <span className="text-xs text-slate-500 pr-3">
                                                    {lastUpdate ? lastUpdate.toLocaleTimeString() : '--:--:--'}
                                                </span>
                                            </div>

                                            <Link
                                                href="/markets"
                                                className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-700 transition"
                                            >
                                                <BarChart2 size={16} />
                                                Markets
                                            </Link>
                                        </div>
                                    </div>

                                    {/* Filter Tabs & Search Row */}
                                    <div className="flex flex-col lg:flex-row gap-4 mb-4">
                                        <div className="relative flex-1">
                                            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input
                                                type="text"
                                                placeholder="Search stocks, crypto, indices, commodities..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="w-full pl-11 pr-4 py-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition shadow-sm"
                                            />
                                        </div>

                                        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 overflow-x-auto">
                                            <button
                                                onClick={() => { setActiveTab('All'); setSelectedSector('All'); }}
                                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${activeTab === 'All'
                                                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-700/50'
                                                    }`}
                                            >
                                                <Activity size={14} />
                                                All
                                            </button>
                                            <button
                                                onClick={() => { setActiveTab('Stocks'); setSelectedSector('All'); }}
                                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${activeTab === 'Stocks'
                                                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 shadow-sm'
                                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-700/50'
                                                    }`}
                                            >
                                                <TrendingUp size={14} />
                                                Stocks
                                            </button>
                                            <button
                                                onClick={() => { setActiveTab('Crypto'); setSelectedSector('All'); }}
                                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${activeTab === 'Crypto'
                                                    ? 'bg-purple-500/10 text-purple-600 dark:text-purple-500 shadow-sm'
                                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-700/50'
                                                    }`}
                                            >
                                                <Coins size={14} />
                                                Crypto
                                            </button>
                                            <button
                                                onClick={() => { setActiveTab('Indices'); setSelectedSector('All'); }}
                                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${activeTab === 'Indices'
                                                    ? 'bg-blue-500/10 text-blue-600 dark:text-blue-500 shadow-sm'
                                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-700/50'
                                                    }`}
                                            >
                                                <BarChart2 size={14} />
                                                Indices
                                            </button>
                                            <button
                                                onClick={() => { setActiveTab('Commodities'); setSelectedSector('All'); }}
                                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${activeTab === 'Commodities'
                                                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-500 shadow-sm'
                                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-700/50'
                                                    }`}
                                            >
                                                <DollarSign size={14} />
                                                Commodities
                                            </button>
                                            <button
                                                onClick={() => { setActiveTab('Forex'); setSelectedSector('All'); }}
                                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${activeTab === 'Forex'
                                                    ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-500 shadow-sm'
                                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-700/50'
                                                    }`}
                                            >
                                                <DollarSign size={14} />
                                                Forex
                                            </button>
                                        </div>
                                    </div>

                                </div>

                                {/* Market Composition Charts - Innovative Section */}
                                {/* Only show if we have meaningful data (e.g. Stocks or Crypto with Volume) */}
                                {(loading && activeTab !== 'Indices' && activeTab !== 'Commodities') ? (
                                    <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 mb-4">
                                        <div className="flex items-center justify-between mb-4">
                                            <Skeleton className="h-6 w-48" />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className="flex flex-col items-center gap-4">
                                                <Skeleton className="h-40 w-40 rounded-full" />
                                                <Skeleton className="h-4 w-24" />
                                            </div>
                                            <div className="flex flex-col items-center gap-4">
                                                <Skeleton className="h-40 w-40 rounded-full" />
                                                <Skeleton className="h-4 w-24" />
                                            </div>
                                            <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex flex-col justify-center gap-4 h-[200px]">
                                                <Skeleton className="h-4 w-32 self-center mb-2" />
                                                <div className="space-y-3">
                                                    <div className="flex justify-between"><Skeleton className="h-4 w-20" /><Skeleton className="h-4 w-16" /></div>
                                                    <div className="flex justify-between"><Skeleton className="h-4 w-20" /><Skeleton className="h-4 w-16" /></div>
                                                    <div className="w-full h-px bg-slate-700 my-2"></div>
                                                    <div className="flex justify-between"><Skeleton className="h-4 w-20" /><Skeleton className="h-4 w-10" /></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (activeTab !== 'Indices' && activeTab !== 'Commodities') && (
                                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 mb-4 shadow-sm dark:shadow-none">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                                <PieChart size={18} className="text-emerald-500" />
                                                Market Composition
                                            </h3>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <DonutChart
                                                data={sectorAnalysis}
                                                title="By Turnover"
                                                valueKey="turnover"
                                                percentKey="turnoverPercent"
                                            />
                                            <DonutChart
                                                data={sectorAnalysis}
                                                title="By Volume"
                                                valueKey="volume"
                                                percentKey="volumePercent"
                                            />
                                            <div className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 flex flex-col justify-center gap-4">
                                                <h4 className="text-sm font-semibold text-slate-600 dark:text-slate-300 text-center">Market Summary</h4>
                                                <div className="space-y-3">
                                                    <div className="flex justify-between items-center text-sm">
                                                        <span className="text-slate-500 dark:text-slate-400">Total Turnover</span>
                                                        <span className="font-bold text-slate-900 dark:text-white">{formatPrice(sectorAnalysis.reduce((acc, s) => acc + s.turnover, 0), undefined, undefined, { notation: 'compact' })}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center text-sm">
                                                        <span className="text-slate-500 dark:text-slate-400">Total Volume</span>
                                                        <span className="font-bold text-slate-900 dark:text-white">{formatLargeNumber(sectorAnalysis.reduce((acc, s) => acc + s.volume, 0))}</span>
                                                    </div>
                                                    <div className="w-full h-px bg-slate-300 dark:bg-slate-700 my-2"></div>
                                                    <div className="flex justify-between items-center text-sm">
                                                        <span className="text-slate-500 dark:text-slate-400">Active Sectors</span>
                                                        <span className="font-bold text-slate-900 dark:text-white">{sectorAnalysis.length}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Removed old filter section */}

                                {/* Market Stats Row */}
                                {loading ? (
                                    <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                                        {[1, 2, 3, 4, 5].map((i) => (
                                            <div key={i} className="flex items-center gap-2">
                                                <Skeleton className="h-4 w-16" />
                                                <Skeleton className="h-6 w-10 rounded" />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-slate-500 dark:text-slate-400">Advanced</span>
                                            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded text-sm font-bold">
                                                {marketStats.advancers}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-slate-400">Declined</span>
                                            <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded text-sm font-bold">
                                                {marketStats.decliners}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-slate-400">Unchanged</span>
                                            <span className="px-3 py-1 bg-amber-500/20 text-amber-400 rounded text-sm font-bold">
                                                {marketStats.unchanged}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-slate-400">+ve Circuit</span>
                                            <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded text-sm font-bold">
                                                {marketStats.positiveCircuit}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-slate-400">-ve Circuit</span>
                                            <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded text-sm font-bold">
                                                {marketStats.negativeCircuit}
                                            </span>
                                        </div>
                                    </div>
                                )}


                                {/* Live Data Table */}
                                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden shadow-sm dark:shadow-none">
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-500 dark:text-slate-400 uppercase">
                                                    <th className="px-4 py-3 text-left cursor-pointer hover:text-slate-900 dark:hover:text-white" onClick={() => handleSort('symbol')}>
                                                        Symbol <SortIcon field="symbol" />
                                                    </th>
                                                    <th className="px-4 py-3 text-right cursor-pointer hover:text-slate-900 dark:hover:text-white" onClick={() => handleSort('price')}>
                                                        LTP <SortIcon field="price" />
                                                    </th>
                                                    <th className="px-4 py-3 text-right cursor-pointer hover:text-white" onClick={() => handleSort('change')}>
                                                        CH <SortIcon field="change" />
                                                    </th>
                                                    <th className="px-4 py-3 text-right cursor-pointer hover:text-white" onClick={() => handleSort('changePercent')}>
                                                        CH % <SortIcon field="changePercent" />
                                                    </th>
                                                    <th className="px-4 py-3 text-right cursor-pointer hover:text-white" onClick={() => handleSort('open')}>
                                                        OPEN <SortIcon field="open" />
                                                    </th>
                                                    <th className="px-4 py-3 text-right cursor-pointer hover:text-white" onClick={() => handleSort('high')}>
                                                        HIGH <SortIcon field="high" />
                                                    </th>
                                                    <th className="px-4 py-3 text-right cursor-pointer hover:text-white" onClick={() => handleSort('low')}>
                                                        LOW <SortIcon field="low" />
                                                    </th>
                                                    <th className="px-4 py-3 text-right cursor-pointer hover:text-white" onClick={() => handleSort('volume')}>
                                                        VOL <SortIcon field="volume" />
                                                    </th>
                                                    <th className="px-4 py-3 text-right cursor-pointer hover:text-white" onClick={() => handleSort('turnover')}>
                                                        TURNOVER <SortIcon field="turnover" />
                                                    </th>
                                                    <th className="px-4 py-3 text-right cursor-pointer hover:text-white" onClick={() => handleSort('previousClose')}>
                                                        PR. CLOSE <SortIcon field="previousClose" />
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                                {loading ? (
                                                    Array.from({ length: 15 }).map((_, idx) => (
                                                        <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                                                            <td className="px-4 py-3"><Skeleton className="h-4 w-16" /></td>
                                                            <td className="px-4 py-3 text-right"><Skeleton className="h-4 w-12 ml-auto" /></td>
                                                            <td className="px-4 py-3 text-right"><Skeleton className="h-4 w-12 ml-auto" /></td>
                                                            <td className="px-4 py-3 text-right"><Skeleton className="h-5 w-14 ml-auto rounded" /></td>
                                                            <td className="px-4 py-3 text-right"><Skeleton className="h-4 w-12 ml-auto" /></td>
                                                            <td className="px-4 py-3 text-right"><Skeleton className="h-4 w-12 ml-auto" /></td>
                                                            <td className="px-4 py-3 text-right"><Skeleton className="h-4 w-12 ml-auto" /></td>
                                                            <td className="px-4 py-3 text-right"><Skeleton className="h-4 w-16 ml-auto" /></td>
                                                            <td className="px-4 py-3 text-right"><Skeleton className="h-4 w-16 ml-auto" /></td>
                                                            <td className="px-4 py-3 text-right"><Skeleton className="h-4 w-12 ml-auto" /></td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    paginatedStocks.map((stock, idx) => {
                                                        const isPositive = (stock.changePercent || 0) >= 0;
                                                        const isNeutral = (stock.changePercent || 0) === 0;

                                                        return (
                                                            <tr key={stock.symbol} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                                                                <td className="px-4 py-3">
                                                                    <Link href={getAssetDetailPath(stock.symbol, stock.assetType)} className="flex items-center gap-2">
                                                                        <div className="w-6 h-6 rounded bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-[10px] text-slate-600 dark:text-slate-300">
                                                                            {stock.symbol.slice(0, 2)}
                                                                        </div>
                                                                        <span className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300">
                                                                            {stock.symbol}
                                                                        </span>
                                                                    </Link>
                                                                </td>
                                                                <td className="px-4 py-3 text-right font-medium text-slate-900 dark:text-white">
                                                                    {formatPrice(stock.price || 0)}
                                                                </td>
                                                                <td className={`px-4 py-3 text-right font-medium ${isNeutral ? 'text-slate-500 dark:text-slate-400' : isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
                                                                    {isPositive && !isNeutral ? '+' : ''}{formatNumber(stock.change)}
                                                                </td>
                                                                <td className="px-4 py-3 text-right">
                                                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${isNeutral ? 'bg-slate-700 text-slate-400' :
                                                                        isPositive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                                                                        }`}>
                                                                        {isPositive && !isNeutral ? '↑' : isNeutral ? '' : '↓'}
                                                                        {formatNumber(stock.changePercent)}%
                                                                    </span>
                                                                </td>
                                                                <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-300">
                                                                    {formatPrice(stock.open || 0)}
                                                                </td>
                                                                <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-300">
                                                                    {formatPrice(stock.dayHigh || 0)}
                                                                </td>
                                                                <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-300">
                                                                    {formatPrice(stock.dayLow || 0)}
                                                                </td>
                                                                <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-300">
                                                                    {formatLargeNumber(stock.volume)}
                                                                </td>
                                                                <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-300">
                                                                    {formatPrice(stock.turnover || ((stock.volume || 0) * (stock.price || 0)), undefined, undefined, { notation: 'compact' })}
                                                                </td>
                                                                <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-300">
                                                                    {formatPrice(stock.previousClose || 0)}
                                                                </td>
                                                            </tr>
                                                        );
                                                    }))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Row count */}
                                    {/* Pagination Controls */}
                                    <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                                        <span>
                                            Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredStocks.length)} to {Math.min(currentPage * itemsPerPage, filteredStocks.length)} of {filteredStocks.length} entries
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                                disabled={currentPage === 1}
                                                className="px-2 py-1 bg-slate-700 rounded text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600 transition"
                                            >
                                                Previous
                                            </button>
                                            <span className="text-slate-300">
                                                Page {currentPage} of {totalPages}
                                            </span>
                                            <button
                                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                                disabled={currentPage === totalPages}
                                                className="px-2 py-1 bg-slate-700 rounded text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600 transition"
                                            >
                                                Next
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Sidebar - Stats & Movers */}
                            <div className="space-y-4">
                                {/* Market Stats Cards */}
                                {/* Market Indices Small Cards */}
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 shadow-sm dark:shadow-none">
                                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs mb-1">
                                            <Banknote size={14} />
                                            Total Turnover ({symbol}):
                                        </div>
                                        {loading ? <Skeleton className="h-6 w-24 mt-1" /> : (
                                            <p className="text-lg font-bold text-slate-900 dark:text-white">{formatPrice(marketStats.totalTurnover, undefined, undefined, { notation: 'compact' })}</p>
                                        )}
                                    </div>
                                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 shadow-sm dark:shadow-none">
                                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs mb-1">
                                            <Layers size={14} />
                                            Total Traded Shares
                                        </div>
                                        {loading ? <Skeleton className="h-6 w-24 mt-1" /> : (
                                            <p className="text-lg font-bold text-slate-900 dark:text-white">{formatLargeNumber(marketStats.totalVolume)}</p>
                                        )}
                                    </div>
                                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 shadow-sm dark:shadow-none">
                                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs mb-1">
                                            <Activity size={14} />
                                            Total Transactions
                                        </div>
                                        {loading ? <Skeleton className="h-6 w-24 mt-1" /> : (
                                            <p className="text-lg font-bold text-slate-900 dark:text-white">{marketStats.totalTransactions.toLocaleString()}</p>
                                        )}
                                    </div>
                                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 shadow-sm dark:shadow-none">
                                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs mb-1">
                                            <PieChart size={14} />
                                            Total Scrips Traded
                                        </div>
                                        {loading ? <Skeleton className="h-6 w-24 mt-1" /> : (
                                            <p className="text-lg font-bold text-slate-900 dark:text-white">{stocks.length}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Top Gainers */}
                                {/* Top Gainers */}
                                {loading || dashboard ? (
                                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden shadow-sm dark:shadow-none">
                                        <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <TrendingUp size={16} className="text-emerald-500 dark:text-emerald-400" />
                                                <span className="font-semibold text-slate-900 dark:text-white text-sm">Top Gainers</span>
                                            </div>
                                            <Link href="/markets" className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
                                                →
                                            </Link>
                                        </div>
                                        <div className="text-xs">
                                            <div className="grid grid-cols-4 gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800/30 text-slate-500 dark:text-slate-400">
                                                <span>SYMBOL</span>
                                                <span className="text-right">CH</span>
                                                <span className="text-right">CH %</span>
                                                <span className="text-right">LTP</span>
                                            </div>
                                            {loading ? (
                                                Array.from({ length: 8 }).map((_, idx) => (
                                                    <div key={idx} className="grid grid-cols-4 gap-2 px-3 py-2 items-center">
                                                        <div className="flex items-center gap-1"><Skeleton className="w-5 h-5 rounded" /><Skeleton className="h-3 w-8" /></div>
                                                        <Skeleton className="h-3 w-10 ml-auto" />
                                                        <Skeleton className="h-4 w-12 ml-auto rounded" />
                                                        <Skeleton className="h-3 w-10 ml-auto" />
                                                    </div>
                                                ))
                                            ) : (
                                                dashboard?.gainers.slice(0, 8).map((stock, idx) => (
                                                    <Link
                                                        key={stock.symbol}
                                                        href={getAssetDetailPath(stock.symbol, stock.assetType)}
                                                        className="grid grid-cols-4 gap-2 px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition items-center"
                                                    >
                                                        <div className="flex items-center gap-1">
                                                            <div className="w-5 h-5 rounded bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-[8px] text-slate-600 dark:text-slate-300">
                                                                {stock.symbol.slice(0, 2)}
                                                            </div>
                                                            <span className="text-blue-600 dark:text-blue-400">{stock.symbol}</span>
                                                        </div>
                                                        <span className="text-right text-emerald-600 dark:text-emerald-400">+{formatNumber(stock.change)}</span>
                                                        <span className="text-right">
                                                            <span className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded text-[10px]">
                                                                ↑ {formatNumber(stock.changePercent)}%
                                                            </span>
                                                        </span>
                                                        <span className="text-right text-slate-900 dark:text-white">{formatPrice(stock.price || 0)}</span>
                                                    </Link>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                ) : null}

                                {/* Top Losers */}
                                {/* Top Losers */}
                                {loading || dashboard ? (
                                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden shadow-sm dark:shadow-none">
                                        <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <TrendingDown size={16} className="text-red-500 dark:text-red-400" />
                                                <span className="font-semibold text-slate-900 dark:text-white text-sm">Top Losers</span>
                                            </div>
                                            <Link href="/markets" className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
                                                →
                                            </Link>
                                        </div>
                                        <div className="text-xs">
                                            <div className="grid grid-cols-4 gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800/30 text-slate-500 dark:text-slate-400">
                                                <span>SYMBOL</span>
                                                <span className="text-right">CH</span>
                                                <span className="text-right">CH %</span>
                                                <span className="text-right">LTP</span>
                                            </div>
                                            {loading ? (
                                                Array.from({ length: 8 }).map((_, idx) => (
                                                    <div key={idx} className="grid grid-cols-4 gap-2 px-3 py-2 items-center">
                                                        <div className="flex items-center gap-1"><Skeleton className="w-5 h-5 rounded" /><Skeleton className="h-3 w-8" /></div>
                                                        <Skeleton className="h-3 w-10 ml-auto" />
                                                        <Skeleton className="h-4 w-12 ml-auto rounded" />
                                                        <Skeleton className="h-3 w-10 ml-auto" />
                                                    </div>
                                                ))
                                            ) : (
                                                dashboard?.losers.slice(0, 8).map((stock, idx) => (
                                                    <Link
                                                        key={stock.symbol}
                                                        href={getAssetDetailPath(stock.symbol, stock.assetType)}
                                                        className="grid grid-cols-4 gap-2 px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition items-center"
                                                    >
                                                        <div className="flex items-center gap-1">
                                                            <div className="w-5 h-5 rounded bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-[8px] text-slate-600 dark:text-slate-300">
                                                                {stock.symbol.slice(0, 2)}
                                                            </div>
                                                            <span className="text-blue-600 dark:text-blue-400">{stock.symbol}</span>
                                                        </div>
                                                        <span className="text-right text-red-500 dark:text-red-400">{formatNumber(stock.change)}</span>
                                                        <span className="text-right">
                                                            <span className="bg-red-500/20 text-red-600 dark:text-red-400 px-1.5 py-0.5 rounded text-[10px]">
                                                                ↓ {formatNumber(stock.changePercent)}%
                                                            </span>
                                                        </span>
                                                        <span className="text-right text-slate-900 dark:text-white">{formatPrice(stock.price || 0)}</span>
                                                    </Link>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                ) : null}

                                {/* Most Active */}
                                {/* Most Active */}
                                {loading || dashboard ? (
                                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden shadow-sm dark:shadow-none">
                                        <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Activity size={16} className="text-cyan-500 dark:text-cyan-400" />
                                                <span className="font-semibold text-slate-900 dark:text-white text-sm">Most Active</span>
                                            </div>
                                            <Link href="/markets" className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
                                                →
                                            </Link>
                                        </div>
                                        <div className="text-xs">
                                            <div className="grid grid-cols-4 gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800/30 text-slate-500 dark:text-slate-400">
                                                <span>SYMBOL</span>
                                                <span className="text-right">VOLUME</span>
                                                <span className="text-right">CH %</span>
                                                <span className="text-right">LTP</span>
                                            </div>
                                            {loading ? (
                                                Array.from({ length: 8 }).map((_, idx) => (
                                                    <div key={idx} className="grid grid-cols-4 gap-2 px-3 py-2 items-center">
                                                        <div className="flex items-center gap-1"><Skeleton className="w-5 h-5 rounded" /><Skeleton className="h-3 w-8" /></div>
                                                        <Skeleton className="h-3 w-10 ml-auto" />
                                                        <Skeleton className="h-4 w-12 ml-auto rounded" />
                                                        <Skeleton className="h-3 w-10 ml-auto" />
                                                    </div>
                                                ))
                                            ) : (
                                                dashboard?.mostActive.slice(0, 8).map((stock, idx) => {
                                                    const isPositive = (stock.changePercent || 0) >= 0;
                                                    return (
                                                        <Link
                                                            key={stock.symbol}
                                                            href={getAssetDetailPath(stock.symbol, stock.assetType)}
                                                            className="grid grid-cols-4 gap-2 px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition items-center"
                                                        >
                                                            <div className="flex items-center gap-1">
                                                                <div className="w-5 h-5 rounded bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-[8px] text-slate-600 dark:text-slate-300">
                                                                    {stock.symbol.slice(0, 2)}
                                                                </div>
                                                                <span className="text-blue-600 dark:text-blue-400">{stock.symbol}</span>
                                                            </div>
                                                            <span className="text-right text-slate-600 dark:text-slate-300">{formatLargeNumber(stock.volume)}</span>
                                                            <span className="text-right">
                                                                <span className={`px-1.5 py-0.5 rounded text-[10px] ${isPositive ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-red-500/20 text-red-600 dark:text-red-400'
                                                                    }`}>
                                                                    {isPositive ? '↑' : '↓'} {formatNumber(stock.changePercent)}%
                                                                </span>
                                                            </span>
                                                            <span className="text-right text-slate-900 dark:text-white">{formatPrice(stock.price || 0)}</span>
                                                        </Link>
                                                    );
                                                })
                                            )}
                                        </div>
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    </div>
                </div>
            </main >

            <AIWidget
                type="floating"
                position="bottom-right"
                pageType="markets"
                quickPrompts={["Market analysis", "Top opportunities"]}
            />
        </div >
    );
}
