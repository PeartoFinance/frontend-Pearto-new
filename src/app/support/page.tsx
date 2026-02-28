'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, HelpCircle, Mail, FileText, ChevronRight, ExternalLink, Search, Loader2 } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import TickerTape from '@/components/layout/TickerTape';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://apipearto.ashlya.com/api';

interface HelpCategory {
    id: number;
    name: string;
    slug: string;
    icon: string | null;
    description: string | null;
    articleCount: number;
}

interface HelpArticle {
    id: number;
    title: string;
    slug: string;
    content: string;
    categoryId: number;
    categoryName: string | null;
    categorySlug: string | null;
    isFeatured: boolean;
    viewCount: number;
    helpfulCount: number;
    createdAt: string | null;
}

const contactMethods = [
    {
        title: 'Email Support',
        description: 'Get help via email within 24 hours',
        icon: Mail,
        action: 'support@pearto.com',
        href: 'mailto:support@pearto.com',
    },
    {
        title: 'FAQ',
        description: 'Find answers to common questions',
        icon: HelpCircle,
        action: 'Browse FAQ',
        href: '/faq',
    },
];

export default function SupportPage() {
    const [categories, setCategories] = useState<HelpCategory[]>([]);
    const [articles, setArticles] = useState<HelpArticle[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<HelpArticle[]>([]);
    const [searching, setSearching] = useState(false);
    const [expandedArticle, setExpandedArticle] = useState<number | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [catRes, artRes] = await Promise.all([
                    fetch(`${API_BASE}/help/categories`),
                    fetch(`${API_BASE}/help/articles`),
                ]);
                if (catRes.ok) {
                    const catData = await catRes.json();
                    setCategories(catData.categories || []);
                }
                if (artRes.ok) {
                    const artData = await artRes.json();
                    setArticles(artData.articles || []);
                }
            } catch (err) {
                console.error('Failed to load help data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Search articles
    useEffect(() => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            return;
        }
        const timer = setTimeout(async () => {
            setSearching(true);
            try {
                const res = await fetch(`${API_BASE}/help/articles?search=${encodeURIComponent(searchQuery)}`);
                if (res.ok) {
                    const data = await res.json();
                    setSearchResults(data.articles || []);
                }
            } catch (err) {
                console.error('Search failed:', err);
            } finally {
                setSearching(false);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const getArticlesForCategory = (categoryId: number) => {
        return articles.filter(a => a.categoryId === categoryId);
    };

    const categoryColors = [
        'from-blue-500 to-indigo-500',
        'from-emerald-500 to-teal-500',
        'from-purple-500 to-pink-500',
        'from-amber-500 to-orange-500',
        'from-cyan-500 to-blue-500',
        'from-rose-500 to-red-500',
    ];

    const categoryIcons: Record<string, typeof HelpCircle> = {
        default: HelpCircle,
    };

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
                                <HelpCircle className="w-8 h-8 text-amber-500" />
                                Help & Support
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 mt-1">
                                Find answers, guides, and get in touch with our team
                            </p>
                        </div>

                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search help articles..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-amber-500 outline-none transition text-slate-900 dark:text-white"
                            />
                            {searching && (
                                <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-slate-400" />
                            )}
                        </div>

                        {/* Search Results */}
                        {searchQuery.trim() && (
                            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                                <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                                    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                        Search Results ({searchResults.length})
                                    </h3>
                                </div>
                                <div className="divide-y divide-slate-100 dark:divide-slate-700">
                                    {searchResults.length === 0 ? (
                                        <div className="p-6 text-center text-slate-500 dark:text-slate-400">
                                            {searching ? 'Searching...' : 'No articles found matching your search.'}
                                        </div>
                                    ) : (
                                        searchResults.map((article) => (
                                            <button
                                                key={article.id}
                                                onClick={() => setExpandedArticle(expandedArticle === article.id ? null : article.id)}
                                                className="w-full text-left px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-medium text-slate-900 dark:text-white">{article.title}</span>
                                                    {article.categoryName && (
                                                        <span className="text-xs text-slate-400 ml-2">{article.categoryName}</span>
                                                    )}
                                                </div>
                                                {expandedArticle === article.id && (
                                                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 whitespace-pre-wrap">{article.content}</p>
                                                )}
                                            </button>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Contact Methods */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {contactMethods.map((method) => {
                                const Icon = method.icon;
                                return (
                                    <Link
                                        key={method.title}
                                        href={method.href}
                                        className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 hover:shadow-md transition group"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
                                                <Icon size={24} className="text-amber-600 dark:text-amber-400" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-slate-900 dark:text-white">{method.title}</h3>
                                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{method.description}</p>
                                                <span className="inline-flex items-center gap-1 text-sm text-amber-600 dark:text-amber-400 font-medium mt-2 group-hover:underline">
                                                    {method.action} <ExternalLink size={14} />
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Help Categories from API */}
                        {loading ? (
                            <div className="flex items-center justify-center gap-2 py-12 text-slate-500">
                                <Loader2 className="w-5 h-5 animate-spin" /> Loading help topics...
                            </div>
                        ) : categories.length > 0 ? (
                            <div className="space-y-4">
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Browse Help Topics</h2>

                                {categories.map((category, idx) => {
                                    const catArticles = getArticlesForCategory(category.id);
                                    const colorClass = categoryColors[idx % categoryColors.length];

                                    return (
                                        <div key={category.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                                            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center gap-3">
                                                <div className={`p-2 rounded-lg bg-gradient-to-br ${colorClass}`}>
                                                    <FileText size={18} className="text-white" />
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-slate-900 dark:text-white">{category.name}</h3>
                                                    {category.description && (
                                                        <p className="text-xs text-slate-400 mt-0.5">{category.description}</p>
                                                    )}
                                                </div>
                                                <span className="text-xs text-slate-400">{category.articleCount} articles</span>
                                            </div>
                                            <div className="divide-y divide-slate-100 dark:divide-slate-700">
                                                {catArticles.length === 0 ? (
                                                    <div className="px-5 py-3 text-sm text-slate-400">No articles yet</div>
                                                ) : (
                                                    catArticles.map((article) => (
                                                        <button
                                                            key={article.id}
                                                            onClick={() => setExpandedArticle(expandedArticle === article.id ? null : article.id)}
                                                            className="w-full text-left flex flex-col px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition"
                                                        >
                                                            <div className="flex items-center justify-between w-full">
                                                                <span className="text-sm text-slate-700 dark:text-slate-300">{article.title}</span>
                                                                <ChevronRight size={16} className={`text-slate-400 transition-transform ${expandedArticle === article.id ? 'rotate-90' : ''}`} />
                                                            </div>
                                                            {expandedArticle === article.id && (
                                                                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 whitespace-pre-wrap">{article.content}</p>
                                                            )}
                                                        </button>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Browse Help Topics</h2>
                                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-10 text-center text-slate-500">
                                    No help categories available yet. Check back soon!
                                </div>
                            </div>
                        )}
                    </div>
                </div>
              <Footer />
      </main>
        </div>
    );
}
