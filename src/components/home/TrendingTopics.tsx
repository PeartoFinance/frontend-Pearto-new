'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Flame, ChevronRight, Loader2 } from 'lucide-react';
import { get } from '@/services/api';

interface Topic {
    id: number;
    title: string;
    category?: string;
    rank: number;
}

const tagColors: Record<string, string> = {
    Tech: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    Crypto: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    Economy: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    Auto: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    Energy: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    Markets: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    Business: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
    default: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
};

export default function TrendingTopics() {
    const [topics, setTopics] = useState<Topic[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTopics = async () => {
            try {
                setLoading(true);
                const data = await get<Topic[]>('/content/trending', { limit: 5 });
                setTopics(data || []);
            } catch (err) {
                console.error('Failed to fetch trending topics:', err);
                setTopics([]);
            } finally {
                setLoading(false);
            }
        };

        fetchTopics();
    }, []);

    const getTagColor = (category?: string) => {
        return tagColors[category || ''] || tagColors.default;
    };

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
            {loading ? (
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="animate-spin text-emerald-500" size={20} />
                </div>
            ) : (
                <div className="space-y-3">
                    {topics.map((topic) => (
                        <Link
                            key={topic.id}
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
                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getTagColor(topic.category)}`}>
                                {topic.category || 'News'}
                            </span>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
