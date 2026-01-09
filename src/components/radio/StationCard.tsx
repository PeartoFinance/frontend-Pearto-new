'use client';

import { RadioStation } from '@/types/media';
import { Play, Pause, Globe, Music, Radio } from 'lucide-react';

interface StationCardProps {
    station: RadioStation;
    isActive: boolean;
    isPlaying: boolean;
    onToggle: () => void;
}

export default function StationCard({ station, isActive, isPlaying, onToggle }: StationCardProps) {
    return (
        <div
            className={`relative rounded-xl border p-4 bg-white/70 dark:bg-slate-900/60 backdrop-blur-sm shadow-sm hover:shadow-md transition ${isActive ? 'ring-2 ring-emerald-500/60' : ''
                }`}
        >
            <div className="flex items-start gap-3">
                {/* Logo */}
                <div className="h-14 w-14 rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                    {station.logo_url ? (
                        <img
                            src={station.logo_url}
                            alt=""
                            loading="lazy"
                            className="h-full w-full object-cover"
                            onError={(e) => {
                                (e.currentTarget as HTMLImageElement).style.display = 'none';
                            }}
                        />
                    ) : (
                        <Radio className="h-6 w-6 text-slate-400" />
                    )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                        {station.name}
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                        {station.country && (
                            <>
                                <Globe className="h-3 w-3" />
                                <span>{station.country}</span>
                            </>
                        )}
                        {station.language && <span>• {station.language}</span>}
                    </div>
                    {station.genre && (
                        <div className="mt-2">
                            <span className="text-xs px-2 py-0.5 bg-emerald-500/10 text-emerald-600 rounded">
                                {station.genre}
                            </span>
                        </div>
                    )}
                    {station.bitrate && (
                        <div className="text-[10px] text-slate-400 mt-1">{station.bitrate}</div>
                    )}
                </div>

                {/* Play Button */}
                <button
                    onClick={onToggle}
                    aria-label={isActive && isPlaying ? 'Pause station' : 'Play station'}
                    className={`h-10 w-10 rounded-full flex items-center justify-center border shadow-sm transition ${isActive
                            ? 'bg-emerald-500 text-white border-emerald-600'
                            : 'bg-white dark:bg-slate-800 hover:bg-emerald-500 hover:text-white border-slate-200 dark:border-slate-600'
                        }`}
                >
                    {isActive && isPlaying ? (
                        <Pause className="h-4 w-4" />
                    ) : (
                        <Play className="h-4 w-4 ml-0.5" />
                    )}
                </button>
            </div>
        </div>
    );
}
