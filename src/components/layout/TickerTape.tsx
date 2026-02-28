'use client';

import { useMemo } from 'react';
import { TrendingUp, TrendingDown, Loader2, Clock } from 'lucide-react';
import { useMarketIndices, useCommodities } from '@/hooks/useMarketData';
import { MarketIndex, Commodity } from '@/services/marketService';
import PriceDisplay from '@/components/common/PriceDisplay';
import SportsTicker from './SportsTicker';

interface TickerItem {
    symbol: string;
    value: string | number;
    isCurrency: boolean;
    change: string;
    up: boolean;
}

export default function TickerTape() {
    // Use shared React Query hooks (caches data across components)
    const { data: indices, isLoading: indicesLoading, isError: indicesError } = useMarketIndices();
    const { data: commodities, isLoading: commoditiesLoading, isError: commoditiesError } = useCommodities();

    const loading = indicesLoading || commoditiesLoading;
    const error = indicesError || commoditiesError;

    // Transform data into ticker items
    const tickerData = useMemo(() => {
        const items: TickerItem[] = [];

        if (indices) {
            indices.slice(0, 4).forEach((idx: MarketIndex) => {
                const changePercent = idx.changePercent || 0;
                items.push({
                    symbol: idx.name || idx.symbol,
                    value: idx.value?.toLocaleString(undefined, { maximumFractionDigits: 2 }) || '0',
                    isCurrency: false,
                    change: `${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%`,
                    up: changePercent >= 0
                });
            });
        }

        if (commodities) {
            commodities.slice(0, 3).forEach((c: Commodity) => {
                const changePercent = c.changePercent || 0;
                items.push({
                    symbol: c.name || c.symbol,
                    value: c.price || 0,
                    isCurrency: true,
                    change: `${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%`,
                    up: changePercent >= 0
                });
            });
        }

        return items;
    }, [indices, commodities]);

    // Detect market closed from index marketStatus field
    const marketClosed = useMemo(() => {
        if (!indices || indices.length === 0) return false;
        return indices.some((idx: MarketIndex) => idx.marketStatus === 'Markets Closed');
    }, [indices]);

    // Don't render if no data and error
    if (error && tickerData.length === 0) {
        return (<>
            <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white py-2 text-xs font-medium border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-center gap-2 text-slate-500 dark:text-slate-400">
                    <span>Market data unavailable</span>
                    <span className="text-xs">• Import data from admin panel</span>
                </div>
            </div>
            <SportsTicker />
        </>);
    }

    if (loading && tickerData.length === 0) {
        return (<>
            <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white py-2 text-xs font-medium border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin" size={12} />
                    <span className="text-slate-500 dark:text-slate-400">Loading market data...</span>
                </div>
            </div>
            <SportsTicker />
        </>);
    }

    return (<>
        <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white py-2 text-xs font-medium overflow-hidden border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-8 animate-marquee hover:pause-animation">
                {/* Market status badge */}
                {marketClosed && (
                    <div className="flex items-center gap-1 flex-shrink-0 text-amber-500 dark:text-amber-400">
                        <Clock size={12} />
                        <span className="font-semibold">Markets Closed</span>
                    </div>
                )}
                {/* First set of tickers */}
                {tickerData.map((ticker, index) => (
                    <div key={index} className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-slate-500 dark:text-slate-400">{ticker.symbol}</span>
                        <span className="font-semibold">
                            {ticker.isCurrency ? <PriceDisplay amount={ticker.value as number} /> : ticker.value}
                        </span>
                        <span
                            className={`flex items-center gap-0.5 ${ticker.up ? 'text-emerald-400' : 'text-red-400'}`}
                        >
                            {ticker.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                            {ticker.change}
                        </span>
                    </div>
                ))}

                {/* Duplicate for seamless loop */}
                {tickerData.map((ticker, index) => (
                    <div key={`dup-${index}`} className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-slate-500 dark:text-slate-400">{ticker.symbol}</span>
                        <span className="font-semibold">
                            {ticker.isCurrency ? <PriceDisplay amount={ticker.value as number} /> : ticker.value}
                        </span>
                        <span
                            className={`flex items-center gap-0.5 ${ticker.up ? 'text-emerald-400' : 'text-red-400'}`}
                        >
                            {ticker.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                            {ticker.change}
                        </span>
                    </div>
                ))}
            </div>

            {/* Inline styles for marquee animation */}
            <style jsx>{`
                @keyframes marquee {
                    0% {
                        transform: translateX(0);
                    }
                    100% {
                        transform: translateX(-50%);
                    }
                }
                .animate-marquee {
                    animation: marquee 30s linear infinite;
                }
                .animate-marquee:hover {
                    animation-play-state: paused;
                }
            `}</style>
        </div>

        {/* Sports Ticker - right below market ticker */}
        <SportsTicker />
    </>
    );
}
