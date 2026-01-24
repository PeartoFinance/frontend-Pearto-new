'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import { TrendingUp, PieChart, DollarSign, Percent } from 'lucide-react';
import {
    createChart,
    ColorType,
    LineSeries,
    type IChartApi,
} from 'lightweight-charts';

type RebalanceFrequency = 'monthly' | 'quarterly' | 'annually' | 'never';

export default function PortfolioRebalancer() {
    const [portfolioValue, setPortfolioValue] = useState(100000);
    const [stockTarget, setStockTarget] = useState(60);
    const [bondTarget, setBondTarget] = useState(30);
    const [cashTarget, setCashTarget] = useState(10);
    const [rebalanceFrequency, setRebalanceFrequency] = useState<RebalanceFrequency>('quarterly');
    const [years, setYears] = useState(10);

    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const [isDark, setIsDark] = useState(false);

    // Expected returns
    const returns = { stocks: 10, bonds: 5, cash: 2 };
    const volatility = { stocks: 20, bonds: 6, cash: 0.5 };

    const result = useMemo(() => {
        const monthlyReturns = {
            stocks: returns.stocks / 100 / 12,
            bonds: returns.bonds / 100 / 12,
            cash: returns.cash / 100 / 12
        };
        const monthlyVol = {
            stocks: volatility.stocks / 100 / Math.sqrt(12),
            bonds: volatility.bonds / 100 / Math.sqrt(12),
            cash: volatility.cash / 100 / Math.sqrt(12)
        };

        const rebalancePeriods = {
            monthly: 1,
            quarterly: 3,
            annually: 12,
            never: Infinity
        };

        // Simulate portfolio with and without rebalancing
        let rebalancedValue = portfolioValue;
        let noRebalanceValue = portfolioValue;

        let stocksRB = portfolioValue * (stockTarget / 100);
        let bondsRB = portfolioValue * (bondTarget / 100);
        let cashRB = portfolioValue * (cashTarget / 100);

        let stocksNR = stocksRB;
        let bondsNR = bondsRB;
        let cashNR = cashRB;

        const rebalancedData = [];
        const noRebalanceData = [];
        const startDate = new Date();

        const totalMonths = years * 12;
        const rebalancePeriod = rebalancePeriods[rebalanceFrequency];

        for (let month = 0; month <= totalMonths; month++) {
            // Random returns
            const stockReturn = 1 + monthlyReturns.stocks + (Math.random() - 0.5) * 2 * monthlyVol.stocks;
            const bondReturn = 1 + monthlyReturns.bonds + (Math.random() - 0.5) * 2 * monthlyVol.bonds;
            const cashReturn = 1 + monthlyReturns.cash + (Math.random() - 0.5) * 2 * monthlyVol.cash;

            // Apply returns
            stocksRB *= stockReturn;
            bondsRB *= bondReturn;
            cashRB *= cashReturn;

            stocksNR *= stockReturn;
            bondsNR *= bondReturn;
            cashNR *= cashReturn;

            // Rebalance if needed
            if (month > 0 && month % rebalancePeriod === 0) {
                const totalRB = stocksRB + bondsRB + cashRB;
                stocksRB = totalRB * (stockTarget / 100);
                bondsRB = totalRB * (bondTarget / 100);
                cashRB = totalRB * (cashTarget / 100);
            }

            rebalancedValue = stocksRB + bondsRB + cashRB;
            noRebalanceValue = stocksNR + bondsNR + cashNR;

            const date = new Date(startDate);
            date.setMonth(date.getMonth() + month);

            if (month % 3 === 0) { // Sample every quarter for performance
                rebalancedData.push({
                    time: date.toISOString().split('T')[0],
                    value: rebalancedValue
                });

                noRebalanceData.push({
                    time: date.toISOString().split('T')[0],
                    value: noRebalanceValue
                });
            }
        }

        // Final allocations
        const finalStocksPct = (stocksNR / noRebalanceValue) * 100;
        const finalBondsPct = (bondsNR / noRebalanceValue) * 100;
        const finalCashPct = (cashNR / noRebalanceValue) * 100;

        const rebalanceProfit = rebalancedValue - portfolioValue;
        const noRebalanceProfit = noRebalanceValue - portfolioValue;
        const rebalanceBenefit = rebalancedValue - noRebalanceValue;

        return {
            rebalancedValue,
            noRebalanceValue,
            rebalanceProfit,
            noRebalanceProfit,
            rebalanceBenefit,
            rebalancedData,
            noRebalanceData,
            driftedAllocation: {
                stocks: finalStocksPct,
                bonds: finalBondsPct,
                cash: finalCashPct
            }
        };
    }, [portfolioValue, stockTarget, bondTarget, cashTarget, rebalanceFrequency, years]);

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

        const rebalancedSeries = chart.addSeries(LineSeries, {
            color: '#10b981',
            lineWidth: 2,
        });

        const noRebalanceSeries = chart.addSeries(LineSeries, {
            color: '#f59e0b',
            lineWidth: 2,
            lineStyle: 2,
        });

        rebalancedSeries.setData(result.rebalancedData as any);
        noRebalanceSeries.setData(result.noRebalanceData as any);

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
            title="Portfolio Rebalancer"
            description="See how rebalancing affects long-term returns"
            category="Portfolio Analysis"
            results={
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl text-center">
                            <p className="text-xs text-slate-500 mb-1">With Rebalancing</p>
                            <p className="text-2xl font-bold text-emerald-600">{formatCurrency(result.rebalancedValue)}</p>
                            <p className="text-xs text-emerald-600">+{formatCurrency(result.rebalanceProfit)}</p>
                        </div>
                        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl text-center">
                            <p className="text-xs text-slate-500 mb-1">Without Rebalancing</p>
                            <p className="text-2xl font-bold text-amber-600">{formatCurrency(result.noRebalanceValue)}</p>
                            <p className="text-xs text-amber-600">+{formatCurrency(result.noRebalanceProfit)}</p>
                        </div>
                    </div>

                    {/* Benefit calculation */}
                    <div className={`p-4 rounded-xl text-center ${result.rebalanceBenefit > 0 ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                        <p className="text-sm text-slate-500">Rebalancing {result.rebalanceBenefit > 0 ? 'Benefit' : 'Cost'}</p>
                        <p className={`text-3xl font-bold ${result.rebalanceBenefit > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                            {result.rebalanceBenefit > 0 ? '+' : ''}{formatCurrency(result.rebalanceBenefit)}
                        </p>
                    </div>

                    {/* Chart */}
                    <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                            Portfolio Growth Comparison
                        </p>
                        <div className="flex gap-4 text-xs mb-2">
                            <span className="flex items-center gap-1">
                                <span className="w-3 h-0.5 bg-emerald-500"></span>
                                Rebalanced
                            </span>
                            <span className="flex items-center gap-1">
                                <span className="w-3 h-0.5 bg-amber-500"></span>
                                No Rebalance
                            </span>
                        </div>
                        <div ref={chartContainerRef} className="w-full" style={{ height: 200 }} />
                    </div>

                    {/* Drift Warning */}
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Allocation Drift (No Rebalance)
                        </p>
                        <div className="space-y-2 text-xs">
                            <div className="flex justify-between items-center">
                                <span>Stocks: {stockTarget}% → {result.driftedAllocation.stocks.toFixed(1)}%</span>
                                <span className={Math.abs(result.driftedAllocation.stocks - stockTarget) > 5 ? 'text-red-500' : 'text-emerald-600'}>
                                    {result.driftedAllocation.stocks > stockTarget ? '+' : ''}{(result.driftedAllocation.stocks - stockTarget).toFixed(1)}%
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span>Bonds: {bondTarget}% → {result.driftedAllocation.bonds.toFixed(1)}%</span>
                                <span className={Math.abs(result.driftedAllocation.bonds - bondTarget) > 5 ? 'text-red-500' : 'text-emerald-600'}>
                                    {result.driftedAllocation.bonds > bondTarget ? '+' : ''}{(result.driftedAllocation.bonds - bondTarget).toFixed(1)}%
                                </span>
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
                        Target Allocation
                    </label>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
                            <p className="font-medium text-blue-600">Stocks</p>
                            <input
                                type="number"
                                value={stockTarget}
                                onChange={(e) => setStockTarget(Number(e.target.value))}
                                className="w-full text-center mt-1 px-2 py-1 rounded border border-blue-200"
                            />
                        </div>
                        <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg text-center">
                            <p className="font-medium text-emerald-600">Bonds</p>
                            <input
                                type="number"
                                value={bondTarget}
                                onChange={(e) => setBondTarget(Number(e.target.value))}
                                className="w-full text-center mt-1 px-2 py-1 rounded border border-emerald-200"
                            />
                        </div>
                        <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-center">
                            <p className="font-medium text-amber-600">Cash</p>
                            <input
                                type="number"
                                value={cashTarget}
                                onChange={(e) => setCashTarget(Number(e.target.value))}
                                className="w-full text-center mt-1 px-2 py-1 rounded border border-amber-200"
                            />
                        </div>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 text-center">
                        Total: {stockTarget + bondTarget + cashTarget}%
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Rebalance Frequency
                        </label>
                        <select
                            value={rebalanceFrequency}
                            onChange={(e) => setRebalanceFrequency(e.target.value as RebalanceFrequency)}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        >
                            <option value="monthly">Monthly</option>
                            <option value="quarterly">Quarterly</option>
                            <option value="annually">Annually</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Time Horizon (years)
                        </label>
                        <input
                            type="number"
                            value={years}
                            onChange={(e) => setYears(Number(e.target.value))}
                            min={1}
                            max={40}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        />
                    </div>
                </div>
            </div>
        </CalculatorLayout>
    );
}
