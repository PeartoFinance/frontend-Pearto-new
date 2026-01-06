'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowUpRight, ArrowDownRight, TrendingUp, BarChart2, Loader2 } from 'lucide-react';
import { getMarketOverview, getMarketIndices, MarketOverviewData, MarketIndex } from '@/services/marketService';

export default function MarketOverview() {
    const [data, setData] = useState<MarketOverviewData | null>(null);
    const [indices, setIndices] = useState<MarketIndex[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [overviewData, indicesData] = await Promise.all([
                    getMarketOverview(),
                    getMarketIndices()
                ]);
                setData(overviewData);
                setIndices(indicesData.slice(0, 4));
            } catch (err) {
                console.error('Failed to fetch market overview:', err);
                // Fallback to mock data
                setIndices([
                    { id: 1, symbol: 'SPX', name: 'S&P 500', value: 5247.23, change: 23.45, changePercent: 0.83 },
                    { id: 2, symbol: 'DJI', name: 'Dow Jones', value: 42012.36, change: -32.21, changePercent: -0.08 },
                    { id: 3, symbol: 'IXIC', name: 'NASDAQ', value: 16498.45, change: 121.23, changePercent: 0.74 },
                    { id: 4, symbol: 'RUT', name: 'Russell 2000', value: 2124.78, change: 8.89, changePercent: 0.42 },
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const topGainers = data?.topGainers || [];
    const topLosers = data?.topLosers || [];
    const mostActive = data?.mostActive || [];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Market Indices */}
            <div className="card lg:col-span-2">
                <div className="card-header flex items-center gap-2">
                    <BarChart2 size={18} className="text-emerald-500" />
                    <span>Market Indices</span>
                </div>
                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="animate-spin text-emerald-500" size={24} />
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-200 dark:divide-gray-800">
                        {indices.map((index) => (
                            <div key={index.symbol} className="p-4 text-center">
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{index.name}</p>
                                <p className="text-xl font-bold mb-1">{index.value?.toLocaleString()}</p>
                                <div className={`flex items-center justify-center gap-1 text-sm font-medium ${(index.changePercent || 0) >= 0 ? 'price-positive' : 'price-negative'
                                    }`}>
                                    {(index.changePercent || 0) >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                    {Math.abs(index.change || 0).toFixed(2)} ({Math.abs(index.changePercent || 0).toFixed(2)}%)
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Market Stats */}
            <div className="card">
                <div className="card-header">Today's Summary</div>
                <div className="p-4 space-y-3">
                    <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Advancers</span>
                        <span className="font-semibold text-emerald-500">{data?.advancers || 0}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Decliners</span>
                        <span className="font-semibold text-red-500">{data?.decliners || 0}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Unchanged</span>
                        <span className="font-semibold">{data?.unchanged || 0}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Total Volume</span>
                        <span className="font-semibold">{((data?.totalVolume || 0) / 1000000).toFixed(1)}M</span>
                    </div>
                </div>
            </div>

            {/* Top Gainers */}
            <div className="card">
                <div className="card-header flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <TrendingUp size={18} className="text-emerald-500" />
                        <span>Top Gainers</span>
                    </div>
                    <Link href="/market/gainers" className="text-xs text-emerald-500">View All</Link>
                </div>
                <div className="divide-y divide-gray-200 dark:divide-gray-800">
                    {topGainers.slice(0, 4).map((stock) => (
                        <div key={stock.symbol} className="p-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-900">
                            <div className="symbol-badge">
                                <span className="symbol-icon">{stock.symbol?.slice(0, 2)}</span>
                                {stock.symbol}
                            </div>
                            <div className="text-right">
                                <p className="font-semibold">${stock.price?.toFixed(2)}</p>
                                <p className="text-xs price-positive">+{stock.changePercent?.toFixed(2)}%</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Top Losers */}
            <div className="card">
                <div className="card-header flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <TrendingUp size={18} className="text-red-500 rotate-180" />
                        <span>Top Losers</span>
                    </div>
                    <Link href="/market/losers" className="text-xs text-emerald-500">View All</Link>
                </div>
                <div className="divide-y divide-gray-200 dark:divide-gray-800">
                    {topLosers.slice(0, 4).map((stock) => (
                        <div key={stock.symbol} className="p-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-900">
                            <div className="symbol-badge">
                                <span className="symbol-icon">{stock.symbol?.slice(0, 2)}</span>
                                {stock.symbol}
                            </div>
                            <div className="text-right">
                                <p className="font-semibold">${stock.price?.toFixed(2)}</p>
                                <p className="text-xs price-negative">{stock.changePercent?.toFixed(2)}%</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Most Active */}
            <div className="card">
                <div className="card-header flex items-center gap-2">
                    <BarChart2 size={18} className="text-emerald-500" />
                    <span>Most Active</span>
                </div>
                {loading ? (
                    <div className="p-4">
                        <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                            <Loader2 className="mx-auto mb-2 animate-spin" size={24} />
                            <p className="text-sm">Loading...</p>
                        </div>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200 dark:divide-gray-800">
                        {mostActive.slice(0, 4).map((stock) => (
                            <div key={stock.symbol} className="p-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-900">
                                <div className="symbol-badge">
                                    <span className="symbol-icon">{stock.symbol?.slice(0, 2)}</span>
                                    {stock.symbol}
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold">${stock.price?.toFixed(2)}</p>
                                    <p className="text-xs text-gray-500">{((stock.volume || 0) / 1000000).toFixed(1)}M</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
