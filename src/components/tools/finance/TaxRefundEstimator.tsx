'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import { useCurrency } from '@/contexts/CurrencyContext';
import { DollarSign, FileText, Receipt, Users } from 'lucide-react';

type FilingStatus = 'single' | 'married_joint' | 'married_separate' | 'head_household';

interface TaxBracket {
    min: number;
    max: number;
    rate: number;
}

const BRACKETS: Record<FilingStatus, TaxBracket[]> = {
    single: [
        { min: 0, max: 11600, rate: 10 },
        { min: 11600, max: 47150, rate: 12 },
        { min: 47150, max: 100525, rate: 22 },
        { min: 100525, max: 191950, rate: 24 },
        { min: 191950, max: 243725, rate: 32 },
        { min: 243725, max: 609350, rate: 35 },
        { min: 609350, max: Infinity, rate: 37 },
    ],
    married_joint: [
        { min: 0, max: 23200, rate: 10 },
        { min: 23200, max: 94300, rate: 12 },
        { min: 94300, max: 201050, rate: 22 },
        { min: 201050, max: 383900, rate: 24 },
        { min: 383900, max: 487450, rate: 32 },
        { min: 487450, max: 731200, rate: 35 },
        { min: 731200, max: Infinity, rate: 37 },
    ],
    married_separate: [
        { min: 0, max: 11600, rate: 10 },
        { min: 11600, max: 47150, rate: 12 },
        { min: 47150, max: 100525, rate: 22 },
        { min: 100525, max: 191950, rate: 24 },
        { min: 191950, max: 243725, rate: 32 },
        { min: 243725, max: 365600, rate: 35 },
        { min: 365600, max: Infinity, rate: 37 },
    ],
    head_household: [
        { min: 0, max: 16550, rate: 10 },
        { min: 16550, max: 63100, rate: 12 },
        { min: 63100, max: 100500, rate: 22 },
        { min: 100500, max: 191950, rate: 24 },
        { min: 191950, max: 243700, rate: 32 },
        { min: 243700, max: 609350, rate: 35 },
        { min: 609350, max: Infinity, rate: 37 },
    ],
};

const STANDARD_DEDUCTION: Record<FilingStatus, number> = {
    single: 14600,
    married_joint: 29200,
    married_separate: 14600,
    head_household: 21900,
};

const STATUS_LABELS: Record<FilingStatus, string> = {
    single: 'Single',
    married_joint: 'Married Filing Jointly',
    married_separate: 'Married Filing Separately',
    head_household: 'Head of Household',
};

function calculateTax(taxableIncome: number, brackets: TaxBracket[]) {
    let tax = 0;
    let marginalRate = 0;
    for (const bracket of brackets) {
        if (taxableIncome <= bracket.min) break;
        const taxable = Math.min(taxableIncome, bracket.max) - bracket.min;
        tax += taxable * (bracket.rate / 100);
        marginalRate = bracket.rate;
    }
    return { tax: Math.round(tax), marginalRate };
}

