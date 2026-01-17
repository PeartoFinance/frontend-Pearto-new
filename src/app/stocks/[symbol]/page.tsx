'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/layout/Sidebar';
import TickerTape from '@/components/layout/TickerTape';
import Header from '@/components/layout/Header';
import StockHeader from '@/components/stocks/StockHeader';
import StockChart from '@/components/stocks/StockChart';
import StockStats from '@/components/stocks/StockStats';
import { AIWidget } from '@/components/ai';
import {
    getStockProfile,
    getStockHistory,
    type MarketStock,
    type StockHistoryResponse
} from '@/services/marketService';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';

type Period = '1d' | '5d' | '1mo' | '3mo' | '6mo' | '1y' | '5y';

export default function StockDetailPage() {
    const params = useParams();
    const symbol = (params?.symbol as string)?.toUpperCase() || '';

    const [stock, setStock] = useState<MarketStock | null>(null);
    const [history, setHistory] = useState<StockHistoryResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [chartLoading, setChartLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [period, setPeriod] = useState<Period>('1mo');

    const loadStock = useCallback(async () => {
        if (!symbol) return;

        setLoading(true);
        setError(null);

        try {
            const [profileData, historyData] = await Promise.all([
                getStockProfile(symbol),
                getStockHistory(symbol, period, period === '1d' ? '5m' : '1d'),
            ]);

            setStock(profileData);
            setHistory(historyData);
        } catch (err) {
            console.error('Failed to load stock:', err);
            setError('Failed to load stock data. The symbol may be invalid.');
        } finally {
            setLoading(false);
        }
    }, [symbol, period]);

    const loadHistory = useCallback(async (newPeriod: Period) => {
        if (!symbol) return;

        setPeriod(newPeriod);
        setChartLoading(true);

        try {
            const interval = newPeriod === '1d' ? '5m' : newPeriod === '5d' ? '15m' : '1d';
            const historyData = await getStockHistory(symbol, newPeriod, interval);
            setHistory(historyData);
        } catch (err) {
            console.error('Failed to load history:', err);
        } finally {
            setChartLoading(false);
        }
    }, [symbol]);

    useEffect(() => {
        loadStock();
    }, [loadStock]);

    const periods: { id: Period; label: string }[] = [
        { id: '1d', label: '1D' },
        { id: '5d', label: '5D' },
        { id: '1mo', label: '1M' },
        { id: '3mo', label: '3M' },
        { id: '6mo', label: '6M' },
        { id: '1y', label: '1Y' },
        { id: '5y', label: '5Y' },
    ];

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-slate-900">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
                {/* Fixed Header */}
                <div className="fixed top-0 right-0 left-0 lg:left-64 z-40 bg-gray-50 dark:bg-slate-900">
                    <TickerTape />
                    <Header />
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 pt-[112px] md:pt-[120px] overflow-x-hidden">
                    <div className="p-4 lg:p-6 space-y-6 w-full max-w-7xl mx-auto">
                        {/* Back Button */}
                        <Link
                            href="/stocks"
                            className="inline-flex items-center gap-2 text-slate-500 hover:text-emerald-600 transition-colors"
                        >
                            <ArrowLeft size={18} />
                            <span>Back to Stocks</span>
                        </Link>

                        {/* Loading State */}
                        {loading && (
                            <div className="flex items-center justify-center py-20">
                                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                            </div>
                        )}

                        {/* Error State */}
                        {error && !loading && (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
                                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                                <h2 className="text-xl font-semibold text-red-700 dark:text-red-400 mb-2">
                                    Stock Not Found
                                </h2>
                                <p className="text-red-600 dark:text-red-300">{error}</p>
                                <Link
                                    href="/stocks"
                                    className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
                                >
                                    <ArrowLeft size={16} />
                                    Browse Stocks
                                </Link>
                            </div>
                        )}

                        {/* Stock Content */}
                        {stock && !loading && (
                            <>
                                {/* Stock Header */}
                                <StockHeader stock={stock} />

                                {/* Chart Section */}
                                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 lg:p-6 shadow-sm">
                                    {/* Chart Header */}
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                                        <div>
                                            <h3 className="text-xl font-bold text-blue-600 dark:text-blue-400">
                                                Technical Chart
                                            </h3>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                                                Interactive price chart with quick indicators
                                            </p>
                                        </div>

                                        {/* Period Selector */}
                                        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                                            {periods.map((p) => (
                                                <button
                                                    key={p.id}
                                                    onClick={() => loadHistory(p.id)}
                                                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition ${period === p.id
                                                            ? 'bg-blue-600 text-white shadow-sm'
                                                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700'
                                                        }`}
                                                >
                                                    {p.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Chart */}
                                    <StockChart
                                        data={history?.data || []}
                                        loading={chartLoading}
                                        symbol={symbol}
                                    />
                                </div>

                                {/* Stats Section */}
                                <StockStats stock={stock} />

                                {/* Company Description */}
                                {stock.description && (
                                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4 lg:p-6">
                                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
                                            About {stock.name}
                                        </h3>
                                        <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                                            {stock.description}
                                        </p>
                                        {stock.website && (
                                            <a
                                                href={stock.website}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-block mt-3 text-emerald-600 hover:text-emerald-500 text-sm font-medium"
                                            >
                                                Visit Website →
                                            </a>
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </main>

            {/* Floating AI Widget */}
            <AIWidget
                type="floating"
                position="bottom-right"
                pageType="stocks"
                pageData={{ symbol }}
                quickPrompts={[`Analyze ${symbol}`, `${symbol} price prediction`]}
            />
        </div>
    );
}
