'use client';

import { useEffect, useState, useCallback, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/layout/Sidebar';
import TickerTape from '@/components/layout/TickerTape';
import Header from '@/components/layout/Header';
import { AIWidget } from '@/components/ai';
import { AIAnalysisPanel } from '@/components/ai/AIAnalysisPanel';
import {
    getStockProfile,
    getStockHistory,
    searchStocks,
    type MarketStock,
    type PriceHistoryPoint
} from '@/services/marketService';
import { createChart, ColorType, LineSeries, type IChartApi } from 'lightweight-charts';
import {
    ArrowLeft, Loader2, Search, Plus, X, TrendingUp, TrendingDown
} from 'lucide-react';

interface CompareStock extends MarketStock {
    color: string;
    data: PriceHistoryPoint[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

function StockCompareContent() {
    const searchParams = useSearchParams();
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);

    const [stocks, setStocks] = useState<CompareStock[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<MarketStock[]>([]);
    const [searching, setSearching] = useState(false);
    const [period, setPeriod] = useState('1mo');
    const [isDark, setIsDark] = useState(false);

    // Detect dark mode
    useEffect(() => {
        const checkDarkMode = () => {
            setIsDark(document.documentElement.classList.contains('dark'));
        };
        checkDarkMode();
        const observer = new MutationObserver(checkDarkMode);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);

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
                        getStockHistory(symbol, period, period === '1d' ? '5m' : '1d')
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
            const interval = newPeriod === '1d' ? '5m' : newPeriod === '5d' ? '15m' : '1d';
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

    // Draw chart
    useEffect(() => {
        if (!chartContainerRef.current || stocks.length === 0) return;

        // Remove existing chart
        if (chartRef.current) {
            chartRef.current.remove();
            chartRef.current = null;
        }

        const container = chartContainerRef.current;
        const chart = createChart(container, {
            layout: {
                background: { type: ColorType.Solid, color: 'transparent' },
                textColor: isDark ? '#94a3b8' : '#64748b',
                attributionLogo: false,
            },
            grid: {
                vertLines: { color: isDark ? '#1e293b' : '#f1f5f9' },
                horzLines: { color: isDark ? '#1e293b' : '#f1f5f9' },
            },
            width: container.clientWidth,
            height: 400,
            rightPriceScale: {
                borderColor: isDark ? '#334155' : '#e2e8f0',
                scaleMargins: { top: 0.1, bottom: 0.1 },
            },
            timeScale: {
                borderColor: isDark ? '#334155' : '#e2e8f0',
                timeVisible: true,
            },
        });

        chartRef.current = chart;

        // Normalize prices to percentage change for comparison
        stocks.forEach((stock) => {
            if (stock.data.length === 0) return;

            // Deduplicate data
            const dataMap = new Map<string, PriceHistoryPoint>();
            stock.data.forEach(d => dataMap.set(d.date, d));
            const sortedData = Array.from(dataMap.values())
                .sort((a, b) => a.date.localeCompare(b.date));

            const firstPrice = sortedData[0]?.close || 1;

            const series = chart.addSeries(LineSeries, {
                color: stock.color,
                lineWidth: 2,
                title: stock.symbol,
            });

            const normalizedData = sortedData
                .filter(d => d.close != null)
                .map(d => ({
                    time: d.date,
                    value: ((d.close! - firstPrice) / firstPrice) * 100,
                }));

            series.setData(normalizedData as any);
        });

        chart.timeScale().fitContent();

        // Handle resize
        const handleResize = () => {
            if (chartContainerRef.current && chartRef.current) {
                chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
            }
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            if (chartRef.current) {
                chartRef.current.remove();
                chartRef.current = null;
            }
        };
    }, [stocks, isDark]);

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

    // Add stock
    const addStock = async (stock: MarketStock) => {
        if (stocks.length >= 5) return;

        setLoading(true);
        try {
            const interval = period === '1d' ? '5m' : period === '5d' ? '15m' : '1d';
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

    // Format helpers
    const formatNumber = (num: number | null | undefined, decimals = 2) => {
        if (num == null) return '-';
        return num.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    };

    const formatLargeNumber = (num: number | null | undefined) => {
        if (num == null) return '-';
        if (num >= 1e12) return `${(num / 1e12).toFixed(2)}T`;
        if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
        if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
        return num.toLocaleString();
    };

    const periods = [
        { id: '1d', label: '1D' },
        { id: '5d', label: '5D' },
        { id: '1mo', label: '1M' },
        { id: '3mo', label: '3M' },
        { id: '1y', label: '1Y' },
    ];

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-slate-900">
            <Sidebar />

            <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
                <div className="fixed top-0 right-0 left-0 lg:left-64 z-40 bg-gray-50 dark:bg-slate-900">
                    <TickerTape />
                    <Header />
                </div>

                <div className="flex-1 pt-[112px] md:pt-[120px] overflow-x-hidden">
                    <div className="p-4 lg:p-6 space-y-6 w-full max-w-7xl mx-auto">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <div>
                                <Link href="/stocks" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 mb-2 text-sm">
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
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium disabled:opacity-50"
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
                                            <button className="flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded text-sm">
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
                                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                            </div>
                        )}

                        {!loading && stocks.length === 0 && (
                            <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                                <p className="text-slate-500">Search and add stocks to compare</p>
                            </div>
                        )}

                        {!loading && stocks.length > 0 && (
                            <>
                                {/* AI Comparison Analysis - Full Data */}
                                <AIAnalysisPanel
                                    title="Comparison Analysis"
                                    pageType="comparison"
                                    pageData={{
                                        stockCount: stocks.length,
                                        period: period,
                                        // All stocks with full data
                                        stocks: stocks.map(s => ({
                                            symbol: s.symbol,
                                            name: s.name,
                                            price: s.price,
                                            change: s.change,
                                            changePercent: s.changePercent,
                                            marketCap: s.marketCap,
                                            volume: s.volume,
                                            peRatio: s.peRatio,
                                            eps: s.eps,
                                            beta: s.beta,
                                            dividendYield: s.dividendYield,
                                            high52w: s.high52w,
                                            low52w: s.low52w,
                                            sector: s.sector,
                                            industry: s.industry,
                                            dataPoints: s.data?.length || 0
                                        }))
                                    }}
                                    autoAnalyze={stocks.length > 0}
                                    quickPrompts={[
                                        'Which stock is the best buy?',
                                        'Compare valuations',
                                        'Risk analysis'
                                    ]}
                                    className="mb-5"
                                />

                                {/* Chart Section */}
                                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                                            Price Performance (% Change)
                                        </h3>
                                        <div className="flex gap-1">
                                            {periods.map((p) => (
                                                <button
                                                    key={p.id}
                                                    onClick={() => refreshHistory(p.id)}
                                                    className={`px-3 py-1.5 text-sm font-medium rounded-lg transition ${period === p.id
                                                        ? 'bg-blue-600 text-white'
                                                        : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                                                        }`}
                                                >
                                                    {p.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div ref={chartContainerRef} className="w-full h-[400px]" />

                                    {/* Legend */}
                                    <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                                        {stocks.map((stock) => (
                                            <div key={stock.symbol} className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: stock.color }} />
                                                <span className="text-sm font-medium text-slate-900 dark:text-white">{stock.symbol}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Comparison Table */}
                                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                                    <div className="p-5 border-b border-slate-200 dark:border-slate-700">
                                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                                            Detailed Comparison
                                        </h3>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="bg-slate-50 dark:bg-slate-800/50">
                                                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-500">Metric</th>
                                                    {stocks.map((stock) => (
                                                        <th key={stock.symbol} className="text-right py-3 px-4 text-sm font-semibold" style={{ color: stock.color }}>
                                                            {stock.symbol}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                                <tr>
                                                    <td className="py-3 px-4 text-sm text-slate-500">Price</td>
                                                    {stocks.map((s) => (
                                                        <td key={s.symbol} className="py-3 px-4 text-right text-sm font-semibold text-slate-900 dark:text-white">
                                                            ${formatNumber(s.price)}
                                                        </td>
                                                    ))}
                                                </tr>
                                                <tr>
                                                    <td className="py-3 px-4 text-sm text-slate-500">Change</td>
                                                    {stocks.map((s) => (
                                                        <td key={s.symbol} className={`py-3 px-4 text-right text-sm font-medium ${s.changePercent >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                                            {s.changePercent >= 0 ? '+' : ''}{formatNumber(s.changePercent)}%
                                                        </td>
                                                    ))}
                                                </tr>
                                                <tr>
                                                    <td className="py-3 px-4 text-sm text-slate-500">Market Cap</td>
                                                    {stocks.map((s) => (
                                                        <td key={s.symbol} className="py-3 px-4 text-right text-sm text-slate-900 dark:text-white">
                                                            {formatLargeNumber(s.marketCap)}
                                                        </td>
                                                    ))}
                                                </tr>
                                                <tr>
                                                    <td className="py-3 px-4 text-sm text-slate-500">Volume</td>
                                                    {stocks.map((s) => (
                                                        <td key={s.symbol} className="py-3 px-4 text-right text-sm text-slate-900 dark:text-white">
                                                            {formatLargeNumber(s.volume)}
                                                        </td>
                                                    ))}
                                                </tr>
                                                <tr>
                                                    <td className="py-3 px-4 text-sm text-slate-500">P/E Ratio</td>
                                                    {stocks.map((s) => (
                                                        <td key={s.symbol} className="py-3 px-4 text-right text-sm text-slate-900 dark:text-white">
                                                            {formatNumber(s.peRatio)}
                                                        </td>
                                                    ))}
                                                </tr>
                                                <tr>
                                                    <td className="py-3 px-4 text-sm text-slate-500">EPS</td>
                                                    {stocks.map((s) => (
                                                        <td key={s.symbol} className="py-3 px-4 text-right text-sm text-slate-900 dark:text-white">
                                                            ${formatNumber(s.eps)}
                                                        </td>
                                                    ))}
                                                </tr>
                                                <tr>
                                                    <td className="py-3 px-4 text-sm text-slate-500">Beta</td>
                                                    {stocks.map((s) => (
                                                        <td key={s.symbol} className="py-3 px-4 text-right text-sm text-slate-900 dark:text-white">
                                                            {formatNumber(s.beta)}
                                                        </td>
                                                    ))}
                                                </tr>
                                                <tr>
                                                    <td className="py-3 px-4 text-sm text-slate-500">52W High</td>
                                                    {stocks.map((s) => (
                                                        <td key={s.symbol} className="py-3 px-4 text-right text-sm text-slate-900 dark:text-white">
                                                            ${formatNumber(s.high52w)}
                                                        </td>
                                                    ))}
                                                </tr>
                                                <tr>
                                                    <td className="py-3 px-4 text-sm text-slate-500">52W Low</td>
                                                    {stocks.map((s) => (
                                                        <td key={s.symbol} className="py-3 px-4 text-right text-sm text-slate-900 dark:text-white">
                                                            ${formatNumber(s.low52w)}
                                                        </td>
                                                    ))}
                                                </tr>
                                                <tr>
                                                    <td className="py-3 px-4 text-sm text-slate-500">Dividend Yield</td>
                                                    {stocks.map((s) => (
                                                        <td key={s.symbol} className="py-3 px-4 text-right text-sm text-slate-900 dark:text-white">
                                                            {s.dividendYield ? `${(s.dividendYield * 100).toFixed(2)}%` : '-'}
                                                        </td>
                                                    ))}
                                                </tr>
                                                <tr>
                                                    <td className="py-3 px-4 text-sm text-slate-500">Sector</td>
                                                    {stocks.map((s) => (
                                                        <td key={s.symbol} className="py-3 px-4 text-right text-sm text-slate-900 dark:text-white">
                                                            {s.sector || '-'}
                                                        </td>
                                                    ))}
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </main>

            <AIWidget
                type="floating"
                position="bottom-right"
                pageType="stocks"
                quickPrompts={["Compare these stocks"]}
            />
        </div>
    );
}

// Wrapper with Suspense boundary for useSearchParams
export default function StockComparePage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-slate-900">
                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
            </div>
        }>
            <StockCompareContent />
        </Suspense>
    );
}
