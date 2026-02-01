'use client';

import { useState, useEffect, use } from 'react'; // use is React 19 hook for promises
import Link from 'next/link';
import { getVendor, getVendorReviews, type Vendor } from '@/services/vendorService';
import {
    MapPin, Globe, Phone, Mail, Star, ShieldCheck,
    ArrowLeft, Calendar, FileText, BarChart2, MessageSquare, Briefcase
} from 'lucide-react';
import VendorAnalysis from '@/components/vendors/VendorAnalysis';
import { useParams } from 'next/navigation';
import WriteReviewModal from '@/components/vendors/WriteReviewModal';

// Since this is a client component (for tabs/state), we use params via props or hook.
// In Next 15+, page props params is a promise. 
// A safer way for client component page is to unwrap it or just use useParams() hook if we don't need SEO pre-render props immediately.
// For "full vendor details history", let's use client fetch to keep it dynamic and consistent with other pages.

import Sidebar from '@/components/layout/Sidebar';
import TickerTape from '@/components/layout/TickerTape';
import Header from '@/components/layout/Header';
import { AIAnalysisPanel } from '@/components/ai/AIAnalysisPanel';

export default function VendorDetailPage({ params }: { params: Promise<{ id: string }> }) {
    // React 19: Unwrapping params with `use()` is standard for async props, 
    // but since we are 'use client', we can resolve it or use the hook.
    // Let's use the hook for simplicity in 'use client' pages if params is awkward.
    // actually `use(params)` is best practice in next 15 for client components receiving params.
    const { id } = use(params);

    const [vendor, setVendor] = useState<Vendor | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'analysis' | 'reviews'>('overview');
    const [reviews, setReviews] = useState<any[]>([]);
    const [showReviewModal, setShowReviewModal] = useState(false);

    const refreshReviews = async () => {
        if (!id) return;
        try {
            const r = await getVendorReviews(id);
            setReviews(r.reviews);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        async function loadData() {
            try {
                const v = await getVendor(id);
                setVendor(v);

                // Load reviews concurrently
                const r = await getVendorReviews(id);
                setReviews(r.reviews);
            } catch (err) {
                console.error("Failed to load vendor", err);
            } finally {
                setLoading(false);
            }
        }
        if (id) loadData();
    }, [id]);

    if (loading) {
        return (
            <div className="flex min-h-screen bg-gray-50 dark:bg-slate-900">
                <Sidebar />
                <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
                    <div className="fixed top-0 right-0 left-0 lg:left-64 z-40 bg-gray-50 dark:bg-slate-900">
                        <TickerTape />
                        <Header />
                    </div>
                    <div className="flex-1 pt-[112px] md:pt-[120px] pb-20 overflow-x-hidden flex items-center justify-center">
                        <div className="text-center">
                            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-slate-500">Loading vendor profile...</p>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    if (!vendor) {
        return (
            <div className="flex min-h-screen bg-gray-50 dark:bg-slate-900">
                <Sidebar />
                <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
                    <div className="fixed top-0 right-0 left-0 lg:left-64 z-40 bg-gray-50 dark:bg-slate-900">
                        <TickerTape />
                        <Header />
                    </div>
                    <div className="flex-1 pt-[112px] md:pt-[120px] pb-20 overflow-x-hidden flex flex-col items-center justify-center p-4">
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Vendor Not Found</h1>
                        <Link href="/vendors" className="text-emerald-500 hover:underline">Return to Directory</Link>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-slate-900">
            <Sidebar />

            <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
                <div className="fixed top-0 right-0 left-0 lg:left-64 z-40 bg-gray-50 dark:bg-slate-900">
                    <TickerTape />
                    <Header />
                </div>

                <div className="flex-1 pt-[112px] md:pt-[120px] pb-20 overflow-x-hidden">
                    {/* Breadcrumb / Back */}
                    <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-6 h-16 flex items-center">
                            <Link href="/vendors" className="flex items-center gap-2 text-slate-500 hover:text-emerald-500 transition">
                                <ArrowLeft size={18} />
                                <span className="text-sm font-medium">Back to Directory</span>
                            </Link>
                        </div>
                    </div>

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-6 py-8">
                        {/* Header Profile */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 md:p-8 border border-slate-200 dark:border-slate-700 shadow-sm mb-8">
                            <div className="flex flex-col md:flex-row gap-6 md:gap-8">
                                <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-slate-100 dark:bg-slate-700 flex-shrink-0 overflow-hidden flex items-center justify-center border border-slate-200 dark:border-slate-600">
                                    {vendor.logoUrl ? (
                                        <img src={vendor.logoUrl} alt={vendor.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-4xl font-bold text-slate-400">{vendor.name.charAt(0)}</span>
                                    )}
                                </div>

                                <div className="flex-1">
                                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                        <div>
                                            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                                                {vendor.name}
                                                {vendor.isFeatured && (
                                                    <ShieldCheck className="w-6 h-6 text-emerald-500" />
                                                )}
                                            </h1>
                                            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mb-4">
                                                <span className="flex items-center gap-1">
                                                    <Briefcase className="w-4 h-4" />
                                                    {vendor.category}
                                                </span>
                                                {vendor.countryCode && (
                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="w-4 h-4" />
                                                        {vendor.countryCode}
                                                    </span>
                                                )}
                                                <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded text-amber-700 dark:text-amber-400">
                                                    <Star size={14} className="fill-amber-500 text-amber-500" />
                                                    <span className="font-bold">{vendor.rating.toFixed(1)}</span>
                                                    <span className="text-xs opacity-75">({vendor.reviewCount} reviews)</span>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap gap-2">
                                                {vendor.website && (
                                                    <a href={vendor.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 text-sm transition transition-colors">
                                                        <Globe size={14} /> Website
                                                    </a>
                                                )}
                                                <button className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-400 cursor-not-allowed text-sm">
                                                    <Phone size={14} /> Contact
                                                </button>
                                            </div>
                                        </div>

                                        {/* Get Quote button removed */}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b border-slate-200 dark:border-slate-800 mb-8 overflow-x-auto">
                            <button
                                onClick={() => setActiveTab('overview')}
                                className={`px-6 py-3 text-sm font-medium border-b-2 transition whitespace-nowrap flex items-center gap-2 ${activeTab === 'overview'
                                    ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                                    }`}
                            >
                                <FileText size={18} /> Overview
                            </button>
                            <button
                                onClick={() => setActiveTab('analysis')}
                                className={`px-6 py-3 text-sm font-medium border-b-2 transition whitespace-nowrap flex items-center gap-2 ${activeTab === 'analysis'
                                    ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                                    }`}
                            >
                                <BarChart2 size={18} /> Analysis & Trends
                            </button>
                            <button
                                onClick={() => setActiveTab('reviews')}
                                className={`px-6 py-3 text-sm font-medium border-b-2 transition whitespace-nowrap flex items-center gap-2 ${activeTab === 'reviews'
                                    ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                                    }`}
                            >
                                <MessageSquare size={18} /> Reviews
                            </button>
                        </div>

                        {/* Content */}
                        <div className="min-h-[400px]">
                            {activeTab === 'overview' && (
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    <div className="lg:col-span-2 space-y-8">
                                        <section>
                                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">About {vendor.name}</h2>
                                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap">
                                                {vendor.description || "No description provided."}
                                            </p>
                                        </section>

                                        <section>
                                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Services Offered</h2>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {vendor.services?.map(service => (
                                                    <div key={service} className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                                            <ShieldCheck size={18} />
                                                        </div>
                                                        <span className="font-medium text-slate-900 dark:text-white">{service}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </section>
                                    </div>

                                    <div className="space-y-6">
                                        {/* AI Advisor Section */}
                                        <AIAnalysisPanel
                                            title="AI Vendor Advisor"
                                            pageType="vendor-detail"
                                            pageData={vendor}
                                            autoAnalyze={false}
                                            compact={true}
                                            quickPrompts={[
                                                `Analyze ${vendor.name}`,
                                                "Pros and cons",
                                                "Compare alternatives",
                                                "Is it trustworthy?"
                                            ]}
                                        />

                                        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                                            <h3 className="font-bold text-slate-900 dark:text-white mb-4">Vendor Details</h3>
                                            <div className="space-y-4">
                                                {vendor.createdAt && (
                                                    <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700 last:border-0">
                                                        <span className="text-slate-500 text-sm">Joined Platform</span>
                                                        <span className="text-slate-900 dark:text-white text-sm font-medium">{new Date(vendor.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                )}
                                                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700 last:border-0">
                                                    <span className="text-slate-500 text-sm">Category</span>
                                                    <span className="text-slate-900 dark:text-white text-sm font-medium">{vendor.category}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'analysis' && (
                                <div className="space-y-6">
                                    <p className="text-slate-600 dark:text-slate-400 mb-6">
                                        Analyze historical performance and trends for {vendor.name}.
                                        This data helps in understanding stability and rate fluctuations.
                                    </p>
                                    <VendorAnalysis vendorId={vendor.id} />
                                </div>
                            )}

                            {activeTab === 'reviews' && (
                                <div className="space-y-8">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">{reviews.length} Customer Reviews</h3>
                                        <button
                                            onClick={() => setShowReviewModal(true)}
                                            className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-sm font-medium hover:opacity-90 transition"
                                        >
                                            Write a Review
                                        </button>
                                    </div>

                                    <div className="grid gap-6">
                                        {reviews.length > 0 ? (
                                            reviews.map((review) => (
                                                <div key={review.id} className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                                                                {review.userAvatar ? (
                                                                    <img src={review.userAvatar} alt="User" />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center text-slate-500">
                                                                        <Star size={16} />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold text-slate-900 dark:text-white">{review.userName}</p>
                                                                <p className="text-xs text-slate-500">{new Date(review.date).toLocaleDateString()}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded">
                                                            <Star size={14} className="fill-amber-500 text-amber-500" />
                                                            <span className="font-bold text-amber-700 dark:text-amber-400">{review.rating}</span>
                                                        </div>
                                                    </div>
                                                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                                                        {review.comment}
                                                    </p>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                                                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3">
                                                    <MessageSquare className="w-6 h-6 text-slate-400" />
                                                </div>
                                                <p className="text-slate-500">No reviews yet. Be the first to share your experience!</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <WriteReviewModal
                vendorId={vendor.id}
                isOpen={showReviewModal}
                onClose={() => setShowReviewModal(false)}
                onSuccess={refreshReviews}
            />
        </div>
    );
}
