'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import PriceDisplay from '@/components/common/PriceDisplay';
import { useCurrency } from '@/contexts/CurrencyContext';
import { Layers, AlertTriangle, CheckCircle, BarChart3 } from 'lucide-react';

interface Holding {
    name: string;
    weight: number;
}

interface FundEntry {
    name: string;
    holdingsRaw: string; // "AAPL 15, MSFT 12, GOOGL 10"
}

function parseHoldings(raw: string): Holding[] {
    return raw.split(',').map(s => {
        const parts = s.trim().split(/\s+/);
        const weight = parseFloat(parts[parts.length - 1]);
        const name = parts.slice(0, -1).join(' ').toUpperCase();
        if (!name || isNaN(weight)) return null;
        return { name, weight };
    }).filter(Boolean) as Holding[];
}

const DEFAULT_FUNDS: FundEntry[] = [
    { name: 'VOO', holdingsRaw: 'AAPL 7.2, MSFT 6.8, AMZN 3.4, NVDA 3.1, GOOGL 2.1, META 1.9, BRK.B 1.7, TSLA 1.5, UNH 1.3, JPM 1.2' },
    { name: 'QQQ', holdingsRaw: 'AAPL 11.3, MSFT 10.1, AMZN 5.8, NVDA 4.9, META 3.8, GOOGL 3.5, TSLA 2.9, AVGO 2.1, COST 1.8, PEP 1.5' },
];

