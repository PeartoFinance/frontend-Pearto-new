'use client';

import { useState, useEffect } from 'react';
import { Target, PieChart, Save, AlertTriangle } from 'lucide-react';
import { getInvestmentGoals, updateInvestmentGoals, type InvestmentGoals } from '@/services/portfolioService';

interface GoalSettingProps {
    onComplete?: () => void;
    initialGoals?: InvestmentGoals;
    variant?: 'card' | 'clean';
}

export default function GoalSetting({ onComplete, initialGoals, variant = 'card' }: GoalSettingProps) {
    const [goals, setGoals] = useState<InvestmentGoals>({
        target_stocks_percent: 60,
        target_bonds_percent: 20,
        target_cash_percent: 10,
        target_crypto_percent: 5,
        target_commodities_percent: 5,
        risk_tolerance: 'moderate',
        benchmark_symbol: '^GSPC',
        ...initialGoals
    });
    const [loading, setLoading] = useState(!initialGoals);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!initialGoals) {
            loadGoals();
        }
    }, [initialGoals]);

    const loadGoals = async () => {
        try {
            const data = await getInvestmentGoals();
            setGoals(data);
        } catch (err) {
            console.error('Failed to load goals:', err);
        } finally {
            setLoading(false);
        }
    };

    const totalAllocation =
        goals.target_stocks_percent +
        goals.target_bonds_percent +
        goals.target_cash_percent +
        goals.target_crypto_percent +
        goals.target_commodities_percent;

    const handleChange = (field: keyof InvestmentGoals, value: any) => {
        setGoals(prev => ({ ...prev, [field]: value }));
        setError(null);
    };

    const handleSave = async () => {
        if (totalAllocation !== 100) {
            setError(`Total allocation must equal 100%. Current: ${totalAllocation}%`);
            return;
        }

        setSaving(true);
        try {
            await updateInvestmentGoals(goals);
            if (onComplete) onComplete();
        } catch (err: any) {
            setError(err.message || 'Failed to save goals');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="text-center py-10">Loading goals...</div>;

    const containerClasses = variant === 'card'
        ? "bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 max-w-2xl mx-auto shadow-sm"
        : "max-w-2xl mx-auto p-6";

    return (
        <div className={containerClasses}>
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-emerald-500/10 rounded-xl">
                    <Target className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Investment Strategy</h2>
                    <p className="text-sm text-gray-500 dark:text-slate-400">Define your target allocation and risk profile.</p>
                </div>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500 text-sm">
                    <AlertTriangle size={18} />
                    {error}
                </div>
            )}

            <div className="space-y-8">
                {/* Target Allocation */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <PieChart size={18} className="text-gray-400" /> Target Allocation
                        </h3>
                        <span className={`text-sm font-bold ${totalAllocation === 100 ? 'text-emerald-500' : 'text-amber-500'}`}>
                            Total: {totalAllocation}%
                        </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <AllocationInput
                            label="Stocks"
                            color="bg-blue-500"
                            value={goals.target_stocks_percent}
                            onChange={(v) => handleChange('target_stocks_percent', v)}
                        />
                        <AllocationInput
                            label="Bonds / Fixed Income"
                            color="bg-purple-500"
                            value={goals.target_bonds_percent}
                            onChange={(v) => handleChange('target_bonds_percent', v)}
                        />
                        <AllocationInput
                            label="Cash"
                            color="bg-emerald-500"
                            value={goals.target_cash_percent}
                            onChange={(v) => handleChange('target_cash_percent', v)}
                        />
                        <AllocationInput
                            label="Crypto"
                            color="bg-amber-500"
                            value={goals.target_crypto_percent}
                            onChange={(v) => handleChange('target_crypto_percent', v)}
                        />
                        <AllocationInput
                            label="Commodities / Gold"
                            color="bg-red-500"
                            value={goals.target_commodities_percent}
                            onChange={(v) => handleChange('target_commodities_percent', v)}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Risk Tolerance</label>
                        <div className="grid grid-cols-3 gap-2">
                            {['conservative', 'moderate', 'aggressive'].map((level) => (
                                <button
                                    key={level}
                                    onClick={() => handleChange('risk_tolerance', level)}
                                    className={`py-2 px-3 rounded-lg text-sm font-medium border capitalize transition ${goals.risk_tolerance === level
                                        ? 'bg-emerald-500 text-white border-emerald-500'
                                        : 'bg-slate-50 dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-700 hover:border-slate-400'
                                        }`}
                                >
                                    {level}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Benchmark Index</label>
                        <select
                            value={goals.benchmark_symbol}
                            onChange={(e) => handleChange('benchmark_symbol', e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500"
                        >
                            <option value="^GSPC">S&P 500 (US Large Cap)</option>
                            <option value="^IXIC">Nasdaq (Tech Heavy)</option>
                            <option value="^DJI">Dow Jones</option>
                            <option value="^RUT">Russell 2000 (Small Cap)</option>
                            <option value="BTC-USD">Bitcoin</option>
                        </select>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-8 py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl transition disabled:opacity-50 shadow-lg shadow-emerald-500/20"
                    >
                        {saving ? 'Saving...' : <><Save size={18} /> Save Strategy</>}
                    </button>
                </div>
            </div>
        </div>
    );
}

function AllocationInput({ label, value, onChange, color }: { label: string; value: number; onChange: (v: number) => void; color: string }) {
    return (
        <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-200 dark:border-slate-700/50">
            <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-medium text-slate-500 uppercase flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${color}`} />
                    {label}
                </span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">{value}%</span>
            </div>
            <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={value}
                onChange={(e) => onChange(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
        </div>
    );
}
