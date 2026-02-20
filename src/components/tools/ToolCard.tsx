'use client';

import Link from 'next/link';
import { ArrowUpRight, Sparkles, Clock } from 'lucide-react';
import { getCategoryStyle, getCategoryIcon, getToolMeta } from '@/data/tools';
import type { ToolSetting } from '@/services/toolsService';

interface ToolCardProps {
    tool: ToolSetting;
    compact?: boolean;
}

export default function ToolCard({ tool, compact }: ToolCardProps) {
    const meta = getToolMeta(tool.tool_slug);
    const style = getCategoryStyle(tool.category);
    const IconComponent = getCategoryIcon(tool.category);

    const description = meta?.description || `${tool.tool_name} tool`;
    const features = meta?.features || [];

    if (compact) {
        return (
            <Link
                href={`/tools/${tool.tool_slug}`}
                className="group flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-700/50 
                    hover:border-slate-200 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-all"
            >
                <div className={`p-2 rounded-lg ${style.bg} shrink-0`}>
                    <IconComponent className={`w-4 h-4 ${style.text}`} />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {tool.tool_name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">{description}</p>
                </div>
                {tool.is_implemented ? (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                ) : (
                    <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                )}
            </Link>
        );
    }

    return (
        <Link
            href={`/tools/${tool.tool_slug}`}
            className="group relative flex flex-col rounded-xl border transition-all duration-200
                bg-white dark:bg-slate-800/80
                border-slate-200/80 dark:border-slate-700/50
                hover:border-slate-300 dark:hover:border-slate-600
                hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-black/20 hover:-translate-y-0.5"
        >
            {/* Status indicator line at top */}
            <div className={`h-0.5 rounded-t-xl ${tool.is_implemented ? 'bg-emerald-500' : 'bg-amber-400'}`} />

            <div className="p-4 flex flex-col flex-1">
                {/* Header */}
                <div className="flex items-start gap-3 mb-3">
                    <div className={`p-2.5 rounded-xl ${style.bg} group-hover:scale-105 transition-transform duration-200`}>
                        <IconComponent className={`w-[18px] h-[18px] ${style.text}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-[13px] font-semibold text-slate-900 dark:text-white truncate leading-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                            {tool.tool_name}
                        </h3>
                        <span className={`inline-block text-[10px] font-semibold tracking-wide uppercase mt-1 ${style.text}`}>
                            {tool.category}
                        </span>
                    </div>
                    <ArrowUpRight 
                        className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 
                            group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200 shrink-0 mt-0.5" 
                    />
                </div>

                {/* Description */}
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-3 flex-1">
                    {description}
                </p>

                {/* Features */}
                {features.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                        {features.slice(0, 3).map((feature, idx) => (
                            <span
                                key={idx}
                                className="text-[10px] px-2 py-0.5 rounded-md bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 font-medium"
                            >
                                {feature}
                            </span>
                        ))}
                        {features.length > 3 && (
                            <span className="text-[10px] px-1.5 py-0.5 text-slate-400">
                                +{features.length - 3}
                            </span>
                        )}
                    </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 dark:border-slate-700/40">
                    {tool.is_implemented ? (
                        <span className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                            <Sparkles size={11} />
                            Ready
                        </span>
                    ) : (
                        <span className="flex items-center gap-1.5 text-[11px] font-medium text-amber-500 dark:text-amber-400">
                            <Clock size={11} />
                            Coming Soon
                        </span>
                    )}
                    <span className="text-[11px] font-medium text-slate-400 group-hover:text-emerald-500 transition-colors">
                        Open
                    </span>
                </div>
            </div>
        </Link>
    );
}
