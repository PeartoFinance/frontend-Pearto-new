'use client';

import { TrendingUp, TrendingDown } from 'lucide-react';

interface PriceTargetCardProps {
    low: number | null;
    mean: number | null;
    high: number | null;
    current: number | null;
    upside: number | null;
}

export function PriceTargetCard({ low, mean, high, current, upside }: PriceTargetCardProps) {
    const isPositive = (upside ?? 0) >= 0;

    const formatPrice = (price: number | null) => {
        if (price == null) return '-';
        return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    // Calculate marker position for current price
    const markerPosition = low && high && current
        ? Math.min(100, Math.max(0, ((current - low) / (high - low)) * 100))
        : 50;

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
            <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-4">
                Price Target
            </h3>

            <div className="flex items-center justify-between mb-4">
                <div>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white">
                        {formatPrice(mean)}
                    </p>
                    <p className="text-sm text-slate-500">Average Target</p>
                </div>

                {upside != null && (
                    <div className={`text-right ${isPositive ? 'text-teal-500' : 'text-red-500'}`}>
                        <p className="text-2xl font-bold flex items-center justify-end gap-1">
                            {isPositive ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                            {isPositive ? '+' : ''}{upside.toFixed(1)}%
                        </p>
                        <p className="text-sm opacity-80">Upside</p>
                    </div>
                )}
            </div>

            {/* Price Range Bar */}
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-500">
                        Low: <span className="font-medium text-red-500">{formatPrice(low)}</span>
                    </span>
                    <span className="text-slate-500">
                        High: <span className="font-medium text-teal-500">{formatPrice(high)}</span>
                    </span>
                </div>

                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 relative">
                    {/* Gradient bar - green themed */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-slate-400 via-teal-400 to-teal-500 opacity-40" />

                    {/* Current price marker */}
                    {current && (
                        <div
                            className="absolute h-3 w-1.5 bg-teal-600 rounded-full shadow-md"
                            style={{
                                left: `${markerPosition}%`,
                                transform: 'translateX(-50%)'
                            }}
                            title={`Current: ${formatPrice(current)}`}
                        />
                    )}
                </div>

                <p className="text-xs text-center text-slate-400 mt-2">
                    Current Price: {formatPrice(current)}
                </p>
            </div>
        </div>
    );
}

export default PriceTargetCard;