export default function TaxRefundEstimator() {
    const { formatPrice } = useCurrency();
    const [grossIncome, setGrossIncome] = useState(75000);
    const [taxWithheld, setTaxWithheld] = useState(12000);
    const [deductionType, setDeductionType] = useState<'standard' | 'itemized'>('standard');
    const [itemizedAmount, setItemizedAmount] = useState(18000);
    const [filingStatus, setFilingStatus] = useState<FilingStatus>('single');

    const result = useMemo(() => {
        const deduction = deductionType === 'standard' ? STANDARD_DEDUCTION[filingStatus] : itemizedAmount;
        const taxableIncome = Math.max(0, grossIncome - deduction);
        const { tax, marginalRate } = calculateTax(taxableIncome, BRACKETS[filingStatus]);
        const effectiveRate = grossIncome > 0 ? Math.round((tax / grossIncome) * 10000) / 100 : 0;
        const refund = taxWithheld - tax;

        return { taxableIncome, taxOwed: tax, effectiveRate, marginalRate, refund, deduction };
    }, [grossIncome, taxWithheld, deductionType, itemizedAmount, filingStatus]);

    const isRefund = result.refund >= 0;

    // Donut data
    const takeHomePct = grossIncome > 0 ? Math.round(((grossIncome - result.taxOwed) / grossIncome) * 100) : 100;
    const taxPct = 100 - takeHomePct;
    const r = 45, circ = 2 * Math.PI * r;
    const taxOffset = circ - (taxPct / 100) * circ;

    return (
        <CalculatorLayout
            title="Tax Refund Estimator"
            description="Estimate your federal tax refund or amount owed based on income, withholdings, and deductions"
            category="Taxation"
            insights={[
                { label: 'Gross Income', value: formatPrice(grossIncome) },
                { label: 'Deductions', value: formatPrice(result.deduction) },
                { label: 'Marginal Bracket', value: `${result.marginalRate}%`, color: 'text-amber-600' },
                { label: 'Effective Rate', value: `${result.effectiveRate}%`, color: 'text-blue-600' },
            ]}
            results={
                <div className="space-y-6">
                    {/* Main refund/owed display */}
                    <div className={`text-center p-6 rounded-xl ${isRefund ? 'bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-900/20 dark:to-emerald-800/10 border border-emerald-200/60 dark:border-emerald-800/40' : 'bg-gradient-to-br from-rose-50 to-rose-100/50 dark:from-rose-900/20 dark:to-rose-800/10 border border-rose-200/60 dark:border-rose-800/40'}`}>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                            {isRefund ? 'Estimated Refund' : 'Estimated Amount Owed'}
                        </p>
                        <p className={`text-4xl font-bold ${isRefund ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {formatPrice(Math.abs(result.refund))}
                        </p>
                        <p className="text-xs text-slate-500 mt-2">
                            {isRefund ? 'You overpaid — expect a refund!' : 'You underpaid — you owe additional tax.'}
                        </p>
                    </div>

                    {/* Donut chart */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-5 flex items-center gap-6">
                        <svg width="110" height="110" viewBox="0 0 110 110" className="flex-shrink-0">
                            <circle cx="55" cy="55" r={r} fill="none" stroke="currentColor" strokeWidth="10" className="text-slate-100 dark:text-slate-700" />
                            <circle cx="55" cy="55" r={r} fill="none" stroke="#ef4444" strokeWidth="10" strokeDasharray={circ} strokeDashoffset={taxOffset} strokeLinecap="round" transform="rotate(-90 55 55)" />
                            <text x="55" y="52" textAnchor="middle" className="fill-slate-900 dark:fill-white text-sm font-bold">{taxPct}%</text>
                            <text x="55" y="66" textAnchor="middle" className="fill-slate-500 text-[9px]">Tax</text>
                        </svg>
                        <div className="space-y-2 flex-1">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                                    <span className="text-xs text-slate-600 dark:text-slate-400">Take Home</span>
                                </div>
                                <span className="text-sm font-semibold text-slate-900 dark:text-white">{formatPrice(grossIncome - result.taxOwed)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-500" />
                                    <span className="text-xs text-slate-600 dark:text-slate-400">Tax Owed</span>
                                </div>
                                <span className="text-sm font-semibold text-rose-600">{formatPrice(result.taxOwed)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                                    <span className="text-xs text-slate-600 dark:text-slate-400">Withheld</span>
                                </div>
                                <span className="text-sm font-semibold text-blue-600">{formatPrice(taxWithheld)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Breakdown cards */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                            <span className="text-xs text-slate-500 dark:text-slate-400">Taxable Income</span>
                            <p className="text-lg font-semibold text-slate-900 dark:text-white">{formatPrice(result.taxableIncome)}</p>
                        </div>
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                            <span className="text-xs text-slate-500 dark:text-slate-400">Federal Tax</span>
                            <p className="text-lg font-semibold text-rose-600">{formatPrice(result.taxOwed)}</p>
                        </div>
                    </div>

                    {/* Tax bar */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4">
                        <div className="flex h-5 rounded-full overflow-hidden">
                            <div className="bg-emerald-500 transition-all" style={{ width: `${takeHomePct}%` }} />
                            <div className="bg-red-400 transition-all" style={{ width: `${taxPct}%` }} />
                        </div>
                        <div className="flex justify-between mt-2 text-[11px] text-slate-500">
                            <span>Take Home ({takeHomePct}%)</span>
                            <span>Tax ({taxPct}%)</span>
                        </div>
                    </div>
                </div>
            }
        >
            {/* Filing Status */}
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Filing Status</label>
                <select value={filingStatus} onChange={e => setFilingStatus(e.target.value as FilingStatus)}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 text-sm">
                    {Object.entries(STATUS_LABELS).map(([val, label]) => (
                        <option key={val} value={val}>{label}</option>
                    ))}
                </select>
            </div>

            {/* Gross Income */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Gross Income</label>
                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-md">{formatPrice(grossIncome)}</span>
                </div>
                <input type="number" value={grossIncome} onChange={e => setGrossIncome(Number(e.target.value))} min={0}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
                <input type="range" min={0} max={500000} step={1000} value={grossIncome} onChange={e => setGrossIncome(Number(e.target.value))} className="w-full mt-2 accent-emerald-500" />
            </div>

            {/* Tax Withheld */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Tax Withheld</label>
                    <span className="text-xs font-semibold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-md">{formatPrice(taxWithheld)}</span>
                </div>
                <input type="number" value={taxWithheld} onChange={e => setTaxWithheld(Number(e.target.value))} min={0}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
                <input type="range" min={0} max={100000} step={500} value={taxWithheld} onChange={e => setTaxWithheld(Number(e.target.value))} className="w-full mt-2 accent-blue-500" />
            </div>

            {/* Deduction Type */}
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Deduction Type</label>
                <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => setDeductionType('standard')}
                        className={`py-2.5 px-3 rounded-lg font-medium transition text-sm ${deductionType === 'standard' ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                        Standard
                    </button>
                    <button onClick={() => setDeductionType('itemized')}
                        className={`py-2.5 px-3 rounded-lg font-medium transition text-sm ${deductionType === 'itemized' ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                        Itemized
                    </button>
                </div>
                {deductionType === 'standard' && (
                    <p className="text-xs text-slate-500 mt-2">Standard: {formatPrice(STANDARD_DEDUCTION[filingStatus])}</p>
                )}
            </div>

            {deductionType === 'itemized' && (
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Itemized Deductions</label>
                        <span className="text-xs font-semibold text-amber-600 bg-amber-50 dark:bg-amber-900/30 px-2 py-0.5 rounded-md">{formatPrice(itemizedAmount)}</span>
                    </div>
                    <input type="number" value={itemizedAmount} onChange={e => setItemizedAmount(Number(e.target.value))} min={0}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
                    <input type="range" min={0} max={100000} step={500} value={itemizedAmount} onChange={e => setItemizedAmount(Number(e.target.value))} className="w-full mt-2 accent-amber-500" />
                </div>
            )}
        </CalculatorLayout>
    );
}
