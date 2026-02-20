'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import { useCurrency } from '@/contexts/CurrencyContext';
import { DollarSign, Plus, Trash2, Snowflake, TrendingDown } from 'lucide-react';

interface Debt {
    id: number;
    name: string;
    balance: number;
    rate: number;
    minPayment: number;
}

interface StrategyResult {
    totalInterest: number;
    totalMonths: number;
    payoffOrder: string[];
    monthlyBreakdown: { month: number; totalBalance: number }[];
}

function simulatePayoff(debts: Debt[], extraPayment: number, sortFn: (a: Debt, b: Debt) => number): StrategyResult {
    if (debts.length === 0) return { totalInterest: 0, totalMonths: 0, payoffOrder: [], monthlyBreakdown: [] };

    const balances = debts.map(d => ({ ...d, currentBalance: d.balance }));
    const sorted = [...balances].sort((a, b) => sortFn(a, b));
    let totalInterest = 0;
    let month = 0;
    const maxMonths = 600;
    const payoffOrder: string[] = [];
    const monthlyBreakdown: { month: number; totalBalance: number }[] = [];

    while (sorted.some(d => d.currentBalance > 0) && month < maxMonths) {
        month++;
        let remainingExtra = extraPayment;

        // Apply interest to all debts
        for (const debt of sorted) {
            if (debt.currentBalance <= 0) continue;
            const interest = debt.currentBalance * (debt.rate / 100 / 12);
            totalInterest += interest;
            debt.currentBalance += interest;
        }

        // Make minimum payments
        for (const debt of sorted) {
            if (debt.currentBalance <= 0) continue;
            const payment = Math.min(debt.minPayment, debt.currentBalance);
            debt.currentBalance -= payment;
            if (debt.currentBalance <= 0) {
                debt.currentBalance = 0;
                payoffOrder.push(debt.name);
                remainingExtra += debt.minPayment;
            }
        }

        // Apply extra payment to target debt
        for (const debt of sorted) {
            if (debt.currentBalance <= 0 || remainingExtra <= 0) continue;
            const payment = Math.min(remainingExtra, debt.currentBalance);
            debt.currentBalance -= payment;
            remainingExtra -= payment;
            if (debt.currentBalance <= 0) {
                debt.currentBalance = 0;
                if (!payoffOrder.includes(debt.name)) payoffOrder.push(debt.name);
                remainingExtra += debt.minPayment;
            }
        }

        if (month % 3 === 0 || !sorted.some(d => d.currentBalance > 0)) {
            monthlyBreakdown.push({ month, totalBalance: sorted.reduce((s, d) => s + Math.max(0, d.currentBalance), 0) });
        }
    }

    return { totalInterest: Math.round(totalInterest), totalMonths: month, payoffOrder, monthlyBreakdown };
}

let nextId = 3;

