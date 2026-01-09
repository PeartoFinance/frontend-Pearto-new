'use client';

import { useMemo, useState } from 'react';
import { TVChannel } from '@/types/media';
import ChannelCard from './ChannelCard';
import { Tv, Zap } from 'lucide-react';
import Link from 'next/link';

interface ChannelListProps {
    channels: TVChannel[];
    activeChannel: TVChannel | null;
    onSelectChannel: (channel: TVChannel) => void;
    loading?: boolean;
}

export default function ChannelList({ channels, activeChannel, onSelectChannel, loading }: ChannelListProps) {
    const [selectedCategory, setSelectedCategory] = useState<string>('All');

    const categories = useMemo(() => {
        return ['All', ...new Set(channels.map(c => c.category).filter(Boolean))];
    }, [channels]);

    const filteredChannels = useMemo(() => {
        if (selectedCategory === 'All') return channels;
        return channels.filter(c => c.category === selectedCategory);
    }, [channels, selectedCategory]);

    return (
        <div className="h-full flex flex-col bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-700">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <Tv className="w-5 h-5 text-emerald-500" />
                        <h2 className="font-bold text-slate-900 dark:text-white">Channels</h2>
                        <span className="text-xs bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-full">
                            {filteredChannels.length}
                        </span>
                    </div>

                    {/* Live Sports Button */}
                    <Link
                        href="/sports"
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold rounded-full hover:scale-105 transition-transform shadow-lg"
                    >
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        <Zap className="w-3.5 h-3.5" />
                        Live Sports
                    </Link>
                </div>

                {/* Category Filter */}
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${selectedCategory === cat
                                    ? 'bg-emerald-500 text-white shadow-md'
                                    : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Channel List */}
            <div className="flex-1 overflow-y-auto">
                <div className="p-2 space-y-1">
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-emerald-500" />
                        </div>
                    ) : filteredChannels.length === 0 ? (
                        <div className="text-center py-8 text-slate-500">
                            No channels available
                        </div>
                    ) : (
                        filteredChannels.map((channel) => (
                            <ChannelCard
                                key={channel.id}
                                channel={channel}
                                isActive={activeChannel?.id === channel.id}
                                onClick={() => onSelectChannel(channel)}
                            />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
