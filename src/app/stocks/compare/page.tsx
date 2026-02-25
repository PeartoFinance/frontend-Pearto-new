'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/layout/Sidebar';
import TickerTape from '@/components/layout/TickerTape';
import Header from '@/components/layout/Header';
import { AIWidget } from '@/components/ai';
import { AIAnalysisPanel } from '@/components/ai/AIAnalysisPanel';
import { AIColumnWrapper } from '@/components/ai/AIColumnWrapper';
import { useSubscription } from '@/context/SubscriptionContext';
import { UpgradeModal } from '@/components/subscription/FeatureGating';
import {
    getStockProfile,
    getStockHistory,
    searchStocks,
    type MarketStock,
    type PriceHistoryPoint
} from '@/services/marketService';
import {
    CompareTabs,
    CompareOverviewTab,
    CompareChartTab,
    CompareFinancialsTab,
    CompareForecastTab,
    CompareProfileTab,
    type CompareTabId,
} from '@/components/stocks/compare';
import { ArrowLeft, Loader2, Search, Plus, X } from 'lucide-react';

interface CompareStock extends MarketStock {
    color: string;
    data: PriceHistoryPoint[];
}

const COLORS = ['#14b8a6', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

const INTERVAL_MAP: Record<string, string> = {
    '1m': '1m', '1d': '5m', '2d': '5m', '5d': '15m', '1mo': '90m',
    '3mo': '1d', '6mo': '1d', 'ytd': '1d', '1y': '1d', '3y': '1wk', '5y': '1wk', 'max': '1mo',
};

function StockCompareContent() {
    const searchParams = useSearchParams();

    const [stocks, setStocks] = useState<CompareStock[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<MarketStock[]>([]);
    const [searching, setSearching] = useState(false);
    const [period, setPeriod] = useState('1mo');
    const [activeTab, setActiveTab] = useState<CompareTabId>('overview');

    // Load initial stocks from URL params
    useEffect(() => {
        const symbolsParam = searchParams.get('symbols');
        if (symbolsParam) {
            const symbols = symbolsParam.split(',').slice(0, 5);
            loadStocks(symbols);
        } else {
            setLoading(false);
        }
    }, [searchParams]);

    const loadStocks = async (symbols: string[]) => {
        setLoading(true);
        try {
            const results = await Promise.all(
                symbols.map(async (symbol, index) => {
                    const [profile, history] = await Promise.all([
                        getStockProfile(symbol),
                        getStockHistory(symbol, period, INTERVAL_MAP[period] || '1d')
                    ]);
                    return {
                        ...profile,
                        color: COLORS[index % COLORS.length],
                        data: history?.data || []
                    } as CompareStock;
                })
            );
            setStocks(results.filter(Boolean));
        } catch (err) {
            console.error('Failed to load stocks:', err);
        } finally {
            setLoading(false);
        }
    };

    // Refresh history when period changes
    const refreshHistory = useCallback(async (newPeriod: string) => {
        setPeriod(newPeriod);
        if (stocks.length === 0) return;

        setLoading(true);
        try {
            const interval = INTERVAL_MAP[newPeriod] || '1d';
            const updated = await Promise.all(
                stocks.map(async (stock) => {
                    const history = await getStockHistory(stock.symbol, newPeriod, interval);
                    return { ...stock, data: history?.data || [] };
                })
            );
            setStocks(updated);
        } catch (err) {
            console.error('Failed to refresh:', err);
        } finally {
            setLoading(false);
        }
    }, [stocks]);

    // Search stocks
    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        setSearching(true);
        try {
            const results = await searchStocks(searchQuery, 5);
            const existing = stocks.map(s => s.symbol);
            setSearchResults(results.filter(r => !existing.includes(r.symbol)));
        } catch (err) {
            console.error('Search failed:', err);
        } finally {
            setSearching(false);
        }
    };

    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const { trackUsage } = useSubscription();

    // Add stock
    const addStock = async (stock: MarketStock) => {
        if (stocks.length >= 5) return;

        // Check usage limit
        const { allowed } = await trackUsage('comparison_limit');
        if (!allowed) {
            setShowUpgradeModal(true);
            return;
        }

        setLoading(true);
        try {
            const interval = INTERVAL_MAP[period] || '1d';
            const history = await getStockHistory(stock.symbol, period, interval);
            setStocks(prev => [...prev, {
                ...stock,
                color: COLORS[prev.length % COLORS.length],
                data: history?.data || []
            }]);
        } catch (err) {
            console.error('Failed to add stock:', err);
        } finally {
            setLoading(false);
            setSearchQuery('');
            setSearchResults([]);
        }
    };

    // Remove stock
    const removeStock = (symbol: string) => {
        setStocks(prev => prev.filter(s => s.symbol !== symbol));
    };

    // Render active tab content
    const renderTabContent = () => {
        switch (activeTab) {
            case 'overview':
                return <CompareOverviewTab stocks={stocks} />;
            case 'chart':
                return <CompareChartTab stocks={stocks} period={period} onPeriodChange={refreshHistory} />;
            case 'financials':
                return <CompareFinancialsTab stocks={stocks} />;
            case 'forecast':
                return <CompareForecastTab stocks={stocks} />;
            case 'profile':
                return <CompareProfileTab stocks={stocks} />;
            default:
                return <CompareOverviewTab stocks={stocks} />;
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-slate-900">
            <Sidebar />

            <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
                <div className="fixed top-0 right-0 left-0 lg:left-64 z-40 bg-gray-50 dark:bg-slate-900">
                    <TickerTape />
                    <Header />
                </div>

                <div className="flex-1 pt-[112px] md:pt-[120px] overflow-x-hidden">
                    <div className="p-2 lg:p-3 space-y-3 w-full">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <div>
                                <Link href="/stocks" className="inline-flex items-center gap-2 text-slate-500 hover:text-teal-600 mb-2 text-sm">
                                    <ArrowLeft size={16} />
                                    Back to Stocks
                                </Link>
                                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                                    Stock Comparison
                                </h1>
                                <p className="text-slate-500 text-sm mt-1">
                                    Compare up to 5 stocks side by side
                                </p>
                            </div>
                        </div>

                        {/* Add Stock Search */}
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
                            <div className="flex gap-2">
                                <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                                    <Search size={16} className="text-slate-400" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                        placeholder="Add stock to compare..."
                                        className="flex-1 bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 outline-none text-sm"
                                        disabled={stocks.length >= 5}
                                    />
                                </div>
                                <button
                                    onClick={handleSearch}
                                    disabled={searching || stocks.length >= 5}
                                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                                >
                                    {searching ? 'Searching...' : 'Search'}
                                </button>
                            </div>

                            {/* Search Results */}
                            {searchResults.length > 0 && (
                                <div className="mt-2 divide-y divide-slate-200 dark:divide-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg">
                                    {searchResults.map((stock) => (
                                        <div
                                            key={stock.symbol}
                                            className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                                            onClick={() => addStock(stock)}
                                        >
                                            <div>
                                                <p className="font-semibold text-slate-900 dark:text-white">{stock.symbol}</p>
                                                <p className="text-xs text-slate-500">{stock.name}</p>
                                            </div>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); addStock(stock); }}
                                                className="flex items-center gap-1 px-3 py-1 bg-teal-100 dark:bg-teal-900/30 text-teal-600 rounded text-sm"
                                            >
                                                <Plus size={14} /> Add
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Selected Stocks Chips */}
                            {stocks.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-4">
                                    {stocks.map((stock) => (
                                        <div
                                            key={stock.symbol}
                                            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium text-white"
                                            style={{ backgroundColor: stock.color }}
                                        >
                                            {stock.symbol}
                                            <button onClick={() => removeStock(stock.symbol)} className="hover:opacity-70">
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {loading && (
                            <div className="flex justify-center py-10">
                                <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
                            </div>
                        )}

                        {!loading && stocks.length === 0 && (
                            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                                <div className="text-center mb-6">
                                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Popular Comparisons</h2>
                                    <p className="text-sm text-slate-500 mt-1">Click any comparison to get started instantly</p>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {[
                                        { label: 'Big Tech', symbols: ['AAPL', 'MSFT', 'GOOGL'], emoji: '💻' },
                                        { label: 'EV Makers', symbols: ['TSLA', 'RIVN', 'LCID'], emoji: '🚗' },
                                        { label: 'Streaming Wars', symbols: ['NFLX', 'DIS', 'WBD'], emoji: '🎬' },
                                        { label: 'Chip Giants', symbols: ['NVDA', 'AMD', 'INTC'], emoji: '🔧' },
                                        { label: 'Social Media', symbols: ['META', 'SNAP', 'PINS'], emoji: '📱' },
                                        { label: 'E-Commerce', symbols: ['AMZN', 'SHOP', 'EBAY'], emoji: '🛒' },
                                        { label: 'Finance', symbols: ['JPM', 'GS', 'BAC'], emoji: '🏦' },
                                        { label: 'Cloud & SaaS', symbols: ['CRM', 'NOW', 'SNOW'], emoji: '☁️' },
                                        { label: 'Healthcare', symbols: ['JNJ', 'PFE', 'UNH'], emoji: '💊' },
                                    ].map((group) => (
                                        <button
                                            key={group.label}
                                            onClick={() => loadStocks(group.symbols)}
                                            className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-teal-400 dark:hover:border-teal-500 hover:bg-teal-50 dark:hover:bg-teal-900/10 transition-all group text-left"
                                        >
                                            <span className="text-2xl">{group.emoji}</span>
                                            <div>
                                                <p className="font-semibold text-slate-900 dark:text-white text-sm group-hover:text-teal-600">{group.label}</p>
                                                <p className="text-xs text-slate-400">{group.symbols.join(' vs ')}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {!loading && stocks.length > 0 && (
                            <>
                                {/* Tabs - Full Width */}
                                <CompareTabs activeTab={activeTab} onTabChange={setActiveTab} />

                                {/* Tab Content + AI Widget - 2 Column Layout */}
                                <div className="flex gap-3 mt-3">
                                    {/* Main Tab Content */}
                                    <div className="flex-1 min-w-0">
                                        {renderTabContent()}
                                    </div>

                                    {/* Right Column: AI Widget (Desktop only) */}
                                    <AIColumnWrapper>
                                        <div className="sticky top-[130px]">
                                            <AIAnalysisPanel
                                                title="Comparison Analysis"
                                                pageType="comparison"
                                                pageData={{
                                                    stockCount: stocks.length,
                                                    period: period,
                                                    stocks: stocks.map(s => ({
                                                        symbol: s.symbol,
                                                        name: s.name,
                                                        price: s.price,
                                                        changePercent: s.changePercent,
                                                        marketCap: s.marketCap,
                                                        peRatio: s.peRatio,
                                                    }))
                                                }}
                                                autoAnalyze={stocks.length > 0}
                                                quickPrompts={[
                                                    'Which stock is the best buy?',
                                                    'Compare valuations',
                                                    'Risk analysis'
                                                ]}
                                                className="h-fit"
                                            />
                                        </div>
                                    </AIColumnWrapper>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </main>

            {/* Floating AI Widget (Mobile/Tablet only) */}
            <div className="xl:hidden">
                <AIWidget
                    type="floating"
                    position="bottom-right"
                    pageType="stocks"
                    quickPrompts={["Compare these stocks"]}
                />
            </div>

            {showUpgradeModal && (
                <UpgradeModal
                    isOpen={showUpgradeModal}
                    onClose={() => setShowUpgradeModal(false)}
                    message="You have reached your daily comparison limit. Upgrade to Pro for unlimited stock comparisons."
                    featureKey="comparison_limit"
                />
            )}
        </div>
    );
}

// Wrapper with Suspense boundary for useSearchParams
export default function StockComparePage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-slate-900">
                <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
            </div>
        }>
            <StockCompareContent />
        </Suspense>
    );
}
