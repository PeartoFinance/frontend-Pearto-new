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
                // Fallback to mock data
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
                return 'badge-success';
            case 'upcoming':
                return 'badge-warning';
            case 'closed':
            case 'listed':
                return 'badge-default';
            default:
                return '';
        }
    };

    return (
        <div className="card">
            <div className="card-header flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Briefcase size={18} className="text-emerald-500" />
                    <span>Public Offerings</span>
                </div>
                <Link
                    href="/market/ipo"
                    className="text-sm text-emerald-500 hover:text-emerald-400 flex items-center gap-1"
                >
                    View All <ArrowUpRight size={14} />
                </Link>
            </div>

            {/* Tabs */}
            <div className="p-4 pb-0">
                <div className="tab-nav overflow-x-auto">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`tab-item whitespace-nowrap ${activeTab === tab ? 'active' : ''}`}
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
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Symbol</th>
                                <th>Company</th>
                                <th className="text-right">Price Range</th>
                                <th>Open Date</th>
                                <th>Close Date</th>
                                <th>Status</th>
                                <th>View</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOffers.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-8 text-gray-500">
                                        No {activeTab} offerings available
                                    </td>
                                </tr>
                            ) : (
                                filteredOffers.map((offer) => (
                                    <tr key={offer.id}>
                                        <td>
                                            <div className="symbol-badge">
                                                <span className="symbol-icon">{offer.symbol?.slice(0, 2)}</span>
                                                {offer.symbol}
                                            </div>
                                        </td>
                                        <td className="max-w-[200px] truncate">{offer.companyName}</td>
                                        <td className="text-right font-semibold">{offer.priceRange}</td>
                                        <td>{offer.openDate || '-'}</td>
                                        <td>{offer.closeDate || '-'}</td>
                                        <td>
                                            <span className={`badge ${getStatusBadge(offer.status)}`}>
                                                {offer.status?.toUpperCase()}
                                            </span>
                                        </td>
                                        <td>
                                            <Link href={`/market/ipo/${offer.symbol}`} className="text-emerald-500 hover:text-emerald-400">
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
