'use client';

import Link from 'next/link';
import { Clock, ArrowRight } from 'lucide-react';

interface FeaturedStoryProps {
    title?: string;
    description?: string;
    category?: string;
    imageUrl?: string;
    timestamp?: string;
    href?: string;
}

export default function FeaturedStory({
    title = "Federal Reserve signals potential rate cuts in 2024 amid cooling inflation data",
    description = "Markets rally as Fed Chair Powell indicates the central bank may begin easing monetary policy in the coming months...",
    category = "MARKETS",
    imageUrl = "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop",
    timestamp = "2 hours ago",
    href = "/news/featured",
}: FeaturedStoryProps) {
    return (
        <Link
            href={href}
            className="group relative block overflow-hidden rounded-3xl aspect-[21/9] min-h-[280px]"
        >
            {/* Background Image */}
            <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{ backgroundImage: `url(${imageUrl})` }}
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/70 to-transparent" />

            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8">
                {/* Category Badge */}
                <span className="inline-block px-3 py-1 mb-4 text-xs font-bold tracking-wide text-white bg-emerald-500 rounded-full">
                    {category}
                </span>

                {/* Title */}
                <h2 className="text-2xl lg:text-3xl font-bold text-white mb-3 leading-tight group-hover:text-emerald-300 transition-colors">
                    {title}
                </h2>

                {/* Description */}
                <p className="text-slate-300 text-sm lg:text-base mb-4 line-clamp-2 max-w-3xl">
                    {description}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                        <Clock size={14} />
                        <span>{timestamp}</span>
                    </div>

                    <span className="flex items-center gap-1 text-emerald-400 font-medium text-sm group-hover:gap-2 transition-all">
                        Read Story <ArrowRight size={16} />
                    </span>
                </div>
            </div>
        </Link>
    );
}
