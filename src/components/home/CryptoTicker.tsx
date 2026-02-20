'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Bitcoin, RefreshCw, TrendingUp, TrendingDown, Loader2, Sparkles } from 'lucide-react';
import { get } from '@/services/api';
import PriceDisplay from '@/components/common/PriceDisplay';

interface CryptoAsset {
    symbol: string;
    name?: string;
    price?: number;
    change?: number;
    changePercent?: number;
    marketCap?: number;
    volume?: number;
    assetType?: string;
}

const CRYPTO_ICONS: Record<string, string> = {
    'BTC-USD': '₿',
    'ETH-USD': 'Ξ',
    'SOL-USD': '◎',
    'BNB-USD': '◆',
    'XRP-USD': '✕',
    'ADA-USD': '₳',
    'DOGE-USD': 'Ð',
    'DOT-USD': '●',
    'AVAX-USD': '▲',
    'MATIC-USD': '⬡',
};

const CRYPTO_COLORS: string[] = [
    'from-amber-500 to-orange-600',
    'from-indigo-500 to-purple-600',
    'from-violet-500 to-fuchsia-600',
    'from-yellow-500 to-amber-600',
    'from-blue-500 to-cyan-600',
    'from-emerald-500 to-teal-600',
    'from-rose-500 to-pink-600',
];

export default function CryptoTicker() {
    const [cryptos, setCryptos] = useState<CryptoAsset[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchCrypto = useCallback(async () => {
        try {
            setLoading(true);
            const data = await get<CryptoAsset[]>('/live/crypto', { limit: 6 });
            setCryptos((data || []).filter(c => c.price).slice(0, 6));
        } catch (err) {
            console.error('CryptoTicker fetch error:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCrypto();
        const interval = setInterval(fetchCrypto, 60000); // refresh every 60s
        return () => clearInterval(interval);
    }, [fetchCrypto]);

    return (
        <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700/50 p-5 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                        <Bitcoin size={18} className="text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Crypto</h3>
                        <p className="text-[10px] text-slate-400">Live prices</p>
                    </div>
                </div>
                <button
                    onClick={fetchCrypto}
                    disabled={loading}
                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-400 transition"
                >
                    <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                </button>
            </div>

            <div className="flex-1 space-y-2">
                {loading && cryptos.length === 0 ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="animate-spin text-amber-500" size={20} />
                    </div>
                ) : cryptos.length === 0 ? (
                    <p className="text-center text-sm text-slate-500 py-6">No data</p>
                ) : (
                    cryptos.map((crypto, idx) => {
                        const pct = crypto.changePercent ?? 0;
                        const icon = CRYPTO_ICONS[crypto.symbol] || '●';
                        const color = CRYPTO_COLORS[idx % CRYPTO_COLORS.length];

                        return (
                            <Link
                                key={crypto.symbol}
                                href={`/crypto/${crypto.symbol}`}
                                className="flex items-center justify-between p-2.5 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-xl transition-colors group"
                            >
                                <div className="flex items-center gap-2.5">
                                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center text-white text-sm font-bold shadow-sm`}>
                                        {icon}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                            {crypto.symbol.replace('-USD', '')}
                                        </p>
                                        <p className="text-[10px] text-slate-400 truncate max-w-[80px]">
                                            {crypto.name || crypto.symbol}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-mono font-medium text-slate-900 dark:text-white">
                                        <PriceDisplay amount={crypto.price || 0} />
                                    </p>
                                    <p className={`text-xs font-medium flex items-center justify-end gap-0.5 ${pct >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                        {pct >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                                        {pct >= 0 ? '+' : ''}{pct.toFixed(2)}%
                                    </p>
                                </div>
                            </Link>
                        );
                    })
                )}
            </div>

            <Link
                href="/live"
                className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 font-medium transition"
            >
                <Sparkles size={12} />
                View all crypto
            </Link>
        </div>
    );
}
