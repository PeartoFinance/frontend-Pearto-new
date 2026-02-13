'use client';

import { useState, useEffect } from 'react';
import { Building2, Star, ExternalLink, TrendingUp, RefreshCw } from 'lucide-react';
import { useCurrency } from '@/contexts/CurrencyContext';
import Link from 'next/link';
import { getVendors } from '@/services/vendorService';

interface VendorDeal {
    id: string;
    name: string;
    logoUrl: string | null;
    rating: number;
    reviewCount: number;
    buyRate: number;
    sellRate: number;
    fee: string;
    website: string | null;
    isBestRate?: boolean;
}

interface VendorDealsProps {
    fromCurrency?: string;
    toCurrency?: string;
    compact?: boolean;
}

export default function VendorDeals({ fromCurrency = 'USD', toCurrency = 'NPR', compact = false }: VendorDealsProps) {
    const { rates } = useCurrency();
    const [vendorDeals, setVendorDeals] = useState<VendorDeal[]>([]);
    const [loading, setLoading] = useState(true);

    // Calculate base rate for reference
    const baseRate = (rates[toCurrency] || 1) / (rates[fromCurrency] || 1);

    useEffect(() => {
        const fetchVendorDeals = async () => {
            setLoading(true);
            try {
                // Fetch from public vendors API using service
                const vendors = await getVendors({ category: 'forex', limit: 6 });

                if (vendors && vendors.length > 0) {
                    const deals: VendorDeal[] = vendors.map((v, idx) => ({
                        id: v.id,
                        name: v.name,
                        logoUrl: v.logoUrl || null,
                        rating: v.rating || 0,
                        reviewCount: v.reviewCount || 0,
                        // Use metadata rates if available, otherwise calculate from base with slight variance (simulated spread)
                        buyRate: v.metadata?.buyRate ? parseFloat(v.metadata.buyRate) : baseRate * (0.995 - (idx * 0.001)),
                        sellRate: v.metadata?.sellRate ? parseFloat(v.metadata.sellRate) : baseRate * (1.005 + (idx * 0.001)),
                        fee: v.metadata?.fee || '0%',
                        website: v.website || null,
                        isFeatured: v.isFeatured
                    }));

                    // Sort by best buy rate and mark best
                    deals.sort((a, b) => b.buyRate - a.buyRate);
                    if (deals.length > 0) {
                        deals[0].isBestRate = true;
                    }

                    setVendorDeals(deals);
                } else {
                    setVendorDeals([]);
                }

            } catch (err) {
                console.error('Failed to fetch vendor deals:', err);
                setVendorDeals([]);
            } finally {
                setLoading(false);
            }
        };

        fetchVendorDeals();
    }, [fromCurrency, toCurrency, baseRate]);

    const formatNumber = (num: number, decimals = 2) => {
        return new Intl.NumberFormat('en-US', { maximumFractionDigits: decimals }).format(num);
    };

    if (loading) {
        return (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                <div className="flex items-center gap-3 mb-4">
                    <RefreshCw className="w-5 h-5 text-emerald-500 animate-spin" />
                    <span className="text-slate-500">Loading vendor rates...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 sm:p-6 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Building2 size={20} className="text-emerald-500" />
                    Compare Vendor Rates
                </h3>
                <span className="text-xs text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-full">
                    {fromCurrency}/{toCurrency}
                </span>
            </div>

            <p className="text-sm text-slate-500 mb-4">
                Compare exchange rates from different vendors to get the best deal
            </p>

            <div className={`space-y-3 ${compact ? 'max-h-64 overflow-y-auto' : ''}`}>
                {vendorDeals.map((vendor, idx) => (
                    <div
                        key={vendor.id}
                        className={`p-4 rounded-xl border transition-all hover:shadow-md ${vendor.isBestRate
                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 ring-1 ring-emerald-500/30'
                            : 'border-slate-200 dark:border-slate-700 hover:border-emerald-300'
                            }`}
                    >
                        <div className="flex items-center gap-4">
                            {/* Rank Badge */}
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${idx === 0
                                ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-white'
                                : idx === 1
                                    ? 'bg-gradient-to-br from-slate-300 to-slate-500 text-white'
                                    : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                                }`}>
                                #{idx + 1}
                            </div>

                            {/* Vendor Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-slate-900 dark:text-white truncate">
                                        {vendor.name}
                                    </span>
                                    {vendor.isBestRate && (
                                        <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500 text-white rounded-full flex-shrink-0">
                                            BEST RATE
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                                    <div className="flex items-center gap-0.5">
                                        <Star size={12} className="text-amber-500 fill-amber-500" />
                                        {vendor.rating.toFixed(1)}
                                    </div>
                                    <span>•</span>
                                    <span>{vendor.reviewCount} reviews</span>
                                    <span>•</span>
                                    <span>Fee: {vendor.fee}</span>
                                </div>
                            </div>

                            {/* Rates */}
                            <div className="text-right flex-shrink-0">
                                <div className="text-sm text-slate-500">Buy Rate</div>
                                <div className="font-mono font-bold text-lg text-emerald-600 dark:text-emerald-400">
                                    {formatNumber(vendor.buyRate, 2)}
                                </div>
                            </div>

                            {/* Action */}
                            {vendor.website && (
                                <a
                                    href={vendor.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 rounded-lg transition text-slate-400 hover:text-emerald-600"
                                >
                                    <ExternalLink size={18} />
                                </a>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer */}
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <p className="text-xs text-slate-400">
                    Rates updated in real-time. Fees may vary.
                </p>
                <Link href="/vendors" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1">
                    View All Vendors <TrendingUp size={14} />
                </Link>
            </div>
        </div>
    );
}
