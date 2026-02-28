'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/layout/Sidebar';
import TickerTape from '@/components/layout/TickerTape';
import Header from '@/components/layout/Header';
import { AIWidget } from '@/components/ai';
import PriceDisplay from '@/components/common/PriceDisplay';
import RelatedTools from '@/components/tools/RelatedTools';
import {
    getCryptoMarkets,
    searchStocks,
    type MarketStock,
} from '@/services/marketService';
import {
import Footer from '@/components/layout/Footer';
    Coins, TrendingUp, TrendingDown, Search, RefreshCw,
    Loader2, ArrowUpDown
} from 'lucide-react';

type SortKey = 'market_cap' | 'price' | 'change' | 'volume';

export default function CryptoPage() {
    const [coins, setCoins] = useState<MarketStock[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<SortKey>('market_cap');

    const loadCoins = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getCryptoMarkets(100, 1, sortBy);
            setCoins(data);
        } catch (err) {
            console.error('Failed to load crypto:', err);
            setError('Failed to load cryptocurrency data');
        } finally {
            setLoading(false);
        }
    }, [sortBy]);

    useEffect(() => {
        loadCoins();
    }, [loadCoins]);

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            loadCoins();
            return;
        }
        setLoading(true);
        try {
            const results = await searchStocks(searchQuery, 50);
            // Filter to only crypto results (symbols ending with -USD or containing crypto markers)
            const cryptoResults = results.filter(
                (r) =>
                    r.symbol?.includes('-USD') ||
                    r.symbol?.includes('-USDT') ||
                    r.assetType === 'crypto'
            );
            setCoins(cryptoResults.length > 0 ? cryptoResults : results);
        } catch (err) {
            console.error('Search failed:', err);
        } finally {
            setLoading(false);
        }
    };



    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-slate-900">
            <Sidebar />

            <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
                {/* Fixed Header */}
                <div className="fixed top-0 right-0 left-0 lg:left-64 z-40 bg-gray-50 dark:bg-slate-900">
                    <TickerTape />
                    <Header />
                </div>

                {/* Content */}
                <div className="flex-1 pt-[112px] md:pt-[120px] overflow-x-hidden">
                    <div className="p-4 lg:p-6 space-y-6 w-full">
                        {/* Page Header */}
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-3">
                                    <Coins className="w-7 h-7 text-amber-500" />
                                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                        Cryptocurrency
                                    </h1>
                                </div>
                                <p className="text-gray-500 dark:text-gray-400 mt-1">
                                    Real-time prices, market cap, and volume for top cryptocurrencies
                                </p>
                            </div>

                            {/* Search & Refresh */}
                            <div className="flex gap-3 items-center">
                                <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg w-full sm:w-64">
                                    <Search size={16} className="text-slate-400" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                        placeholder="Search crypto..."
                                        className="flex-1 bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 outline-none text-sm"
                                    />
                                </div>
                                <button
                                    onClick={handleSearch}
                                    className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors text-sm"
                                >
                                    Search
                                </button>
                                <button
                                    onClick={loadCoins}
                                    disabled={loading}
                                    className="flex items-center gap-2 px-3 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-white rounded-lg transition-colors text-sm"
                                >
                                    <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                                </button>
                            </div>
                        </div>

                        {/* Sort Tabs */}
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {[
                                { id: 'market_cap' as SortKey, label: 'Market Cap' },
                                { id: 'price' as SortKey, label: 'Price' },
                                { id: 'change' as SortKey, label: 'Change %' },
                                { id: 'volume' as SortKey, label: 'Volume' },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => {
                                        setSortBy(tab.id);
                                        setSearchQuery('');
                                    }}
                                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition ${sortBy === tab.id
                                            ? 'bg-amber-500 text-white'
                                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800'
                                        }`}
                                >
                                    <ArrowUpDown size={14} />
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                                <p className="text-red-600 dark:text-red-400">{error}</p>
                            </div>
                        )}

                        {/* Crypto Table */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                            {loading ? (
                                <div className="flex items-center justify-center py-20">
                                    <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                                </div>
                            ) : coins.length === 0 ? (
                                <div className="text-center py-16">
                                    <Coins className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                                        No cryptocurrencies found
                                    </h3>
                                    <p className="text-slate-500">
                                        {searchQuery ? `No results for "${searchQuery}"` : 'No data available'}
                                    </p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                                                <th className="px-4 py-3 w-8">#</th>
                                                <th className="px-4 py-3">Name</th>
                                                <th className="px-4 py-3 text-right">Price</th>
                                                <th className="px-4 py-3 text-right">24h Change</th>
                                                <th className="px-4 py-3 text-right hidden md:table-cell">Market Cap</th>
                                                <th className="px-4 py-3 text-right hidden lg:table-cell">Volume (24h)</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                                            {coins.map((coin, index) => {
                                                const isPositive = (coin.changePercent ?? 0) >= 0;
                                                const displaySymbol = coin.symbol?.replace('-USD', '').replace('-USDT', '') || coin.symbol;

                                                return (
                                                    <tr
                                                        key={`${coin.symbol}-${index}`}
                                                        className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                                                    >
                                                        <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
                                                            {index + 1}
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <Link
                                                                href={`/crypto/${coin.symbol}`}
                                                                className="flex items-center gap-3 group"
                                                            >
                                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                                                    {displaySymbol.substring(0, 2)}
                                                                </div>
                                                                <div>
                                                                    <p className="font-semibold text-slate-900 dark:text-white group-hover:text-amber-600 transition-colors text-sm">
                                                                        {coin.name || displaySymbol}
                                                                    </p>
                                                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                                                        {displaySymbol}
                                                                    </p>
                                                                </div>
                                                            </Link>
                                                        </td>
                                                        <td className="px-4 py-3 text-right">
                                                            <span className="font-semibold text-slate-900 dark:text-white text-sm">
                                                                <PriceDisplay amount={coin.price} />
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-right">
                                                            <span
                                                                className={`inline-flex items-center gap-1 text-sm font-medium ${isPositive ? 'text-emerald-600' : 'text-red-500'
                                                                    }`}
                                                            >
                                                                {isPositive ? (
                                                                    <TrendingUp size={14} />
                                                                ) : (
                                                                    <TrendingDown size={14} />
                                                                )}
                                                                {isPositive ? '+' : ''}
                                                                {(coin.changePercent ?? 0).toFixed(2)}%
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-right hidden md:table-cell text-sm text-slate-600 dark:text-slate-400">
                                                            <PriceDisplay amount={coin.marketCap} options={{ notation: 'compact' }} />
                                                        </td>
                                                        <td className="px-4 py-3 text-right hidden lg:table-cell text-sm text-slate-600 dark:text-slate-400">
                                                            <PriceDisplay amount={coin.volume} options={{ notation: 'compact' }} />
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* Related Tools */}
                        <div className="pt-4">
                            <RelatedTools
                                category="Crypto"
                                title="Cryptocurrency Tools"
                                layout="grid"
                                limit={4}
                            />
                        </div>
                    </div>
                </div>
              <Footer />
      </main>

            {/* Floating AI Widget */}
            <AIWidget
                type="floating"
                position="bottom-right"
                pageType="crypto"
                quickPrompts={['Top crypto by market cap', 'Bitcoin price analysis']}
            />
        </div>
    );
}
