'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import PriceDisplay from '@/components/common/PriceDisplay';
import { useCurrency } from '@/contexts/CurrencyContext';
import { Home, DollarSign, TrendingUp, ShieldCheck } from 'lucide-react';

export default function MortgageAffordability() {
    const { formatPrice } = useCurrency();
    const [annualIncome, setAnnualIncome] = useState(90000);
    const [monthlyDebts, setMonthlyDebts] = useState(500);
    const [downPayment, setDownPayment] = useState(60000);
    const [interestRate, setInterestRate] = useState(6.5);
    const [loanTerm, setLoanTerm] = useState(30);
    const [propertyTaxRate, setPropertyTaxRate] = useState(1.2);
    const [insurancePerYear, setInsurancePerYear] = useState(1500);

    const result = useMemo(() => {
        const monthlyIncome = annualIncome / 12;

        // 28% rule — max housing payment
        const maxHousingPayment = monthlyIncome * 0.28;

        // 36% rule — max total debt
        const maxTotalDebt = monthlyIncome * 0.36;
        const maxHousingFromDebtRule = maxTotalDebt - monthlyDebts;

        // Effective max monthly payment is the lesser of the two rules
        const maxMonthlyPayment = Math.min(maxHousingPayment, maxHousingFromDebtRule);

        // Subtract taxes & insurance from monthly budget to get mortgage budget
        const monthlyTaxes = (propertyTaxRate / 100) * 1 / 12; // per-dollar monthly
        const monthlyInsurance = insurancePerYear / 12;

        // Solve for max home price
        // maxMonthlyPayment = EMI + taxes + insurance
        // EMI = P * r(1+r)^n / ((1+r)^n - 1)
        const r = interestRate / 100 / 12;
        const n = loanTerm * 12;
        const factor = r > 0
            ? (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
            : 1 / n;

        // EMI budget = maxMonthlyPayment - insurance
        // EMI = (homePrice - downPayment) * factor
        // taxes ~ homePrice * taxRate/12
        // maxMonthlyPayment = (homePrice - downPayment) * factor + homePrice * taxRate/12 + insurance/12
        // maxMonthlyPayment - monthlyInsurance = homePrice * (factor - factor * (downPayment/homePrice) ... )
        // Solve iteratively for simplicity (or algebraically):
        // Let M = maxMonthlyPayment - monthlyInsurance
        // M = (H - D) * factor + H * (taxRate/100/12)
        // M = H * factor - D * factor + H * taxRate/100/12
        // M + D * factor = H * (factor + taxRate/100/12)
        // H = (M + D * factor) / (factor + taxRate/100/12)

        const M = maxMonthlyPayment - monthlyInsurance;
        const taxMonthly = propertyTaxRate / 100 / 12;
        const maxHomePrice = Math.max(0, (M + downPayment * factor) / (factor + taxMonthly));

        const loanAmount = Math.max(0, maxHomePrice - downPayment);
        const emi = loanAmount * factor;
        const totalInterest = emi * n - loanAmount;
        const totalPayment = emi * n;
        const monthlyTax = maxHomePrice * taxMonthly;

        return {
            maxHomePrice,
            maxMonthlyPayment,
            maxHousingFromDebtRule,
            maxHousingPayment,
            loanAmount,
            emi,
            totalInterest,
            totalPayment,
            monthlyTax,
            monthlyInsurance,
        };
    }, [annualIncome, monthlyDebts, downPayment, interestRate, loanTerm, propertyTaxRate, insurancePerYear]);

    // Donut chart data
    const segments = [
        { label: 'Principal & Interest', value: result.emi, color: '#3b82f6' },
        { label: 'Property Tax', value: result.monthlyTax, color: '#f59e0b' },
        { label: 'Insurance', value: result.monthlyInsurance, color: '#10b981' },
    ];
    const total = segments.reduce((s, seg) => s + seg.value, 0);
    const r = 42, circ = 2 * Math.PI * r;
    let cumulativeOffset = 0;

    return (
        <CalculatorLayout
            title="Mortgage Affordability Calculator"
            description="Find out the maximum home price you can afford based on your income and debts"
            category="Real Estate"
            insights={[
                { label: 'Max Home Price', value: formatPrice(result.maxHomePrice), color: 'text-emerald-600' },
                { label: 'Max Monthly (28%)', value: formatPrice(result.maxHousingPayment), color: 'text-blue-600' },
                { label: 'Max Total Debt (36%)', value: formatPrice(result.maxHousingFromDebtRule + monthlyDebts), color: 'text-purple-600' },
                { label: 'Loan Amount', value: formatPrice(result.loanAmount), color: 'text-amber-600' },
            ]}
            results={
                <div className="space-y-4">
                    {/* Hero */}
                    <div className="text-center p-6 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl">
                        <Home className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                        <p className="text-sm text-slate-500">Maximum Affordable Home Price</p>
                        <p className="text-4xl font-bold text-emerald-600">
                            <PriceDisplay amount={result.maxHomePrice} maximumFractionDigits={0} />
                        </p>
                        <p className="text-sm text-slate-500 mt-1">
                            with <PriceDisplay amount={downPayment} maximumFractionDigits={0} /> down payment
                        </p>
                    </div>

                    {/* Rules side by side */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-center">
                            <p className="text-xs text-slate-500 mb-1">28% Rule (Housing)</p>
                            <p className="text-xl font-bold text-blue-600">
                                <PriceDisplay amount={result.maxHousingPayment} maximumFractionDigits={0} />
                            </p>
                            <p className="text-[10px] text-slate-400 mt-0.5">/month max</p>
                        </div>
                        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl text-center">
                            <p className="text-xs text-slate-500 mb-1">36% Rule (Total Debt)</p>
                            <p className="text-xl font-bold text-purple-600">
                                <PriceDisplay amount={result.maxHousingFromDebtRule} maximumFractionDigits={0} />
                            </p>
                            <p className="text-[10px] text-slate-400 mt-0.5">/month for housing</p>
                        </div>
                    </div>

                    {/* Donut chart + breakdown */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 flex items-center gap-5">
                        <svg width="110" height="110" viewBox="0 0 100 100" className="flex-shrink-0">
                            <circle cx="50" cy="50" r={r} fill="none" stroke="currentColor" strokeWidth="8" className="text-slate-100 dark:text-slate-700" />
                            {segments.map((seg, i) => {
                                const pct = total > 0 ? seg.value / total : 0;
                                const segLen = pct * circ;
                                const rotation = -90 + (cumulativeOffset / (total || 1)) * 360;
                                cumulativeOffset += seg.value;
                                return (
                                    <circle key={i} cx="50" cy="50" r={r} fill="none" stroke={seg.color} strokeWidth="8"
                                        strokeDasharray={`${segLen} ${circ - segLen}`} strokeLinecap="butt"
                                        transform={`rotate(${rotation} 50 50)`} />
                                );
                            })}
                            <text x="50" y="48" textAnchor="middle" className="fill-slate-900 dark:fill-white text-[9px] font-bold">
                                {formatPrice(total)}
                            </text>
                            <text x="50" y="60" textAnchor="middle" className="fill-slate-500 text-[7px]">/month</text>
                        </svg>
                        <div className="space-y-2 flex-1">
                            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Monthly Breakdown</p>
                            {segments.map((seg, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: seg.color }} />
                                        <span className="text-xs text-slate-600 dark:text-slate-400">{seg.label}</span>
                                    </div>
                                    <span className="text-sm font-semibold text-slate-900 dark:text-white">{formatPrice(seg.value)}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Loan overview */}
                    <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Loan Overview</p>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-slate-500">Loan Amount</span>
                                <span className="font-medium"><PriceDisplay amount={result.loanAmount} maximumFractionDigits={0} /></span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Total Interest</span>
                                <span className="font-medium text-red-500"><PriceDisplay amount={result.totalInterest} maximumFractionDigits={0} /></span>
                            </div>
                            <div className="flex justify-between pt-2 border-t border-slate-100 dark:border-slate-700">
                                <span className="font-medium text-slate-700 dark:text-slate-300">Total Payment</span>
                                <span className="font-bold text-emerald-600"><PriceDisplay amount={result.totalPayment} maximumFractionDigits={0} /></span>
                            </div>
                        </div>
                    </div>
                </div>
            }
        >
            <div className="space-y-4">
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Annual Income</label>
                        <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-md">{formatPrice(annualIncome)}</span>
                    </div>
                    <input type="number" value={annualIncome} onChange={(e) => setAnnualIncome(Number(e.target.value))} step={5000}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm" />
                    <input type="range" min={20000} max={500000} step={5000} value={annualIncome}
                        onChange={(e) => setAnnualIncome(Number(e.target.value))} className="w-full accent-emerald-500 mt-1" />
                </div>

                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Monthly Debts</label>
                        <span className="text-xs font-semibold text-amber-600 bg-amber-50 dark:bg-amber-900/30 px-2 py-0.5 rounded-md">{formatPrice(monthlyDebts)}</span>
                    </div>
                    <input type="number" value={monthlyDebts} onChange={(e) => setMonthlyDebts(Number(e.target.value))} step={100}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm" />
                    <input type="range" min={0} max={5000} step={100} value={monthlyDebts}
                        onChange={(e) => setMonthlyDebts(Number(e.target.value))} className="w-full accent-amber-500 mt-1" />
                </div>

                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Down Payment</label>
                        <span className="text-xs font-semibold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-md">{formatPrice(downPayment)}</span>
                    </div>
                    <input type="number" value={downPayment} onChange={(e) => setDownPayment(Number(e.target.value))} step={5000}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm" />
                    <input type="range" min={0} max={300000} step={5000} value={downPayment}
                        onChange={(e) => setDownPayment(Number(e.target.value))} className="w-full accent-blue-500 mt-1" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Rate (%)</label>
                            <span className="text-xs font-semibold text-purple-600 bg-purple-50 dark:bg-purple-900/30 px-2 py-0.5 rounded-md">{interestRate}%</span>
                        </div>
                        <input type="number" value={interestRate} onChange={(e) => setInterestRate(Number(e.target.value))} step={0.125}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm" />
                    </div>
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Term</label>
                            <span className="text-xs font-semibold text-slate-600 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-md">{loanTerm}yr</span>
                        </div>
                        <select value={loanTerm} onChange={(e) => setLoanTerm(Number(e.target.value))}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm">
                            <option value={10}>10 years</option>
                            <option value={15}>15 years</option>
                            <option value={20}>20 years</option>
                            <option value={30}>30 years</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Tax Rate (%)</label>
                            <span className="text-xs font-semibold text-orange-600 bg-orange-50 dark:bg-orange-900/30 px-2 py-0.5 rounded-md">{propertyTaxRate}%</span>
                        </div>
                        <input type="number" value={propertyTaxRate} onChange={(e) => setPropertyTaxRate(Number(e.target.value))} step={0.1}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm" />
                    </div>
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Insurance/yr</label>
                            <span className="text-xs font-semibold text-teal-600 bg-teal-50 dark:bg-teal-900/30 px-2 py-0.5 rounded-md">{formatPrice(insurancePerYear)}</span>
                        </div>
                        <input type="number" value={insurancePerYear} onChange={(e) => setInsurancePerYear(Number(e.target.value))} step={100}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm" />
                    </div>
                </div>
            </div>
        </CalculatorLayout>
    );
}
