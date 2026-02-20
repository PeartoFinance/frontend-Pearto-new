'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search, BookOpen, Loader2 } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import TickerTape from '@/components/layout/TickerTape';
import Header from '@/components/layout/Header';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://apipearto.ashlya.com/api';

interface GlossaryTerm {
    id: number;
    term: string;
    definition: string;
    category: string;
    related_terms: string[] | null;
    country_code: string;
}

export default function GlossaryPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [terms, setTerms] = useState<GlossaryTerm[]>([]);
    const [categories, setCategories] = useState<string[]>(['All']);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchGlossary = async () => {
            setLoading(true);
            setError('');
            try {
                const params = new URLSearchParams();
                if (selectedCategory !== 'All') params.append('category', selectedCategory);
                if (searchQuery) params.append('search', searchQuery);
                const qs = params.toString();
                const res = await fetch(`${API_BASE}/glossary${qs ? '?' + qs : ''}`);
                if (!res.ok) throw new Error('Failed to load glossary');
                const data = await res.json();
                setTerms(data.terms || []);
                if (data.categories && data.categories.length > 0) {
                    setCategories(['All', ...data.categories]);
                }
            } catch (err) {
                setError('Unable to load glossary terms. Please try again later.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchGlossary();
    }, [selectedCategory, searchQuery]);

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-slate-900">
            <Sidebar />

            <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
                <div className="fixed top-0 right-0 left-0 lg:left-64 z-40 bg-gray-50 dark:bg-slate-900">
                    <TickerTape />
                    <Header />
                </div>

                <div className="flex-1 pt-[112px] md:pt-[120px] p-4 lg:p-6">
                    <div className="max-w-4xl mx-auto space-y-6">
                        {/* Header */}
                        <div>
                            <Link
                                href="/"
                                className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 mb-2 transition-colors"
                            >
                                <ArrowLeft size={16} /> Back to Dashboard
                            </Link>
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                                <BookOpen className="w-8 h-8 text-purple-600" />
                                Financial Glossary
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 mt-1">
                                Learn common financial terms and concepts
                            </p>
                        </div>

                        {/* Search & Filter */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search terms..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-purple-500 outline-none transition"
                                />
                            </div>
                            <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
                                {categories.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setSelectedCategory(cat)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition capitalize ${selectedCategory === cat
                                                ? 'bg-purple-600 text-white'
                                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                                            }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Terms List */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                            {loading ? (
                                <div className="flex items-center justify-center gap-2 py-16 text-slate-500">
                                    <Loader2 className="w-5 h-5 animate-spin" /> Loading glossary...
                                </div>
                            ) : error ? (
                                <div className="p-10 text-center text-red-500">{error}</div>
                            ) : (
                                <div className="divide-y divide-slate-100 dark:divide-slate-700">
                                    {terms.length === 0 ? (
                                        <div className="p-10 text-center text-slate-500">
                                            No terms found matching your search.
                                        </div>
                                    ) : (
                                        terms.map((item) => (
                                            <div key={item.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex-1">
                                                        <h3 className="font-semibold text-slate-900 dark:text-white">{item.term}</h3>
                                                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{item.definition}</p>
                                                        {item.related_terms && item.related_terms.length > 0 && (
                                                            <div className="flex flex-wrap gap-1.5 mt-2">
                                                                {item.related_terms.map((rt, i) => (
                                                                    <span key={i} className="text-xs px-2 py-0.5 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-full">
                                                                        {rt}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <span className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full whitespace-nowrap capitalize">
                                                        {item.category}
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
