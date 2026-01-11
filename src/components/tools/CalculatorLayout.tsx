'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowLeft, Calculator, Share2 } from 'lucide-react';
import { getCategoryStyle, getCategoryIcon } from '@/data/tools';

interface CalculatorLayoutProps {
    title: string;
    description: string;
    category: string;
    children: ReactNode;
    results?: ReactNode;
}

/**
 * Shared layout wrapper for calculator tools
 * Provides consistent header, styling, and result display area
 */
export default function CalculatorLayout({
    title,
    description,
    category,
    children,
    results
}: CalculatorLayoutProps) {
    const style = getCategoryStyle(category);
    const IconComponent = getCategoryIcon(category);

    return (
        <div className="max-w-4xl mx-auto">
            {/* Back Link */}
            <Link
                href="/tools"
                className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-emerald-600 mb-6 transition"
            >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Tools</span>
            </Link>

            {/* Header */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 mb-6">
                <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-xl ${style.bg}`}>
                            <IconComponent className={`w-6 h-6 ${style.text}`} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                                {title}
                            </h1>
                            <p className="text-slate-600 dark:text-slate-400">
                                {description}
                            </p>
                            <span className={`inline-block mt-2 text-xs font-medium px-2.5 py-1 rounded-full ${style.bg} ${style.text}`}>
                                {category}
                            </span>
                        </div>
                    </div>

                    <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition">
                        <Share2 className="w-5 h-5 text-slate-500" />
                    </button>
                </div>
            </div>

            {/* Calculator Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Inputs Section */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <Calculator className="w-5 h-5 text-emerald-500" />
                        Calculator Inputs
                    </h2>
                    <div className="space-y-4">
                        {children}
                    </div>
                </div>

                {/* Results Section */}
                <div className="bg-linear-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl border border-emerald-200 dark:border-emerald-800 p-6">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                        Results
                    </h2>
                    {results || (
                        <p className="text-slate-500 dark:text-slate-400">
                            Enter values to see results
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