export default function ETFOverlap() {
    const { formatPrice } = useCurrency();
    const [funds, setFunds] = useState<FundEntry[]>(DEFAULT_FUNDS);

    const updateFund = (idx: number, field: keyof FundEntry, value: string) => {
        setFunds(prev => prev.map((f, i) => i === idx ? { ...f, [field]: value } : f));
    };

    const result = useMemo(() => {
        const h1 = parseHoldings(funds[0].holdingsRaw);
        const h2 = parseHoldings(funds[1].holdingsRaw);

        const names1 = new Set(h1.map(h => h.name));
        const names2 = new Set(h2.map(h => h.name));

        const overlapping: { name: string; weight1: number; weight2: number }[] = [];
        h1.forEach(holding => {
            if (names2.has(holding.name)) {
                const match = h2.find(h => h.name === holding.name);
                overlapping.push({
                    name: holding.name,
                    weight1: holding.weight,
                    weight2: match?.weight ?? 0,
                });
            }
        });

        const overlapWeight1 = overlapping.reduce((s, o) => s + o.weight1, 0);
        const overlapWeight2 = overlapping.reduce((s, o) => s + o.weight2, 0);
        const totalOverlapPct = Math.round(((overlapWeight1 + overlapWeight2) / 2) * 100) / 100;

        const totalHoldings = new Set([...h1.map(h => h.name), ...h2.map(h => h.name)]).size;
        const uniqueToFund1 = h1.filter(h => !names2.has(h.name));
        const uniqueToFund2 = h2.filter(h => !names1.has(h.name));

        // Duplication risk score (0-100)
        const riskScore = Math.min(100, Math.round(totalOverlapPct * 1.5));

        return { overlapping, overlapWeight1, overlapWeight2, totalOverlapPct, totalHoldings, uniqueToFund1, uniqueToFund2, riskScore, h1, h2 };
    }, [funds]);

    // Donut: overlap vs unique
    const overlapPct = result.totalHoldings > 0 ? Math.round((result.overlapping.length / result.totalHoldings) * 100) : 0;
    const uniquePct = 100 - overlapPct;
    const r = 42, circ = 2 * Math.PI * r;
    const overlapOffset = circ - (overlapPct / 100) * circ;

    const riskColor = result.riskScore >= 70 ? 'text-rose-600' : result.riskScore >= 40 ? 'text-amber-600' : 'text-emerald-600';
    const riskBg = result.riskScore >= 70 ? 'from-rose-50 to-rose-100/50 dark:from-rose-900/20 dark:to-rose-800/10 border-rose-200/60 dark:border-rose-800/40' : result.riskScore >= 40 ? 'from-amber-50 to-amber-100/50 dark:from-amber-900/20 dark:to-amber-800/10 border-amber-200/60 dark:border-amber-800/40' : 'from-emerald-50 to-emerald-100/50 dark:from-emerald-900/20 dark:to-emerald-800/10 border-emerald-200/60 dark:border-emerald-800/40';

    return (
        <CalculatorLayout
            title="ETF Overlap Analyzer"
            description="Detect overlapping holdings between ETFs and funds to avoid unintended concentration"
            category="Portfolio Analysis"
            insights={[
                { label: 'Overlapping Holdings', value: `${result.overlapping.length}` },
                { label: 'Total Overlap %', value: `${result.totalOverlapPct}%`, color: result.totalOverlapPct > 30 ? 'text-rose-600' : 'text-emerald-600' },
                { label: 'Unique Holdings', value: `${result.totalHoldings - result.overlapping.length}` },
                { label: 'Risk Score', value: `${result.riskScore}/100`, color: riskColor },
            ]}
            results={
                <div className="space-y-6">
                    {/* Risk score verdict */}
                    <div className={`text-center p-6 rounded-xl bg-gradient-to-br ${riskBg} border`}>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Duplication Risk Score</p>
                        <p className={`text-4xl font-bold ${riskColor}`}>{result.riskScore}/100</p>
                        <p className="text-xs text-slate-500 mt-2">
                            {result.riskScore >= 70 ? 'High duplication — consider diversifying across different sectors' : result.riskScore >= 40 ? 'Moderate overlap — some concentration risk exists' : 'Low overlap — good diversification between funds'}
                        </p>
                    </div>

                    {/* Donut */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 flex items-center gap-5">
                        <svg width="100" height="100" viewBox="0 0 100 100" className="flex-shrink-0">
                            <circle cx="50" cy="50" r={r} fill="none" stroke="currentColor" strokeWidth="8" className="text-slate-100 dark:text-slate-700" />
                            <circle cx="50" cy="50" r={r} fill="none" stroke="#f59e0b" strokeWidth="8" strokeDasharray={circ} strokeDashoffset={overlapOffset} strokeLinecap="round" transform="rotate(-90 50 50)" />
                            <text x="50" y="48" textAnchor="middle" className="fill-slate-900 dark:fill-white text-sm font-bold">{overlapPct}%</text>
                            <text x="50" y="62" textAnchor="middle" className="fill-slate-500 text-[9px]">Overlap</text>
                        </svg>
                        <div className="space-y-2 flex-1">
                            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Holdings Breakdown</p>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-500" /><span className="text-xs text-slate-600 dark:text-slate-400">Overlapping</span></div>
                                <span className="text-sm font-semibold text-slate-900 dark:text-white">{result.overlapping.length} holdings</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-slate-400" /><span className="text-xs text-slate-600 dark:text-slate-400">Unique</span></div>
                                <span className="text-sm font-semibold text-slate-900 dark:text-white">{result.totalHoldings - result.overlapping.length} holdings</span>
                            </div>
                        </div>
                    </div>

                    {/* Overlapping holdings table */}
                    {result.overlapping.length > 0 && (
                        <div className="bg-white dark:bg-slate-800 rounded-xl p-4">
                            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Overlapping Holdings</p>
                            <div className="space-y-2">
                                <div className="flex items-center text-[10px] text-slate-400 uppercase tracking-wider font-semibold px-1">
                                    <span className="flex-1">Holding</span>
                                    <span className="w-20 text-right">{funds[0].name}</span>
                                    <span className="w-20 text-right">{funds[1].name}</span>
                                </div>
                                {result.overlapping.sort((a, b) => (b.weight1 + b.weight2) - (a.weight1 + a.weight2)).map((o, i) => (
                                    <div key={i} className="flex items-center px-2 py-1.5 rounded-lg bg-amber-50/50 dark:bg-amber-900/10">
                                        <span className="flex-1 text-xs font-semibold text-slate-800 dark:text-white">{o.name}</span>
                                        <span className="w-20 text-right text-xs text-slate-600 dark:text-slate-400">{o.weight1}%</span>
                                        <span className="w-20 text-right text-xs text-slate-600 dark:text-slate-400">{o.weight2}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Bar visualization */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4">
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Overlap Weight by Fund</p>
                        <div className="space-y-3">
                            <div>
                                <div className="flex justify-between text-xs mb-1.5">
                                    <span className="text-slate-600 dark:text-slate-400">{funds[0].name}</span>
                                    <span className="font-semibold text-slate-900 dark:text-white">{result.overlapWeight1.toFixed(1)}% overlapping</span>
                                </div>
                                <div className="h-5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                    <div className="h-full bg-amber-400 transition-all rounded-full" style={{ width: `${Math.min(result.overlapWeight1, 100)}%` }} />
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-xs mb-1.5">
                                    <span className="text-slate-600 dark:text-slate-400">{funds[1].name}</span>
                                    <span className="font-semibold text-slate-900 dark:text-white">{result.overlapWeight2.toFixed(1)}% overlapping</span>
                                </div>
                                <div className="h-5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                    <div className="h-full bg-orange-400 transition-all rounded-full" style={{ width: `${Math.min(result.overlapWeight2, 100)}%` }} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            }
        >
            {funds.map((fund, idx) => (
                <div key={idx} className="space-y-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Fund {idx + 1}</label>
                        <span className="text-xs font-semibold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-md">{fund.name}</span>
                    </div>
                    <div>
                        <span className="text-xs text-slate-500 mb-1 block">Fund Name / Ticker</span>
                        <input type="text" value={fund.name} onChange={e => updateFund(idx, 'name', e.target.value)} placeholder="e.g. VOO"
                            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 text-sm" />
                    </div>
                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-slate-500">Top Holdings (Name Weight%)</span>
                            <span className="text-xs font-semibold text-slate-600 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-md">{parseHoldings(fund.holdingsRaw).length} holdings</span>
                        </div>
                        <textarea value={fund.holdingsRaw} onChange={e => updateFund(idx, 'holdingsRaw', e.target.value)} placeholder="AAPL 7.2, MSFT 6.8, AMZN 3.4" rows={3}
                            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 text-sm font-mono" />
                        <p className="text-[10px] text-slate-500 mt-1">Format: TICKER WEIGHT%, separated by commas</p>
                    </div>
                </div>
            ))}
        </CalculatorLayout>
    );
}
