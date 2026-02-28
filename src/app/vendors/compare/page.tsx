'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getVendor, type Vendor } from '@/services/vendorService';
import { ArrowLeft, Star, ExternalLink, Check, X, Users, Award, ShieldCheck, Loader2, Plus, Sparkles } from 'lucide-react';

import Sidebar from '@/components/layout/Sidebar';
import TickerTape from '@/components/layout/TickerTape';
import Header from '@/components/layout/Header';
import { AIAnalysisPanel } from '@/components/ai/AIAnalysisPanel';
import Footer from '@/components/layout/Footer';

function CompareContent() {
    const searchParams = useSearchParams();
    const vendorIds = searchParams.get('ids')?.split(',').filter(Boolean) || [];

    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadVendors() {
            if (vendorIds.length === 0) {
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const vendorPromises = vendorIds.map(id => getVendor(id));
                const loadedVendors = await Promise.all(vendorPromises);
                setVendors(loadedVendors.filter(Boolean));
            } catch (error) {
                console.error('Failed to load vendors:', error);
            } finally {
                setLoading(false);
            }
        }
        loadVendors();
    }, [vendorIds.join(',')]);

    // Get all unique services across vendors
    const allServices = Array.from(new Set(vendors.flatMap(v => v.services || [])));

    // Find best vendor per metric
    const bestRating = Math.max(...vendors.map(v => v.rating || 0));
    const bestReviews = Math.max(...vendors.map(v => v.reviewCount || 0));

    if (loading) {
        return (
            <div className="flex items-center justify-center py-32">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            </div>
        );
    }

    if (vendors.length === 0) {
        return (
            <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-2xl">
                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Plus className="w-10 h-10 text-slate-400" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">No vendors selected</h2>
                <p className="text-slate-500 mb-6">Select at least 2 vendors from the directory to compare</p>
                <Link
                    href="/vendors"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl transition"
                >
                    <ArrowLeft size={18} />
                    Go to Vendor Directory
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Comparison Table */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        {/* Header - Vendor Info */}
                        <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-700">
                                <th className="p-4 text-left text-sm font-medium text-slate-500 w-48 bg-slate-50 dark:bg-slate-800/50">
                                    Provider
                                </th>
                                {vendors.map(vendor => (
                                    <th key={vendor.id} className="p-6 text-center min-w-[200px]">
                                        <div className="flex flex-col items-center">
                                            <div className="w-16 h-16 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden mb-3">
                                                {vendor.logoUrl ? (
                                                    <img src={vendor.logoUrl} alt={vendor.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-2xl font-bold text-slate-400">{vendor.name.charAt(0)}</span>
                                                )}
                                            </div>
                                            <h3 className="font-bold text-slate-900 dark:text-white">{vendor.name}</h3>
                                            {vendor.isFeatured && (
                                                <span className="mt-1 text-[10px] font-bold px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center gap-1">
                                                    <ShieldCheck size={10} /> FEATURED
                                                </span>
                                            )}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {/* Rating */}
                            <tr>
                                <td className="p-4 text-sm font-medium text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50">
                                    <div className="flex items-center gap-2">
                                        <Star size={16} className="text-amber-500" />
                                        Rating
                                    </div>
                                </td>
                                {vendors.map(vendor => (
                                    <td key={vendor.id} className="p-4 text-center">
                                        <div className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg ${vendor.rating === bestRating && bestRating > 0
                                            ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 ring-2 ring-amber-500/30'
                                            : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                                            }`}>
                                            <Star size={14} fill="currentColor" />
                                            <span className="font-bold">{vendor.rating?.toFixed(1) || 'N/A'}</span>
                                            {vendor.rating === bestRating && bestRating > 0 && (
                                                <Award size={14} className="text-amber-600 ml-1" />
                                            )}
                                        </div>
                                    </td>
                                ))}
                            </tr>

                            {/* Reviews */}
                            <tr>
                                <td className="p-4 text-sm font-medium text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50">
                                    <div className="flex items-center gap-2">
                                        <Users size={16} className="text-blue-500" />
                                        Reviews
                                    </div>
                                </td>
                                {vendors.map(vendor => (
                                    <td key={vendor.id} className="p-4 text-center">
                                        <span className={`font-medium ${vendor.reviewCount === bestReviews && bestReviews > 0
                                            ? 'text-blue-600 dark:text-blue-400'
                                            : 'text-slate-700 dark:text-slate-300'
                                            }`}>
                                            {vendor.reviewCount || 0} reviews
                                        </span>
                                    </td>
                                ))}
                            </tr>

                            {/* Category */}
                            <tr>
                                <td className="p-4 text-sm font-medium text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50">
                                    Category
                                </td>
                                {vendors.map(vendor => (
                                    <td key={vendor.id} className="p-4 text-center">
                                        <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300">
                                            {vendor.category || 'General'}
                                        </span>
                                    </td>
                                ))}
                            </tr>

                            {/* Description */}
                            <tr>
                                <td className="p-4 text-sm font-medium text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50">
                                    Description
                                </td>
                                {vendors.map(vendor => (
                                    <td key={vendor.id} className="p-4 text-center">
                                        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3">
                                            {vendor.description || '-'}
                                        </p>
                                    </td>
                                ))}
                            </tr>

                            {/* Services Header */}
                            {allServices.length > 0 && (
                                <tr>
                                    <td colSpan={vendors.length + 1} className="p-4 bg-slate-100 dark:bg-slate-700/50">
                                        <span className="font-bold text-slate-900 dark:text-white">Services Offered</span>
                                    </td>
                                </tr>
                            )}

                            {/* Each Service */}
                            {allServices.slice(0, 10).map(service => (
                                <tr key={service}>
                                    <td className="p-4 text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50">
                                        {service}
                                    </td>
                                    {vendors.map(vendor => {
                                        const hasService = vendor.services?.includes(service);
                                        return (
                                            <td key={vendor.id} className="p-4 text-center">
                                                {hasService ? (
                                                    <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                                                        <Check size={18} />
                                                    </div>
                                                ) : (
                                                    <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-400">
                                                        <X size={18} />
                                                    </div>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}

                            {/* Website Links */}
                            <tr>
                                <td className="p-4 text-sm font-medium text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50">
                                    Website
                                </td>
                                {vendors.map(vendor => (
                                    <td key={vendor.id} className="p-4 text-center">
                                        {vendor.website ? (
                                            <a
                                                href={vendor.website}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline text-sm"
                                            >
                                                Visit <ExternalLink size={14} />
                                            </a>
                                        ) : (
                                            <span className="text-slate-400">-</span>
                                        )}
                                    </td>
                                ))}
                            </tr>

                            {/* Action Row */}
                            <tr>
                                <td className="p-4 bg-slate-50 dark:bg-slate-800/50"></td>
                                {vendors.map(vendor => (
                                    <td key={vendor.id} className="p-4 text-center">
                                        <Link
                                            href={`/vendors/${vendor.id}`}
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium rounded-lg hover:opacity-90 transition text-sm"
                                        >
                                            View Details
                                        </Link>
                                    </td>
                                ))}
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* AI Analysis Section */}
            <AIAnalysisPanel
                title="AI Comparison Analysis"
                pageType="vendor-compare"
                pageData={{ vendors, comparison: true }}
                autoAnalyze={false}
                quickPrompts={[
                    "Which vendor is best for beginners?",
                    "Compare fees and costs",
                    "Key differences summary",
                    "Best for customer support",
                    "Recommend the best choice"
                ]}
            />
        </div>
    );
}

export default function VendorComparePage() {
    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-slate-900">
            <Sidebar />

            <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
                <div className="fixed top-0 right-0 left-0 lg:left-64 z-40 bg-gray-50 dark:bg-slate-900">
                    <TickerTape />
                    <Header />
                </div>

                <div className="flex-1 pt-[112px] md:pt-[120px] pb-20 overflow-x-hidden">
                    {/* Page Header */}
                    <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-6 py-6">
                            <div className="flex items-center gap-4">
                                <Link
                                    href="/vendors"
                                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
                                >
                                    <ArrowLeft size={20} className="text-slate-500" />
                                </Link>
                                <div>
                                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        <Sparkles className="w-6 h-6 text-emerald-500" />
                                        Compare Providers
                                    </h1>
                                    <p className="text-sm text-slate-500">
                                        Side-by-side comparison with AI-powered insights
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-6 py-8">
                        <Suspense fallback={
                            <div className="flex items-center justify-center py-32">
                                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                            </div>
                        }>
                            <CompareContent />
                        </Suspense>
                    </div>
                </div>
              <Footer />
      </main>
        </div>
    );
}
