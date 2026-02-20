'use client';

import { useState, useEffect } from 'react';
import { getVendors, type Vendor } from '@/services/vendorService';
import { Star, ExternalLink, ShieldCheck, ChevronDown, ChevronUp, MapPin, Phone, Briefcase, ArrowRight, Award, Users, GitCompare, Check, X } from 'lucide-react';
import Link from 'next/link';

interface VendorListProps {
    category: string;
    service?: string;
    limit?: number;
    title?: string;
    description?: string;
    compact?: boolean;
}

export default function VendorList({
    category,
    service,
    limit = 5,
    title = 'Recommended Providers',
    description,
    compact = false
}: VendorListProps) {
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [compareList, setCompareList] = useState<string[]>([]);

    const toggleCompare = (vendorId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setCompareList(prev =>
            prev.includes(vendorId)
                ? prev.filter(id => id !== vendorId)
                : prev.length < 4 ? [...prev, vendorId] : prev
        );
    };

    const removeFromCompare = (vendorId: string) => {
        setCompareList(prev => prev.filter(id => id !== vendorId));
    };

    useEffect(() => {
        async function fetchVendors() {
            setLoading(true);
            try {
                const data = await getVendors({ category, service, limit });
                setVendors(data);
                setError(null);
            } catch (err) {
                console.error('Failed to load vendors:', err);
                setError('Failed to load providers.');
            } finally {
                setLoading(false);
            }
        }

        if (category) {
            fetchVendors();
        }
    }, [category, service, limit]);

    const toggleExpand = (id: string) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const compareVendors = vendors.filter(v => compareList.includes(v.id));

    if (loading) {
        return (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                <div className="animate-pulse space-y-3">
                    <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
                    {[1, 2].map(i => (
                        <div key={i} className="h-16 bg-slate-100 dark:bg-slate-700 rounded-lg"></div>
                    ))}
                </div>
            </div>
        );
    }

    if (!vendors.length) {
        return null;
    }

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            {/* Header */}
            {(title || description) && (
                <div className="p-4 border-b border-slate-100 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                        {title && (
                            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                {title}
                                {vendors.some(v => v.isFeatured) && <ShieldCheck size={16} className="text-emerald-500" />}
                            </h3>
                        )}
                        {compareList.length >= 2 && (
                            <Link
                                href={`/vendors/compare?ids=${compareList.join(',')}`}
                                className="flex items-center gap-1 text-[10px] font-medium px-2 py-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition"
                            >
                                <GitCompare size={10} />
                                Compare {compareList.length}
                            </Link>
                        )}
                    </div>
                    {description && <p className="text-xs text-slate-500 mt-1">{description}</p>}
                </div>
            )}

            {/* Vendor List */}
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
                {vendors.map((vendor) => {
                    const isExpanded = expandedId === vendor.id;
                    const isSelected = compareList.includes(vendor.id);

                    return (
                        <div key={vendor.id} className={`group ${isSelected ? 'bg-emerald-50/50 dark:bg-emerald-900/10' : ''}`}>
                            {/* Main Row - Always Visible */}
                            <div
                                className={`p-3 cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50 ${vendor.isFeatured && !isSelected ? 'bg-emerald-50/30 dark:bg-emerald-900/5' : ''
                                    }`}
                                onClick={() => toggleExpand(vendor.id)}
                            >
                                <div className="flex items-center gap-3">
                                    {/* Compare Checkbox */}
                                    <button
                                        onClick={(e) => toggleCompare(vendor.id, e)}
                                        className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition ${isSelected
                                                ? 'bg-emerald-500 border-emerald-500 text-white'
                                                : 'border-slate-300 dark:border-slate-600 hover:border-emerald-500'
                                            }`}
                                        title={isSelected ? 'Remove from compare' : 'Add to compare'}
                                    >
                                        {isSelected && <Check size={10} />}
                                    </button>

                                    {/* Logo */}
                                    <div className={`flex-shrink-0 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 rounded-lg flex items-center justify-center overflow-hidden ${compact ? 'w-9 h-9' : 'w-10 h-10'}`}>
                                        {vendor.logoUrl ? (
                                            <img src={vendor.logoUrl} alt={vendor.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="font-bold text-slate-400 text-sm">{vendor.name.charAt(0)}</span>
                                        )}
                                    </div>

                                    {/* Name & Rating */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <h4 className="font-semibold text-sm text-slate-900 dark:text-white truncate flex items-center gap-1.5">
                                                {vendor.name}
                                                {vendor.isFeatured && (
                                                    <Award size={12} className="text-emerald-500" />
                                                )}
                                            </h4>
                                            <div className="flex items-center gap-2">
                                                {vendor.rating > 0 && (
                                                    <span className="flex items-center gap-0.5 text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-1.5 py-0.5 rounded">
                                                        <Star size={10} fill="currentColor" />
                                                        {vendor.rating.toFixed(1)}
                                                    </span>
                                                )}
                                                {isExpanded ? (
                                                    <ChevronUp size={16} className="text-slate-400" />
                                                ) : (
                                                    <ChevronDown size={16} className="text-slate-400" />
                                                )}
                                            </div>
                                        </div>
                                        {vendor.website && (
                                            <a
                                                href={vendor.website}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                onClick={(e) => e.stopPropagation()}
                                                className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5 mt-0.5"
                                            >
                                                Visit <ExternalLink size={8} />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Expanded Details */}
                            {isExpanded && (
                                <div className="px-4 pb-4 bg-slate-50 dark:bg-slate-800/50 animate-in slide-in-from-top-2 duration-200">
                                    {/* Description */}
                                    {vendor.description && (
                                        <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
                                            {vendor.description}
                                        </p>
                                    )}

                                    {/* Quick Stats */}
                                    <div className="grid grid-cols-2 gap-2 mb-3">
                                        {vendor.reviewCount && vendor.reviewCount > 0 && (
                                            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 bg-white dark:bg-slate-700 px-2 py-1.5 rounded">
                                                <Users size={10} />
                                                {vendor.reviewCount} reviews
                                            </div>
                                        )}
                                        {vendor.countryCode && (
                                            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 bg-white dark:bg-slate-700 px-2 py-1.5 rounded">
                                                <MapPin size={10} />
                                                {vendor.countryCode}
                                            </div>
                                        )}
                                        {vendor.phone && (
                                            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 bg-white dark:bg-slate-700 px-2 py-1.5 rounded">
                                                <Phone size={10} />
                                                {vendor.phone}
                                            </div>
                                        )}
                                        {vendor.category && (
                                            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 bg-white dark:bg-slate-700 px-2 py-1.5 rounded">
                                                <Briefcase size={10} />
                                                {vendor.category}
                                            </div>
                                        )}
                                    </div>

                                    {/* Services */}
                                    {vendor.services && vendor.services.length > 0 && (
                                        <div className="mb-3">
                                            <p className="text-[10px] font-medium text-slate-500 mb-1.5">Services</p>
                                            <div className="flex flex-wrap gap-1">
                                                {vendor.services.map(svc => (
                                                    <span key={svc} className="text-[10px] px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full">
                                                        {svc}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="flex gap-2">
                                        {vendor.website && (
                                            <a
                                                href={vendor.website}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex-1 text-center text-[10px] font-medium py-2 px-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition"
                                            >
                                                Visit Website
                                            </a>
                                        )}
                                        <Link
                                            href={`/vendors/${vendor.id}`}
                                            className="flex-1 text-center text-[10px] font-medium py-2 px-3 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
                                        >
                                            View Details
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Footer - Compare Bar or View All */}
            {compareList.length > 0 ? (
                <div className="p-3 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                            <div className="flex -space-x-2">
                                {compareVendors.slice(0, 4).map(v => (
                                    <div
                                        key={v.id}
                                        className="relative w-7 h-7 rounded-full border-2 border-white dark:border-slate-800 bg-slate-200 dark:bg-slate-600 flex items-center justify-center overflow-hidden"
                                    >
                                        {v.logoUrl ? (
                                            <img src={v.logoUrl} alt={v.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-[10px] font-bold text-slate-500">{v.name.charAt(0)}</span>
                                        )}
                                        <button
                                            onClick={() => removeFromCompare(v.id)}
                                            className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 hover:bg-red-600 transition"
                                        >
                                            <X size={6} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <span className="text-[10px] text-slate-500">{compareList.length} selected</span>
                        </div>
                        <Link
                            href={`/vendors/compare?ids=${compareList.join(',')}`}
                            className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white rounded-lg transition shadow-sm"
                        >
                            <GitCompare size={12} />
                            Compare
                            <ArrowRight size={12} />
                        </Link>
                    </div>
                </div>
            ) : (
                <Link
                    href={`/vendors?category=${encodeURIComponent(category)}`}
                    className="block p-3 text-center text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 border-t border-slate-100 dark:border-slate-700 transition flex items-center justify-center gap-1"
                >
                    View all {category} providers <ArrowRight size={12} />
                </Link>
            )}
        </div>
    );
}
