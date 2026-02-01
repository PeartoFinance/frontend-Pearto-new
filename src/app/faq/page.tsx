'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import TickerTape from '@/components/layout/TickerTape';
import { HelpCircle, ChevronDown, ChevronUp, Search, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface FAQ {
    id: string;
    question: string;
    answer: string;
    category: string;
}

export default function FAQPage() {
    const { t } = useTranslation();
    const [faqs, setFaqs] = useState<FAQ[]>([]);
    const [loading, setLoading] = useState(true);
    const [openId, setOpenId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState<string>('All');

    useEffect(() => {
        const fetchFAQs = async () => {
            try {
                const url = `${process.env.NEXT_PUBLIC_API_URL || 'https://api.pearto.com'}/api/content/faq`;
                const res = await fetch(url);
                if (res.ok) {
                    const data = await res.json();
                    setFaqs(data);
                }
            } catch (error) {
                console.error('Failed to fetch FAQs', error);
            } finally {
                setLoading(false);
            }
        };

        fetchFAQs();
    }, []);

    const categories = ['All', ...Array.from(new Set(faqs.map(f => f.category)))];

    const filteredFaqs = faqs.filter(faq => {
        const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = activeCategory === 'All' || faq.category === activeCategory;
        return matchesSearch && matchesCategory;
    });

    const toggleFAQ = (id: string) => {
        setOpenId(openId === id ? null : id);
    };

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-slate-900">
            <Sidebar />
            <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
                <div className="fixed top-0 right-0 left-0 lg:left-64 z-40 bg-gray-50 dark:bg-slate-900">
                    <TickerTape />
                    <Header />
                </div>

                <div className="flex-1 pt-[112px] md:pt-[120px] p-4 lg:p-8">
                    <div className="max-w-4xl mx-auto space-y-8">
                        {/* Header Section */}
                        <div className="text-center space-y-4">
                            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white flex items-center justify-center gap-3">
                                <HelpCircle className="text-emerald-500" size={36} />
                                Frequently Asked Questions
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
                                Find answers to common questions about PeartoFinance, account management, billing, and more.
                            </p>
                        </div>

                        {/* Search & Filter */}
                        <div className="space-y-6">
                            <div className="relative max-w-xl mx-auto">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search for answers..."
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-shadow shadow-sm"
                                />
                            </div>

                            <div className="flex flex-wrap justify-center gap-2">
                                {categories.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setActiveCategory(cat)}
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeCategory === cat
                                            ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25'
                                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                                            }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* FAQ List */}
                        {loading ? (
                            <div className="flex justify-center py-12">
                                <Loader2 className="animate-spin text-emerald-500" size={32} />
                            </div>
                        ) : filteredFaqs.length === 0 ? (
                            <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                                <p className="text-slate-500 dark:text-slate-400">No FAQs found matching your criteria.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredFaqs.map((faq) => (
                                    <div
                                        key={faq.id}
                                        className={`bg-white dark:bg-slate-800 rounded-xl border transition-all duration-200 overflow-hidden ${openId === faq.id
                                            ? 'border-emerald-500 dark:border-emerald-500 shadow-lg shadow-emerald-500/10'
                                            : 'border-slate-200 dark:border-slate-700 hover:border-emerald-200 dark:hover:border-emerald-900'
                                            }`}
                                    >
                                        <button
                                            onClick={() => toggleFAQ(faq.id)}
                                            className="w-full flex items-center justify-between p-5 text-left"
                                        >
                                            <span className="font-semibold text-slate-900 dark:text-white pr-8">{faq.question}</span>
                                            {openId === faq.id ? (
                                                <ChevronUp className="text-emerald-500 shrink-0" size={20} />
                                            ) : (
                                                <ChevronDown className="text-slate-400 shrink-0" size={20} />
                                            )}
                                        </button>

                                        <div
                                            className={`grid transition-all duration-300 ease-in-out ${openId === faq.id ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                                                }`}
                                        >
                                            <div className="overflow-hidden">
                                                <div className="p-5 pt-0 text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-700/50 mt-2">
                                                    {faq.answer}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
