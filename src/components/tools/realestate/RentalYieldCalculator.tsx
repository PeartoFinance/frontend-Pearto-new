'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import PriceDisplay from '@/components/common/PriceDisplay';
import { Building2, TrendingUp, DollarSign, Percent, Home } from 'lucide-react';
import {
    createChart,
    ColorType,
    HistogramSeries,
    type IChartApi,
} from 'lightweight-charts';

export default function RentalYieldCalculator() {
    const [propertyValue, setPropertyValue] = useState(400000);
    const [monthlyRent, setMonthlyRent] = useState(2500);
    const [vacancyRate, setVacancyRate] = useState(5);
    const [propertyTaxes, setPropertyTaxes] = useState(4000);
    const [insurance, setInsurance] = useState(1200);
    const [maintenance, setMaintenance] = useState(2);
    const [managementFee, setManagementFee] = useState(8);
    const [mortgagePayment, setMortgagePayment] = useState(2000);
    const [downPayment, setDownPayment] = useState(80000);

    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const [isDark, setIsDark] = useState(false);

    const result = useMemo(() => {
        // Annual income calculations
        const grossAnnualRent = monthlyRent * 12;
        const vacancyLoss = grossAnnualRent * (vacancyRate / 100);
        const effectiveGrossIncome = grossAnnualRent - vacancyLoss;

        // Annual expenses
        const maintenanceCost = propertyValue * (maintenance / 100);
        const managementCost = effectiveGrossIncome * (managementFee / 100);
        const totalExpenses = propertyTaxes + insurance + maintenanceCost + managementCost;

        // Net Operating Income (NOI)
        const noi = effectiveGrossIncome - totalExpenses;

        // Cash flow (after mortgage)
        const annualMortgage = mortgagePayment * 12;
        const cashFlow = noi - annualMortgage;
        const monthlyCashFlow = cashFlow / 12;

        // Yield calculations
        const grossYield = (grossAnnualRent / propertyValue) * 100;
        const capRate = (noi / propertyValue) * 100;
        const cashOnCashReturn = (cashFlow / downPayment) * 100;

        // Monthly breakdown for chart
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const startDate = new Date();
        const monthlyData = months.map((_, i) => {
            const date = new Date(startDate);
            date.setMonth(i);
            // Simulate monthly cash flow with some vacancy in random months
            const isVacant = Math.random() < vacancyRate / 100;
            const income = isVacant ? 0 : monthlyRent;
            const expenses = (totalExpenses / 12);
            const mortgage = mortgagePayment;
            const netCashFlow = income - expenses - mortgage;

            return {
                time: date.toISOString().split('T')[0],
                value: netCashFlow,
                color: netCashFlow >= 0 ? '#10b981' : '#ef4444'
            };
        });

        // ROI metrics
        const annualAppreciationRate = 3;
        const appreciationValue = propertyValue * (annualAppreciationRate / 100);
        const totalReturn = cashFlow + appreciationValue;
        const totalROI = (totalReturn / downPayment) * 100;

        return {
            grossAnnualRent,
            effectiveGrossIncome,
            totalExpenses,
            noi,
            cashFlow,
            monthlyCashFlow,
            grossYield,
            capRate,
            cashOnCashReturn,
            totalROI,
            monthlyData,
            expenseBreakdown: {
                taxes: propertyTaxes,
                insurance,
                maintenance: maintenanceCost,
                management: managementCost,
                mortgage: annualMortgage
            }
        };
    }, [propertyValue, monthlyRent, vacancyRate, propertyTaxes, insurance, maintenance, managementFee, mortgagePayment, downPayment]);

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
            height: 150,
            rightPriceScale: { borderColor: isDark ? '#334155' : '#e2e8f0' },
            timeScale: { borderColor: isDark ? '#334155' : '#e2e8f0' },
        });

        chartRef.current = chart;

        const series = chart.addSeries(HistogramSeries, {
            color: '#10b981',
        });

        series.setData(result.monthlyData as any);
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
            title="Rental Yield Calculator"
            description="Calculate rental property returns and cash flow"
            category="Real Estate"
            results={
                <div className="space-y-4">
                    {/* Key Metrics */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl text-center">
                            <p className="text-xs text-slate-500 mb-1">Cap Rate</p>
                            <p className="text-2xl font-bold text-emerald-600">{result.capRate.toFixed(2)}%</p>
                        </div>
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-center">
                            <p className="text-xs text-slate-500 mb-1">Cash-on-Cash</p>
                            <p className="text-2xl font-bold text-blue-600">{result.cashOnCashReturn.toFixed(2)}%</p>
                        </div>
                    </div>

                    {/* Monthly Cash Flow */}
                    <div className={`text-center p-5 rounded-xl ${result.monthlyCashFlow >= 0 ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                        <DollarSign className={`w-6 h-6 mx-auto mb-1 ${result.monthlyCashFlow >= 0 ? 'text-emerald-500' : 'text-red-500'}`} />
                        <p className="text-sm text-slate-500">Monthly Cash Flow</p>
                        <p className={`text-3xl font-bold ${result.monthlyCashFlow >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                            <PriceDisplay amount={result.monthlyCashFlow} maximumFractionDigits={0} />
                        </p>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                        <div className="p-3 bg-white dark:bg-slate-800 rounded-xl text-center">
                            <p className="text-xs text-slate-500 mb-1">Gross Yield</p>
                            <p className="text-lg font-bold text-slate-700 dark:text-slate-300">{result.grossYield.toFixed(1)}%</p>
                        </div>
                        <div className="p-3 bg-white dark:bg-slate-800 rounded-xl text-center">
                            <p className="text-xs text-slate-500 mb-1">Annual NOI</p>
                            <p className="text-lg font-bold text-emerald-600">
                                <PriceDisplay amount={result.noi} maximumFractionDigits={0} />
                            </p>
                        </div>
                        <div className="p-3 bg-white dark:bg-slate-800 rounded-xl text-center">
                            <p className="text-xs text-slate-500 mb-1">Total ROI</p>
                            <p className="text-lg font-bold text-purple-600">{result.totalROI.toFixed(1)}%</p>
                        </div>
                    </div>

                    {/* Monthly Cash Flow Chart */}
                    <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Monthly Cash Flow (simulated)
                        </p>
                        <div ref={chartContainerRef} className="w-full" style={{ height: 150 }} />
                    </div>

                    {/* Expense Breakdown */}
                    <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                            Annual Expense Breakdown
                        </p>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-slate-500">Property Taxes</span>
                                <span><PriceDisplay amount={result.expenseBreakdown.taxes} maximumFractionDigits={0} /></span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Insurance</span>
                                <span><PriceDisplay amount={result.expenseBreakdown.insurance} maximumFractionDigits={0} /></span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Maintenance</span>
                                <span><PriceDisplay amount={result.expenseBreakdown.maintenance} maximumFractionDigits={0} /></span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Management</span>
                                <span><PriceDisplay amount={result.expenseBreakdown.management} maximumFractionDigits={0} /></span>
                            </div>
                            <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
                                <span className="text-slate-500 font-medium">Mortgage</span>
                                <span className="font-medium"><PriceDisplay amount={result.expenseBreakdown.mortgage} maximumFractionDigits={0} /></span>
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
                            Property Value ($)
                        </label>
                        <input
                            type="number"
                            value={propertyValue}
                            onChange={(e) => setPropertyValue(Number(e.target.value))}
                            step={10000}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Monthly Rent ($)
                        </label>
                        <input
                            type="number"
                            value={monthlyRent}
                            onChange={(e) => setMonthlyRent(Number(e.target.value))}
                            step={100}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Down Payment ($)
                        </label>
                        <input
                            type="number"
                            value={downPayment}
                            onChange={(e) => setDownPayment(Number(e.target.value))}
                            step={5000}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Monthly Mortgage ($)
                        </label>
                        <input
                            type="number"
                            value={mortgagePayment}
                            onChange={(e) => setMortgagePayment(Number(e.target.value))}
                            step={100}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Vacancy Rate: {vacancyRate}%
                        </label>
                        <input
                            type="range"
                            min={0}
                            max={20}
                            value={vacancyRate}
                            onChange={(e) => setVacancyRate(Number(e.target.value))}
                            className="w-full accent-amber-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Management Fee: {managementFee}%
                        </label>
                        <input
                            type="range"
                            min={0}
                            max={15}
                            value={managementFee}
                            onChange={(e) => setManagementFee(Number(e.target.value))}
                            className="w-full accent-blue-500"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Property Taxes ($/yr)
                        </label>
                        <input
                            type="number"
                            value={propertyTaxes}
                            onChange={(e) => setPropertyTaxes(Number(e.target.value))}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Insurance ($/yr)
                        </label>
                        <input
                            type="number"
                            value={insurance}
                            onChange={(e) => setInsurance(Number(e.target.value))}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        />
                    </div>
                </div>
            </div>
        </CalculatorLayout>
    );
}
