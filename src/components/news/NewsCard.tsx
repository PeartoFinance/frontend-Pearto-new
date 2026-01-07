'use client';

import Link from 'next/link';
import { ExternalLink, Clock } from 'lucide-react';
import type { NewsArticle } from '@/services/newsService';
import { getCategoryEmoji } from '@/data/newsData';

interface NewsCardProps {
    article: NewsArticle;
    featured?: boolean;
}

export default function NewsCard({ article, featured = false }: NewsCardProps) {
    const timeAgo = (dateString?: string): string => {
        if (!dateString) return '';
        const now = Date.now();
        const then = new Date(dateString).getTime();
        const diff = Math.max(0, now - then);
        const minutes = Math.floor(diff / 60000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;

        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;

        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    };

    const isExternal = article.link && !article.isInternal && article.link !== '#';
    const href = article.isInternal ? `/news/${article.slug}` : (article.link || '#');

    const CardContent = () => (
        <>
            {/* Image */}
            {article.image && (
                <div className={`overflow-hidden ${featured ? 'aspect-[16/10]' : 'aspect-video'}`}>
                    <img
                        src={article.image}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder.svg';
                        }}
                    />
                </div>
            )}

            {/* Content */}
            <div className="p-4 lg:p-5 flex flex-col flex-1">
                {/* Meta */}
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
                    <span className="font-medium truncate max-w-[60%]">{article.source}</span>
                    <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {timeAgo(article.publishedAt)}
                    </span>
                </div>

                {/* Title */}
                <h3 className={`font-bold leading-snug mb-2 text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors ${featured ? 'text-xl lg:text-2xl line-clamp-3' : 'text-base line-clamp-2'
                    }`}>
                    {article.title}
                </h3>

                {/* Description */}
                {(article.summary || article.description) && (
                    <p className={`text-slate-600 dark:text-slate-400 mb-3 flex-1 ${featured ? 'text-sm line-clamp-3' : 'text-xs line-clamp-2'
                        }`}>
                        {article.summary || article.description}
                    </p>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between mt-auto pt-2">
                    <span className="text-xs px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-full font-medium capitalize flex items-center gap-1">
                        {getCategoryEmoji(article.category || '')}
                        {article.category}
                    </span>

                    <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-sm font-medium">
                        Read more
                        <ExternalLink size={14} />
                    </span>
                </div>
            </div>
        </>
    );

    if (isExternal) {
        return (
            <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className={`bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-lg transition-shadow duration-200 group flex flex-col ${featured ? 'lg:col-span-2' : ''
                    }`}
            >
                <CardContent />
            </a>
        );
    }

    return (
        <Link
            href={href}
            className={`bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-lg transition-shadow duration-200 group flex flex-col ${featured ? 'lg:col-span-2' : ''
                }`}
        >
            <CardContent />
        </Link>
    );
}
