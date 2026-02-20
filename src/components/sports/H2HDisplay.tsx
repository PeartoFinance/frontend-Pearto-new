'use client';

import { useEffect, useState } from 'react';
import { Swords, RefreshCw } from 'lucide-react';
import { getHeadToHead } from '@/services/sportsService';
import type { SportsEvent } from '@/types/sports';

interface H2HDisplayProps {
    sportKey: string;
    team1Id: number;
    team2Id: number;
    team1Name: string;
    team2Name: string;
}

export default function H2HDisplay({ sportKey, team1Id, team2Id, team1Name, team2Name }: H2HDisplayProps) {
    const [matches, setMatches] = useState<SportsEvent[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!sportKey || !team1Id || !team2Id) return;
        setLoading(true);
        getHeadToHead(sportKey, team1Id, team2Id)
            .then(data => setMatches(data))
            .finally(() => setLoading(false));
    }, [sportKey, team1Id, team2Id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8 text-slate-400">
                <RefreshCw className="h-5 w-5 animate-spin mr-2" /> Loading H2H…
            </div>
        );
    }

    if (matches.length === 0) {
        return (
            <div className="text-center py-8 text-slate-400 text-sm">
                No head-to-head data available.
            </div>
        );
    }

    // Count wins
    let t1Wins = 0, t2Wins = 0, draws = 0;
    for (const m of matches) {
        const sh = parseInt(m.scoreHome || '0');
        const sa = parseInt(m.scoreAway || '0');
        if (isNaN(sh) || isNaN(sa)) continue;
        if (sh > sa) {
            // "home" in H2H could be either team — check name
            if (m.teamHome === team1Name) t1Wins++;
            else t2Wins++;
        } else if (sa > sh) {
            if (m.teamAway === team1Name) t1Wins++;
            else t2Wins++;
        } else {
            draws++;
        }
    }

    return (
        <div className="space-y-4">
            <h4 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Swords className="h-4 w-4 text-emerald-500" /> Head to Head
            </h4>

            {/* Summary */}
            <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-3">
                    <div className="text-2xl font-bold text-emerald-600">{t1Wins}</div>
                    <div className="text-xs text-slate-500 truncate">{team1Name}</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3">
                    <div className="text-2xl font-bold text-slate-400">{draws}</div>
                    <div className="text-xs text-slate-500">Draws</div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3">
                    <div className="text-2xl font-bold text-blue-600">{t2Wins}</div>
                    <div className="text-xs text-slate-500 truncate">{team2Name}</div>
                </div>
            </div>

            {/* Recent matches */}
            <div className="space-y-2">
                <h5 className="text-xs font-semibold text-slate-500 uppercase">Recent Meetings</h5>
                {matches.slice(0, 5).map((m, idx) => {
                    const d = m.eventDate ? new Date(m.eventDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';
                    return (
                        <div key={idx} className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 rounded-lg px-3 py-2 text-sm">
                            <span className="font-medium text-slate-900 dark:text-white flex-1 text-right truncate">{m.teamHome}</span>
                            <span className="mx-3 font-bold text-emerald-500 shrink-0">
                                {m.scoreHome ?? '-'} - {m.scoreAway ?? '-'}
                            </span>
                            <span className="font-medium text-slate-900 dark:text-white flex-1 truncate">{m.teamAway}</span>
                            <span className="text-xs text-slate-400 ml-3 shrink-0">{d}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
