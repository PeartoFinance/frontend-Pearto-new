'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowUpRight, FileText, Briefcase, Loader2, AlertCircle } from 'lucide-react';
import { getStockOffers, StockOffer } from '@/services/marketService';
import { TableExportButton } from '@/components/common/TableExportButton';

const tabs = ['IPO', 'FPO', 'Rights'];

export default function PublicOfferings() {
    const [activeTab, setActiveTab] = useState('IPO');
    const [offers, setOffers] = useState<StockOffer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchOffers = async () => {
            try {
                setLoading(true);
                const data = await getStockOffers();
                setOffers(data);
                setError(false);
            } catch (err) {
                console.error('Failed to fetch stock offers:', err);
                setError(true);
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
                return 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400';
            default:
                return 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400';
        }
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '-';
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

    return (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Briefcase size={18} className="text-emerald-500" />
                    <span className="font-semibold text-slate-900 dark:text-white">Public Offerings</span>
                </div>
                <div className="flex items-center gap-3">
                    <TableExportButton
                        data={filteredOffers}
                        columns={[
                            { key: 'symbol', label: 'Symbol' },
                            { key: 'companyName', label: 'Company' },
                            { key: 'priceRange', label: 'Price Range' },
                            { key: 'openDate', label: 'Open Date', format: 'date' },
                            { key: 'closeDate', label: 'Close Date', format: 'date' },
                            { key: 'status', label: 'Status' },
                        ]}
                        filename={`${activeTab.toLowerCase()}-offerings`}
                        title={`${activeTab} Offerings`}
                        variant="icon"
                    />
                    <Link
                        href="/market/ipo"
                        className="text-sm text-emerald-500 hover:text-emerald-600 flex items-center gap-1"
                    >
                        View All <ArrowUpRight size={14} />
                    </Link>
                </div>
            </div>

            {/* Tabs */}
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                <div className="flex gap-1 bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
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
            ) : error ? (
                <div className="flex items-center justify-center py-8 gap-2 text-slate-500">
                    <AlertCircle size={18} />
                    <span>Failed to load offerings</span>
                </div>
            ) : filteredOffers.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                    No {activeTab} offerings available. Import from admin panel.
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-700">
                                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Symbol</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Company</th>
                                <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Price Range</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Open Date</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Close Date</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Status</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">View</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-neutral-800">
                            {filteredOffers.map((offer) => (
                                <tr key={offer.id} className="hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <span className="w-7 h-7 rounded bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                                                {offer.symbol?.slice(0, 2)}
                                            </span>
                                            <span className="font-medium text-emerald-600 dark:text-emerald-400">{offer.symbol}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 max-w-[200px] truncate text-slate-700 dark:text-slate-300">{offer.companyName}</td>
                                    <td className="text-right px-4 py-3 font-semibold text-slate-900 dark:text-white">{offer.priceRange || '-'}</td>
                                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{formatDate(offer.openDate)}</td>
                                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{formatDate(offer.closeDate)}</td>
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
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
