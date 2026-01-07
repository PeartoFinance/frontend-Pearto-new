'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/layout/Sidebar';
import TickerTape from '@/components/layout/TickerTape';
import Header from '@/components/layout/Header';
import NewsCard from '@/components/news/NewsCard';
import { getPublishedNews, type NewsArticle } from '@/services/newsService';
import { categories, getCategoryBySlug } from '@/data/newsData';
import { Newspaper, Search, RefreshCw, ArrowLeft } from 'lucide-react';

interface NewsPageProps {
    params?: { category?: string };
}

export default function NewsPage({ params }: NewsPageProps) {
    const [articles, setArticles] = useState<NewsArticle[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    useEffect(() => {
        loadArticles();
    }, [selectedCategory]);

    const loadArticles = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await getPublishedNews({
                limit: 50,
                category: selectedCategory || undefined
            });
            setArticles(response.items || []);
        } catch (err) {
            console.error('Failed to fetch news:', err);
            setError('Failed to load news articles');
            setArticles([]);
        } finally {
            setLoading(false);
        }
    };

    const filteredArticles = articles.filter(article => {
        if (!searchQuery.trim()) return true;
        const query = searchQuery.toLowerCase();
        return (
            article.title.toLowerCase().includes(query) ||
            (article.source || '').toLowerCase().includes(query) ||
            (article.summary || '').toLowerCase().includes(query)
        );
    });

    const featuredArticles = filteredArticles.filter(a => a.featured).slice(0, 3);
    const regularArticles = filteredArticles.filter(a => !featuredArticles.includes(a));

    const currentCategory = selectedCategory ? getCategoryBySlug(selectedCategory) : null;

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-neutral-950">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-h-screen">
                {/* Fixed Header */}
                <div className="fixed top-0 right-0 left-0 lg:left-64 z-40 bg-gray-50 dark:bg-neutral-950">
                    <TickerTape />
                    <Header />
                </div>

                {/* Content */}
                <div className="flex-1 pt-[112px] md:pt-[120px]">
                    {/* Hero Header */}
                    <div className="bg-white dark:bg-slate-900 py-8 px-4 lg:px-6 border-b border-slate-200 dark:border-slate-800">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            <div>
                                {selectedCategory && (
                                    <button
                                        onClick={() => setSelectedCategory(null)}
                                        className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 mb-2 transition-colors text-sm"
                                    >
                                        <ArrowLeft size={14} />
                                        Back to All News
                                    </button>
                                )}

                                <div className="flex items-center gap-3">
                                    <Newspaper className="w-6 h-6 text-emerald-600 dark:text-emerald-500" />
                                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                                        {currentCategory ? currentCategory.name : 'Latest News'}
                                    </h1>
                                </div>
                                <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
                                    {currentCategory
                                        ? currentCategory.description
                                        : 'Stay updated with the latest financial news, market insights, and global developments'
                                    }
                                </p>
                            </div>

                            {/* Search Bar */}
                            <div className="flex gap-3 items-center">
                                <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg w-full sm:w-64">
                                    <Search size={16} className="text-slate-400" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search articles..."
                                        className="flex-1 bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none text-sm"
                                    />
                                </div>
                                <button
                                    onClick={loadArticles}
                                    disabled={loading}
                                    className="flex items-center gap-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors text-sm"
                                >
                                    <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                                    Refresh
                                </button>
                                <span className="text-slate-500 text-sm hidden sm:inline">
                                    {filteredArticles.length} articles
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="px-4 lg:px-6 py-6 space-y-6">
                        {/* Category Navigation */}
                        {!selectedCategory && (
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Browse by Category</h2>
                                <div className="flex flex-wrap gap-2">
                                    {categories.map((cat) => (
                                        <button
                                            key={cat.slug}
                                            onClick={() => setSelectedCategory(cat.slug)}
                                            className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 rounded-lg transition-colors"
                                        >
                                            <span>{cat.emoji}</span>
                                            <span className="font-medium text-slate-700 dark:text-slate-300">{cat.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Error State */}
                        {error && (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                                <p className="text-red-600 dark:text-red-400">{error}</p>
                            </div>
                        )}

                        {/* Loading State */}
                        {loading && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                {Array.from({ length: 8 }).map((_, i) => (
                                    <div key={i} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-pulse">
                                        <div className="aspect-video bg-slate-200 dark:bg-slate-800" />
                                        <div className="p-4 space-y-3">
                                            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                                            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full" />
                                            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-2/3" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Featured Articles */}
                        {!loading && featuredArticles.length > 0 && (
                            <div>
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">Featured Stories</h2>
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                    {featuredArticles.map((article, index) => (
                                        <NewsCard
                                            key={article.id}
                                            article={article}
                                            featured={index === 0}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* All Articles */}
                        {!loading && regularArticles.length > 0 && (
                            <div>
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">
                                    {selectedCategory ? `Latest ${currentCategory?.name} News` : 'All News'}
                                    <span className="text-sm font-normal text-slate-500 ml-2">
                                        ({regularArticles.length})
                                    </span>
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                    {regularArticles.map((article) => (
                                        <NewsCard key={article.id} article={article} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Empty State */}
                        {!loading && filteredArticles.length === 0 && (
                            <div className="text-center py-16">
                                <Newspaper className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">No articles found</h3>
                                <p className="text-slate-500">
                                    {searchQuery
                                        ? `No articles match "${searchQuery}"`
                                        : 'No articles available at the moment'
                                    }
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
