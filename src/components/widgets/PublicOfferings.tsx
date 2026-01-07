'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowUpRight, FileText, Briefcase, Loader2 } from 'lucide-react';
import { getStockOffers, StockOffer } from '@/services/marketService';

const tabs = ['IPO', 'FPO', 'Rights'];

export default function PublicOfferings() {
    const [activeTab, setActiveTab] = useState('IPO');
    const [offers, setOffers] = useState<StockOffer[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOffers = async () => {
            try {
                const data = await getStockOffers();
                setOffers(data);
            } catch (err) {
                console.error('Failed to fetch stock offers:', err);
                setOffers([
                    { id: '1', symbol: 'RDDT', companyName: 'Reddit Inc.', offerType: 'ipo', priceRange: '$31-34', openDate: '2024-03-20', closeDate: '2024-03-25', status: 'listed' },
                    { id: '2', symbol: 'XYZCO', companyName: 'XYZ Technologies', offerType: 'ipo', priceRange: '$18-22', openDate: '2026-01-15', closeDate: '2026-01-20', status: 'open' },
                    { id: '3', symbol: 'NEWENERGY', companyName: 'NewEnergy Corp.', offerType: 'ipo', priceRange: '$25-30', openDate: '2026-02-01', closeDate: '2026-02-10', status: 'upcoming' },
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchOffers();
    }, []);

    const filteredOffers = offers.filter(offer => {
        if (activeTab === 'IPO') return offer.offerType === 'ipo';
        if (activeTab === 'FPO') return offer.offerType === 'fpo';
        if (activeTab === 'Rights') return offer.offerType === 'rights';
        return true;
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'open':
                return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400';
            case 'upcoming':
                return 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400';
            case 'closed':
            case 'listed':
                return 'bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-slate-400';
            default:
                return 'bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-slate-400';
        }
    };

    return (
        <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-900 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Briefcase size={18} className="text-emerald-500" />
                    <span className="font-semibold text-slate-900 dark:text-white">Public Offerings</span>
                </div>
                <Link
                    href="/market/ipo"
                    className="text-sm text-emerald-500 hover:text-emerald-600 flex items-center gap-1"
                >
                    View All <ArrowUpRight size={14} />
                </Link>
            </div>

            {/* Tabs */}
            <div className="px-4 py-3 border-b border-slate-100 dark:border-neutral-800">
                <div className="flex gap-1 bg-slate-100 dark:bg-neutral-800 rounded-lg p-1">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === tab
                                    ? 'bg-emerald-500 text-white'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="animate-spin text-emerald-500" size={24} />
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-200 dark:border-neutral-800">
                                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-neutral-400">Symbol</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-neutral-400">Company</th>
                                <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-neutral-400">Price Range</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-neutral-400">Open Date</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-neutral-400">Close Date</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-neutral-400">Status</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-neutral-400">View</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-neutral-800">
                            {filteredOffers.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-8 text-slate-500 dark:text-neutral-400">
                                        No {activeTab} offerings available
                                    </td>
                                </tr>
                            ) : (
                                filteredOffers.map((offer) => (
                                    <tr key={offer.id} className="hover:bg-slate-50 dark:hover:bg-neutral-800 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <span className="w-7 h-7 rounded bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                                                    {offer.symbol?.slice(0, 2)}
                                                </span>
                                                <span className="font-medium text-emerald-600 dark:text-emerald-400">{offer.symbol}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 max-w-[200px] truncate text-slate-700 dark:text-slate-300">{offer.companyName}</td>
                                        <td className="text-right px-4 py-3 font-semibold text-slate-900 dark:text-white">{offer.priceRange}</td>
                                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{offer.openDate || '-'}</td>
                                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{offer.closeDate || '-'}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${getStatusBadge(offer.status)}`}>
                                                {offer.status?.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <Link href={`/market/ipo/${offer.symbol}`} className="text-emerald-500 hover:text-emerald-600">
                                                <FileText size={16} />
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
