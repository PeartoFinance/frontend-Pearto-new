'use client';

import { useState, useMemo, useEffect } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import { ArrowLeftRight, RefreshCw, TrendingUp, Building2, Star, ExternalLink } from 'lucide-react';
import { useCurrency } from '@/contexts/CurrencyContext';

// Currency metadata with flags
const currencyMeta: Record<string, { name: string; flag: string }> = {
    USD: { name: 'US Dollar', flag: '🇺🇸' },
    EUR: { name: 'Euro', flag: '🇪🇺' },
    GBP: { name: 'British Pound', flag: '🇬🇧' },
    INR: { name: 'Indian Rupee', flag: '🇮🇳' },
    NPR: { name: 'Nepalese Rupee', flag: '🇳🇵' },
    JPY: { name: 'Japanese Yen', flag: '🇯🇵' },
    AUD: { name: 'Australian Dollar', flag: '🇦🇺' },
    CAD: { name: 'Canadian Dollar', flag: '🇨🇦' },
    CHF: { name: 'Swiss Franc', flag: '🇨🇭' },
    CNY: { name: 'Chinese Yuan', flag: '🇨🇳' },
    SGD: { name: 'Singapore Dollar', flag: '🇸🇬' },
    AED: { name: 'UAE Dirham', flag: '🇦🇪' },
    KRW: { name: 'Korean Won', flag: '🇰🇷' },
    MYR: { name: 'Malaysian Ringgit', flag: '🇲🇾' },
    THB: { name: 'Thai Baht', flag: '🇹🇭' },
};

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

