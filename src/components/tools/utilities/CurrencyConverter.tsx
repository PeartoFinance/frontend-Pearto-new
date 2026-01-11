'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import { ArrowLeftRight, DollarSign, RefreshCw } from 'lucide-react';

// Common currencies with symbols and rates (relative to USD)
const currencies = {
    USD: { name: 'US Dollar', symbol: '$', rate: 1 },
    EUR: { name: 'Euro', symbol: '€', rate: 0.92 },
    GBP: { name: 'British Pound', symbol: '£', rate: 0.79 },
    INR: { name: 'Indian Rupee', symbol: '₹', rate: 83.5 },
    JPY: { name: 'Japanese Yen', symbol: '¥', rate: 149.5 },
    AUD: { name: 'Australian Dollar', symbol: 'A$', rate: 1.54 },
    CAD: { name: 'Canadian Dollar', symbol: 'C$', rate: 1.36 },
    CHF: { name: 'Swiss Franc', symbol: 'Fr', rate: 0.89 },
    CNY: { name: 'Chinese Yuan', symbol: '¥', rate: 7.24 },
    SGD: { name: 'Singapore Dollar', symbol: 'S$', rate: 1.35 },
};

type CurrencyCode = keyof typeof currencies;

export default function CurrencyConverter() {
    const [amount, setAmount] = useState(1000);
    const [fromCurrency, setFromCurrency] = useState<CurrencyCode>('USD');
    const [toCurrency, setToCurrency] = useState<CurrencyCode>('INR');

    const result = useMemo(() => {
        const fromRate = currencies[fromCurrency].rate;
        const toRate = currencies[toCurrency].rate;
        const usdAmount = amount / fromRate;
        const convertedAmount = usdAmount * toRate;
        const exchangeRate = toRate / fromRate;
        const inverseRate = fromRate / toRate;

        return {
            converted: convertedAmount,
            rate: exchangeRate,
            inverseRate: inverseRate
        };
    }, [amount, fromCurrency, toCurrency]);

    const swapCurrencies = () => {
        setFromCurrency(toCurrency);
        setToCurrency(fromCurrency);
    };

    const formatNumber = (num: number, decimals = 2) => {
        return new Intl.NumberFormat('en-US', { maximumFractionDigits: decimals }).format(num);
    };

    return (
        <CalculatorLayout
            title="Currency Converter"
            description="Convert between major world currencies"
            category="Utilities"
            results={
                <div className="space-y-6">
                    <div className="text-center p-6 bg-white dark:bg-slate-800 rounded-xl">
                        <p className="text-sm text-slate-500 mb-2">
                            {currencies[fromCurrency].symbol}{formatNumber(amount)} {fromCurrency} =
                        </p>
                        <p className="text-4xl font-bold text-emerald-600">
                            {currencies[toCurrency].symbol}{formatNumber(result.converted)}
                        </p>
                        <p className="text-lg text-slate-600 dark:text-slate-400 mt-1">{toCurrency}</p>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Exchange Rate</span>
                            <span className="font-medium">1 {fromCurrency} = {formatNumber(result.rate, 4)} {toCurrency}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Inverse Rate</span>
                            <span className="font-medium">1 {toCurrency} = {formatNumber(result.inverseRate, 4)} {fromCurrency}</span>
                        </div>
                    </div>

                    <p className="text-xs text-slate-400 text-center">
                        Rates are indicative only. Check live rates for transactions.
                    </p>
                </div>
            }
        >
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Amount</label>
                <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} min={0}
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">From</label>
                <select value={fromCurrency} onChange={(e) => setFromCurrency(e.target.value as CurrencyCode)}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500">
                    {Object.entries(currencies).map(([code, { name }]) => (
                        <option key={code} value={code}>{code} - {name}</option>
                    ))}
                </select>
            </div>

            <button onClick={swapCurrencies} className="w-full py-2 flex items-center justify-center gap-2 text-emerald-600 hover:text-emerald-700">
                <ArrowLeftRight className="w-5 h-5" />
                <span className="text-sm font-medium">Swap Currencies</span>
            </button>

            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">To</label>
                <select value={toCurrency} onChange={(e) => setToCurrency(e.target.value as CurrencyCode)}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500">
                    {Object.entries(currencies).map(([code, { name }]) => (
                        <option key={code} value={code}>{code} - {name}</option>
                    ))}
                </select>
            </div>
        </CalculatorLayout>
    );
}
