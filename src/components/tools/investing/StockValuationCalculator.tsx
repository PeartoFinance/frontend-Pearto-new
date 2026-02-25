'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import PriceDisplay from '@/components/common/PriceDisplay';
import { Scale, TrendingUp, DollarSign, AlertTriangle } from 'lucide-react';
import {
    createChart,
    ColorType,
    LineSeries,
    type IChartApi,
} from 'lightweight-charts';

type ValuationMethod = 'dcf' | 'pe' | 'pb' | 'graham';

export default function StockValuationCalculator() {
    const [method, setMethod] = useState<ValuationMethod>('dcf');

    // DCF inputs
    const [currentEPS, setCurrentEPS] = useState(5);
    const [growthRate, setGrowthRate] = useState(15);
    const [discountRate, setDiscountRate] = useState(10);
    const [terminalGrowth, setTerminalGrowth] = useState(3);
    const [projectionYears, setProjectionYears] = useState(10);

    // P/E inputs
    const [peRatio, setPeRatio] = useState(20);

    // P/B inputs
    const [bookValue, setBookValue] = useState(25);
    const [pbRatio, setPbRatio] = useState(2);

    // Graham inputs
    const [noGrowthPe, setNoGrowthPe] = useState(8.5);
    const [growthMultiplier, setGrowthMultiplier] = useState(2);

    const [currentPrice, setCurrentPrice] = useState(100);

    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const [isDark, setIsDark] = useState(false);

    const result = useMemo(() => {
        let intrinsicValue = 0;
        let projections: { time: string; value: number }[] = [];
        const startDate = new Date();

        if (method === 'dcf') {
            // Discounted Cash Flow Model
            let totalPV = 0;
            let eps = currentEPS;

            for (let year = 1; year <= projectionYears; year++) {
                eps = eps * (1 + growthRate / 100);
                const pv = eps / Math.pow(1 + discountRate / 100, year);
                totalPV += pv;

                const date = new Date(startDate);
                date.setFullYear(date.getFullYear() + year);
                projections.push({
                    time: date.toISOString().split('T')[0],
                    value: totalPV * 10 // Multiply by assumed P/E for visualization
                });
            }

            // Terminal value
            const terminalEPS = eps * (1 + terminalGrowth / 100);
            const terminalValue = terminalEPS / (discountRate / 100 - terminalGrowth / 100);
            const terminalPV = terminalValue / Math.pow(1 + discountRate / 100, projectionYears);

            intrinsicValue = (totalPV + terminalPV) * 10; // Assume 10x P/E
        } else if (method === 'pe') {
            // P/E Valuation
            intrinsicValue = currentEPS * peRatio;

            // Project EPS growth
            let eps = currentEPS;
            for (let year = 0; year <= projectionYears; year++) {
                const date = new Date(startDate);
                date.setFullYear(date.getFullYear() + year);
                projections.push({
                    time: date.toISOString().split('T')[0],
                    value: eps * peRatio
                });
                eps = eps * (1 + growthRate / 100);
            }
        } else if (method === 'pb') {
            // P/B Valuation
            intrinsicValue = bookValue * pbRatio;
            projections = [{ time: startDate.toISOString().split('T')[0], value: intrinsicValue }];
        } else if (method === 'graham') {
            // Graham Formula: V = EPS × (no-growth P/E + growth × multiplier)
            intrinsicValue = currentEPS * (noGrowthPe + growthMultiplier * growthRate);

            // Project with different growth scenarios
            for (let g = 0; g <= 20; g += 2) {
                const date = new Date(startDate);
                date.setMonth(date.getMonth() + g);
                projections.push({
                    time: date.toISOString().split('T')[0],
                    value: currentEPS * (noGrowthPe + growthMultiplier * g)
                });
            }
        }

        const upside = ((intrinsicValue - currentPrice) / currentPrice) * 100;
        const marginOfSafety = ((intrinsicValue - currentPrice) / intrinsicValue) * 100;
        const isUndervalued = intrinsicValue > currentPrice;

        return {
            intrinsicValue,
            upside,
            marginOfSafety,
            isUndervalued,
            projections
        };
    }, [method, currentEPS, growthRate, discountRate, terminalGrowth, projectionYears,
        peRatio, bookValue, pbRatio, noGrowthPe, growthMultiplier, currentPrice]);

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
        if (!chartContainerRef.current || !result || result.projections.length === 0) return;

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
            height: 180,
            rightPriceScale: { borderColor: isDark ? '#334155' : '#e2e8f0' },
            timeScale: { borderColor: isDark ? '#334155' : '#e2e8f0' },
        });

        chartRef.current = chart;

        const series = chart.addSeries(LineSeries, {
            color: result.isUndervalued ? '#10b981' : '#ef4444',
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
            title="Stock Valuation Calculator"
            description="Estimate intrinsic value using multiple methods"
            category="Investing"
            results={
                <div className="space-y-4">
                    {/* Intrinsic Value */}
                    <div className={`text-center p-6 rounded-xl ${result.isUndervalued ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                        <Scale className={`w-8 h-8 mx-auto mb-2 ${result.isUndervalued ? 'text-emerald-500' : 'text-red-500'}`} />
                        <p className="text-sm text-slate-500">Intrinsic Value</p>
                        <p className={`text-4xl font-bold ${result.isUndervalued ? 'text-emerald-600' : 'text-red-600'}`}>
                            <PriceDisplay amount={result.intrinsicValue} />
                        </p>
                        <p className={`text-sm mt-1 ${result.isUndervalued ? 'text-emerald-600' : 'text-red-500'}`}>
                            {result.isUndervalued ? '✓ Undervalued' : '✗ Overvalued'} by {Math.abs(result.upside).toFixed(1)}%
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl text-center">
                            <p className="text-xs text-slate-500 mb-1">Current Price</p>
                            <p className="text-xl font-bold text-slate-700 dark:text-slate-300">
                                <PriceDisplay amount={currentPrice} />
                            </p>
                        </div>
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl text-center">
                            <p className="text-xs text-slate-500 mb-1">Margin of Safety</p>
                            <p className={`text-xl font-bold ${result.marginOfSafety > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                {result.marginOfSafety.toFixed(1)}%
                            </p>
                        </div>
                    </div>

                    {/* Valuation Chart */}
                    {result.projections.length > 1 && (
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                                Value Projection ({method.toUpperCase()})
                            </p>
                            <div ref={chartContainerRef} className="w-full" style={{ height: 180 }} />
                        </div>
                    )}

                    {/* Method Info */}
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                        <p className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">
                            {method === 'dcf' && 'Discounted Cash Flow (DCF)'}
                            {method === 'pe' && 'P/E Ratio Model'}
                            {method === 'pb' && 'Price-to-Book Model'}
                            {method === 'graham' && 'Graham Formula'}
                        </p>
                        <p className="text-xs text-blue-700 dark:text-blue-400">
                            {method === 'dcf' && 'Projects future earnings and discounts to present value'}
                            {method === 'pe' && 'Multiplies EPS by fair P/E ratio'}
                            {method === 'pb' && 'Multiplies book value by fair P/B ratio'}
                            {method === 'graham' && 'Value = EPS × (8.5 + 2g) where g = growth rate'}
                        </p>
                    </div>
                </div>
            }
        >
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Valuation Method
                    </label>
                    <select
                        value={method}
                        onChange={(e) => setMethod(e.target.value as ValuationMethod)}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                    >
                        <option value="dcf">Discounted Cash Flow (DCF)</option>
                        <option value="pe">P/E Ratio</option>
                        <option value="pb">Price-to-Book</option>
                        <option value="graham">Graham Formula</option>
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Current EPS ($)
                        </label>
                        <input
                            type="number"
                            value={currentEPS}
                            onChange={(e) => setCurrentEPS(Number(e.target.value))}
                            step={0.5}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Current Stock Price ($)
                        </label>
                        <input
                            type="number"
                            value={currentPrice}
                            onChange={(e) => setCurrentPrice(Number(e.target.value))}
                            step={1}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Expected Growth Rate: {growthRate}%
                    </label>
                    <input
                        type="range"
                        min={0}
                        max={30}
                        value={growthRate}
                        onChange={(e) => setGrowthRate(Number(e.target.value))}
                        className="w-full accent-blue-500"
                    />
                </div>

                {method === 'dcf' && (
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Discount Rate: {discountRate}%
                            </label>
                            <input
                                type="range"
                                min={5}
                                max={20}
                                value={discountRate}
                                onChange={(e) => setDiscountRate(Number(e.target.value))}
                                className="w-full accent-purple-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Terminal Growth: {terminalGrowth}%
                            </label>
                            <input
                                type="range"
                                min={0}
                                max={5}
                                step={0.5}
                                value={terminalGrowth}
                                onChange={(e) => setTerminalGrowth(Number(e.target.value))}
                                className="w-full accent-emerald-500"
                            />
                        </div>
                    </div>
                )}

                {method === 'pe' && (
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Fair P/E Ratio: {peRatio}
                        </label>
                        <input
                            type="range"
                            min={5}
                            max={50}
                            value={peRatio}
                            onChange={(e) => setPeRatio(Number(e.target.value))}
                            className="w-full accent-blue-500"
                        />
                    </div>
                )}

                {method === 'pb' && (
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Book Value per Share ($)
                            </label>
                            <input
                                type="number"
                                value={bookValue}
                                onChange={(e) => setBookValue(Number(e.target.value))}
                                className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Fair P/B Ratio: {pbRatio}
                            </label>
                            <input
                                type="range"
                                min={0.5}
                                max={5}
                                step={0.5}
                                value={pbRatio}
                                onChange={(e) => setPbRatio(Number(e.target.value))}
                                className="w-full accent-purple-500"
                            />
                        </div>
                    </div>
                )}
            </div>
        </CalculatorLayout>
    );
}
