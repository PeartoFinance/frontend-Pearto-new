'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, TrendingUp, TrendingDown, X, Star } from 'lucide-react';
import { getWatchlist, addToWatchlist, removeFromWatchlist, type WatchlistItem } from '@/services/portfolioService';

interface ProfileWatchlistProps {
    onAddSymbol?: () => void;
}

export default function ProfileWatchlist({ onAddSymbol }: ProfileWatchlistProps) {
    const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<'symbol' | 'price' | 'change'>('symbol');
    const [filterBy, setFilterBy] = useState<'all' | 'gainers' | 'losers'>('all');
    const [addingSymbol, setAddingSymbol] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => {
        loadWatchlist();
    }, []);

    const loadWatchlist = async () => {
        try {
            const data = await getWatchlist();
            setWatchlist(data);
        } catch (error) {
            console.error('Failed to load watchlist:', error);
            const mockWatchlist: WatchlistItem[] = [
                {
                    id: 1,
                    symbol: 'AAPL',
                    name: 'Apple Inc.',
                    price: 175.43,
                    change: 2.15,
                    changePercent: 1.24,
                    addedAt: new Date().toISOString(),
                },
                {
                    id: 2,
                    symbol: 'GOOGL',
                    name: 'Alphabet Inc.',
                    price: 2847.63,
                    change: -15.32,
                    changePercent: -0.53,
                    addedAt: new Date().toISOString(),
                },
            ];
            setWatchlist(mockWatchlist);
        } finally {
            setLoading(false);
        }
    };

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

    const filteredAndSortedWatchlist = watchlist
        .filter(item => {
            const matchesSearch = item.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                item.name.toLowerCase().includes(searchQuery.toLowerCase());
            
            if (!matchesSearch) return false;
            
            if (filterBy === 'gainers') return item.changePercent > 0;
            if (filterBy === 'losers') return item.changePercent < 0;
            return true;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case 'symbol':
                    return a.symbol.localeCompare(b.symbol);
                case 'price':
                    return b.price - a.price;
                case 'change':
                    return b.changePercent - a.changePercent;
                default:
                    return 0;
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
                    <h2 className="text-2xl font-bold text-white">Watchlist</h2>
                    <p className="text-slate-400 mt-1">Track your favorite stocks</p>
                </div>
                <div className="text-sm text-slate-400">
                    {watchlist.length} symbols
                </div>
            </div>

            <div className="bg-[#111314] border border-slate-800 rounded-lg p-4">
                <div className="flex gap-3">
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            value={addingSymbol}
                            onChange={(e) => setAddingSymbol(e.target.value.toUpperCase())}
                            placeholder="Enter symbol (e.g., AAPL)"
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50 transition"
                            onKeyPress={(e) => e.key === 'Enter' && handleAddSymbol()}
                        />
                    </div>
                    <button
                        onClick={handleAddSymbol}
                        disabled={!addingSymbol.trim() || isAdding}
                        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-700 disabled:text-slate-500 text-black font-medium rounded-lg transition flex items-center gap-2"
                    >
                        {isAdding ? (
                            <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                        ) : (
                            <Plus size={16} />
                        )}
                        Add
                    </button>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" size={16} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search symbols or companies..."
                        className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50 transition"
                    />
                </div>
                <select
                    value={filterBy}
                    onChange={(e) => setFilterBy(e.target.value as 'all' | 'gainers' | 'losers')}
                    className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500/50 transition"
                >
                    <option value="all">All Stocks</option>
                    <option value="gainers">Gainers</option>
                    <option value="losers">Losers</option>
                </select>
                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'symbol' | 'price' | 'change')}
                    className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500/50 transition"
                >
                    <option value="symbol">Sort by Symbol</option>
                    <option value="price">Sort by Price</option>
                    <option value="change">Sort by Change</option>
                </select>
            </div>

            {filteredAndSortedWatchlist.length === 0 ? (
                <div className="text-center py-12 bg-[#111314] border border-slate-800 rounded-lg">
                    <Star className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">
                        {searchQuery || filterBy !== 'all' ? 'No matches found' : 'Your watchlist is empty'}
                    </h3>
                    <p className="text-slate-400 mb-4">
                        {searchQuery || filterBy !== 'all' 
                            ? 'Try adjusting your search or filters' 
                            : 'Add some stocks to start tracking their performance'
                        }
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredAndSortedWatchlist.map((item) => (
                        <WatchlistCard 
                            key={item.id} 
                            item={item} 
                            onRemove={() => handleRemoveSymbol(item.symbol)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

function WatchlistCard({ item, onRemove }: { item: WatchlistItem; onRemove: () => void }) {
    const isGain = item.changePercent >= 0;
    
    return (
        <div className="bg-[#111314] border border-slate-800 rounded-lg p-4 hover:border-slate-700 transition group">
            <div className="flex items-start justify-between mb-3">
                <div className="min-w-0 flex-1">
                    <div className="font-bold text-white text-lg">{item.symbol}</div>
                    <div className="text-xs text-slate-500 truncate">{item.name}</div>
                </div>
                <button
                    onClick={onRemove}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-800 rounded text-slate-500 hover:text-red-400 transition"
                >
                    <X size={14} />
                </button>
            </div>
            
            <div className="space-y-2">
                <div className="text-xl font-bold text-white">
                    ${item.price.toFixed(2)}
                </div>
                
                <div className="flex items-center gap-2">
                    <div className={`flex items-center gap-1 text-sm font-medium ${
                        isGain ? 'text-emerald-500' : 'text-red-500'
                    }`}>
                        {isGain ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        {isGain ? '+' : ''}${item.change.toFixed(2)}
                    </div>
                    <div className={`text-sm ${
                        isGain ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                        ({isGain ? '+' : ''}{item.changePercent.toFixed(2)}%)
                    </div>
                </div>
                
                <div className="text-xs text-slate-500">
                    Added {new Date(item.addedAt).toLocaleDateString()}
                </div>
            </div>
        </div>
    );
}