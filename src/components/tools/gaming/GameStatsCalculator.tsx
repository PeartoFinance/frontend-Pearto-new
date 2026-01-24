'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import { Gamepad2, Trophy, Target, Zap } from 'lucide-react';

export default function GameStatsCalculator() {
    const [kills, setKills] = useState(150);
    const [deaths, setDeaths] = useState(80);
    const [assists, setAssists] = useState(60);
    const [gamesPlayed, setGamesPlayed] = useState(25);
    const [gamesWon, setGamesWon] = useState(14);
    const [playtime, setPlaytime] = useState(30);

    const stats = useMemo(() => {
        const kd = deaths > 0 ? kills / deaths : kills;
        const kda = deaths > 0 ? (kills + assists) / deaths : kills + assists;
        const winRate = gamesPlayed > 0 ? (gamesWon / gamesPlayed) * 100 : 0;
        const killsPerGame = gamesPlayed > 0 ? kills / gamesPlayed : 0;
        const assistsPerGame = gamesPlayed > 0 ? assists / gamesPlayed : 0;
        const killsPerHour = playtime > 0 ? kills / playtime : 0;

        // Rating estimation (simplified)
        const rating = Math.min(100, (kda * 15) + (winRate * 0.5));

        return {
            kd,
            kda,
            winRate,
            killsPerGame,
            assistsPerGame,
            killsPerHour,
            rating
        };
    }, [kills, deaths, assists, gamesPlayed, gamesWon, playtime]);

    const getRatingColor = (rating: number) => {
        if (rating >= 80) return 'text-emerald-500';
        if (rating >= 60) return 'text-blue-500';
        if (rating >= 40) return 'text-amber-500';
        return 'text-red-500';
    };

    const getRatingLabel = (rating: number) => {
        if (rating >= 80) return 'Pro';
        if (rating >= 60) return 'Skilled';
        if (rating >= 40) return 'Average';
        return 'Beginner';
    };

    return (
        <CalculatorLayout
            title="Game Stats Calculator"
            description="Calculate K/D ratio, win rate, and performance metrics"
            category="Gaming"
            results={
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl text-center">
                            <Target className="w-6 h-6 text-red-500 mx-auto mb-2" />
                            <p className="text-xs text-slate-500">K/D Ratio</p>
                            <p className="text-3xl font-bold text-red-600">{stats.kd.toFixed(2)}</p>
                        </div>
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl text-center">
                            <Zap className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                            <p className="text-xs text-slate-500">KDA</p>
                            <p className="text-3xl font-bold text-purple-600">{stats.kda.toFixed(2)}</p>
                        </div>
                    </div>

                    <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl text-center">
                        <Trophy className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                        <p className="text-sm text-slate-500">Win Rate</p>
                        <p className="text-4xl font-bold text-emerald-600">{stats.winRate.toFixed(1)}%</p>
                        <p className="text-xs text-slate-400">{gamesWon}W / {gamesPlayed - gamesWon}L</p>
                    </div>

                    <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                            Per Game Average
                        </p>
                        <div className="grid grid-cols-2 gap-4 text-center">
                            <div>
                                <p className="text-2xl font-bold text-slate-700 dark:text-slate-300">
                                    {stats.killsPerGame.toFixed(1)}
                                </p>
                                <p className="text-xs text-slate-500">Kills/Game</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-700 dark:text-slate-300">
                                    {stats.assistsPerGame.toFixed(1)}
                                </p>
                                <p className="text-xs text-slate-500">Assists/Game</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-slate-900 rounded-xl text-center">
                        <p className="text-xs text-slate-400 mb-1">Performance Rating</p>
                        <p className={`text-5xl font-bold ${getRatingColor(stats.rating)}`}>
                            {stats.rating.toFixed(0)}
                        </p>
                        <p className={`text-sm font-medium ${getRatingColor(stats.rating)}`}>
                            {getRatingLabel(stats.rating)}
                        </p>
                    </div>
                </div>
            }
        >
            <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                    <div>
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Kills
                        </label>
                        <input
                            type="number"
                            value={kills}
                            onChange={(e) => setKills(Number(e.target.value))}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Deaths
                        </label>
                        <input
                            type="number"
                            value={deaths}
                            onChange={(e) => setDeaths(Number(e.target.value))}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Assists
                        </label>
                        <input
                            type="number"
                            value={assists}
                            onChange={(e) => setAssists(Number(e.target.value))}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Games Played
                        </label>
                        <input
                            type="number"
                            value={gamesPlayed}
                            onChange={(e) => setGamesPlayed(Number(e.target.value))}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Games Won
                        </label>
                        <input
                            type="number"
                            value={gamesWon}
                            onChange={(e) => setGamesWon(Math.min(gamesPlayed, Number(e.target.value)))}
                            max={gamesPlayed}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Total Playtime (hours)
                    </label>
                    <input
                        type="number"
                        value={playtime}
                        onChange={(e) => setPlaytime(Number(e.target.value))}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                </div>
            </div>
        </CalculatorLayout>
    );
}
