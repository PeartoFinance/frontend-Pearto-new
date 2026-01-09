'use client';

import { useRef, useEffect, useState } from 'react';
import { Play, Pause, Maximize2, Volume2, VolumeX, Loader2 } from 'lucide-react';

interface VideoPlayerProps {
    streamUrl: string;
    title: string;
    onFullscreen?: () => void;
}

export default function VideoPlayer({ streamUrl, title, onFullscreen }: VideoPlayerProps) {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const isIframe = streamUrl?.includes('youtube') || streamUrl?.includes('embed') || streamUrl?.includes('player');

    const handleFullscreen = () => {
        if (containerRef.current) {
            if (document.fullscreenElement) {
                document.exitFullscreen();
            } else {
                containerRef.current.requestFullscreen();
            }
        }
        onFullscreen?.();
    };

    useEffect(() => {
        setLoading(true);
        setError(false);
    }, [streamUrl]);

    if (!streamUrl) {
        return (
            <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                <div className="text-center text-slate-400">
                    <Play className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Select a channel to start watching</p>
                </div>
            </div>
        );
    }

    return (
        <div ref={containerRef} className="relative w-full h-full bg-black group">
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-900 z-10">
                    <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
                </div>
            )}

            {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-900 z-10">
                    <div className="text-center text-slate-400">
                        <p className="mb-2">Unable to load stream</p>
                        <a href={streamUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-500 hover:underline">
                            Open in new tab
                        </a>
                    </div>
                </div>
            )}

            {isIframe ? (
                <iframe
                    ref={iframeRef}
                    src={streamUrl}
                    className="absolute inset-0 w-full h-full"
                    allowFullScreen
                    allow="autoplay; encrypted-media; fullscreen"
                    onLoad={() => setLoading(false)}
                    onError={() => { setLoading(false); setError(true); }}
                />
            ) : (
                <video
                    src={streamUrl}
                    className="absolute inset-0 w-full h-full object-contain"
                    autoPlay
                    controls
                    onCanPlay={() => setLoading(false)}
                    onError={() => { setLoading(false); setError(true); }}
                />
            )}

            {/* Floating Controls */}
            <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                <button
                    onClick={handleFullscreen}
                    className="p-3 bg-black/70 hover:bg-black text-white rounded-full backdrop-blur-sm transition-all hover:scale-110"
                    title="Fullscreen"
                >
                    <Maximize2 className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}
