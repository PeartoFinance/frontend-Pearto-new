'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Search, TrendingUp, TrendingDown, X, Star, Bell, ExternalLink } from 'lucide-react';
import { getWatchlist, addToWatchlist, removeFromWatchlist, type WatchlistItem } from '@/services/portfolioService';
import { createAlert } from '@/services/alertsService';
import PriceDisplay from '@/components/common/PriceDisplay';

interface ProfileWatchlistProps {
    onAddSymbol?: () => void;
}

export default function ProfileWatchlist({ onAddSymbol }: ProfileWatchlistProps) {
    const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<'symbol' | 'price' | 'change'>('symbol');
    const [filterBy, setFilterBy] = useState<'all' | 'gainers' | 'losers'>('all');
    const [addingSymbol, setAddingSymbol] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    // Quick alert modal state
    const [alertModal, setAlertModal] = useState<{ symbol: string; price: number } | null>(null);
    const [alertCondition, setAlertCondition] = useState<'above' | 'below'>('above');
    const [alertPrice, setAlertPrice] = useState('');
    const [creatingAlert, setCreatingAlert] = useState(false);

    const loadWatchlist = useCallback(async (showRefreshing = false) => {
        if (showRefreshing) setRefreshing(true);
        try {
            const data = await getWatchlist();
            setWatchlist(data);
        } catch (error) {
            console.error('Failed to load watchlist:', error);
            setWatchlist([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        loadWatchlist();
    }, [loadWatchlist]);

    // Auto-refresh every 30 seconds
    useEffect(() => {
        if (watchlist.length === 0) return;
        const interval = setInterval(() => {
            loadWatchlist(true);
        }, 30000);
        return () => clearInterval(interval);
    }, [watchlist.length, loadWatchlist]);

    const handleAddSymbol = async () => {
        if (!addingSymbol.trim()) return;
        setIsAdding(true);
        try {
            await addToWatchlist(addingSymbol.toUpperCase());
            setAddingSymbol('');
            await loadWatchlist();
        } catch (error) {
            console.error('Failed to add symbol:', error);
        } finally {
            setIsAdding(false);
        }
    };

    const handleRemoveSymbol = async (symbol: string) => {
        try {
            await removeFromWatchlist(symbol);
            await loadWatchlist();
        } catch (error) {
            console.error('Failed to remove symbol:', error);
        }
    };

    const handleOpenAlertModal = (item: WatchlistItem) => {
        setAlertModal({ symbol: item.symbol, price: item.price || 0 });
        setAlertPrice((item.price || 0).toFixed(2));
        setAlertCondition('above');
    };

    const handleCreateQuickAlert = async () => {
        if (!alertModal || !alertPrice) return;
        setCreatingAlert(true);
        try {
            await createAlert({
                symbol: alertModal.symbol,
                condition: alertCondition,
                targetValue: parseFloat(alertPrice),
            });
            setAlertModal(null);
        } catch (error) {
            console.error('Failed to create alert:', error);
        } finally {
            setCreatingAlert(false);
        }
    };

    const filteredAndSortedWatchlist = watchlist
        .filter(item => {
            const matchesSearch = item.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (item.name || '').toLowerCase().includes(searchQuery.toLowerCase());
            if (!matchesSearch) return false;
            if (filterBy === 'gainers') return (item.changePercent || 0) > 0;
            if (filterBy === 'losers') return (item.changePercent || 0) < 0;
            return true;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case 'symbol': return a.symbol.localeCompare(b.symbol);
                case 'price': return (b.price || 0) - (a.price || 0);
                case 'change': return (b.changePercent || 0) - (a.changePercent || 0);
                default: return 0;
            }
        });

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="w-6 h-6 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Watchlist</h2>
                    <p className="text-slate-400 mt-1">Track your favorite stocks</p>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        href="/watchlist"
                        className="flex items-center gap-2 px-4 py-2 border border-slate-600 text-slate-300 hover:bg-slate-700 font-medium rounded-lg transition text-sm"
                    >
                        <ExternalLink size={14} />
                        View Full Watchlist
                    </Link>
                    <span className="text-sm text-slate-400">
                        {watchlist.length} symbols {refreshing && '• Refreshing...'}
                    </span>
                </div>
            </div>

            {/* Add Symbol */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                <div className="flex gap-3">
                    <input
                        type="text"
                        value={addingSymbol}
                        onChange={(e) => setAddingSymbol(e.target.value.toUpperCase())}
                        placeholder="Enter symbol (e.g., AAPL)"
                        className="flex-1 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 text-slate-900 dark:text-white"
                        onKeyPress={(e) => e.key === 'Enter' && handleAddSymbol()}
                    />
                    <button
                        onClick={handleAddSymbol}
                        disabled={!addingSymbol.trim() || isAdding}
                        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-medium rounded-lg flex items-center gap-2"
                    >
                        <Plus size={16} /> Add
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search..."
                        className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white"
                    />
                </div>
                <select value={filterBy} onChange={(e) => setFilterBy(e.target.value as typeof filterBy)} className="px-3 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white">
                    <option value="all">All</option>
                    <option value="gainers">Gainers</option>
                    <option value="losers">Losers</option>
                </select>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)} className="px-3 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white">
                    <option value="symbol">Symbol</option>
                    <option value="price">Price</option>
                    <option value="change">Change</option>
                </select>
            </div>

            {/* Watchlist Grid */}
            {filteredAndSortedWatchlist.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
                    <Star className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                    <p className="text-slate-400">No stocks in watchlist</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredAndSortedWatchlist.map((item) => (
                        <WatchlistCard
                            key={item.id}
                            item={item}
                            onRemove={() => handleRemoveSymbol(item.symbol)}
                            onSetAlert={() => handleOpenAlertModal(item)}
                        />
                    ))}
                </div>
            )}

            {/* Quick Alert Modal */}
            {alertModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-xl max-w-sm w-full">
                        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                            <div className="flex items-center gap-2">
                                <Bell className="text-emerald-500" size={20} />
                                <h3 className="font-semibold text-slate-900 dark:text-white">Alert for {alertModal.symbol}</h3>
                            </div>
                            <button onClick={() => setAlertModal(null)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white"><X size={20} /></button>
                        </div>
                        <div className="p-4 space-y-4">
                            <div className="text-sm text-slate-500 dark:text-slate-400">Current: <span className="text-slate-900 dark:text-white font-bold"><PriceDisplay amount={alertModal.price} /></span></div>
                            <div className="grid grid-cols-2 gap-3">
                                <button onClick={() => setAlertCondition('above')} className={`p-3 rounded-lg border text-sm ${alertCondition === 'above' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'border-slate-600 text-slate-400'}`}>📈 Above</button>
                                <button onClick={() => setAlertCondition('below')} className={`p-3 rounded-lg border text-sm ${alertCondition === 'below' ? 'bg-red-500/10 border-red-500 text-red-400' : 'border-slate-600 text-slate-400'}`}>📉 Below</button>
                            </div>
                            <input type="number" value={alertPrice} onChange={(e) => setAlertPrice(e.target.value)} className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-lg font-bold" />
                        </div>
                        <div className="flex justify-end gap-3 p-4 border-t border-slate-700">
                            <button onClick={() => setAlertModal(null)} className="px-4 py-2 text-slate-400">Cancel</button>
                            <button onClick={handleCreateQuickAlert} disabled={creatingAlert} className="px-4 py-2 bg-emerald-500 text-black font-medium rounded-lg flex items-center gap-2">
                                <Bell size={16} /> Create
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function WatchlistCard({ item, onRemove, onSetAlert }: { item: WatchlistItem; onRemove: () => void; onSetAlert: () => void }) {
    const router = useRouter();
    const isGain = (item.changePercent || 0) >= 0;

    return (
        <div
            onClick={() => router.push(`/stocks/${item.symbol}`)}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:border-emerald-500/50 transition group cursor-pointer"
        >
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-sm font-bold text-amber-600 dark:text-amber-400">
                        {item.symbol.slice(0, 2)}
                    </div>
                    <div>
                        <div className="font-bold text-slate-900 dark:text-white text-lg">{item.symbol}</div>
                        <div className="text-xs text-slate-500 truncate">{item.name}</div>
                    </div>
                </div>
                <div className="flex gap-1">
                    <button onClick={(e) => { e.stopPropagation(); onSetAlert(); }} title="Set alert" className="p-1.5 hover:bg-emerald-500/10 rounded text-slate-400 hover:text-emerald-500"><Bell size={14} /></button>
                    <button onClick={(e) => { e.stopPropagation(); onRemove(); }} className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-slate-700 rounded text-slate-500 hover:text-red-400"><X size={14} /></button>
                </div>
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-white">
                <PriceDisplay amount={item.price || 0} />
            </div>
            <div className="flex items-center gap-2 mt-1">
                <div className={`flex items-center gap-1 text-sm font-medium ${isGain ? 'text-emerald-500' : 'text-red-500'}`}>
                    {isGain ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    <PriceDisplay amount={item.change || 0} prefix={isGain ? '+' : ''} />
                </div>
                <div className={`text-sm ${isGain ? 'text-emerald-400' : 'text-red-400'}`}>
                    ({isGain ? '+' : ''}{(item.changePercent || 0).toFixed(2)}%)
                </div>
            </div>
        </div>
    );
}