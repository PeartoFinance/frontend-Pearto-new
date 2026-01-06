'use client';

import { useState } from 'react';
import { RefreshCw, TrendingUp, TrendingDown } from 'lucide-react';

type MarketTab = 'US' | 'EU' | 'ASIA' | 'CRYPTO';

interface Mover {
    symbol: string;
    change: number;
}

const moversData: Record<MarketTab, Mover[]> = {
    US: [
        { symbol: 'AAPL', change: -1.38 },
        { symbol: 'AMZN', change: -1.42 },
        { symbol: 'AAPL', change: -3.42 },
        { symbol: 'AAPL', change: -1.42 },
        { symbol: 'MSFT', change: -0.02 },
        { symbol: 'NVDA', change: -0.87 },
        { symbol: 'TSLA', change: -3.07 },
    ],
    EU: [
        { symbol: 'SAP', change: 1.24 },
        { symbol: 'ASML', change: -0.87 },
        { symbol: 'LVMH', change: 0.54 },
        { symbol: 'SIE', change: -1.12 },
    ],
    ASIA: [
        { symbol: 'TSM', change: 2.15 },
        { symbol: 'SONY', change: -0.45 },
        { symbol: 'BABA', change: 1.87 },
        { symbol: 'TCEHY', change: -0.32 },
    ],
    CRYPTO: [
        { symbol: 'BTC', change: 2.34 },
        { symbol: 'ETH', change: 1.87 },
        { symbol: 'SOL', change: -3.21 },
        { symbol: 'XRP', change: 9.95 },
    ],
};

export default function QuickMarkets() {
    const [activeTab, setActiveTab] = useState<MarketTab>('US');
    const movers = moversData[activeTab];

    return (
        <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="w-1 h-5 bg-emerald-500 rounded-full" />
                    Quick Markets
                </h3>
                <button className="text-xs text-slate-500 hover:text-emerald-500 flex items-center gap-1">
                    <RefreshCw size={12} /> Refresh
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-4">
                {(['US', 'EU', 'ASIA', 'CRYPTO'] as MarketTab[]).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${activeTab === tab
                                ? 'bg-emerald-500 text-white'
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Market Snapshot Label */}
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 font-medium">MOVERS</p>

            {/* Movers Grid */}
            <div className="space-y-2">
                {movers.slice(0, 5).map((mover, idx) => (
                    <div
                        key={`${mover.symbol}-${idx}`}
                        className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg"
                    >
                        <span className="text-sm font-medium text-slate-900 dark:text-white">{mover.symbol}</span>
                        <span className={`flex items-center gap-1 text-sm font-semibold ${mover.change >= 0 ? 'text-emerald-500' : 'text-red-500'
                            }`}>
                            {mover.change >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                            {mover.change >= 0 ? '+' : ''}{mover.change.toFixed(2)}%
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
