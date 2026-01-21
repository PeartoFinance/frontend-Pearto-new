'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft, Lightbulb, TrendingUp, TrendingDown, Minus, Save, Eye
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import TickerTape from '@/components/layout/TickerTape';
import { ideasApi } from '@/services/socialService';
import { useAuth } from '@/context/AuthContext';

export default function NewIdeaPage() {
    const router = useRouter();
    const { isAuthenticated, user } = useAuth();

    const [formData, setFormData] = useState({
        title: '',
        content: '',
        symbol: '',
        ideaType: 'long' as 'long' | 'short' | 'neutral',
        entryPrice: '',
        targetPrice: '',
        stopLoss: '',
        timeframe: 'week',
        isPublic: true,
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || !formData.content || !formData.ideaType) {
            setError('Title, content, and idea type are required');
            return;
        }

        setSubmitting(true);
        setError('');

        try {
            const res = await ideasApi.create({
                title: formData.title,
                content: formData.content,
                symbol: formData.symbol || undefined,
                ideaType: formData.ideaType,
                entryPrice: formData.entryPrice ? parseFloat(formData.entryPrice) : undefined,
                targetPrice: formData.targetPrice ? parseFloat(formData.targetPrice) : undefined,
                stopLoss: formData.stopLoss ? parseFloat(formData.stopLoss) : undefined,
                timeframe: formData.timeframe || undefined,
                isPublic: formData.isPublic,
            });
            router.push(`/ideas/${res.idea.id}`);
        } catch (err: any) {
            setError(err.message || 'Failed to create idea');
        }
        setSubmitting(false);
    };

    if (!isAuthenticated) {
        return (
            <div className="flex min-h-screen bg-gray-50 dark:bg-slate-900">
                <Sidebar />
                <main className="flex-1 flex flex-col min-h-screen">
                    <div className="fixed top-0 right-0 left-0 lg:left-64 z-40 bg-gray-50 dark:bg-slate-900">
                        <TickerTape />
                        <Header />
                    </div>
                    <div className="flex-1 pt-[112px] md:pt-[120px] flex items-center justify-center">
                        <div className="text-center">
                            <Lightbulb size={64} className="mx-auto text-slate-300 mb-4" />
                            <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-300 mb-4">Sign in to share ideas</h2>
                            <Link href="/login" className="px-6 py-3 bg-emerald-500 text-white rounded-xl font-semibold hover:bg-emerald-600 transition">
                                Sign In
                            </Link>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-slate-900">
            <Sidebar />

            <main className="flex-1 flex flex-col min-h-screen">
                {/* Fixed Header */}
                <div className="fixed top-0 right-0 left-0 lg:left-64 z-40 bg-gray-50 dark:bg-slate-900">
                    <TickerTape />
                    <Header />
                </div>

                {/* Content */}
                <div className="flex-1 pt-[112px] md:pt-[120px]">
                    <div className="p-4 lg:p-6 max-w-3xl mx-auto">
                        {/* Back button */}
                        <Link href="/ideas" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 mb-6">
                            <ArrowLeft size={18} />
                            Back to Ideas
                        </Link>

                        {/* Form Card */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                            <div className="p-6 border-b border-slate-100 dark:border-slate-700">
                                <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                                    <Lightbulb className="text-amber-500" />
                                    Share Your Trading Idea
                                </h1>
                                <p className="text-slate-500 text-sm mt-1">Share your investment insights with the community</p>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                                {error && (
                                    <div className="p-4 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-sm">
                                        {error}
                                    </div>
                                )}

                                {/* Idea Type */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Position Type *
                                    </label>
                                    <div className="flex gap-3">
                                        {[
                                            { value: 'long', label: 'Bullish', icon: TrendingUp, color: 'emerald' },
                                            { value: 'short', label: 'Bearish', icon: TrendingDown, color: 'red' },
                                            { value: 'neutral', label: 'Neutral', icon: Minus, color: 'slate' },
                                        ].map((type) => (
                                            <button
                                                key={type.value}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, ideaType: type.value as any })}
                                                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition font-medium ${formData.ideaType === type.value
                                                        ? `border-${type.color}-500 bg-${type.color}-50 dark:bg-${type.color}-900/30 text-${type.color}-700 dark:text-${type.color}-400`
                                                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                                                    }`}
                                            >
                                                <type.icon size={18} />
                                                {type.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Symbol */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Stock/Crypto Symbol
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.symbol}
                                        onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
                                        placeholder="e.g., AAPL, BTC, TSLA"
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono uppercase"
                                    />
                                </div>

                                {/* Title */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Title *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="Give your idea a compelling title"
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                                        maxLength={255}
                                    />
                                </div>

                                {/* Content */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Analysis *
                                    </label>
                                    <textarea
                                        value={formData.content}
                                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                        placeholder="Share your analysis, reasoning, and key points..."
                                        rows={6}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 resize-none"
                                    />
                                </div>

                                {/* Price Targets */}
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                            Entry Price
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={formData.entryPrice}
                                            onChange={(e) => setFormData({ ...formData, entryPrice: e.target.value })}
                                            placeholder="$0.00"
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-emerald-600 mb-2">
                                            Target Price
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={formData.targetPrice}
                                            onChange={(e) => setFormData({ ...formData, targetPrice: e.target.value })}
                                            placeholder="$0.00"
                                            className="w-full px-4 py-3 rounded-xl border border-emerald-200 dark:border-emerald-700 bg-white dark:bg-slate-900"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-red-600 mb-2">
                                            Stop Loss
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={formData.stopLoss}
                                            onChange={(e) => setFormData({ ...formData, stopLoss: e.target.value })}
                                            placeholder="$0.00"
                                            className="w-full px-4 py-3 rounded-xl border border-red-200 dark:border-red-700 bg-white dark:bg-slate-900"
                                        />
                                    </div>
                                </div>

                                {/* Timeframe */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Timeframe
                                    </label>
                                    <select
                                        value={formData.timeframe}
                                        onChange={(e) => setFormData({ ...formData, timeframe: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                                    >
                                        <option value="day">Day Trade</option>
                                        <option value="week">1 Week</option>
                                        <option value="month">1 Month</option>
                                        <option value="quarter">3 Months</option>
                                        <option value="year">1 Year+</option>
                                    </select>
                                </div>

                                {/* Visibility */}
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        id="isPublic"
                                        checked={formData.isPublic}
                                        onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                                        className="w-5 h-5 rounded border-slate-300"
                                    />
                                    <label htmlFor="isPublic" className="text-sm text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                        <Eye size={16} />
                                        Make this idea public
                                    </label>
                                </div>

                                {/* Submit */}
                                <div className="flex gap-4 pt-4">
                                    <Link
                                        href="/ideas"
                                        className="flex-1 px-6 py-3 text-center rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                                    >
                                        Cancel
                                    </Link>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold rounded-xl shadow hover:shadow-lg transition disabled:opacity-50"
                                    >
                                        <Save size={18} />
                                        {submitting ? 'Publishing...' : 'Publish Idea'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
