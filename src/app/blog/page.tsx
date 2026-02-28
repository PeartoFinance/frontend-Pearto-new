'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import TickerTape from '@/components/layout/TickerTape';
import Header from '@/components/layout/Header';
import BlogCard from '@/components/blog/BlogCard';
import { getPublishedPosts, getBlogCategories, type BlogPost, type BlogCategory } from '@/services/blogService';
import { FileText, Search, RefreshCw, ArrowLeft } from 'lucide-react';
import { AIWidget } from '@/components/ai';
import Footer from '@/components/layout/Footer';

function BlogLoading() {
    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-slate-900">
            <Sidebar />
            <main className="flex-1 flex flex-col min-h-screen">
                <div className="fixed top-0 right-0 left-0 lg:left-64 z-40 bg-gray-50 dark:bg-slate-900">
                    <TickerTape />
                    <Header />
                </div>
                <div className="flex-1 pt-[112px] md:pt-[120px] px-4 lg:mt-10 lg:px-6 py-6">
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
                </div>
              <Footer />
      </main>
        </div>
    );
}

function BlogContent() {
    const searchParams = useSearchParams();
    const categoryParam = searchParams.get('category');
    const queryParam = searchParams.get('q');

    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState(queryParam || '');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(categoryParam);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [categories, setCategories] = useState<BlogCategory[]>([]);
    const POSTS_PER_PAGE = 20;

    useEffect(() => {
        getBlogCategories().then(setCategories).catch(() => {});
    }, []);

    useEffect(() => {
        if (categoryParam) {
            setSelectedCategory(categoryParam);
            setCurrentPage(1);
        } else {
            setSelectedCategory(null);
        }
    }, [categoryParam]);

    useEffect(() => {
        if (queryParam) {
            setSearchQuery(queryParam);
            setCurrentPage(1);
        }
    }, [queryParam]);

    useEffect(() => {
        loadPosts();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [selectedCategory, currentPage, searchQuery]);

    const loadPosts = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await getPublishedPosts({
                limit: POSTS_PER_PAGE,
                page: currentPage,
                category: selectedCategory || undefined,
                search: searchQuery.trim() || undefined
            });
            setPosts(response.items || []);
            const total = response.total || 0;
            setTotalPages(Math.ceil(total / POSTS_PER_PAGE));
        } catch (err) {
            console.error('Failed to fetch blog posts:', err);
            setError('Failed to load blog posts');
            setPosts([]);
        } finally {
            setLoading(false);
        }
    };

    const filteredPosts = posts.filter(post => {
        if (!searchQuery.trim()) return true;
        const query = searchQuery.toLowerCase();
        return (
            post.title.toLowerCase().includes(query) ||
            (post.excerpt || '').toLowerCase().includes(query)
        );
    });

    const featuredPosts = filteredPosts.filter(p => p.isFeatured).slice(0, 3);
    const regularPosts = filteredPosts.filter(p => !featuredPosts.includes(p));

    const currentCat = selectedCategory
        ? categories.find(c => c.slug === selectedCategory) || null
        : null;

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-slate-900">
            <Sidebar />

            <main className="flex-1 flex flex-col min-h-screen">
                {/* Fixed Header */}
                <div className="fixed top-0 right-0 left-0 lg:left-64 z-40 bg-gray-50 dark:bg-slate-900">
                    <TickerTape />
                    <Header />
                </div>

                {/* Content */}
                <div className="flex-1 pt-[112px] md:pt-[120px]">
                    {/* Hero Header */}
                    <div className="bg-white dark:bg-slate-900 lg:mt-8 py-8 px-4 lg:px-6 border-b border-slate-200 dark:border-slate-800">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            <div>
                                {selectedCategory && (
                                    <button
                                        onClick={() => setSelectedCategory(null)}
                                        className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 mb-2 transition-colors text-sm"
                                    >
                                        <ArrowLeft size={14} />
                                        Back to All Posts
                                    </button>
                                )}

                                <div className="flex items-center gap-3">
                                    <FileText className="w-6 h-6 text-emerald-600 dark:text-emerald-500" />
                                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                                        {currentCat ? currentCat.name : 'Blog'}
                                    </h1>
                                </div>
                                <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
                                    {currentCat
                                        ? `Showing ${currentCat.count} posts in ${currentCat.name}`
                                        : 'Insights, analysis, and updates from the Pearto Finance team'
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
                                        placeholder="Search posts..."
                                        className="flex-1 bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none text-sm"
                                    />
                                </div>
                                <button
                                    onClick={loadPosts}
                                    disabled={loading}
                                    className="flex items-center gap-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors text-sm"
                                >
                                    <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                                    Refresh
                                </button>
                                <span className="text-slate-500 text-sm hidden sm:inline">
                                    {filteredPosts.length} posts
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="px-4 lg:px-6 py-6 space-y-6">
                        {/* Category Navigation */}
                        {!selectedCategory && categories.length > 0 && (
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Browse by Category</h2>
                                <div className="flex flex-wrap gap-2">
                                    {categories.map((cat) => (
                                        <button
                                            key={cat.id}
                                            onClick={() => {
                                                setSelectedCategory(cat.slug);
                                                setCurrentPage(1);
                                            }}
                                            className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 rounded-lg transition-colors"
                                        >
                                            {cat.icon && <span>{cat.icon}</span>}
                                            <span className="font-medium text-slate-700 dark:text-slate-300">{cat.name}</span>
                                            <span className="text-xs text-slate-400 dark:text-slate-500">({cat.count})</span>
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

                        {/* Featured Posts (Only on page 1) */}
                        {!loading && currentPage === 1 && featuredPosts.length > 0 && (
                            <div>
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">Featured Posts</h2>
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                    {featuredPosts.map((post, index) => (
                                        <BlogCard
                                            key={post.id}
                                            post={post}
                                            featured={index === 0}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* All Posts */}
                        {!loading && regularPosts.length > 0 && (
                            <div>
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">
                                    {selectedCategory ? `Latest in ${currentCat?.name || selectedCategory}` : 'All Posts'}
                                    <span className="text-sm font-normal text-slate-500 ml-2">
                                        (Page {currentPage})
                                    </span>
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-8">
                                    {regularPosts.map((post) => (
                                        <BlogCard key={post.id} post={post} />
                                    ))}
                                </div>

                                {/* Pagination */}
                                <div className="flex justify-center items-center gap-2 mt-8">
                                    <button
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1 || loading}
                                        className="px-4 py-2 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                                    >
                                        Previous
                                    </button>
                                    <span className="text-sm text-slate-600 dark:text-slate-400 font-medium px-2">
                                        Page {currentPage} of {totalPages}
                                    </span>
                                    <button
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage >= totalPages || loading}
                                        className="px-4 py-2 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Empty State */}
                        {!loading && filteredPosts.length === 0 && (
                            <div className="text-center py-16">
                                <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">No posts found</h3>
                                <p className="text-slate-500">
                                    {searchQuery
                                        ? `No posts match "${searchQuery}"`
                                        : 'No blog posts available at the moment'
                                    }
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <AIWidget
                type="floating"
                position="bottom-right"
                pageType="blog"
                quickPrompts={["Latest insights", "Market analysis"]}
            />
        </div>
    );
}

export default function BlogPage() {
    return (
        <Suspense fallback={<BlogLoading />}>
            <BlogContent />
        </Suspense>
    );
}
