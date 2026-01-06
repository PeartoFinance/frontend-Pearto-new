'use client';

import Link from 'next/link';
import { Flame, ChevronRight } from 'lucide-react';

interface Topic {
    rank: number;
    title: string;
    tag: string;
    tagColor: string;
}

const trendingTopics: Topic[] = [
    { rank: 1, title: 'NVIDIA earnings beat expectations', tag: 'Tech', tagColor: 'blue' },
    { rank: 2, title: 'Bitcoin ETF approval speculation', tag: 'Crypto', tagColor: 'amber' },
    { rank: 3, title: 'Fed rate decision impact', tag: 'Economy', tagColor: 'emerald' },
    { rank: 4, title: 'Tesla Cybertruck deliveries begin', tag: 'Auto', tagColor: 'red' },
    { rank: 5, title: 'Oil prices surge on OPEC cuts', tag: 'Energy', tagColor: 'orange' },
];

const tagColors: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    amber: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    red: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    orange: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
};

export default function TrendingTopics() {
    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Flame className="text-orange-500" size={20} />
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        Trending Topics
                    </h3>
                </div>
                <Link
                    href="/news/trending"
                    className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                >
                    View All <ChevronRight size={14} />
                </Link>
            </div>

            {/* Topics List */}
            <div className="space-y-3">
                {trendingTopics.map((topic) => (
                    <Link
                        key={topic.rank}
                        href={`/news/topic/${topic.title.toLowerCase().replace(/\s+/g, '-')}`}
                        className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition group"
                    >
                        {/* Rank Number */}
                        <span className="text-3xl font-extrabold text-slate-200 dark:text-slate-700 min-w-[40px] group-hover:text-emerald-200 dark:group-hover:text-emerald-800 transition">
                            {topic.rank}
                        </span>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 dark:text-white truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">
                                {topic.title}
                            </p>
                        </div>

                        {/* Tag */}
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${tagColors[topic.tagColor]}`}>
                            {topic.tag}
                        </span>
                    </Link>
                ))}
            </div>
        </div>
    );
}
