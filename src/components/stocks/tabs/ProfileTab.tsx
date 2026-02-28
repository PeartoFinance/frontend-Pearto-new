'use client';

import { Building2, Globe, ExternalLink, MapPin, Users, Briefcase, BarChart3, TrendingUp, DollarSign } from 'lucide-react';
import { type MarketStock } from '@/services/marketService';
import PriceDisplay from '@/components/common/PriceDisplay';

interface ProfileTabProps {
    stock: MarketStock;
}

export default function ProfileTab({ stock }: ProfileTabProps) {
    const formatNumber = (num: number | undefined | null, decimals = 2): string => {
        if (num == null) return '-';
        return num.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    };

    const formatLargeNumber = (num: number | undefined | null): string => {
        if (num == null) return '-';
        if (num >= 1e12) return `${(num / 1e12).toFixed(2)}T`;
        if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
        if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
        if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
        return num.toLocaleString();
    };

    const formatPercent = (num: number | undefined | null): string => {
        if (num == null) return '-';
        return `${(num * 100).toFixed(2)}%`;
    };

    return (
        <div className="space-y-5">
            {/* Company Description */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    <Building2 size={20} className="text-blue-500" />
                    About {stock.name}
                </h3>
                {stock.description ? (
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                        {stock.description}
                    </p>
                ) : (
                    <p className="text-slate-400 italic">No company description available.</p>
                )}
            </div>

            {/* Key Statistics */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <BarChart3 size={20} className="text-emerald-500" />
                    Key Statistics
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-0">
                    {[
                        { label: 'Market Cap', value: stock.marketCap ? <PriceDisplay amount={stock.marketCap} options={{ notation: 'compact' }} /> : '-' },
                        { label: 'P/E Ratio (TTM)', value: formatNumber(stock.peRatio) },
                        { label: 'Forward P/E', value: formatNumber(stock.forwardPe) },
                        { label: 'EPS (TTM)', value: stock.eps ? <PriceDisplay amount={stock.eps} /> : '-' },
                        { label: 'Beta', value: formatNumber(stock.beta) },
                        { label: 'Dividend Yield', value: stock.dividendYield ? formatPercent(stock.dividendYield) : '-' },
                        { label: 'Dividend Rate', value: stock.dividendRate ? <PriceDisplay amount={stock.dividendRate} /> : '-' },
                        { label: '52-Week High', value: stock.high52w ? <PriceDisplay amount={stock.high52w} /> : '-' },
                        { label: '52-Week Low', value: stock.low52w ? <PriceDisplay amount={stock.low52w} /> : '-' },
                        { label: 'Open', value: stock.open ? <PriceDisplay amount={stock.open} /> : '-' },
                        { label: 'Previous Close', value: stock.previousClose ? <PriceDisplay amount={stock.previousClose} /> : '-' },
                        { label: 'Day High', value: stock.dayHigh ? <PriceDisplay amount={stock.dayHigh} /> : '-' },
                        { label: 'Day Low', value: stock.dayLow ? <PriceDisplay amount={stock.dayLow} /> : '-' },
                        { label: 'Avg Volume', value: formatLargeNumber(stock.avgVolume) },
                        { label: 'Volume', value: formatLargeNumber(stock.volume) },
                        { label: 'Shares Outstanding', value: formatLargeNumber(stock.sharesOutstanding) },
                        { label: 'Float Shares', value: formatLargeNumber(stock.floatShares) },
                        { label: 'Book Value', value: stock.bookValue ? <PriceDisplay amount={stock.bookValue} /> : '-' },
                        { label: 'Price to Book', value: formatNumber(stock.priceToBook) },
                        { label: 'Short Ratio', value: formatNumber(stock.shortRatio) },
                    ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between py-2.5 px-1 border-b border-slate-100 dark:border-slate-800">
                            <span className="text-sm text-slate-500 dark:text-slate-400 shrink-0 mr-4">{item.label}</span>
                            <span className="text-sm font-medium text-slate-900 dark:text-white text-right">{item.value as any}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Company Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Sector & Industry */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <Briefcase size={18} className="text-slate-400" />
                        <h4 className="font-medium text-slate-900 dark:text-white">Sector & Industry</h4>
                    </div>
                    <div className="space-y-2">
                        <div>
                            <p className="text-xs text-slate-500 uppercase">Sector</p>
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{stock.sector || '-'}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 uppercase">Industry</p>
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{stock.industry || '-'}</p>
                        </div>
                    </div>
                </div>

                {/* Exchange Info */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <MapPin size={18} className="text-slate-400" />
                        <h4 className="font-medium text-slate-900 dark:text-white">Exchange</h4>
                    </div>
                    <div className="space-y-2">
                        <div>
                            <p className="text-xs text-slate-500 uppercase">Listed On</p>
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{stock.exchange || '-'}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 uppercase">Currency</p>
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{stock.currency || 'USD'}</p>
                        </div>
                    </div>
                </div>

                {/* Website */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <Globe size={18} className="text-slate-400" />
                        <h4 className="font-medium text-slate-900 dark:text-white">Website</h4>
                    </div>
                    {stock.website ? (
                        <a
                            href={stock.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-500 transition"
                        >
                            <span className="text-sm truncate max-w-[200px]">{stock.website.replace(/^https?:\/\//, '')}</span>
                            <ExternalLink size={14} />
                        </a>
                    ) : (
                        <p className="text-sm text-slate-400">No website available</p>
                    )}
                </div>
            </div>

            {/* Key People / Additional Info (placeholder for future) */}
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                <div className="flex items-center gap-2 text-slate-500">
                    <Users size={18} />
                    <span className="text-sm">Executive information and key people data can be added here in future updates.</span>
                </div>
            </div>
        </div>
    );
}
