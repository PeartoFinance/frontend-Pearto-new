'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/layout/Sidebar';
import TickerTape from '@/components/layout/TickerTape';
import Header from '@/components/layout/Header';
import { AIAnalysisPanel } from '@/components/ai/AIAnalysisPanel';
import { getStockOffers, StockOffer } from '@/services/marketService';
import PriceDisplay from '@/components/common/PriceDisplay';
import {
    ArrowLeft, FileText, Loader2, AlertCircle,
    RefreshCw, Calendar, DollarSign, Clock, CheckCircle, XCircle
} from 'lucide-react';

type TabType = 'IPO' | 'FPO' | 'Rights';

const tabs: TabType[] = ['IPO', 'FPO', 'Rights'];

export default function OfferingsPage() {
    const [activeTab, setActiveTab] = useState<TabType>('IPO');
    const [offers, setOffers] = useState<StockOffer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const fetchOffers = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getStockOffers();
            setOffers(data || []);
            setError(false);
        } catch (err) {
            console.error('Failed to fetch offers:', err);
            setError(true);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOffers();
    }, [fetchOffers]);

    const filteredOffers = offers.filter(o => o.offerType?.toUpperCase() === activeTab);

    // Stats
    const totalOffers = filteredOffers.length;
    const openOffers = filteredOffers.filter(o => o.status?.toLowerCase() === 'open' || o.status?.toLowerCase() === 'ongoing').length;
    const totalUnits = filteredOffers.reduce((sum, o) => sum + (o.sharesOffered || 0), 0);
    const totalValue = filteredOffers.reduce((sum, o) => sum + ((o.sharesOffered || 0) * (o.offerPrice || 0)), 0);

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return 'TBA';
        try {
            return new Date(dateStr).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
        } catch {
            return dateStr;
        }
    };

    const formatNumber = (num: number | null | undefined) => {
        if (num == null) return '-';
        return num.toLocaleString();
    };

    const formatLargeNumber = (num: number | null | undefined) => {
        if (num == null) return '-';
        if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
        if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
        if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
        return num.toLocaleString();
    };

    const getStatusBadge = (status?: string) => {
        const s = status?.toLowerCase() || '';
        if (s === 'open' || s === 'ongoing') {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle size={12} />
                    Open
                </span>
            );
        } else if (s === 'closed' || s === 'completed') {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                    <XCircle size={12} />
                    Closed
                </span>
            );
        } else if (s === 'upcoming') {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                    <Clock size={12} />
                    Upcoming
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                {status || 'Pending'}
            </span>
        );
    };

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-slate-900">
            <Sidebar />

            <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
                <div className="fixed top-0 right-0 left-0 lg:left-64 z-40 bg-gray-50 dark:bg-slate-900">
                    <TickerTape />
                    <Header />
                </div>

                <div className="flex-1 pt-[112px] md:pt-[120px] overflow-x-hidden">
                    <div className="p-4 lg:p-6 space-y-6 w-full max-w-7xl mx-auto">
                        {/* Back Link */}
                        <Link href="/markets" className="inline-flex items-center gap-2 text-slate-500 hover:text-emerald-500 text-sm">
                            <ArrowLeft size={16} />
                            Back to Markets
                        </Link>

                        {/* Header */}
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                                    <FileText className="w-7 h-7 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                                        Public Offerings
                                    </h1>
                                    <p className="text-slate-500">IPOs, FPOs, and Rights Issues</p>
                                </div>
                            </div>
                            <button
                                onClick={fetchOffers}
                                disabled={loading}
                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                            >
                                <RefreshCw size={18} className={`text-slate-500 ${loading ? 'animate-spin' : ''}`} />
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex gap-2 bg-white dark:bg-slate-800 rounded-xl p-1 border border-slate-200 dark:border-slate-700 w-fit">
                            {tabs.map((tab) => {
                                const count = offers.filter(o => o.offerType?.toUpperCase() === tab).length;
                                return (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition ${activeTab === tab
                                            ? 'bg-orange-500 text-white'
                                            : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                            }`}
                                    >
                                        {tab}
                                        <span className={`ml-1 px-1.5 py-0.5 text-xs rounded ${activeTab === tab
                                            ? 'bg-orange-600'
                                            : 'bg-slate-200 dark:bg-slate-600'
                                            }`}>
                                            {count}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                                <p className="text-sm text-slate-500 mb-1">Total {activeTab}s</p>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalOffers}</p>
                            </div>
                            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                                <p className="text-sm text-slate-500 mb-1">Open Now</p>
                                <p className="text-2xl font-bold text-emerald-500">{openOffers}</p>
                            </div>
                            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                                <p className="text-sm text-slate-500 mb-1">Total Units</p>
                                <p className="text-2xl font-bold text-orange-500">{formatLargeNumber(totalUnits)}</p>
                            </div>
                            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                                <p className="text-sm text-slate-500 mb-1">Total Value</p>
                                <p className="text-2xl font-bold text-blue-500"><PriceDisplay amount={totalValue} options={{ notation: 'compact' }} /></p>
                            </div>
                        </div>

                        {/* AI Analysis */}
                        <AIAnalysisPanel
                            title={`${activeTab} Analysis`}
                            pageType="offerings"
                            pageData={{
                                type: activeTab,
                                totalOffers,
                                openOffers,
                                totalUnits,
                                totalValue,
                                offers: filteredOffers.slice(0, 15).map(o => ({
                                    symbol: o.symbol,
                                    company: o.companyName,
                                    units: o.sharesOffered,
                                    price: o.offerPrice,
                                    status: o.status,
                                    openDate: o.openDate,
                                    closeDate: o.closeDate
                                }))
                            }}
                            autoAnalyze={filteredOffers.length > 0}
                            quickPrompts={[
                                `Best ${activeTab} opportunities`,
                                'Which to apply for?',
                                'Market outlook'
                            ]}
                        />

                        {/* Data */}
                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                            </div>
                        ) : error ? (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-8 text-center">
                                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                                <p className="text-red-600 dark:text-red-400">Failed to load offerings data</p>
                            </div>
                        ) : filteredOffers.length === 0 ? (
                            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-12 text-center">
                                <FileText className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                                <p className="text-slate-500">No {activeTab} offerings available</p>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {filteredOffers.map((offer) => (
                                    <div
                                        key={offer.id || offer.symbol}
                                        className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 hover:border-orange-300 dark:hover:border-orange-700 transition"
                                    >
                                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                            {/* Left: Company Info */}
                                            <div className="flex items-start gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 flex items-center justify-center">
                                                    <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
                                                        {offer.symbol?.slice(0, 2) || 'NA'}
                                                    </span>
                                                </div>
                                                <div>
                                                    <Link href={`/stocks/${offer.symbol}`} className="text-lg font-semibold text-slate-900 dark:text-white hover:text-orange-500 transition">
                                                        {offer.symbol || 'N/A'}
                                                    </Link>
                                                    <p className="text-sm text-slate-500 max-w-md">{offer.companyName || 'Company Name'}</p>
                                                    <div className="flex flex-wrap items-center gap-2 mt-2">
                                                        {getStatusBadge(offer.status)}
                                                        <span className="text-xs text-slate-400 px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded">
                                                            {activeTab}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Right: Key Metrics */}
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
                                                <div className="text-center lg:text-right">
                                                    <p className="text-xs text-slate-500 mb-1">Units</p>
                                                    <p className="text-lg font-bold text-slate-900 dark:text-white">
                                                        {formatLargeNumber(offer.sharesOffered)}
                                                    </p>
                                                </div>
                                                <div className="text-center lg:text-right">
                                                    <p className="text-xs text-slate-500 mb-1">Price</p>
                                                    <p className="text-lg font-bold text-emerald-500">
                                                        <PriceDisplay amount={offer.offerPrice} />
                                                    </p>
                                                </div>
                                                <div className="text-center lg:text-right">
                                                    <p className="text-xs text-slate-500 mb-1">Open Date</p>
                                                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center justify-center lg:justify-end gap-1">
                                                        <Calendar size={12} />
                                                        {formatDate(offer.openDate)}
                                                    </p>
                                                </div>
                                                <div className="text-center lg:text-right">
                                                    <p className="text-xs text-slate-500 mb-1">Close Date</p>
                                                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center justify-center lg:justify-end gap-1">
                                                        <Calendar size={12} />
                                                        {formatDate(offer.closeDate)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
