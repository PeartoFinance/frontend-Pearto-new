'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getVendors, type Vendor } from '@/services/vendorService';
import { Search, Star, Filter, LayoutGrid, List as ListIcon, Loader2, ShieldCheck, Briefcase, GitCompare, X, ArrowRight, Check } from 'lucide-react';

import Sidebar from '@/components/layout/Sidebar';
import TickerTape from '@/components/layout/TickerTape';
import Header from '@/components/layout/Header';
import { AIAnalysisPanel } from '@/components/ai/AIAnalysisPanel';
import Footer from '@/components/layout/Footer';

const CATEGORIES = ['All', 'Banking', 'Investment', 'Insurance', 'Real Estate', 'Tax Services', 'Crypto', 'Retirement', 'Education', 'Technology', 'Legal', 'Marketing', 'Travel', 'Health'];

export default function VendorsPage() {
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [compareList, setCompareList] = useState<string[]>([]);

    const toggleCompare = (vendorId: string, e: React.MouseEvent) => {
        e.preventDefault();
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
        async function loadVendors() {
            setLoading(true);
            try {
                const filters: any = {};
                if (selectedCategory !== 'All') filters.category = selectedCategory;

                const data = await getVendors(filters);
                setVendors(data);
            } catch (error) {
                console.error('Failed to load vendors:', error);
            } finally {
                setLoading(false);
            }
        }
        loadVendors();
    }, [selectedCategory]);

    const filteredVendors = vendors.filter(v =>
        v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (v.description && v.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const compareVendors = vendors.filter(v => compareList.includes(v.id));

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-slate-900">
            <Sidebar />

            <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
                <div className="fixed top-0 right-0 left-0 lg:left-64 z-40 bg-gray-50 dark:bg-slate-900">
                    <TickerTape />
                    <Header />
                </div>

                <div className="flex-1 pt-[112px] md:pt-[120px] pb-20 overflow-x-hidden mt-10">
                    {/* Page Header */}
                    <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-6 py-8">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        <Briefcase className="w-8 h-8 text-emerald-500" />
                                        Partner Directory
                                    </h1>
                                    <p className="mt-2 text-slate-600 dark:text-slate-400">
                                        Find trusted financial service providers, vetted for quality and reliability.
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={`p-2 rounded-lg transition ${viewMode === 'grid' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                                            }`}
                                    >
                                        <LayoutGrid size={20} />
                                    </button>
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`p-2 rounded-lg transition ${viewMode === 'list' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                                            }`}
                                    >
                                        <ListIcon size={20} />
                                    </button>
                                </div>
                            </div>

                            {/* Filters & Search */}
                            <div className="mt-8 flex flex-col md:flex-row gap-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Search providers..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none transition"
                                    />
                                </div>
                                <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                                    <Filter size={18} className="text-slate-400 flex-shrink-0" />
                                    {CATEGORIES.map(cat => (
                                        <button
                                            key={cat}
                                            onClick={() => setSelectedCategory(cat)}
                                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${selectedCategory === cat
                                                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                                                }`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* AI Insights Panel */}
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-6 py-6">
                        <AIAnalysisPanel
                            title="Partner Insights"
                            pageType="vendors"
                            pageData={{ vendors: filteredVendors.slice(0, 5), category: selectedCategory }}
                            autoAnalyze={false}
                            compact={true}
                            quickPrompts={[
                                "Best rated providers",
                                "Top picks for savings",
                                "Compare insurance options"
                            ]}
                        />
                    </div>

                    {/* List Content */}
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-6 py-4">
                        {loading ? (
                            <div className="flex justify-center py-20">
                                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                            </div>
                        ) : filteredVendors.length === 0 ? (
                            <div className="text-center py-20">
                                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Search className="w-8 h-8 text-slate-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">No partners found</h3>
                                <p className="text-slate-500">Try adjusting your search or filters</p>
                            </div>
                        ) : (
                            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                                {filteredVendors.map(vendor => {
                                    const isSelected = compareList.includes(vendor.id);

                                    return (
                                        <div
                                            key={vendor.id}
                                            className={`relative bg-white dark:bg-slate-800 border rounded-xl hover:shadow-lg transition group ${viewMode === 'list' ? 'flex items-center p-4 gap-6' : 'p-6 h-full flex flex-col'
                                                } ${isSelected ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-200 dark:border-slate-700'}`}
                                        >
                                            {/* Compare Checkbox */}
                                            <button
                                                onClick={(e) => toggleCompare(vendor.id, e)}
                                                className={`absolute top-3 right-3 z-10 w-6 h-6 rounded-md border-2 flex items-center justify-center transition ${isSelected
                                                    ? 'bg-emerald-500 border-emerald-500 text-white'
                                                    : 'border-slate-300 dark:border-slate-600 hover:border-emerald-500 bg-white dark:bg-slate-800'
                                                    }`}
                                                title={isSelected ? 'Remove from compare' : 'Add to compare'}
                                            >
                                                {isSelected && <Check size={14} />}
                                            </button>

                                            <Link href={`/vendors/${vendor.id}`} className={`${viewMode === 'list' ? 'flex items-center gap-6 flex-1' : 'flex flex-col flex-1'}`}>
                                                <div className={`flex-shrink-0 relative ${viewMode === 'grid' ? 'mb-4' : ''}`}>
                                                    <div className="w-16 h-16 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden">
                                                        {vendor.logoUrl ? (
                                                            <img src={vendor.logoUrl} alt={vendor.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <span className="text-2xl font-bold text-slate-400">{vendor.name.charAt(0)}</span>
                                                        )}
                                                    </div>
                                                    {vendor.isFeatured && (
                                                        <div className="absolute -top-2 -left-2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                                                            <ShieldCheck size={10} /> TOP
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-start mb-1 pr-8">
                                                        <div>
                                                            <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 transition truncate">
                                                                {vendor.name}
                                                            </h3>
                                                            {vendor.category && (
                                                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                                                                    {vendor.category}
                                                                </p>
                                                            )}
                                                        </div>
                                                        {vendor.rating > 0 && (
                                                            <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-lg">
                                                                <Star size={14} className="text-amber-500 fill-amber-500" />
                                                                <span className="text-sm font-bold text-amber-700 dark:text-amber-400">{vendor.rating.toFixed(1)}</span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-4">
                                                        {vendor.description}
                                                    </p>

                                                    {/* Services Tags */}
                                                    <div className="flex flex-wrap gap-2 mt-auto">
                                                        {vendor.services?.slice(0, 3).map(svc => (
                                                            <span key={svc} className="text-xs px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                                                                {svc}
                                                            </span>
                                                        ))}
                                                        {vendor.services && vendor.services.length > 3 && (
                                                            <span className="text-xs px-2.5 py-1 text-slate-400">
                                                                +{vendor.services.length - 3}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </Link>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Floating Compare Bar */}
                {compareList.length > 0 && (
                    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 lg:left-[calc(50%+128px)] z-50 animate-in slide-in-from-bottom-4 duration-300">
                        <div className="bg-slate-900 dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 p-4 flex items-center gap-4">
                            {/* Selected Vendors Avatars */}
                            <div className="flex -space-x-2">
                                {compareVendors.map(v => (
                                    <div
                                        key={v.id}
                                        className="relative w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-700 flex items-center justify-center overflow-hidden"
                                    >
                                        {v.logoUrl ? (
                                            <img src={v.logoUrl} alt={v.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-sm font-bold text-white">{v.name.charAt(0)}</span>
                                        )}
                                        <button
                                            onClick={() => removeFromCompare(v.id)}
                                            className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition"
                                        >
                                            <X size={10} />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div className="text-white">
                                <p className="text-sm font-medium">{compareList.length} selected</p>
                                <p className="text-[10px] text-slate-400">Max 4 vendors</p>
                            </div>

                            <Link
                                href={`/vendors/compare?ids=${compareList.join(',')}`}
                                className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-medium rounded-xl flex items-center gap-2 shadow-lg transition"
                            >
                                <GitCompare size={16} />
                                Compare
                                <ArrowRight size={16} />
                            </Link>
                        </div>
                    </div>
                )}
              <Footer />
      </main>

        </div>
    );
}
