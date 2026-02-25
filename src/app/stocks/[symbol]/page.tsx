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
import { AIColumnWrapper } from '@/components/ai/AIColumnWrapper';
import PriceDisplay from '@/components/common/PriceDisplay';
import {
    StockTabs,
    MarketIssuesBanner,
    FinancialsTab,
    ChartTab,
    HistoryTab,
    DividendsTab,
    ForecastTab,
    ProfileTab,
    NewsTab,
    type TabId
} from '@/components/stocks/tabs';
import {
    getStockProfile,
    getStockHistory,
    type MarketStock,
    type StockHistoryResponse,
    type MarketIssue,
    type NewsArticle
} from '@/services/marketService';
import { getNewsByStock } from '@/services/newsService';
import {
    ArrowLeft, Loader2, AlertCircle, TrendingUp, TrendingDown,
    Globe, Building2, Star, BarChart2, ExternalLink, Newspaper, Clock, Activity
} from 'lucide-react';
import RiskAnalysisWidget from '@/components/stocks/RiskAnalysisWidget';
import { addToWatchlist, removeFromWatchlist } from '@/services/portfolioService';
import { useWatchlist, portfolioQueryKeys } from '@/hooks/usePortfolioData';
import { useQueryClient } from '@tanstack/react-query';

type Period = '1m' | '1d' | '5d' | '1mo' | '3mo' | '6mo' | '1y' | '5y';

const INTERVAL_MAP: Record<string, string> = {
    '1m': '1m', '1d': '5m', '2d': '5m', '5d': '15m', '1mo': '90m',
    '3mo': '1d', '6mo': '1d', 'ytd': '1d', '1y': '1d', '3y': '1wk', '5y': '1wk', 'max': '1mo',
};

interface StockWithExtras extends MarketStock {
    marketIssues?: MarketIssue[];
    news?: NewsArticle[];
}

// Main export
export default function StockDetailPage() {
    return <StockDetailContent />;
}

