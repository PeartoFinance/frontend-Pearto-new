'use client';

import { TVChannel } from '@/types/media';
import { Play, Tv, Globe } from 'lucide-react';

interface ChannelCardProps {
    channel: TVChannel;
    isActive: boolean;
    onClick: () => void;
}

export default function ChannelCard({ channel, isActive, onClick }: ChannelCardProps) {
    return (
        <button
            onClick={onClick}
            className={`w-full text-left p-3 rounded-xl transition-all duration-200 ${isActive
                    ? 'bg-emerald-500/10 ring-2 ring-emerald-500 shadow-md'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
        >
            <div className="flex items-center gap-3">
                {/* Channel Logo */}
                <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {channel.logo_url ? (
                        <img
                            src={channel.logo_url}
                            alt={channel.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                            }}
                        />
                    ) : (
                        <Tv className="w-5 h-5 text-slate-400" />
                    )}
                </div>

                {/* Channel Info */}
                <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate text-sm text-slate-900 dark:text-slate-100">
                        {channel.name}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                        {channel.country_code && (
                            <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                <Globe className="w-3 h-3" />
                                {channel.country_code}
                            </span>
                        )}
                        {channel.category && (
                            <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 rounded">
                                {channel.category}
                            </span>
                        )}
                        {channel.is_live && (
                            <span className="text-[10px] px-1.5 py-0.5 bg-red-500 text-white rounded flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                                LIVE
                            </span>
                        )}
                    </div>
                </div>

                {/* Playing Indicator */}
                {isActive && (
                    <div className="flex items-center gap-0.5">
                        <div className="w-1 h-3 bg-emerald-500 rounded-full animate-pulse" />
                        <div className="w-1 h-4 bg-emerald-500 rounded-full animate-pulse delay-75" />
                        <div className="w-1 h-2 bg-emerald-500 rounded-full animate-pulse delay-150" />
                    </div>
                )}
            </div>
        </button>
    );
}
