'use client';

import { useState, useEffect } from 'react';
import { Loader2, Target, TrendingUp } from 'lucide-react';
import { getStockForecast, type DetailedForecast } from '@/services/marketService';
import type { MarketStock, PriceHistoryPoint } from '@/services/marketService';
import PriceDisplay from '@/components/common/PriceDisplay';

interface CompareStock extends MarketStock {
    color: string;
    data: PriceHistoryPoint[];
}

interface CompareForecastTabProps {
    stocks: CompareStock[];
}

interface StockForecast {
    symbol: string;
    color: string;
    forecast: DetailedForecast | null;
}

export default function CompareForecastTab({ stocks }: CompareForecastTabProps) {
    const [stockForecasts, setStockForecasts] = useState<StockForecast[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchForecasts = async () => {
            setLoading(true);
            try {
                const results = await Promise.all(
                    stocks.map(async (stock) => {
                        try {
                            const forecast = await getStockForecast(stock.symbol);
                            return { symbol: stock.symbol, color: stock.color, forecast };
                        } catch {
                            return { symbol: stock.symbol, color: stock.color, forecast: null };
                        }
                    })
                );
                setStockForecasts(results);
            } catch (err) {
                console.error('Failed to load forecasts:', err);
            } finally {
                setLoading(false);
            }
        };

        if (stocks.length > 0) {
            fetchForecasts();
        }
    }, [stocks]);

    const formatPrice = (num: number | null | undefined) => {
        if (num == null) return '-';
        return `$${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const formatLargeNumber = (num: number | null | undefined) => {
        if (num == null) return '-';
        if (num >= 1e12) return `${(num / 1e12).toFixed(2)}T`;
        if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
        if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
        return num.toLocaleString();
    };

    if (loading) {
        return (
            <div className="flex justify-center py-10">
                <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-5">
            {/* Price Target Comparison */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="p-5 border-b border-slate-200 dark:border-slate-700">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        <Target size={20} className="text-teal-500" />
                        Price Targets Comparison
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/50">
                                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-500">Target</th>
                                {stockForecasts.map((sf) => (
                                    <th key={sf.symbol} className="text-right py-3 px-4 text-sm font-semibold" style={{ color: sf.color }}>
                                        {sf.symbol}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            <tr>
                                <td className="py-3 px-4 text-sm text-slate-500">Current Price</td>
                                {stockForecasts.map((sf) => (
                                    <td key={sf.symbol} className="py-3 px-4 text-right text-sm font-medium text-slate-900 dark:text-white">
                                        <PriceDisplay amount={sf.forecast?.priceTarget?.current} />
                                    </td>
                                ))}
                            </tr>
                            <tr>
                                <td className="py-3 px-4 text-sm text-slate-500">Mean Target</td>
                                {stockForecasts.map((sf) => (
                                    <td key={sf.symbol} className="py-3 px-4 text-right text-sm font-bold text-teal-600">
                                        <PriceDisplay amount={sf.forecast?.priceTarget?.mean} />
                                    </td>
                                ))}
                            </tr>
                            <tr>
                                <td className="py-3 px-4 text-sm text-slate-500">Upside</td>
                                {stockForecasts.map((sf) => {
                                    const upside = sf.forecast?.priceTarget?.upside;
                                    return (
                                        <td
                                            key={sf.symbol}
                                            className={`py-3 px-4 text-right text-sm font-bold ${upside && upside >= 0 ? 'text-teal-600' : 'text-red-500'}`}
                                        >
                                            {upside != null ? `${upside >= 0 ? '+' : ''}${upside.toFixed(1)}%` : '-'}
                                        </td>
                                    );
                                })}
                            </tr>
                            <tr>
                                <td className="py-3 px-4 text-sm text-slate-500">Low Target</td>
                                {stockForecasts.map((sf) => (
                                    <td key={sf.symbol} className="py-3 px-4 text-right text-sm text-red-500">
                                        <PriceDisplay amount={sf.forecast?.priceTarget?.low} />
                                    </td>
                                ))}
                            </tr>
                            <tr>
                                <td className="py-3 px-4 text-sm text-slate-500">High Target</td>
                                {stockForecasts.map((sf) => (
                                    <td key={sf.symbol} className="py-3 px-4 text-right text-sm text-teal-600">
                                        <PriceDisplay amount={sf.forecast?.priceTarget?.high} />
                                    </td>
                                ))}
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Analyst Consensus Comparison */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="p-5 border-b border-slate-200 dark:border-slate-700">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        <TrendingUp size={20} className="text-teal-500" />
                        Analyst Consensus Comparison
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/50">
                                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-500">Rating</th>
                                {stockForecasts.map((sf) => (
                                    <th key={sf.symbol} className="text-right py-3 px-4 text-sm font-semibold" style={{ color: sf.color }}>
                                        {sf.symbol}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            <tr>
                                <td className="py-3 px-4 text-sm text-slate-500">Consensus</td>
                                {stockForecasts.map((sf) => (
                                    <td key={sf.symbol} className="py-3 px-4 text-right">
                                        <span className="inline-block px-2 py-1 text-xs font-bold rounded bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400">
                                            {sf.forecast?.analystConsensus?.consensus || 'N/A'}
                                        </span>
                                    </td>
                                ))}
                            </tr>
                            <tr>
                                <td className="py-3 px-4 text-sm text-slate-500">Total Analysts</td>
                                {stockForecasts.map((sf) => (
                                    <td key={sf.symbol} className="py-3 px-4 text-right text-sm font-medium text-slate-900 dark:text-white">
                                        {sf.forecast?.analystConsensus?.total || '-'}
                                    </td>
                                ))}
                            </tr>
                            <tr>
                                <td className="py-3 px-4 text-sm text-slate-500">Strong Buy</td>
                                {stockForecasts.map((sf) => (
                                    <td key={sf.symbol} className="py-3 px-4 text-right text-sm text-teal-600">
                                        {sf.forecast?.analystConsensus?.strongBuy || 0}
                                    </td>
                                ))}
                            </tr>
                            <tr>
                                <td className="py-3 px-4 text-sm text-slate-500">Buy</td>
                                {stockForecasts.map((sf) => (
                                    <td key={sf.symbol} className="py-3 px-4 text-right text-sm text-teal-500">
                                        {sf.forecast?.analystConsensus?.buy || 0}
                                    </td>
                                ))}
                            </tr>
                            <tr>
                                <td className="py-3 px-4 text-sm text-slate-500">Hold</td>
                                {stockForecasts.map((sf) => (
                                    <td key={sf.symbol} className="py-3 px-4 text-right text-sm text-slate-500">
                                        {sf.forecast?.analystConsensus?.hold || 0}
                                    </td>
                                ))}
                            </tr>
                            <tr>
                                <td className="py-3 px-4 text-sm text-slate-500">Sell</td>
                                {stockForecasts.map((sf) => (
                                    <td key={sf.symbol} className="py-3 px-4 text-right text-sm text-red-500">
                                        {sf.forecast?.analystConsensus?.sell || 0}
                                    </td>
                                ))}
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Earnings Estimates Comparison */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="p-5 border-b border-slate-200 dark:border-slate-700">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                        Annual Earnings Estimates
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/50">
                                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-500">Metric</th>
                                {stockForecasts.map((sf) => (
                                    <th key={sf.symbol} className="text-right py-3 px-4 text-sm font-semibold" style={{ color: sf.color }}>
                                        {sf.symbol}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            <tr>
                                <td className="py-3 px-4 text-sm text-slate-500">Est. Revenue (Next FY)</td>
                                {stockForecasts.map((sf) => {
                                    const annual = sf.forecast?.earningsEstimates?.annual?.[0];
                                    return (
                                        <td key={sf.symbol} className="py-3 px-4 text-right text-sm font-medium text-slate-900 dark:text-white">
                                            {formatLargeNumber(annual?.revenueAvg)}
                                        </td>
                                    );
                                })}
                            </tr>
                            <tr>
                                <td className="py-3 px-4 text-sm text-slate-500">Revenue Growth</td>
                                {stockForecasts.map((sf) => {
                                    const annual = sf.forecast?.earningsEstimates?.annual?.[0];
                                    const growth = annual?.revenueGrowth;
                                    return (
                                        <td
                                            key={sf.symbol}
                                            className={`py-3 px-4 text-right text-sm font-medium ${growth && growth >= 0 ? 'text-teal-600' : 'text-red-500'}`}
                                        >
                                            {growth != null ? `${(growth * 100).toFixed(1)}%` : '-'}
                                        </td>
                                    );
                                })}
                            </tr>
                            <tr>
                                <td className="py-3 px-4 text-sm text-slate-500">Est. EPS (Next FY)</td>
                                {stockForecasts.map((sf) => {
                                    const annual = sf.forecast?.earningsEstimates?.annual?.[0];
                                    return (
                                        <td key={sf.symbol} className="py-3 px-4 text-right text-sm font-medium text-slate-900 dark:text-white">
                                            {annual?.epsAvg?.toFixed(2) || '-'}
                                        </td>
                                    );
                                })}
                            </tr>
                            <tr>
                                <td className="py-3 px-4 text-sm text-slate-500">EPS Growth</td>
                                {stockForecasts.map((sf) => {
                                    const annual = sf.forecast?.earningsEstimates?.annual?.[0];
                                    const growth = annual?.epsGrowth;
                                    return (
                                        <td
                                            key={sf.symbol}
                                            className={`py-3 px-4 text-right text-sm font-medium ${growth && growth >= 0 ? 'text-teal-600' : 'text-red-500'}`}
                                        >
                                            {growth != null ? `${(growth * 100).toFixed(1)}%` : '-'}
                                        </td>
                                    );
                                })}
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
