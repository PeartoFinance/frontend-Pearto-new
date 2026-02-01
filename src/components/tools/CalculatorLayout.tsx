'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowLeft, Calculator, Share2 } from 'lucide-react';
import { getCategoryStyle, getCategoryIcon } from '@/data/tools';

import VendorList from '@/components/vendors/VendorList';

interface CalculatorLayoutProps {
    title: string;
    description: string;
    category: string;
    children: ReactNode;
    results?: ReactNode;
    rightColumn?: ReactNode; // New prop for 3rd column
}

// Maps Tool Categories to Vendor Categories (expanded)
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

/**
 * Shared layout wrapper for calculator tools
 * Supports 2-column (standard) or 3-column (with vendors/ads) layouts
 */
export default function CalculatorLayout({
    title,
    description,
    category,
    children,
    results,
    rightColumn
}: CalculatorLayoutProps) {
    const style = getCategoryStyle(category);
    const IconComponent = getCategoryIcon(category);

    // Determine content for the right column
    // If explicit rightColumn provided, use it.
    // Otherwise, check if category maps to a vendor category and auto-inject.
    const vendorCategory = VENDOR_CATEGORY_MAP[category];
    const rightContent = rightColumn || (vendorCategory ? (
        <VendorList
            category={vendorCategory}
            title="Partners"
            limit={2}
            compact={true}
        />
    ) : null);

    // Use 3-column grid if we have content for the right side
    const hasRightColumn = !!rightContent;

    return (
        <div className="w-full h-full max-w-[1600px] mx-auto p-4">
            {/* Header */}
            <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link href="/tools" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition text-slate-500">
                        <ArrowLeft size={20} />
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${style.bg}`}>
                            <IconComponent className={`w-5 h-5 ${style.text}`} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
                                {title}
                            </h1>
                            <p className="text-sm text-slate-500 hidden sm:block">
                                {description}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full self-center ${style.bg} ${style.text}`}>
                        {category}
                    </span>
                    <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition text-slate-500">
                        <Share2 size={18} />
                    </button>
                </div>
            </div>

            {/* Content Grid - Updated ratio: 3/7/2 */}
            <div className={`grid gap-4 ${hasRightColumn ? 'lg:grid-cols-12' : 'lg:grid-cols-2'}`}>

                {/* Inputs Column */}
                <div className={`${hasRightColumn ? 'lg:col-span-3' : 'lg:col-span-1'} bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm`}>
                    <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-700">
                        <Calculator className="w-4 h-4 text-emerald-500" />
                        Inputs
                    </h2>
                    <div className="space-y-4">
                        {children}
                    </div>
                </div>

                {/* Results Column - Now wider (7 cols instead of 5) */}
                <div className={`${hasRightColumn ? 'lg:col-span-7' : 'lg:col-span-1'} bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm`}>
                    <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-4 pb-3 border-b border-slate-100 dark:border-slate-700">
                        Results
                    </h2>
                    {results || (
                        <p className="text-slate-500 dark:text-slate-400">
                            Enter values to see results
                        </p>
                    )}
                </div>

                {/* Right Column (Vendors/Ads) - Now smaller (2 cols instead of 4) */}
                {hasRightColumn && (
                    <div className="lg:col-span-2 space-y-4">
                        {rightContent}
                    </div>
                )}
            </div>
        </div>
    );
}

