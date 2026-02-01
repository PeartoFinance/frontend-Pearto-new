'use client';

import { useState, useEffect } from 'react';
import { Target, Trash2, Plus, PartyPopper, TrendingUp, Calendar } from 'lucide-react';
import { getFinancialGoals, deleteFinancialGoal, type FinancialGoal } from '@/services/portfolioService';
import FinancialGoalModal from './FinancialGoalModal';
import PriceDisplay from '@/components/common/PriceDisplay';

interface FinancialGoalsProps {
    compact?: boolean;
}

export default function FinancialGoals({ compact = false }: FinancialGoalsProps) {
    const [goals, setGoals] = useState<FinancialGoal[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [deleting, setDeleting] = useState<string | null>(null);

    useEffect(() => {
        loadGoals();
    }, []);

    const loadGoals = async () => {
        try {
            const data = await getFinancialGoals();
            setGoals(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to load financial goals:', error);
            setGoals([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this goal?')) return;

        setDeleting(id);
        try {
            await deleteFinancialGoal(id);
            setGoals(goals.filter(g => g.id !== id));
        } catch (error) {
            console.error('Failed to delete goal:', error);
            alert('Failed to delete goal');
        } finally {
            setDeleting(null);
        }
    };

    const handleGoalCreated = () => {
        setShowModal(false);
        loadGoals();
    };

    const getProgressColor = (percent: number, status: string) => {
        if (status === 'achieved') return 'bg-emerald-500';
        if (percent >= 75) return 'bg-emerald-500';
        if (percent >= 50) return 'bg-amber-500';
        return 'bg-blue-500';
    };

    if (loading) {
        return (
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
                    <div className="h-20 bg-slate-200 dark:bg-slate-700 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-500/10 rounded-lg">
                            <Target className="w-5 h-5 text-purple-500" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 dark:text-white">Financial Goals</h3>
                            <p className="text-xs text-slate-500">Track your wealth targets</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 px-3 py-2 bg-purple-500 hover:bg-purple-400 text-white text-sm font-medium rounded-lg transition"
                    >
                        <Plus size={16} /> New Goal
                    </button>
                </div>

                {goals.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                        <Target className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                        <p className="text-slate-500 text-sm">No financial goals yet.</p>
                        <button
                            onClick={() => setShowModal(true)}
                            className="mt-3 text-purple-500 text-sm font-medium hover:underline"
                        >
                            Create your first goal
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {goals.map((goal) => (
                            <div
                                key={goal.id}
                                className={`p-4 rounded-xl border transition ${goal.status === 'achieved'
                                    ? 'bg-emerald-500/5 border-emerald-500/20'
                                    : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700'
                                    }`}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        {goal.status === 'achieved' ? (
                                            <PartyPopper className="w-5 h-5 text-emerald-500" />
                                        ) : (
                                            <TrendingUp className="w-5 h-5 text-slate-400" />
                                        )}
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-gray-900 dark:text-white">
                                                    {goal.name || 'Unnamed Goal'}
                                                </span>
                                                {goal.status === 'achieved' && (
                                                    <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-500 text-white rounded-full uppercase">
                                                        🎉 Achieved
                                                    </span>
                                                )}
                                                {goal.portfolio_id && (
                                                    <span className="text-[10px] font-medium px-2 py-0.5 bg-blue-500/10 text-blue-500 rounded-full">
                                                        Portfolio
                                                    </span>
                                                )}
                                                {!goal.portfolio_id && (
                                                    <span className="text-[10px] font-medium px-2 py-0.5 bg-purple-500/10 text-purple-500 rounded-full">
                                                        Global
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                                                <span className="flex items-center gap-1">
                                                    <Calendar size={12} />
                                                    Target: {new Date(goal.target_date).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(goal.id)}
                                        disabled={deleting === goal.id}
                                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition disabled:opacity-50"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>

                                {/* Progress */}
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">
                                            <PriceDisplay amount={goal.current_amount || 0} />
                                        </span>
                                        <span className="font-semibold text-gray-900 dark:text-white">
                                            <PriceDisplay amount={goal.target_amount} />
                                        </span>
                                    </div>
                                    <div className="h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-500 ${getProgressColor(goal.progress_percent, goal.status)}`}
                                            style={{ width: `${Math.min(goal.progress_percent || 0, 100)}%` }}
                                        />
                                    </div>
                                    <div className="text-right">
                                        <span className={`text-xs font-bold ${goal.status === 'achieved' ? 'text-emerald-500' : 'text-slate-500'
                                            }`}>
                                            {goal.progress_percent?.toFixed(1) || 0}% complete
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {showModal && (
                <FinancialGoalModal
                    onClose={() => setShowModal(false)}
                    onCreated={handleGoalCreated}
                />
            )}
        </>
    );
}
