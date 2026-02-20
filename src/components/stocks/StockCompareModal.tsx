'use client';

import { useState, useEffect } from 'react';
import { X, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { getStockHistory, type MarketStock, type PriceHistoryPoint } from '@/services/marketService';
import StockSymbolInput from '@/components/common/StockSymbolInput';

interface StockCompareModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialSymbol: string;
    initialStock: MarketStock | null;
}

interface CompareStock {
    symbol: string;
    name: string;
    price: number;
    change: number;
    changePercent: number;
    data?: PriceHistoryPoint[];
}

export default function StockCompareModal({ isOpen, onClose, initialSymbol, initialStock }: StockCompareModalProps) {
    const [compareStocks, setCompareStocks] = useState<CompareStock[]>([]);
    const [searchSymbol, setSearchSymbol] = useState('');
    const [loading, setLoading] = useState(false);

    // Initialize with the current stock
    useEffect(() => {
        if (isOpen && initialStock && compareStocks.length === 0) {
            setCompareStocks([{
                symbol: initialStock.symbol,
                name: initialStock.name,
                price: initialStock.price,
                change: initialStock.change,
                changePercent: initialStock.changePercent,
            }]);
        }
    }, [isOpen, initialStock, compareStocks.length]);

    // Add stock to comparison
    const addStock = (stock: MarketStock) => {
        if (compareStocks.length >= 5) {
            alert('Maximum 5 stocks for comparison');
            return;
        }
        if (compareStocks.some(s => s.symbol === stock.symbol)) return;

        setCompareStocks(prev => [...prev, {
            symbol: stock.symbol,
            name: stock.name,
            price: stock.price,
            change: stock.change,
            changePercent: stock.changePercent,
        }]);
        setSearchSymbol('');
    };

    // Remove stock from comparison
    const removeStock = (symbol: string) => {
        if (compareStocks.length <= 1) return;
        setCompareStocks(prev => prev.filter(s => s.symbol !== symbol));
    };

    // Format helpers
    const formatNumber = (num: number | undefined | null, decimals = 2): string => {
        if (num == null) return '-';
        return num.toLocaleString(undefined, {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[80vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                            Compare Stocks
                        </h2>
                        <p className="text-sm text-slate-500 mt-0.5">
                            Add up to 5 stocks to compare
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                    >
                        <X size={20} className="text-slate-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-5 overflow-y-auto max-h-[60vh]">
                    {/* Search to add stocks */}
                    <div className="mb-6">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                            Add Stock to Compare
                        </label>
                        <StockSymbolInput
                            value={searchSymbol}
                            onChange={setSearchSymbol}
                            onSelectStock={addStock}
                            placeholder="Search by symbol or name..."
                        />
                    </div>

                    {/* Comparison Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-700">
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-500">Stock</th>
                                    <th className="text-right py-3 px-4 text-sm font-semibold text-slate-500">Price</th>
                                    <th className="text-right py-3 px-4 text-sm font-semibold text-slate-500">Change</th>
                                    <th className="text-right py-3 px-4 text-sm font-semibold text-slate-500">% Change</th>
                                    <th className="text-right py-3 px-4 text-sm font-semibold text-slate-500"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {compareStocks.map((stock, index) => {
                                    const isPositive = stock.changePercent >= 0;
                                    return (
                                        <tr key={stock.symbol} className="border-b border-slate-100 dark:border-slate-800">
                                            <td className="py-4 px-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                                                        {stock.symbol.slice(0, 2)}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-slate-900 dark:text-white">
                                                            {stock.symbol}
                                                        </p>
                                                        <p className="text-xs text-slate-500 truncate max-w-[150px]">
                                                            {stock.name}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 text-right font-semibold text-slate-900 dark:text-white">
                                                ${formatNumber(stock.price)}
                                            </td>
                                            <td className={`py-4 px-4 text-right font-medium ${isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
                                                {isPositive ? '+' : ''}{formatNumber(stock.change)}
                                            </td>
                                            <td className="py-4 px-4 text-right">
                                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-sm font-medium ${isPositive
                                                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                                                    : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                                                    }`}>
                                                    {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                                    {isPositive ? '+' : ''}{formatNumber(stock.changePercent)}%
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 text-right">
                                                {compareStocks.length > 1 && (
                                                    <button
                                                        onClick={() => removeStock(stock.symbol)}
                                                        className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 rounded-lg transition"
                                                        title="Remove"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {compareStocks.length === 0 && (
                        <div className="text-center py-10">
                            <p className="text-slate-500">Add stocks to compare</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-5 border-t border-slate-200 dark:border-slate-700">
                    <p className="text-sm text-slate-500">
                        {compareStocks.length} of 5 stocks selected
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition text-sm font-medium"
                        >
                            Close
                        </button>
                        <button
                            onClick={() => {
                                const symbols = compareStocks.map(s => s.symbol).join(',');
                                window.location.href = `/stocks/compare?symbols=${symbols}`;
                            }}
                            disabled={compareStocks.length < 2}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Open Full Comparison
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
