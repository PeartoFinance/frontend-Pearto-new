'use client';

import { TVChannel } from '@/types/media';
import { ExternalLink, Globe } from 'lucide-react';

interface ChannelInfoBarProps {
    channel: TVChannel | null;
}

export default function ChannelInfoBar({ channel }: ChannelInfoBarProps) {
    if (!channel) return null;

    return (
        <div className="bg-gradient-to-t from-black/95 to-black/80 p-4 text-white">
            <div className="flex items-center gap-4">
                {channel.logo_url && (
                    <img
                        src={channel.logo_url}
                        alt={channel.name}
                        className="w-12 h-12 rounded-lg object-cover bg-white p-1"
                    />
                )}
                <div className="flex-1 min-w-0">
                    <h2 className="font-bold text-lg truncate">{channel.name}</h2>
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                        {channel.country_code && (
                            <span className="flex items-center gap-1">
                                <Globe className="w-3 h-3" />
                                {channel.country_code}
                            </span>
                        )}
                        {channel.language && <span>• {channel.language}</span>}
                        {channel.category && (
                            <span className="px-2 py-0.5 bg-emerald-500/30 rounded text-emerald-300 text-xs">
                                {channel.category}
                            </span>
                        )}
                        {channel.is_premium && (
                            <span className="px-2 py-0.5 bg-amber-500/30 rounded text-amber-300 text-xs">
                                Premium
                            </span>
                        )}
                    </div>
                </div>
                {channel.description && (
                    <a
                        href={`https://www.google.com/search?q=${encodeURIComponent(channel.name)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <ExternalLink className="w-5 h-5" />
                    </a>
                )}
            </div>
        </div>
    );
}
