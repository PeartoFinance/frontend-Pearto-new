'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import Footer from '@/components/layout/Footer';
import { ArrowLeft, Calendar, Share2 } from 'lucide-react';

interface PageData {
    id: string;
    title: string;
    slug: string;
    content: string;
    metaTitle?: string;
    metaDescription?: string;
    template?: string;
    featuredImage?: string;
    createdAt?: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.pearto.com/api';

export default function DynamicPage({ params }: { params: Promise<{ slug: string }> }) {
    const resolvedParams = use(params);
    const [page, setPage] = useState<PageData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchPage = async () => {
            try {
                const userCountry = typeof window !== 'undefined' ? localStorage.getItem('userCountry') || 'US' : 'US';
                const res = await fetch(`${API_BASE}/pages/${resolvedParams.slug}`, {
                    headers: { 'X-User-Country': userCountry }
                });
                if (!res.ok) {
                    if (res.status === 404) {
                        setError('Page not found');
                    } else {
                        setError('Failed to load page');
                    }
                    setLoading(false);
                    return;
                }
                const data = await res.json();
                if (data.page) {
                    setPage(data.page);
                    // Update page title
                    document.title = data.page.metaTitle || data.page.title + ' | Pearto Finance';
                }
                setLoading(false);
            } catch {
                setError('Failed to load page');
                setLoading(false);
            }
        };
        fetchPage();
    }, [resolvedParams.slug]);

    const handleShare = async () => {
        if (navigator.share) {
            await navigator.share({
                title: page?.title,
                url: window.location.href,
            });
        } else {
            await navigator.clipboard.writeText(window.location.href);
            alert('Link copied to clipboard!');
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen bg-gray-50 dark:bg-slate-900">
                <Sidebar />
                <main className="flex-1 flex flex-col min-h-screen">
                    <div className="fixed top-0 right-0 left-0 lg:left-64 z-40 bg-gray-50 dark:bg-slate-900">
                        <Header />
                    </div>
                    <div className="flex-1 pt-[70px] lg:pt-[70px]">
                        <div className="max-w-4xl mx-auto p-6">
                            <div className="animate-pulse space-y-4">
                                <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
                                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
                                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6"></div>
                                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-4/6"></div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    if (error || !page) {
        return (
            <div className="flex min-h-screen bg-gray-50 dark:bg-slate-900">
                <Sidebar />
                <main className="flex-1 flex flex-col min-h-screen">
                    <div className="fixed top-0 right-0 left-0 lg:left-64 z-40 bg-gray-50 dark:bg-slate-900">
                        <Header />
                    </div>
                    <div className="flex-1 pt-[70px] lg:pt-[70px] flex items-center justify-center">
                        <div className="text-center">
                            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">404</h1>
                            <p className="text-slate-500 dark:text-slate-400 mb-6">{error || 'Page not found'}</p>
                            <Link
                                href="/"
                                className="px-6 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                            >
                                Go Home
                            </Link>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-slate-900">
            <Sidebar />
            <main className="flex-1 flex flex-col min-h-screen">
                {/* Fixed Header */}
                <div className="fixed top-0 right-0 left-0 lg:left-64 z-40 bg-gray-50 dark:bg-slate-900">
                    <Header />
                </div>

                {/* Content */}
                <div className="flex-1 pt-[70px] lg:pt-[70px]">
                    {/* Featured Image */}
                    {page.featuredImage && (
                        <div className="relative h-64 md:h-80 lg:h-96 overflow-hidden">
                            <img
                                src={page.featuredImage}
                                alt={page.title}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
                        </div>
                    )}

                    <div className="max-w-4xl mx-auto p-6">
                        {/* Breadcrumb */}
                        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-6">
                            <button onClick={() => router.back()} className="flex items-center gap-1 hover:text-emerald-500 transition-colors">
                                <ArrowLeft size={16} />
                                Back
                            </button>
                            <span>/</span>
                            <span className="text-slate-700 dark:text-slate-300">{page.title}</span>
                        </div>

                        {/* Page Header */}
                        <header className="mb-8">
                            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                                {page.title}
                            </h1>
                            <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                                {page.createdAt && (
                                    <span className="flex items-center gap-1">
                                        <Calendar size={14} />
                                        {new Date(page.createdAt).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </span>
                                )}
                                <button
                                    onClick={handleShare}
                                    className="flex items-center gap-1 hover:text-emerald-500 transition-colors"
                                >
                                    <Share2 size={14} />
                                    Share
                                </button>
                            </div>
                        </header>

                        {/* Page Content */}
                        <article className="prose prose-slate dark:prose-invert max-w-none">
                            <div dangerouslySetInnerHTML={{ __html: page.content }} />
                        </article>
                    </div>
                </div>

                {/* Footer */}
                <Footer />
            </main>
        </div>
    );
}
