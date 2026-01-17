'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/layout/Sidebar';
import TickerTape from '@/components/layout/TickerTape';
import Header from '@/components/layout/Header';
import StockTable from '@/components/stocks/StockTable';
import { AIWidget } from '@/components/ai';
import {
    getStocks,
    getTopMovers,
    getMostActive,
    searchStocks,
    type MarketStock
} from '@/services/marketService';
import { TrendingUp, TrendingDown, Activity, Search, RefreshCw, BarChart3 } from 'lucide-react';

type TabType = 'all' | 'gainers' | 'losers' | 'active' | 'etfs';

export default function StocksPage() {
    const [stocks, setStocks] = useState<MarketStock[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<TabType>('all');
    const [searchQuery, setSearchQuery] = useState('');

    const loadStocks = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            let data: MarketStock[] = [];

            switch (activeTab) {
                case 'gainers': {
                    const movers = await getTopMovers('gainers', 50);
                    data = movers.gainers || [];
                    break;
                }
                case 'losers': {
                    const movers = await getTopMovers('losers', 50);
                    data = movers.losers || [];
                    break;
                }
                case 'active': {
                    data = await getMostActive(50);
                    break;
                }
                default: {
                    data = await getStocks(undefined, 100);
                }
            }

            setStocks(data);
        } catch (err) {
            console.error('Failed to load stocks:', err);
            setError('Failed to load stocks data');
        } finally {
            setLoading(false);
        }
    }, [activeTab]);

    useEffect(() => {
        loadStocks();
    }, [loadStocks]);

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            loadStocks();
            return;
        }

        setLoading(true);
        try {
            const results = await searchStocks(searchQuery, 50);
            setStocks(results);
        } catch (err) {
            console.error('Search failed:', err);
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: 'all' as TabType, label: 'All Stocks', icon: BarChart3 },
        { id: 'gainers' as TabType, label: 'Gainers', icon: TrendingUp },
        { id: 'losers' as TabType, label: 'Losers', icon: TrendingDown },
        { id: 'active' as TabType, label: 'Most Active', icon: Activity },
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
                    <div className="p-4 lg:p-6 space-y-6 w-full">
                        {/* Page Header */}
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-3">
                                    <BarChart3 className="w-7 h-7 text-emerald-600" />
                                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                        Stocks
                                    </h1>
                                </div>
                                <p className="text-gray-500 dark:text-gray-400 mt-1">
                                    Browse and analyze stocks, track top movers
                                </p>
                            </div>

                            {/* Search and Refresh */}
                            <div className="flex gap-3 items-center">
                                <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg w-full sm:w-64">
                                    <Search size={16} className="text-slate-400" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                        placeholder="Search symbol or name..."
                                        className="flex-1 bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 outline-none text-sm"
                                    />
                                </div>
                                <button
                                    onClick={handleSearch}
                                    className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors text-sm"
                                >
                                    Search
                                </button>
                                <button
                                    onClick={loadStocks}
                                    disabled={loading}
                                    className="flex items-center gap-2 px-3 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-white rounded-lg transition-colors text-sm"
                                >
                                    <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                                </button>
                            </div>
                        </div>

                        {/* Tab Navigation */}
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => {
                                            setActiveTab(tab.id);
                                            setSearchQuery('');
                                        }}
                                        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition ${isActive
                                                ? 'bg-emerald-600 text-white'
                                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800'
                                            }`}
                                    >
                                        <Icon size={16} />
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Error State */}
                        {error && (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                                <p className="text-red-600 dark:text-red-400">{error}</p>
                            </div>
                        )}

                        {/* Stocks Table */}
                        <StockTable stocks={stocks} loading={loading} />

                        {/* Empty State */}
                        {!loading && stocks.length === 0 && !error && (
                            <div className="text-center py-16">
                                <BarChart3 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                                    No stocks found
                                </h3>
                                <p className="text-slate-500">
                                    {searchQuery ? `No results for "${searchQuery}"` : 'No stocks available'}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Floating AI Widget */}
            <AIWidget
                type="floating"
                position="bottom-right"
                pageType="stocks"
                quickPrompts={["Top gainers today", "Best performing sectors"]}
            />
        </div>
    );
}
