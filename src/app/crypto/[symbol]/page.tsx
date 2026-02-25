'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import RelatedTools from '@/components/tools/RelatedTools';
import Sidebar from '@/components/layout/Sidebar';
import TickerTape from '@/components/layout/TickerTape';
import Header from '@/components/layout/Header';
import { MultiChart } from '@/components/charts';
import { AIAnalysisPanel } from '@/components/ai/AIAnalysisPanel';
import { AIColumnWrapper } from '@/components/ai/AIColumnWrapper';
import PriceDisplay from '@/components/common/PriceDisplay';
import {
    StockTabs,
    type TabId
} from '@/components/stocks/tabs';
import { useCurrency } from '@/contexts/CurrencyContext';
import { HistoryTab, NewsTab } from '@/components/stocks/tabs'; // Reuse generic tabs where possible
import {
    getCryptoProfile,
    getCryptoHistory,
    type MarketStock,
    type StockHistoryResponse,
    type NewsArticle
} from '@/services/marketService';
import { getNewsByStock } from '@/services/newsService';
import { addToWatchlist, removeFromWatchlist } from '@/services/portfolioService';
import { useWatchlist, portfolioQueryKeys } from '@/hooks/usePortfolioData';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
    ArrowLeft, Loader2, AlertCircle, TrendingUp, TrendingDown,
    Globe, Star, BarChart2, Newspaper, Coins
} from 'lucide-react';

type Period = '1m' | '1d' | '5d' | '1mo' | '3mo' | '6mo' | '1y' | '5y';

const INTERVAL_MAP: Record<string, string> = {
    '1m': '1m', '1d': '5m', '2d': '5m', '5d': '15m', '1mo': '90m',
    '3mo': '1d', '6mo': '1d', 'ytd': '1d', '1y': '1d', '3y': '1wk', '5y': '1wk', 'max': '1mo',
};

// Subset of tabs relevant for crypto
const cryptoTabs: { id: TabId; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'chart', label: 'Chart' },
    { id: 'history', label: 'History' },
    { id: 'news', label: 'News' },
    { id: 'analysis', label: 'Analysis' },
];

