'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import { PiggyBank, TrendingUp, DollarSign, Calendar, Target } from 'lucide-react';
import {
    createChart,
    ColorType,
    AreaSeries,
    type IChartApi,
} from 'lightweight-charts';

export default function CollegeSavingsPlanner() {
    const [childAge, setChildAge] = useState(5);
    const [collegeStartAge, setCollegeStartAge] = useState(18);
    const [currentSavings, setCurrentSavings] = useState(10000);
    const [monthlyContribution, setMonthlyContribution] = useState(500);
    const [annualCollegeCost, setAnnualCollegeCost] = useState(30000);
    const [yearsOfCollege, setYearsOfCollege] = useState(4);
    const [expectedReturn, setExpectedReturn] = useState(7);
    const [collegeCostInflation, setCollegeCostInflation] = useState(5);

    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const [isDark, setIsDark] = useState(false);

    const result = useMemo(() => {
        const yearsUntilCollege = collegeStartAge - childAge;
        const monthsUntilCollege = yearsUntilCollege * 12;
        const monthlyReturn = expectedReturn / 100 / 12;

        // Calculate future college cost with inflation
        const futureCostPerYear = annualCollegeCost * Math.pow(1 + collegeCostInflation / 100, yearsUntilCollege);
        const totalCollegeCost = futureCostPerYear * yearsOfCollege;

        // Calculate future value of savings
        let balance = currentSavings;
        const projections = [];
        const startYear = new Date().getFullYear();

        for (let month = 0; month <= monthsUntilCollege; month++) {
            if (month % 12 === 0) {
                projections.push({
                    time: `${startYear + Math.floor(month / 12)}-01-01`,
                    value: balance
                });
            }
            balance = balance * (1 + monthlyReturn) + monthlyContribution;
        }
        // Add final point
        projections.push({
            time: `${startYear + yearsUntilCollege}-01-01`,
            value: balance
        });

        const projectedSavings = balance;
        const shortfall = totalCollegeCost - projectedSavings;
        const onTrack = projectedSavings >= totalCollegeCost;

        // Calculate required monthly to meet goal
        const requiredMonthly = (totalCollegeCost - currentSavings * Math.pow(1 + monthlyReturn, monthsUntilCollege)) /
            ((Math.pow(1 + monthlyReturn, monthsUntilCollege) - 1) / monthlyReturn);

        // Coverage percentage
        const coveragePercent = (projectedSavings / totalCollegeCost) * 100;

        return {
            yearsUntilCollege,
            futureCostPerYear,
            totalCollegeCost,
            projectedSavings,
            shortfall: Math.max(0, shortfall),
            onTrack,
            requiredMonthly: Math.max(0, requiredMonthly),
            coveragePercent: Math.min(100, coveragePercent),
            projections
        };
    }, [childAge, collegeStartAge, currentSavings, monthlyContribution, annualCollegeCost, yearsOfCollege, expectedReturn, collegeCostInflation]);

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

        const color = result.onTrack ? '#10b981' : '#f59e0b';
        const series = chart.addSeries(AreaSeries, {
            lineColor: color,
            topColor: result.onTrack ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)',
            bottomColor: result.onTrack ? 'rgba(16, 185, 129, 0.02)' : 'rgba(245, 158, 11, 0.02)',
            lineWidth: 2,
        });

        series.setData(result.projections as any);
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

    return (
        <CalculatorLayout
            title="College Savings Planner"
            description="Plan and track savings for your child's education"
            category="Education"
            results={
                <div className="space-y-4">
                    {/* Status */}
                    <div className={`text-center p-6 rounded-xl ${result.onTrack ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-amber-50 dark:bg-amber-900/20'}`}>
                        {result.onTrack ? (
                            <Target className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                        ) : (
                            <PiggyBank className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                        )}
                        <p className="text-sm text-slate-500">Projected at College Start</p>
                        <p className={`text-4xl font-bold ${result.onTrack ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {formatCurrency(result.projectedSavings)}
                        </p>
                        <p className="text-sm mt-1">
                            <span className={result.onTrack ? 'text-emerald-600' : 'text-amber-600'}>
                                {result.onTrack ? '✓ On track!' : `${formatCurrency(result.shortfall)} shortfall`}
                            </span>
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl text-center">
                            <p className="text-xs text-slate-500 mb-1">Total College Cost</p>
                            <p className="text-xl font-bold text-blue-600">{formatCurrency(result.totalCollegeCost)}</p>
                            <p className="text-xs text-slate-400">{yearsOfCollege} years × {formatCurrency(result.futureCostPerYear)}/yr</p>
                        </div>
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl text-center">
                            <p className="text-xs text-slate-500 mb-1">Years Until College</p>
                            <p className="text-xl font-bold text-purple-600">{result.yearsUntilCollege}</p>
                            <p className="text-xs text-slate-400">Age {childAge} → {collegeStartAge}</p>
                        </div>
                    </div>

                    {/* Savings Growth Chart */}
                    <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                            Savings Growth Projection
                        </p>
                        <div ref={chartContainerRef} className="w-full" style={{ height: 200 }} />
                    </div>

                    {/* Progress Bar */}
                    <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                        <div className="flex justify-between mb-2">
                            <span className="text-sm text-slate-500">Goal Coverage</span>
                            <span className={`text-sm font-bold ${result.onTrack ? 'text-emerald-600' : 'text-amber-600'}`}>
                                {result.coveragePercent.toFixed(0)}%
                            </span>
                        </div>
                        <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div
                                className={`h-full transition-all ${result.onTrack ? 'bg-emerald-500' : 'bg-amber-500'}`}
                                style={{ width: `${Math.min(100, result.coveragePercent)}%` }}
                            />
                        </div>
                    </div>

                    {/* Recommendation */}
                    {!result.onTrack && (
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                            <p className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">
                                💡 To fully fund college:
                            </p>
                            <p className="text-sm text-blue-700 dark:text-blue-400">
                                Increase monthly contribution to {formatCurrency(result.requiredMonthly)}
                            </p>
                        </div>
                    )}
                </div>
            }
        >
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Child's Age
                        </label>
                        <input
                            type="number"
                            value={childAge}
                            onChange={(e) => setChildAge(Number(e.target.value))}
                            min={0}
                            max={17}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            College Start Age
                        </label>
                        <input
                            type="number"
                            value={collegeStartAge}
                            onChange={(e) => setCollegeStartAge(Number(e.target.value))}
                            min={childAge + 1}
                            max={25}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Current Savings ($)
                        </label>
                        <input
                            type="number"
                            value={currentSavings}
                            onChange={(e) => setCurrentSavings(Number(e.target.value))}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Monthly Contribution ($)
                        </label>
                        <input
                            type="number"
                            value={monthlyContribution}
                            onChange={(e) => setMonthlyContribution(Number(e.target.value))}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Annual College Cost ($)
                        </label>
                        <input
                            type="number"
                            value={annualCollegeCost}
                            onChange={(e) => setAnnualCollegeCost(Number(e.target.value))}
                            step={1000}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Years of College
                        </label>
                        <select
                            value={yearsOfCollege}
                            onChange={(e) => setYearsOfCollege(Number(e.target.value))}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        >
                            <option value={2}>2 years</option>
                            <option value={4}>4 years</option>
                            <option value={5}>5 years</option>
                            <option value={6}>6 years (grad school)</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Expected Return: {expectedReturn}%
                        </label>
                        <input
                            type="range"
                            min={3}
                            max={12}
                            step={0.5}
                            value={expectedReturn}
                            onChange={(e) => setExpectedReturn(Number(e.target.value))}
                            className="w-full accent-emerald-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Cost Inflation: {collegeCostInflation}%
                        </label>
                        <input
                            type="range"
                            min={2}
                            max={8}
                            step={0.5}
                            value={collegeCostInflation}
                            onChange={(e) => setCollegeCostInflation(Number(e.target.value))}
                            className="w-full accent-amber-500"
                        />
                    </div>
                </div>
            </div>
        </CalculatorLayout>
    );
}
