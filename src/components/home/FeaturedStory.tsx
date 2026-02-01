'use client';

import Link from 'next/link';
import { Clock, ArrowRight, Loader2 } from 'lucide-react';
import { Article } from '@/services/contentService';
import { useFeaturedArticles } from '@/hooks/useContentData';

interface FeaturedStoryProps {
    initialArticle?: Article;
}

export default function FeaturedStory({ initialArticle }: FeaturedStoryProps) {
    // Determine if we need to fetch data
    const shouldFetch = !initialArticle;

    const { data: articles, isLoading } = useFeaturedArticles(1);

    // Use initial data if provided, otherwise use fetched data
    const article = initialArticle || (articles && articles.length > 0 ? articles[0] : null);
    const loading = shouldFetch && isLoading;

    // Prefetch next batch or similar logic could go here
    // No useEffect needed for data fetching anymore

    const getTimeAgo = (dateStr?: string) => {
        if (!dateStr) return "Just now";
        const date = new Date(dateStr);
        const hours = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60));
        if (hours < 1) return "Just now";
        if (hours === 1) return "1 hour ago";
        if (hours < 24) return `${hours} hours ago`;
        return `${Math.floor(hours / 24)} days ago`;
    };

    if (loading) {
        return (
            <div className="relative rounded-3xl aspect-[21/9] min-h-[280px] bg-slate-800 flex items-center justify-center">
                <Loader2 className="animate-spin text-emerald-500" size={32} />
            </div>
        );
    }

    if (!article) return null;

    return (
        <Link
            href={`/news/${article.slug || article.id}`}
            className="group relative block overflow-hidden rounded-3xl aspect-[21/9] min-h-[280px]"
        >
            {/* Background Image */}
            <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{ backgroundImage: `url(${article.imageUrl || 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800'})` }}
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/70 to-transparent" />

            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8">
                {/* Category Badge */}
                <span className="inline-block px-3 py-1 mb-4 text-xs font-bold tracking-wide text-white bg-emerald-500 rounded-full">
                    {article.category?.toUpperCase() || 'NEWS'}
                </span>

                {/* Title */}
                <h2 className="text-2xl lg:text-3xl font-bold text-white mb-3 leading-tight group-hover:text-emerald-300 transition-colors">
                    {article.title}
                </h2>

                {/* Description */}
                <p className="text-slate-300 text-sm lg:text-base mb-4 line-clamp-2 max-w-3xl">
                    {article.summary}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                        <Clock size={14} />
                        <span>{getTimeAgo(article.publishedAt)}</span>
                        {article.author && <span>• {article.author}</span>}
                    </div>

                    <span className="flex items-center gap-1 text-emerald-400 font-medium text-sm group-hover:gap-2 transition-all">
                        Read Story <ArrowRight size={16} />
                    </span>
                </div>
            </div>
        </Link>
    );
}
