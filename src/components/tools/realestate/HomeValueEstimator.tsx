'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import PriceDisplay from '@/components/common/PriceDisplay';
import { useCurrency } from '@/contexts/CurrencyContext';
import { Home, TrendingUp, MapPin, Calendar } from 'lucide-react';

export default function HomeValueEstimator() {
    const { formatPrice } = useCurrency();
    const [purchasePrice, setPurchasePrice] = useState(300000);
    const [purchaseYear, setPurchaseYear] = useState(2018);
    const [locationType, setLocationType] = useState<'urban' | 'suburban' | 'rural'>('suburban');
    const [propertyType, setPropertyType] = useState<'single-family' | 'condo' | 'townhouse' | 'multi-family'>('single-family');
    const [improvements, setImprovements] = useState(25000);
    const [annualAppreciation, setAnnualAppreciation] = useState(4);

    const result = useMemo(() => {
        const currentYear = new Date().getFullYear();
        const yearsHeld = Math.max(0, currentYear - purchaseYear);

        // Location multiplier
        const locationMultiplier = locationType === 'urban' ? 1.15 : locationType === 'suburban' ? 1.0 : 0.85;

        // Property type multiplier
        const propertyMultiplier = propertyType === 'single-family' ? 1.05
            : propertyType === 'townhouse' ? 1.0
            : propertyType === 'condo' ? 0.95
            : 1.1;

        // Effective appreciation
        const effectiveRate = (annualAppreciation / 100) * locationMultiplier * propertyMultiplier;

        // Compound appreciation
        const appreciatedValue = purchasePrice * Math.pow(1 + effectiveRate, yearsHeld);
        const estimatedCurrentValue = appreciatedValue + improvements;
        const totalAppreciation = estimatedCurrentValue - purchasePrice;
        const totalReturn = purchasePrice > 0 ? (totalAppreciation / purchasePrice) * 100 : 0;
        const annualizedReturn = yearsHeld > 0
            ? (Math.pow(estimatedCurrentValue / purchasePrice, 1 / yearsHeld) - 1) * 100
            : 0;

        // Year-by-year data for bar chart
        const yearlyData: { year: number; value: number }[] = [];
        for (let y = 0; y <= yearsHeld; y++) {
            const val = purchasePrice * Math.pow(1 + effectiveRate, y) + (y === yearsHeld ? improvements : 0);
            yearlyData.push({ year: purchaseYear + y, value: val });
        }

        return {
            estimatedCurrentValue,
            totalAppreciation,
            totalReturn,
            annualizedReturn,
            yearsHeld,
            effectiveRate: effectiveRate * 100,
            yearlyData,
        };
    }, [purchasePrice, purchaseYear, locationType, propertyType, improvements, annualAppreciation]);

    // Bar chart
    const maxValue = Math.max(...result.yearlyData.map(d => d.value), 1);

    return (
        <CalculatorLayout
            title="Home Value Estimator"
            description="Estimate your home's current value based on appreciation and improvements"
            category="Real Estate"
            insights={[
                { label: 'Current Value', value: formatPrice(result.estimatedCurrentValue), color: 'text-emerald-600' },
                { label: 'Total Appreciation', value: formatPrice(result.totalAppreciation), color: 'text-blue-600' },
                { label: 'Total Return', value: `${result.totalReturn.toFixed(1)}%`, color: 'text-purple-600' },
                { label: 'Annualized', value: `${result.annualizedReturn.toFixed(1)}%`, color: 'text-amber-600' },
            ]}
            results={
                <div className="space-y-4">
                    {/* Hero */}
                    <div className="text-center p-6 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl">
                        <Home className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                        <p className="text-sm text-slate-500">Estimated Current Value</p>
                        <p className="text-4xl font-bold text-emerald-600">
                            <PriceDisplay amount={result.estimatedCurrentValue} maximumFractionDigits={0} />
                        </p>
                        <p className="text-sm text-slate-500 mt-1">{result.yearsHeld} years of ownership</p>
                    </div>

                    {/* Key metrics */}
                    <div className="grid grid-cols-3 gap-2">
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-center">
                            <p className="text-xs text-slate-500 mb-1">Appreciation</p>
                            <p className="text-lg font-bold text-blue-600">
                                <PriceDisplay amount={result.totalAppreciation} maximumFractionDigits={0} />
                            </p>
                        </div>
                        <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl text-center">
                            <p className="text-xs text-slate-500 mb-1">Total Return</p>
                            <p className="text-lg font-bold text-purple-600">{result.totalReturn.toFixed(1)}%</p>
                        </div>
                        <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl text-center">
                            <p className="text-xs text-slate-500 mb-1">Annual Return</p>
                            <p className="text-lg font-bold text-amber-600">{result.annualizedReturn.toFixed(1)}%</p>
                        </div>
                    </div>

                    {/* Growth Bar Chart */}
                    <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Value Growth Over Time</p>
                        <div className="space-y-1.5">
                            {result.yearlyData.map((d, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <span className="text-[10px] text-slate-500 w-10 text-right">{d.year}</span>
                                    <div className="flex-1 h-5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all"
                                            style={{
                                                width: `${(d.value / maxValue) * 100}%`,
                                                backgroundColor: i === result.yearlyData.length - 1 ? '#10b981' : '#3b82f6',
                                            }}
                                        />
                                    </div>
                                    <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 w-20 text-right">
                                        {formatPrice(d.value)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Details */}
                    <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Details</p>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between"><span className="text-slate-500">Purchase Price</span><span className="font-medium"><PriceDisplay amount={purchasePrice} maximumFractionDigits={0} /></span></div>
                            <div className="flex justify-between"><span className="text-slate-500">Improvements</span><span className="font-medium"><PriceDisplay amount={improvements} maximumFractionDigits={0} /></span></div>
                            <div className="flex justify-between"><span className="text-slate-500">Effective Appreciation</span><span className="font-medium">{result.effectiveRate.toFixed(2)}%/yr</span></div>
                            <div className="flex justify-between"><span className="text-slate-500">Location Adjustment</span><span className="font-medium capitalize">{locationType}</span></div>
                        </div>
                    </div>
                </div>
            }
        >
            <div className="space-y-4">
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Purchase Price</label>
                        <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-md">{formatPrice(purchasePrice)}</span>
                    </div>
                    <input type="number" value={purchasePrice} onChange={(e) => setPurchasePrice(Number(e.target.value))} step={10000}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm" />
                    <input type="range" min={50000} max={2000000} step={10000} value={purchasePrice}
                        onChange={(e) => setPurchasePrice(Number(e.target.value))} className="w-full accent-emerald-500 mt-1" />
                </div>

                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Purchase Year</label>
                        <span className="text-xs font-semibold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-md">{purchaseYear}</span>
                    </div>
                    <input type="number" value={purchaseYear} onChange={(e) => setPurchaseYear(Number(e.target.value))} min={1950} max={new Date().getFullYear()}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm" />
                    <input type="range" min={1950} max={new Date().getFullYear()} value={purchaseYear}
                        onChange={(e) => setPurchaseYear(Number(e.target.value))} className="w-full accent-blue-500 mt-1" />
                </div>

                <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">Location Type</label>
                    <div className="grid grid-cols-3 gap-2">
                        {(['urban', 'suburban', 'rural'] as const).map(loc => (
                            <button key={loc} onClick={() => setLocationType(loc)}
                                className={`px-3 py-2.5 rounded-lg border text-sm transition-all capitalize ${locationType === loc
                                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 font-medium'
                                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
                                }`}>
                                {loc}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">Property Type</label>
                    <select value={propertyType} onChange={(e) => setPropertyType(e.target.value as any)}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm">
                        <option value="single-family">Single Family</option>
                        <option value="condo">Condo</option>
                        <option value="townhouse">Townhouse</option>
                        <option value="multi-family">Multi-Family</option>
                    </select>
                </div>

                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Improvements ($)</label>
                        <span className="text-xs font-semibold text-purple-600 bg-purple-50 dark:bg-purple-900/30 px-2 py-0.5 rounded-md">{formatPrice(improvements)}</span>
                    </div>
                    <input type="number" value={improvements} onChange={(e) => setImprovements(Number(e.target.value))} step={1000}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm" />
                    <input type="range" min={0} max={200000} step={1000} value={improvements}
                        onChange={(e) => setImprovements(Number(e.target.value))} className="w-full accent-purple-500 mt-1" />
                </div>

                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Annual Appreciation (%)</label>
                        <span className="text-xs font-semibold text-amber-600 bg-amber-50 dark:bg-amber-900/30 px-2 py-0.5 rounded-md">{annualAppreciation}%</span>
                    </div>
                    <input type="number" value={annualAppreciation} onChange={(e) => setAnnualAppreciation(Number(e.target.value))} step={0.5}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm" />
                    <input type="range" min={0} max={15} step={0.5} value={annualAppreciation}
                        onChange={(e) => setAnnualAppreciation(Number(e.target.value))} className="w-full accent-amber-500 mt-1" />
                </div>
            </div>
        </CalculatorLayout>
    );
}
