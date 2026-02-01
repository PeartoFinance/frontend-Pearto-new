'use client';

import { useState, useEffect, useRef } from 'react';
import { Newspaper, Building2, Tag, Search, Plus, X, Check, Save } from 'lucide-react';
import { getNewsPreferences, updateNewsPreferences, createNewsPreferences, type NewsPreferences } from '@/services/userService';
import { get } from '@/services/api';

interface StockOption {
    symbol: string;
    name: string;
    exchange?: string;
}

const CATEGORIES = [
    'Technology', 'Finance', 'Crypto', 'Global', 'Business',
    'Markets', 'Economy', 'Policy', 'Energy', 'Healthcare', 'Retail'
];

export default function NewsPreferencesSection() {
    const [preferences, setPreferences] = useState<NewsPreferences>({
        companies: [],
        categories: [],
        newsType: 'company' // Default to company news
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isNew, setIsNew] = useState(false);

    // Stock Search State
    const [stockSearch, setStockSearch] = useState('');
    const [stockOptions, setStockOptions] = useState<StockOption[]>([]);
    const [showStockDropdown, setShowStockDropdown] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        loadPreferences();
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowStockDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Search stocks when typing
    useEffect(() => {
        const searchStocks = async () => {
            if (stockSearch.length < 1) {
                setStockOptions([]);
                return;
            }
            setSearchLoading(true);
            try {
                const results = await get<StockOption[]>(`/stocks/search?q=${stockSearch}&limit=10`);
                setStockOptions(results);
                setShowStockDropdown(true);
            } catch (error) {
                console.error('Failed to search stocks:', error);
            } finally {
                setSearchLoading(false);
            }
        };
        const debounce = setTimeout(searchStocks, 300);
        return () => clearTimeout(debounce);
    }, [stockSearch]);

    const loadPreferences = async () => {
        try {
            const data = await getNewsPreferences();
            // Handle empty state where backend returns empty object or null fields
            if (!data.id) {
                setIsNew(true);
            }
            setPreferences({
                companies: data.companies || [],
                categories: data.categories || [],
                newsType: data.newsType || 'company'
            });
        } catch (error) {
            console.error('Failed to load news preferences:', error);
            // Assume new if error (likely 404 or similar, though backend returns empty state usually)
            setIsNew(true);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            if (isNew) {
                const created = await createNewsPreferences(preferences);
                setPreferences(created);
                setIsNew(false);
            } else {
                await updateNewsPreferences(preferences);
            }
            alert('News preferences saved successfully!');
        } catch (error: any) {
            console.error('Failed to save preferences:', error);
            alert(error.message || 'Failed to save preferences');
        } finally {
            setSaving(false);
        }
    };

    const addCompany = (symbol: string) => {
        if (!preferences.companies.includes(symbol)) {
            setPreferences(prev => ({
                ...prev,
                companies: [...prev.companies, symbol]
            }));
        }
        setStockSearch('');
        setShowStockDropdown(false);
    };

    const removeCompany = (symbol: string) => {
        setPreferences(prev => ({
            ...prev,
            companies: prev.companies.filter(c => c !== symbol)
        }));
    };

    const toggleCategory = (category: string) => {
        setPreferences(prev => {
            const exists = prev.categories.includes(category);
            return {
                ...prev,
                categories: exists
                    ? prev.categories.filter(c => c !== category)
                    : [...prev.categories, category]
            };
        });
    };

    if (loading) {
        return <div className="animate-pulse h-64 bg-slate-800 rounded-xl"></div>;
    }

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-xl font-bold text-white mb-2">News Feed Customization</h2>
                <p className="text-slate-400 text-sm">
                    Tailor your news feed to see exactly what matters to you.
                </p>
            </div>

            {/* News Type Selector */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                        <Newspaper className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-white">News Source Type</h3>
                        <p className="text-sm text-slate-400">Choose your primary news focus</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                        onClick={() => setPreferences(prev => ({ ...prev, newsType: 'company' }))}
                        className={`p-4 rounded-xl border-2 transition text-left relative overflow-hidden ${preferences.newsType === 'company'
                                ? 'border-emerald-500 bg-emerald-500/5'
                                : 'border-slate-700 hover:border-slate-600 bg-slate-800'
                            }`}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className={`font-bold ${preferences.newsType === 'company' ? 'text-emerald-500' : 'text-white'}`}>Company News</span>
                            {preferences.newsType === 'company' && <Check size={20} className="text-emerald-500" />}
                        </div>
                        <p className="text-xs text-slate-400">
                            Focus on official filings, earnings reports, and press releases from specific companies.
                        </p>
                    </button>

                    <button
                        onClick={() => setPreferences(prev => ({ ...prev, newsType: 'independent' }))}
                        className={`p-4 rounded-xl border-2 transition text-left relative overflow-hidden ${preferences.newsType === 'independent'
                                ? 'border-emerald-500 bg-emerald-500/5'
                                : 'border-slate-700 hover:border-slate-600 bg-slate-800'
                            }`}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className={`font-bold ${preferences.newsType === 'independent' ? 'text-emerald-500' : 'text-white'}`}>Independent News</span>
                            {preferences.newsType === 'independent' && <Check size={20} className="text-emerald-500" />}
                        </div>
                        <p className="text-xs text-slate-400">
                            Broad market coverage from various independent news outlets and analysts.
                        </p>
                    </button>
                </div>
            </div>

            {/* Companies Selector */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-purple-500/10 rounded-lg">
                        <Building2 className="w-5 h-5 text-purple-500" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-white">Followed Companies</h3>
                        <p className="text-sm text-slate-400">Select companies to track specifically</p>
                    </div>
                </div>

                {/* Search */}
                <div ref={searchRef} className="relative mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            value={stockSearch}
                            onChange={(e) => setStockSearch(e.target.value)}
                            onFocus={() => stockOptions.length > 0 && setShowStockDropdown(true)}
                            className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500 placeholder:text-slate-600"
                            placeholder="Search companies to follow (e.g. AAPL, TSLA)..."
                        />
                        {searchLoading && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                <div className="w-4 h-4 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                            </div>
                        )}
                    </div>

                    {showStockDropdown && stockOptions.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl max-h-60 overflow-auto">
                            {stockOptions.map((stock) => (
                                <button
                                    key={stock.symbol}
                                    onClick={() => addCompany(stock.symbol)}
                                    className="w-full px-4 py-3 text-left hover:bg-slate-700 transition flex items-center justify-between group"
                                >
                                    <div>
                                        <div className="font-medium text-white group-hover:text-emerald-400 transition-colors">{stock.symbol}</div>
                                        <div className="text-sm text-slate-400 truncate">{stock.name}</div>
                                    </div>
                                    <Plus size={16} className="text-slate-500 group-hover:text-emerald-500" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Selected Companies Chips */}
                {preferences.companies.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                        {preferences.companies.map(symbol => (
                            <div key={symbol} className="flex items-center gap-2 pl-3 pr-2 py-1.5 bg-slate-700/50 border border-slate-600 rounded-full">
                                <span className="text-sm font-medium text-white">{symbol}</span>
                                <button
                                    onClick={() => removeCompany(symbol)}
                                    className="p-0.5 hover:bg-slate-600 rounded-full text-slate-400 hover:text-white transition"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 border-2 border-dashed border-slate-700 rounded-xl">
                        <p className="text-slate-500 text-sm">No companies selected yet.</p>
                    </div>
                )}
            </div>

            {/* Categories Selector */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-amber-500/10 rounded-lg">
                        <Tag className="w-5 h-5 text-amber-500" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-white">Interests</h3>
                        <p className="text-sm text-slate-400">Select topics you care about</p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-3">
                    {CATEGORIES.map(category => {
                        const isSelected = preferences.categories.includes(category);
                        return (
                            <button
                                key={category}
                                onClick={() => toggleCategory(category)}
                                className={`px-4 py-2 rounded-full text-sm font-medium border transition ${isSelected
                                        ? 'bg-emerald-500 text-white border-emerald-500'
                                        : 'bg-slate-900 text-slate-400 border-slate-700 hover:border-slate-500 hover:text-slate-200'
                                    }`}
                            >
                                {category}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Action Bar */}
            <div className="flex justify-end pt-4 border-t border-slate-800">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-8 py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20"
                >
                    {saving ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save size={18} />
                            Save Preferences
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