export default function DebtSnowballAvalanche() {
    const { formatPrice } = useCurrency();
    const [debts, setDebts] = useState<Debt[]>([
        { id: 1, name: 'Credit Card', balance: 5000, rate: 22, minPayment: 150 },
        { id: 2, name: 'Car Loan', balance: 12000, rate: 6, minPayment: 300 },
    ]);
    const [extraPayment, setExtraPayment] = useState(200);

    const addDebt = () => {
        setDebts([...debts, { id: nextId++, name: `Debt ${debts.length + 1}`, balance: 3000, rate: 10, minPayment: 100 }]);
    };

    const removeDebt = (id: number) => {
        if (debts.length > 1) setDebts(debts.filter(d => d.id !== id));
    };

    const updateDebt = (id: number, field: keyof Debt, value: string | number) => {
        setDebts(debts.map(d => d.id === id ? { ...d, [field]: field === 'name' ? value : Number(value) } : d));
    };

    const snowball = useMemo(() => simulatePayoff(debts, extraPayment, (a, b) => a.balance - b.balance), [debts, extraPayment]);
    const avalanche = useMemo(() => simulatePayoff(debts, extraPayment, (a, b) => b.rate - a.rate), [debts, extraPayment]);

    const interestSaved = snowball.totalInterest - avalanche.totalInterest;
    const monthsSaved = snowball.totalMonths - avalanche.totalMonths;
    const totalDebt = debts.reduce((s, d) => s + d.balance, 0);

    const snowballPct = totalDebt > 0 ? Math.round((snowball.totalInterest / (totalDebt + snowball.totalInterest)) * 100) : 0;
    const avalanchePct = totalDebt > 0 ? Math.round((avalanche.totalInterest / (totalDebt + avalanche.totalInterest)) * 100) : 0;

    return (
        <CalculatorLayout
            title="Debt Snowball vs Avalanche"
            description="Compare debt payoff strategies — smallest balance first vs highest rate first"
            category="Debt"
            insights={[
                { label: 'Total Debt', value: formatPrice(totalDebt), color: 'text-rose-600' },
                { label: 'Interest Saved (Avalanche)', value: interestSaved > 0 ? formatPrice(interestSaved) : formatPrice(Math.abs(interestSaved)), color: interestSaved > 0 ? 'text-rose-600' : 'text-emerald-600' },
                { label: 'Months Diff', value: `${Math.abs(monthsSaved)} months`, color: 'text-blue-600' },
                { label: 'Extra / Month', value: formatPrice(extraPayment), color: 'text-emerald-600' },
            ]}
            results={
                <div className="space-y-6">
                    {/* Side-by-side strategy comparison */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* Snowball */}
                        <div className="p-5 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 rounded-xl border border-blue-200/60 dark:border-blue-800/40">
                            <div className="flex items-center gap-2 mb-3">
                                <Snowflake size={16} className="text-blue-600" />
                                <span className="text-sm font-bold text-blue-700 dark:text-blue-400">Snowball</span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Payoff Time</p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                {Math.floor(snowball.totalMonths / 12)}y {snowball.totalMonths % 12}m
                            </p>
                            <p className="text-xs text-slate-500 mt-2">Total Interest</p>
                            <p className="text-lg font-semibold text-rose-600">{formatPrice(snowball.totalInterest)}</p>
                        </div>
                        {/* Avalanche */}
                        <div className="p-5 bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-900/20 dark:to-emerald-800/10 rounded-xl border border-emerald-200/60 dark:border-emerald-800/40">
                            <div className="flex items-center gap-2 mb-3">
                                <TrendingDown size={16} className="text-emerald-600" />
                                <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">Avalanche</span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Payoff Time</p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                {Math.floor(avalanche.totalMonths / 12)}y {avalanche.totalMonths % 12}m
                            </p>
                            <p className="text-xs text-slate-500 mt-2">Total Interest</p>
                            <p className="text-lg font-semibold text-rose-600">{formatPrice(avalanche.totalInterest)}</p>
                        </div>
                    </div>

                    {/* Donut Chart Comparison */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4">
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wider">Interest as % of Total Paid</p>
                        <div className="flex items-center justify-around">
                            {[{ label: 'Snowball', pct: snowballPct, color: '#3b82f6' }, { label: 'Avalanche', pct: avalanchePct, color: '#10b981' }].map(s => {
                                const r = 40, circ = 2 * Math.PI * r, offset = circ - (s.pct / 100) * circ;
                                return (
                                    <div key={s.label} className="flex flex-col items-center">
                                        <svg width="100" height="100" viewBox="0 0 100 100">
                                            <circle cx="50" cy="50" r={r} fill="none" stroke="currentColor" strokeWidth="8" className="text-slate-100 dark:text-slate-700" />
                                            <circle cx="50" cy="50" r={r} fill="none" stroke={s.color} strokeWidth="8" strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" transform="rotate(-90 50 50)" />
                                            <text x="50" y="54" textAnchor="middle" className="fill-slate-900 dark:fill-white text-sm font-bold">{s.pct}%</text>
                                        </svg>
                                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400 mt-1">{s.label}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Payoff Order */}
                    <div className="grid grid-cols-2 gap-4">
                        {[{ title: 'Snowball Order', data: snowball.payoffOrder, color: 'bg-blue-500' }, { title: 'Avalanche Order', data: avalanche.payoffOrder, color: 'bg-emerald-500' }].map(s => (
                            <div key={s.title} className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">{s.title}</p>
                                <div className="space-y-1.5">
                                    {s.data.map((name, i) => (
                                        <div key={i} className="flex items-center gap-2 text-xs">
                                            <span className={`w-5 h-5 rounded-full ${s.color} text-white flex items-center justify-center text-[10px] font-bold`}>{i + 1}</span>
                                            <span className="text-slate-700 dark:text-slate-300">{name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            }
        >
            {/* Debt entries */}
            {debts.map((debt, idx) => (
                <div key={debt.id} className="p-3 bg-slate-50 dark:bg-slate-700/30 rounded-lg space-y-2.5">
                    <div className="flex items-center justify-between">
                        <input type="text" value={debt.name} onChange={e => updateDebt(debt.id, 'name', e.target.value)}
                            className="text-sm font-semibold bg-transparent border-none outline-none text-slate-800 dark:text-white w-32" />
                        {debts.length > 1 && (
                            <button onClick={() => removeDebt(debt.id)} className="p-1 text-slate-400 hover:text-rose-500 transition">
                                <Trash2 size={14} />
                            </button>
                        )}
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        <div>
                            <label className="text-[10px] text-slate-500 dark:text-slate-400">Balance</label>
                            <input type="number" value={debt.balance} onChange={e => updateDebt(debt.id, 'balance', e.target.value)} min={0}
                                className="w-full px-2 py-1.5 text-xs rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-1 focus:ring-emerald-500" />
                        </div>
                        <div>
                            <label className="text-[10px] text-slate-500 dark:text-slate-400">Rate %</label>
                            <input type="number" value={debt.rate} onChange={e => updateDebt(debt.id, 'rate', e.target.value)} min={0} max={50} step={0.5}
                                className="w-full px-2 py-1.5 text-xs rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-1 focus:ring-emerald-500" />
                        </div>
                        <div>
                            <label className="text-[10px] text-slate-500 dark:text-slate-400">Min Pay</label>
                            <input type="number" value={debt.minPayment} onChange={e => updateDebt(debt.id, 'minPayment', e.target.value)} min={0}
                                className="w-full px-2 py-1.5 text-xs rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-1 focus:ring-emerald-500" />
                        </div>
                    </div>
                </div>
            ))}

            <button onClick={addDebt}
                className="w-full py-2 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 text-slate-500 hover:border-emerald-400 hover:text-emerald-600 transition flex items-center justify-center gap-1.5 text-xs font-medium">
                <Plus size={14} /> Add Debt
            </button>

            <div>
                <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Extra Monthly Payment</label>
                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-md">{formatPrice(extraPayment)}</span>
                </div>
                <input type="number" value={extraPayment} onChange={e => setExtraPayment(Number(e.target.value))} min={0}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
                <input type="range" min={0} max={2000} step={25} value={extraPayment} onChange={e => setExtraPayment(Number(e.target.value))} className="w-full mt-2 accent-emerald-500" />
            </div>
        </CalculatorLayout>
    );
}
