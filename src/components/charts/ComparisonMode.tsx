'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
    Plus,
    X,
    Search,
    Eye,
    EyeOff,
    TrendingUp
} from 'lucide-react';
import { getStockHistory, type PriceHistoryPoint } from '@/services/marketService';

export interface ComparisonSymbol {
    symbol: string;
    name?: string;
    color: string;
    visible: boolean;
    data: { time: string; value: number }[];
    baseValue: number;
}

interface ComparisonModeProps {
    primarySymbol: string;
    primaryData: PriceHistoryPoint[];
    onComparisonDataChange: (symbols: ComparisonSymbol[]) => void;
    className?: string;
}

const COMPARISON_COLORS = [
    '#FF6B6B', // Red
    '#4ECDC4', // Teal
    '#FFE66D', // Yellow
    '#95E1D3', // Mint
    '#F38181', // Coral
    '#AA96DA', // Purple
    '#FF9F1A', // Orange
];

export default function ComparisonMode({
    primarySymbol,
    primaryData,
    onComparisonDataChange,
    className = ''
}: ComparisonModeProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [comparisons, setComparisons] = useState<ComparisonSymbol[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState<string[]>([]);

    // Popular comparison symbols
    const popularSymbols = ['SPY', 'QQQ', 'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'BTC-USD'];

    // Normalize data to percentage from first value
    const normalizeData = useCallback((data: PriceHistoryPoint[], baseSymbol: boolean = false) => {
        if (data.length === 0) return [];
        const baseValue = data[0].close ?? 0;
        if (baseValue === 0) return [];

        return data.map(d => ({
            time: d.date.split('T')[0],
            value: ((d.close ?? 0) - baseValue) / baseValue * 100
        }));
    }, []);

    // Add a comparison symbol
    const addComparison = async (symbol: string) => {
        if (symbol.toUpperCase() === primarySymbol.toUpperCase()) return;
        if (comparisons.some(c => c.symbol.toUpperCase() === symbol.toUpperCase())) return;
        if (comparisons.length >= 5) return; // Max 5 comparisons

        try {
            // Get period from primary data
            const period = '1y'; // Default to 1 year for comparison
            const response = await getStockHistory(symbol, period, '1d');
            const historyData = response.data;

            if (!historyData || historyData.length === 0) return;

            const normalizedData = normalizeData(historyData);
            const colorIndex = comparisons.length % COMPARISON_COLORS.length;

            const newComparison: ComparisonSymbol = {
                symbol: symbol.toUpperCase(),
                color: COMPARISON_COLORS[colorIndex],
                visible: true,
                data: normalizedData,
                baseValue: historyData[0].close ?? 0
            };

            const updated = [...comparisons, newComparison];
            setComparisons(updated);
            onComparisonDataChange(updated);
        } catch (error) {
            console.error('Failed to load comparison data:', error);
        }

        setSearchQuery('');
        setSearchResults([]);
    };

    // Remove a comparison
    const removeComparison = (symbol: string) => {
        const updated = comparisons.filter(c => c.symbol !== symbol);
        setComparisons(updated);
        onComparisonDataChange(updated);
    };

    // Toggle visibility
    const toggleVisibility = (symbol: string) => {
        const updated = comparisons.map(c =>
            c.symbol === symbol ? { ...c, visible: !c.visible } : c
        );
        setComparisons(updated);
        onComparisonDataChange(updated);
    };

    // Simple search (in real app, this would call an API)
    const handleSearch = (query: string) => {
        setSearchQuery(query);
        if (query.length >= 1) {
            // Filter popular symbols that match
            const results = popularSymbols.filter(s =>
                s.toLowerCase().includes(query.toLowerCase()) &&
                s.toUpperCase() !== primarySymbol.toUpperCase() &&
                !comparisons.some(c => c.symbol === s)
            );
            setSearchResults(results);
        } else {
            setSearchResults([]);
        }
    };

    return (
        <div className={`relative ${className}`}>
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm text-slate-300 transition"
            >
                <TrendingUp size={14} />
                <span>Compare</span>
                {comparisons.length > 0 && (
                    <span className="px-1.5 py-0.5 bg-purple-500/20 text-purple-400 rounded text-xs">
                        {comparisons.length}
                    </span>
                )}
            </button>

            {/* Dropdown Panel */}
            {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-xl shadow-xl z-[100] overflow-hidden">
                    {/* Header */}
                    <div className="p-3 border-b border-slate-700">
                        <h3 className="font-semibold text-white mb-2">Compare Symbols</h3>
                        <p className="text-xs text-slate-500 mb-2">
                            Add up to 5 symbols to compare with {primarySymbol}
                        </p>

                        {/* Search Input */}
                        <div className="relative">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Search symbol..."
                                value={searchQuery}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                            />
                        </div>

                        {/* Search Results */}
                        {searchResults.length > 0 && (
                            <div className="mt-2 bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
                                {searchResults.map(symbol => (
                                    <button
                                        key={symbol}
                                        onClick={() => addComparison(symbol)}
                                        className="w-full px-3 py-2 text-left text-sm text-white hover:bg-slate-700 transition flex items-center justify-between"
                                    >
                                        <span>{symbol}</span>
                                        <Plus size={14} className="text-slate-400" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Active Comparisons */}
                    {comparisons.length > 0 && (
                        <div className="p-3 border-b border-slate-700">
                            <h4 className="text-xs text-slate-500 uppercase font-medium mb-2">Active</h4>
                            <div className="space-y-2">
                                {comparisons.map(comp => (
                                    <div
                                        key={comp.symbol}
                                        className="flex items-center gap-2 p-2 bg-slate-800 rounded-lg"
                                    >
                                        <div
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: comp.color }}
                                        />
                                        <span className="flex-1 text-sm text-white">{comp.symbol}</span>

                                        <button
                                            onClick={() => toggleVisibility(comp.symbol)}
                                            className="p-1 hover:bg-slate-700 rounded transition"
                                        >
                                            {comp.visible
                                                ? <Eye size={14} className="text-slate-400" />
                                                : <EyeOff size={14} className="text-slate-500" />}
                                        </button>

                                        <button
                                            onClick={() => removeComparison(comp.symbol)}
                                            className="p-1 hover:bg-red-500/20 rounded transition"
                                        >
                                            <X size={14} className="text-red-400" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Quick Add - Popular Symbols */}
                    <div className="p-3">
                        <h4 className="text-xs text-slate-500 uppercase font-medium mb-2">Popular</h4>
                        <div className="flex flex-wrap gap-1">
                            {popularSymbols
                                .filter(s => s !== primarySymbol && !comparisons.some(c => c.symbol === s))
                                .slice(0, 6)
                                .map(symbol => (
                                    <button
                                        key={symbol}
                                        onClick={() => addComparison(symbol)}
                                        className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs transition"
                                    >
                                        {symbol}
                                    </button>
                                ))}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-3 border-t border-slate-700 bg-slate-800/30">
                        <button
                            onClick={() => setIsOpen(false)}
                            className="w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm transition"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
