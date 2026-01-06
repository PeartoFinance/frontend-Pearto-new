'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, RefreshCw, Copy, Loader2 } from 'lucide-react';
import { getMarketOverview, MarketOverviewData, MarketStock } from '@/services/marketService';

export default function MarketSnapshot() {
    const [data, setData] = useState<MarketOverviewData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'Top' | 'Gainers' | 'Losers'>('Top');
    const [assetType, setAssetType] = useState<'Crypto' | 'Stocks' | 'Metals'>('Stocks');
    const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

    const fetchData = async () => {
        try {
            setLoading(true);
            const result = await getMarketOverview();
            setData(result);
            setLastRefresh(new Date());
            setError(null);
        } catch (err) {
            setError('Failed to load market data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // Auto-refresh every 60 seconds
        const interval = setInterval(fetchData, 60000);
        return () => clearInterval(interval);
    }, []);

    const getDisplayData = (): MarketStock[] => {
        if (!data) return [];
        switch (activeTab) {
            case 'Gainers':
                return data.topGainers || [];
            case 'Losers':
                return data.topLosers || [];
            default:
                return data.mostActive || [];
        }
    };

    const displayData = getDisplayData();
    const totalMarketCap = 6.02; // Would come from crypto API
    const volume24h = data?.totalVolume ? (data.totalVolume / 1000000000).toFixed(2) : '0';

    const timeSinceRefresh = () => {
        const seconds = Math.floor((new Date().getTime() - lastRefresh.getTime()) / 1000);
        return `${seconds}s ago`;
    };

    return (
        <section className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Market Snapshot</h3>
                <div className="flex items-center gap-2">
                    {['Crypto', 'Stocks', 'Metals'].map((type) => (
                        <button
                            key={type}
                            onClick={() => setAssetType(type as typeof assetType)}
                            className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${assetType === type
                                ? 'bg-emerald-500 text-white'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">📈</span>
                        <span className="text-xs text-slate-500">Advancers</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-emerald-500">{data?.advancers || 0}</span>
                    </div>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">📉</span>
                        <span className="text-xs text-slate-500">Decliners</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-red-500">{data?.decliners || 0}</span>
                    </div>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-slate-500">Unchanged</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-slate-900 dark:text-white">{data?.unchanged || 0}</span>
                    </div>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                    <div className="text-xs text-slate-500 mb-2">Top Gainer</div>
                    {data?.topGainers?.[0] && (
                        <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-1 text-emerald-500">
                                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                {data.topGainers[0].symbol}
                            </span>
                            <span className="text-emerald-500">
                                +{data.topGainers[0].changePercent?.toFixed(2)}%
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 mb-4">
                {(['Top', 'Gainers', 'Losers'] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === tab
                            ? 'bg-emerald-500 text-white'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
                <div className="ml-auto flex items-center gap-2 text-xs text-slate-500">
                    <button onClick={fetchData} disabled={loading}>
                        <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
                    </button>
                    Auto-refresh • {timeSinceRefresh()}
                </div>
            </div>

            {/* Assets Table */}
            {loading && !data ? (
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="animate-spin text-emerald-500" size={24} />
                </div>
            ) : error ? (
                <div className="text-center py-8 text-red-500">{error}</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-xs text-slate-500 border-b border-slate-200 dark:border-slate-700">
                                <th className="text-left py-3 font-medium">Symbol</th>
                                <th className="text-right py-3 font-medium">Price</th>
                                <th className="text-right py-3 font-medium">Change</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayData.slice(0, 8).map((asset, idx) => (
                                <tr
                                    key={`${asset.symbol}-${idx}`}
                                    className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30"
                                >
                                    <td className="py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-xs font-bold text-emerald-600">
                                                {asset.symbol?.slice(0, 2)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-slate-900 dark:text-white">{asset.symbol}</p>
                                                <p className="text-xs text-slate-500">{asset.name}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="text-right py-3">
                                        <span className="text-sm font-medium text-slate-900 dark:text-white">
                                            ${asset.price?.toLocaleString()}
                                        </span>
                                    </td>
                                    <td className="text-right py-3">
                                        <span className={`flex items-center justify-end gap-1 text-sm font-medium ${(asset.changePercent || 0) >= 0 ? 'text-emerald-500' : 'text-red-500'
                                            }`}>
                                            {(asset.changePercent || 0) >= 0 ? '+' : ''}{asset.changePercent?.toFixed(2)}%
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
}
