'use client';

import Link from 'next/link';
import { Clock, Eye } from 'lucide-react';
import type { BlogPost } from '@/services/blogService';
import { fixImageUrl } from '@/utils/imageUtils';

interface BlogCardProps {
    post: BlogPost;
    featured?: boolean;
}

export default function BlogCard({ post, featured = false }: BlogCardProps) {
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

    return (
        <Link
            href={`/blog/${post.slug}`}
            className={`bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-lg transition-shadow duration-200 group flex flex-col ${featured ? 'lg:col-span-2' : ''}`}
        >
            {/* Image */}
            {post.featuredImage && (
                <div className={`overflow-hidden ${featured ? 'aspect-[16/10]' : 'aspect-video'}`}>
                    <img
                        src={fixImageUrl(post.featuredImage)}
                        alt={post.title}
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
                    <span className="flex items-center gap-1">
                        <Eye size={12} />
                        {post.viewCount || 0} views
                    </span>
                    <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {timeAgo(post.publishedAt)}
                    </span>
                </div>

                {/* Title */}
                <h3 className={`font-bold leading-snug mb-2 text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors ${featured ? 'text-xl lg:text-2xl line-clamp-3' : 'text-base line-clamp-2'}`}>
                    {post.title}
                </h3>

                {/* Excerpt */}
                {post.excerpt && (
                    <p className={`text-slate-600 dark:text-slate-400 mb-3 flex-1 ${featured ? 'text-sm line-clamp-3' : 'text-xs line-clamp-2'}`}>
                        {post.excerpt}
                    </p>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between mt-auto pt-2">
                    {post.tags && post.tags.length > 0 ? (
                        <div className="flex gap-1 flex-wrap">
                            {post.tags.slice(0, 2).map((tag, i) => (
                                <span key={`${tag}-${i}`} className="text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-full font-medium text-slate-600 dark:text-slate-400">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    ) : (
                        <span />
                    )}
                    <span className="text-emerald-600 dark:text-emerald-400 text-sm font-medium">
                        Read more →
                    </span>
                </div>
            </div>
        </Link>
    );
}
