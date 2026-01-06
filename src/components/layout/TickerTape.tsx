'use client';

import { TrendingUp, TrendingDown } from 'lucide-react';

// Mock data - in production, this would come from API
const tickerData = [
    { symbol: 'S&P 500', value: '4,783.45', change: '+0.42%', up: true },
    { symbol: 'NASDAQ', value: '15,012.33', change: '+0.68%', up: true },
    { symbol: 'DOW', value: '37,562.12', change: '-0.12%', up: false },
    { symbol: 'BTC', value: '$43,250', change: '+2.34%', up: true },
    { symbol: 'ETH', value: '$2,285', change: '+1.87%', up: true },
    { symbol: 'GOLD', value: '$2,045.30', change: '-0.23%', up: false },
];

export default function TickerTape() {
    return (
        <div className="bg-slate-900 text-white py-2 px-4 text-xs font-medium whitespace-nowrap overflow-hidden flex items-center gap-8 border-b border-slate-800">
            {tickerData.map((ticker, index) => (
                <div key={index} className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-slate-400">{ticker.symbol}</span>
                    <span className="font-semibold">{ticker.value}</span>
                    <span
                        className={`flex items-center gap-0.5 ${ticker.up ? 'text-emerald-400' : 'text-red-400'
                            }`}
                    >
                        {ticker.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        {ticker.change}
                    </span>
                </div>
            ))}

            {/* Duplicate for seamless scroll effect */}
            {tickerData.map((ticker, index) => (
                <div key={`dup-${index}`} className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-slate-400">{ticker.symbol}</span>
                    <span className="font-semibold">{ticker.value}</span>
                    <span
                        className={`flex items-center gap-0.5 ${ticker.up ? 'text-emerald-400' : 'text-red-400'
                            }`}
                    >
                        {ticker.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        {ticker.change}
                    </span>
                </div>
            ))}
        </div>
    );
}
