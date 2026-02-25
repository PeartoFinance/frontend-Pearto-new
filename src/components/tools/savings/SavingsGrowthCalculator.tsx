'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import { TrendingUp, Percent, DollarSign, Clock, BarChart3 } from 'lucide-react';
import {
    createChart,
    ColorType,
    AreaSeries,
    type IChartApi,
} from 'lightweight-charts';

export default function SavingsGrowthCalculator() {
    const [initialDeposit, setInitialDeposit] = useState(10000);
    const [monthlyContribution, setMonthlyContribution] = useState(500);
    const [annualRate, setAnnualRate] = useState(5);
    const [years, setYears] = useState(10);
    const [compoundFrequency, setCompoundFrequency] = useState<'daily' | 'monthly' | 'quarterly' | 'annually'>('monthly');

    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const [isDark, setIsDark] = useState(false);

    const result = useMemo(() => {
        const periods = {
            daily: 365,
            monthly: 12,
            quarterly: 4,
            annually: 1
        };
        const n = periods[compoundFrequency];
        const r = annualRate / 100;
        const t = years;

        // Compound interest with regular contributions
        // FV = P(1 + r/n)^(nt) + PMT × [((1 + r/n)^(nt) - 1) / (r/n)]
        const compoundFactor = Math.pow(1 + r / n, n * t);
        const futureValueInitial = initialDeposit * compoundFactor;

        // Monthly contribution adjusted for compound frequency
        const contributionPerPeriod = monthlyContribution * (12 / n);
        const futureValueContributions = contributionPerPeriod * ((compoundFactor - 1) / (r / n));

        const totalBalance = futureValueInitial + futureValueContributions;
        const totalContributions = initialDeposit + (monthlyContribution * 12 * years);
        const totalInterest = totalBalance - totalContributions;

        // Generate monthly projections for chart
        const projections = [];
        const startDate = new Date();
        let balance = initialDeposit;

        for (let month = 0; month <= years * 12; month++) {
            const date = new Date(startDate);
            date.setMonth(date.getMonth() + month);

            projections.push({
                time: date.toISOString().split('T')[0],
                value: balance
            });

            // Apply monthly growth
            const monthlyRate = Math.pow(1 + r / n, n / 12) - 1;
            balance = (balance + monthlyContribution) * (1 + monthlyRate);
        }

        // Calculate milestones
        const doublePoint = projections.findIndex(p => p.value >= initialDeposit * 2);
        const yearsToDouble = doublePoint > 0 ? Math.round(doublePoint / 12 * 10) / 10 : null;

        return {
            totalBalance,
            totalContributions,
            totalInterest,
            effectiveRate: (totalInterest / totalContributions) * 100,
            projections,
            yearsToDouble
        };
    }, [initialDeposit, monthlyContribution, annualRate, years, compoundFrequency]);

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
                vertLines: { color: isDark ? 'rgba(255, 255, 255, 0.10)' : 'rgba(0, 0, 0, 0.08)', style: 1 },
                horzLines: { color: isDark ? 'rgba(255, 255, 255, 0.10)' : 'rgba(0, 0, 0, 0.08)', style: 1 },
            },
            width: container.clientWidth,
            height: 200,
            rightPriceScale: { borderColor: isDark ? '#334155' : '#e2e8f0' },
            timeScale: { borderColor: isDark ? '#334155' : '#e2e8f0' },
        });

        chartRef.current = chart;

        const series = chart.addSeries(AreaSeries, {
            lineColor: '#10b981',
            topColor: 'rgba(16, 185, 129, 0.3)',
            bottomColor: 'rgba(16, 185, 129, 0.02)',
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
            title="Savings Growth Calculator"
            description="Project your savings growth with compound interest"
            category="Savings"
            results={
                <div className="space-y-4">
                    {/* Final Balance */}
                    <div className="text-center p-6 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                        <TrendingUp className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                        <p className="text-sm text-slate-500">Future Value in {years} Years</p>
                        <p className="text-4xl font-bold text-emerald-600">{formatCurrency(result.totalBalance)}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl text-center">
                            <p className="text-xs text-slate-500 mb-1">Total Contributions</p>
                            <p className="text-xl font-bold text-blue-600">{formatCurrency(result.totalContributions)}</p>
                        </div>
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl text-center">
                            <p className="text-xs text-slate-500 mb-1">Interest Earned</p>
                            <p className="text-xl font-bold text-emerald-600">{formatCurrency(result.totalInterest)}</p>
                        </div>
                    </div>

                    {/* Growth Chart */}
                    <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                            Savings Growth Over Time
                        </p>
                        <div ref={chartContainerRef} className="w-full" style={{ height: 200 }} />
                    </div>

                    {/* Breakdown Bar */}
                    <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                            Balance Breakdown
                        </p>
                        <div className="h-4 rounded-full overflow-hidden flex">
                            <div
                                className="bg-blue-500 h-full"
                                style={{ width: `${(result.totalContributions / result.totalBalance) * 100}%` }}
                            />
                            <div
                                className="bg-emerald-500 h-full"
                                style={{ width: `${(result.totalInterest / result.totalBalance) * 100}%` }}
                            />
                        </div>
                        <div className="flex justify-between text-xs mt-2">
                            <span className="text-blue-600">Contributions: {((result.totalContributions / result.totalBalance) * 100).toFixed(0)}%</span>
                            <span className="text-emerald-600">Interest: {((result.totalInterest / result.totalBalance) * 100).toFixed(0)}%</span>
                        </div>
                    </div>

                    {/* Milestone */}
                    {result.yearsToDouble && (
                        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl text-center">
                            <Clock className="w-5 h-5 text-purple-500 mx-auto mb-1" />
                            <p className="text-sm text-slate-500">Initial deposit doubles in</p>
                            <p className="text-xl font-bold text-purple-600">{result.yearsToDouble} years</p>
                        </div>
                    )}
                </div>
            }
        >
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Initial Deposit ($)
                        </label>
                        <input
                            type="number"
                            value={initialDeposit}
                            onChange={(e) => setInitialDeposit(Number(e.target.value))}
                            step={1000}
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
                            step={100}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Annual Interest Rate: {annualRate}%
                    </label>
                    <input
                        type="range"
                        min={0.5}
                        max={15}
                        step={0.5}
                        value={annualRate}
                        onChange={(e) => setAnnualRate(Number(e.target.value))}
                        className="w-full accent-emerald-500"
                    />
                    <div className="flex justify-between text-xs text-slate-400 mt-1">
                        <span>0.5%</span>
                        <span>15%</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Time Period (Years)
                        </label>
                        <input
                            type="number"
                            value={years}
                            onChange={(e) => setYears(Number(e.target.value))}
                            min={1}
                            max={50}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Compound Frequency
                        </label>
                        <select
                            value={compoundFrequency}
                            onChange={(e) => setCompoundFrequency(e.target.value as typeof compoundFrequency)}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        >
                            <option value="daily">Daily</option>
                            <option value="monthly">Monthly</option>
                            <option value="quarterly">Quarterly</option>
                            <option value="annually">Annually</option>
                        </select>
                    </div>
                </div>
            </div>
        </CalculatorLayout>
    );
}
