'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Loader2, TrendingUp, X } from 'lucide-react';
import { searchStocks, type MarketStock } from '@/services/marketService';
import { useCurrency } from '@/contexts/CurrencyContext';
import PriceDisplay from '@/components/common/PriceDisplay';

interface BooyahSearchProps {
    onSelect: (symbol: string) => void;
}

const POPULAR_SYMBOLS = [
    { symbol: 'AAPL', name: 'Apple' },
    { symbol: 'TSLA', name: 'Tesla' },
    { symbol: 'GOOGL', name: 'Google' },
    { symbol: 'AMZN', name: 'Amazon' },
    { symbol: 'MSFT', name: 'Microsoft' },
    { symbol: 'NVDA', name: 'NVIDIA' },
    { symbol: 'META', name: 'Meta' },
    { symbol: 'BTC-USD', name: 'Bitcoin' },
];

export default function BooyahSearch({ onSelect }: BooyahSearchProps) {
    const { formatPrice } = useCurrency();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<MarketStock[]>([]);
    const [loading, setLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (!query.trim()) {
            setResults([]);
            return;
        }

        const timeoutId = setTimeout(async () => {
            setLoading(true);
            try {
                const data = await searchStocks(query, 8);
                setResults(data);
                setShowDropdown(true);
            } catch {
                setResults([]);
            } finally {
                setLoading(false);
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [query]);

    const handleSelect = (symbol: string) => {
        setQuery(symbol);
        setShowDropdown(false);
        onSelect(symbol);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            setShowDropdown(false);
            onSelect(query.trim().toUpperCase());
        }
    };

    return (
        <div ref={wrapperRef} className="relative max-w-2xl mx-auto">
            {/* Search Box */}
            <form onSubmit={handleSubmit} className="relative">
                <div className="flex items-center bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <Search className="ml-5 text-slate-400 flex-shrink-0" size={20} />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setShowDropdown(true);
                        }}
                        placeholder="Search any stock, crypto, or ETF symbol..."
                        className="flex-1 px-4 py-4 text-base bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
                    />
                    {query && (
                        <button type="button" onClick={() => { setQuery(''); setResults([]); }} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                            <X size={18} />
                        </button>
                    )}
                    {loading && <Loader2 className="mr-3 text-emerald-500 animate-spin" size={20} />}
                    <button
                        type="submit"
                        className="m-2 px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold rounded-xl transition-all text-sm"
                    >
                        Analyze
                    </button>
                </div>
            </form>

            {/* Popular Symbols */}
            <div className="flex flex-wrap justify-center gap-2 mt-4">
                {POPULAR_SYMBOLS.map(({ symbol, name }) => (
                    <button
                        key={symbol}
                        onClick={() => handleSelect(symbol)}
                        className="px-3 py-1.5 text-xs font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 hover:border-emerald-500 dark:hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                    >
                        {symbol}
                        <span className="text-slate-400 ml-1">{name}</span>
                    </button>
                ))}
            </div>

            {/* Dropdown Results */}
            {showDropdown && results.length > 0 && (
                <div className="absolute top-full mt-2 left-0 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl z-50 max-h-80 overflow-y-auto">
                    {results.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => handleSelect(item.symbol)}
                            className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 flex items-center justify-between transition-colors border-b border-slate-100 dark:border-slate-800 last:border-0"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                                    <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <div>
                                    <span className="font-bold text-slate-900 dark:text-white text-sm">{item.symbol}</span>
                                    <p className="text-xs text-slate-500 truncate max-w-[200px]">{item.name}</p>
                                </div>
                            </div>
                            {item.price && (
                                <div className="text-right">
                                    <span className="text-sm font-semibold text-slate-900 dark:text-white"><PriceDisplay amount={item.price} /></span>
                                    {item.changePercent != null && (
                                        <p className={`text-xs font-medium ${item.changePercent >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                                            {item.changePercent >= 0 ? '+' : ''}{item.changePercent.toFixed(2)}%
                                        </p>
                                    )}
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
