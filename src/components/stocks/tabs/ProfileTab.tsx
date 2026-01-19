'use client';

import { Building2, Globe, ExternalLink, MapPin, Users, Briefcase } from 'lucide-react';
import { type MarketStock } from '@/services/marketService';

interface ProfileTabProps {
    stock: MarketStock;
}

export default function ProfileTab({ stock }: ProfileTabProps) {
    return (
        <div className="space-y-5">
            {/* Company Description */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    <Building2 size={20} className="text-blue-500" />
                    About {stock.name}
                </h3>
                {stock.description ? (
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                        {stock.description}
                    </p>
                ) : (
                    <p className="text-slate-400 italic">No company description available.</p>
                )}
            </div>

            {/* Company Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Sector & Industry */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <Briefcase size={18} className="text-slate-400" />
                        <h4 className="font-medium text-slate-900 dark:text-white">Sector & Industry</h4>
                    </div>
                    <div className="space-y-2">
                        <div>
                            <p className="text-xs text-slate-500 uppercase">Sector</p>
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{stock.sector || '-'}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 uppercase">Industry</p>
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{stock.industry || '-'}</p>
                        </div>
                    </div>
                </div>

                {/* Exchange Info */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <MapPin size={18} className="text-slate-400" />
                        <h4 className="font-medium text-slate-900 dark:text-white">Exchange</h4>
                    </div>
                    <div className="space-y-2">
                        <div>
                            <p className="text-xs text-slate-500 uppercase">Listed On</p>
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{stock.exchange || '-'}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 uppercase">Currency</p>
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{stock.currency || 'USD'}</p>
                        </div>
                    </div>
                </div>

                {/* Website */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <Globe size={18} className="text-slate-400" />
                        <h4 className="font-medium text-slate-900 dark:text-white">Website</h4>
                    </div>
                    {stock.website ? (
                        <a
                            href={stock.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-500 transition"
                        >
                            <span className="text-sm truncate max-w-[200px]">{stock.website.replace(/^https?:\/\//, '')}</span>
                            <ExternalLink size={14} />
                        </a>
                    ) : (
                        <p className="text-sm text-slate-400">No website available</p>
                    )}
                </div>
            </div>

            {/* Key People / Additional Info (placeholder for future) */}
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                <div className="flex items-center gap-2 text-slate-500">
                    <Users size={18} />
                    <span className="text-sm">Executive information and key people data can be added here in future updates.</span>
                </div>
            </div>
        </div>
    );
}
