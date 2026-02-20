'use client';

import { useEffect, useState } from 'react';
import { Trophy, RefreshCw } from 'lucide-react';
import { getStandings } from '@/services/sportsService';
import type { StandingGroup, StandingRow } from '@/types/sports';

interface StandingsTableProps {
    sportKey: string;
    leagueId: number;
    season?: number;
    compact?: boolean;
}

export default function StandingsTable({ sportKey, leagueId, season, compact = false }: StandingsTableProps) {
    const [groups, setGroups] = useState<StandingGroup[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!sportKey || !leagueId) return;
        setLoading(true);
        setError(null);
        getStandings(sportKey, leagueId, season)
            .then(data => setGroups(data))
            .catch(() => setError('Failed to load standings'))
            .finally(() => setLoading(false));
    }, [sportKey, leagueId, season]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8 text-slate-400">
                <RefreshCw className="h-5 w-5 animate-spin mr-2" /> Loading standings…
            </div>
        );
    }

    if (error || groups.length === 0) {
        return (
            <div className="text-center py-8 text-slate-400 text-sm">
                {error || 'No standings available for this league.'}
            </div>
        );
    }

    const isNba = sportKey === 'nba';

    return (
        <div className="space-y-6">
            {groups.map((group, gi) => (
                <div key={gi}>
                    {groups.length > 1 && (
                        <h4 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                            <Trophy className="h-4 w-4 text-emerald-500" />
                            {group.name}
                        </h4>
                    )}

                    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-800">
                                    <th className="text-left px-3 py-2 text-xs font-medium text-slate-500 w-8">#</th>
                                    <th className="text-left px-3 py-2 text-xs font-medium text-slate-500">Team</th>
                                    {!isNba ? (
                                        <>
                                            <th className="text-center px-2 py-2 text-xs font-medium text-slate-500">P</th>
                                            <th className="text-center px-2 py-2 text-xs font-medium text-slate-500">W</th>
                                            <th className="text-center px-2 py-2 text-xs font-medium text-slate-500">D</th>
                                            <th className="text-center px-2 py-2 text-xs font-medium text-slate-500">L</th>
                                            {!compact && (
                                                <>
                                                    <th className="text-center px-2 py-2 text-xs font-medium text-slate-500">GF</th>
                                                    <th className="text-center px-2 py-2 text-xs font-medium text-slate-500">GA</th>
                                                    <th className="text-center px-2 py-2 text-xs font-medium text-slate-500">GD</th>
                                                </>
                                            )}
                                            <th className="text-center px-2 py-2 text-xs font-medium text-slate-500 font-bold">Pts</th>
                                            {!compact && (
                                                <th className="text-center px-2 py-2 text-xs font-medium text-slate-500">Form</th>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            <th className="text-center px-2 py-2 text-xs font-medium text-slate-500">W</th>
                                            <th className="text-center px-2 py-2 text-xs font-medium text-slate-500">L</th>
                                            <th className="text-center px-2 py-2 text-xs font-medium text-slate-500">PCT</th>
                                            {!compact && (
                                                <>
                                                    <th className="text-center px-2 py-2 text-xs font-medium text-slate-500">Strk</th>
                                                    <th className="text-center px-2 py-2 text-xs font-medium text-slate-500">GB</th>
                                                </>
                                            )}
                                        </>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {group.rows.map((row, ri) => (
                                    <tr key={ri} className="border-t border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                        <td className="px-3 py-2 text-slate-400 font-medium">{row.rank ?? ri + 1}</td>
                                        <td className="px-3 py-2">
                                            <div className="flex items-center gap-2">
                                                {row.logo && <img src={row.logo} alt="" className="h-5 w-5" />}
                                                <span className="font-medium text-slate-900 dark:text-white whitespace-nowrap">{row.team}</span>
                                            </div>
                                            {row.description && (
                                                <span className="text-xs text-slate-400 block">{row.description}</span>
                                            )}
                                        </td>
                                        {!isNba ? (
                                            <>
                                                <td className="text-center px-2 py-2 text-slate-600 dark:text-slate-300">{row.played ?? '-'}</td>
                                                <td className="text-center px-2 py-2 text-slate-600 dark:text-slate-300">{row.won ?? '-'}</td>
                                                <td className="text-center px-2 py-2 text-slate-600 dark:text-slate-300">{row.drawn ?? '-'}</td>
                                                <td className="text-center px-2 py-2 text-slate-600 dark:text-slate-300">{row.lost ?? '-'}</td>
                                                {!compact && (
                                                    <>
                                                        <td className="text-center px-2 py-2 text-slate-600 dark:text-slate-300">{row.goalsFor ?? '-'}</td>
                                                        <td className="text-center px-2 py-2 text-slate-600 dark:text-slate-300">{row.goalsAgainst ?? '-'}</td>
                                                        <td className="text-center px-2 py-2 text-slate-600 dark:text-slate-300">{row.goalDiff ?? '-'}</td>
                                                    </>
                                                )}
                                                <td className="text-center px-2 py-2 font-bold text-emerald-600 dark:text-emerald-400">{row.points ?? '-'}</td>
                                                {!compact && row.form && (
                                                    <td className="text-center px-2 py-2">
                                                        <FormBadges form={row.form} />
                                                    </td>
                                                )}
                                            </>
                                        ) : (
                                            <>
                                                <td className="text-center px-2 py-2 text-slate-600 dark:text-slate-300">{row.won ?? '-'}</td>
                                                <td className="text-center px-2 py-2 text-slate-600 dark:text-slate-300">{row.lost ?? '-'}</td>
                                                <td className="text-center px-2 py-2 font-bold text-emerald-600 dark:text-emerald-400">{row.winPct ?? '-'}</td>
                                                {!compact && (
                                                    <>
                                                        <td className="text-center px-2 py-2 text-slate-600 dark:text-slate-300">{row.streak ?? '-'}</td>
                                                        <td className="text-center px-2 py-2 text-slate-600 dark:text-slate-300">{row.gamesBehind ?? '-'}</td>
                                                    </>
                                                )}
                                            </>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ))}
        </div>
    );
}

function FormBadges({ form }: { form: string }) {
    return (
        <div className="flex gap-0.5 justify-center">
            {form.split('').map((ch, i) => {
                const colors: Record<string, string> = {
                    W: 'bg-emerald-500',
                    D: 'bg-yellow-400',
                    L: 'bg-red-500',
                };
                return (
                    <span
                        key={i}
                        className={`w-4 h-4 rounded-sm flex items-center justify-center text-[9px] font-bold text-white ${colors[ch] || 'bg-slate-400'}`}
                    >
                        {ch}
                    </span>
                );
            })}
        </div>
    );
}
