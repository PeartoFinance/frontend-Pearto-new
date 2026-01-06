'use client';

import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatsCard {
    symbol: string;
    name: string;
    price: string;
    change: string;
    changePercent: string;
    isUp: boolean;
    color: string;
}

const statsData: StatsCard[] = [
    {
        symbol: '^GSPC',
        name: 'S&P 500',
        price: '4,783.45',
        change: '+20.15',
        changePercent: '+0.42%',
        isUp: true,
        color: 'emerald',
    },
    {
        symbol: '^IXIC',
        name: 'NASDAQ',
        price: '15,012.33',
        change: '+101.85',
        changePercent: '+0.68%',
        isUp: true,
        color: 'blue',
    },
    {
        symbol: 'BTC-USD',
        name: 'Bitcoin',
        price: '$43,250.00',
        change: '+987.50',
        changePercent: '+2.34%',
        isUp: true,
        color: 'amber',
    },
    {
        symbol: 'GC=F',
        name: 'Gold',
        price: '$2,045.30',
        change: '-4.70',
        changePercent: '-0.23%',
        isUp: false,
        color: 'yellow',
    },
];

const colorClasses: Record<string, { bg: string; bar: string; icon: string }> = {
    emerald: {
        bg: 'from-emerald-50 to-emerald-100/50 dark:from-emerald-900/20 dark:to-emerald-800/10',
        bar: 'bg-emerald-500',
        icon: 'text-emerald-500',
    },
    blue: {
        bg: 'from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10',
        bar: 'bg-blue-500',
        icon: 'text-blue-500',
    },
    amber: {
        bg: 'from-amber-50 to-amber-100/50 dark:from-amber-900/20 dark:to-amber-800/10',
        bar: 'bg-amber-500',
        icon: 'text-amber-500',
    },
    yellow: {
        bg: 'from-yellow-50 to-yellow-100/50 dark:from-yellow-900/20 dark:to-yellow-800/10',
        bar: 'bg-yellow-500',
        icon: 'text-yellow-500',
    },
};

export default function StatsGrid() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statsData.map((stat) => {
                const colors = colorClasses[stat.color];
                return (
                    <div
                        key={stat.symbol}
                        className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${colors.bg} p-5 border border-slate-200/50 dark:border-slate-700/50 hover:shadow-lg transition-shadow cursor-pointer`}
                    >
                        {/* Colored accent bar */}
                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${colors.bar}`} />

                        {/* Header */}
                        <div className="flex items-start justify-between mb-3">
                            <div>
                                <span className="px-2 py-1 text-xs font-medium bg-white/80 dark:bg-slate-800/80 rounded-md text-slate-600 dark:text-slate-300">
                                    {stat.symbol}
                                </span>
                            </div>
                            <div className={`p-1.5 rounded-lg ${colors.bg}`}>
                                {stat.isUp ? (
                                    <TrendingUp size={16} className="text-emerald-500" />
                                ) : (
                                    <TrendingDown size={16} className="text-red-500" />
                                )}
                            </div>
                        </div>

                        {/* Name & Price */}
                        <h3 className="text-sm text-slate-500 dark:text-slate-400 mb-1">{stat.name}</h3>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                            {stat.price}
                        </p>

                        {/* Change */}
                        <div className="flex items-center gap-2">
                            <span
                                className={`text-sm font-semibold ${stat.isUp ? 'text-emerald-600' : 'text-red-600'
                                    }`}
                            >
                                {stat.change}
                            </span>
                            <span
                                className={`text-sm ${stat.isUp ? 'text-emerald-500' : 'text-red-500'
                                    }`}
                            >
                                {stat.changePercent}
                            </span>
                        </div>

                        {/* Mini sparkline placeholder */}
                        <div className="mt-3 h-8 flex items-end gap-0.5">
                            {Array.from({ length: 12 }).map((_, i) => (
                                <div
                                    key={i}
                                    className={`flex-1 rounded-t ${colors.bar} opacity-30`}
                                    style={{ height: `${Math.random() * 100}%` }}
                                />
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
