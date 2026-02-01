'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import PriceDisplay from '@/components/common/PriceDisplay';
import { Coins, TrendingUp, Clock, DollarSign, Percent } from 'lucide-react';
import {
    createChart,
    ColorType,
    LineSeries,
    type IChartApi,
} from 'lightweight-charts';

type LoanType = 'amortizing' | 'interest_only' | 'balloon';

export default function LoanAmortizationCalculator() {
    const [principal, setPrincipal] = useState(200000);
    const [interestRate, setInterestRate] = useState(6.5);
    const [loanTerm, setLoanTerm] = useState(30);
    const [loanType, setLoanType] = useState<LoanType>('amortizing');
    const [extraPayment, setExtraPayment] = useState(0);

    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const [isDark, setIsDark] = useState(false);

    const result = useMemo(() => {
        const monthlyRate = interestRate / 100 / 12;
        const totalMonths = loanTerm * 12;

        let monthlyPayment: number;
        if (loanType === 'interest_only') {
            monthlyPayment = principal * monthlyRate;
        } else {
            monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
                (Math.pow(1 + monthlyRate, totalMonths) - 1);
        }

        let balance = principal;
        let totalInterest = 0;
        let totalPaid = 0;
        let month = 0;

        const balanceData: { time: string; value: number }[] = [];
        const schedule: { month: number; payment: number; principal: number; interest: number; balance: number }[] = [];

        const startDate = new Date();

        while (balance > 0.01 && month < totalMonths + 120) { // Cap at extra 10 years for safety
            month++;
            const interestPayment = balance * monthlyRate;
            let principalPayment: number;
            let payment = monthlyPayment + extraPayment;

            if (loanType === 'interest_only') {
                principalPayment = loanType === 'interest_only' && month < totalMonths
                    ? Math.min(extraPayment, balance)
                    : Math.min(payment, balance + interestPayment);
                payment = interestPayment + principalPayment;
            } else {
                principalPayment = Math.min(payment - interestPayment, balance);
                payment = interestPayment + principalPayment;
            }

            balance -= principalPayment;
            totalInterest += interestPayment;
            totalPaid += payment;

            if (month % 12 === 0 || month === 1) { // Sample yearly for chart
                const date = new Date(startDate);
                date.setMonth(date.getMonth() + month);
                balanceData.push({
                    time: date.toISOString().split('T')[0],
                    value: Math.max(0, balance)
                });
            }

            schedule.push({
                month,
                payment,
                principal: principalPayment,
                interest: interestPayment,
                balance: Math.max(0, balance)
            });

            if (balance <= 0.01) break;
        }

        const payoffMonths = month;
        const payoffYears = Math.floor(payoffMonths / 12);
        const payoffRemainingMonths = payoffMonths % 12;
        const interestSaved = extraPayment > 0
            ? (principal * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
                (Math.pow(1 + monthlyRate, totalMonths) - 1) * totalMonths) - totalPaid
            : 0;

        return {
            monthlyPayment: monthlyPayment + extraPayment,
            basePayment: monthlyPayment,
            totalInterest,
            totalPaid,
            payoffMonths,
            payoffYears,
            payoffRemainingMonths,
            interestSaved: Math.max(0, interestSaved),
            balanceData,
            schedule: schedule.slice(0, 12) // First year summary
        };
    }, [principal, interestRate, loanTerm, loanType, extraPayment]);

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

        const series = chart.addSeries(LineSeries, {
            color: '#ef4444',
            lineWidth: 2,
        });

        series.setData(result.balanceData as any);
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
            title="Loan Amortization Calculator"
            description="See your loan payoff schedule and interest breakdown"
            category="Finance"
            results={
                <div className="space-y-4">
                    {/* Monthly Payment */}
                    <div className="text-center p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                        <Coins className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                        <p className="text-sm text-slate-500">Monthly Payment</p>
                        <p className="text-4xl font-bold text-blue-600">
                            <PriceDisplay amount={result.monthlyPayment} maximumFractionDigits={0} />
                        </p>
                        {extraPayment > 0 && (
                            <p className="text-xs text-slate-500 mt-1">
                                (Base: <PriceDisplay amount={result.basePayment} maximumFractionDigits={0} /> + Extra: <PriceDisplay amount={extraPayment} maximumFractionDigits={0} />)
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl text-center">
                            <p className="text-xs text-slate-500 mb-1">Total Interest</p>
                            <p className="text-xl font-bold text-red-500">
                                <PriceDisplay amount={result.totalInterest} maximumFractionDigits={0} />
                            </p>
                        </div>
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl text-center">
                            <p className="text-xs text-slate-500 mb-1">Total Paid</p>
                            <p className="text-xl font-bold text-slate-700 dark:text-slate-300">
                                <PriceDisplay amount={result.totalPaid} maximumFractionDigits={0} />
                            </p>
                        </div>
                    </div>

                    {/* Payoff Timeline */}
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl text-center">
                        <Clock className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
                        <p className="text-sm text-slate-500">Loan Payoff</p>
                        <p className="text-xl font-bold text-emerald-600">
                            {result.payoffYears} years {result.payoffRemainingMonths > 0 ? `${result.payoffRemainingMonths} months` : ''}
                        </p>
                        {extraPayment > 0 && result.interestSaved > 0 && (
                            <p className="text-xs text-emerald-600 mt-1">
                                Save <PriceDisplay amount={result.interestSaved} maximumFractionDigits={0} /> in interest!
                            </p>
                        )}
                    </div>

                    {/* Balance Over Time Chart */}
                    <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                            Remaining Balance Over Time
                        </p>
                        <div ref={chartContainerRef} className="w-full" style={{ height: 180 }} />
                    </div>

                    {/* First Year Schedule */}
                    <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                            First Year Summary
                        </p>
                        <div className="grid grid-cols-3 gap-2 text-xs text-center">
                            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                                <p className="text-slate-500">Principal Paid</p>
                                <p className="font-bold text-blue-600">
                                    <PriceDisplay amount={result.schedule.reduce((sum, s) => sum + s.principal, 0)} maximumFractionDigits={0} />
                                </p>
                            </div>
                            <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded">
                                <p className="text-slate-500">Interest Paid</p>
                                <p className="font-bold text-red-500">
                                    <PriceDisplay amount={result.schedule.reduce((sum, s) => sum + s.interest, 0)} maximumFractionDigits={0} />
                                </p>
                            </div>
                            <div className="p-2 bg-slate-50 dark:bg-slate-700 rounded">
                                <p className="text-slate-500">Balance After</p>
                                <p className="font-bold text-slate-700 dark:text-slate-300">
                                    <PriceDisplay amount={result.schedule[result.schedule.length - 1]?.balance || 0} maximumFractionDigits={0} />
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
                        Loan Amount ($)
                    </label>
                    <input
                        type="number"
                        value={principal}
                        onChange={(e) => setPrincipal(Number(e.target.value))}
                        step={10000}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Interest Rate: {interestRate}%
                        </label>
                        <input
                            type="range"
                            min={1}
                            max={15}
                            step={0.25}
                            value={interestRate}
                            onChange={(e) => setInterestRate(Number(e.target.value))}
                            className="w-full accent-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Loan Term (Years)
                        </label>
                        <select
                            value={loanTerm}
                            onChange={(e) => setLoanTerm(Number(e.target.value))}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        >
                            <option value={10}>10 years</option>
                            <option value={15}>15 years</option>
                            <option value={20}>20 years</option>
                            <option value={30}>30 years</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Loan Type
                    </label>
                    <select
                        value={loanType}
                        onChange={(e) => setLoanType(e.target.value as LoanType)}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                    >
                        <option value="amortizing">Fully Amortizing</option>
                        <option value="interest_only">Interest Only</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Extra Monthly Payment: <PriceDisplay amount={extraPayment} maximumFractionDigits={0} />
                    </label>
                    <input
                        type="range"
                        min={0}
                        max={2000}
                        step={50}
                        value={extraPayment}
                        onChange={(e) => setExtraPayment(Number(e.target.value))}
                        className="w-full accent-emerald-500"
                    />
                    <p className="text-xs text-slate-400 mt-1">
                        Extra payments reduce total interest and payoff time
                    </p>
                </div>
            </div>
        </CalculatorLayout>
    );
}
