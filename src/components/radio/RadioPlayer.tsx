'use client';

import { useState, useRef, useEffect } from 'react';
import { RadioStation } from '@/types/media';
import { Play, Pause, Volume2, VolumeX, Radio } from 'lucide-react';

interface RadioPlayerProps {
    station: RadioStation | null;
    isPlaying: boolean;
    onTogglePlay: () => void;
}

export default function RadioPlayer({ station, isPlaying, onTogglePlay }: RadioPlayerProps) {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = isMuted ? 0 : volume;
        }
    }, [volume, isMuted]);

    useEffect(() => {
        if (station && audioRef.current) {
            audioRef.current.src = station.stream_url;
            if (isPlaying) {
                audioRef.current.play().catch(() => { });
            }
        }
    }, [station]);

    useEffect(() => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.play().catch(() => { });
            } else {
                audioRef.current.pause();
            }
        }
    }, [isPlaying]);

    const toggleMute = () => {
        setIsMuted(!isMuted);
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-t border-slate-200 dark:border-slate-700 shadow-lg px-4 py-3 z-40">
            <div className="max-w-7xl mx-auto flex items-center gap-4">
                {/* Play Button */}
                <button
                    onClick={onTogglePlay}
                    disabled={!station}
                    className="h-12 w-12 rounded-full flex items-center justify-center bg-emerald-500 hover:bg-emerald-600 text-white transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed"
                >
                    {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
                </button>

                {/* Station Info */}
                <div className="flex-1 min-w-0 flex items-center gap-3">
                    {station ? (
                        <>
                            {station.logo_url ? (
                                <img
                                    src={station.logo_url}
                                    alt=""
                                    className="h-10 w-10 rounded object-cover flex-shrink-0"
                                />
                            ) : (
                                <div className="h-10 w-10 rounded bg-slate-200 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                                    <Radio className="h-5 w-5 text-slate-400" />
                                </div>
                            )}
                            <div className="min-w-0">
                                <div className="font-medium text-slate-900 dark:text-white truncate">
                                    {station.name}
                                </div>
                                <div className="text-xs text-slate-500 truncate">
                                    {station.genre || station.country || station.language || 'Live stream'}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="text-sm text-slate-500">
                            Select a station to start listening...
                        </div>
                    )}
                </div>

                {/* Volume Controls */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={toggleMute}
                        className="h-10 w-10 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                        {isMuted ? (
                            <VolumeX className="h-4 w-4 text-slate-500" />
                        ) : (
                            <Volume2 className="h-4 w-4 text-slate-500" />
                        )}
                    </button>
                    <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.01}
                        value={volume}
                        onChange={(e) => setVolume(Number(e.target.value))}
                        className="w-24 sm:w-32 accent-emerald-500"
                    />
                </div>

                <audio ref={audioRef} hidden />
            </div>
        </div>
    );
}
