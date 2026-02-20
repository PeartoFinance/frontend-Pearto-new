'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BarChart3, Loader2, AlertCircle } from 'lucide-react';
import { get } from '@/services/api';

interface Article {
    id: number | string;
    title: string;
    source?: string;
    author?: string;
    summary?: string;
    image?: string;
    imageUrl?: string;
    published_at?: string;
    publishedAt?: string;
    slug?: string;
}

interface NewsResponse {
    items: Article[];
    total: number;
}

export default function MarketAnalysis() {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchArticles = async () => {
            try {
                setLoading(true);
                const data = await get<NewsResponse>('/news/published', { limit: 6 });
                setArticles(data?.items || []);
            } catch (err) {
                console.error('Failed to fetch market analysis articles:', err);
                setArticles([]);
            } finally {
                setLoading(false);
            }
        };

        fetchArticles();
    }, []);

    const getTimeAgo = (dateStr?: string) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const now = new Date();
        const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
        if (diffHours < 1) return 'Just now';
        if (diffHours < 24) return `${diffHours}h ago`;
        return `${Math.floor(diffHours / 24)}d ago`;
    };

    if (loading) {
        return (
            <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 h-full">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-emerald-500" /> Market Analysis
                </h3>
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="animate-spin text-emerald-500" size={20} />
                </div>
            </div>
        );
    }

    if (articles.length === 0) {
        return (
            <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 h-full">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-emerald-500" /> Market Analysis
                </h3>
                <div className="flex flex-col items-center justify-center py-8 gap-2 text-slate-400">
                    <AlertCircle size={20} />
                    <span className="text-sm">No analysis available</span>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 h-full">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-emerald-500" /> Market Analysis
            </h3>
            <div className="space-y-4">
                {articles.map((article) => (
                    <Link key={article.id} href={article.slug ? `/news/${article.slug}` : '/news'} className="flex gap-4 group">
                        <div
                            className="h-16 w-16 flex-shrink-0 rounded-lg bg-cover bg-center bg-slate-200 dark:bg-slate-700"
                            style={{ backgroundImage: (article.image || article.imageUrl) ? `url('${article.image || article.imageUrl}')` : undefined }}
                        />
                        <div className="flex flex-col justify-center min-w-0">
                            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 transition-colors line-clamp-2">
                                {article.title}
                            </h4>
                            <p className="text-xs text-slate-500 mt-1">
                                By {article.source || article.author || 'Staff'} • {getTimeAgo(article.published_at || article.publishedAt)}
                            </p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
