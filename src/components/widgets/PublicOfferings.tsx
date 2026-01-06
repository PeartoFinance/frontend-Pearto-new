'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, FileText, Briefcase } from 'lucide-react';

interface IPO {
    symbol: string;
    company: string;
    units: number;
    price: number;
    openingDate: string;
    closingDate: string;
    status: 'OPENING' | 'COMINGSOON' | 'CLOSED';
}

const tabs = ['IPO', 'IPO Local', 'IPO Foreign', 'Right Share', 'FPO', 'Mutual Funds', 'Debentures'];

const mockIPOs: IPO[] = [
    { symbol: 'SOLU', company: 'Solu Hydropower Limited', units: 8200000, price: 100, openingDate: '2026-01-13', closingDate: '2026-01-18', status: 'COMINGSOON' },
    { symbol: 'SKIEL', company: 'Suryakunda Hydro Electricity', units: 1379350, price: 100, openingDate: '-', closingDate: '-', status: 'COMINGSOON' },
    { symbol: 'BJHL', company: 'Bhujung Hydropower L...', units: 2000000, price: 100, openingDate: '-', closingDate: '-', status: 'COMINGSOON' },
    { symbol: 'PCIL', company: 'Prime Cement Industry', units: 7500000, price: 100, openingDate: '-', closingDate: '-', status: 'COMINGSOON' },
];

export default function PublicOfferings() {
    const [activeTab, setActiveTab] = useState('IPO');

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

            <div className="overflow-x-auto">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Symbol</th>
                            <th>Company</th>
                            <th className="text-right">Units</th>
                            <th className="text-right">Price</th>
                            <th>Opening Date</th>
                            <th>Closing Date</th>
                            <th>Status</th>
                            <th>View</th>
                        </tr>
                    </thead>
                    <tbody>
                        {mockIPOs.map((ipo) => (
                            <tr key={ipo.symbol}>
                                <td>
                                    <div className="symbol-badge">
                                        <span className="symbol-icon">{ipo.symbol.slice(0, 2)}</span>
                                        {ipo.symbol}
                                    </div>
                                </td>
                                <td className="max-w-[200px] truncate">{ipo.company}</td>
                                <td className="text-right">{ipo.units.toLocaleString()}</td>
                                <td className="text-right font-semibold">${ipo.price}</td>
                                <td>{ipo.openingDate === '-' ? '-' : ipo.openingDate}</td>
                                <td>{ipo.closingDate === '-' ? '-' : ipo.closingDate}</td>
                                <td>
                                    <span className={`badge ${ipo.status === 'OPENING' ? 'badge-success' :
                                            ipo.status === 'COMINGSOON' ? 'badge-warning' : 'badge-danger'
                                        }`}>
                                        {ipo.status}
                                    </span>
                                </td>
                                <td>
                                    <Link href={`/market/ipo/${ipo.symbol}`} className="text-emerald-500 hover:text-emerald-400">
                                        <FileText size={16} />
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
