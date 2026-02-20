'use client';

import { useState, useEffect } from 'react';
import { ArrowRightLeft, RefreshCw } from 'lucide-react';
import { useCurrency } from '@/contexts/CurrencyContext';


interface ForexConverterProps {
    initialFrom?: string;
    initialTo?: string;
}

export default function ForexConverter({ initialFrom, initialTo }: ForexConverterProps = {}) {
    const { rates, convertPrice, formatPrice } = useCurrency();
    const [amount, setAmount] = useState<number>(1);
    const [fromCurrency, setFromCurrency] = useState(initialFrom || 'USD');
    const [toCurrency, setToCurrency] = useState(initialTo || 'EUR');

    // Sync with props when they change
    useEffect(() => {
        if (initialFrom) setFromCurrency(initialFrom);
        if (initialTo) setToCurrency(initialTo);
    }, [initialFrom, initialTo]);

    // Get all available currencies from rates, ensuring unique values
    const availableCurrencies = Array.from(new Set(['USD', ...Object.keys(rates)])).sort();

    // Simple conversion logic based on base USD rates
    const convertedAmount = () => {
        if (!rates[toCurrency] || !rates[fromCurrency]) return 0;
        // Convert to USD first, then to target
        const amountInUSD = amount / rates[fromCurrency];
        return amountInUSD * rates[toCurrency];
    };

    const handleSwap = () => {
        setFromCurrency(toCurrency);
        setToCurrency(fromCurrency);
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 sm:p-6 shadow-sm overflow-hidden">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <RefreshCw size={20} className="text-emerald-500" />
                Currency Converter
            </h3>

            <div className="space-y-4">
                {/* From */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-500">Amount</label>
                    <div className="flex gap-2">
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                            className="flex-1 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 text-lg font-bold focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white"
                        />
                        <select
                            value={fromCurrency}
                            onChange={(e) => setFromCurrency(e.target.value)}
                            className="w-24 bg-slate-100 dark:bg-slate-600 border-none rounded-xl px-2 font-bold focus:ring-2 focus:ring-emerald-500 cursor-pointer text-slate-900 dark:text-white"
                        >
                            {availableCurrencies.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                </div>

                {/* Swap Button */}
                <div className="flex justify-center -my-2 relative z-10">
                    <button
                        onClick={handleSwap}
                        className="p-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-full shadow-sm hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-600 transition-colors"
                    >
                        <ArrowRightLeft size={18} />
                    </button>
                </div>

                {/* To */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-500">Converted to</label>
                    <div className="flex gap-2">
                        <div className="flex-1 min-w-0 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 rounded-xl px-4 py-3 flex items-center">
                            <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 truncate">
                                {convertedAmount().toFixed(2)}
                            </span>
                        </div>
                        <select
                            value={toCurrency}
                            onChange={(e) => setToCurrency(e.target.value)}
                            className="w-24 bg-slate-100 dark:bg-slate-600 border-none rounded-xl px-2 font-bold focus:ring-2 focus:ring-emerald-500 cursor-pointer text-slate-900 dark:text-white"
                        >
                            {availableCurrencies.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                </div>

                <div className="pt-4 mt-2">
                    <p className="text-xs text-center text-slate-500">
                        1 {fromCurrency} = {(rates[toCurrency] / rates[fromCurrency]).toFixed(4)} {toCurrency}
                    </p>
                </div>
            </div>
        </div>
    );
}
