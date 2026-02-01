'use client';

import { useState, useEffect } from 'react';
import { X, Target, Calendar, DollarSign, Briefcase, Globe } from 'lucide-react';
import { createFinancialGoal, getPortfolios, type Portfolio } from '@/services/portfolioService';
import { useCurrency } from '@/contexts/CurrencyContext';

interface FinancialGoalModalProps {
    onClose: () => void;
    onCreated: () => void;
}

export default function FinancialGoalModal({ onClose, onCreated }: FinancialGoalModalProps) {
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
    const [loadingPortfolios, setLoadingPortfolios] = useState(true);
    const { formatPrice } = useCurrency();

    const [formData, setFormData] = useState({
        name: '',
        target_amount: '',
        target_date: '',
        start_amount: '',
        trackSpecificPortfolio: false,
        portfolio_id: '' as string | null,
    });

    useEffect(() => {
        loadPortfolios();
    }, []);

    const loadPortfolios = async () => {
        try {
            const data = await getPortfolios();
            setPortfolios(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to load portfolios:', error);
        } finally {
            setLoadingPortfolios(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!formData.target_amount || !formData.target_date) {
            setError('Target amount and date are required');
            return;
        }

        setSaving(true);
        try {
            await createFinancialGoal({
                name: formData.name || undefined,
                target_amount: parseFloat(formData.target_amount),
                target_date: formData.target_date,
                start_amount: formData.start_amount ? parseFloat(formData.start_amount) : undefined,
                portfolio_id: formData.trackSpecificPortfolio ? formData.portfolio_id : null,
            });
            onCreated();
        } catch (err: any) {
            setError(err.message || 'Failed to create goal');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
                >
                    <X size={20} />
                </button>

                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-purple-500/10 rounded-xl">
                        <Target className="w-6 h-6 text-purple-500" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">New Financial Goal</h2>
                        <p className="text-sm text-slate-500">Set a target to track your progress</p>
                    </div>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Goal Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                            Goal Name
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g., Buy a House, Retirement Fund"
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-purple-500 transition"
                        />
                    </div>

                    {/* Target Amount */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                            Target Amount <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="number"
                                value={formData.target_amount}
                                onChange={(e) => setFormData({ ...formData, target_amount: e.target.value })}
                                placeholder="50000"
                                required
                                min="1"
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-purple-500 transition"
                            />
                        </div>
                    </div>

                    {/* Target Date */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                            Target Date <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="date"
                                value={formData.target_date}
                                onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
                                required
                                min={new Date().toISOString().split('T')[0]}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-purple-500 transition"
                            />
                        </div>
                    </div>

                    {/* Start Amount (Optional) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                            Start Amount <span className="text-slate-400">(optional)</span>
                        </label>
                        <div className="relative">
                            <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="number"
                                value={formData.start_amount}
                                onChange={(e) => setFormData({ ...formData, start_amount: e.target.value })}
                                placeholder="Leave empty to use current value"
                                min="0"
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-purple-500 transition"
                            />
                        </div>
                    </div>

                    {/* Track Specific Portfolio Toggle */}
                    <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {formData.trackSpecificPortfolio ? (
                                    <Briefcase size={18} className="text-blue-500" />
                                ) : (
                                    <Globe size={18} className="text-purple-500" />
                                )}
                                <div>
                                    <span className="font-medium text-gray-900 dark:text-white text-sm">
                                        Track Specific Portfolio?
                                    </span>
                                    <p className="text-xs text-slate-500">
                                        {formData.trackSpecificPortfolio
                                            ? 'Track one portfolio only'
                                            : 'Track your Global Net Worth'}
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, trackSpecificPortfolio: !formData.trackSpecificPortfolio, portfolio_id: '' })}
                                className={`relative w-12 h-6 rounded-full transition-colors ${formData.trackSpecificPortfolio ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-600'
                                    }`}
                            >
                                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${formData.trackSpecificPortfolio ? 'translate-x-7' : 'translate-x-1'
                                    }`} />
                            </button>
                        </div>

                        {formData.trackSpecificPortfolio && (
                            <div className="mt-4">
                                <select
                                    value={formData.portfolio_id || ''}
                                    onChange={(e) => setFormData({ ...formData, portfolio_id: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
                                    required={formData.trackSpecificPortfolio}
                                >
                                    <option value="">Select a portfolio...</option>
                                    {loadingPortfolios ? (
                                        <option disabled>Loading...</option>
                                    ) : (
                                        portfolios.map((p) => (
                                            <option key={p.id} value={p.id}>
                                                {p.name} ({formatPrice(p.totalValue || 0)})
                                            </option>
                                        ))
                                    )}
                                </select>
                            </div>
                        )}
                    </div>

                    {/* Submit Button */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 px-4 py-2.5 bg-purple-500 hover:bg-purple-400 text-white rounded-lg transition font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {saving ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                'Create Goal'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
