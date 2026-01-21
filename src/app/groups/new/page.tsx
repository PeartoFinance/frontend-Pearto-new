'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft, Users, TrendingUp, Bitcoin, Globe, MessageSquare, Save, Lock, Globe2
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import TickerTape from '@/components/layout/TickerTape';
import { groupsApi } from '@/services/socialService';
import { useAuth } from '@/context/AuthContext';

const CATEGORIES = [
    { value: 'stocks', label: 'Stocks', icon: TrendingUp, color: 'from-blue-500 to-indigo-500' },
    { value: 'crypto', label: 'Crypto', icon: Bitcoin, color: 'from-amber-500 to-orange-500' },
    { value: 'forex', label: 'Forex', icon: Globe, color: 'from-emerald-500 to-teal-500' },
    { value: 'options', label: 'Options', icon: TrendingUp, color: 'from-purple-500 to-pink-500' },
    { value: 'general', label: 'General', icon: MessageSquare, color: 'from-slate-500 to-slate-600' },
];

export default function NewGroupPage() {
    const router = useRouter();
    const { isAuthenticated, user } = useAuth();

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: 'stocks',
        groupType: 'public' as 'public' | 'private' | 'invite_only',
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name) {
            setError('Group name is required');
            return;
        }

        setSubmitting(true);
        setError('');

        try {
            const res = await groupsApi.create({
                name: formData.name,
                description: formData.description || undefined,
                category: formData.category,
                groupType: formData.groupType,
            });
            router.push(`/groups/${res.group.slug || res.group.id}`);
        } catch (err: any) {
            setError(err.message || 'Failed to create group');
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
                            <Users size={64} className="mx-auto text-slate-300 mb-4" />
                            <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-300 mb-4">Sign in to create a group</h2>
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
                        <Link href="/groups" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 mb-6">
                            <ArrowLeft size={18} />
                            Back to Groups
                        </Link>

                        {/* Form Card */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                            <div className="p-6 border-b border-slate-100 dark:border-slate-700">
                                <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                                    <Users className="text-cyan-500" />
                                    Create a Discussion Group
                                </h1>
                                <p className="text-slate-500 text-sm mt-1">Build a community around investment topics</p>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                                {error && (
                                    <div className="p-4 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-sm">
                                        {error}
                                    </div>
                                )}

                                {/* Group Name */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Group Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Give your group a memorable name"
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                                        maxLength={100}
                                    />
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="What is this group about? What topics will be discussed?"
                                        rows={4}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 resize-none"
                                    />
                                </div>

                                {/* Category */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                                        Category
                                    </label>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                                        {CATEGORIES.map((cat) => (
                                            <button
                                                key={cat.value}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, category: cat.value })}
                                                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition ${formData.category === cat.value
                                                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                                                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                                                    }`}
                                            >
                                                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${cat.color} flex items-center justify-center`}>
                                                    <cat.icon size={20} className="text-white" />
                                                </div>
                                                <span className={`text-sm font-medium ${formData.category === cat.value
                                                        ? 'text-emerald-700 dark:text-emerald-400'
                                                        : 'text-slate-600 dark:text-slate-400'
                                                    }`}>
                                                    {cat.label}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Group Type */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                                        Privacy
                                    </label>
                                    <div className="space-y-3">
                                        {[
                                            { value: 'public', label: 'Public', desc: 'Anyone can find and join this group', icon: Globe2 },
                                            { value: 'private', label: 'Private', desc: 'Anyone can find but must request to join', icon: Lock },
                                            { value: 'invite_only', label: 'Invite Only', desc: 'Only invited members can join', icon: Users },
                                        ].map((type) => (
                                            <button
                                                key={type.value}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, groupType: type.value as any })}
                                                className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition ${formData.groupType === type.value
                                                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                                                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                                                    }`}
                                            >
                                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${formData.groupType === type.value
                                                        ? 'bg-emerald-500 text-white'
                                                        : 'bg-slate-100 dark:bg-slate-700 text-slate-500'
                                                    }`}>
                                                    <type.icon size={20} />
                                                </div>
                                                <div>
                                                    <div className={`font-medium ${formData.groupType === type.value
                                                            ? 'text-emerald-700 dark:text-emerald-400'
                                                            : 'text-slate-700 dark:text-slate-300'
                                                        }`}>
                                                        {type.label}
                                                    </div>
                                                    <div className="text-sm text-slate-500">{type.desc}</div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Submit */}
                                <div className="flex gap-4 pt-4">
                                    <Link
                                        href="/groups"
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
                                        {submitting ? 'Creating...' : 'Create Group'}
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
