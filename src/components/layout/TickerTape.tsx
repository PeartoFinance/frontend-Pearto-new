'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import { getMarketIndices, getCommodities, MarketIndex, Commodity } from '@/services/marketService';

interface TickerItem {
    symbol: string;
    value: string;
    change: string;
    up: boolean;
}

export default function TickerTape() {
    const [tickerData, setTickerData] = useState<TickerItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [indices, commodities] = await Promise.all([
                    getMarketIndices(),
                    getCommodities()
                ]);

                const items: TickerItem[] = [];

                // Add indices - using 'value' field from API
                indices.slice(0, 4).forEach((idx: MarketIndex) => {
                    const changePercent = idx.changePercent || 0;
                    items.push({
                        symbol: idx.name || idx.symbol,
                        value: idx.value?.toLocaleString(undefined, { maximumFractionDigits: 2 }) || '0',
                        change: `${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%`,
                        up: changePercent >= 0
                    });
                });

                // Add commodities - using 'price' field from API
                commodities.slice(0, 3).forEach((c: Commodity) => {
                    const changePercent = c.changePercent || 0;
                    items.push({
                        symbol: c.name || c.symbol,
                        value: `$${c.price?.toLocaleString(undefined, { maximumFractionDigits: 2 }) || 0}`,
                        change: `${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%`,
                        up: changePercent >= 0
                    });
                });

                if (items.length > 0) {
                    setTickerData(items);
                    setError(false);
                } else {
                    setError(true);
                }
            } catch (err) {
                console.error('Failed to fetch ticker data:', err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        // Refresh every 60 seconds
        const interval = setInterval(fetchData, 60000);
        return () => clearInterval(interval);
    }, []);

    // Don't render if no data and error
    if (error && tickerData.length === 0) {
        return (
            <div className="bg-slate-900 text-white py-2 text-xs font-medium border-b border-slate-800">
                <div className="flex items-center justify-center gap-2 text-slate-400">
                    <span>Market data unavailable</span>
                    <span className="text-xs">• Import data from admin panel</span>
                </div>
            </div>
        );
    }

    if (loading && tickerData.length === 0) {
        return (
            <div className="bg-slate-900 text-white py-2 text-xs font-medium border-b border-slate-800">
                <div className="flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin" size={12} />
                    <span className="text-slate-400">Loading market data...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-slate-900 text-white py-2 text-xs font-medium overflow-hidden border-b border-slate-800">
            <div className="flex items-center gap-8 animate-marquee hover:pause-animation">
                {/* First set of tickers */}
                {tickerData.map((ticker, index) => (
                    <div key={index} className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-slate-400">{ticker.symbol}</span>
                        <span className="font-semibold">{ticker.value}</span>
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
                        <span className="text-slate-400">{ticker.symbol}</span>
                        <span className="font-semibold">{ticker.value}</span>
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
    );
}
