'use client';

import { useState } from 'react';
import { TrendingUp, TrendingDown, RefreshCw, Copy } from 'lucide-react';

interface CryptoAsset {
    name: string;
    symbol: string;
    price: number;
    change24h: number;
}

const cryptoAssets: CryptoAsset[] = [
    { name: 'Bitcoin', symbol: 'BTC', price: 93763, change24h: 0.74 },
    { name: 'Bitcoin', symbol: 'BTC', price: 87854, change24h: 0.36 },
    { name: 'Ethereum', symbol: 'ETH', price: 3218, change24h: 0.52 },
    { name: 'Ethereum', symbol: 'ETH', price: 2939, change24h: 0.25 },
    { name: 'Tether USDt', symbol: 'USDT', price: 1, change24h: 0.04 },
    { name: 'Tether USDt', symbol: 'USDT', price: 1, change24h: -0.03 },
    { name: 'XRP', symbol: 'XRP', price: 2, change24h: 9.95 },
    { name: 'BNB', symbol: 'BNB', price: 907, change24h: 0.41 },
];

interface TopMover {
    symbol: string;
    change: number;
}

const topMovers: TopMover[] = [
    { symbol: 'XRP', change: 9.95 },
    { symbol: 'USDT', change: -0.03 },
];

export default function MarketSnapshot() {
    const [activeTab, setActiveTab] = useState<'Top' | 'Gainers' | 'Losers'>('Top');
    const [assetType, setAssetType] = useState<'Crypto' | 'Stocks' | 'Metals'>('Crypto');

    const totalMarketCap = 6.02;
    const volume24h = 292.56;

    return (
        <section className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Market Snapshot</h3>
                <div className="flex items-center gap-2">
                    {['Crypto', 'Stocks', 'Metals'].map((type) => (
                        <button
                            key={type}
                            onClick={() => setAssetType(type as typeof assetType)}
                            className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${assetType === type
                                    ? 'bg-emerald-500 text-white'
                                    : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">🌐</span>
                        <span className="text-xs text-slate-500">Total Market Cap</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-slate-900 dark:text-white">${totalMarketCap}T</span>
                        <Copy size={14} className="text-slate-400 cursor-pointer" />
                    </div>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">🔥</span>
                        <span className="text-xs text-slate-500">24h Volume</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-slate-900 dark:text-white">${volume24h}B</span>
                        <Copy size={14} className="text-slate-400 cursor-pointer" />
                    </div>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-slate-500">BTC Dominance</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-slate-900 dark:text-white">—</span>
                        <Copy size={14} className="text-slate-400 cursor-pointer" />
                    </div>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                    <div className="text-xs text-slate-500 mb-2">Top Mover (24h)</div>
                    {topMovers.map((mover) => (
                        <div key={mover.symbol} className="flex items-center justify-between text-sm">
                            <span className={`flex items-center gap-1 ${mover.change >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                <span className={`w-2 h-2 rounded-full ${mover.change >= 0 ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                {mover.symbol}
                            </span>
                            <span className={mover.change >= 0 ? 'text-emerald-500' : 'text-red-500'}>
                                {mover.change >= 0 ? '+' : ''}{mover.change}%
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 mb-4">
                {(['Top', 'Gainers', 'Losers'] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === tab
                                ? 'bg-emerald-500 text-white'
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
                <div className="ml-auto flex items-center gap-2 text-xs text-slate-500">
                    <RefreshCw size={12} /> Auto-refresh • 33s ago
                </div>
            </div>

            {/* Assets Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="text-xs text-slate-500 border-b border-slate-200 dark:border-slate-700">
                            <th className="text-left py-3 font-medium">Asset</th>
                            <th className="text-right py-3 font-medium">Price</th>
                            <th className="text-right py-3 font-medium">24h</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cryptoAssets.map((asset, idx) => (
                            <tr
                                key={`${asset.symbol}-${idx}`}
                                className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30"
                            >
                                <td className="py-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-600" />
                                        <div>
                                            <p className="text-sm font-medium text-slate-900 dark:text-white">{asset.name}</p>
                                            <p className="text-xs text-slate-500">{asset.symbol}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="text-right py-3">
                                    <span className="text-sm font-medium text-slate-900 dark:text-white">
                                        ${asset.price.toLocaleString()}
                                    </span>
                                </td>
                                <td className="text-right py-3">
                                    <span className={`flex items-center justify-end gap-1 text-sm font-medium ${asset.change24h >= 0 ? 'text-emerald-500' : 'text-red-500'
                                        }`}>
                                        {asset.change24h >= 0 ? '+' : ''}{asset.change24h.toFixed(2)}%
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
