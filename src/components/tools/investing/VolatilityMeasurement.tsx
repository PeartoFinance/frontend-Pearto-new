'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import PriceDisplay from '@/components/common/PriceDisplay';
import { useCurrency } from '@/contexts/CurrencyContext';
import { Activity, TrendingDown, BarChart3, Gauge } from 'lucide-react';

function parseSeries(s: string): number[] {
    return s.split(',').map(v => parseFloat(v.trim())).filter(v => !isNaN(v));
}

function mean(arr: number[]): number {
    return arr.length === 0 ? 0 : arr.reduce((a, b) => a + b, 0) / arr.length;
}

function stdDev(arr: number[]): number {
    if (arr.length < 2) return 0;
    const m = mean(arr);
    const variance = arr.reduce((s, v) => s + (v - m) ** 2, 0) / (arr.length - 1);
    return Math.sqrt(variance);
}

export default function VolatilityMeasurement() {
    const { formatPrice } = useCurrency();
    const [inputMode, setInputMode] = useState<'prices' | 'returns'>('prices');
    const [pricesInput, setPricesInput] = useState('100,102,99,105,103,108,104,110,107,112,109,115');
    const [returnsInput, setReturnsInput] = useState('2.0,-2.9,6.1,-1.9,4.9,-3.7,5.8,-2.7,4.7,-2.7,5.5');
    const [riskFreeRate, setRiskFreeRate] = useState(4.5);
    const [tradingDays, setTradingDays] = useState(252);

    const result = useMemo(() => {
        let dailyReturns: number[];

        if (inputMode === 'prices') {
            const prices = parseSeries(pricesInput);
            if (prices.length < 2) return null;
            dailyReturns = [];
            for (let i = 1; i < prices.length; i++) {
                dailyReturns.push(((prices[i] - prices[i - 1]) / prices[i - 1]) * 100);
            }
        } else {
            dailyReturns = parseSeries(returnsInput);
            if (dailyReturns.length < 2) return null;
        }

        // Standard deviation of returns
        const stdDevReturns = stdDev(dailyReturns);

        // Annualized volatility
        const annualizedVol = stdDevReturns * Math.sqrt(tradingDays);

        // Mean daily return
        const meanReturn = mean(dailyReturns);
        const annualizedReturn = meanReturn * tradingDays;

        // Sharpe ratio
        const sharpe = stdDevReturns > 0 ? (annualizedReturn - riskFreeRate) / annualizedVol : 0;

        // Max drawdown (cumulative)
        let cumulative = 0;
        let peak = 0;
        let maxDrawdown = 0;
        for (const ret of dailyReturns) {
            cumulative += ret;
            if (cumulative > peak) peak = cumulative;
            const dd = peak - cumulative;
            if (dd > maxDrawdown) maxDrawdown = dd;
        }

        // Sortino ratio (downside deviation)
        const downsideReturns = dailyReturns.filter(r => r < 0);
        const downsideDev = stdDev(downsideReturns.length > 1 ? downsideReturns : [0, 0]);
        const annualizedDownsideDev = downsideDev * Math.sqrt(tradingDays);
        const sortino = annualizedDownsideDev > 0 ? (annualizedReturn - riskFreeRate) / annualizedDownsideDev : 0;

        // Min and max return
        const minReturn = Math.min(...dailyReturns);
        const maxReturn = Math.max(...dailyReturns);

        return {
            dailyReturns,
            stdDevReturns: Math.round(stdDevReturns * 1000) / 1000,
            annualizedVol: Math.round(annualizedVol * 100) / 100,
            meanReturn: Math.round(meanReturn * 1000) / 1000,
            annualizedReturn: Math.round(annualizedReturn * 100) / 100,
            sharpe: Math.round(sharpe * 100) / 100,
            sortino: Math.round(sortino * 100) / 100,
            maxDrawdown: Math.round(maxDrawdown * 100) / 100,
            minReturn: Math.round(minReturn * 100) / 100,
            maxReturn: Math.round(maxReturn * 100) / 100,
        };
    }, [inputMode, pricesInput, returnsInput, riskFreeRate, tradingDays]);

    const volLevel = !result ? 'N/A' : result.annualizedVol > 30 ? 'High' : result.annualizedVol > 15 ? 'Moderate' : 'Low';
    const volColor = volLevel === 'High' ? 'text-rose-600' : volLevel === 'Moderate' ? 'text-amber-600' : 'text-emerald-600';
    const volBg = volLevel === 'High' ? 'from-rose-50 to-rose-100/50 dark:from-rose-900/20 dark:to-rose-800/10 border-rose-200/60 dark:border-rose-800/40' : volLevel === 'Moderate' ? 'from-amber-50 to-amber-100/50 dark:from-amber-900/20 dark:to-amber-800/10 border-amber-200/60 dark:border-amber-800/40' : 'from-emerald-50 to-emerald-100/50 dark:from-emerald-900/20 dark:to-emerald-800/10 border-emerald-200/60 dark:border-emerald-800/40';

    // Returns distribution histogram
    const histogramBins = useMemo(() => {
        if (!result) return [];
        const returns = result.dailyReturns;
        const min = Math.min(...returns);
        const max = Math.max(...returns);
        const range = max - min || 1;
        const binCount = Math.min(12, returns.length);
        const binWidth = range / binCount;
        const bins: { start: number; end: number; count: number }[] = [];
        for (let i = 0; i < binCount; i++) {
            bins.push({ start: min + i * binWidth, end: min + (i + 1) * binWidth, count: 0 });
        }
        returns.forEach(r => {
            const idx = Math.min(Math.floor((r - min) / binWidth), binCount - 1);
            bins[idx].count++;
        });
        return bins;
    }, [result]);

    const maxBinCount = Math.max(...histogramBins.map(b => b.count), 1);

    // Donut for volatility gauge
    const r = 42, circ = 2 * Math.PI * r;
    const gaugeMax = 50; // max volatility scale
    const gaugePct = result ? Math.min((result.annualizedVol / gaugeMax) * 100, 100) : 0;
    const gaugeOffset = circ - (gaugePct / 100) * circ;
    const gaugeColor = volLevel === 'High' ? '#ef4444' : volLevel === 'Moderate' ? '#f59e0b' : '#10b981';

    return (
        <CalculatorLayout
            title="Volatility Measurement"
            description="Calculate standard deviation, annualized volatility, max drawdown, and Sharpe ratio from price or return data"
            category="Investing"
            insights={[
                { label: 'Annualized Vol', value: result ? `${result.annualizedVol}%` : '—', color: volColor },
                { label: 'Sharpe Ratio', value: result ? `${result.sharpe}` : '—', color: result && result.sharpe >= 1 ? 'text-emerald-600' : 'text-amber-600' },
                { label: 'Max Drawdown', value: result ? `${result.maxDrawdown}%` : '—', color: 'text-rose-600' },
                { label: 'Std Dev (Daily)', value: result ? `${result.stdDevReturns}%` : '—' },
            ]}
            results={
                <div className="space-y-6">
                    {!result ? (
                        <div className="text-center p-6 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-800/50 dark:to-slate-700/30 border border-slate-200/60 dark:border-slate-700/40">
                            <p className="text-sm text-slate-500">Enter at least 2 data points to calculate volatility</p>
                        </div>
                    ) : (
                        <>
                            {/* Volatility verdict */}
                            <div className={`text-center p-6 rounded-xl bg-gradient-to-br ${volBg} border`}>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Annualized Volatility</p>
                                <p className={`text-4xl font-bold ${volColor}`}>{result.annualizedVol}%</p>
                                <p className={`text-sm font-semibold mt-1 ${volColor}`}>{volLevel} Volatility</p>
                            </div>

                            {/* Gauge donut + metrics */}
                            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 flex items-center gap-5">
                                <svg width="100" height="100" viewBox="0 0 100 100" className="flex-shrink-0">
                                    <circle cx="50" cy="50" r={r} fill="none" stroke="currentColor" strokeWidth="8" className="text-slate-100 dark:text-slate-700" />
                                    <circle cx="50" cy="50" r={r} fill="none" stroke={gaugeColor} strokeWidth="8" strokeDasharray={circ} strokeDashoffset={gaugeOffset} strokeLinecap="round" transform="rotate(-90 50 50)" />
                                    <text x="50" y="46" textAnchor="middle" className="fill-slate-900 dark:fill-white text-[10px] font-bold">{result.annualizedVol}%</text>
                                    <text x="50" y="60" textAnchor="middle" className="fill-slate-500 text-[8px]">Ann. Vol</text>
                                </svg>
                                <div className="space-y-2 flex-1">
                                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Key Metrics</p>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-slate-600 dark:text-slate-400">Sharpe Ratio</span>
                                        <span className={`text-sm font-semibold ${result.sharpe >= 1 ? 'text-emerald-600' : result.sharpe >= 0 ? 'text-amber-600' : 'text-rose-600'}`}>{result.sharpe}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-slate-600 dark:text-slate-400">Sortino Ratio</span>
                                        <span className={`text-sm font-semibold ${result.sortino >= 1 ? 'text-emerald-600' : result.sortino >= 0 ? 'text-amber-600' : 'text-rose-600'}`}>{result.sortino}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-slate-600 dark:text-slate-400">Max Drawdown</span>
                                        <span className="text-sm font-semibold text-rose-600">{result.maxDrawdown}%</span>
                                    </div>
                                </div>
                            </div>

                            {/* Statistics card */}
                            <div className="bg-white dark:bg-slate-800 rounded-xl p-4">
                                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Return Statistics</p>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                                        <p className="text-[10px] text-slate-500 uppercase">Mean Daily Return</p>
                                        <p className="text-lg font-bold text-slate-900 dark:text-white">{result.meanReturn}%</p>
                                    </div>
                                    <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                                        <p className="text-[10px] text-slate-500 uppercase">Ann. Return (est.)</p>
                                        <p className={`text-lg font-bold ${result.annualizedReturn >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{result.annualizedReturn}%</p>
                                    </div>
                                    <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                                        <p className="text-[10px] text-slate-500 uppercase">Min Return</p>
                                        <p className="text-lg font-bold text-rose-600">{result.minReturn}%</p>
                                    </div>
                                    <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                                        <p className="text-[10px] text-slate-500 uppercase">Max Return</p>
                                        <p className="text-lg font-bold text-emerald-600">{result.maxReturn}%</p>
                                    </div>
                                </div>
                            </div>

                            {/* Returns distribution histogram */}
                            {histogramBins.length > 0 && (
                                <div className="bg-white dark:bg-slate-800 rounded-xl p-4">
                                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Return Distribution</p>
                                    <div className="flex items-end gap-0.5 h-24">
                                        {histogramBins.map((bin, i) => {
                                            const heightPct = (bin.count / maxBinCount) * 100;
                                            const isNeg = (bin.start + bin.end) / 2 < 0;
                                            return (
                                                <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                                                    <div className={`w-full rounded-t-sm transition-all ${isNeg ? 'bg-rose-400' : 'bg-emerald-400'}`} style={{ height: `${Math.max(heightPct, 2)}%` }} />
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="flex justify-between text-[9px] text-slate-400 mt-1">
                                        <span>{histogramBins[0]?.start.toFixed(1)}%</span>
                                        <span>0%</span>
                                        <span>{histogramBins[histogramBins.length - 1]?.end.toFixed(1)}%</span>
                                    </div>
                                    <div className="flex gap-3 mt-2 text-[10px] text-slate-500">
                                        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-rose-400 inline-block" /> Negative</span>
                                        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-400 inline-block" /> Positive</span>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            }
        >
            {/* Input mode toggle */}
            <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">Input Mode</label>
                <div className="flex gap-2">
                    <button onClick={() => setInputMode('prices')}
                        className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${inputMode === 'prices' ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'}`}>
                        Prices
                    </button>
                    <button onClick={() => setInputMode('returns')}
                        className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${inputMode === 'returns' ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'}`}>
                        Daily Returns (%)
                    </button>
                </div>
            </div>

            {/* Data input */}
            {inputMode === 'prices' ? (
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Price Series</label>
                        <span className="text-xs font-semibold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-md">{parseSeries(pricesInput).length} pts</span>
                    </div>
                    <textarea value={pricesInput} onChange={e => setPricesInput(e.target.value)} placeholder="100, 102, 99, 105, 103..." rows={3}
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 text-sm font-mono" />
                    <p className="text-[10px] text-slate-500 mt-1">Enter closing prices separated by commas</p>
                </div>
            ) : (
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Daily Returns (%)</label>
                        <span className="text-xs font-semibold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-md">{parseSeries(returnsInput).length} pts</span>
                    </div>
                    <textarea value={returnsInput} onChange={e => setReturnsInput(e.target.value)} placeholder="2.0, -2.9, 6.1, -1.9..." rows={3}
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 text-sm font-mono" />
                    <p className="text-[10px] text-slate-500 mt-1">Enter daily percentage returns separated by commas</p>
                </div>
            )}

            {/* Risk-Free Rate */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Risk-Free Rate (%)</label>
                    <span className="text-xs font-semibold text-amber-600 bg-amber-50 dark:bg-amber-900/30 px-2 py-0.5 rounded-md">{riskFreeRate}%</span>
                </div>
                <input type="number" value={riskFreeRate} onChange={e => setRiskFreeRate(Number(e.target.value))} min={0} max={20} step={0.1}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
                <input type="range" min={0} max={10} step={0.25} value={riskFreeRate} onChange={e => setRiskFreeRate(Number(e.target.value))} className="w-full mt-2 accent-amber-500" />
            </div>

            {/* Trading Days */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Trading Days / Year</label>
                    <span className="text-xs font-semibold text-slate-600 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-md">{tradingDays}</span>
                </div>
                <input type="number" value={tradingDays} onChange={e => setTradingDays(Number(e.target.value))} min={1} max={365}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
                <input type="range" min={12} max={365} step={1} value={tradingDays} onChange={e => setTradingDays(Number(e.target.value))} className="w-full mt-2 accent-slate-400" />
                <p className="text-[10px] text-slate-500 mt-1">252 for stocks, 365 for crypto</p>
            </div>
        </CalculatorLayout>
    );
}
