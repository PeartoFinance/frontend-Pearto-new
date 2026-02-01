'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import PriceDisplay from '@/components/common/PriceDisplay';
import { Wallet, TrendingUp, Calendar, Clock, PiggyBank } from 'lucide-react';
import {
    createChart,
    ColorType,
    AreaSeries,
    LineSeries,
    type IChartApi,
} from 'lightweight-charts';

export default function PensionCalculator() {
    const [currentAge, setCurrentAge] = useState(35);
    const [retirementAge, setRetirementAge] = useState(65);
    const [currentSalary, setCurrentSalary] = useState(75000);
    const [employeeContribution, setEmployeeContribution] = useState(6);
    const [employerMatch, setEmployerMatch] = useState(3);
    const [currentBalance, setCurrentBalance] = useState(50000);
    const [expectedReturn, setExpectedReturn] = useState(7);
    const [salaryGrowth, setSalaryGrowth] = useState(3);
    const [withdrawalRate, setWithdrawalRate] = useState(4);

    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const [isDark, setIsDark] = useState(false);

    const result = useMemo(() => {
        const yearsToRetirement = retirementAge - currentAge;
        const expectedLifespan = 90; // Assume planning to age 90
        const retirementYears = expectedLifespan - retirementAge;

        let balance = currentBalance;
        let salary = currentSalary;
        const projections = [];

        const startDate = new Date();

        // Accumulation phase
        for (let year = 0; year <= yearsToRetirement; year++) {
            const date = new Date(startDate);
            date.setFullYear(date.getFullYear() + year);

            projections.push({
                time: date.toISOString().split('T')[0],
                value: balance
            });

            const annualContribution = salary * (employeeContribution / 100) +
                salary * (employerMatch / 100);
            balance = (balance + annualContribution) * (1 + expectedReturn / 100);
            salary = salary * (1 + salaryGrowth / 100);
        }

        const balanceAtRetirement = projections[projections.length - 1]?.value || 0;

        // Distribution phase
        const annualWithdrawal = balanceAtRetirement * (withdrawalRate / 100);
        const monthlyIncome = annualWithdrawal / 12;

        let retirementBalance = balanceAtRetirement;
        const retirementData = [];

        for (let year = 0; year <= retirementYears; year++) {
            const date = new Date(startDate);
            date.setFullYear(date.getFullYear() + yearsToRetirement + year);

            retirementData.push({
                time: date.toISOString().split('T')[0],
                value: Math.max(0, retirementBalance)
            });

            // Withdraw and apply conservative return in retirement
            retirementBalance = (retirementBalance - annualWithdrawal) * (1 + 4 / 100);
        }

        // Calculate total contributions
        let totalContributions = currentBalance;
        salary = currentSalary;
        for (let year = 0; year < yearsToRetirement; year++) {
            totalContributions += salary * (employeeContribution / 100) +
                salary * (employerMatch / 100);
            salary = salary * (1 + salaryGrowth / 100);
        }

        const investmentGrowth = balanceAtRetirement - totalContributions;
        const lastPositiveYear = retirementData.findIndex(d => d.value <= 0);
        const moneyLastsYears = lastPositiveYear > 0 ? lastPositiveYear : retirementYears;

        return {
            balanceAtRetirement,
            monthlyIncome,
            annualWithdrawal,
            totalContributions,
            investmentGrowth,
            yearsToRetirement,
            moneyLastsYears,
            projections,
            retirementData
        };
    }, [currentAge, retirementAge, currentSalary, employeeContribution, employerMatch,
        currentBalance, expectedReturn, salaryGrowth, withdrawalRate]);

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

        // Accumulation
        const accumulationSeries = chart.addSeries(AreaSeries, {
            lineColor: '#10b981',
            topColor: 'rgba(16, 185, 129, 0.3)',
            bottomColor: 'rgba(16, 185, 129, 0.02)',
            lineWidth: 2,
        });

        // Distribution
        const distributionSeries = chart.addSeries(LineSeries, {
            color: '#f59e0b',
            lineWidth: 2,
            lineStyle: 2,
        });

        accumulationSeries.setData(result.projections as any);
        distributionSeries.setData(result.retirementData as any);

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
            title="Pension Calculator"
            description="Project your retirement savings and income"
            category="Retirement"
            results={
                <div className="space-y-4">
                    {/* Balance at Retirement */}
                    <div className="text-center p-6 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                        <Wallet className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                        <p className="text-sm text-slate-500">Balance at Retirement (Age {retirementAge})</p>
                        <p className="text-4xl font-bold text-emerald-600">
                            <PriceDisplay amount={result.balanceAtRetirement} maximumFractionDigits={0} />
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl text-center">
                            <p className="text-xs text-slate-500 mb-1">Monthly Income</p>
                            <p className="text-xl font-bold text-blue-600">
                                <PriceDisplay amount={result.monthlyIncome} maximumFractionDigits={0} />
                            </p>
                            <p className="text-xs text-slate-400">at {withdrawalRate}% withdrawal</p>
                        </div>
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl text-center">
                            <p className="text-xs text-slate-500 mb-1">Money Lasts</p>
                            <p className="text-xl font-bold text-amber-600">{result.moneyLastsYears}+ years</p>
                            <p className="text-xs text-slate-400">through age {retirementAge + result.moneyLastsYears}</p>
                        </div>
                    </div>

                    {/* Projections Chart */}
                    <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Accumulation & Distribution
                        </p>
                        <div className="flex gap-4 text-xs mb-2">
                            <span className="flex items-center gap-1">
                                <span className="w-3 h-0.5 bg-emerald-500"></span>
                                Savings Phase
                            </span>
                            <span className="flex items-center gap-1">
                                <span className="w-3 h-0.5 bg-amber-500"></span>
                                Retirement
                            </span>
                        </div>
                        <div ref={chartContainerRef} className="w-full" style={{ height: 200 }} />
                    </div>

                    {/* Breakdown */}
                    <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                            Growth Breakdown
                        </p>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-slate-500">Your Contributions</span>
                                <span className="font-medium">
                                    <PriceDisplay amount={result.totalContributions * (employeeContribution / (employeeContribution + employerMatch))} maximumFractionDigits={0} />
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Employer Match</span>
                                <span className="font-medium">
                                    <PriceDisplay amount={result.totalContributions * (employerMatch / (employeeContribution + employerMatch))} maximumFractionDigits={0} />
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Investment Growth</span>
                                <span className="font-medium text-emerald-600">
                                    <PriceDisplay amount={result.investmentGrowth} maximumFractionDigits={0} />
                                </span>
                            </div>
                        </div>
                    </div>
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
                            min={20}
                            max={retirementAge - 1}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Retirement Age
                        </label>
                        <input
                            type="number"
                            value={retirementAge}
                            onChange={(e) => setRetirementAge(Number(e.target.value))}
                            min={currentAge + 1}
                            max={75}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Current Salary ($)
                        </label>
                        <input
                            type="number"
                            value={currentSalary}
                            onChange={(e) => setCurrentSalary(Number(e.target.value))}
                            step={5000}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Current Balance ($)
                        </label>
                        <input
                            type="number"
                            value={currentBalance}
                            onChange={(e) => setCurrentBalance(Number(e.target.value))}
                            step={10000}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Your Contribution: {employeeContribution}%
                        </label>
                        <input
                            type="range"
                            min={0}
                            max={20}
                            value={employeeContribution}
                            onChange={(e) => setEmployeeContribution(Number(e.target.value))}
                            className="w-full accent-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Employer Match: {employerMatch}%
                        </label>
                        <input
                            type="range"
                            min={0}
                            max={10}
                            value={employerMatch}
                            onChange={(e) => setEmployerMatch(Number(e.target.value))}
                            className="w-full accent-emerald-500"
                        />
                    </div>
                </div>

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
                        className="w-full accent-purple-500"
                    />
                </div>
            </div>
        </CalculatorLayout>
    );
}
