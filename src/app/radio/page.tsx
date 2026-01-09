'use client';

import { useEffect, useMemo, useState } from 'react';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import RadioPlayer from '@/components/radio/RadioPlayer';
import StationGrid from '@/components/radio/StationGrid';
import StationFilter from '@/components/radio/StationFilter';
import { RadioStation } from '@/types/media';
import { get } from '@/services/api';
import { Radio } from 'lucide-react';

export default function RadioPage() {
    const [stations, setStations] = useState<RadioStation[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeStation, setActiveStation] = useState<RadioStation | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedGenre, setSelectedGenre] = useState('All');

    // Fetch stations
    useEffect(() => {
        const fetchStations = async () => {
            try {
                const data = await get<RadioStation[]>('/media/radio-stations');
                setStations(data);
            } catch (error) {
                console.error('Failed to fetch radio stations:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStations();
    }, []);

    // Filter stations
    const filteredStations = useMemo(() => {
        return stations.filter((s) => {
            const matchesQuery =
                !searchQuery.trim() ||
                s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (s.country || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (s.language || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (s.genre || '').toLowerCase().includes(searchQuery.toLowerCase());

            const matchesGenre = selectedGenre === 'All' || s.genre === selectedGenre;

            return matchesQuery && matchesGenre;
        });
    }, [stations, searchQuery, selectedGenre]);

    // Toggle station play
    const handleToggleStation = (station: RadioStation) => {
        if (activeStation?.id === station.id) {
            setIsPlaying(!isPlaying);
        } else {
            setActiveStation(station);
            setIsPlaying(true);
        }
    };

    const handleTogglePlay = () => {
        if (activeStation) {
            setIsPlaying(!isPlaying);
        }
    };

    return (
        <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">
            <Sidebar />

            <div className="flex-1 flex flex-col">
                <Header />

                <main className="flex-1 px-4 lg:px-6 py-6 pb-32 overflow-auto">
                    {/* Header */}
                    <div className="flex flex-col gap-4 mb-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <Radio className="h-7 w-7 text-emerald-500" />
                                    Radio Stations
                                </h1>
                                <span className="text-xs px-2 py-1 rounded bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                                    {stations.length} stations
                                </span>
                            </div>
                        </div>

                        {/* Filters */}
                        <StationFilter
                            stations={stations}
                            selectedGenre={selectedGenre}
                            searchQuery={searchQuery}
                            onGenreChange={setSelectedGenre}
                            onSearchChange={setSearchQuery}
                        />

                        <div className="text-xs text-slate-500">
                            Showing {filteredStations.length} of {stations.length} stations
                            {selectedGenre !== 'All' && ` • ${selectedGenre}`}
                        </div>
                    </div>

                    {/* Station Grid */}
                    <StationGrid
                        stations={filteredStations}
                        activeStation={activeStation}
                        isPlaying={isPlaying}
                        onToggleStation={handleToggleStation}
                        loading={loading}
                    />
                </main>

                {/* Sticky Player */}
                <RadioPlayer
                    station={activeStation}
                    isPlaying={isPlaying}
                    onTogglePlay={handleTogglePlay}
                />
            </div>
        </div>
    );
}
