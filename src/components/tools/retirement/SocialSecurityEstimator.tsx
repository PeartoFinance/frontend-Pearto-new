'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import PriceDisplay from '@/components/common/PriceDisplay';
import { Clock, TrendingUp, DollarSign, Calendar, Users } from 'lucide-react';
import {
    createChart,
    ColorType,
    HistogramSeries,
    LineSeries,
    type IChartApi,
} from 'lightweight-charts';

export default function SocialSecurityEstimator() {
    const [birthYear, setBirthYear] = useState(1970);
    const [averageEarnings, setAverageEarnings] = useState(75000);
    const [startAge, setStartAge] = useState(67);
    const [yearsWorked, setYearsWorked] = useState(35);
    const [cola, setCola] = useState(2.5);

    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const [isDark, setIsDark] = useState(false);

    const result = useMemo(() => {
        // Determine Full Retirement Age (FRA)
        let fra: number;
        if (birthYear <= 1937) fra = 65;
        else if (birthYear <= 1942) fra = 65 + (birthYear - 1937) * 2 / 12;
        else if (birthYear <= 1954) fra = 66;
        else if (birthYear <= 1959) fra = 66 + (birthYear - 1954) * 2 / 12;
        else fra = 67;

        // Simplified PIA calculation (simplified AIME formula)
        // Bend points for 2024
        const bendPoint1 = 1174;
        const bendPoint2 = 7078;

        const monthlyAIME = (averageEarnings * yearsWorked / 35) / 12;
        let pia: number;

        if (monthlyAIME <= bendPoint1) {
            pia = monthlyAIME * 0.90;
        } else if (monthlyAIME <= bendPoint2) {
            pia = bendPoint1 * 0.90 + (monthlyAIME - bendPoint1) * 0.32;
        } else {
            pia = bendPoint1 * 0.90 + (bendPoint2 - bendPoint1) * 0.32 + (monthlyAIME - bendPoint2) * 0.15;
        }

        // Adjustment for claiming age
        let monthlyBenefit: number;
        const monthsBeforeFRA = (fra - startAge) * 12;
        const monthsAfterFRA = (startAge - fra) * 12;

        if (startAge < fra) {
            // Early reduction
            const reductionMonths = Math.min(36, monthsBeforeFRA);
            const additionalMonths = Math.max(0, monthsBeforeFRA - 36);
            const reduction = (reductionMonths * 5 / 9 + additionalMonths * 5 / 12) / 100;
            monthlyBenefit = pia * (1 - reduction);
        } else if (startAge > fra) {
            // Delayed retirement credits (8% per year after FRA)
            const increase = Math.min(monthsAfterFRA, 36) * (8 / 12) / 100;
            monthlyBenefit = pia * (1 + increase);
        } else {
            monthlyBenefit = pia;
        }

        // Generate benefit comparison for different start ages
        const ageComparison = [];
        for (let age = 62; age <= 70; age++) {
            const months = (fra - age) * 12;
            let benefit: number;

            if (age < fra) {
                const redMonths = Math.min(36, months);
                const addMonths = Math.max(0, months - 36);
                const red = (redMonths * 5 / 9 + addMonths * 5 / 12) / 100;
                benefit = pia * (1 - red);
            } else {
                const inc = Math.min((age - fra) * 12, 36) * (8 / 12) / 100;
                benefit = pia * (1 + inc);
            }

            ageComparison.push({
                age,
                monthly: Math.round(benefit),
                annual: Math.round(benefit * 12)
            });
        }

        // Projected benefits with COLA over 20 years
        const projections = [];
        let projectedBenefit = monthlyBenefit;
        const startYear = birthYear + startAge;

        for (let year = 0; year <= 20; year++) {
            projections.push({
                time: `${startYear + year}-01-01`,
                value: projectedBenefit * 12 // Annual
            });
            projectedBenefit *= (1 + cola / 100);
        }

        // Lifetime benefits comparison
        const lifeExpectancy = 85;
        const at62 = ageComparison.find(a => a.age === 62)?.monthly || 0;
        const at67 = ageComparison.find(a => a.age === 67)?.monthly || 0;
        const at70 = ageComparison.find(a => a.age === 70)?.monthly || 0;

        const lifetime62 = at62 * 12 * (lifeExpectancy - 62);
        const lifetime67 = at67 * 12 * (lifeExpectancy - 67);
        const lifetime70 = at70 * 12 * (lifeExpectancy - 70);

        return {
            monthlyBenefit: Math.round(monthlyBenefit),
            annualBenefit: Math.round(monthlyBenefit * 12),
            pia: Math.round(pia),
            fra,
            ageComparison,
            projections,
            lifetimeComparison: { at62: lifetime62, at67: lifetime67, at70: lifetime70 }
        };
    }, [birthYear, averageEarnings, startAge, yearsWorked, cola]);

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
            color: '#10b981',
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
            title="Social Security Estimator"
            description="Estimate your Social Security benefits"
            category="Retirement"
            results={
                <div className="space-y-4">
                    {/* Monthly Benefit */}
                    <div className="text-center p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                        <DollarSign className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                        <p className="text-sm text-slate-500">Estimated Monthly Benefit at Age {startAge}</p>
                        <p className="text-4xl font-bold text-blue-600">
                            <PriceDisplay amount={result.monthlyBenefit} maximumFractionDigits={0} />
                        </p>
                        <p className="text-sm text-slate-400 mt-1">
                            <PriceDisplay amount={result.annualBenefit} maximumFractionDigits={0} />/year
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl text-center">
                            <p className="text-xs text-slate-500 mb-1">Full Retirement Age</p>
                            <p className="text-xl font-bold text-purple-600">{result.fra.toFixed(1)}</p>
                        </div>
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl text-center">
                            <p className="text-xs text-slate-500 mb-1">PIA (at FRA)</p>
                            <p className="text-xl font-bold text-emerald-600">
                                <PriceDisplay amount={result.pia} maximumFractionDigits={0} />
                            </p>
                        </div>
                    </div>

                    {/* Age Comparison */}
                    <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                            Monthly Benefit by Start Age
                        </p>
                        <div className="space-y-2">
                            {[62, 65, 67, 70].map(age => {
                                const data = result.ageComparison.find(a => a.age === age);
                                const isSelected = age === startAge;
                                return (
                                    <div key={age} className={`flex justify-between items-center p-2 rounded ${isSelected ? 'bg-blue-100 dark:bg-blue-900/30' : ''}`}>
                                        <span className="text-sm text-slate-600 dark:text-slate-400">Age {age}</span>
                                        <span className={`font-bold ${isSelected ? 'text-blue-600' : 'text-slate-700 dark:text-slate-300'}`}>
                                            <PriceDisplay amount={data?.monthly || 0} maximumFractionDigits={0} />
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Projections Chart */}
                    <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                            Annual Benefits with {cola}% COLA
                        </p>
                        <div ref={chartContainerRef} className="w-full" style={{ height: 180 }} />
                    </div>

                    {/* Disclaimer */}
                    <p className="text-xs text-center text-slate-400">
                        This is an estimate. Actual benefits depend on your earnings history.
                    </p>
                </div>
            }
        >
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Birth Year
                        </label>
                        <input
                            type="number"
                            value={birthYear}
                            onChange={(e) => setBirthYear(Number(e.target.value))}
                            min={1940}
                            max={2010}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Start Collecting At
                        </label>
                        <select
                            value={startAge}
                            onChange={(e) => setStartAge(Number(e.target.value))}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        >
                            {[62, 63, 64, 65, 66, 67, 68, 69, 70].map(age => (
                                <option key={age} value={age}>Age {age}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Average Annual Earnings ($)
                    </label>
                    <input
                        type="number"
                        value={averageEarnings}
                        onChange={(e) => setAverageEarnings(Number(e.target.value))}
                        step={5000}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Years Worked: {yearsWorked}
                    </label>
                    <input
                        type="range"
                        min={10}
                        max={45}
                        value={yearsWorked}
                        onChange={(e) => setYearsWorked(Number(e.target.value))}
                        className="w-full accent-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        COLA Assumption: {cola}%
                    </label>
                    <input
                        type="range"
                        min={0}
                        max={5}
                        step={0.5}
                        value={cola}
                        onChange={(e) => setCola(Number(e.target.value))}
                        className="w-full accent-emerald-500"
                    />
                </div>
            </div>
        </CalculatorLayout>
    );
}
