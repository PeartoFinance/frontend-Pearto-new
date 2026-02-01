'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import PriceDisplay from '@/components/common/PriceDisplay';
import { DollarSign, Percent, TrendingUp, Users } from 'lucide-react';
import {
    createChart,
    ColorType,
    AreaSeries,
    type IChartApi,
} from 'lightweight-charts';

export default function DCACalculator() {
    const [investmentAmount, setInvestmentAmount] = useState(1000);
    const [frequency, setFrequency] = useState<'weekly' | 'monthly'>('monthly');
    const [duration, setDuration] = useState(12);
    const [expectedReturn, setExpectedReturn] = useState(10);
    const [volatility, setVolatility] = useState(20);

    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const [isDark, setIsDark] = useState(false);

    const result = useMemo(() => {
        const periods = frequency === 'monthly' ? duration : duration * 4;
        const periodReturn = frequency === 'monthly'
            ? expectedReturn / 100 / 12
            : expectedReturn / 100 / 52;
        const periodVolatility = frequency === 'monthly'
            ? volatility / 100 / Math.sqrt(12)
            : volatility / 100 / Math.sqrt(52);

        // Simulate DCA vs Lump Sum
        let dcaBalance = 0;
        let lumpSumBalance = investmentAmount * periods;
        const totalInvested = investmentAmount * periods;

        const dcaData = [];
        const lumpSumData = [];
        const investedData = [];

        let currentLumpSum = lumpSumBalance;
        const startDate = new Date();

        for (let i = 0; i < periods; i++) {
            // Random return with volatility
            const randomReturn = periodReturn + (Math.random() - 0.5) * 2 * periodVolatility;

            // DCA: add investment and apply return
            dcaBalance = (dcaBalance + investmentAmount) * (1 + randomReturn);

            // Lump Sum: just apply return
            currentLumpSum = currentLumpSum * (1 + randomReturn);

            const date = new Date(startDate);
            if (frequency === 'monthly') {
                date.setMonth(date.getMonth() + i);
            } else {
                date.setDate(date.getDate() + i * 7);
            }

            dcaData.push({
                time: date.toISOString().split('T')[0],
                value: dcaBalance
            });

            lumpSumData.push({
                time: date.toISOString().split('T')[0],
                value: currentLumpSum
            });

            investedData.push({
                time: date.toISOString().split('T')[0],
                value: investmentAmount * (i + 1)
            });
        }

        const dcaProfit = dcaBalance - totalInvested;
        const dcaReturn = (dcaProfit / totalInvested) * 100;
        const lumpSumProfit = currentLumpSum - totalInvested;
        const lumpSumReturn = (lumpSumProfit / totalInvested) * 100;

        return {
            totalInvested,
            dcaBalance,
            dcaProfit,
            dcaReturn,
            lumpSumBalance: currentLumpSum,
            lumpSumProfit,
            lumpSumReturn,
            dcaData,
            investedData,
            periods
        };
    }, [investmentAmount, frequency, duration, expectedReturn, volatility]);

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

        // DCA Balance
        const dcaSeries = chart.addSeries(AreaSeries, {
            lineColor: '#10b981',
            topColor: 'rgba(16, 185, 129, 0.3)',
            bottomColor: 'rgba(16, 185, 129, 0.02)',
            lineWidth: 2,
            title: 'DCA Balance',
        });

        // Invested amount
        const investedSeries = chart.addSeries(AreaSeries, {
            lineColor: '#6b7280',
            topColor: 'rgba(107, 114, 128, 0.1)',
            bottomColor: 'rgba(107, 114, 128, 0.02)',
            lineWidth: 1,
            title: 'Invested',
        });

        dcaSeries.setData(result.dcaData as any);
        investedSeries.setData(result.investedData as any);

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
            title="DCA Calculator"
            description="Calculate dollar-cost averaging returns"
            category="Investing"
            results={
                <div className="space-y-4">
                    {/* Final Balance */}
                    <div className="text-center p-6 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                        <TrendingUp className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                        <p className="text-sm text-slate-500">DCA Final Balance</p>
                        <p className="text-4xl font-bold text-emerald-600">
                            <PriceDisplay amount={result.dcaBalance} maximumFractionDigits={0} />
                        </p>
                        <p className="text-sm mt-1">
                            <span className={result.dcaProfit >= 0 ? 'text-emerald-600' : 'text-red-500'}>
                                {result.dcaProfit >= 0 ? '+' : ''}
                                <PriceDisplay amount={result.dcaProfit} maximumFractionDigits={0} /> ({result.dcaReturn.toFixed(1)}%)
                            </span>
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl text-center">
                            <p className="text-xs text-slate-500 mb-1">Total Invested</p>
                            <p className="text-xl font-bold text-slate-700 dark:text-slate-300">
                                <PriceDisplay amount={result.totalInvested} maximumFractionDigits={0} />
                            </p>
                        </div>
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl text-center">
                            <p className="text-xs text-slate-500 mb-1">Investments Made</p>
                            <p className="text-xl font-bold text-blue-600">{result.periods}</p>
                        </div>
                    </div>

                    {/* DCA Growth Chart */}
                    <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                DCA Growth Over Time
                            </p>
                        </div>
                        <div className="flex gap-4 text-xs mb-2">
                            <span className="flex items-center gap-1">
                                <span className="w-3 h-0.5 bg-emerald-500"></span>
                                Balance
                            </span>
                            <span className="flex items-center gap-1">
                                <span className="w-3 h-0.5 bg-slate-400"></span>
                                Invested
                            </span>
                        </div>
                        <div ref={chartContainerRef} className="w-full" style={{ height: 220 }} />
                    </div>

                    {/* DCA Benefits */}
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                        <p className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">DCA Benefits</p>
                        <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-1">
                            <li>• Reduces impact of market volatility</li>
                            <li>• Removes emotional timing decisions</li>
                            <li>• Builds consistent investment habit</li>
                        </ul>
                    </div>
                </div>
            }
        >
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Investment per Period ($)
                    </label>
                    <input
                        type="number"
                        value={investmentAmount}
                        onChange={(e) => setInvestmentAmount(Number(e.target.value))}
                        step={100}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Frequency
                        </label>
                        <select
                            value={frequency}
                            onChange={(e) => setFrequency(e.target.value as typeof frequency)}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        >
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Duration (months)
                        </label>
                        <input
                            type="number"
                            value={duration}
                            onChange={(e) => setDuration(Number(e.target.value))}
                            min={1}
                            max={120}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Expected Annual Return: {expectedReturn}%
                    </label>
                    <input
                        type="range"
                        min={-10}
                        max={30}
                        value={expectedReturn}
                        onChange={(e) => setExpectedReturn(Number(e.target.value))}
                        className="w-full accent-emerald-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Market Volatility: {volatility}%
                    </label>
                    <input
                        type="range"
                        min={5}
                        max={50}
                        value={volatility}
                        onChange={(e) => setVolatility(Number(e.target.value))}
                        className="w-full accent-amber-500"
                    />
                    <div className="flex justify-between text-xs text-slate-400 mt-1">
                        <span>Low Risk</span>
                        <span>High Risk</span>
                    </div>
                </div>
            </div>
        </CalculatorLayout>
    );
}
