'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, TrendingUp, Bitcoin, Loader2, ArrowRight } from 'lucide-react';
import { searchStocks, type MarketStock } from '@/services/marketService';

interface SearchModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<MarketStock[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);

    // Auto focus input when modal opens
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
            setQuery('');
            setResults([]);
            setSelectedIndex(0);
        }
    }, [isOpen]);

    // Debounced search
    useEffect(() => {
        if (!query.trim()) {
            setResults([]);
            return;
        }

        const timer = setTimeout(async () => {
            setLoading(true);
            try {
                const data = await searchStocks(query);
                setResults(data.slice(0, 8));
                setSelectedIndex(0);
            } catch (e) {
                console.error('Search failed:', e);
                setResults([]);
            } finally {
                setLoading(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    // Keyboard navigation
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => Math.max(prev - 1, 0));
        } else if (e.key === 'Enter' && results[selectedIndex]) {
            e.preventDefault();
            navigateToStock(results[selectedIndex]);
        } else if (e.key === 'Escape') {
            onClose();
        }
    }, [results, selectedIndex, onClose]);

    const navigateToStock = (stock: MarketStock) => {
        const path = stock.assetType === 'crypto'
            ? `/crypto/${stock.symbol}`
            : `/stocks/${stock.symbol}`;
        router.push(path);
        onClose();
    };

    // Global keyboard shortcut
    useEffect(() => {
        const handleGlobalKeyDown = (e: KeyboardEvent) => {
            if (e.key === '/' && !isOpen && !['INPUT', 'TEXTAREA'].includes((e.target as Element)?.tagName)) {
                e.preventDefault();
                // Parent should handle opening the modal
            }
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        document.addEventListener('keydown', handleGlobalKeyDown);
        return () => document.removeEventListener('keydown', handleGlobalKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed top-[15%] left-1/2 -translate-x-1/2 w-full max-w-xl z-[101] px-4">
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                    {/* Search Input */}
                    <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                        <Search size={20} className="text-slate-400" />
                        <input
                            ref={inputRef}
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Search stocks, crypto, ETFs..."
                            className="flex-1 bg-transparent text-lg text-slate-900 dark:text-white placeholder-slate-400 outline-none"
                        />
                        {loading && <Loader2 size={18} className="text-slate-400 animate-spin" />}
                        <button
                            onClick={onClose}
                            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                        >
                            <X size={18} className="text-slate-400" />
                        </button>
                    </div>

                    {/* Results */}
                    <div className="max-h-[400px] overflow-y-auto">
                        {!query.trim() ? (
                            <div className="p-4">
                                <p className="text-xs uppercase tracking-wider text-slate-500 mb-3">Quick Access</p>
                                <div className="grid grid-cols-2 gap-2">
                                    {['AAPL', 'MSFT', 'TSLA', 'GOOGL'].map(symbol => (
                                        <button
                                            key={symbol}
                                            onClick={() => { router.push(`/stocks/${symbol}`); onClose(); }}
                                            className="flex items-center gap-2 p-3 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition text-left"
                                        >
                                            <TrendingUp size={16} className="text-emerald-500" />
                                            <span className="font-medium text-slate-700 dark:text-white">{symbol}</span>
                                        </button>
                                    ))}
                                </div>
                                <p className="text-xs text-slate-400 mt-4">
                                    Press <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px]">↑</kbd> <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px]">↓</kbd> to navigate, <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px]">Enter</kbd> to select
                                </p>
                            </div>
                        ) : results.length > 0 ? (
                            <div className="py-2">
                                {results.map((stock, index) => (
                                    <button
                                        key={`${stock.symbol}-${index}`}
                                        onClick={() => navigateToStock(stock)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition ${index === selectedIndex
                                                ? 'bg-slate-100 dark:bg-slate-800'
                                                : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                            }`}
                                    >
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stock.assetType === 'crypto'
                                                ? 'bg-amber-500/10'
                                                : 'bg-emerald-500/10'
                                            }`}>
                                            {stock.assetType === 'crypto'
                                                ? <Bitcoin size={18} className="text-amber-500" />
                                                : <TrendingUp size={18} className="text-emerald-500" />
                                            }
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-slate-900 dark:text-white">{stock.symbol}</span>
                                                {stock.exchange && (
                                                    <span className="text-xs text-slate-400 px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">
                                                        {stock.exchange}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-slate-500 truncate">{stock.name}</p>
                                        </div>
                                        <div className="text-right">
                                            {stock.price && (
                                                <p className="font-medium text-slate-900 dark:text-white">
                                                    ${stock.price.toFixed(2)}
                                                </p>
                                            )}
                                            {stock.changePercent !== undefined && (
                                                <p className={`text-sm ${stock.changePercent >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                                    {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                                                </p>
                                            )}
                                        </div>
                                        {index === selectedIndex && (
                                            <ArrowRight size={16} className="text-slate-400" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        ) : query.trim() && !loading ? (
                            <div className="p-8 text-center">
                                <Search size={40} className="text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                                <p className="text-slate-500">No results for "{query}"</p>
                                <p className="text-sm text-slate-400 mt-1">Try a different search term</p>
                            </div>
                        ) : null}
                    </div>

                    {/* Footer */}
                    {results.length > 0 && (
                        <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                            <button
                                onClick={() => { router.push(`/stocks?q=${encodeURIComponent(query)}`); onClose(); }}
                                className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                            >
                                View all results for "{query}" <ArrowRight size={14} />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