// This component handles stock detail
function StockDetailContent() {
    const params = useParams();
    const symbol = (params?.symbol as string)?.toUpperCase() || '';

    const [stock, setStock] = useState<StockWithExtras | null>(null);
    const [history, setHistory] = useState<StockHistoryResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [chartLoading, setChartLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [period, setPeriod] = useState<Period>('1d');
    const [news, setNews] = useState<NewsArticle[]>([]);
    const [newsLoading, setNewsLoading] = useState(false);
    const [showCompareModal, setShowCompareModal] = useState(false);
    const [activeTab, setActiveTab] = useState<TabId>('overview');

    const queryClient = useQueryClient();
    const { data: watchlistItems = [] } = useWatchlist();
    const isInWatchlist = watchlistItems.some((item: any) => item.symbol?.toUpperCase() === symbol);
    const [watchlistLoading, setWatchlistLoading] = useState(false);

    const handleWatchlistToggle = async () => {
        if (watchlistLoading) return;
        setWatchlistLoading(true);
        try {
            if (isInWatchlist) {
                await removeFromWatchlist(symbol);
            } else {
                await addToWatchlist(symbol);
            }
            queryClient.invalidateQueries({ queryKey: portfolioQueryKeys.watchlist() });
        } catch (err) {
            console.error('Watchlist toggle failed:', err);
        } finally {
            setWatchlistLoading(false);
        }
    };

    const loadStock = useCallback(async () => {
        if (!symbol) return;

        setLoading(true);
        setError(null);

        try {
            const [profileData, historyData] = await Promise.all([
                getStockProfile(symbol),
                getStockHistory(symbol, period, INTERVAL_MAP[period] || '1d'),
            ]);

            setStock(profileData);
            setHistory(historyData);

            if (profileData.news) {
                setNews(profileData.news);
            } else {
                try {
                    setNewsLoading(true);
                    const newsData = await getNewsByStock(symbol, 6);
                    setNews(newsData.items || []);
                } catch (e) {
                    console.error('Failed to load news:', e);
                } finally {
                    setNewsLoading(false);
                }
            }
        } catch (err: any) {
            console.error('Failed to load stock:', err);
            if (err?.status === 404) {
                setError('This symbol does not exist or is not supported.');
            } else if (err?.status === 0) {
                setError('Unable to connect to the server. Please check your connection and try again.');
            } else {
                setError('Something went wrong loading stock data. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    }, [symbol, period]);

    const loadHistory = useCallback(async (newPeriod: Period) => {
        if (!symbol) return;

        setPeriod(newPeriod);
        setChartLoading(true);

        try {
            const interval = INTERVAL_MAP[newPeriod] || '1d';
            const historyData = await getStockHistory(symbol, newPeriod, interval);
            setHistory(historyData);
        } catch (err) {
            console.error('Failed to load history:', err);
        } finally {
            setChartLoading(false);
        }
    }, [symbol]);

    // Refresh on load or period change
    useEffect(() => {
        loadStock();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [symbol, period]);

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

    const isPositive = (stock?.changePercent ?? 0) >= 0;

    // Render tab content
    const renderTabContent = () => {
        if (!stock) return null;

        switch (activeTab) {
            case 'overview':
                return (
                    <>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                            <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                                <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">
                                    Key Statistics
                                </h3>
                                <div className="space-y-2">
                                    {[
                                        { label: 'Market Cap', value: <PriceDisplay amount={stock.marketCap} options={{ notation: 'compact' }} /> },
                                        { label: 'Volume', value: formatLargeNumber(stock.volume) },
                                        { label: 'Avg Volume', value: formatLargeNumber(stock.avgVolume) },
                                        { label: 'Open', value: <PriceDisplay amount={stock.open} /> },
                                        { label: 'Previous Close', value: <PriceDisplay amount={stock.previousClose} /> },
                                        {
                                            label: "Day's Range",
                                            value: stock.dayLow && stock.dayHigh ? (
                                                <div className="flex gap-1">
                                                    <PriceDisplay amount={stock.dayLow} /> - <PriceDisplay amount={stock.dayHigh} />
                                                </div>
                                            ) : '-'
                                        },
                                        {
                                            label: '52-Week Range',
                                            value: stock.low52w && stock.high52w ? (
                                                <div className="flex gap-1">
                                                    <PriceDisplay amount={stock.low52w} /> - <PriceDisplay amount={stock.high52w} />
                                                </div>
                                            ) : '-'
                                        },
                                    ].map((item, i) => (
                                        <div key={i} className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                                            <span className="text-sm text-slate-500 dark:text-slate-400">{item.label}</span>
                                            <span className="text-sm font-medium text-slate-900 dark:text-white">{item.value as any}</span>
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
                                        { label: 'EPS (TTM)', value: stock.eps ? <PriceDisplay amount={stock.eps} /> : '-' },
                                        { label: 'Beta', value: formatNumber(stock.beta) },
                                        { label: 'Dividend Yield', value: stock.dividendYield ? formatPercent(stock.dividendYield) : '-' },
                                    ].map((item, i) => (
                                        <div key={i} className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                                            <span className="text-sm text-slate-500 dark:text-slate-400">{item.label}</span>
                                            <span className="text-sm font-medium text-slate-900 dark:text-white">{item.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="lg:col-span-2 space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Price Chart</span>
                                    <div className="flex items-center gap-2">
                                        <Link
                                            href={`/live?symbol=${symbol}&type=stock`}
                                            target="_blank"
                                            className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg transition"
                                        >
                                            <Activity size={12} />
                                            Live Chart
                                        </Link>
                                        <Link
                                            href={`/chart/${symbol}?type=stock`}
                                            target="_blank"
                                            className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition"
                                        >
                                            <ExternalLink size={12} />
                                            Advanced Chart
                                        </Link>
                                    </div>
                                </div>
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

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-5">
                            <div className="lg:col-span-1">
                                <RiskAnalysisWidget symbol={symbol} />
                            </div>

                            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5 h-full">
                                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
                                        About {stock.name}
                                    </h3>
                                    {stock.description ? (
                                        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-4">
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
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5 h-full">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                            <Newspaper size={18} className="text-blue-500" />
                                            Latest News
                                        </h3>
                                        <button
                                            onClick={() => setActiveTab('news')}
                                            className="text-sm text-blue-600 hover:text-blue-500"
                                        >
                                            View All →
                                        </button>
                                    </div>
                                    {news.length > 0 ? (
                                        <div className="space-y-3">
                                            {news.slice(0, 3).map((article) => (
                                                <a
                                                    key={article.id}
                                                    href={article.link || article.url || `/news/${article.slug}`}
                                                    className="block text-sm text-slate-600 dark:text-slate-300 hover:text-blue-600 transition line-clamp-1"
                                                >
                                                    • {article.title}
                                                </a>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-slate-400">No news available.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                );

            case 'financials':
                return <FinancialsTab symbol={symbol} />;

            case 'chart':
                return (
                    <ChartTab
                        symbol={symbol}
                        currentPrice={stock.price}
                        open={stock.open}
                        high={stock.dayHigh}
                        low={stock.dayLow}
                        previousClose={stock.previousClose}
                        volume={stock.volume}
                        change={stock.change}
                        changePercent={stock.changePercent}
                    />
                );

            case 'history':
                return <HistoryTab symbol={symbol} />;

            case 'dividends':
                return <DividendsTab symbol={symbol} />;

            case 'forecast':
                return <ForecastTab symbol={symbol} currentPrice={stock.price} />;

            case 'profile':
                return <ProfileTab stock={stock} />;

            case 'news':
                return <NewsTab symbol={symbol} news={news} loading={newsLoading} />;

            default:
                return null;
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

                <div className="flex-1 pt-[112px] md:pt-[120px] overflow-x-hidden lg:mt-12">
                    <div className="p-2 lg:p-3 space-y-3 w-full">
                        <Link
                            href="/stocks"
                            className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors text-sm"
                        >
                            <ArrowLeft size={16} />
                            <span>Back to Stocks</span>
                        </Link>

                        {loading && (
                            <div className="flex items-center justify-center py-20">
                                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                            </div>
                        )}

                        {error && !loading && (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-center">
                                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                                <h2 className="text-xl font-semibold text-red-700 dark:text-red-400 mb-2">
                                    {error.includes('does not exist') ? 'Symbol Not Found' : 'Error Loading Data'}
                                </h2>
                                <p className="text-red-600 dark:text-red-300">{error}</p>
                            </div>
                        )}

                        {stock && !loading && (
                            <>
                                {stock.marketIssues && stock.marketIssues.length > 0 && (
                                    <MarketIssuesBanner issues={stock.marketIssues} />
                                )}

                                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
                                        <div>
                                            <h1 className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-white">
                                                {stock.name} ({stock.symbol})
                                            </h1>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                                {stock.exchange} · Real-Time Price · {stock.currency || 'USD'}
                                            </p>
                                            <div className="flex items-baseline gap-3 mt-2">
                                                <span className="text-3xl font-bold text-slate-900 dark:text-white">
                                                    <PriceDisplay amount={stock.price} />
                                                </span>
                                                <div className={`flex items-center gap-1 text-base font-semibold ${isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
                                                    {isPositive ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                                                    <span>
                                                        {isPositive ? '+' : ''}{formatNumber(stock.change)} ({isPositive ? '+' : ''}{formatNumber(stock.changePercent)}%)
                                                    </span>
                                                </div>
                                            </div>
                                            <p className="text-xs text-slate-400 mt-1">
                                                Last updated: {stock.lastUpdated ? new Date(stock.lastUpdated).toLocaleString() : 'Just now'}
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={handleWatchlistToggle}
                                                disabled={watchlistLoading}
                                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition text-sm font-medium ${isInWatchlist
                                                    ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-900/50'
                                                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                                                    } ${watchlistLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                <Star size={14} className={isInWatchlist ? 'fill-current' : ''} />
                                                {watchlistLoading ? '...' : isInWatchlist ? 'Watching' : 'Watchlist'}
                                            </button>
                                            <button
                                                onClick={() => setShowCompareModal(true)}
                                                className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition text-sm font-medium"
                                            >
                                                <BarChart2 size={14} />
                                                Compare
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <StockTabs activeTab={activeTab} onTabChange={setActiveTab} />

                                <div className="flex gap-3">
                                    <div className="flex-1 min-w-0">
                                        {renderTabContent()}
                                    </div>

                                    <AIColumnWrapper>
                                        <div className="sticky top-[130px]">
                                            <AIAnalysisPanel
                                                title={`${symbol} Analysis`}
                                                pageType="stock-detail"
                                                pageData={{
                                                    symbol,
                                                    name: stock?.name,
                                                    price: stock?.price,
                                                    change: stock?.change,
                                                    changePercent: stock?.changePercent,
                                                    marketCap: stock?.marketCap,
                                                    peRatio: stock?.peRatio,
                                                }}
                                                quickPrompts={[
                                                    `Is ${symbol} undervalued?`,
                                                    'Technical analysis',
                                                    'Buy or sell recommendation'
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

            <div className="xl:hidden">
                <AIWidget
                    type="floating"
                    position="bottom-right"
                    pageType="stocks"
                    pageData={{ symbol }}
                    quickPrompts={[`Analyze ${symbol}`, `${symbol} price prediction`]}
                />
            </div>

            <StockCompareModal
                isOpen={showCompareModal}
                onClose={() => setShowCompareModal(false)}
                initialSymbol={symbol}
                initialStock={stock}
            />
        </div>
    );
}
