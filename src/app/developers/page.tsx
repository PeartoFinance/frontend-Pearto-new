'use client';

import { Suspense, useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/layout/Header';
import TickerTape from '@/components/layout/TickerTape';
import { developerService, ApiKey, ApiUsage } from '@/services/developerService';
import { useApiSWR } from '@/hooks/useApi';
import { Key, Plus, Trash2, Copy, BarChart3, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

function DeveloperDashboard() {
    const { isAuthenticated } = useAuth();

    // Fetch data using the robust SWR hook hook.
    // We pass null if not authenticated to prevent it from sending initial 401 requests.
    const { data: keys = [], mutate: mutateKeys, isLoading: loadingKeys } = useApiSWR<ApiKey[]>(
        isAuthenticated ? '/developer/keys' : null
    );
    const { data: usage, isLoading: loadingUsage } = useApiSWR<ApiUsage>(
        isAuthenticated ? '/developer/usage' : null
    );

    const [newKeyName, setNewKeyName] = useState('');
    const [generating, setGenerating] = useState(false);
    const [newlyGeneratedKey, setNewlyGeneratedKey] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    // Global loading state while either API is resolving
    const loading = isAuthenticated && (loadingKeys || loadingUsage);

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-400">
                <Header />
                <div className="container mx-auto px-4 py-16 text-center">
                    <h1 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">Please sign in to view your Developer Dashboard</h1>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-white dark:bg-slate-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    const handleGenerateKey = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newKeyName.trim()) return;

        try {
            setGenerating(true);
            const key = await developerService.generateKey(newKeyName);
            // Optimistically update the UI while re-validating the cache
            mutateKeys([key, ...keys], false);
            setNewlyGeneratedKey(key.rawKey || null);
            setNewKeyName('');
        } catch (error) {
            console.error('Failed to generate key:', error);
        } finally {
            setGenerating(false);
        }
    };

    const handleRevoke = async (id: number) => {
        if (!confirm('Are you sure you want to revoke this key?')) return;

        try {
            await developerService.revokeKey(id);
            // Re-validate the keys list via SWR automatically
            mutateKeys(keys.filter(k => k.id !== id), false);
        } catch (error) {
            console.error('Failed to revoke key:', error);
        }
    };

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-300 font-sans pb-12">
            <div className="fixed top-0 right-0 left-0 z-40 bg-white dark:bg-slate-900">
                <TickerTape />
                <Header />
            </div>

            <div className="pt-[112px] md:pt-[120px]">
                <div className="container mx-auto px-4 py-8 max-w-5xl">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                                <Key className="text-emerald-500" /> API Access
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400">Generate API keys to get programmatic access to PeartoFinance Data API</p>
                        </div>

                        <div className="mt-4 md:mt-0 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
                            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400">
                                <BarChart3 />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Today's API Requests</p>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                    {usage?.todayRequests.toLocaleString() || 0}
                                    <span className="text-sm text-slate-400 font-normal ml-1">/ {usage?.dailyLimit.toLocaleString()}</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    {newlyGeneratedKey && (
                        <div className="mb-8 p-6 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800 rounded-xl relative hover:shadow-lg transition-transform transform">
                            <button onClick={() => setNewlyGeneratedKey(null)} className="absolute top-4 right-4 text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-200">
                                ✕
                            </button>
                            <h3 className="text-lg font-bold text-emerald-800 dark:text-emerald-400 mb-2 flex items-center gap-2">
                                <CheckCircle2 size={20} /> Hold on to your key!
                            </h3>
                            <p className="text-emerald-700 dark:text-emerald-300 mb-4 text-sm">
                                Make sure to copy your API key now. You won't be able to see it again!
                            </p>
                            <div className="flex items-center gap-2">
                                <code className="flex-1 bg-white dark:bg-slate-900 p-3 rounded-lg border border-emerald-200 dark:border-emerald-700 text-slate-900 dark:text-emerald-400 font-mono text-sm break-all">
                                    {newlyGeneratedKey}
                                </code>
                                <button
                                    onClick={() => handleCopy(newlyGeneratedKey)}
                                    className="p-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors flex items-center gap-2"
                                >
                                    {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                                    {copied ? 'Copied' : 'Copy'}
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-1">
                            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 sticky top-[140px]">
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                    <Plus size={20} className="text-emerald-500" /> Create New Key
                                </h2>
                                <form onSubmit={handleGenerateKey}>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Key Name</label>
                                        <input
                                            type="text"
                                            value={newKeyName}
                                            onChange={e => setNewKeyName(e.target.value)}
                                            placeholder="e.g. My Application"
                                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2.5 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-slate-900 dark:text-white transition-colors"
                                            required
                                            maxLength={50}
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={generating || !newKeyName.trim()}
                                        className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition-colors flex justify-center items-center gap-2"
                                    >
                                        {generating ? 'Generating...' : 'Generate Key'}
                                    </button>
                                </form>
                                <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                                        <AlertCircle size={16} className="text-amber-500" /> Usage Limits
                                    </h3>

                                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mb-2 mt-4">
                                        <div
                                            className={`bg-emerald-500 h-2 rounded-full transition-all duration-500 ${(usage?.todayRequests || 0) / (usage?.dailyLimit || 1) > 0.9 ? 'bg-red-500' : ''}`}
                                            style={{ width: `${Math.min(((usage?.todayRequests || 0) / (usage?.dailyLimit || 1)) * 100, 100)}%` }}
                                        ></div>
                                    </div>
                                    <div className="flex justify-between text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                                        <span>{usage?.todayRequests.toLocaleString() || 0} used</span>
                                        <span>{usage?.dailyLimit.toLocaleString()} limit</span>
                                    </div>

                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                                        Based on your current subscription. Maximize your potential by upgrading your plan.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-2">
                            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden mb-6">
                                <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Active API Keys</h2>
                                </div>

                                {keys.length === 0 ? (
                                    <div className="p-12 text-center text-slate-500 dark:text-slate-400">
                                        <Key className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 opacity-50 text-slate-300 dark:text-slate-600" />
                                        <p className="text-lg">You haven't generated any API keys yet.</p>
                                        <p className="text-sm mt-2 opacity-80">Use the form to create your first programmatic access key.</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Key Prefix</th>
                                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Created</th>
                                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                                {keys.map(key => (
                                                    <tr key={key.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <div className="font-medium text-slate-900 dark:text-white">{key.name}</div>
                                                            <div className="text-xs text-slate-500 mt-1">
                                                                Last used: {key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleDateString() : 'Never'}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 font-mono text-sm text-slate-700 dark:text-slate-300">
                                                            {key.keyPrefix}••••••••
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-slate-500">
                                                            {new Date(key.createdAt).toLocaleDateString()}
                                                        </td>
                                                        <td className="px-6 py-4 text-right text-sm font-medium">
                                                            <button
                                                                onClick={() => handleRevoke(key.id)}
                                                                className="text-red-500 hover:text-white hover:bg-red-500 hover:border-red-500 border border-transparent px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ml-auto"
                                                            >
                                                                <Trash2 size={16} /> Revoke
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>

                            {/* API Status endpoints demo */}
                            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">API Documentation Snippet</h2>
                                <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
                                    Include your key using the <code className="bg-slate-100 dark:bg-slate-900 px-1 rounded">Authorization</code> header:
                                </p>
                                <div className="bg-slate-900 p-4 rounded-xl text-emerald-400 font-mono text-sm overflow-x-auto">
                                    <pre>{`fetch('https://peartofinance.com/api/v1/public/market/quotes/AAPL', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY'
  }
})
  .then(res => res.json())
  .then(console.log);`}</pre>
                                </div>
                                <div className="mt-6 text-center">
                                    <Link href="/developers/docs" className="inline-block px-6 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-medium rounded-lg transition-colors w-full">
                                        View Full API Documentation
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function DevelopersPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-white dark:bg-slate-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
            </div>
        }>
            <DeveloperDashboard />
        </Suspense>
    );
}
