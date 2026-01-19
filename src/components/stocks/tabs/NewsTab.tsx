'use client';

import { Newspaper, Clock, ExternalLink, Loader2 } from 'lucide-react';
import { type NewsArticle } from '@/services/marketService';
import Link from 'next/link';

interface NewsTabProps {
    symbol: string;
    news: NewsArticle[];
    loading?: boolean;
}

export default function NewsTab({ symbol, news, loading }: NewsTabProps) {
    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
        );
    }

    if (!news || news.length === 0) {
        return (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-8 text-center">
                <Newspaper className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <p className="text-slate-500 dark:text-slate-400">No news available for {symbol}.</p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <Newspaper size={18} className="text-blue-500" />
                    Latest News
                </h3>
                <Link
                    href={`/news?q=${symbol}`}
                    className="text-sm text-blue-600 hover:text-blue-500"
                >
                    View All →
                </Link>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {news.map((article) => (
                    <a
                        key={article.id}
                        href={article.link || article.url || `/news/${article.slug}`}
                        target={article.url ? '_blank' : '_self'}
                        rel={article.url ? 'noopener noreferrer' : ''}
                        className="flex gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition group"
                    >
                        {article.image && (
                            <img
                                src={article.image}
                                alt=""
                                className="w-24 h-16 object-cover rounded-lg flex-shrink-0"
                            />
                        )}
                        <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-slate-900 dark:text-white group-hover:text-blue-600 transition line-clamp-2">
                                {article.title}
                            </h4>
                            {article.summary && (
                                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                                    {article.summary}
                                </p>
                            )}
                            <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
                                <span>{article.source}</span>
                                {article.publishedAt && (
                                    <>
                                        <span>•</span>
                                        <span className="flex items-center gap-1">
                                            <Clock size={10} />
                                            {new Date(article.publishedAt).toLocaleDateString()}
                                        </span>
                                    </>
                                )}
                                {article.url && <ExternalLink size={10} />}
                            </div>
                        </div>
                    </a>
                ))}
            </div>
        </div>
    );
}
