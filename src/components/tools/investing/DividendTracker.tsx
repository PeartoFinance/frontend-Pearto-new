'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import { DollarSign, TrendingUp, Calendar, PlusCircle, Trash2 } from 'lucide-react';
import {
    createChart,
    ColorType,
    HistogramSeries,
    type IChartApi,
} from 'lightweight-charts';

interface Holding {
    symbol: string;
    shares: number;
    dividend: number;
    frequency: 'monthly' | 'quarterly' | 'annually';
}

export default function DividendTracker() {
    const [holdings, setHoldings] = useState<Holding[]>([
        { symbol: 'AAPL', shares: 50, dividend: 0.96, frequency: 'quarterly' },
        { symbol: 'VYM', shares: 100, dividend: 0.85, frequency: 'quarterly' },
        { symbol: 'O', shares: 75, dividend: 0.26, frequency: 'monthly' },
    ]);

    const [newSymbol, setNewSymbol] = useState('');
    const [newShares, setNewShares] = useState(0);
    const [newDividend, setNewDividend] = useState(0);
    const [newFrequency, setNewFrequency] = useState<Holding['frequency']>('quarterly');

    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const [isDark, setIsDark] = useState(false);

    const result = useMemo(() => {
        let monthlyTotal = 0;
        const holdingDetails = holdings.map(h => {
            const annualDividend = h.shares * h.dividend * (
                h.frequency === 'monthly' ? 12 : h.frequency === 'quarterly' ? 4 : 1
            );
            const monthlyDividend = annualDividend / 12;
            monthlyTotal += monthlyDividend;
            return {
                ...h,
                annualDividend,
                monthlyDividend
            };
        });

        const annualTotal = monthlyTotal * 12;

        // Monthly dividend projection for chart
        const months = [];
        const startDate = new Date();
        for (let i = 0; i < 12; i++) {
            const date = new Date(startDate);
            date.setMonth(date.getMonth() + i);
            const monthIndex = date.getMonth();

            let monthDividend = 0;
            holdings.forEach(h => {
                if (h.frequency === 'monthly') {
                    monthDividend += h.shares * h.dividend;
                } else if (h.frequency === 'quarterly' && [2, 5, 8, 11].includes(monthIndex)) {
                    monthDividend += h.shares * h.dividend;
                } else if (h.frequency === 'annually' && monthIndex === 11) {
                    monthDividend += h.shares * h.dividend;
                }
            });

            months.push({
                time: date.toISOString().split('T')[0],
                value: monthDividend,
                color: '#10b981'
            });
        }

        return {
            holdingDetails,
            monthlyTotal,
            annualTotal,
            months
        };
    }, [holdings]);

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
            height: 180,
            rightPriceScale: { borderColor: isDark ? '#334155' : '#e2e8f0' },
            timeScale: { borderColor: isDark ? '#334155' : '#e2e8f0' },
        });

        chartRef.current = chart;

        const series = chart.addSeries(HistogramSeries, {
            color: '#10b981',
        });

        series.setData(result.months as any);
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

    const addHolding = () => {
        if (newSymbol && newShares > 0 && newDividend > 0) {
            setHoldings([...holdings, {
                symbol: newSymbol.toUpperCase(),
                shares: newShares,
                dividend: newDividend,
                frequency: newFrequency
            }]);
            setNewSymbol('');
            setNewShares(0);
            setNewDividend(0);
        }
    };

    const removeHolding = (index: number) => {
        setHoldings(holdings.filter((_, i) => i !== index));
    };

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

    return (
        <CalculatorLayout
            title="Dividend Tracker"
            description="Track and project dividend income from your holdings"
            category="Income"
            results={
                <div className="space-y-4">
                    {/* Income Summary */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl text-center">
                            <p className="text-xs text-slate-500 mb-1">Monthly Income</p>
                            <p className="text-2xl font-bold text-emerald-600">{formatCurrency(result.monthlyTotal)}</p>
                        </div>
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-center">
                            <p className="text-xs text-slate-500 mb-1">Annual Income</p>
                            <p className="text-2xl font-bold text-blue-600">{formatCurrency(result.annualTotal)}</p>
                        </div>
                    </div>

                    {/* Monthly Distribution Chart */}
                    <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                            Monthly Dividend Distribution
                        </p>
                        <div ref={chartContainerRef} className="w-full" style={{ height: 180 }} />
                    </div>

                    {/* Holdings Breakdown */}
                    <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                            Holdings Breakdown
                        </p>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                            {result.holdingDetails.map((h, i) => (
                                <div key={i} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-700 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => removeHolding(i)}
                                            className="text-red-400 hover:text-red-600"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                        <span className="font-medium text-sm">{h.symbol}</span>
                                        <span className="text-xs text-slate-400">{h.shares} shares</span>
                                    </div>
                                    <span className="text-sm font-medium text-emerald-600">
                                        {formatCurrency(h.annualDividend)}/yr
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            }
        >
            <div className="space-y-4">
                {/* Add New Holding */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                        Add Holding
                    </p>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                        <input
                            type="text"
                            value={newSymbol}
                            onChange={(e) => setNewSymbol(e.target.value)}
                            placeholder="Symbol"
                            className="px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        />
                        <input
                            type="number"
                            value={newShares || ''}
                            onChange={(e) => setNewShares(Number(e.target.value))}
                            placeholder="Shares"
                            className="px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                        <input
                            type="number"
                            value={newDividend || ''}
                            onChange={(e) => setNewDividend(Number(e.target.value))}
                            placeholder="Dividend per share"
                            step={0.01}
                            className="px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        />
                        <select
                            value={newFrequency}
                            onChange={(e) => setNewFrequency(e.target.value as Holding['frequency'])}
                            className="px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        >
                            <option value="monthly">Monthly</option>
                            <option value="quarterly">Quarterly</option>
                            <option value="annually">Annually</option>
                        </select>
                    </div>
                    <button
                        onClick={addHolding}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition"
                    >
                        <PlusCircle className="w-4 h-4" />
                        Add Holding
                    </button>
                </div>

                {/* Current Holdings Summary */}
                <div className="text-sm text-slate-600 dark:text-slate-400 text-center">
                    {holdings.length} holdings tracked
                </div>
            </div>
        </CalculatorLayout>
    );
}
