'use client';

import { useMemo } from 'react';
import { RadioStation } from '@/types/media';
import StationCard from './StationCard';

interface StationGridProps {
    stations: RadioStation[];
    activeStation: RadioStation | null;
    isPlaying: boolean;
    onToggleStation: (station: RadioStation) => void;
    loading?: boolean;
}

export default function StationGrid({
    stations,
    activeStation,
    isPlaying,
    onToggleStation,
    loading
}: StationGridProps) {
    if (loading) {
        return (
            <div className="flex items-center justify-center py-16">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-emerald-500" />
            </div>
        );
    }

    if (stations.length === 0) {
        return (
            <div className="text-center py-16">
                <div className="text-6xl mb-4">📻</div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    No Radio Stations
                </h3>
                <p className="text-slate-500">
                    No stations available for your region.
                </p>
            </div>
        );
    }

    return (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {stations.map((station) => (
                <StationCard
                    key={station.id}
                    station={station}
                    isActive={activeStation?.id === station.id}
                    isPlaying={activeStation?.id === station.id && isPlaying}
                    onToggle={() => onToggleStation(station)}
                />
            ))}
        </div>
    );
}
