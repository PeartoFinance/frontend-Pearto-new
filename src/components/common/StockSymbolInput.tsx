'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { searchStocks, type MarketStock } from '@/services/marketService';
import PriceDisplay from '@/components/common/PriceDisplay';

interface StockSymbolInputProps {
    value: string;
    onChange: (symbol: string) => void;
    onSelectStock?: (stock: MarketStock) => void;
    placeholder?: string;
    className?: string;
    assetType?: 'stock' | 'crypto' | 'forex' | 'commodity' | 'index';
}

export { type MarketStock };

export default function StockSymbolInput({
    value,
    onChange,
    onSelectStock,
    placeholder = 'Search symbol...',
    className = '',
    assetType
}: StockSymbolInputProps) {
    const [query, setQuery] = useState(value);
    const [results, setResults] = useState<MarketStock[]>([]);
    const [loading, setLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Sync query with prop value
    useEffect(() => {
        setQuery(value);
    }, [value]);

    // Handle outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Debounced search
    useEffect(() => {
        const fetchResults = async () => {
            if (!query.trim()) {
                setResults([]);
                return;
            }

            // Only search if query matches input (not just the prop update)
            // But here we just search on query change
            setLoading(true);
            try {
                const data = await searchStocks(query);
                const filtered = assetType ? data.filter(s => s.assetType === assetType) : data;
                setResults(filtered.slice(0, 10)); // Limit to 10
                setShowDropdown(true);
            } catch (error) {
                console.error('Search failed', error);
                setResults([]);
            } finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(fetchResults, 300);
        return () => clearTimeout(timeoutId);
    }, [query, assetType]);

    const handleSelect = (stock: MarketStock) => {
        onChange(stock.symbol);
        onSelectStock?.(stock);
        setQuery(stock.symbol);
        setShowDropdown(false);
    };

    return (
        <div ref={wrapperRef} className={`relative ${className}`}>
            <div className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setShowDropdown(true);
                    }}
                    placeholder={placeholder}
                    className="w-full bg-slate-100 dark:bg-slate-700 border-none rounded-lg pl-9 pr-3 py-2 text-sm font-semibold focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white uppercase"
                />
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                {loading && (
                    <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 animate-spin" size={16} />
                )}
            </div>

            {showDropdown && results.length > 0 && (
                <div className="absolute top-full mt-1 left-0 w-full min-w-[200px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto">
                    {results.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => handleSelect(item)}
                            className="w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 flex flex-col"
                        >
                            <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-900 dark:text-white text-sm">{item.symbol}</span>
                                {item.price && <span className="text-xs text-slate-500"><PriceDisplay amount={item.price} /></span>}
                            </div>
                            <span className="text-xs text-slate-500 truncate">{item.name}</span>
                        </button>
                    ))}
                </div>
            )}

            {showDropdown && query.trim() && !loading && results.length === 0 && (
                <div className="absolute top-full mt-1 left-0 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-50 p-2 text-center text-xs text-slate-500">
                    No results found
                </div>
            )}
        </div>
    );
}
