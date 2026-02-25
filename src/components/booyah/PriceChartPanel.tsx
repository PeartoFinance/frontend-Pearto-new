'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { XAxis, YAxis, Tooltip, ResponsiveContainer, Area, ReferenceLine, CartesianGrid, Bar, ComposedChart } from 'recharts';
import { BarChart3, TrendingUp, TrendingDown, Calendar, Loader2 } from 'lucide-react';
import type { PriceHistoryPoint } from '@/services/marketService';
import { getStockHistory } from '@/services/marketService';
import type { BooyahPrediction } from '@/app/booyah/page';
import { useCurrency } from '@/contexts/CurrencyContext';

interface PriceChartPanelProps {
    symbol: string;
    data: PriceHistoryPoint[];
    prediction: BooyahPrediction | null;
    currentPrice: number;
}

type Period = '1D' | '1W' | '1M' | '3M' | '6M' | '1Y';

const PERIOD_CONFIG: Record<Period, { label: string; apiPeriod: string; apiInterval: string }> = {
    '1D': { label: '1 Day', apiPeriod: '1d', apiInterval: '30m' },
    '1W': { label: '1 Week', apiPeriod: '5d', apiInterval: '15m' },
    '1M': { label: '1 Month', apiPeriod: '1mo', apiInterval: '1d' },
    '3M': { label: '3 Months', apiPeriod: '3mo', apiInterval: '1d' },
    '6M': { label: '6 Months', apiPeriod: '6mo', apiInterval: '1d' },
    '1Y': { label: '1 Year', apiPeriod: '1y', apiInterval: '1wk' },
};

function CustomTooltip({ active, payload, label, formatPrice }: { active?: boolean; payload?: Array<{ value: number; dataKey: string }>; label?: string; formatPrice: (amount: number, minimumFractionDigits?: number, maximumFractionDigits?: number, options?: Intl.NumberFormatOptions) => string }) {
    if (!active || !payload?.length) return null;
    const priceEntry = payload.find(p => p.dataKey === 'price');
    const volumeEntry = payload.find(p => p.dataKey === 'volume');
    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 p-3 min-w-[140px]">
            <p className="text-[10px] font-medium text-slate-400 mb-1.5 uppercase tracking-wider">{label}</p>
            {priceEntry && (
                <div className="flex items-center justify-between gap-4 mb-1">
                    <span className="text-xs text-slate-500 dark:text-slate-400">Price</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{formatPrice(priceEntry.value)}</span>
                </div>
            )}
            {volumeEntry && volumeEntry.value > 0 && (
                <div className="flex items-center justify-between gap-4">
                    <span className="text-xs text-slate-500 dark:text-slate-400">Volume</span>
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                        {volumeEntry.value >= 1_000_000 ? `${(volumeEntry.value / 1_000_000).toFixed(1)}M` : `${(volumeEntry.value / 1_000).toFixed(0)}K`}
                    </span>
                </div>
            )}
        </div>
    );
}

