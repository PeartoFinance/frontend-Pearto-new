'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/layout/Sidebar';
import TickerTape from '@/components/layout/TickerTape';
import Header from '@/components/layout/Header';
import { AIWidget } from '@/components/ai';
import { AIAnalysisPanel } from '@/components/ai/AIAnalysisPanel';
import { MultiChart } from '@/components/charts';
import { getHoldingDetail, addTransaction, type HoldingDetail } from '@/services/portfolioService';
import { getStockHistory, type PriceHistoryPoint } from '@/services/marketService';
import PriceDisplay from '@/components/common/PriceDisplay';
import { getAssetDetailPath } from '@/utils/assetRoutes';
import {
    StockTabs, type TabId, FinancialsTab, DividendsTab, ForecastTab, ProfileTab, NewsTab
} from '@/components/stocks/tabs';
import {
    ArrowLeft, Loader2, TrendingUp, TrendingDown, DollarSign,
    PieChart, Calendar, Activity, ArrowUpRight, ArrowDownRight, Plus, Minus, X
} from 'lucide-react';

interface PageProps {
    params: Promise<{ portfolioId: string; holdingId: string }>;
}

export default function HoldingDetailPage({ params }: PageProps) {
    const { portfolioId, holdingId } = use(params);
    const router = useRouter();

    const [data, setData] = useState<HoldingDetail | null>(null);
    const [history, setHistory] = useState<PriceHistoryPoint[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [period, setPeriod] = useState('1mo');
    const [activeTab, setActiveTab] = useState<TabId>('overview');

    // Transaction modal state
    const [showTxModal, setShowTxModal] = useState(false);
    const [txType, setTxType] = useState<'buy' | 'sell'>('buy');
    const [txShares, setTxShares] = useState('');
    const [txPrice, setTxPrice] = useState('');
    const [txDate, setTxDate] = useState(new Date().toISOString().split('T')[0]);
    const [txSubmitting, setTxSubmitting] = useState(false);

    useEffect(() => {
        loadData();
    }, [portfolioId, holdingId]);

    const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
            const holdingData = await getHoldingDetail(portfolioId, holdingId);
            setData(holdingData);
            setTxPrice(holdingData.holding.currentPrice.toFixed(2));

            // Load stock price history
            const interval = period === '1d' ? '5m' : period === '5d' ? '15m' : '1d';
            const historyData = await getStockHistory(holdingData.holding.symbol, period, interval);
            setHistory(historyData?.data || []);
        } catch (err: any) {
            console.error('Failed to load holding:', err);
            setError(err.message || 'Failed to load holding details');
        } finally {
            setLoading(false);
        }
    };

    const handleRecordTransaction = async () => {
        if (!data || !txShares || !txPrice) return;
        setTxSubmitting(true);
        try {
            await addTransaction(portfolioId, {
                symbol: data.holding.symbol,
                type: txType,
                shares: parseFloat(txShares),
                price: parseFloat(txPrice),
                date: txDate
            });
            setShowTxModal(false);
            setTxShares('');
            setTxPrice(data.holding.currentPrice.toFixed(2));
            await loadData(); // Refresh data
        } catch (err) {
            console.error('Failed to record transaction:', err);
        } finally {
            setTxSubmitting(false);
        }
    };

    // Chart data now handled by MultiChart component

    const formatNumber = (num: number | null | undefined, decimals = 2) => {
        if (num == null) return '-';
        return num.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    };

    const formatLargeNumber = (num: number | null | undefined) => {
        if (num == null) return '-';
        if (num >= 1e12) return `${(num / 1e12).toFixed(2)}T`;
        if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
        if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
        return num.toLocaleString();
    };



    const periods = [
        { id: '1d', label: '1D' },
        { id: '5d', label: '5D' },
        { id: '1mo', label: '1M' },
        { id: '3mo', label: '3M' },
        { id: '1y', label: '1Y' },
    ];

    if (loading) {
        return (
            <div className="flex min-h-screen bg-gray-50 dark:bg-slate-900">
                <Sidebar />
                <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
                    <div className="fixed top-0 right-0 left-0 lg:left-64 z-40 bg-gray-50 dark:bg-slate-900">
                        <TickerTape />
                        <Header />
                    </div>
                    <div className="flex-1 pt-[112px] md:pt-[120px] flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                    </div>
                </main>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="flex min-h-screen bg-gray-50 dark:bg-slate-900">
                <Sidebar />
                <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
                    <div className="fixed top-0 right-0 left-0 lg:left-64 z-40 bg-gray-50 dark:bg-slate-900">
                        <TickerTape />
                        <Header />
                    </div>
                    <div className="flex-1 pt-[112px] md:pt-[120px] flex items-center justify-center">
                        <div className="text-center">
                            <p className="text-red-500 mb-4">{error || 'Holding not found'}</p>
                            <button onClick={() => router.back()} className="text-emerald-500 hover:underline">
                                Go Back
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    const { holding, market, transactions } = data;
    const isPositive = holding.gainPercent >= 0;

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-slate-900">
            <Sidebar />

            <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
                <div className="fixed top-0 right-0 left-0 lg:left-64 z-40 bg-gray-50 dark:bg-slate-900">
                    <TickerTape />
                    <Header />
                </div>

                <div className="flex-1 pt-[112px] md:pt-[120px] overflow-x-hidden">
                    <div className="p-4 lg:p-6 space-y-6 w-full max-w-6xl mx-auto">
                        {/* Back Link */}
                        <Link href="/portfolio" className="inline-flex items-center gap-2 text-slate-500 hover:text-emerald-500 text-sm">
                            <ArrowLeft size={16} />
                            Back to Portfolio
                        </Link>

                        {/* Header */}
                        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xl font-bold">
                                        {holding.symbol.slice(0, 2)}
                                    </div>
                                    <div>
                                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                                            {holding.symbol}
                                        </h1>
                                        <p className="text-slate-500">{market?.name || holding.symbol}</p>
                                        {market?.sector && (
                                            <span className="inline-block mt-1 px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs rounded">
                                                {market.sector}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-col lg:items-end gap-3">
                                    <div className="text-right">
                                        <p className="text-3xl font-bold text-slate-900 dark:text-white">
                                            <PriceDisplay amount={holding.totalValue} />
                                        </p>
                                        <div className={`flex items-center justify-end gap-2 ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                                            {isPositive ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                                            <span className="text-lg font-semibold flex items-center gap-1">
                                                <PriceDisplay amount={holding.totalGain} prefix={isPositive ? '+' : ''} />
                                                <span>({isPositive ? '+' : ''}{formatNumber(holding.gainPercent)}%)</span>
                                            </span>
                                        </div>
                                    </div>
                                    {/* Action Buttons */}
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => { setTxType('buy'); setShowTxModal(true); }}
                                            className="flex items-center gap-1 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg transition"
                                        >
                                            <Plus size={16} /> Buy More
                                        </button>
                                        <button
                                            onClick={() => { setTxType('sell'); setShowTxModal(true); }}
                                            className="flex items-center gap-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition"
                                        >
                                            <Minus size={16} /> Sell
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tab Navigation */}
                        <StockTabs activeTab={activeTab} onTabChange={setActiveTab} />

                        {/* Tab Content */}
                        {activeTab === 'overview' && (
                            <>
                                {/* AI Holding Analysis - Full Data */}
                                <AIAnalysisPanel
                                    title={`${holding.symbol} Holding Analysis`}
                                    pageType="holding-detail"
                                    pageData={{
                                        // Holding data
                                        symbol: holding.symbol,
                                        shares: holding.shares,
                                        avgCost: holding.avgCost,
                                        totalCost: holding.totalCost,
                                        currentPrice: holding.currentPrice,
                                        totalValue: holding.totalValue,
                                        totalGain: holding.totalGain,
                                        gainPercent: holding.gainPercent,
                                        portfolioWeight: holding.portfolioWeight,
                                        // Market data
                                        marketName: market?.name,
                                        sector: market?.sector,
                                        industry: market?.industry,
                                        marketCap: market?.marketCap,
                                        peRatio: market?.peRatio,
                                        dayChange: market?.dayChange,
                                        dayChangePercent: market?.dayChangePercent,
                                        high52w: market?.high52w,
                                        low52w: market?.low52w,
                                        // Transaction history
                                        transactionCount: transactions?.length || 0,
                                        recentTransactions: transactions?.slice(0, 10),
                                        // Chart period
                                        chartPeriod: period,
                                        historyPoints: history.length
                                    }}
                                    autoAnalyze={!!holding}
                                    quickPrompts={[
                                        `Should I sell ${holding.symbol}?`,
                                        'Portfolio allocation advice',
                                        'Price target analysis'
                                    ]}
                                    className="mb-5"
                                />

                                {/* Stats Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
                                        <div className="flex items-center gap-2 text-slate-500 text-sm mb-2">
                                            <Activity size={14} />
                                            Shares
                                        </div>
                                        <p className="text-xl font-bold text-slate-900 dark:text-white">{formatNumber(holding.shares)}</p>
                                    </div>
                                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
                                        <div className="flex items-center gap-2 text-slate-500 text-sm mb-2">
                                            <DollarSign size={14} />
                                            Avg Cost
                                        </div>
                                        <p className="text-xl font-bold text-slate-900 dark:text-white"><PriceDisplay amount={holding.avgCost} /></p>
                                    </div>
                                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
                                        <div className="flex items-center gap-2 text-slate-500 text-sm mb-2">
                                            <TrendingUp size={14} />
                                            Current Price
                                        </div>
                                        <p className="text-xl font-bold text-slate-900 dark:text-white"><PriceDisplay amount={holding.currentPrice} /></p>
                                    </div>
                                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
                                        <div className="flex items-center gap-2 text-slate-500 text-sm mb-2">
                                            <PieChart size={14} />
                                            Portfolio Weight
                                        </div>
                                        <p className="text-xl font-bold text-slate-900 dark:text-white">{formatNumber(holding.portfolioWeight)}%</p>
                                    </div>
                                </div>

                                {/* Chart Section */}
                                <MultiChart
                                    data={history.map(d => ({
                                        date: d.date,
                                        open: d.open,
                                        high: d.high,
                                        low: d.low,
                                        close: d.close ? d.close * holding.shares : null,
                                        value: d.close ? d.close * holding.shares : null,
                                        volume: d.volume
                                    }))}
                                    period={period}
                                    onPeriodChange={(p) => {
                                        setPeriod(p);
                                        getStockHistory(holding.symbol, p, p === '1d' ? '5m' : '1d')
                                            .then(res => setHistory(res?.data || []));
                                    }}
                                    height={350}
                                    loading={loading}
                                    change={{ value: holding.totalGain || 0, percent: holding.gainPercent || 0 }}
                                    initialChartType="area"
                                />

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Transaction History */}
                                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                                        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={18} className="text-emerald-500" />
                                                <span className="font-semibold text-slate-900 dark:text-white">Transaction History</span>
                                            </div>
                                            <button
                                                onClick={() => { setTxType('buy'); setShowTxModal(true); }}
                                                className="text-emerald-500 hover:text-emerald-600 text-sm flex items-center gap-1"
                                            >
                                                <Plus size={14} /> Add
                                            </button>
                                        </div>
                                        {transactions.length === 0 ? (
                                            <div className="p-8 text-center text-slate-500">
                                                <Calendar size={32} className="mx-auto mb-3 text-slate-300" />
                                                <p>No transactions recorded</p>
                                                <button
                                                    onClick={() => { setTxType('buy'); setShowTxModal(true); }}
                                                    className="mt-3 text-emerald-500 hover:underline text-sm"
                                                >
                                                    Record your first transaction
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="divide-y divide-slate-100 dark:divide-slate-700 max-h-[400px] overflow-y-auto">
                                                {transactions.map((tx) => (
                                                    <div key={tx.id} className="px-5 py-4 flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${tx.type === 'buy' ? 'bg-emerald-100 dark:bg-emerald-900/30' :
                                                                tx.type === 'sell' ? 'bg-red-100 dark:bg-red-900/30' :
                                                                    'bg-blue-100 dark:bg-blue-900/30'
                                                                }`}>
                                                                {tx.type === 'buy' ? <ArrowDownRight size={14} className="text-emerald-600" /> :
                                                                    tx.type === 'sell' ? <ArrowUpRight size={14} className="text-red-600" /> :
                                                                        <DollarSign size={14} className="text-blue-600" />}
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-slate-900 dark:text-white capitalize">{tx.type}</p>
                                                                <p className="text-xs text-slate-500">{tx.date}</p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-medium text-slate-900 dark:text-white">{tx.shares} shares</p>
                                                            <p className="text-xs text-slate-500 flex items-center justify-end gap-1">@ <PriceDisplay amount={tx.price} /></p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Market Data */}
                                    {market && (
                                        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                                            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700">
                                                <span className="font-semibold text-slate-900 dark:text-white">Stock Information</span>
                                            </div>
                                            <div className="p-5 space-y-4">
                                                <div className="flex justify-between">
                                                    <span className="text-slate-500">Day Change</span>
                                                    <span className={`font-medium ${market.dayChangePercent >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                                        {market.dayChangePercent >= 0 ? '+' : ''}{formatNumber(market.dayChangePercent)}%
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-slate-500">52W High</span>
                                                    <span className="font-medium text-slate-900 dark:text-white"><PriceDisplay amount={market.high52w} /></span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-slate-500">52W Low</span>
                                                    <span className="font-medium text-slate-900 dark:text-white"><PriceDisplay amount={market.low52w} /></span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-slate-500">P/E Ratio</span>
                                                    <span className="font-medium text-slate-900 dark:text-white">{formatNumber(market.peRatio)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-slate-500">Market Cap</span>
                                                    <span className="font-medium text-slate-900 dark:text-white"><PriceDisplay amount={market.marketCap} options={{ notation: 'compact' }} /></span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-slate-500">Sector</span>
                                                    <span className="font-medium text-slate-900 dark:text-white">{market.sector || '-'}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-slate-500">Industry</span>
                                                    <span className="font-medium text-slate-900 dark:text-white">{market.industry || '-'}</span>
                                                </div>
                                            </div>
                                            <div className="px-5 py-4 border-t border-slate-200 dark:border-slate-700">
                                                <Link href={getAssetDetailPath(holding.symbol)} className="text-emerald-500 hover:underline text-sm flex items-center gap-1">
                                                    View Full Stock Details <ArrowUpRight size={14} />
                                                </Link>
                                            </div>
                                        </div>
                                    )}
                                </div>

                            </>



                        )}


                        {/* History Tab - same as overview chart but dedicated */}
                        {activeTab === 'history' && (
                            <MultiChart
                                data={history.map(d => ({
                                    date: d.date,
                                    open: d.open,
                                    high: d.high,
                                    low: d.low,
                                    close: d.close,
                                    value: d.close,
                                    volume: d.volume
                                }))}
                                period={period}
                                onPeriodChange={(p) => {
                                    setPeriod(p);
                                    const interval = p === '1m' ? '1m' : p === '1d' ? '5m' : p === '5d' ? '15m' : '1d';
                                    getStockHistory(holding.symbol, p, interval)
                                        .then(res => setHistory(res?.data || []));
                                }}
                                height={450}
                                loading={loading}
                                change={{ value: holding.totalGain || 0, percent: holding.gainPercent || 0 }}
                                initialChartType="candle"
                            />
                        )}

                        {/* Financials Tab */}
                        {activeTab === 'financials' && (
                            <FinancialsTab symbol={holding.symbol} />
                        )}

                        {/* Dividends Tab */}
                        {activeTab === 'dividends' && (
                            <DividendsTab symbol={holding.symbol} />
                        )}

                        {/* Forecast Tab */}
                        {activeTab === 'forecast' && (
                            <ForecastTab symbol={holding.symbol} currentPrice={holding.currentPrice} />
                        )}

                        {/* Profile Tab - Redirect to stock page */}
                        {activeTab === 'profile' && (
                            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-8 text-center">
                                <div className="text-slate-400 mb-4">
                                    <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Company Profile</h3>
                                <p className="text-slate-500 mb-4">View detailed company information, description, sector, and more on the stock page.</p>
                                <Link
                                    href={`${getAssetDetailPath(holding.symbol)}?tab=profile`}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
                                >
                                    View Stock Profile <ArrowUpRight size={16} />
                                </Link>
                            </div>
                        )}

                        {/* News Tab - Redirect to stock page */}
                        {activeTab === 'news' && (
                            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-8 text-center">
                                <div className="text-slate-400 mb-4">
                                    <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Latest News</h3>
                                <p className="text-slate-500 mb-4">Get the latest news and updates about {holding.symbol} on the stock page.</p>
                                <Link
                                    href={`${getAssetDetailPath(holding.symbol)}?tab=news`}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
                                >
                                    View Stock News <ArrowUpRight size={16} />
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </main >

            {/* Transaction Modal */}
            {
                showTxModal && (
                    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 w-full max-w-md">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                                    {txType === 'buy' ? 'Buy More Shares' : 'Sell Shares'}
                                </h3>
                                <button onClick={() => setShowTxModal(false)} className="text-slate-400 hover:text-slate-600">
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Type Toggle */}
                            <div className="flex gap-2 mb-6">
                                <button
                                    onClick={() => setTxType('buy')}
                                    className={`flex-1 py-2 rounded-lg font-medium transition ${txType === 'buy'
                                        ? 'bg-emerald-500 text-white'
                                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                                        }`}
                                >
                                    Buy
                                </button>
                                <button
                                    onClick={() => setTxType('sell')}
                                    className={`flex-1 py-2 rounded-lg font-medium transition ${txType === 'sell'
                                        ? 'bg-red-500 text-white'
                                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                                        }`}
                                >
                                    Sell
                                </button>
                            </div>

                            <div className="space-y-4 mb-6">
                                <div>
                                    <label className="block text-sm text-slate-500 mb-2">Number of Shares</label>
                                    <input
                                        type="number"
                                        value={txShares}
                                        onChange={(e) => setTxShares(e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                                        placeholder="100"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-slate-500 mb-2">Price per Share</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={txPrice}
                                        onChange={(e) => setTxPrice(e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                                        placeholder={holding.currentPrice.toFixed(2)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-slate-500 mb-2">Transaction Date</label>
                                    <input
                                        type="date"
                                        value={txDate}
                                        onChange={(e) => setTxDate(e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                                    />
                                </div>

                                {/* Preview */}
                                {txShares && txPrice && (
                                    <div className={`p-4 rounded-lg ${txType === 'buy' ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                                        <p className="text-sm text-slate-500 mb-1">Total Amount</p>
                                        <p className={`text-2xl font-bold ${txType === 'buy' ? 'text-emerald-600' : 'text-red-600'}`}>
                                            <PriceDisplay amount={parseFloat(txShares) * parseFloat(txPrice)} />
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowTxModal(false)}
                                    className="flex-1 px-4 py-3 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleRecordTransaction}
                                    disabled={txSubmitting || !txShares || !txPrice}
                                    className={`flex-1 px-4 py-3 text-white font-medium rounded-lg disabled:opacity-50 ${txType === 'buy'
                                        ? 'bg-emerald-500 hover:bg-emerald-600'
                                        : 'bg-red-500 hover:bg-red-600'
                                        }`}
                                >
                                    {txSubmitting ? 'Recording...' : `Record ${txType === 'buy' ? 'Buy' : 'Sell'}`}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            <AIWidget
                type="floating"
                position="bottom-right"
                pageType="portfolio"
                pageData={{ symbol: holding.symbol }}
                quickPrompts={[`Analyze ${holding.symbol}`, 'Should I sell?']}
            />
        </div >

    );
}
