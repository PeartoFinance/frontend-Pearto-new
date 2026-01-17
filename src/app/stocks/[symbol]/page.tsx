'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/layout/Sidebar';
import TickerTape from '@/components/layout/TickerTape';
import Header from '@/components/layout/Header';
import { MultiChart } from '@/components/charts';
import StockCompareModal from '@/components/stocks/StockCompareModal';
import { AIWidget } from '@/components/ai';
import { AIAnalysisPanel } from '@/components/ai/AIAnalysisPanel';
import {
    getStockProfile,
    getStockHistory,
    type MarketStock,
    type StockHistoryResponse
} from '@/services/marketService';
import { getNewsByStock, type NewsArticle } from '@/services/newsService';
import {
    ArrowLeft, Loader2, AlertCircle, TrendingUp, TrendingDown,
    Globe, Building2, Star, BarChart2, ExternalLink, Newspaper, Clock
} from 'lucide-react';

type Period = '1d' | '5d' | '1mo' | '3mo' | '6mo' | '1y' | '5y';

export default function StockDetailPage() {
    const params = useParams();
    const symbol = (params?.symbol as string)?.toUpperCase() || '';

    const [stock, setStock] = useState<MarketStock | null>(null);
    const [history, setHistory] = useState<StockHistoryResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [chartLoading, setChartLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [period, setPeriod] = useState<Period>('1d');
    const [news, setNews] = useState<NewsArticle[]>([]);
    const [newsLoading, setNewsLoading] = useState(false);
    const [showCompareModal, setShowCompareModal] = useState(false);

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

            // Load news separately (don't block main load)
            try {
                setNewsLoading(true);
                const newsData = await getNewsByStock(symbol, 6);
                setNews(newsData.items || []);
            } catch (e) {
                console.error('Failed to load news:', e);
            } finally {
                setNewsLoading(false);
            }
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

    // Helper functions
    const formatNumber = (num: number | undefined | null, decimals = 2): string => {
        if (num == null) return '-';
        return num.toLocaleString(undefined, {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        });
    };

    const formatLargeNumber = (num: number | undefined | null): string => {
        if (num == null) return '-';
        if (num >= 1e12) return `${(num / 1e12).toFixed(2)}T`;
        if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
        if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
        if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
        return num.toLocaleString();
    };

    const formatPercent = (num: number | undefined | null): string => {
        if (num == null) return '-';
        return `${(num * 100).toFixed(2)}%`;
    };

    const periods: { id: Period; label: string }[] = [
        { id: '1d', label: '1 Day' },
        { id: '5d', label: '5 Days' },
        { id: '1mo', label: '1 Month' },
        { id: '3mo', label: 'YTD' },
        { id: '1y', label: '1 Year' },
        { id: '5y', label: '5 Years' },
    ];

    const isPositive = (stock?.changePercent ?? 0) >= 0;

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-slate-900">
            <Sidebar />

            <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
                <div className="fixed top-0 right-0 left-0 lg:left-64 z-40 bg-gray-50 dark:bg-slate-900">
                    <TickerTape />
                    <Header />
                </div>

                <div className="flex-1 pt-[112px] md:pt-[120px] overflow-x-hidden">
                    <div className="p-4 lg:p-6 space-y-5 w-full max-w-7xl mx-auto">
                        {/* Back Button */}
                        <Link
                            href="/stocks"
                            className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors text-sm"
                        >
                            <ArrowLeft size={16} />
                            <span>Back to Stocks</span>
                        </Link>

                        {/* Loading State */}
                        {loading && (
                            <div className="flex items-center justify-center py-20">
                                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
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
                            </div>
                        )}

                        {/* Stock Content */}
                        {stock && !loading && (
                            <>
                                {/* Company Header */}
                                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
                                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                                        {/* Left: Company Info */}
                                        <div>
                                            <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white">
                                                {stock.name} ({stock.symbol})
                                            </h1>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                                {stock.exchange} · Real-Time Price · {stock.currency || 'USD'}
                                            </p>

                                            {/* Price Row */}
                                            <div className="flex items-baseline gap-4 mt-3">
                                                <span className="text-4xl font-bold text-slate-900 dark:text-white">
                                                    ${formatNumber(stock.price)}
                                                </span>
                                                <div className={`flex items-center gap-1 text-lg font-semibold ${isPositive ? 'text-emerald-600' : 'text-red-500'
                                                    }`}>
                                                    {isPositive ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                                                    <span>
                                                        {isPositive ? '+' : ''}{formatNumber(stock.change)} ({isPositive ? '+' : ''}{formatNumber(stock.changePercent)}%)
                                                    </span>
                                                </div>
                                            </div>
                                            <p className="text-xs text-slate-400 mt-1">
                                                Last updated: {stock.lastUpdated ? new Date(stock.lastUpdated).toLocaleString() : 'Just now'}
                                            </p>
                                        </div>

                                        {/* Right: Action Buttons */}
                                        <div className="flex gap-2">
                                            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition text-sm font-medium">
                                                <Star size={16} />
                                                Watchlist
                                            </button>
                                            <button
                                                onClick={() => setShowCompareModal(true)}
                                                className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition text-sm font-medium"
                                            >
                                                <BarChart2 size={16} />
                                                Compare
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* AI Stock Analysis Panel - Full Data */}
                                <AIAnalysisPanel
                                    title={`${stock.symbol} Analysis`}
                                    pageType="stock-detail"
                                    pageData={{
                                        // Stock profile
                                        symbol: stock.symbol,
                                        name: stock.name,
                                        exchange: stock.exchange,
                                        currency: stock.currency,
                                        sector: stock.sector,
                                        industry: stock.industry,
                                        // Price data
                                        price: stock.price,
                                        change: stock.change,
                                        changePercent: stock.changePercent,
                                        open: stock.open,
                                        previousClose: stock.previousClose,
                                        dayHigh: stock.dayHigh,
                                        dayLow: stock.dayLow,
                                        high52w: stock.high52w,
                                        low52w: stock.low52w,
                                        // Volume
                                        volume: stock.volume,
                                        avgVolume: stock.avgVolume,
                                        // Fundamentals
                                        marketCap: stock.marketCap,
                                        peRatio: stock.peRatio,
                                        forwardPe: stock.forwardPe,
                                        eps: stock.eps,
                                        beta: stock.beta,
                                        dividendYield: stock.dividendYield,
                                        dividendRate: stock.dividendRate,
                                        priceToBook: stock.priceToBook,
                                        bookValue: stock.bookValue,
                                        sharesOutstanding: stock.sharesOutstanding,
                                        // History summary
                                        historyPeriod: period,
                                        historyPoints: history?.data?.length || 0,
                                        // Related news
                                        newsCount: news.length
                                    }}
                                    autoAnalyze={!!stock}
                                    quickPrompts={[
                                        `Is ${stock.symbol} undervalued?`,
                                        'Technical analysis',
                                        'Buy or sell recommendation'
                                    ]}
                                    className="mb-5"
                                />

                                {/* Main Content: Stats + Chart */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                                    {/* Left Column: Key Stats */}
                                    <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
                                        <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-4">
                                            Key Statistics
                                        </h3>

                                        <div className="space-y-3">
                                            {[
                                                { label: 'Market Cap', value: formatLargeNumber(stock.marketCap) },
                                                { label: 'Volume', value: formatLargeNumber(stock.volume) },
                                                { label: 'Avg Volume', value: formatLargeNumber(stock.avgVolume) },
                                                { label: 'Open', value: `$${formatNumber(stock.open)}` },
                                                { label: 'Previous Close', value: `$${formatNumber(stock.previousClose)}` },
                                                { label: "Day's Range", value: stock.dayLow && stock.dayHigh ? `$${formatNumber(stock.dayLow)} - $${formatNumber(stock.dayHigh)}` : '-' },
                                                { label: '52-Week Range', value: stock.low52w && stock.high52w ? `$${formatNumber(stock.low52w)} - $${formatNumber(stock.high52w)}` : '-' },
                                            ].map((item, i) => (
                                                <div key={i} className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                                                    <span className="text-sm text-slate-500 dark:text-slate-400">{item.label}</span>
                                                    <span className="text-sm font-medium text-slate-900 dark:text-white">{item.value}</span>
                                                </div>
                                            ))}
                                        </div>

                                        <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mt-6 mb-4">
                                            Fundamentals
                                        </h3>

                                        <div className="space-y-3">
                                            {[
                                                { label: 'P/E Ratio (TTM)', value: formatNumber(stock.peRatio) },
                                                { label: 'Forward P/E', value: formatNumber(stock.forwardPe) },
                                                { label: 'EPS (TTM)', value: stock.eps ? `$${formatNumber(stock.eps)}` : '-' },
                                                { label: 'Beta', value: formatNumber(stock.beta) },
                                                { label: 'Dividend Yield', value: stock.dividendYield ? formatPercent(stock.dividendYield) : '-' },
                                                { label: 'Dividend Rate', value: stock.dividendRate ? `$${formatNumber(stock.dividendRate)}` : '-' },
                                                { label: 'Shares Outstanding', value: formatLargeNumber(stock.sharesOutstanding) },
                                                { label: 'Book Value', value: stock.bookValue ? `$${formatNumber(stock.bookValue)}` : '-' },
                                                { label: 'Price/Book', value: formatNumber(stock.priceToBook) },
                                            ].map((item, i) => (
                                                <div key={i} className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                                                    <span className="text-sm text-slate-500 dark:text-slate-400">{item.label}</span>
                                                    <span className="text-sm font-medium text-slate-900 dark:text-white">{item.value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Right Column: Chart */}
                                    <div className="lg:col-span-2">
                                        <MultiChart
                                            data={history?.data?.map(d => ({
                                                date: d.date,
                                                open: d.open,
                                                high: d.high,
                                                low: d.low,
                                                close: d.close,
                                                volume: d.volume
                                            })) || []}
                                            period={period}
                                            onPeriodChange={(p) => loadHistory(p as Period)}
                                            loading={chartLoading}
                                            height={400}
                                            priceRange={stock.dayLow && stock.dayHigh ? { low: stock.dayLow, high: stock.dayHigh } : undefined}
                                            change={{ value: stock.change || 0, percent: stock.changePercent || 0 }}
                                            initialChartType="area"
                                        />
                                    </div>
                                </div>

                                {/* Company Info Section */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                                    {/* About */}
                                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
                                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
                                            About {stock.name}
                                        </h3>
                                        {stock.description ? (
                                            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-6">
                                                {stock.description}
                                            </p>
                                        ) : (
                                            <p className="text-sm text-slate-400">No description available.</p>
                                        )}

                                        <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                                            {stock.sector && (
                                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                                    <Building2 size={14} />
                                                    <span>{stock.sector}</span>
                                                </div>
                                            )}
                                            {stock.industry && (
                                                <span className="text-sm text-slate-400">• {stock.industry}</span>
                                            )}
                                            {stock.website && (
                                                <a
                                                    href={stock.website}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-500"
                                                >
                                                    <Globe size={14} />
                                                    <span>Website</span>
                                                    <ExternalLink size={12} />
                                                </a>
                                            )}
                                        </div>
                                    </div>

                                    {/* Quick Facts */}
                                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
                                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
                                            Quick Facts
                                        </h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                                                <p className="text-xs text-slate-500 uppercase">Exchange</p>
                                                <p className="text-sm font-semibold text-slate-900 dark:text-white mt-1">
                                                    {stock.exchange || '-'}
                                                </p>
                                            </div>
                                            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                                                <p className="text-xs text-slate-500 uppercase">Currency</p>
                                                <p className="text-sm font-semibold text-slate-900 dark:text-white mt-1">
                                                    {stock.currency || 'USD'}
                                                </p>
                                            </div>
                                            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                                                <p className="text-xs text-slate-500 uppercase">Sector</p>
                                                <p className="text-sm font-semibold text-slate-900 dark:text-white mt-1">
                                                    {stock.sector || '-'}
                                                </p>
                                            </div>
                                            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                                                <p className="text-xs text-slate-500 uppercase">Industry</p>
                                                <p className="text-sm font-semibold text-slate-900 dark:text-white mt-1 truncate">
                                                    {stock.industry || '-'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* News Section */}
                                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                            <Newspaper size={20} className="text-blue-500" />
                                            News
                                        </h3>
                                        <Link
                                            href={`/news?q=${symbol}`}
                                            className="text-sm text-blue-600 hover:text-blue-500"
                                        >
                                            View All →
                                        </Link>
                                    </div>

                                    {newsLoading && (
                                        <div className="flex justify-center py-8">
                                            <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                                        </div>
                                    )}

                                    {!newsLoading && news.length === 0 && (
                                        <p className="text-sm text-slate-500 text-center py-6">
                                            No news available for {stock.symbol}
                                        </p>
                                    )}

                                    {!newsLoading && news.length > 0 && (
                                        <div className="space-y-4">
                                            {news.map((article) => (
                                                <a
                                                    key={article.id}
                                                    href={article.link || article.url || `/news/${article.slug}`}
                                                    target={article.url ? '_blank' : '_self'}
                                                    rel={article.url ? 'noopener noreferrer' : ''}
                                                    className="flex gap-4 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition group"
                                                >
                                                    {article.image && (
                                                        <img
                                                            src={article.image}
                                                            alt=""
                                                            className="w-20 h-14 object-cover rounded-lg flex-shrink-0"
                                                        />
                                                    )}
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-slate-900 dark:text-white group-hover:text-blue-600 transition line-clamp-2">
                                                            {article.title}
                                                        </p>
                                                        <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                                                            <span>{article.source}</span>
                                                            {article.publishedAt && (
                                                                <>
                                                                    <span>•</span>
                                                                    <span className="flex items-center gap-1">
                                                                        <Clock size={10} />
                                                                        {new Date(article.publishedAt).toLocaleDateString()}
                                                                    </span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </a>
                                            ))}
                                        </div>
                                    )}
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
                pageData={{ symbol }}
                quickPrompts={[`Analyze ${symbol}`, `${symbol} price prediction`]}
            />

            {/* Compare Modal */}
            <StockCompareModal
                isOpen={showCompareModal}
                onClose={() => setShowCompareModal(false)}
                initialSymbol={symbol}
                initialStock={stock}
            />
        </div>
    );
}
