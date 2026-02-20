'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { TrendingUp, TrendingDown, Loader2, Bitcoin } from 'lucide-react';
import { get } from '@/services/api';
import PriceDisplay from '@/components/common/PriceDisplay';

interface CryptoItem {
    symbol: string;
    name?: string;
    price?: number;
    changePercent?: number;
}

export default function CryptoQuickWidget() {
    const [coins, setCoins] = useState<CryptoItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCrypto = async () => {
            try {
                const data = await get<CryptoItem[]>('/live/crypto', { limit: 5 });
                setCoins((data || []).filter(c => c.price).slice(0, 5));
            } catch (err) {
                console.error('Failed to load crypto:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchCrypto();
    }, []);

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                        <Bitcoin size={18} className="text-amber-600 dark:text-amber-400" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Top Crypto</h3>
                </div>
                <Link href="/crypto" className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-medium">
                    View all
                </Link>
            </div>

            <div className="flex-1 space-y-2">
                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-5 h-5 animate-spin text-amber-500" />
                    </div>
                ) : coins.length === 0 ? (
                    <div className="text-center py-6 text-slate-500 text-sm">No data available</div>
                ) : (
                    coins.map((coin) => {
                        const isPositive = (coin.changePercent ?? 0) >= 0;
                        const displaySymbol = coin.symbol?.replace('-USD', '').replace('-USDT', '') || coin.symbol;
                        return (
                            <Link
                                key={coin.symbol}
                                href={`/crypto/${coin.symbol}`}
                                className="flex items-center justify-between p-2.5 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-colors group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                        {displaySymbol.substring(0, 2)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-amber-600 transition-colors">
                                            {coin.name || displaySymbol}
                                        </p>
                                        <p className="text-xs text-slate-500">{displaySymbol}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                        <PriceDisplay amount={coin.price} />
                                    </p>
                                    <span className={`flex items-center gap-0.5 text-xs font-medium justify-end ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                                        {isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                                        {isPositive ? '+' : ''}{(coin.changePercent ?? 0).toFixed(2)}%
                                    </span>
                                </div>
                            </Link>
                        );
                    })
                )}
            </div>
        </div>
    );
}
