'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import { TrendingDown, AlertTriangle, DollarSign, BarChart3, RefreshCw } from 'lucide-react';
import {
    createChart,
    ColorType,
    LineSeries,
    type IChartApi,
} from 'lightweight-charts';

export default function MarketCrashSimulator() {
    const [portfolioValue, setPortfolioValue] = useState(100000);
    const [stockAllocation, setStockAllocation] = useState(70);
    const [bondAllocation, setBondAllocation] = useState(25);
    const [cashAllocation, setCashAllocation] = useState(5);
    const [crashScenario, setCrashScenario] = useState<'2008' | '2020' | 'custom'>('2008');
    const [customCrashPercent, setCustomCrashPercent] = useState(40);
    const [recoveryYears, setRecoveryYears] = useState(4);

    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const [isDark, setIsDark] = useState(false);

    // Crash scenarios
    const crashData = {
        '2008': { stockDrop: 55, bondChange: 5, name: '2008 Financial Crisis', recoveryMonths: 48 },
        '2020': { stockDrop: 34, bondChange: 8, name: 'COVID-19 Crash', recoveryMonths: 6 },
        'custom': { stockDrop: customCrashPercent, bondChange: -5, name: 'Custom Scenario', recoveryMonths: recoveryYears * 12 }
    };

    // Calculate portfolio impact
    const result = useMemo(() => {
        const scenario = crashData[crashScenario];

        const stockValue = portfolioValue * (stockAllocation / 100);
        const bondValue = portfolioValue * (bondAllocation / 100);
        const cashValue = portfolioValue * (cashAllocation / 100);

        const stockLoss = stockValue * (scenario.stockDrop / 100);
        const bondGain = bondValue * (Math.abs(scenario.bondChange) / 100) * (scenario.bondChange > 0 ? 1 : -1);
        const cashChange = 0;

        const totalLoss = stockLoss - bondGain - cashChange;
        const portfolioAfterCrash = portfolioValue - totalLoss;
        const percentLoss = (totalLoss / portfolioValue) * 100;

        // Generate recovery timeline
        const monthlyRecoveryRate = Math.pow(portfolioValue / portfolioAfterCrash, 1 / scenario.recoveryMonths);
        const timeline = [];
        let currentValue = portfolioAfterCrash;
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - scenario.recoveryMonths);

        for (let i = 0; i <= scenario.recoveryMonths; i++) {
            const date = new Date(startDate);
            date.setMonth(date.getMonth() + i);

            if (i === 0) {
                // Crash point
                timeline.push({ time: date.toISOString().split('T')[0], value: portfolioValue });
            } else if (i === 1) {
                // Bottom
                timeline.push({ time: date.toISOString().split('T')[0], value: portfolioAfterCrash });
            } else {
                // Recovery
                currentValue *= monthlyRecoveryRate;
                timeline.push({ time: date.toISOString().split('T')[0], value: Math.min(currentValue, portfolioValue * 1.1) });
            }
        }

        // Risk assessment
        let riskLevel: 'conservative' | 'moderate' | 'aggressive';
        if (stockAllocation < 40) riskLevel = 'conservative';
        else if (stockAllocation < 70) riskLevel = 'moderate';
        else riskLevel = 'aggressive';

        return {
            portfolioAfterCrash,
            totalLoss,
            percentLoss,
            stockLoss,
            bondGain,
            scenarioName: scenario.name,
            recoveryMonths: scenario.recoveryMonths,
            timeline,
            riskLevel
        };
    }, [portfolioValue, stockAllocation, bondAllocation, cashAllocation, crashScenario, customCrashPercent, recoveryYears]);

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
            height: 220,
            rightPriceScale: { borderColor: isDark ? '#334155' : '#e2e8f0' },
            timeScale: { borderColor: isDark ? '#334155' : '#e2e8f0' },
        });

        chartRef.current = chart;

        const series = chart.addSeries(LineSeries, {
            color: '#ef4444',
            lineWidth: 2,
        });

        series.setData(result.timeline as any);
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

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);

    // Ensure allocations sum to 100
    const handleStockChange = (value: number) => {
        setStockAllocation(value);
        const remaining = 100 - value;
        setBondAllocation(Math.min(bondAllocation, remaining));
        setCashAllocation(100 - value - Math.min(bondAllocation, remaining));
    };

    return (
        <CalculatorLayout
            title="Market Crash Simulator"
            description="See how your portfolio would perform in a market crash"
            category="Portfolio Analysis"
            results={
                <div className="space-y-4">
                    {/* Impact Summary */}
                    <div className="text-center p-6 bg-red-50 dark:bg-red-900/20 rounded-xl">
                        <TrendingDown className="w-8 h-8 text-red-500 mx-auto mb-2" />
                        <p className="text-sm text-slate-500">{result.scenarioName}</p>
                        <p className="text-4xl font-bold text-red-600">-{formatCurrency(result.totalLoss)}</p>
                        <p className="text-sm text-red-500 mt-1">-{result.percentLoss.toFixed(1)}% portfolio loss</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl text-center">
                            <p className="text-xs text-slate-500 mb-1">Before Crash</p>
                            <p className="text-xl font-bold text-slate-700 dark:text-slate-300">{formatCurrency(portfolioValue)}</p>
                        </div>
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl text-center">
                            <p className="text-xs text-slate-500 mb-1">After Crash</p>
                            <p className="text-xl font-bold text-red-500">{formatCurrency(result.portfolioAfterCrash)}</p>
                        </div>
                    </div>

                    {/* Crash & Recovery Chart */}
                    <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                Crash & Recovery Timeline
                            </p>
                            <span className="text-xs text-slate-500">
                                ~{Math.round(result.recoveryMonths / 12)} years to recover
                            </span>
                        </div>
                        <div ref={chartContainerRef} className="w-full" style={{ height: 220 }} />
                    </div>

                    {/* Impact Breakdown */}
                    <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                            Asset Impact
                        </p>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-slate-500">Stocks ({stockAllocation}%)</span>
                                <span className="font-medium text-red-500">-{formatCurrency(result.stockLoss)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Bonds ({bondAllocation}%)</span>
                                <span className={`font-medium ${result.bondGain >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                    {result.bondGain >= 0 ? '+' : ''}{formatCurrency(result.bondGain)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Cash ({cashAllocation}%)</span>
                                <span className="font-medium text-slate-600">$0</span>
                            </div>
                        </div>
                    </div>

                    {/* Risk Warning */}
                    <div className={`p-4 rounded-xl border ${result.riskLevel === 'aggressive' ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800' :
                            result.riskLevel === 'moderate' ? 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800' :
                                'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800'
                        }`}>
                        <div className="flex items-start gap-2">
                            <AlertTriangle className={`w-4 h-4 flex-shrink-0 ${result.riskLevel === 'aggressive' ? 'text-red-500' :
                                    result.riskLevel === 'moderate' ? 'text-amber-500' : 'text-emerald-500'
                                }`} />
                            <div>
                                <p className="text-sm font-medium capitalize">{result.riskLevel} Risk Profile</p>
                                <p className="text-xs mt-1 opacity-80">
                                    {result.riskLevel === 'aggressive' ?
                                        'High stock allocation means larger losses but faster recovery potential' :
                                        result.riskLevel === 'moderate' ?
                                            'Balanced allocation provides some crash protection' :
                                            'Conservative allocation limits crash damage'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            }
        >
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Portfolio Value ($)
                    </label>
                    <input
                        type="number"
                        value={portfolioValue}
                        onChange={(e) => setPortfolioValue(Number(e.target.value))}
                        step={10000}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Stock Allocation: {stockAllocation}%
                    </label>
                    <input
                        type="range"
                        min={0}
                        max={100}
                        value={stockAllocation}
                        onChange={(e) => handleStockChange(Number(e.target.value))}
                        className="w-full accent-blue-500"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Bonds: {bondAllocation}%
                        </label>
                        <input
                            type="range"
                            min={0}
                            max={100 - stockAllocation}
                            value={bondAllocation}
                            onChange={(e) => {
                                setBondAllocation(Number(e.target.value));
                                setCashAllocation(100 - stockAllocation - Number(e.target.value));
                            }}
                            className="w-full accent-emerald-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Cash: {cashAllocation}%
                        </label>
                        <input
                            type="range"
                            min={0}
                            max={100 - stockAllocation}
                            value={cashAllocation}
                            onChange={(e) => {
                                setCashAllocation(Number(e.target.value));
                                setBondAllocation(100 - stockAllocation - Number(e.target.value));
                            }}
                            className="w-full accent-amber-500"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Crash Scenario
                    </label>
                    <select
                        value={crashScenario}
                        onChange={(e) => setCrashScenario(e.target.value as typeof crashScenario)}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                    >
                        <option value="2008">2008 Financial Crisis (-55%)</option>
                        <option value="2020">COVID-19 Crash (-34%)</option>
                        <option value="custom">Custom Scenario</option>
                    </select>
                </div>

                {crashScenario === 'custom' && (
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Stock Drop: {customCrashPercent}%
                            </label>
                            <input
                                type="range"
                                min={10}
                                max={80}
                                value={customCrashPercent}
                                onChange={(e) => setCustomCrashPercent(Number(e.target.value))}
                                className="w-full accent-red-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Recovery: {recoveryYears} years
                            </label>
                            <input
                                type="range"
                                min={1}
                                max={10}
                                value={recoveryYears}
                                onChange={(e) => setRecoveryYears(Number(e.target.value))}
                                className="w-full accent-emerald-500"
                            />
                        </div>
                    </div>
                )}
            </div>
        </CalculatorLayout>
    );
}
