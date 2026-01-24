'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import { Target, TrendingUp, BarChart3, Activity } from 'lucide-react';
import {
    createChart,
    ColorType,
    LineSeries,
    type IChartApi,
} from 'lightweight-charts';

export default function BetaCalculator() {
    const [stockSymbol, setStockSymbol] = useState('AAPL');
    const [riskFreeRate, setRiskFreeRate] = useState(4.5);
    const [timePeriod, setTimePeriod] = useState(12);
    const [targetBeta, setTargetBeta] = useState(1.2);

    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const [isDark, setIsDark] = useState(false);

    // Generate sample returns data based on target beta
    const returnsData = useMemo(() => {
        const data = [];
        for (let i = 0; i < timePeriod; i++) {
            const marketReturn = (Math.random() - 0.5) * 6; // -3% to +3%
            const stockReturn = marketReturn * targetBeta + (Math.random() - 0.5) * 2;
            data.push({
                month: `M${i + 1}`,
                stock: parseFloat(stockReturn.toFixed(2)),
                market: parseFloat(marketReturn.toFixed(2))
            });
        }
        return data;
    }, [timePeriod, targetBeta]);

    // Calculate Beta and related metrics
    const result = useMemo(() => {
        const stockReturns = returnsData.map(d => d.stock);
        const marketReturns = returnsData.map(d => d.market);
        const n = stockReturns.length;

        if (n === 0) return null;

        // Calculate means
        const stockMean = stockReturns.reduce((sum, r) => sum + r, 0) / n;
        const marketMean = marketReturns.reduce((sum, r) => sum + r, 0) / n;

        // Calculate covariance and variance
        let covariance = 0;
        let marketVariance = 0;
        let stockVariance = 0;

        for (let i = 0; i < n; i++) {
            const stockDiff = stockReturns[i] - stockMean;
            const marketDiff = marketReturns[i] - marketMean;
            covariance += stockDiff * marketDiff;
            marketVariance += marketDiff * marketDiff;
            stockVariance += stockDiff * stockDiff;
        }

        covariance /= (n - 1);
        marketVariance /= (n - 1);
        stockVariance /= (n - 1);

        // Calculate beta
        const beta = covariance / marketVariance;

        // Calculate alpha (using simplified monthly returns)
        const rf = riskFreeRate / 12; // Monthly
        const alpha = stockMean - (rf + beta * (marketMean - rf));

        // Calculate R-squared
        const correlation = covariance / (Math.sqrt(stockVariance) * Math.sqrt(marketVariance));
        const rSquared = Math.pow(correlation, 2);

        // Interpretation
        let interpretation = '';
        let riskLevel: 'defensive' | 'neutral' | 'aggressive';
        if (beta < 0.8) {
            interpretation = 'Defensive stock - less volatile than market';
            riskLevel = 'defensive';
        } else if (beta < 1.2) {
            interpretation = 'Neutral - moves with market';
            riskLevel = 'neutral';
        } else {
            interpretation = 'Aggressive stock - more volatile than market';
            riskLevel = 'aggressive';
        }

        // Cumulative performance for chart
        let stockCumulative = 100;
        let marketCumulative = 100;
        const cumulativePerformance = returnsData.map((d, i) => {
            stockCumulative *= (1 + d.stock / 100);
            marketCumulative *= (1 + d.market / 100);
            return {
                time: `2024-${String(i + 1).padStart(2, '0')}-01`,
                stock: stockCumulative,
                market: marketCumulative
            };
        });

        return {
            beta: parseFloat(beta.toFixed(3)),
            alpha: parseFloat(alpha.toFixed(3)),
            rSquared: parseFloat(rSquared.toFixed(3)),
            correlation: parseFloat(correlation.toFixed(3)),
            interpretation,
            riskLevel,
            cumulativePerformance
        };
    }, [returnsData, riskFreeRate]);

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

        // Remove existing chart
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
            height: 250,
            rightPriceScale: {
                borderColor: isDark ? '#334155' : '#e2e8f0',
            },
            timeScale: {
                borderColor: isDark ? '#334155' : '#e2e8f0',
            },
        });

        chartRef.current = chart;

        // Add stock line
        const stockSeries = chart.addSeries(LineSeries, {
            color: '#10b981',
            lineWidth: 2,
            title: stockSymbol,
        });

        // Add market line
        const marketSeries = chart.addSeries(LineSeries, {
            color: '#3b82f6',
            lineWidth: 2,
            lineStyle: 2,
            title: 'Market',
        });

        stockSeries.setData(result.cumulativePerformance.map(d => ({
            time: d.time,
            value: d.stock,
        })) as any);

        marketSeries.setData(result.cumulativePerformance.map(d => ({
            time: d.time,
            value: d.market,
        })) as any);

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
    }, [result, isDark, stockSymbol]);

    const getBetaColor = () => {
        if (!result) return 'text-blue-600';
        if (result.beta < 0.8) return 'text-emerald-600';
        if (result.beta < 1.2) return 'text-blue-600';
        return 'text-red-600';
    };

    const getBetaBg = () => {
        if (!result) return 'bg-blue-50';
        if (result.beta < 0.8) return 'bg-emerald-50 dark:bg-emerald-900/20';
        if (result.beta < 1.2) return 'bg-blue-50 dark:bg-blue-900/20';
        return 'bg-red-50 dark:bg-red-900/20';
    };

    return (
        <CalculatorLayout
            title="Beta Calculator"
            description="Calculate beta coefficient, alpha, and correlation vs market"
            category="Investing"
            results={
                <div className="space-y-4">
                    {result && (
                        <>
                            {/* Key Metrics */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className={`p-4 rounded-xl text-center ${getBetaBg()}`}>
                                    <Target className={`w-6 h-6 mx-auto mb-1 ${getBetaColor()}`} />
                                    <p className="text-xs text-slate-500">Beta (β)</p>
                                    <p className={`text-3xl font-bold ${getBetaColor()}`}>{result.beta}</p>
                                </div>
                                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-center">
                                    <TrendingUp className="w-6 h-6 mx-auto mb-1 text-blue-600" />
                                    <p className="text-xs text-slate-500">Alpha (α)</p>
                                    <p className="text-3xl font-bold text-blue-600">{result.alpha.toFixed(2)}%</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl text-center">
                                    <BarChart3 className="w-5 h-5 mx-auto mb-1 text-purple-600" />
                                    <p className="text-xs text-slate-500">R-Squared</p>
                                    <p className="text-2xl font-bold text-purple-600">{result.rSquared.toFixed(3)}</p>
                                </div>
                                <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-center">
                                    <Activity className="w-5 h-5 mx-auto mb-1 text-indigo-600" />
                                    <p className="text-xs text-slate-500">Correlation</p>
                                    <p className="text-2xl font-bold text-indigo-600">{result.correlation.toFixed(3)}</p>
                                </div>
                            </div>

                            {/* Cumulative Performance Chart */}
                            <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                                    Cumulative Performance
                                </p>
                                <div className="flex gap-4 text-xs mb-2">
                                    <span className="flex items-center gap-1">
                                        <span className="w-3 h-0.5 bg-emerald-500"></span>
                                        {stockSymbol}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <span className="w-3 h-0.5 bg-blue-500 border-dashed"></span>
                                        Market
                                    </span>
                                </div>
                                <div ref={chartContainerRef} className="w-full" style={{ height: 250 }} />
                            </div>

                            {/* Interpretation */}
                            <div className={`p-4 rounded-xl border ${result.riskLevel === 'defensive' ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800' :
                                result.riskLevel === 'aggressive' ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800' :
                                    'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
                                }`}>
                                <p className={`text-sm font-medium ${result.riskLevel === 'defensive' ? 'text-emerald-800 dark:text-emerald-300' :
                                    result.riskLevel === 'aggressive' ? 'text-red-800 dark:text-red-300' :
                                        'text-blue-800 dark:text-blue-300'
                                    }`}>
                                    {result.interpretation}
                                </p>
                            </div>

                            {/* Beta Categories */}
                            <div className="grid grid-cols-3 gap-2 text-center text-xs">
                                <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                                    <p className="font-bold text-emerald-600">β {'<'} 0.8</p>
                                    <p className="text-emerald-700">Defensive</p>
                                </div>
                                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                    <p className="font-bold text-blue-600">β 0.8-1.2</p>
                                    <p className="text-blue-700">Neutral</p>
                                </div>
                                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                    <p className="font-bold text-red-600">β {'>'} 1.2</p>
                                    <p className="text-red-700">Aggressive</p>
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

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Risk-Free Rate (%)
                        </label>
                        <input
                            type="number"
                            step="0.1"
                            value={riskFreeRate}
                            onChange={(e) => setRiskFreeRate(Number(e.target.value))}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Time Period (Months)
                        </label>
                        <input
                            type="number"
                            value={timePeriod}
                            onChange={(e) => setTimePeriod(Number(e.target.value))}
                            min={3}
                            max={60}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Simulated Beta: {targetBeta}
                    </label>
                    <input
                        type="range"
                        min={0.3}
                        max={2.5}
                        step={0.1}
                        value={targetBeta}
                        onChange={(e) => setTargetBeta(Number(e.target.value))}
                        className="w-full accent-emerald-500"
                    />
                    <div className="flex justify-between text-xs text-slate-400 mt-1">
                        <span>0.3 (Defensive)</span>
                        <span>1.0 (Market)</span>
                        <span>2.5 (Aggressive)</span>
                    </div>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-xs text-slate-600 dark:text-slate-400">
                    <p className="font-medium mb-2">Understanding Beta:</p>
                    <ul className="space-y-1 list-disc list-inside">
                        <li>Beta measures systematic risk relative to market</li>
                        <li>Alpha shows excess return vs expected return</li>
                        <li>R² indicates how much movement is explained by market</li>
                    </ul>
                </div>
            </div>
        </CalculatorLayout>
    );
}
