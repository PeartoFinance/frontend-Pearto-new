'use client';

import { useEffect, useState } from 'react';
import { ArrowUp, ArrowDown, RefreshCw, Globe } from 'lucide-react';
import { getRates, ExchangeRate } from '@/services/currencyService';

export default function ExchangeRateWidget() {
    const [rates, setRates] = useState<ExchangeRate[]>([]);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

    const fetchRates = async () => {
        setLoading(true);
        try {
            const data = await getRates();
            // Filter common pairs if too many, or take top 5
            setRates(data.slice(0, 5));
            setLastUpdated(new Date());
        } catch (error) {
            console.error('Failed to load exchange rates', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRates();
    }, []);

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-rose-100 dark:bg-rose-900/30 rounded-lg">
                        <Globe size={18} className="text-rose-600 dark:text-rose-400" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Exchange Rates</h3>
                </div>
                <button
                    onClick={fetchRates}
                    disabled={loading}
                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-400 transition"
                >
                    <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                </button>
            </div>

            <div className="flex-1 space-y-3">
                {loading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-10 bg-slate-100 dark:bg-slate-700/50 rounded-lg animate-pulse" />
                    ))
                ) : rates.length > 0 ? (
                    rates.map((rate) => (
                        <div key={rate.pair} className="flex items-center justify-between p-2.5 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-colors">
                            <div className="flex items-center gap-3">
                                <span className="font-semibold text-slate-700 dark:text-slate-200">{rate.pair}</span>
                            </div>
                            <div className="text-right">
                                <p className="font-mono font-medium text-slate-900 dark:text-white">{rate.rate.toFixed(4)}</p>
                                {/* Mock change for visual since API might not provide it yet, or hide if unavailable */}
                                <p className="text-xs text-slate-500">
                                    {rate.targetCurrency}
                                </p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-6 text-slate-500 text-sm">
                        Unable to load rates
                    </div>
                )}
            </div>

            <p className="text-[10px] text-slate-400 mt-4 pt-3 border-t border-slate-100 dark:border-slate-700 flex justify-between">
                <span>Source: Open Exchange</span>
                <span>Updated: {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </p>
        </div>
    );
}