export default function PriceChartPanel({ symbol, data, prediction, currentPrice }: PriceChartPanelProps) {
    const { formatPrice } = useCurrency();
    const [period, setPeriod] = useState<Period>('6M');
    const [periodData, setPeriodData] = useState<PriceHistoryPoint[]>([]);
    const [periodLoading, setPeriodLoading] = useState(false);

    // Use the initial 6M data as default, fetch new data when period changes
    useEffect(() => {
        if (period === '6M') {
            setPeriodData(data);
            return;
        }

        let cancelled = false;
        setPeriodLoading(true);
        const config = PERIOD_CONFIG[period];
        getStockHistory(symbol, config.apiPeriod, config.apiInterval)
            .then(res => {
                if (!cancelled) setPeriodData(res.data);
            })
            .catch(() => {
                if (!cancelled) setPeriodData([]);
            })
            .finally(() => {
                if (!cancelled) setPeriodLoading(false);
            });

        return () => { cancelled = true; };
    }, [symbol, period, data]);

    // Format date label based on period
    const formatDateLabel = useCallback((dateStr: string, p: Period) => {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        switch (p) {
            case '1D':
                // Show hour:minute (e.g. "9:30", "10:00", "14:30")
                return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
            case '1W':
                // Show day + time (e.g. "Mon 9:30AM")
                return d.toLocaleDateString('en-US', { weekday: 'short' }) + ' ' +
                    d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
            case '1M':
                // Show "Jan 15"
                return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            case '3M':
                // Show "Jan 15"
                return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            case '6M':
                // Show "Jan 15"
                return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            case '1Y':
                // Show "Jan '25"
                return d.toLocaleDateString('en-US', { month: 'short' }) + ' \'' + d.getFullYear().toString().slice(2);
            default:
                return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
    }, []);

    const { chartData, minPrice, maxPrice, maxVolume, isUp, priceChangePercent } = useMemo(() => {
        const source = periodData.length > 0 ? periodData : data;

        const cd = source
            .filter(d => d.close != null)
            .map(d => ({
                rawDate: d.date,
                date: formatDateLabel(d.date, period),
                price: d.close!,
                volume: d.volume || 0,
            }));

        const prices = cd.map(d => d.price);
        const volumes = cd.map(d => d.volume);
        const min = prices.length > 0 ? Math.min(...prices) * 0.98 : 0;
        const max = prices.length > 0 ? Math.max(...prices) * 1.02 : 100;
        const maxVol = volumes.length > 0 ? Math.max(...volumes) : 0;
        const up = cd.length >= 2 && cd[cd.length - 1].price >= cd[0].price;
        const changePercent = cd.length >= 2 && cd[0].price > 0
            ? ((cd[cd.length - 1].price - cd[0].price) / cd[0].price) * 100 : 0;

        return { chartData: cd, minPrice: min, maxPrice: max, maxVolume: maxVol, isUp: up, priceChangePercent: changePercent };
    }, [periodData, data, period, formatDateLabel]);

    const gradientId = `priceGrad-${symbol}`;
    const volumeGradientId = `volGrad-${symbol}`;

    // Calculate smart tick interval based on period and data density
    const xTickInterval = useMemo(() => {
        const len = chartData.length;
        if (len <= 0) return 0;
        switch (period) {
            case '1D':
                // 30m intervals = ~13 pts per day, show every tick
                return 0;
            case '1W':
                // 15m intervals = ~130 pts, show every 2h (8 ticks)
                return Math.max(1, Math.floor(len / 16));
            case '1M':
                // daily = ~22 pts, show every other day
                return 1;
            case '3M':
                // daily = ~65 pts, show every ~5 days (~13 labels)
                return Math.max(1, Math.floor(len / 13));
            case '6M':
                // daily = ~130 pts, show every ~8 days (~16 labels)
                return Math.max(1, Math.floor(len / 16));
            case '1Y':
                // weekly = ~52 pts, show every other week
                return Math.max(1, Math.floor(len / 16));
            default:
                return Math.max(1, Math.floor(len / 15));
        }
    }, [chartData.length, period]);

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            {/* Header */}
            <div className="px-6 pt-5 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isUp ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                            {isUp
                                ? <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                : <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
                            }
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                {symbol} Price
                            </h3>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-lg font-extrabold text-slate-900 dark:text-white">{formatPrice(currentPrice)}</span>
                                <span className={`text-xs font-bold px-1.5 py-0.5 rounded-md ${isUp
                                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                                    : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                                }`}>
                                    {isUp ? '+' : ''}{priceChangePercent.toFixed(2)}%
                                </span>
                                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {PERIOD_CONFIG[period].label}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-0.5 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
                        {(['1D', '1W', '1M', '3M', '6M', '1Y'] as Period[]).map(p => (
                            <button
                                key={p}
                                onClick={() => setPeriod(p)}
                                className={`px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${period === p
                                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                }`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Chart */}
            <div className="h-80 px-2 sm:px-4 relative">
                {periodLoading && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm rounded-lg">
                        <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
                    </div>
                )}
                {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor={isUp ? '#10b981' : '#ef4444'} stopOpacity={0.35} />
                                    <stop offset="50%" stopColor={isUp ? '#10b981' : '#ef4444'} stopOpacity={0.08} />
                                    <stop offset="100%" stopColor={isUp ? '#10b981' : '#ef4444'} stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id={volumeGradientId} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0.05} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="currentColor"
                                className="text-slate-100 dark:text-slate-800"
                                vertical={false}
                            />
                            <XAxis
                                dataKey="date"
                                tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 500 }}
                                tickLine={false}
                                axisLine={false}
                                interval={xTickInterval}
                                minTickGap={15}
                                angle={period === '1W' ? -35 : 0}
                                textAnchor={period === '1W' ? 'end' : 'middle'}
                                height={period === '1W' ? 50 : 30}
                                dy={period === '1W' ? 5 : 8}
                            />
                            <YAxis
                                yAxisId="price"
                                domain={[minPrice, maxPrice]}
                                tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 500 }}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(v: number) => formatPrice(v, 0, 2, { notation: 'compact' })}
                                width={60}
                            />
                            <YAxis
                                yAxisId="volume"
                                orientation="right"
                                domain={[0, maxVolume * 4]}
                                tick={false}
                                tickLine={false}
                                axisLine={false}
                                width={0}
                            />
                            <Tooltip
                                content={<CustomTooltip formatPrice={formatPrice} />}
                                cursor={{ stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '4 4' }}
                            />

                            {/* Volume bars behind */}
                            <Bar
                                yAxisId="volume"
                                dataKey="volume"
                                fill={`url(#${volumeGradientId})`}
                                radius={[2, 2, 0, 0]}
                                barSize={chartData.length > 60 ? 2 : chartData.length > 30 ? 4 : 6}
                            />

                            {/* Reference lines */}
                            {prediction?.targetPrice && (
                                <ReferenceLine
                                    yAxisId="price"
                                    y={prediction.targetPrice}
                                    stroke="#10b981"
                                    strokeDasharray="6 4"
                                    strokeWidth={1.5}
                                    label={{ value: `Target ${formatPrice(prediction.targetPrice, 0, 2, { notation: 'compact' })}`, fill: '#10b981', fontSize: 10, fontWeight: 600, position: 'insideTopLeft' }}
                                />
                            )}
                            {prediction?.stopLoss && (
                                <ReferenceLine
                                    yAxisId="price"
                                    y={prediction.stopLoss}
                                    stroke="#ef4444"
                                    strokeDasharray="6 4"
                                    strokeWidth={1.5}
                                    label={{ value: `Stop ${formatPrice(prediction.stopLoss, 0, 2, { notation: 'compact' })}`, fill: '#ef4444', fontSize: 10, fontWeight: 600, position: 'insideBottomLeft' }}
                                />
                            )}

                            {/* Price area */}
                            <Area
                                yAxisId="price"
                                type="monotone"
                                dataKey="price"
                                stroke={isUp ? '#10b981' : '#ef4444'}
                                strokeWidth={2.5}
                                fill={`url(#${gradientId})`}
                                dot={false}
                                activeDot={{
                                    r: 5,
                                    fill: isUp ? '#10b981' : '#ef4444',
                                    stroke: '#fff',
                                    strokeWidth: 2,
                                    className: 'drop-shadow-md',
                                }}
                            />
                        </ComposedChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center gap-2 text-slate-400 text-sm">
                        <BarChart3 className="w-8 h-8 opacity-40" />
                        <span>No chart data available</span>
                    </div>
                )}
            </div>

            {/* Footer Legend */}
            <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-4 text-xs">
                    <div className="flex items-center gap-1.5">
                        <span className={`w-2.5 h-2.5 rounded-full ${isUp ? 'bg-emerald-500' : 'bg-red-500'}`} />
                        <span className="text-slate-500 dark:text-slate-400 font-medium">Price</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-indigo-400/50" />
                        <span className="text-slate-500 dark:text-slate-400 font-medium">Volume</span>
                    </div>
                    {prediction?.targetPrice && (
                        <div className="flex items-center gap-1.5">
                            <span className="w-4 border-t-2 border-dashed border-emerald-500" />
                            <span className="text-slate-500 dark:text-slate-400 font-medium">AI Target</span>
                        </div>
                    )}
                    {prediction?.stopLoss && (
                        <div className="flex items-center gap-1.5">
                            <span className="w-4 border-t-2 border-dashed border-red-500" />
                            <span className="text-slate-500 dark:text-slate-400 font-medium">Stop Loss</span>
                        </div>
                    )}
                </div>
                <div className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                    {chartData.length} data points
                </div>
            </div>
        </div>
    );
}
