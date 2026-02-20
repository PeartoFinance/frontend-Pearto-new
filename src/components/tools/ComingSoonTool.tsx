'use client';

import Link from 'next/link';
import { ArrowLeft, Clock, Sparkles, Bell, ArrowRight } from 'lucide-react';
import { getCategoryStyle, getCategoryIcon, getToolMeta } from '@/data/tools';

interface ComingSoonToolProps {
    slug: string;
    name: string;
    category: string;
}

/**
 * Placeholder component for tools that are not yet implemented
 */
export default function ComingSoonTool({ slug, name, category }: ComingSoonToolProps) {
    const style = getCategoryStyle(category);
    const IconComponent = getCategoryIcon(category);
    const meta = getToolMeta(slug);

    const description = meta?.description || `${name} is coming soon!`;
    const features = meta?.features || [];

    return (
        <div className="max-w-3xl mx-auto">
            {/* Back Link */}
            <Link
                href="/tools"
                className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-6 transition"
            >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Tools</span>
            </Link>

            {/* Header */}
            <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700/50 p-5 sm:p-6 mb-5">
                <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${style.bg}`}>
                        <IconComponent className={`w-5 h-5 ${style.text}`} />
                    </div>
                    <div className="flex-1">
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                            {name}
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                            {description}
                        </p>
                        <span className={`inline-block mt-2.5 text-[10px] font-semibold tracking-wide uppercase ${style.text}`}>
                            {category}
                        </span>
                    </div>
                </div>
            </div>

            {/* Coming Soon */}
            <div className="relative rounded-2xl border border-slate-200/80 dark:border-slate-700/50 overflow-hidden">
                {/* Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 dark:from-slate-800/80 dark:via-slate-800/60 dark:to-emerald-900/10" />
                <div className="absolute inset-0">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px]" />
                </div>

                <div className="relative py-12 px-6 sm:px-8 text-center">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-900/30 mb-5">
                        <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                    </div>

                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                        Under Development
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 max-w-sm mx-auto leading-relaxed">
                        This tool is currently being built. We'll notify you when it's ready.
                    </p>

                    {/* Features Preview */}
                    {features.length > 0 && (
                        <div className="bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700/50 p-5 mb-8 max-w-sm mx-auto text-left">
                            <h3 className="text-xs font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2 uppercase tracking-wide">
                                <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                                Planned Features
                            </h3>
                            <ul className="space-y-2.5">
                                {features.map((feature, idx) => (
                                    <li key={idx} className="flex items-center gap-2.5 text-sm text-slate-600 dark:text-slate-400">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                        <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 text-sm font-medium rounded-xl transition-colors">
                            <Bell className="w-4 h-4" />
                            Notify Me
                        </button>
                        <Link
                            href="/tools"
                            className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                        >
                            Browse other tools
                            <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
