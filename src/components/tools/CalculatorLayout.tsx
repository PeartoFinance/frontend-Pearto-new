'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowLeft, Share2, ChevronRight, Sparkles, SlidersHorizontal, BarChart3 } from 'lucide-react';
import { getCategoryStyle, getCategoryIcon } from '@/data/tools';
import { toast } from 'sonner';

import VendorList from '@/components/vendors/VendorList';

interface CalculatorLayoutProps {
    title: string;
    description: string;
    category: string;
    children: ReactNode;
    results?: ReactNode;
    rightColumn?: ReactNode;
    /** Optional key insights/tips shown below results */
    insights?: { label: string; value: string; color?: string }[];
}

const VENDOR_CATEGORY_MAP: Record<string, string> = {
    'Investing': 'Investment',
    'Introduction to Investing': 'Investment',
    'Finance & Loans': 'Banking',
    'Personal Finance': 'Banking',
    'Debt': 'Banking',
    'Savings': 'Banking',
    'Banking': 'Banking',
    'Insurance': 'Insurance',
    'Health & Fitness': 'Health',
    'Health & Medical': 'Health',
    'Health': 'Health',
    'Real Estate': 'Real Estate',
    'Retirement': 'Retirement',
    'Taxation': 'Tax Services',
    'Tax': 'Tax Services',
    'Business': 'Technology',
    'Marketing': 'Marketing',
    'Education': 'Education',
    'Education & Study': 'Education',
    'Travel': 'Travel',
    'Utilities': 'Technology',
    'Productivity': 'Technology',
    'Technology': 'Technology',
    'Security': 'Technology',
    'Crypto': 'Crypto',
    'Cryptocurrency': 'Crypto',
    'Legal': 'Legal',
    'Trading': 'Investment',
};

export default function CalculatorLayout({
    title,
    description,
    category,
    children,
    results,
    rightColumn,
    insights,
}: CalculatorLayoutProps) {
    const style = getCategoryStyle(category);
    const IconComponent = getCategoryIcon(category);

    const vendorCategory = VENDOR_CATEGORY_MAP[category];
    const rightContent = rightColumn || (vendorCategory ? (
        <VendorList category={vendorCategory} title="Partners" limit={2} compact={true} />
    ) : null);
    const hasRightColumn = !!rightContent;

    return (
        <div className="w-full h-full max-w-[1600px] mx-auto px-4 py-2">

            {/* ── Breadcrumb + Actions ─────────────────────── */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <Link href="/tools" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                        Tools
                    </Link>
                    <ChevronRight size={12} />
                    <span className="text-slate-700 dark:text-slate-200 font-medium">{title}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${style.bg} ${style.text}`}>
                        {category}
                    </span>
                    <button
                        onClick={async () => {
                            const url = window.location.href;
                            if (navigator.share) {
                                await navigator.share({ title, url });
                            } else {
                                await navigator.clipboard.writeText(url);
                                toast.success('Link copied to clipboard!');
                            }
                        }}
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    >
                        <Share2 size={15} />
                    </button>
                </div>
            </div>

            {/* ── Header Banner ────────────────────────────── */}
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-slate-800 via-slate-900 to-slate-950 dark:from-slate-800 dark:via-slate-900 dark:to-black mb-4">
                {/* Decorative */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/8 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
                <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-blue-500/8 rounded-full blur-3xl translate-y-1/2" />

                <div className="relative flex items-center gap-4 px-5 py-4">
                    <Link href="/tools" className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition text-white/70 hover:text-white">
                        <ArrowLeft size={18} />
                    </Link>
                    <div className={`p-2.5 rounded-xl ${style.bg}`}>
                        <IconComponent className={`w-5 h-5 ${style.text}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-lg font-bold text-white leading-tight truncate">{title}</h1>
                        <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{description}</p>
                    </div>
                    <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/20">
                        <Sparkles size={13} className="text-emerald-400" />
                        <span className="text-xs font-medium text-emerald-400">Free Tool</span>
                    </div>
                </div>
            </div>

            {/* ── Content Grid ─────────────────────────────── */}
            <div className={`grid gap-4 ${hasRightColumn ? 'lg:grid-cols-12' : 'lg:grid-cols-12'}`}>

                {/* Inputs Panel */}
                <div className={`${hasRightColumn ? 'lg:col-span-3' : 'lg:col-span-4'}`}>
                    <div className="bg-white dark:bg-slate-800/90 rounded-xl border border-slate-200/80 dark:border-slate-700/50 overflow-hidden sticky top-32">
                        {/* Panel header */}
                        <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/50">
                            <SlidersHorizontal size={14} className="text-emerald-500" />
                            <span className="text-sm font-semibold text-slate-900 dark:text-white">Inputs</span>
                        </div>
                        <div className="p-4 space-y-5">
                            {children}
                        </div>
                    </div>
                </div>

                {/* Results Panel */}
                <div className={`${hasRightColumn ? 'lg:col-span-7' : 'lg:col-span-8'}`}>
                    <div className="bg-white dark:bg-slate-800/90 rounded-xl border border-slate-200/80 dark:border-slate-700/50 overflow-hidden">
                        {/* Panel header */}
                        <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/50">
                            <BarChart3 size={14} className="text-emerald-500" />
                            <span className="text-sm font-semibold text-slate-900 dark:text-white">Results</span>
                        </div>
                        <div className="p-4">
                            {results || (
                                <div className="flex flex-col items-center justify-center py-12 text-slate-400 dark:text-slate-500">
                                    <SlidersHorizontal size={32} className="mb-2 opacity-40" />
                                    <p className="text-sm">Adjust inputs to see results</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Insights row (optional) */}
                    {insights && insights.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                            {insights.map((item) => (
                                <div key={item.label} className="bg-white dark:bg-slate-800/90 rounded-xl border border-slate-200/80 dark:border-slate-700/50 p-3">
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{item.label}</p>
                                    <p className={`text-sm font-bold mt-0.5 ${item.color || 'text-slate-900 dark:text-white'}`}>{item.value}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Partners / Right Column */}
                {hasRightColumn && (
                    <div className="lg:col-span-2 space-y-4">
                        {rightContent}
                    </div>
                )}
            </div>
        </div>
    );
}

