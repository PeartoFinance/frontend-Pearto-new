'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import { Activity, TrendingUp, AlertTriangle, BarChart3 } from 'lucide-react';
import {
    createChart,
    ColorType,
    LineSeries,
    HistogramSeries,
    type IChartApi,
} from 'lightweight-charts';

export default function VolatilityCalculator() {
    const [stockSymbol, setStockSymbol] = useState('AAPL');
    const [timePeriod, setTimePeriod] = useState(30);
    const [annualizationFactor, setAnnualizationFactor] = useState(252); // Trading days

    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const [isDark, setIsDark] = useState(false);

    // Generate sample daily returns
    const dailyData = useMemo(() => {
        const data = [];
        let price = 100;
        for (let i = 0; i < timePeriod; i++) {
            const dailyReturn = (Math.random() - 0.5) * 4; // -2% to +2%
            price = price * (1 + dailyReturn / 100);
            const date = new Date();
            date.setDate(date.getDate() - (timePeriod - i));
            data.push({
                date: date.toISOString().split('T')[0],
                price: parseFloat(price.toFixed(2)),
                return: parseFloat(dailyReturn.toFixed(2))
            });
        }
        return data;
    }, [timePeriod]);

    // Calculate volatility metrics
    const result = useMemo(() => {
        if (dailyData.length < 2) return null;

        const returns = dailyData.map(d => d.return);
        const n = returns.length;

        // Mean return
        const meanReturn = returns.reduce((sum, r) => sum + r, 0) / n;

        // Daily volatility (standard deviation)
        const variance = returns.reduce((sum, r) => sum + Math.pow(r - meanReturn, 2), 0) / (n - 1);
        const dailyVolatility = Math.sqrt(variance);

        // Annualized volatility
        const annualizedVolatility = dailyVolatility * Math.sqrt(annualizationFactor);

        // Maximum drawdown
        let peak = dailyData[0].price;
        let maxDrawdown = 0;
        for (const d of dailyData) {
            if (d.price > peak) peak = d.price;
            const drawdown = ((peak - d.price) / peak) * 100;
            if (drawdown > maxDrawdown) maxDrawdown = drawdown;
        }

        // Sharpe-like ratio (simplified)
        const riskFreeRate = 4.5 / annualizationFactor; // Daily risk-free
        const avgDailyReturn = meanReturn;
        const sharpeRatio = (avgDailyReturn - riskFreeRate) / dailyVolatility;

        // Volatility interpretation
        let riskLevel: 'low' | 'moderate' | 'high' | 'extreme';
        if (annualizedVolatility < 15) riskLevel = 'low';
        else if (annualizedVolatility < 25) riskLevel = 'moderate';
        else if (annualizedVolatility < 40) riskLevel = 'high';
        else riskLevel = 'extreme';

        return {
            dailyVolatility: parseFloat(dailyVolatility.toFixed(2)),
            annualizedVolatility: parseFloat(annualizedVolatility.toFixed(2)),
            meanReturn: parseFloat(meanReturn.toFixed(3)),
            maxDrawdown: parseFloat(maxDrawdown.toFixed(2)),
            sharpeRatio: parseFloat(sharpeRatio.toFixed(3)),
            riskLevel,
            priceData: dailyData.map(d => ({ time: d.date, value: d.price })),
            returnData: dailyData.map(d => ({
                time: d.date,
                value: d.return,
                color: d.return >= 0 ? '#10b981' : '#ef4444'
            }))
        };
    }, [dailyData, annualizationFactor]);

    // Dark mode detection
    useEffect(() => {
        const checkDarkMode = () => {
            setIsDark(document.documentElement.classList.contains('dark'));
        };
        checkDarkMode();
        const observer = new MutationObserver(checkDarkMode);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);

    // Create chart
    useEffect(() => {
        if (!chartContainerRef.current || !result) return;

        if (chartRef.current) {
            chartRef.current.remove();
            chartRef.current = null;
        }

        const container = chartContainerRef.current;

        const chart = createChart(container, {
            layout: {
                background: { type: ColorType.Solid, color: 'transparent' },
                textColor: isDark ? '#94a3b8' : '#64748b',
                attributionLogo: false,
            },
            grid: {
                vertLines: { color: isDark ? '#1e293b' : '#f1f5f9', style: 1 },
                horzLines: { color: isDark ? '#1e293b' : '#f1f5f9', style: 1 },
            },
            width: container.clientWidth,
            height: 200,
            rightPriceScale: { borderColor: isDark ? '#334155' : '#e2e8f0' },
            timeScale: { borderColor: isDark ? '#334155' : '#e2e8f0' },
        });

        chartRef.current = chart;

        // Add histogram for daily returns
        const histogramSeries = chart.addSeries(HistogramSeries, {
            priceFormat: { type: 'percent' },
        });

        histogramSeries.setData(result.returnData as any);
        chart.timeScale().fitContent();

        const handleResize = () => {
            if (chartContainerRef.current && chartRef.current) {
                chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
            }
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            if (chartRef.current) {
                chartRef.current.remove();
                chartRef.current = null;
            }
        };
    }, [result, isDark]);

    const getRiskColor = () => {
        if (!result) return 'text-blue-600';
        switch (result.riskLevel) {
            case 'low': return 'text-emerald-600';
            case 'moderate': return 'text-blue-600';
            case 'high': return 'text-amber-600';
            case 'extreme': return 'text-red-600';
        }
    };

    const getRiskBg = () => {
        if (!result) return 'bg-blue-50';
        switch (result.riskLevel) {
            case 'low': return 'bg-emerald-50 dark:bg-emerald-900/20';
            case 'moderate': return 'bg-blue-50 dark:bg-blue-900/20';
            case 'high': return 'bg-amber-50 dark:bg-amber-900/20';
            case 'extreme': return 'bg-red-50 dark:bg-red-900/20';
        }
    };

    return (
        <CalculatorLayout
            title="Volatility Calculator"
            description="Measure investment volatility and risk metrics"
            category="Portfolio Analysis"
            results={
                <div className="space-y-4">
                    {result && (
                        <>
                            {/* Main Volatility Display */}
                            <div className={`text-center p-6 rounded-xl ${getRiskBg()}`}>
                                <Activity className={`w-8 h-8 mx-auto mb-2 ${getRiskColor()}`} />
                                <p className="text-sm text-slate-500">Annualized Volatility</p>
                                <p className={`text-4xl font-bold ${getRiskColor()}`}>{result.annualizedVolatility}%</p>
                                <p className="text-sm text-slate-500 mt-1 capitalize">{result.riskLevel} Risk</p>
                            </div>

                            {/* Key Metrics */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-4 bg-white dark:bg-slate-800 rounded-xl text-center">
                                    <p className="text-xs text-slate-500 mb-1">Daily Volatility</p>
                                    <p className="text-xl font-bold text-blue-600">{result.dailyVolatility}%</p>
                                </div>
                                <div className="p-4 bg-white dark:bg-slate-800 rounded-xl text-center">
                                    <p className="text-xs text-slate-500 mb-1">Max Drawdown</p>
                                    <p className="text-xl font-bold text-red-500">-{result.maxDrawdown}%</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-4 bg-white dark:bg-slate-800 rounded-xl text-center">
                                    <p className="text-xs text-slate-500 mb-1">Avg Daily Return</p>
                                    <p className={`text-xl font-bold ${result.meanReturn >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                        {result.meanReturn >= 0 ? '+' : ''}{result.meanReturn}%
                                    </p>
                                </div>
                                <div className="p-4 bg-white dark:bg-slate-800 rounded-xl text-center">
                                    <p className="text-xs text-slate-500 mb-1">Sharpe Ratio</p>
                                    <p className={`text-xl font-bold ${result.sharpeRatio >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                        {result.sharpeRatio}
                                    </p>
                                </div>
                            </div>

                            {/* Returns Distribution Chart */}
                            <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                                    Daily Returns Distribution
                                </p>
                                <div ref={chartContainerRef} className="w-full" style={{ height: 200 }} />
                            </div>

                            {/* Volatility Reference */}
                            <div className="grid grid-cols-4 gap-2 text-center text-xs">
                                <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                                    <p className="font-bold text-emerald-600">{'<15%'}</p>
                                    <p className="text-emerald-700">Low</p>
                                </div>
                                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                    <p className="font-bold text-blue-600">15-25%</p>
                                    <p className="text-blue-700">Moderate</p>
                                </div>
                                <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                                    <p className="font-bold text-amber-600">25-40%</p>
                                    <p className="text-amber-700">High</p>
                                </div>
                                <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                    <p className="font-bold text-red-600">{'>40%'}</p>
                                    <p className="text-red-700">Extreme</p>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            }
        >
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Stock Symbol
                    </label>
                    <input
                        type="text"
                        value={stockSymbol}
                        onChange={(e) => setStockSymbol(e.target.value.toUpperCase())}
                        placeholder="AAPL"
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Time Period: {timePeriod} days
                    </label>
                    <input
                        type="range"
                        min={10}
                        max={252}
                        value={timePeriod}
                        onChange={(e) => setTimePeriod(Number(e.target.value))}
                        className="w-full accent-blue-500"
                    />
                    <div className="flex justify-between text-xs text-slate-400 mt-1">
                        <span>10 days</span>
                        <span>252 days (1 year)</span>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Annualization Factor
                    </label>
                    <select
                        value={annualizationFactor}
                        onChange={(e) => setAnnualizationFactor(Number(e.target.value))}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                    >
                        <option value={252}>252 (Trading days)</option>
                        <option value={365}>365 (Calendar days)</option>
                        <option value={12}>12 (Monthly data)</option>
                    </select>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-xs text-slate-600 dark:text-slate-400">
                    <p className="font-medium mb-2">Understanding Volatility:</p>
                    <ul className="space-y-1 list-disc list-inside">
                        <li>Measures price fluctuation over time</li>
                        <li>Higher volatility = higher risk/reward</li>
                        <li>S&P 500 avg volatility is ~15-20%</li>
                    </ul>
                </div>
            </div>
        </CalculatorLayout>
    );
}
