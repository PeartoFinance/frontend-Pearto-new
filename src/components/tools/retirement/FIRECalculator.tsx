'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import PriceDisplay from '@/components/common/PriceDisplay';
import { Flame, TrendingUp, DollarSign, Clock, Target } from 'lucide-react';
import {
    createChart,
    ColorType,
    AreaSeries,
    type IChartApi,
} from 'lightweight-charts';

export default function FIRECalculator() {
    const [currentAge, setCurrentAge] = useState(30);
    const [retireAge, setRetireAge] = useState(50);
    const [currentSavings, setCurrentSavings] = useState(100000);
    const [annualIncome, setAnnualIncome] = useState(100000);
    const [savingsRate, setSavingsRate] = useState(50);
    const [withdrawalRate, setWithdrawalRate] = useState(4);
    const [expectedReturn, setExpectedReturn] = useState(7);
    const [inflationRate, setInflationRate] = useState(3);

    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const [isDark, setIsDark] = useState(false);

    const result = useMemo(() => {
        const yearsToRetirement = retireAge - currentAge;
        const annualSavings = annualIncome * (savingsRate / 100);
        const monthlyReturn = expectedReturn / 100 / 12;
        const realReturn = (1 + expectedReturn / 100) / (1 + inflationRate / 100) - 1;

        // Calculate required FIRE number
        const annualExpenses = annualIncome * (1 - savingsRate / 100);
        const fireNumber = annualExpenses / (withdrawalRate / 100);

        // Project savings growth
        let balance = currentSavings;
        const projections = [];
        const startYear = new Date().getFullYear();
        let fireReachedYear = null;

        for (let year = 0; year <= yearsToRetirement + 10; year++) {
            projections.push({
                time: `${startYear + year}-01-01`,
                value: balance
            });

            if (balance >= fireNumber && fireReachedYear === null) {
                fireReachedYear = startYear + year;
            }

            // Add annual savings and apply return
            if (year < yearsToRetirement) {
                balance = (balance + annualSavings) * (1 + realReturn);
            } else {
                // Post-retirement: withdraw and apply return
                balance = (balance - annualExpenses) * (1 + realReturn);
            }
        }

        const finalBalance = projections[yearsToRetirement]?.value || 0;
        const onTrack = finalBalance >= fireNumber;
        const yearsToFIRE = fireReachedYear ? fireReachedYear - startYear : null;

        // Calculate monthly savings needed to hit FIRE
        const monthsToRetirement = yearsToRetirement * 12;
        const targetAfterExpected = fireNumber - currentSavings * Math.pow(1 + monthlyReturn, monthsToRetirement);
        const requiredMonthlySavings = targetAfterExpected * monthlyReturn /
            (Math.pow(1 + monthlyReturn, monthsToRetirement) - 1);

        return {
            fireNumber,
            finalBalance,
            onTrack,
            yearsToFIRE,
            yearsToRetirement,
            annualSavings,
            annualExpenses,
            requiredMonthlySavings: Math.max(0, requiredMonthlySavings),
            projections,
            coastFIRE: currentSavings * Math.pow(1 + realReturn, yearsToRetirement)
        };
    }, [currentAge, retireAge, currentSavings, annualIncome, savingsRate, withdrawalRate, expectedReturn, inflationRate]);

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



    return (
        <CalculatorLayout
            title="FIRE Calculator"
            description="Calculate your Financial Independence, Retire Early timeline"
            category="Retirement"
            results={
                <div className="space-y-4">
                    {/* FIRE Number */}
                    <div className={`text-center p-6 rounded-xl ${result.onTrack ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-amber-50 dark:bg-amber-900/20'}`}>
                        <Flame className={`w-8 h-8 mx-auto mb-2 ${result.onTrack ? 'text-emerald-500' : 'text-amber-500'}`} />
                        <p className="text-sm text-slate-500">Your FIRE Number</p>
                        <p className={`text-4xl font-bold ${result.onTrack ? 'text-emerald-600' : 'text-amber-600'}`}>
                            <PriceDisplay amount={result.fireNumber} maximumFractionDigits={0} />
                        </p>
                        {result.yearsToFIRE && (
                            <p className="text-sm mt-1 text-emerald-600">
                                🔥 Reached in {result.yearsToFIRE} years!
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl text-center">
                            <p className="text-xs text-slate-500 mb-1">At Retirement Age {retireAge}</p>
                            <p className={`text-xl font-bold ${result.onTrack ? 'text-emerald-600' : 'text-amber-600'}`}>
                                <PriceDisplay amount={result.finalBalance} maximumFractionDigits={0} />
                            </p>
                        </div>
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl text-center">
                            <p className="text-xs text-slate-500 mb-1">Annual Expenses</p>
                            <p className="text-xl font-bold text-blue-600">
                                <PriceDisplay amount={result.annualExpenses} maximumFractionDigits={0} />
                            </p>
                        </div>
                    </div>

                    {/* Wealth Projection Chart */}
                    <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                            Wealth Projection
                        </p>
                        <div ref={chartContainerRef} className="w-full" style={{ height: 200 }} />
                        <p className="text-xs text-center text-slate-400 mt-2">
                            Target: <PriceDisplay amount={result.fireNumber} maximumFractionDigits={0} /> (horizontal goal)
                        </p>
                    </div>

                    {/* Coast FIRE */}
                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                        <p className="text-sm font-medium text-purple-800 dark:text-purple-300 mb-1">
                            Coast FIRE Value
                        </p>
                        <p className="text-xl font-bold text-purple-600">
                            <PriceDisplay amount={result.coastFIRE} maximumFractionDigits={0} />
                        </p>
                        <p className="text-xs text-purple-600 mt-1">
                            If you stop saving, your current savings would grow to this amount
                        </p>
                    </div>

                    {!result.onTrack && (
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                            <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                                💡 To reach FIRE by age {retireAge}:
                            </p>
                            <p className="text-sm text-blue-700 dark:text-blue-400">
                                Save <PriceDisplay amount={result.requiredMonthlySavings} maximumFractionDigits={0} />/month
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
                            Current Age
                        </label>
                        <input
                            type="number"
                            value={currentAge}
                            onChange={(e) => setCurrentAge(Number(e.target.value))}
                            min={18}
                            max={retireAge - 1}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Target Retire Age
                        </label>
                        <input
                            type="number"
                            value={retireAge}
                            onChange={(e) => setRetireAge(Number(e.target.value))}
                            min={currentAge + 1}
                            max={80}
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
                            step={10000}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Annual Income ($)
                        </label>
                        <input
                            type="number"
                            value={annualIncome}
                            onChange={(e) => setAnnualIncome(Number(e.target.value))}
                            step={10000}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Savings Rate: {savingsRate}%
                    </label>
                    <input
                        type="range"
                        min={10}
                        max={90}
                        value={savingsRate}
                        onChange={(e) => setSavingsRate(Number(e.target.value))}
                        className="w-full accent-emerald-500"
                    />
                    <div className="flex justify-between text-xs text-slate-400 mt-1">
                        <span>10%</span>
                        <span>Annual: <PriceDisplay amount={annualIncome * savingsRate / 100} maximumFractionDigits={0} /></span>
                        <span>90%</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Safe Withdrawal Rate: {withdrawalRate}%
                        </label>
                        <input
                            type="range"
                            min={2}
                            max={6}
                            step={0.5}
                            value={withdrawalRate}
                            onChange={(e) => setWithdrawalRate(Number(e.target.value))}
                            className="w-full accent-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Expected Return: {expectedReturn}%
                        </label>
                        <input
                            type="range"
                            min={4}
                            max={12}
                            step={0.5}
                            value={expectedReturn}
                            onChange={(e) => setExpectedReturn(Number(e.target.value))}
                            className="w-full accent-purple-500"
                        />
                    </div>
                </div>
            </div>
        </CalculatorLayout>
    );
}
