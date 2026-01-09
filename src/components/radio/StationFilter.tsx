'use client';

import { useMemo, useState } from 'react';
import { RadioStation } from '@/types/media';
import { Search, Music, X } from 'lucide-react';

interface StationFilterProps {
    stations: RadioStation[];
    selectedGenre: string;
    searchQuery: string;
    onGenreChange: (genre: string) => void;
    onSearchChange: (query: string) => void;
}

export default function StationFilter({
    stations,
    selectedGenre,
    searchQuery,
    onGenreChange,
    onSearchChange,
}: StationFilterProps) {
    const genres = useMemo(() => {
        const genreSet = new Set<string>();
        stations.forEach((s) => {
            if (s.genre) genreSet.add(s.genre);
        });
        return ['All', ...Array.from(genreSet).sort()];
    }, [stations]);

    return (
        <div className="flex flex-col sm:flex-row gap-3">
            {/* Genre Filter */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                <Music className="h-4 w-4 text-slate-400" />
                <select
                    value={selectedGenre}
                    onChange={(e) => onGenreChange(e.target.value)}
                    className="flex-1 bg-transparent text-sm outline-none min-w-[120px] text-slate-700 dark:text-slate-200"
                >
                    {genres.map((g) => (
                        <option key={g} value={g}>
                            {g}
                        </option>
                    ))}
                </select>
            </div>

            {/* Search */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex-1">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Search by name, country, language..."
                    className="flex-1 text-sm outline-none bg-transparent text-slate-700 dark:text-slate-200"
                />
                {searchQuery && (
                    <button
                        onClick={() => onSearchChange('')}
                        className="text-slate-400 hover:text-slate-600"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>
        </div>
    );
}
