'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/layout/Sidebar';
import TickerTape from '@/components/layout/TickerTape';
import Header from '@/components/layout/Header';
import { AIAnalysisPanel } from '@/components/ai/AIAnalysisPanel';
import { getTopMovers, type MarketStock } from '@/services/marketService';
import PriceDisplay from '@/components/common/PriceDisplay';
import { createChart, ColorType, HistogramSeries, type IChartApi } from 'lightweight-charts';
import {
    ArrowLeft, TrendingUp, TrendingDown, Loader2, AlertCircle,
    RefreshCw, BarChart2, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { TableExportButton } from '@/components/common/TableExportButton';

type TabType = 'gainers' | 'losers' | 'active';

export default function MarketMoversPage() {
    const [activeTab, setActiveTab] = useState<TabType>('gainers');
    const [gainers, setGainers] = useState<MarketStock[]>([]);
    const [losers, setLosers] = useState<MarketStock[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getTopMovers('both', 50);
            setGainers(data.gainers || []);
            setLosers(data.losers || []);
            setError(false);
        } catch (err) {
            console.error('Failed to fetch market movers:', err);
            setError(true);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Chart for visualization
    useEffect(() => {
        if (!chartContainerRef.current || loading) return;

        const stocks = activeTab === 'gainers' ? gainers : losers;
        if (stocks.length === 0) return;

        // Remove existing chart
        if (chartRef.current) {
            chartRef.current.remove();
            chartRef.current = null;
        }

        const isDark = document.documentElement.classList.contains('dark');
        const container = chartContainerRef.current;

        const chart = createChart(container, {
            layout: {
                background: { type: ColorType.Solid, color: 'transparent' },
                textColor: isDark ? '#94a3b8' : '#64748b',
                attributionLogo: false,
            },
            grid: {
                vertLines: { visible: false },
                horzLines: { color: isDark ? 'rgba(255, 255, 255, 0.10)' : 'rgba(0, 0, 0, 0.08)' },
            },
            width: container.clientWidth,
            height: 250,
            rightPriceScale: {
                borderVisible: false,
            },
            timeScale: {
                visible: false,
            },
        });

        chartRef.current = chart;

        const series = chart.addSeries(HistogramSeries, {
            color: activeTab === 'gainers' ? '#10b981' : '#ef4444',
        });

        const chartData = stocks.slice(0, 15).map((stock, index) => ({
            time: index as any,
            value: Math.abs(stock.changePercent || 0),
            color: (stock.changePercent || 0) >= 0 ? '#10b981' : '#ef4444',
        }));

        series.setData(chartData);
        chart.timeScale().fitContent();

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
    }, [activeTab, gainers, losers, loading]);

    const currentStocks = activeTab === 'gainers' ? gainers : losers;

    // Stats
    const avgChange = currentStocks.length > 0
        ? currentStocks.reduce((sum, s) => sum + Math.abs(s.changePercent || 0), 0) / currentStocks.length
        : 0;
    const maxChange = currentStocks.length > 0
        ? Math.max(...currentStocks.map(s => Math.abs(s.changePercent || 0)))
        : 0;
    const totalVolume = currentStocks.reduce((sum, s) => sum + (s.volume || 0), 0);

    const formatNumber = (num: number | null | undefined, decimals = 2) => {
        if (num == null) return '-';
        return num.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    };

    const formatLargeNumber = (num: number | null | undefined) => {
        if (num == null) return '-';
        if (num >= 1e12) return `${(num / 1e12).toFixed(2)}T`;
        if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
        if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
        if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
        return num.toLocaleString();
    };

    const tabs: { id: TabType; label: string; icon: React.ReactNode; color: string }[] = [
        { id: 'gainers', label: 'Top Gainers', icon: <TrendingUp size={16} />, color: 'text-emerald-500' },
        { id: 'losers', label: 'Top Losers', icon: <TrendingDown size={16} />, color: 'text-red-500' },
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
                        {/* Back Link */}
                        <Link href="/markets" className="inline-flex items-center gap-2 text-slate-500 hover:text-emerald-500 text-sm">
                            <ArrowLeft size={16} />
                            Back to Markets
                        </Link>

                        {/* Header */}
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                    <BarChart2 className="w-7 h-7 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                                        Market Movers
                                    </h1>
                                    <p className="text-slate-500">Today's biggest gainers and losers</p>
                                </div>
                            </div>
                            <button
                                onClick={fetchData}
                                disabled={loading}
                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                            >
                                <RefreshCw size={18} className={`text-slate-500 ${loading ? 'animate-spin' : ''}`} />
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex gap-2 bg-white dark:bg-slate-800 rounded-xl p-1 border border-slate-200 dark:border-slate-700 w-fit">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition ${activeTab === tab.id
                                        ? `bg-slate-100 dark:bg-slate-700 ${tab.color}`
                                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                        }`}
                                >
                                    {tab.icon}
                                    {tab.label}
                                    <span className="ml-1 px-1.5 py-0.5 text-xs bg-slate-200 dark:bg-slate-600 rounded">
                                        {tab.id === 'gainers' ? gainers.length : losers.length}
                                    </span>
                                </button>
                            ))}
                        </div>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                                <p className="text-sm text-slate-500 mb-1">Total Stocks</p>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">{currentStocks.length}</p>
                            </div>
                            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                                <p className="text-sm text-slate-500 mb-1">Avg Change</p>
                                <p className={`text-2xl font-bold ${activeTab === 'gainers' ? 'text-emerald-500' : 'text-red-500'}`}>
                                    {activeTab === 'gainers' ? '+' : '-'}{formatNumber(avgChange)}%
                                </p>
                            </div>
                            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                                <p className="text-sm text-slate-500 mb-1">Max Change</p>
                                <p className={`text-2xl font-bold ${activeTab === 'gainers' ? 'text-emerald-500' : 'text-red-500'}`}>
                                    {activeTab === 'gainers' ? '+' : '-'}{formatNumber(maxChange)}%
                                </p>
                            </div>
                            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                                <p className="text-sm text-slate-500 mb-1">Total Volume</p>
                                <p className="text-2xl font-bold text-blue-500">{formatLargeNumber(totalVolume)}</p>
                            </div>
                        </div>

                        {/* Chart */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                                {activeTab === 'gainers' ? 'Top Gainers' : 'Top Losers'} Performance
                            </h3>
                            <div ref={chartContainerRef} className="w-full h-[250px]" />
                            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                                {currentStocks.slice(0, 10).map((stock) => (
                                    <Link
                                        key={stock.symbol}
                                        href={`/stocks/${stock.symbol}`}
                                        className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded hover:bg-slate-200 dark:hover:bg-slate-600 transition"
                                    >
                                        {stock.symbol}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* AI Analysis */}
                        <AIAnalysisPanel
                            title={`${activeTab === 'gainers' ? 'Gainers' : 'Losers'} Analysis`}
                            pageType="market-movers"
                            pageData={{
                                type: activeTab,
                                count: currentStocks.length,
                                avgChange,
                                maxChange,
                                totalVolume,
                                stocks: currentStocks.slice(0, 15).map(s => ({
                                    symbol: s.symbol,
                                    name: s.name,
                                    price: s.price,
                                    change: s.change,
                                    changePercent: s.changePercent,
                                    volume: s.volume,
                                    marketCap: s.marketCap
                                }))
                            }}
                            autoAnalyze={currentStocks.length > 0}
                            quickPrompts={[
                                activeTab === 'gainers' ? 'Why are these gaining?' : 'Why are these falling?',
                                'Any buying opportunities?',
                                'Market sentiment'
                            ]}
                        />

                        {/* Data Table */}
                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                            </div>
                        ) : error ? (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-8 text-center">
                                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                                <p className="text-red-600 dark:text-red-400">Failed to load market data</p>
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                                <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-between">
                                    <h3 className="font-semibold text-slate-900 dark:text-white">
                                        {activeTab === 'gainers' ? 'Top Gainers' : 'Top Losers'}
                                    </h3>
                                    <TableExportButton
                                        data={currentStocks}
                                        columns={[
                                            { key: 'symbol', label: 'Symbol' },
                                            { key: 'name', label: 'Company' },
                                            { key: 'price', label: 'Price', format: 'currency' },
                                            { key: 'change', label: 'Change', format: 'currency' },
                                            { key: 'changePercent', label: 'Change %', format: 'percent' },
                                            { key: 'volume', label: 'Volume', format: 'largeNumber' },
                                            { key: 'marketCap', label: 'Market Cap', format: 'largeNumber' },
                                        ]}
                                        filename={`market-${activeTab}`}
                                        title={`Market ${activeTab === 'gainers' ? 'Gainers' : 'Losers'}`}
                                        variant="compact"
                                    />
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                                                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">#</th>
                                                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Symbol</th>
                                                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Company</th>
                                                <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Price</th>
                                                <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Change</th>
                                                <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">% Change</th>
                                                <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Volume</th>
                                                <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Market Cap</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                            {currentStocks.map((stock, index) => {
                                                const isPositive = (stock.changePercent || 0) >= 0;
                                                return (
                                                    <tr key={stock.symbol} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                                        <td className="px-4 py-4 text-slate-500 font-medium">{index + 1}</td>
                                                        <td className="px-4 py-4">
                                                            <Link href={`/stocks/${stock.symbol}`} className="flex items-center gap-3 hover:underline">
                                                                <span className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold ${isPositive
                                                                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                                                                    : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                                                                    }`}>
                                                                    {stock.symbol.slice(0, 2)}
                                                                </span>
                                                                <span className={`font-semibold ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                                                                    {stock.symbol}
                                                                </span>
                                                            </Link>
                                                        </td>
                                                        <td className="px-4 py-4 text-slate-600 dark:text-slate-300 max-w-[200px] truncate">
                                                            {stock.name || '-'}
                                                        </td>
                                                        <td className="text-right px-4 py-4 font-semibold text-slate-900 dark:text-white">
                                                            <PriceDisplay amount={stock.price} />
                                                        </td>
                                                        <td className={`text-right px-4 py-4 font-medium ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                                                            {isPositive ? '+' : ''}<PriceDisplay amount={Math.abs(stock.change || 0)} showSymbol={false} />
                                                        </td>
                                                        <td className="text-right px-4 py-4">
                                                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-bold ${isPositive
                                                                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                                                                : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                                                                }`}>
                                                                {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                                                {isPositive ? '+' : ''}{formatNumber(stock.changePercent)}%
                                                            </span>
                                                        </td>
                                                        <td className="text-right px-4 py-4 text-slate-600 dark:text-slate-300">
                                                            {formatLargeNumber(stock.volume)}
                                                        </td>
                                                        <td className="text-right px-4 py-4 text-slate-600 dark:text-slate-300">
                                                            <PriceDisplay amount={stock.marketCap} options={{ notation: 'compact' }} />
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                {currentStocks.length === 0 && (
                                    <div className="text-center py-12 text-slate-500">
                                        No data available
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
