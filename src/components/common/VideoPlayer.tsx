import { Play } from 'lucide-react';

interface VideoPlayerProps {
    url?: string;
    thumbnail?: string;
    title?: string;
    autoplay?: boolean;
}

export default function VideoPlayer({ url, thumbnail, title, autoplay = false }: VideoPlayerProps) {
    if (!url) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-slate-900 border border-slate-800 rounded-xl relative overflow-hidden group">
                {thumbnail && (
                    <>
                        <img src={thumbnail} alt={title} className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-700" />
                        <div className="absolute inset-0 bg-black/40" />
                    </>
                )}
                <div className="relative z-10 text-center p-6">
                    <div className="w-16 h-16 bg-white/10 backdrop-blur rounded-full flex items-center justify-center mx-auto mb-4 border border-white/20">
                        <Play className="w-8 h-8 text-white/50 ml-1" />
                    </div>
                    <p className="text-slate-400 font-medium">Select a module to start watching</p>
                </div>
            </div>
        );
    }

    // Helper to extract YouTube ID
    const getYoutubeId = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const youtubeId = getYoutubeId(url);

    if (youtubeId) {
        return (
            <div className="w-full h-full bg-black rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10">
                <iframe
                    className="w-full h-full"
                    src={`https://www.youtube.com/embed/${youtubeId}?autoplay=${autoplay ? 1 : 0}&rel=0&modestbranding=1`}
                    title={title || 'Video player'}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                />
            </div>
        );
    }

    // Direct video file (mp4, webm, etc.)
    return (
        <div className="w-full h-full bg-black rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10 relative group">
            <video
                key={url} // Force re-render on url change
                src={url}
                poster={thumbnail}
                controls
                className="w-full h-full object-contain"
                autoPlay={autoplay}
            >
                <div className="flex items-center justify-center h-full text-white">
                    Your browser does not support the video tag.
                </div>
            </video>
        </div>
    );
}