export default function CurrencyConverter() {
    const { rates, formatPrice } = useCurrency();
    const [amount, setAmount] = useState(1000);
    const [fromCurrency, setFromCurrency] = useState('USD');
    const [toCurrency, setToCurrency] = useState('NPR');
    const [vendorDeals, setVendorDeals] = useState<VendorDeal[]>([]);
    const [loadingVendors, setLoadingVendors] = useState(false);

    // Build currency list from available rates
    const availableCurrencies = useMemo(() => {
        const currencies = ['USD', ...Object.keys(rates)].filter(
            (c, i, arr) => arr.indexOf(c) === i
        );
        return currencies.sort();
    }, [rates]);

    // Calculate conversion
    const result = useMemo(() => {
        const fromRate = fromCurrency === 'USD' ? 1 : (rates[fromCurrency] || 1);
        const toRate = toCurrency === 'USD' ? 1 : (rates[toCurrency] || 1);

        // Convert: amount in fromCurrency -> USD -> toCurrency
        const amountInUSD = amount / fromRate;
        const convertedAmount = amountInUSD * toRate;
        const exchangeRate = toRate / fromRate;
        const inverseRate = fromRate / toRate;

        return {
            converted: convertedAmount,
            rate: exchangeRate,
            inverseRate: inverseRate
        };
    }, [amount, fromCurrency, toCurrency, rates]);

    // Fetch vendor deals
    useEffect(() => {
        const fetchVendorDeals = async () => {
            setLoadingVendors(true);
            try {
                const res = await fetch(`/api/public/vendors?category=forex&limit=5`);
                if (res.ok) {
                    const data = await res.json();
                    const deals: VendorDeal[] = (data.vendors || []).map((v: any) => ({
                        id: v.id,
                        name: v.name,
                        logoUrl: v.logoUrl,
                        rating: v.rating || 0,
                        reviewCount: v.reviewCount || 0,
                        buyRate: v.metadata?.buyRate || result.rate * 0.99,
                        sellRate: v.metadata?.sellRate || result.rate * 1.01,
                        fee: v.metadata?.fee || '0.5%',
                        website: v.website
                    }));

                    // Mark best rate
                    if (deals.length > 0) {
                        const bestIdx = deals.reduce((best, d, i) =>
                            d.buyRate > deals[best].buyRate ? i : best, 0);
                        deals[bestIdx].isBestRate = true;
                    }

                    setVendorDeals(deals);
                }
            } catch (err) {
                console.error('Failed to fetch vendor deals:', err);
            } finally {
                setLoadingVendors(false);
            }
        };

        fetchVendorDeals();
    }, [fromCurrency, toCurrency, result.rate]);

    const swapCurrencies = () => {
        setFromCurrency(toCurrency);
        setToCurrency(fromCurrency);
    };

    const formatNumber = (num: number, decimals = 2) => {
        return new Intl.NumberFormat('en-US', { maximumFractionDigits: decimals }).format(num);
    };

    const getCurrencyLabel = (code: string) => {
        const meta = currencyMeta[code];
        return meta ? `${meta.flag} ${code} - ${meta.name}` : code;
    };

    return (
        <CalculatorLayout
            title="Currency Converter"
            description="Convert between currencies with live exchange rates"
            category="Utilities"
            results={
                <div className="space-y-6">
                    {/* Main Result */}
                    <div className="text-center p-6 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
                        <p className="text-sm text-slate-500 mb-2 flex items-center justify-center gap-2">
                            <span className="text-lg">{currencyMeta[fromCurrency]?.flag}</span>
                            {formatNumber(amount)} {fromCurrency}
                        </p>
                        <p className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                            {currencyMeta[toCurrency]?.flag} {formatNumber(result.converted)}
                        </p>
                        <p className="text-lg text-slate-600 dark:text-slate-400 mt-1">{toCurrency}</p>
                    </div>

                    {/* Exchange Rate Info */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Exchange Rate</span>
                            <span className="font-mono font-medium">
                                1 {fromCurrency} = {formatNumber(result.rate, 4)} {toCurrency}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Inverse Rate</span>
                            <span className="font-mono font-medium">
                                1 {toCurrency} = {formatNumber(result.inverseRate, 6)} {fromCurrency}
                            </span>
                        </div>
                    </div>

                    {/* Vendor Deals Section */}
                    {vendorDeals.length > 0 && (
                        <div className="bg-white dark:bg-slate-800 rounded-xl p-4">
                            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                                <Building2 size={16} className="text-emerald-500" />
                                Compare Vendor Rates
                            </h4>
                            <div className="space-y-2">
                                {vendorDeals.map((vendor) => (
                                    <div
                                        key={vendor.id}
                                        className={`p-3 rounded-lg border ${vendor.isBestRate
                                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                                            : 'border-slate-200 dark:border-slate-700'
                                            } flex items-center justify-between gap-3`}
                                    >
                                        <div className="flex items-center gap-3">
                                            {vendor.logoUrl ? (
                                                <img src={vendor.logoUrl} alt={vendor.name} className="w-8 h-8 rounded-lg object-cover" />
                                            ) : (
                                                <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold">
                                                    {vendor.name.charAt(0)}
                                                </div>
                                            )}
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-sm">{vendor.name}</span>
                                                    {vendor.isBestRate && (
                                                        <span className="px-1.5 py-0.5 text-[10px] font-bold bg-emerald-500 text-white rounded">
                                                            BEST
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-1 text-xs text-slate-500">
                                                    <Star size={10} className="text-amber-500 fill-amber-500" />
                                                    {vendor.rating.toFixed(1)} ({vendor.reviewCount})
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-mono font-bold text-sm text-emerald-600">
                                                {formatNumber(vendor.buyRate, 2)}
                                            </div>
                                            <div className="text-[10px] text-slate-400">
                                                Fee: {vendor.fee}
                                            </div>
                                        </div>
                                        {vendor.website && (
                                            <a
                                                href={vendor.website}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
                                            >
                                                <ExternalLink size={14} className="text-slate-400" />
                                            </a>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <p className="text-xs text-slate-400 text-center">
                        Live rates from Open Exchange Rates API
                    </p>
                </div>
            }
        >
            {/* Amount Input */}
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Amount</label>
                <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    min={0}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 text-lg font-bold"
                />
            </div>

            {/* From Currency */}
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">From</label>
                <select
                    value={fromCurrency}
                    onChange={(e) => setFromCurrency(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500"
                >
                    {availableCurrencies.map((code) => (
                        <option key={code} value={code}>{getCurrencyLabel(code)}</option>
                    ))}
                </select>
            </div>

            {/* Swap Button */}
            <button
                onClick={swapCurrencies}
                className="w-full py-3 flex items-center justify-center gap-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl transition"
            >
                <ArrowLeftRight className="w-5 h-5" />
                <span className="text-sm font-medium">Swap Currencies</span>
            </button>

            {/* To Currency */}
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">To</label>
                <select
                    value={toCurrency}
                    onChange={(e) => setToCurrency(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500"
                >
                    {availableCurrencies.map((code) => (
                        <option key={code} value={code}>{getCurrencyLabel(code)}</option>
                    ))}
                </select>
            </div>
        </CalculatorLayout>
    );
}
