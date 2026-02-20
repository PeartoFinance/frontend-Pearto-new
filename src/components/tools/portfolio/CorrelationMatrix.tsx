'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import PriceDisplay from '@/components/common/PriceDisplay';
import { useCurrency } from '@/contexts/CurrencyContext';
import { Grid3X3, TrendingUp, Shield, AlertTriangle } from 'lucide-react';

interface AssetEntry {
    name: string;
    returns: string; // comma-separated monthly returns
}

const DEFAULT_ASSETS: AssetEntry[] = [
    { name: 'SPY', returns: '2.1,1.5,-0.8,3.2,0.4,-1.2,2.8,1.1,-0.5,1.9,0.7,2.3' },
    { name: 'BND', returns: '0.3,-0.1,0.5,0.2,0.4,0.6,-0.2,0.3,0.5,0.1,0.4,0.2' },
    { name: 'GLD', returns: '-0.5,1.8,2.1,-1.0,0.9,1.5,-0.3,0.6,1.2,-0.8,1.1,0.4' },
];

function parseReturns(s: string): number[] {
    return s.split(',').map(v => parseFloat(v.trim())).filter(v => !isNaN(v));
}

function mean(arr: number[]): number {
    return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function correlation(a: number[], b: number[]): number {
    const len = Math.min(a.length, b.length);
    if (len < 2) return 0;
    const ax = a.slice(0, len), bx = b.slice(0, len);
    const ma = mean(ax), mb = mean(bx);
    let num = 0, da = 0, db = 0;
    for (let i = 0; i < len; i++) {
        const diffA = ax[i] - ma, diffB = bx[i] - mb;
        num += diffA * diffB;
        da += diffA * diffA;
        db += diffB * diffB;
    }
    const denom = Math.sqrt(da * db);
    return denom === 0 ? 0 : num / denom;
}

function corrColor(v: number): string {
    if (v >= 0.7) return 'bg-red-500 text-white';
    if (v >= 0.3) return 'bg-orange-400 text-white';
    if (v >= -0.3) return 'bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-white';
    if (v >= -0.7) return 'bg-blue-400 text-white';
    return 'bg-blue-600 text-white';
}

export default function CorrelationMatrix() {
    const { formatPrice } = useCurrency();
    const [assets, setAssets] = useState<AssetEntry[]>(DEFAULT_ASSETS);

    const updateAsset = (idx: number, field: keyof AssetEntry, value: string) => {
        setAssets(prev => prev.map((a, i) => i === idx ? { ...a, [field]: value } : a));
    };

    const addAsset = () => {
        if (assets.length < 6) setAssets(prev => [...prev, { name: `Asset ${prev.length + 1}`, returns: '' }]);
    };

    const removeAsset = (idx: number) => {
        if (assets.length > 2) setAssets(prev => prev.filter((_, i) => i !== idx));
    };

    const result = useMemo(() => {
        const parsed = assets.map(a => ({ name: a.name, data: parseReturns(a.returns) }));
        const n = parsed.length;
        const matrix: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                matrix[i][j] = i === j ? 1 : correlation(parsed[i].data, parsed[j].data);
            }
        }

        // Average absolute off-diagonal correlation
        let sumAbs = 0, count = 0;
        for (let i = 0; i < n; i++) {
            for (let j = i + 1; j < n; j++) {
                sumAbs += Math.abs(matrix[i][j]);
                count++;
            }
        }
        const avgCorr = count > 0 ? sumAbs / count : 0;

        // Find most and least correlated pair
        let maxCorr = -2, minCorr = 2;
        let maxPair = '', minPair = '';
        for (let i = 0; i < n; i++) {
            for (let j = i + 1; j < n; j++) {
                if (matrix[i][j] > maxCorr) { maxCorr = matrix[i][j]; maxPair = `${parsed[i].name} & ${parsed[j].name}`; }
                if (matrix[i][j] < minCorr) { minCorr = matrix[i][j]; minPair = `${parsed[i].name} & ${parsed[j].name}`; }
            }
        }

        const diversificationScore = Math.round((1 - avgCorr) * 100);

        return { parsed, matrix, avgCorr, maxCorr, minCorr, maxPair, minPair, diversificationScore };
    }, [assets]);

    const n = result.parsed.length;

    return (
        <CalculatorLayout
            title="Correlation Matrix"
            description="Analyze correlations between asset returns to evaluate portfolio diversification"
            category="Portfolio Analysis"
            insights={[
                { label: 'Diversification Score', value: `${result.diversificationScore}/100`, color: result.diversificationScore >= 60 ? 'text-emerald-600' : 'text-amber-600' },
                { label: 'Avg |Correlation|', value: result.avgCorr.toFixed(2) },
                { label: 'Most Correlated', value: `${result.maxCorr.toFixed(2)}`, color: 'text-rose-600' },
                { label: 'Least Correlated', value: `${result.minCorr.toFixed(2)}`, color: 'text-blue-600' },
            ]}
            results={
                <div className="space-y-6">
                    {/* Diversification verdict */}
                    <div className={`text-center p-6 rounded-xl ${result.diversificationScore >= 60 ? 'bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-900/20 dark:to-emerald-800/10 border border-emerald-200/60 dark:border-emerald-800/40' : 'bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-900/20 dark:to-amber-800/10 border border-amber-200/60 dark:border-amber-800/40'}`}>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Diversification Score</p>
                        <p className={`text-4xl font-bold ${result.diversificationScore >= 60 ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {result.diversificationScore}/100
                        </p>
                        <p className="text-xs text-slate-500 mt-2">
                            {result.diversificationScore >= 70 ? 'Excellent diversification — low average correlation' : result.diversificationScore >= 40 ? 'Moderate diversification — some overlap exists' : 'Poor diversification — assets move together'}
                        </p>
                    </div>

                    {/* Heatmap */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4">
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Correlation Heatmap</p>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr>
                                        <th className="text-xs text-slate-500 p-1" />
                                        {result.parsed.map((a, i) => (
                                            <th key={i} className="text-xs font-semibold text-slate-700 dark:text-slate-300 p-1 text-center truncate max-w-[60px]">{a.name}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {result.parsed.map((row, i) => (
                                        <tr key={i}>
                                            <td className="text-xs font-semibold text-slate-700 dark:text-slate-300 p-1 truncate max-w-[60px]">{row.name}</td>
                                            {result.matrix[i].map((val, j) => (
                                                <td key={j} className="p-1 text-center">
                                                    <div className={`rounded-md py-1.5 px-1 text-xs font-bold ${i === j ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900' : corrColor(val)}`}>
                                                        {val.toFixed(2)}
                                                    </div>
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {/* Legend */}
                        <div className="flex flex-wrap gap-2 mt-3 text-[10px] text-slate-500">
                            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-blue-600 inline-block" /> Strong Negative</span>
                            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-blue-400 inline-block" /> Negative</span>
                            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-slate-200 dark:bg-slate-600 inline-block" /> Neutral</span>
                            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-orange-400 inline-block" /> Positive</span>
                            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-red-500 inline-block" /> Strong Positive</span>
                        </div>
                    </div>

                    {/* Key pairs */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white dark:bg-slate-800 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <AlertTriangle size={14} className="text-rose-500" />
                                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Most Correlated</p>
                            </div>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">{result.maxPair}</p>
                            <p className="text-lg font-bold text-rose-600">{result.maxCorr.toFixed(2)}</p>
                        </div>
                        <div className="bg-white dark:bg-slate-800 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Shield size={14} className="text-blue-500" />
                                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Least Correlated</p>
                            </div>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">{result.minPair}</p>
                            <p className="text-lg font-bold text-blue-600">{result.minCorr.toFixed(2)}</p>
                        </div>
                    </div>
                </div>
            }
        >
            {assets.map((asset, idx) => (
                <div key={idx} className="space-y-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Asset {idx + 1}</label>
                        {assets.length > 2 && (
                            <button onClick={() => removeAsset(idx)} className="text-xs text-rose-500 hover:text-rose-700">Remove</button>
                        )}
                    </div>
                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-slate-500">Name</span>
                            <span className="text-xs font-semibold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-md">{asset.name}</span>
                        </div>
                        <input type="text" value={asset.name} onChange={e => updateAsset(idx, 'name', e.target.value)} placeholder="e.g. SPY"
                            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 text-sm" />
                    </div>
                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-slate-500">Monthly Returns (%)</span>
                            <span className="text-xs font-semibold text-slate-600 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-md">{parseReturns(asset.returns).length} pts</span>
                        </div>
                        <textarea value={asset.returns} onChange={e => updateAsset(idx, 'returns', e.target.value)} placeholder="e.g. 2.1,1.5,-0.8,3.2" rows={2}
                            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 text-sm font-mono" />
                    </div>
                </div>
            ))}
            {assets.length < 6 && (
                <button onClick={addAsset} className="w-full py-2.5 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 text-sm text-slate-500 hover:border-emerald-400 hover:text-emerald-600 transition-colors">
                    + Add Asset
                </button>
            )}
        </CalculatorLayout>
    );
}
