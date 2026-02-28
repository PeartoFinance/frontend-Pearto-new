'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/layout/Sidebar';
import TickerTape from '@/components/layout/TickerTape';
import Header from '@/components/layout/Header';
import { getArticleBySlug, getPublishedNews, type ArticleDetail, type NewsArticle } from '@/services/newsService';
import { getCategoryEmoji } from '@/data/newsData';
import { ArrowLeft, Clock, User, ExternalLink, Share2 } from 'lucide-react';
import { MarkdownRenderer } from '@/components/ai/MarkdownRenderer';
import Footer from '@/components/layout/Footer';

/** Detect if content is HTML (has tags) vs Markdown */
function isHtmlContent(content: string): boolean {
    return /<[a-z][\s\S]*>/i.test(content.trim());
}

export default function ArticlePage() {
    const params = useParams();
    const slug = params?.slug as string;

    const [article, setArticle] = useState<ArticleDetail | null>(null);
    const [relatedArticles, setRelatedArticles] = useState<NewsArticle[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (slug) {
            loadArticle();
        }
    }, [slug]);

    const loadArticle = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await getArticleBySlug(slug);
            if (response.success && response.data) {
                setArticle(response.data);
                const related = await getPublishedNews({
                    limit: 8,
                    category: response.data.category || undefined
                });
                setRelatedArticles(related.items.filter(a => a.slug !== slug).slice(0, 6));
            } else {
                setError(response.error || 'Article not found');
            }
        } catch (err) {
            console.error('Failed to fetch article:', err);
            setError('Failed to load article');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString?: string): string => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const timeAgo = (dateString?: string): string => {
        if (!dateString) return '';
        const now = Date.now();
        const then = new Date(dateString).getTime();
        const diff = Math.max(0, now - then);
        const hours = Math.floor(diff / 3600000);
        if (hours < 1) return 'Just now';
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    };

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-slate-900">
            <Sidebar />

            <main className="flex-1 flex flex-col min-h-screen">
                <div className="fixed top-0 right-0 left-0 lg:left-64 z-40 bg-gray-50 dark:bg-slate-900">
                    <TickerTape />
                    <Header />
                </div>

                <div className="flex-1 pt-[112px] md:pt-[120px]">
                    {/* Loading */}
                    {loading && (
                        <div className="p-6">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2 space-y-4 animate-pulse">
                                    <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
                                    <div className="aspect-video bg-slate-200 dark:bg-slate-700 rounded-xl" />
                                    <div className="space-y-3">
                                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded" />
                                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded" />
                                    </div>
                                </div>
                                <div className="hidden lg:block space-y-4 animate-pulse">
                                    <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className="h-24 bg-slate-200 dark:bg-slate-700 rounded-lg" />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Error */}
                    {error && !loading && (
                        <div className="p-6 text-center">
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Article Not Found</h1>
                            <p className="text-slate-500 mb-6">{error}</p>
                            <Link
                                href="/news"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
                            >
                                <ArrowLeft size={16} />
                                Back to News
                            </Link>
                        </div>
                    )}

                    {/* Article Layout */}
                    {article && !loading && (
                        <div className="p-6">
                            {/* Back Button */}
                            <Link
                                href="/news"
                                className="inline-flex items-center gap-2 text-slate-500 hover:text-emerald-500 mb-6 transition-colors"
                            >
                                <ArrowLeft size={18} />
                                <span>Back to News</span>
                            </Link>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Main Article */}
                                <article className="lg:col-span-2">
                                    {/* Category */}
                                    {article.category && (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-600 text-white rounded-lg text-sm font-medium mb-4">
                                            {getCategoryEmoji(article.category)}
                                            <span className="capitalize">{article.category}</span>
                                        </span>
                                    )}

                                    {/* Title */}
                                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-4 leading-tight">
                                        {article.title}
                                    </h1>

                                    {/* Meta Info */}
                                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mb-6">
                                        {article.author && (
                                            <span className="flex items-center gap-2">
                                                <User size={16} />
                                                {article.author}
                                            </span>
                                        )}
                                        {article.source && (
                                            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                                                {article.source}
                                            </span>
                                        )}
                                        {article.published_at && (
                                            <span className="flex items-center gap-2">
                                                <Clock size={16} />
                                                {formatDate(article.published_at)}
                                            </span>
                                        )}
                                    </div>

                                    {/* Featured Image */}
                                    {article.image && (
                                        <div className="mb-6 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                                            <img
                                                src={article.image}
                                                alt={article.title}
                                                className="w-full h-auto max-h-[500px] object-cover"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).style.display = 'none';
                                                }}
                                            />
                                        </div>
                                    )}

                                    {/* Summary */}
                                    {article.summary && (
                                        <p className="text-lg text-slate-700 dark:text-slate-300 mb-6 leading-relaxed border-l-4 border-emerald-500 pl-4">
                                            {article.summary}
                                        </p>
                                    )}

                                    {/* Full Content */}
                                    {article.full_content && (
                                        isHtmlContent(article.full_content) ? (
                                            <>
                                                <style dangerouslySetInnerHTML={{ __html: `
                                                    .dynamic-html-content [style],
                                                    .dynamic-html-content font {
                                                        color: inherit !important;
                                                        background-color: transparent !important;
                                                    }
                                                    .dynamic-html-content img {
                                                        border-radius: 0.75rem;
                                                        max-width: 100%;
                                                        height: auto;
                                                    }
                                                    .dynamic-html-content a {
                                                        color: #10b981;
                                                        text-decoration: underline;
                                                    }
                                                    .dynamic-html-content a:hover {
                                                        color: #059669;
                                                    }
                                                `}} />
                                                <div
                                                    className="prose prose-lg dark:prose-invert max-w-none dynamic-html-content"
                                                    dangerouslySetInnerHTML={{ __html: article.full_content }}
                                                />
                                            </>
                                        ) : (
                                            <MarkdownRenderer content={article.full_content} className="text-base" />
                                        )
                                    )}

                                    {/* Actions */}
                                    <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700 flex flex-wrap gap-3">
                                        {article.canonical_url && (
                                            <a
                                                href={article.canonical_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                                            >
                                                <ExternalLink size={16} />
                                                Read Original Article
                                            </a>
                                        )}
                                        <button
                                            onClick={() => navigator.share?.({ title: article.title, url: window.location.href })}
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
                                        >
                                            <Share2 size={16} />
                                            Share Article
                                        </button>
                                    </div>
                                </article>

                                {/* Sidebar - Related News */}
                                <aside className="lg:col-span-1">
                                    <div className="sticky top-28">
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 pb-2 border-b border-slate-200 dark:border-slate-700">
                                            Related News
                                        </h3>

                                        <div className="space-y-4">
                                            {relatedArticles.map((item) => (
                                                <Link
                                                    key={item.id}
                                                    href={item.isInternal ? `/news/${item.slug}` : (item.link || '#')}
                                                    target={item.isInternal ? undefined : '_blank'}
                                                    className="block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden hover:border-emerald-500 hover:shadow-md transition-all group"
                                                >
                                                    <div className="flex gap-3 p-3">
                                                        {item.image && (
                                                            <img
                                                                src={item.image}
                                                                alt=""
                                                                className="w-24 h-20 object-cover rounded-lg flex-shrink-0"
                                                            />
                                                        )}
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors mb-1">
                                                                {item.title}
                                                            </h4>
                                                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                                                <span className="font-medium">{item.source}</span>
                                                                <span>•</span>
                                                                <span>{timeAgo(item.publishedAt)}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Link>
                                            ))}

                                            {relatedArticles.length === 0 && (
                                                <p className="text-sm text-slate-500 text-center py-4">
                                                    No related articles available
                                                </p>
                                            )}
                                        </div>

                                        <Link
                                            href="/news"
                                            className="block mt-4 text-center py-3 bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition font-medium"
                                        >
                                            View All News →
                                        </Link>
                                    </div>
                                </aside>
                            </div>
                        </div>
                    )}
                </div>
              <Footer />
      </main>
        </div>
    );
}
