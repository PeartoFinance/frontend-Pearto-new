'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import { TrendingUp, TrendingDown, DollarSign, Percent, AlertTriangle } from 'lucide-react';
import { useCurrency } from '@/contexts/CurrencyContext';
import {
    createChart,
    ColorType,
    LineSeries,
    AreaSeries,
    type IChartApi,
} from 'lightweight-charts';

type OptionType = 'call' | 'put';
type Strategy = 'long' | 'short';

export default function OptionsProfitCalculator() {
    const [optionType, setOptionType] = useState<OptionType>('call');
    const [strategy, setStrategy] = useState<Strategy>('long');
    const [stockPrice, setStockPrice] = useState(100);
    const [strikePrice, setStrikePrice] = useState(105);
    const [premium, setPremium] = useState(3);
    const [contracts, setContracts] = useState(1);
    const [expirationDays, setExpirationDays] = useState(30);

    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const [isDark, setIsDark] = useState(false);

    const result = useMemo(() => {
        const contractMultiplier = 100; // Standard 100 shares per contract
        const totalPremium = premium * contracts * contractMultiplier;

        // Calculate profit at different price levels
        const priceRange = [];
        const minPrice = stockPrice * 0.7;
        const maxPrice = stockPrice * 1.3;
        const step = (maxPrice - minPrice) / 50;

        for (let price = minPrice; price <= maxPrice; price += step) {
            let profit = 0;

            if (optionType === 'call') {
                if (strategy === 'long') {
                    // Long Call: Max loss = premium, unlimited profit potential
                    profit = Math.max(0, (price - strikePrice)) * contracts * contractMultiplier - totalPremium;
                } else {
                    // Short Call: Max profit = premium, unlimited loss potential
                    profit = totalPremium - Math.max(0, (price - strikePrice)) * contracts * contractMultiplier;
                }
            } else {
                if (strategy === 'long') {
                    // Long Put: Max loss = premium, max profit = strike - 0
                    profit = Math.max(0, (strikePrice - price)) * contracts * contractMultiplier - totalPremium;
                } else {
                    // Short Put: Max profit = premium, max loss = strike * 100
                    profit = totalPremium - Math.max(0, (strikePrice - price)) * contracts * contractMultiplier;
                }
            }

            priceRange.push({
                price,
                profit,
                color: profit >= 0 ? '#10b981' : '#ef4444'
            });
        }

        // Calculate breakeven
        let breakeven: number;
        if (optionType === 'call') {
            breakeven = strikePrice + (strategy === 'long' ? premium : -premium);
        } else {
            breakeven = strikePrice - (strategy === 'long' ? premium : -premium);
        }

        // Max profit and loss
        let maxProfit: number | string;
        let maxLoss: number | string;

        if (optionType === 'call') {
            if (strategy === 'long') {
                maxProfit = 'Unlimited';
                maxLoss = totalPremium;
            } else {
                maxProfit = totalPremium;
                maxLoss = 'Unlimited';
            }
        } else {
            if (strategy === 'long') {
                maxProfit = (strikePrice - premium) * contracts * contractMultiplier;
                maxLoss = totalPremium;
            } else {
                maxProfit = totalPremium;
                maxLoss = (strikePrice - premium) * contracts * contractMultiplier;
            }
        }

        // Current profit (if exercised now)
        let currentProfit = 0;
        if (optionType === 'call') {
            currentProfit = Math.max(0, stockPrice - strikePrice) * contracts * contractMultiplier -
                (strategy === 'long' ? totalPremium : -totalPremium);
        } else {
            currentProfit = Math.max(0, strikePrice - stockPrice) * contracts * contractMultiplier -
                (strategy === 'long' ? totalPremium : -totalPremium);
        }

        // Create chart data
        const chartData = priceRange.map((point, i) => ({
            time: `2024-01-${String(i + 1).padStart(2, '0')}`,
            value: point.profit
        }));

        return {
            priceRange,
            breakeven,
            maxProfit,
            maxLoss,
            currentProfit,
            totalPremium,
            chartData,
            isITM: optionType === 'call' ? stockPrice > strikePrice : stockPrice < strikePrice
        };
    }, [optionType, strategy, stockPrice, strikePrice, premium, contracts]);

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
            timeScale: {
                borderColor: isDark ? '#334155' : '#e2e8f0',
                visible: false
            },
        });

        chartRef.current = chart;

        const series = chart.addSeries(AreaSeries, {
            lineColor: result.currentProfit >= 0 ? '#10b981' : '#ef4444',
            topColor: result.currentProfit >= 0 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)',
            bottomColor: result.currentProfit >= 0 ? 'rgba(16, 185, 129, 0.02)' : 'rgba(239, 68, 68, 0.02)',
            lineWidth: 2,
        });

        series.setData(result.chartData as any);
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

    const { formatPrice: currFormatPrice } = useCurrency();

    const formatCurrency = (value: number | string) =>
        typeof value === 'number'
            ? currFormatPrice(value)
            : value;

    return (
        <CalculatorLayout
            title="Options Profit Calculator"
            description="Calculate potential profit/loss for options trades"
            category="Trading"
            results={
                <div className="space-y-4">
                    {/* Current P/L */}
                    <div className={`text-center p-6 rounded-xl ${result.currentProfit >= 0 ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                        {result.currentProfit >= 0 ? (
                            <TrendingUp className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                        ) : (
                            <TrendingDown className="w-8 h-8 text-red-500 mx-auto mb-2" />
                        )}
                        <p className="text-sm text-slate-500">Current P/L if Exercised</p>
                        <p className={`text-4xl font-bold ${result.currentProfit >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                            {formatCurrency(result.currentProfit)}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                            {result.isITM ? 'In the Money' : 'Out of the Money'}
                        </p>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                        <div className="p-3 bg-white dark:bg-slate-800 rounded-xl text-center">
                            <p className="text-xs text-slate-500 mb-1">Breakeven</p>
                            <p className="text-lg font-bold text-blue-600">{formatCurrency(result.breakeven)}</p>
                        </div>
                        <div className="p-3 bg-white dark:bg-slate-800 rounded-xl text-center">
                            <p className="text-xs text-slate-500 mb-1">Max Profit</p>
                            <p className="text-lg font-bold text-emerald-600">{formatCurrency(result.maxProfit)}</p>
                        </div>
                        <div className="p-3 bg-white dark:bg-slate-800 rounded-xl text-center">
                            <p className="text-xs text-slate-500 mb-1">Max Loss</p>
                            <p className="text-lg font-bold text-red-500">{formatCurrency(result.maxLoss)}</p>
                        </div>
                    </div>

                    {/* Profit/Loss Chart */}
                    <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                            P/L at Expiration (by Stock Price)
                        </p>
                        <div ref={chartContainerRef} className="w-full" style={{ height: 200 }} />
                        <p className="text-xs text-center text-slate-400 mt-2">
                            Stock price range: {formatCurrency(Math.round(stockPrice * 0.7))} - {formatCurrency(Math.round(stockPrice * 1.3))}
                        </p>
                    </div>

                    {/* Cost Basis */}
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Total Premium {strategy === 'long' ? 'Paid' : 'Received'}</span>
                            <span className={`font-bold ${strategy === 'long' ? 'text-red-500' : 'text-emerald-600'}`}>
                                {formatCurrency(result.totalPremium)}
                            </span>
                        </div>
                    </div>

                    {/* Risk Warning */}
                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                        <div className="flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-amber-800 dark:text-amber-300">
                                Options trading involves significant risk. This calculator provides estimates only and does not account for time decay, implied volatility, or other Greeks.
                            </p>
                        </div>
                    </div>
                </div>
            }
        >
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Option Type
                        </label>
                        <select
                            value={optionType}
                            onChange={(e) => setOptionType(e.target.value as OptionType)}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        >
                            <option value="call">Call Option</option>
                            <option value="put">Put Option</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Strategy
                        </label>
                        <select
                            value={strategy}
                            onChange={(e) => setStrategy(e.target.value as Strategy)}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        >
                            <option value="long">Long (Buy)</option>
                            <option value="short">Short (Sell)</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Stock Price ($)
                        </label>
                        <input
                            type="number"
                            value={stockPrice}
                            onChange={(e) => setStockPrice(Number(e.target.value))}
                            step={1}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Strike Price ($)
                        </label>
                        <input
                            type="number"
                            value={strikePrice}
                            onChange={(e) => setStrikePrice(Number(e.target.value))}
                            step={1}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Premium per Share ($)
                        </label>
                        <input
                            type="number"
                            value={premium}
                            onChange={(e) => setPremium(Number(e.target.value))}
                            step={0.5}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Contracts
                        </label>
                        <input
                            type="number"
                            value={contracts}
                            onChange={(e) => setContracts(Number(e.target.value))}
                            min={1}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        />
                    </div>
                </div>
            </div>
        </CalculatorLayout>
    );
}
