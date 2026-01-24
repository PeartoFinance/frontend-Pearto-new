'use client';

import Link from 'next/link';
import { ArrowLeft, Clock, Sparkles, Bell } from 'lucide-react';
import { getCategoryStyle, getCategoryIcon, getToolMeta } from '@/data/tools';

interface ComingSoonToolProps {
    slug: string;
    name: string;
    category: string;
}

/**
 * Placeholder component for tools that are not yet implemented
 * Shows a "Coming Soon" message with tool info and notification signup
 */
export default function ComingSoonTool({ slug, name, category }: ComingSoonToolProps) {
    const style = getCategoryStyle(category);
    const IconComponent = getCategoryIcon(category);
    const meta = getToolMeta(slug);

    const description = meta?.description || `${name} is coming soon!`;
    const features = meta?.features || [];

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

            {/* Header Card */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 mb-6">
                <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${style.bg}`}>
                        <IconComponent className={`w-6 h-6 ${style.text}`} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                            {name}
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400">
                            {description}
                        </p>
                        <span className={`inline-block mt-2 text-xs font-medium px-2.5 py-1 rounded-full ${style.bg} ${style.text}`}>
                            {category}
                        </span>
                    </div>
                </div>
            </div>

            {/* Coming Soon Section */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl border border-emerald-200 dark:border-emerald-800 p-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/50 mb-4">
                    <Clock className="w-8 h-8 text-emerald-600" />
                </div>

                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    Coming Soon
                </h2>

                <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
                    We're working hard to bring you this tool. Stay tuned for updates!
                </p>

                {/* Planned Features */}
                {features.length > 0 && (
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 mb-6 max-w-md mx-auto">
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2 justify-center">
                            <Sparkles className="w-4 h-4 text-emerald-500" />
                            Planned Features
                        </h3>
                        <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-2">
                            {features.map((feature, idx) => (
                                <li key={idx} className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                    {feature}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Notify Button */}
                <button className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition">
                    <Bell className="w-4 h-4" />
                    Notify Me When Ready
                </button>
            </div>

            {/* Browse Other Tools */}
            <div className="mt-6 text-center">
                <Link
                    href="/tools"
                    className="text-emerald-600 hover:text-emerald-700 font-medium"
                >
                    Browse available tools →
                </Link>
            </div>
        </div>
    );
}
