'use client';

import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { getCategoryStyle, getCategoryIcon, getToolMeta } from '@/data/tools';
import type { ToolSetting } from '@/services/toolsService';

interface ToolCardProps {
    tool: ToolSetting;
}

// Category-specific gradient backgrounds
const categoryGradients: Record<string, string> = {
    'Finance': 'from-emerald-500/10 via-teal-500/5 to-transparent',
    'Investing': 'from-blue-500/10 via-indigo-500/5 to-transparent',
    'Insurance': 'from-purple-500/10 via-violet-500/5 to-transparent',
    'Taxation': 'from-amber-500/10 via-orange-500/5 to-transparent',
    'Utilities': 'from-cyan-500/10 via-sky-500/5 to-transparent',
    'Health': 'from-rose-500/10 via-pink-500/5 to-transparent',
    'Retirement': 'from-indigo-500/10 via-purple-500/5 to-transparent',
    'Savings': 'from-green-500/10 via-emerald-500/5 to-transparent',
    'Debt': 'from-red-500/10 via-rose-500/5 to-transparent',
    'Real Estate': 'from-orange-500/10 via-amber-500/5 to-transparent',
    'Portfolio': 'from-teal-500/10 via-cyan-500/5 to-transparent',
    'Trading': 'from-violet-500/10 via-purple-500/5 to-transparent',
};

export default function ToolCard({ tool }: ToolCardProps) {
    const meta = getToolMeta(tool.tool_slug);
    const style = getCategoryStyle(tool.category);
    const IconComponent = getCategoryIcon(tool.category);
    const gradient = categoryGradients[tool.category] || 'from-slate-500/10 via-slate-400/5 to-transparent';

    const description = meta?.description || `${tool.tool_name} tool`;
    const features = meta?.features || [];

    return (
        <Link
            href={`/tools/${tool.tool_slug}`}
            className="group relative block overflow-hidden rounded-2xl border transition-all duration-300
                bg-white dark:bg-slate-800/80
                border-slate-200 dark:border-slate-700/50
                hover:border-emerald-500/50 dark:hover:border-emerald-500/50
                hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1"
        >
            {/* Gradient Background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

            {/* Card Content */}
            <div className="relative p-5">
                {/* Header */}
                <div className="flex items-start gap-3 mb-4">
                    <div className={`relative p-3 rounded-xl ${style.bg} shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-300`}>
                        <IconComponent className={`w-5 h-5 ${style.text}`} />
                        {tool.is_implemented && (
                            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-800" />
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-900 dark:text-white truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                            {tool.tool_name}
                        </h3>
                        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full mt-1.5 ${style.bg} ${style.text}`}>
                            {tool.category}
                        </span>
                    </div>
                </div>

                {/* Description */}
                <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                    {description}
                </p>

                {/* Features */}
                {features.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                        {features.slice(0, 3).map((feature, idx) => (
                            <span
                                key={idx}
                                className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-400 font-medium"
                            >
                                {feature}
                            </span>
                        ))}
                        {features.length > 3 && (
                            <span className="text-xs text-slate-400 px-2 py-1">
                                +{features.length - 3} more
                            </span>
                        )}
                    </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700/50">
                    {tool.is_implemented ? (
                        <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                            <Sparkles size={12} />
                            Ready to use
                        </span>
                    ) : (
                        <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
                            Coming Soon
                        </span>
                    )}
                    <span className="flex items-center gap-1 text-xs font-medium text-slate-400 group-hover:text-emerald-500 transition-colors">
                        Open Tool
                        <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                    </span>
                </div>
            </div>
        </Link>
    );
}