export default function CryptoDetailPage() {
    const params = useParams();
    const symbol = (params?.symbol as string)?.toUpperCase() || '';

    const [coin, setCoin] = useState<MarketStock | null>(null);
    const [history, setHistory] = useState<StockHistoryResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [chartLoading, setChartLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [period, setPeriod] = useState<Period>('1d');
    const [news, setNews] = useState<NewsArticle[]>([]);
    const [newsLoading, setNewsLoading] = useState(false);
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
                toast.success(`${symbol} removed from watchlist`);
            } else {
                await addToWatchlist(symbol);
                toast.success(`${symbol} added to watchlist`);
            }
            queryClient.invalidateQueries({ queryKey: portfolioQueryKeys.watchlist() });
        } catch (err) {
            toast.error('Failed to update watchlist');
        } finally {
            setWatchlistLoading(false);
        }
    };

    const loadCoin = useCallback(async () => {
        if (!symbol) return;

        setLoading(true);
        setError(null);

        try {
            const [profileData, historyData] = await Promise.all([
                getCryptoProfile(symbol),
                getCryptoHistory(symbol, period, INTERVAL_MAP[period] || '1d'),
            ]);

            setCoin(profileData);
            setHistory(historyData);

            // Fetch News
            try {
                setNewsLoading(true);
                const newsData = await getNewsByStock(symbol, 6);
                setNews(newsData.items || []);
            } catch (e) {
                console.error('Failed to load news:', e);
            } finally {
                setNewsLoading(false);
            }

        } catch (err: any) {
            console.error('Failed to load crypto:', err);
            if (err?.status === 404) {
                setError('This cryptocurrency symbol does not exist or is not supported.');
            } else if (err?.status === 0) {
                setError('Unable to connect to the server. Please check your connection and try again.');
            } else {
                setError('Something went wrong loading cryptocurrency data. Please try again.');
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
            const historyData = await getCryptoHistory(symbol, newPeriod, interval);
            setHistory(historyData);
        } catch (err) {
            console.error('Failed to load history:', err);
        } finally {
            setChartLoading(false);
        }
    }, [symbol]);

    useEffect(() => {
        loadCoin();
    }, [loadCoin]);

    // Formatters
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
        return `${(num).toFixed(2)}%`;
    };

    const isPositive = (coin?.changePercent ?? 0) >= 0;



    const { convertPrice } = useCurrency();

    const renderTabContent = () => {
        if (!coin) return null;

        const chartData = history?.data?.map(d => ({
            date: d.date,
            open: d.open,
            high: d.high,
            low: d.low,
            close: d.close,
            volume: d.volume
        })) || [];

        const priceRange = coin.dayLow != null && coin.dayHigh != null ? {
            low: coin.dayLow,
            high: coin.dayHigh
        } : undefined;

        const change = {
            value: coin.change || 0,
            percent: coin.changePercent || 0
        };


        switch (activeTab) {
            case 'overview':
                return (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                        <div className="lg:col-span-1 space-y-4">
                            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                                <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">
                                    Market Statistics
                                </h3>
                                <div className="space-y-2">
                                    {[
                                        { label: 'Market Cap', value: <PriceDisplay amount={coin.marketCap} options={{ notation: 'compact' }} /> },
                                        { label: 'Volume (24h)', value: formatLargeNumber(coin.volume) },
                                        { label: 'Circulating Supply', value: coin.sharesOutstanding ? formatLargeNumber(coin.sharesOutstanding) : '-' },
                                        { label: 'Open', value: <PriceDisplay amount={coin.open} /> },
                                        { label: 'Previous Close', value: <PriceDisplay amount={coin.previousClose} /> },
                                        {
                                            label: "Day's Range",
                                            value: coin.dayLow && coin.dayHigh ? (
                                                <div className="flex gap-1">
                                                    <PriceDisplay amount={coin.dayLow} /> - <PriceDisplay amount={coin.dayHigh} />
                                                </div>
                                            ) : '-'
                                        },
                                        {
                                            label: '52-Week Range',
                                            value: coin.low52w && coin.high52w ? (
                                                <div className="flex gap-1">
                                                    <PriceDisplay amount={coin.low52w} /> - <PriceDisplay amount={coin.high52w} />
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
                            </div>
                            <RelatedTools category="Crypto" title="Crypto Tools" limit={3} />
                        </div>

                        {/* Chart */}
                        <div className="lg:col-span-2">
                            <MultiChart
                                data={chartData}
                                period={period}
                                onPeriodChange={(p) => loadHistory(p as Period)}
                                loading={chartLoading}
                                height={400}
                                priceRange={priceRange}
                                change={change}
                                initialChartType="area"
                                skipPriceConversion={true}
                            />
                        </div>

                        {/* About & News */}
                        <div className="lg:col-span-3 grid grid-cols-1 lg:grid-cols-2 gap-5 mt-2">
                            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
                                    About {coin.name}
                                </h3>
                                {coin.description ? (
                                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-4">
                                        {coin.description}
                                    </p>
                                ) : (
                                    <p className="text-sm text-slate-400">No description available.</p>
                                )}
                            </div>

                            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                        <Newspaper size={18} className="text-amber-500" />
                                        Latest News
                                    </h3>
                                    <button
                                        onClick={() => setActiveTab('news')}
                                        className="text-sm text-amber-600 hover:text-amber-500"
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
                                                className="block text-sm text-slate-600 dark:text-slate-300 hover:text-amber-600 transition line-clamp-1"
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
                );

            case 'chart':
                return (
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                        <MultiChart
                            data={chartData}
                            period={period}
                            onPeriodChange={(p) => loadHistory(p as Period)}
                            loading={chartLoading}
                            height={600}
                            priceRange={priceRange}
                            change={change}
                            initialChartType="candle"
                            skipPriceConversion={true}
                        />
                    </div>
                );

            case 'history':
                // Reuse HistoryTab but we might need to verify it uses props generic enough
                // Since HistoryTab fetches its own data using 'getStockHistory', we need to pass data or create a wrapper.
                // For now, let's create a simple table here or pass a specific service if HistoryTab allows it.
                // Looking at page.tsx, HistoryTab takes 'symbol'. It likely calls getStockHistory internally.
                // We should probably pass the data to it or make a CryptoHistoryTab.
                // Simpler: Just render a table here for now to avoid refactoring HistoryTab aggressively.
                return (
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 dark:bg-slate-800">
                                <tr>
                                    <th className="px-4 py-3 text-left">Date</th>
                                    <th className="px-4 py-3 text-right">Open</th>
                                    <th className="px-4 py-3 text-right">High</th>
                                    <th className="px-4 py-3 text-right">Low</th>
                                    <th className="px-4 py-3 text-right">Close</th>
                                    <th className="px-4 py-3 text-right">Volume</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {history?.data?.slice().reverse().map((row, i) => (
                                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                        <td className="px-4 py-3 font-medium">{row.date.split('T')[0]}</td>
                                        <td className="px-4 py-3 text-right"><PriceDisplay amount={row.open} /></td>
                                        <td className="px-4 py-3 text-right"><PriceDisplay amount={row.high} /></td>
                                        <td className="px-4 py-3 text-right"><PriceDisplay amount={row.low} /></td>
                                        <td className="px-4 py-3 text-right font-bold"><PriceDisplay amount={row.close} /></td>
                                        <td className="px-4 py-3 text-right">{row.volume?.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                );

            case 'news':
                return <NewsTab symbol={symbol} news={news} loading={newsLoading} />;

            case 'analysis':
                return (
                    <AIAnalysisPanel
                        title={`${symbol} Analysis`}
                        pageType="crypto-detail"
                        pageData={{
                            symbol,
                            name: coin?.name,
                            price: coin?.price,
                            change: coin?.change,
                            changePercent: coin?.changePercent,
                            marketCap: coin?.marketCap,
                            volume: coin?.volume,
                            supply: coin?.sharesOutstanding
                        }}
                        autoAnalyze={true}
                        quickPrompts={[
                            `Analyze ${symbol} trend`,
                            'Market sentiment',
                            'Price prediction'
                        ]}
                    />
                );

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
                        <Link
                            href="/markets"
                            className="inline-flex items-center gap-2 text-slate-500 hover:text-amber-600 transition-colors text-sm"
                        >
                            <ArrowLeft size={16} />
                            <span>Back to Markets</span>
                        </Link>

                        {loading && (
                            <div className="flex items-center justify-center py-20">
                                <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
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

                        {coin && !loading && (
                            <>
                                {/* Header */}
                                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-500 font-bold">
                                                    {coin.symbol?.slice(0, 1)}
                                                </div>
                                                <div>
                                                    <h1 className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-white">
                                                        {coin.name} ({coin.symbol})
                                                    </h1>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                                        Crypto · Real-Time Price · USD
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-baseline gap-3 mt-3">
                                                <span className="text-3xl font-bold text-slate-900 dark:text-white">
                                                    <PriceDisplay amount={coin.price} />
                                                </span>
                                                <div className={`flex items-center gap-1 text-base font-semibold ${isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
                                                    {isPositive ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                                                    <span>
                                                        {isPositive ? '+' : ''}{formatNumber(coin.change)} ({isPositive ? '+' : ''}{formatNumber(coin.changePercent)}%)
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={handleWatchlistToggle}
                                                disabled={watchlistLoading}
                                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition text-sm font-medium ${isInWatchlist
                                                    ? 'bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400'
                                                    : 'bg-amber-500 hover:bg-amber-600 text-white'
                                                    }`}
                                            >
                                                <Star size={14} fill={isInWatchlist ? 'currentColor' : 'none'} />
                                                {watchlistLoading ? 'Updating...' : isInWatchlist ? 'In Watchlist' : 'Watchlist'}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Custom Tabs for Crypto */}
                                <div className="flex gap-1 overflow-x-auto pb-1 border-b border-slate-200 dark:border-slate-700">
                                    {cryptoTabs.map((tab) => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition whitespace-nowrap ${activeTab === tab.id
                                                ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-500 border-b-2 border-amber-500'
                                                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                                                }`}
                                        >
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>

                                <div className="flex gap-3">
                                    <div className="flex-1 min-w-0">
                                        {renderTabContent()}
                                    </div>

                                    {/* Right Sidebar AI */}
                                    <AIColumnWrapper>
                                        <div className="sticky top-[130px]">
                                            <AIAnalysisPanel
                                                title="Crypto Insight"
                                                pageType="crypto-detail"
                                                pageData={{
                                                    symbol,
                                                    name: coin.name,
                                                    price: coin.price,
                                                    marketCap: coin.marketCap
                                                }}
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
        </div>
    );
}
