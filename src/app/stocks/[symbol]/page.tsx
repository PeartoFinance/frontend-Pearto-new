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
    Globe, Building2, Star, BarChart2, ExternalLink, Newspaper, Clock
} from 'lucide-react';

type Period = '1m' | '1d' | '5d' | '1mo' | '3mo' | '6mo' | '1y' | '5y';

interface StockWithExtras extends MarketStock {
    marketIssues?: MarketIssue[];
    news?: NewsArticle[];
}

export default function StockDetailPage() {
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

            // Set news from profile response if available
            if (profileData.news) {
                setNews(profileData.news);
            } else {
                // Fallback: Load news separately
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
            const interval = newPeriod === '1m' ? '1m' : newPeriod === '1d' ? '5m' : newPeriod === '5d' ? '15m' : '1d';
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

    const isPositive = (stock?.changePercent ?? 0) >= 0;

    // Format ISO date to yyyy-mm-dd for MultiChart
    const formatChartDate = (dateStr: string): string => {
        if (!dateStr) return '';
        return dateStr.split('T')[0];
    };

    // Render tab content based on active tab
    const renderTabContent = () => {
        if (!stock) return null;

        switch (activeTab) {
            case 'overview':
                return (
                    <>
                        {/* Stats + Chart Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                            {/* Key Stats */}
                            <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                                <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">
                                    Key Statistics
                                </h3>
                                <div className="space-y-2">
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
                                    ].map((item, i) => (
                                        <div key={i} className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                                            <span className="text-sm text-slate-500 dark:text-slate-400">{item.label}</span>
                                            <span className="text-sm font-medium text-slate-900 dark:text-white">{item.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Chart */}
                            <div className="lg:col-span-2">
                                <MultiChart
                                    data={history?.data?.map(d => ({
                                        date: formatChartDate(d.date),
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

                        {/* About & Quick News */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-5">
                            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
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

                            {/* Quick News Preview */}
                            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
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

                <div className="flex-1 pt-[112px] md:pt-[120px] overflow-x-hidden">
                    <div className="p-2 lg:p-3 space-y-3 w-full">
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
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-center">
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
                                {/* Market Issues Banner - Full Width */}
                                {stock.marketIssues && stock.marketIssues.length > 0 && (
                                    <MarketIssuesBanner issues={stock.marketIssues} />
                                )}

                                {/* Company Header - Full Width */}
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
                                                    ${formatNumber(stock.price)}
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
                                            <button className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition text-sm font-medium">
                                                <Star size={14} />
                                                Watchlist
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

                                {/* Tab Navigation - Full Width */}
                                <StockTabs activeTab={activeTab} onTabChange={setActiveTab} />

                                {/* Tab Content + AI Widget - 2 Column Layout */}
                                <div className="flex gap-3">
                                    {/* Main Tab Content */}
                                    <div className="flex-1 min-w-0">
                                        {renderTabContent()}
                                    </div>

                                    {/* Right Column: AI Widget (Desktop only) */}
                                    <div className="hidden xl:block w-[320px] flex-shrink-0">
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
                                    </div>
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
                    pageData={{ symbol }}
                    quickPrompts={[`Analyze ${symbol}`, `${symbol} price prediction`]}
                />
            </div>

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
