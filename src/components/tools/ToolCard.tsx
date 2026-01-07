'use client';

import Link from 'next/link';
import { Calculator } from 'lucide-react';
import { getCategoryStyle, getCategoryIcon, getToolMeta } from '@/data/tools';
import type { ToolSetting } from '@/services/toolsService';

interface ToolCardProps {
    tool: ToolSetting;
}

export default function ToolCard({ tool }: ToolCardProps) {
    const meta = getToolMeta(tool.tool_slug);
    const style = getCategoryStyle(tool.category);
    const IconComponent = getCategoryIcon(tool.category);

    const description = meta?.description || `${tool.tool_name} tool`;
    const features = meta?.features || [];

    return (
        <Link
            href={`/tools/${tool.tool_slug}`}
            className={`
                group block p-5 rounded-xl border transition-all duration-200
                bg-white dark:bg-slate-800
                border-slate-200 dark:border-slate-700
                hover:border-emerald-500 dark:hover:border-emerald-500
                hover:shadow-lg hover:-translate-y-0.5
            `}
        >
            {/* Header */}
            <div className="flex items-start gap-3 mb-3">
                <div className={`p-2.5 rounded-lg ${style.bg}`}>
                    <IconComponent className={`w-5 h-5 ${style.text}`} />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 dark:text-white truncate group-hover:text-emerald-600 transition-colors">
                        {tool.tool_name}
                    </h3>
                    <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full mt-1 ${style.bg} ${style.text}`}>
                        {tool.category}
                    </span>
                </div>
            </div>

            {/* Description */}
            <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-3">
                {description}
            </p>

            {/* Features */}
            {features.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {features.slice(0, 3).map((feature, idx) => (
                        <span
                            key={idx}
                            className="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                        >
                            {feature}
                        </span>
                    ))}
                    {features.length > 3 && (
                        <span className="text-xs text-slate-400">
                            +{features.length - 3}
                        </span>
                    )}
                </div>
            )}

            {/* Status indicator */}
            {!tool.is_implemented && (
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                    <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
                        Coming Soon
                    </span>
                </div>
            )}
        </Link>
    );
}
