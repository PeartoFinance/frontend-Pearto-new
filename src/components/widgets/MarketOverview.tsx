'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowUpRight, ArrowDownRight, TrendingUp, BarChart2, Loader2, AlertCircle } from 'lucide-react';
import { getMarketOverview, getMarketIndices, MarketOverviewData, MarketIndex } from '@/services/marketService';

export default function MarketOverview() {
    const [data, setData] = useState<MarketOverviewData | null>(null);
    const [indices, setIndices] = useState<MarketIndex[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [overviewData, indicesData] = await Promise.all([
                    getMarketOverview(),
                    getMarketIndices()
                ]);
                setData(overviewData);
                setIndices(indicesData.slice(0, 4));
                setError(false);
            } catch (err) {
                console.error('Failed to fetch market overview:', err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        // Auto refresh every 2 minutes
        const interval = setInterval(fetchData, 120000);
        return () => clearInterval(interval);
    }, []);

    const topGainers = data?.topGainers || [];
    const topLosers = data?.topLosers || [];
    const mostActive = data?.mostActive || [];

    if (error && indices.length === 0) {
        return (
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-8">
                <div className="flex items-center justify-center gap-2 text-slate-500">
                    <AlertCircle size={20} />
                    <span>Market data unavailable.</span>
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Market Indices */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center gap-2">
                    <BarChart2 size={18} className="text-emerald-500" />
                    <span className="font-semibold text-slate-900 dark:text-white">Market Indices</span>
                </div>
                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="animate-spin text-emerald-500" size={24} />
                    </div>
                ) : indices.length === 0 ? (
                    <div className="flex items-center justify-center py-8 text-slate-500">
                        No indices data available
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-slate-200 dark:divide-neutral-800">
                        {indices.map((index) => (
                            <div key={index.symbol} className="p-4 text-center">
                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">{index.name}</p>
                                {/* Using 'value' field from API */}
                                <p className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                                    {index.value?.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                </p>
                                <div className={`flex items-center justify-center gap-1 text-sm font-medium ${(index.changePercent || 0) >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                    {(index.changePercent || 0) >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                    {Math.abs(index.change || 0).toFixed(2)} ({Math.abs(index.changePercent || 0).toFixed(2)}%)
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Market Stats */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold text-slate-900 dark:text-white">
                    Today&apos;s Summary
                </div>
                <div className="p-4 space-y-3">
                    <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400">Advancers</span>
                        <span className="font-semibold text-emerald-500">{data?.advancers || 0}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400">Decliners</span>
                        <span className="font-semibold text-red-500">{data?.decliners || 0}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400">Unchanged</span>
                        <span className="font-semibold text-slate-900 dark:text-white">{data?.unchanged || 0}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400">Total Volume</span>
                        <span className="font-semibold text-slate-900 dark:text-white">
                            {((data?.totalVolume || 0) / 1000000).toFixed(1)}M
                        </span>
                    </div>
                </div>
            </div>

            {/* Top Gainers */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <TrendingUp size={18} className="text-emerald-500" />
                        <span className="font-semibold text-slate-900 dark:text-white">Top Gainers</span>
                    </div>
                    <Link href="/market/gainers" className="text-xs text-emerald-500 hover:text-emerald-600">View All</Link>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-neutral-800">
                    {topGainers.length === 0 ? (
                        <div className="p-4 text-center text-slate-500 text-sm">No data available</div>
                    ) : (
                        topGainers.slice(0, 4).map((stock) => (
                            <Link key={stock.symbol} href={`/stocks/${stock.symbol}`} className="p-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                                <div className="flex items-center gap-2">
                                    <span className="w-7 h-7 rounded bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-[10px] font-bold text-emerald-600 dark:text-emerald-400">{stock.symbol?.slice(0, 2)}</span>
                                    <span className="font-medium text-emerald-600 dark:text-emerald-400">{stock.symbol}</span>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold text-slate-900 dark:text-white">${stock.price?.toFixed(2)}</p>
                                    <p className="text-xs text-emerald-500">+{stock.changePercent?.toFixed(2)}%</p>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </div>

            {/* Top Losers */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <TrendingUp size={18} className="text-red-500 rotate-180" />
                        <span className="font-semibold text-slate-900 dark:text-white">Top Losers</span>
                    </div>
                    <Link href="/market/losers" className="text-xs text-emerald-500 hover:text-emerald-600">View All</Link>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-neutral-800">
                    {topLosers.length === 0 ? (
                        <div className="p-4 text-center text-slate-500 text-sm">No data available</div>
                    ) : (
                        topLosers.slice(0, 4).map((stock) => (
                            <Link key={stock.symbol} href={`/stocks/${stock.symbol}`} className="p-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                                <div className="flex items-center gap-2">
                                    <span className="w-7 h-7 rounded bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-[10px] font-bold text-red-600 dark:text-red-400">{stock.symbol?.slice(0, 2)}</span>
                                    <span className="font-medium text-red-600 dark:text-red-400">{stock.symbol}</span>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold text-slate-900 dark:text-white">${stock.price?.toFixed(2)}</p>
                                    <p className="text-xs text-red-500">{stock.changePercent?.toFixed(2)}%</p>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </div>

            {/* Most Active */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center gap-2">
                    <BarChart2 size={18} className="text-emerald-500" />
                    <span className="font-semibold text-slate-900 dark:text-white">Most Active</span>
                </div>
                {loading ? (
                    <div className="p-4">
                        <div className="text-center text-slate-500 dark:text-slate-400 py-8">
                            <Loader2 className="mx-auto mb-2 animate-spin" size={24} />
                            <p className="text-sm">Loading...</p>
                        </div>
                    </div>
                ) : mostActive.length === 0 ? (
                    <div className="p-4 text-center text-slate-500 text-sm">No data available</div>
                ) : (
                    <div className="divide-y divide-slate-100 dark:divide-neutral-800">
                        {mostActive.slice(0, 4).map((stock) => (
                            <Link key={stock.symbol} href={`/stocks/${stock.symbol}`} className="p-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                                <div className="flex items-center gap-2">
                                    <span className="w-7 h-7 rounded bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-300">{stock.symbol?.slice(0, 2)}</span>
                                    <span className="font-medium text-slate-700 dark:text-slate-300">{stock.symbol}</span>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold text-slate-900 dark:text-white">${stock.price?.toFixed(2)}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{((stock.volume || 0) / 1000000).toFixed(1)}M</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
