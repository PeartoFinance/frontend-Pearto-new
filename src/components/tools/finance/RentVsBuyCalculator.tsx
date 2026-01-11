'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import { Home, DollarSign, TrendingUp } from 'lucide-react';

export default function RentVsBuyCalculator() {
    const [homePrice, setHomePrice] = useState(5000000);
    const [downPayment, setDownPayment] = useState(1000000);
    const [loanRate, setLoanRate] = useState(8.5);
    const [monthlyRent, setMonthlyRent] = useState(25000);
    const [yearsToStay, setYearsToStay] = useState(10);
    const [appreciation, setAppreciation] = useState(5);

    const result = useMemo(() => {
        const loanAmount = homePrice - downPayment;
        const monthlyRate = loanRate / 100 / 12;
        const months = 20 * 12; // 20 year loan

        // EMI calculation
        const emi = loanAmount * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1);

        // Total rent cost over period
        const rentInflation = 0.05; // 5% annual rent increase
        let totalRent = 0;
        let currentRent = monthlyRent;
        for (let year = 0; year < yearsToStay; year++) {
            totalRent += currentRent * 12;
            currentRent *= (1 + rentInflation);
        }

        // Total buying cost
        const totalEMI = emi * yearsToStay * 12;
        const homeValueAfter = homePrice * Math.pow(1 + appreciation / 100, yearsToStay);
        const equityBuilt = homeValueAfter - loanAmount + (emi - loanAmount * monthlyRate) * yearsToStay * 12 * 0.5;
        const netBuyCost = downPayment + totalEMI - homeValueAfter + loanAmount;

        const buyAdvantage = totalRent - (totalEMI + downPayment - equityBuilt);
        const recommendation = buyAdvantage > 0 ? 'buy' : 'rent';

        return {
            emi: Math.round(emi),
            totalRent: Math.round(totalRent),
            totalEMI: Math.round(totalEMI),
            homeValueAfter: Math.round(homeValueAfter),
            buyAdvantage: Math.round(Math.abs(buyAdvantage)),
            recommendation
        };
    }, [homePrice, downPayment, loanRate, monthlyRent, yearsToStay, appreciation]);

    const formatCurrency = (amount: number) => {
        if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
        if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
    };

    return (
        <CalculatorLayout
            title="Rent vs Buy Calculator"
            description="Compare renting vs buying a home over time"
            category="Real Estate"
            results={
                <div className="space-y-6">
                    <div className={`text-center p-6 rounded-xl ${result.recommendation === 'buy' ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200' : 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200'}`}>
                        <p className="text-sm text-slate-500 mb-1">Recommendation</p>
                        <p className={`text-3xl font-bold ${result.recommendation === 'buy' ? 'text-emerald-600' : 'text-blue-600'}`}>
                            {result.recommendation === 'buy' ? '🏠 Buy' : '🏢 Rent'}
                        </p>
                        <p className="text-sm text-slate-600 mt-1">
                            You save {formatCurrency(result.buyAdvantage)} over {yearsToStay} years
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                            <span className="text-xs text-slate-500">Total Rent Cost</span>
                            <p className="text-lg font-semibold text-blue-600">{formatCurrency(result.totalRent)}</p>
                        </div>
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                            <span className="text-xs text-slate-500">Monthly EMI</span>
                            <p className="text-lg font-semibold">{formatCurrency(result.emi)}</p>
                        </div>
                    </div>
                    <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                        <span className="text-xs text-slate-500">Home Value in {yearsToStay} Years</span>
                        <p className="text-lg font-semibold text-emerald-600">{formatCurrency(result.homeValueAfter)}</p>
                    </div>
                </div>
            }
        >
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Home Price</label>
                    <input type="number" value={homePrice} onChange={(e) => setHomePrice(Number(e.target.value))} min={1000000}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Down Payment</label>
                    <input type="number" value={downPayment} onChange={(e) => setDownPayment(Number(e.target.value))} min={0}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Loan Rate (%)</label>
                    <input type="number" value={loanRate} onChange={(e) => setLoanRate(Number(e.target.value))} min={5} max={15} step={0.1}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Monthly Rent</label>
                    <input type="number" value={monthlyRent} onChange={(e) => setMonthlyRent(Number(e.target.value))} min={5000}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Years to Stay</label>
                    <input type="number" value={yearsToStay} onChange={(e) => setYearsToStay(Number(e.target.value))} min={1} max={30}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Appreciation (%)</label>
                    <input type="number" value={appreciation} onChange={(e) => setAppreciation(Number(e.target.value))} min={0} max={15}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
                </div>
            </div>
        </CalculatorLayout>
    );
}
