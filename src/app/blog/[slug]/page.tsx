'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/layout/Sidebar';
import TickerTape from '@/components/layout/TickerTape';
import Header from '@/components/layout/Header';
import { getPostBySlug, getPublishedPosts, type BlogPost } from '@/services/blogService';
import { ArrowLeft, Clock, Eye, Share2 } from 'lucide-react';
import { fixImageUrl } from '@/utils/imageUtils';
import { MarkdownRenderer } from '@/components/ai/MarkdownRenderer';
import Footer from '@/components/layout/Footer';

/** Detect if content is HTML (has tags) vs Markdown */
function isHtmlContent(content: string): boolean {
    return /<[a-z][\s\S]*>/i.test(content.trim());
}

export default function BlogPostPage() {
    const params = useParams();
    const slug = params?.slug as string;

    const [post, setPost] = useState<BlogPost | null>(null);
    const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (slug) loadPost();
    }, [slug]);

    const loadPost = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getPostBySlug(slug);
            setPost(data);

            // Load related posts from same category
            if (data.category?.slug) {
                const related = await getPublishedPosts({ limit: 6, category: data.category.slug });
                setRelatedPosts(related.items.filter(p => p.slug !== slug).slice(0, 4));
            }
        } catch (err) {
            console.error('Failed to fetch post:', err);
            setError('Post not found');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString?: string): string => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
        });
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
                            </div>
                        </div>
                    )}

                    {/* Error */}
                    {error && !loading && (
                        <div className="p-6 text-center">
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Post Not Found</h1>
                            <p className="text-slate-500 mb-6">{error}</p>
                            <Link
                                href="/blog"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
                            >
                                <ArrowLeft size={16} />
                                Back to Blog
                            </Link>
                        </div>
                    )}

                    {/* Post Layout */}
                    {post && !loading && (
                        <div className="p-6">
                            <Link
                                href="/blog"
                                className="inline-flex items-center gap-2 text-slate-500 hover:text-emerald-500 mb-6 transition-colors"
                            >
                                <ArrowLeft size={18} />
                                <span>Back to Blog</span>
                            </Link>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Main Post */}
                                <article className="lg:col-span-2">
                                    {/* Category Badge */}
                                    {post.category && (
                                        <Link
                                            href={`/blog?category=${post.category.slug}`}
                                            className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-600 text-white rounded-lg text-sm font-medium mb-4 hover:bg-emerald-700 transition"
                                        >
                                            {post.category.icon && <span>{post.category.icon}</span>}
                                            <span>{post.category.name}</span>
                                        </Link>
                                    )}

                                    {/* Title */}
                                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-4 leading-tight">
                                        {post.title}
                                    </h1>

                                    {/* Meta Info */}
                                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mb-6">
                                        {post.publishedAt && (
                                            <span className="flex items-center gap-2">
                                                <Clock size={16} />
                                                {formatDate(post.publishedAt)}
                                            </span>
                                        )}
                                        <span className="flex items-center gap-2">
                                            <Eye size={16} />
                                            {post.viewCount || 0} views
                                        </span>
                                    </div>

                                    {/* Featured Image */}
                                    {post.featuredImage && (
                                        <div className="mb-6 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                                            <img
                                                src={fixImageUrl(post.featuredImage)}
                                                alt={post.title}
                                                className="w-full h-auto max-h-[500px] object-cover"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).style.display = 'none';
                                                }}
                                            />
                                        </div>
                                    )}

                                    {/* Excerpt */}
                                    {post.excerpt && (
                                        <p className="text-lg text-slate-700 dark:text-slate-300 mb-6 leading-relaxed border-l-4 border-emerald-500 pl-4">
                                            {post.excerpt}
                                        </p>
                                    )}

                                    {/* Content */}
                                    {post.content && (
                                        isHtmlContent(post.content) ? (
                                            <>
                                                <style dangerouslySetInnerHTML={{
                                                    __html: `
                                                    .blog-content [style],
                                                    .blog-content font {
                                                        color: inherit !important;
                                                        background-color: transparent !important;
                                                    }
                                                    .blog-content img {
                                                        border-radius: 0.75rem;
                                                        max-width: 100%;
                                                        height: auto;
                                                    }
                                                    .blog-content a {
                                                        color: #10b981;
                                                        text-decoration: underline;
                                                    }
                                                    .blog-content a:hover {
                                                        color: #059669;
                                                    }
                                                `}} />
                                                <div
                                                    className="prose prose-lg dark:prose-invert max-w-none blog-content"
                                                    dangerouslySetInnerHTML={{ __html: post.content }}
                                                />
                                            </>
                                        ) : (
                                            <MarkdownRenderer content={post.content} className="text-base" />
                                        )
                                    )}

                                    {/* Tags */}
                                    {post.tags && post.tags.length > 0 && (
                                        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
                                            <div className="flex flex-wrap gap-2">
                                                {post.tags.map((tag, i) => (
                                                    <span
                                                        key={`${tag}-${i}`}
                                                        className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full text-sm"
                                                    >
                                                        #{tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Share */}
                                    <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                                        <button
                                            onClick={async () => {
                                                if (navigator.share) {
                                                    try {
                                                        await navigator.share({ title: post.title, url: window.location.href });
                                                    } catch (err) {
                                                        console.log('Share dismissed or failed', err);
                                                    }
                                                } else {
                                                    try {
                                                        await navigator.clipboard.writeText(window.location.href);
                                                        setCopied(true);
                                                        setTimeout(() => setCopied(false), 2000);
                                                    } catch (err) {
                                                        console.error('Failed to copy', err);
                                                    }
                                                }
                                            }}
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
                                        >
                                            {copied ? <span className="flex items-center gap-2"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Copied!</span> : <><Share2 size={16} /> Share Post</>}
                                        </button>
                                    </div>
                                </article>

                                {/* Sidebar - Related Posts */}
                                <aside className="lg:col-span-1">
                                    <div className="sticky top-28">
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 pb-2 border-b border-slate-200 dark:border-slate-700">
                                            Related Posts
                                        </h3>

                                        {relatedPosts.length > 0 ? (
                                            <div className="space-y-4">
                                                {relatedPosts.map((item) => (
                                                    <Link
                                                        key={item.id}
                                                        href={`/blog/${item.slug}`}
                                                        className="block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden hover:border-emerald-500 hover:shadow-md transition-all group"
                                                    >
                                                        <div className="flex gap-3 p-3">
                                                            {item.featuredImage && (
                                                                <img
                                                                    src={fixImageUrl(item.featuredImage)}
                                                                    alt=""
                                                                    className="w-20 h-16 rounded-lg object-cover flex-shrink-0"
                                                                    onError={(e) => {
                                                                        (e.target as HTMLImageElement).style.display = 'none';
                                                                    }}
                                                                />
                                                            )}
                                                            <div className="flex-1 min-w-0">
                                                                <h4 className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                                                    {item.title}
                                                                </h4>
                                                                {item.publishedAt && (
                                                                    <p className="text-xs text-slate-500 mt-1">{formatDate(item.publishedAt)}</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-slate-500">No related posts yet.</p>
                                        )}
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
