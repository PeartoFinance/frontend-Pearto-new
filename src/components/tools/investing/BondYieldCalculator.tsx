'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import PriceDisplay from '@/components/common/PriceDisplay';
import { Landmark, TrendingUp, DollarSign, BarChart3, Calendar } from 'lucide-react';
import {
    createChart,
    ColorType,
    LineSeries,
    type IChartApi,
} from 'lightweight-charts';

export default function BondYieldCalculator() {
    const [faceValue, setFaceValue] = useState(1000);
    const [purchasePrice, setPurchasePrice] = useState(950);
    const [couponRate, setCouponRate] = useState(5);
    const [yearsToMaturity, setYearsToMaturity] = useState(10);
    const [paymentsPerYear, setPaymentsPerYear] = useState<1 | 2 | 4>(2);

    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const [isDark, setIsDark] = useState(false);

    const result = useMemo(() => {
        // Current Yield
        const annualCoupon = faceValue * (couponRate / 100);
        const currentYield = (annualCoupon / purchasePrice) * 100;

        // Yield to Maturity (YTM) - Newton-Raphson approximation
        const n = yearsToMaturity;
        const c = annualCoupon / paymentsPerYear;
        const totalPayments = n * paymentsPerYear;

        // Approximate YTM using the bond pricing formula iteratively
        let ytm = couponRate / 100; // Initial guess
        for (let i = 0; i < 100; i++) {
            const yPerPeriod = ytm / paymentsPerYear;
            let price = 0;
            for (let t = 1; t <= totalPayments; t++) {
                price += c / Math.pow(1 + yPerPeriod, t);
            }
            price += faceValue / Math.pow(1 + yPerPeriod, totalPayments);

            // Derivative approximation
            let priceDerivative = 0;
            for (let t = 1; t <= totalPayments; t++) {
                priceDerivative -= (t * c) / Math.pow(1 + yPerPeriod, t + 1) / paymentsPerYear;
            }
            priceDerivative -= (totalPayments * faceValue) / Math.pow(1 + yPerPeriod, totalPayments + 1) / paymentsPerYear;

            const diff = price - purchasePrice;
            if (Math.abs(diff) < 0.0001) break;
            ytm = ytm - diff / priceDerivative;
        }

        const ytmPercent = ytm * 100;

        // Duration (Macaulay)
        const yPerPeriod = ytm / paymentsPerYear;
        let weightedCashFlow = 0;
        let totalPV = 0;
        for (let t = 1; t <= totalPayments; t++) {
            const cf = t === totalPayments ? c + faceValue : c;
            const pv = cf / Math.pow(1 + yPerPeriod, t);
            weightedCashFlow += (t / paymentsPerYear) * pv;
            totalPV += pv;
        }
        const duration = weightedCashFlow / totalPV;

        // Modified Duration
        const modifiedDuration = duration / (1 + yPerPeriod);

        // Generate yield curve comparison
        const yieldCurve = [];
        const startDate = new Date();
        for (let year = 1; year <= 30; year++) {
            const date = new Date(startDate);
            date.setFullYear(date.getFullYear() + year);

            // Simulate typical yield curve (upward sloping)
            const baseYield = ytm * 100 * (0.6 + 0.4 * Math.log(year + 1) / Math.log(31));
            yieldCurve.push({
                time: date.toISOString().split('T')[0],
                value: baseYield
            });
        }

        // Total return
        const totalCoupons = annualCoupon * yearsToMaturity;
        const capitalGain = faceValue - purchasePrice;
        const totalReturn = totalCoupons + capitalGain;
        const totalReturnPercent = (totalReturn / purchasePrice) * 100;

        // Is premium or discount
        const bondType = purchasePrice > faceValue ? 'premium' : purchasePrice < faceValue ? 'discount' : 'par';

        return {
            currentYield,
            ytmPercent,
            duration,
            modifiedDuration,
            annualCoupon,
            totalCoupons,
            capitalGain,
            totalReturn,
            totalReturnPercent,
            bondType,
            yieldCurve
        };
    }, [faceValue, purchasePrice, couponRate, yearsToMaturity, paymentsPerYear]);

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
            height: 160,
            rightPriceScale: { borderColor: isDark ? '#334155' : '#e2e8f0' },
            timeScale: { borderColor: isDark ? '#334155' : '#e2e8f0' },
        });

        chartRef.current = chart;

        const series = chart.addSeries(LineSeries, {
            color: '#8b5cf6',
            lineWidth: 2,
        });

        series.setData(result.yieldCurve as any);
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
            title="Bond Yield Calculator"
            description="Calculate bond yields, duration, and returns"
            category="Investing"
            results={
                <div className="space-y-4">
                    {/* Key Yields */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-center">
                            <p className="text-xs text-slate-500 mb-1">Current Yield</p>
                            <p className="text-2xl font-bold text-blue-600">{result.currentYield.toFixed(2)}%</p>
                        </div>
                        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl text-center">
                            <p className="text-xs text-slate-500 mb-1">Yield to Maturity</p>
                            <p className="text-2xl font-bold text-purple-600">{result.ytmPercent.toFixed(2)}%</p>
                        </div>
                    </div>

                    {/* Bond Type Badge */}
                    <div className={`text-center p-3 rounded-xl ${result.bondType === 'discount' ? 'bg-emerald-50 dark:bg-emerald-900/20' :
                        result.bondType === 'premium' ? 'bg-amber-50 dark:bg-amber-900/20' :
                            'bg-slate-50 dark:bg-slate-800'
                        }`}>
                        <span className={`text-sm font-medium ${result.bondType === 'discount' ? 'text-emerald-600' :
                            result.bondType === 'premium' ? 'text-amber-600' : 'text-slate-600'
                            }`}>
                            {result.bondType === 'discount' ? '📈 Discount Bond (below par)' :
                                result.bondType === 'premium' ? '📉 Premium Bond (above par)' :
                                    'Par Bond'}
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl text-center">
                            <p className="text-xs text-slate-500 mb-1">Duration</p>
                            <p className="text-xl font-bold text-slate-700 dark:text-slate-300">{result.duration.toFixed(2)} yrs</p>
                        </div>
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl text-center">
                            <p className="text-xs text-slate-500 mb-1">Modified Duration</p>
                            <p className="text-xl font-bold text-slate-700 dark:text-slate-300">{result.modifiedDuration.toFixed(2)}</p>
                        </div>
                    </div>

                    {/* Yield Curve */}
                    <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Indicative Yield Curve
                        </p>
                        <div ref={chartContainerRef} className="w-full" style={{ height: 160 }} />
                    </div>

                    {/* Return Breakdown */}
                    <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                            Total Return ({yearsToMaturity} years)
                        </p>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-slate-500">Annual Coupon</span>
                                <span><PriceDisplay amount={result.annualCoupon} /></span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Total Coupons</span>
                                <span className="text-emerald-600"><PriceDisplay amount={result.totalCoupons} /></span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Capital Gain/Loss</span>
                                <span className={result.capitalGain >= 0 ? 'text-emerald-600' : 'text-red-500'}>
                                    <PriceDisplay amount={result.capitalGain} />
                                </span>
                            </div>
                            <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
                                <span className="font-medium">Total Return</span>
                                <span className="font-bold text-purple-600">
                                    <PriceDisplay amount={result.totalReturn} /> ({result.totalReturnPercent.toFixed(1)}%)
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
                            Face Value ($)
                        </label>
                        <input
                            type="number"
                            value={faceValue}
                            onChange={(e) => setFaceValue(Number(e.target.value))}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Purchase Price ($)
                        </label>
                        <input
                            type="number"
                            value={purchasePrice}
                            onChange={(e) => setPurchasePrice(Number(e.target.value))}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Coupon Rate: {couponRate}%
                    </label>
                    <input
                        type="range"
                        min={0}
                        max={12}
                        step={0.25}
                        value={couponRate}
                        onChange={(e) => setCouponRate(Number(e.target.value))}
                        className="w-full accent-blue-500"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Years to Maturity
                        </label>
                        <input
                            type="number"
                            value={yearsToMaturity}
                            onChange={(e) => setYearsToMaturity(Number(e.target.value))}
                            min={1}
                            max={30}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Payments/Year
                        </label>
                        <select
                            value={paymentsPerYear}
                            onChange={(e) => setPaymentsPerYear(Number(e.target.value) as 1 | 2 | 4)}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        >
                            <option value={1}>Annual</option>
                            <option value={2}>Semi-annual</option>
                            <option value={4}>Quarterly</option>
                        </select>
                    </div>
                </div>
            </div>
        </CalculatorLayout>
    );
}
