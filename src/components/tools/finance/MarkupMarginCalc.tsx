'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import { useCurrency } from '@/contexts/CurrencyContext';
import { DollarSign, Percent, ArrowUpDown } from 'lucide-react';

type CalcMode = 'from_prices' | 'from_markup' | 'from_margin';

export default function MarkupMarginCalc() {
    const { formatPrice } = useCurrency();
    const [mode, setMode] = useState<CalcMode>('from_prices');
    const [costPrice, setCostPrice] = useState(50);
    const [sellingPrice, setSellingPrice] = useState(80);
    const [markupPct, setMarkupPct] = useState(60);
    const [marginPct, setMarginPct] = useState(37.5);

    const result = useMemo(() => {
        let cost = costPrice;
        let sell = sellingPrice;
        let markup = 0;
        let margin = 0;
        let profit = 0;

        if (mode === 'from_prices') {
            profit = sell - cost;
            markup = cost > 0 ? (profit / cost) * 100 : 0;
            margin = sell > 0 ? (profit / sell) * 100 : 0;
        } else if (mode === 'from_markup') {
            sell = cost * (1 + markupPct / 100);
            profit = sell - cost;
            markup = markupPct;
            margin = sell > 0 ? (profit / sell) * 100 : 0;
        } else {
            sell = marginPct < 100 ? cost / (1 - marginPct / 100) : 0;
            profit = sell - cost;
            markup = cost > 0 ? (profit / cost) * 100 : 0;
            margin = marginPct;
        }

        return {
            cost: Math.round(cost * 100) / 100,
            sellingPrice: Math.round(sell * 100) / 100,
            profit: Math.round(profit * 100) / 100,
            markup: Math.round(markup * 100) / 100,
            margin: Math.round(margin * 100) / 100,
        };
    }, [mode, costPrice, sellingPrice, markupPct, marginPct]);

    // Donut: cost vs profit portion of selling price
    const costPct = result.sellingPrice > 0 ? Math.round((result.cost / result.sellingPrice) * 100) : 100;
    const profitPct = 100 - costPct;
    const r = 42, circ = 2 * Math.PI * r;
    const profitOffset = circ - (profitPct / 100) * circ;

    // Bar chart comparison
    const maxVal = Math.max(result.markup, result.margin, 1);

    return (
        <CalculatorLayout
            title="Markup & Margin Calculator"
            description="Calculate markup percentage, profit margin, and profit amount from cost and selling price"
            category="Business Operations"
            insights={[
                { label: 'Cost Price', value: formatPrice(result.cost) },
                { label: 'Selling Price', value: formatPrice(result.sellingPrice), color: 'text-blue-600' },
                { label: 'Markup', value: `${result.markup}%`, color: 'text-emerald-600' },
                { label: 'Margin', value: `${result.margin}%`, color: 'text-violet-600' },
            ]}
            results={
                <div className="space-y-6">
                    {/* Hero card */}
                    <div className="text-center p-6 bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-900/20 dark:to-emerald-800/10 rounded-xl border border-emerald-200/60 dark:border-emerald-800/40">
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Profit</p>
                        <p className="text-4xl font-bold text-emerald-600">{formatPrice(result.profit)}</p>
                        <p className="text-xs text-slate-500 mt-2">per unit sold</p>
                    </div>

                    {/* Donut chart */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 flex items-center gap-5">
                        <svg width="100" height="100" viewBox="0 0 100 100" className="flex-shrink-0">
                            <circle cx="50" cy="50" r={r} fill="none" stroke="currentColor" strokeWidth="8" className="text-slate-100 dark:text-slate-700" />
                            <circle cx="50" cy="50" r={r} fill="none" stroke="#10b981" strokeWidth="8" strokeDasharray={circ} strokeDashoffset={profitOffset} strokeLinecap="round" transform="rotate(-90 50 50)" />
                            <text x="50" y="48" textAnchor="middle" className="fill-slate-900 dark:fill-white text-sm font-bold">{profitPct}%</text>
                            <text x="50" y="62" textAnchor="middle" className="fill-slate-500 text-[9px]">Profit</text>
                        </svg>
                        <div className="space-y-2 flex-1">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-slate-400" /><span className="text-xs text-slate-600 dark:text-slate-400">Cost</span></div>
                                <span className="text-sm font-semibold text-slate-900 dark:text-white">{formatPrice(result.cost)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500" /><span className="text-xs text-slate-600 dark:text-slate-400">Profit</span></div>
                                <span className="text-sm font-semibold text-emerald-600">{formatPrice(result.profit)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Breakdown cards */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                            <span className="text-xs text-slate-500 dark:text-slate-400">Selling Price</span>
                            <p className="text-lg font-semibold text-blue-600">{formatPrice(result.sellingPrice)}</p>
                        </div>
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                            <span className="text-xs text-slate-500 dark:text-slate-400">Markup %</span>
                            <p className="text-lg font-semibold text-emerald-600">{result.markup}%</p>
                        </div>
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                            <span className="text-xs text-slate-500 dark:text-slate-400">Margin %</span>
                            <p className="text-lg font-semibold text-violet-600">{result.margin}%</p>
                        </div>
                    </div>

                    {/* Bar chart comparison */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4">
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Markup vs Margin</p>
                        <div className="space-y-3">
                            <div>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-slate-600 dark:text-slate-400">Markup</span>
                                    <span className="font-semibold text-emerald-600">{result.markup}%</span>
                                </div>
                                <div className="h-4 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${Math.min(100, (result.markup / maxVal) * 100)}%` }} />
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-slate-600 dark:text-slate-400">Margin</span>
                                    <span className="font-semibold text-violet-600">{result.margin}%</span>
                                </div>
                                <div className="h-4 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                    <div className="h-full bg-violet-500 rounded-full transition-all" style={{ width: `${Math.min(100, (result.margin / maxVal) * 100)}%` }} />
                                </div>
                            </div>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-3">Markup is always ≥ margin for the same cost/sell pair.</p>
                    </div>
                </div>
            }
        >
            {/* Mode selector */}
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Calculate From</label>
                <div className="grid grid-cols-3 gap-1.5">
                    {([['from_prices', 'Prices'], ['from_markup', 'Markup %'], ['from_margin', 'Margin %']] as [CalcMode, string][]).map(([m, label]) => (
                        <button key={m} onClick={() => setMode(m)}
                            className={`py-2 px-2 rounded-lg font-medium transition text-xs ${mode === m ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Cost Price — always shown */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Cost Price</label>
                    <span className="text-xs font-semibold text-slate-600 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-md">{formatPrice(costPrice)}</span>
                </div>
                <input type="number" value={costPrice} onChange={e => setCostPrice(Number(e.target.value))} min={0} step={0.01}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
                <input type="range" min={0} max={1000} step={1} value={costPrice} onChange={e => setCostPrice(Number(e.target.value))} className="w-full mt-2 accent-emerald-500" />
            </div>

            {mode === 'from_prices' && (
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Selling Price</label>
                        <span className="text-xs font-semibold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-md">{formatPrice(sellingPrice)}</span>
                    </div>
                    <input type="number" value={sellingPrice} onChange={e => setSellingPrice(Number(e.target.value))} min={0} step={0.01}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
                    <input type="range" min={0} max={2000} step={1} value={sellingPrice} onChange={e => setSellingPrice(Number(e.target.value))} className="w-full mt-2 accent-blue-500" />
                </div>
            )}

            {mode === 'from_markup' && (
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Markup %</label>
                        <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-md">{markupPct}%</span>
                    </div>
                    <input type="number" value={markupPct} onChange={e => setMarkupPct(Number(e.target.value))} min={0} max={500} step={0.5}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
                    <input type="range" min={0} max={300} step={1} value={markupPct} onChange={e => setMarkupPct(Number(e.target.value))} className="w-full mt-2 accent-emerald-500" />
                </div>
            )}

            {mode === 'from_margin' && (
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Margin %</label>
                        <span className="text-xs font-semibold text-violet-600 bg-violet-50 dark:bg-violet-900/30 px-2 py-0.5 rounded-md">{marginPct}%</span>
                    </div>
                    <input type="number" value={marginPct} onChange={e => setMarginPct(Number(e.target.value))} min={0} max={99.9} step={0.5}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500" />
                    <input type="range" min={0} max={99} step={0.5} value={marginPct} onChange={e => setMarginPct(Number(e.target.value))} className="w-full mt-2 accent-violet-500" />
                </div>
            )}
        </CalculatorLayout>
    );
}
