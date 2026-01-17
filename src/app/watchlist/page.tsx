'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/layout/Sidebar';
import TickerTape from '@/components/layout/TickerTape';
import Header from '@/components/layout/Header';
import { AIWidget } from '@/components/ai';
import { getWatchlist, addToWatchlist, removeFromWatchlist, type WatchlistItem } from '@/services/portfolioService';
import { searchStocks, type MarketStock } from '@/services/marketService';
import {
    Star, Plus, Trash2, TrendingUp, TrendingDown, Search, Loader2, X,
    Grid3X3, List, Bell, ExternalLink, AlertCircle
} from 'lucide-react';

export default function WatchlistPage() {
    const router = useRouter();
    const [items, setItems] = useState<WatchlistItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchFilter, setSearchFilter] = useState('');

    // Add symbol modal
    const [showAddModal, setShowAddModal] = useState(false);
    const [stockSearch, setStockSearch] = useState('');
    const [searchResults, setSearchResults] = useState<MarketStock[]>([]);
    const [searching, setSearching] = useState(false);
    const [adding, setAdding] = useState(false);

    useEffect(() => {
        loadWatchlist();
    }, []);

    useEffect(() => {
        const search = async () => {
            if (stockSearch.length < 2) {
                setSearchResults([]);
                return;
            }
            setSearching(true);
            try {
                const results = await searchStocks(stockSearch, 10);
                setSearchResults(results);
            } catch (err) {
                console.error('Search failed:', err);
            } finally {
                setSearching(false);
            }
        };
        const debounce = setTimeout(search, 300);
        return () => clearTimeout(debounce);
    }, [stockSearch]);

    const loadWatchlist = async () => {
        setLoading(true);
        try {
            const data = await getWatchlist();
            setItems(data);
        } catch (err) {
            console.error('Failed to load watchlist:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddSymbol = async (symbol: string) => {
        setAdding(true);
        try {
            await addToWatchlist(symbol);
            await loadWatchlist();
            setShowAddModal(false);
            setStockSearch('');
            setSearchResults([]);
        } catch (err) {
            console.error('Failed to add to watchlist:', err);
        } finally {
            setAdding(false);
        }
    };

    const handleRemoveSymbol = async (symbol: string) => {
        try {
            await removeFromWatchlist(symbol);
            setItems(items.filter(i => i.symbol !== symbol));
        } catch (err) {
            console.error('Failed to remove from watchlist:', err);
        }
    };

    const filteredItems = items.filter(item =>
        item.symbol.toLowerCase().includes(searchFilter.toLowerCase()) ||
        item.name.toLowerCase().includes(searchFilter.toLowerCase())
    );

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-slate-900">
            <Sidebar />

            <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
                <div className="fixed top-0 right-0 left-0 lg:left-64 z-40 bg-gray-50 dark:bg-slate-900">
                    <TickerTape />
                    <Header />
                </div>

                <div className="flex-1 pt-[112px] md:pt-[120px] overflow-x-hidden">
                    <div className="p-4 lg:p-6 space-y-6 w-full max-w-7xl mx-auto">
                        {/* Header */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                                    <div className="p-2 bg-amber-500/10 rounded-lg">
                                        <Star className="w-6 h-6 text-amber-500" />
                                    </div>
                                    My Watchlist
                                </h1>
                                <p className="text-slate-500 mt-1">Track stocks you're interested in</p>
                            </div>

                            <div className="flex items-center gap-3">
                                {/* Search */}
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="text"
                                        value={searchFilter}
                                        onChange={(e) => setSearchFilter(e.target.value)}
                                        placeholder="Filter watchlist..."
                                        className="pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-sm focus:outline-none focus:border-emerald-500 w-48"
                                    />
                                </div>

                                {/* View Toggle */}
                                <div className="flex border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={`p-2 transition ${viewMode === 'grid' ? 'bg-emerald-500 text-white' : 'bg-white dark:bg-slate-800 text-slate-500 hover:text-slate-700'}`}
                                    >
                                        <Grid3X3 size={18} />
                                    </button>
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`p-2 transition ${viewMode === 'list' ? 'bg-emerald-500 text-white' : 'bg-white dark:bg-slate-800 text-slate-500 hover:text-slate-700'}`}
                                    >
                                        <List size={18} />
                                    </button>
                                </div>

                                {/* Add Button */}
                                <button
                                    onClick={() => setShowAddModal(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition"
                                >
                                    <Plus size={16} />
                                    Add Symbol
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                            </div>
                        ) : filteredItems.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                                <AlertCircle className="w-12 h-12 text-slate-300 mb-4" />
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                                    {searchFilter ? 'No matches found' : 'Your watchlist is empty'}
                                </h3>
                                <p className="text-slate-500 mb-4">
                                    {searchFilter ? 'Try a different search term' : 'Add stocks to start tracking'}
                                </p>
                                {!searchFilter && (
                                    <button
                                        onClick={() => setShowAddModal(true)}
                                        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition"
                                    >
                                        Add Your First Stock
                                    </button>
                                )}
                            </div>
                        ) : viewMode === 'grid' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {filteredItems.map((item) => (
                                    <WatchlistCard
                                        key={item.symbol}
                                        item={item}
                                        onRemove={() => handleRemoveSymbol(item.symbol)}
                                        onClick={() => router.push(`/stocks/${item.symbol}`)}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                                <table className="w-full">
                                    <thead className="bg-slate-50 dark:bg-slate-800/50">
                                        <tr className="text-left">
                                            <th className="px-6 py-3 text-xs font-medium text-slate-500 uppercase">Symbol</th>
                                            <th className="px-6 py-3 text-xs font-medium text-slate-500 uppercase">Price</th>
                                            <th className="px-6 py-3 text-xs font-medium text-slate-500 uppercase">Change</th>
                                            <th className="px-6 py-3 text-xs font-medium text-slate-500 uppercase">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                        {filteredItems.map((item) => (
                                            <tr
                                                key={item.symbol}
                                                onClick={() => router.push(`/stocks/${item.symbol}`)}
                                                className="hover:bg-slate-50 dark:hover:bg-slate-800/30 cursor-pointer transition"
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-xs font-bold text-amber-600 dark:text-amber-400">
                                                            {item.symbol.slice(0, 2)}
                                                        </div>
                                                        <div>
                                                            <div className="font-medium text-slate-900 dark:text-white">{item.symbol}</div>
                                                            <div className="text-sm text-slate-500 truncate max-w-[200px]">{item.name}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-slate-900 dark:text-white font-medium">
                                                    ${item.price?.toFixed(2) || '-'}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className={`flex items-center gap-1 ${item.changePercent >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                                        {item.changePercent >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                                        <span className="font-medium">
                                                            {item.changePercent >= 0 ? '+' : ''}{item.changePercent?.toFixed(2)}%
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); router.push(`/stocks/${item.symbol}`); }}
                                                            className="p-2 text-slate-400 hover:text-emerald-500 transition"
                                                            title="View Details"
                                                        >
                                                            <ExternalLink size={16} />
                                                        </button>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleRemoveSymbol(item.symbol); }}
                                                            className="p-2 text-slate-400 hover:text-red-500 transition"
                                                            title="Remove"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Add Symbol Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Add to Watchlist</h3>
                            <button onClick={() => { setShowAddModal(false); setStockSearch(''); setSearchResults([]); }} className="text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="relative mb-4">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                value={stockSearch}
                                onChange={(e) => setStockSearch(e.target.value)}
                                placeholder="Search for a stock..."
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                            />
                            {searching && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                    <Loader2 className="w-4 h-4 text-emerald-500 animate-spin" />
                                </div>
                            )}
                        </div>

                        {searchResults.length > 0 && (
                            <div className="max-h-60 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-lg">
                                {searchResults.map((stock) => (
                                    <button
                                        key={stock.symbol}
                                        onClick={() => handleAddSymbol(stock.symbol)}
                                        disabled={adding || items.some(i => i.symbol === stock.symbol)}
                                        className="w-full px-4 py-3 text-left hover:bg-slate-100 dark:hover:bg-slate-700 transition flex items-center justify-between disabled:opacity-50"
                                    >
                                        <div>
                                            <div className="font-medium text-slate-900 dark:text-white">{stock.symbol}</div>
                                            <div className="text-sm text-slate-500 truncate">{stock.name}</div>
                                        </div>
                                        {items.some(i => i.symbol === stock.symbol) ? (
                                            <span className="text-xs text-emerald-500 font-medium">Added</span>
                                        ) : (
                                            <Plus size={16} className="text-slate-400" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}

                        {stockSearch.length >= 2 && searchResults.length === 0 && !searching && (
                            <div className="text-center py-8 text-slate-500">
                                No stocks found for "{stockSearch}"
                            </div>
                        )}
                    </div>
                </div>
            )}

            <AIWidget
                type="floating"
                position="bottom-right"
                pageType="watchlist"
                pageData={{}}
                quickPrompts={['What stocks should I watch?', 'Analyze my watchlist']}
            />
        </div>
    );
}

function WatchlistCard({ item, onRemove, onClick }: { item: WatchlistItem; onRemove: () => void; onClick: () => void }) {
    const isPositive = item.changePercent >= 0;

    return (
        <div
            onClick={onClick}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 hover:border-emerald-500/50 cursor-pointer transition group"
        >
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-sm font-bold text-amber-600 dark:text-amber-400">
                        {item.symbol.slice(0, 2)}
                    </div>
                    <div>
                        <h4 className="font-semibold text-slate-900 dark:text-white">{item.symbol}</h4>
                        <p className="text-xs text-slate-500 truncate max-w-[120px]">{item.name}</p>
                    </div>
                </div>
                <button
                    onClick={(e) => { e.stopPropagation(); onRemove(); }}
                    className="p-1.5 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                >
                    <Trash2 size={14} />
                </button>
            </div>

            <div className="flex items-end justify-between">
                <div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                        ${item.price?.toFixed(2) || '-'}
                    </p>
                </div>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${isPositive ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 'bg-red-100 dark:bg-red-900/30 text-red-600'}`}>
                    {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    <span className="text-sm font-semibold">
                        {isPositive ? '+' : ''}{item.changePercent?.toFixed(2)}%
                    </span>
                </div>
            </div>
        </div>
    );
}
