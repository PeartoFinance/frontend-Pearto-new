'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import { Heart, Sparkles } from 'lucide-react';

const MESSAGES = [
    { min: 0, max: 20, text: "Keep working on it! Love takes time.", emoji: "🌱" },
    { min: 21, max: 40, text: "There's potential here! Keep getting to know each other.", emoji: "🌸" },
    { min: 41, max: 60, text: "A good foundation! The spark is definitely there.", emoji: "✨" },
    { min: 61, max: 80, text: "Looking great! You two have something special.", emoji: "💕" },
    { min: 81, max: 95, text: "Amazing compatibility! You're practically soulmates.", emoji: "💖" },
    { min: 96, max: 100, text: "A perfect match made in heaven!", emoji: "💘" },
];

export default function LoveCalculator() {
    const [name1, setName1] = useState('');
    const [name2, setName2] = useState('');
    const [calculated, setCalculated] = useState(false);

    const result = useMemo(() => {
        if (!name1.trim() || !name2.trim()) return null;

        // Fun deterministic algorithm based on names
        const combined = (name1.toLowerCase() + name2.toLowerCase()).replace(/\s/g, '');
        let hash = 0;
        for (let i = 0; i < combined.length; i++) {
            const char = combined.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        // Bias slightly higher for fun
        const score = Math.abs(hash % 60) + 40;

        const message = MESSAGES.find(m => score >= m.min && score <= m.max) || MESSAGES[0];

        return {
            score: Math.min(score, 100),
            message: message.text,
            emoji: message.emoji
        };
    }, [name1, name2]);

    const calculate = () => {
        if (name1.trim() && name2.trim()) {
            setCalculated(true);
        }
    };

    const reset = () => {
        setName1('');
        setName2('');
        setCalculated(false);
    };

    return (
        <CalculatorLayout
            title="Love Calculator"
            description="Find out your love compatibility (for fun only!)"
            category="Fun & Entertainment"
            results={
                <div className="space-y-4">
                    {calculated && result ? (
                        <>
                            <div className="text-center p-8 bg-gradient-to-br from-pink-50 to-red-50 dark:from-pink-900/20 dark:to-red-900/20 rounded-xl">
                                <div className="text-6xl mb-4">{result.emoji}</div>
                                <div className="relative w-32 h-32 mx-auto mb-4">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle
                                            cx="64"
                                            cy="64"
                                            r="56"
                                            stroke="currentColor"
                                            strokeWidth="12"
                                            fill="none"
                                            className="text-pink-100 dark:text-pink-900/30"
                                        />
                                        <circle
                                            cx="64"
                                            cy="64"
                                            r="56"
                                            stroke="currentColor"
                                            strokeWidth="12"
                                            fill="none"
                                            strokeDasharray={`${result.score * 3.52} 352`}
                                            strokeLinecap="round"
                                            className="text-pink-500"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-3xl font-bold text-pink-600">{result.score}%</span>
                                    </div>
                                </div>
                                <p className="text-lg font-medium text-slate-700 dark:text-slate-300">
                                    {result.message}
                                </p>
                            </div>

                            <div className="flex gap-2 justify-center text-sm text-slate-500">
                                <span className="px-3 py-1 bg-pink-100 dark:bg-pink-900/30 rounded-full">
                                    {name1} 💕 {name2}
                                </span>
                            </div>

                            <button
                                onClick={reset}
                                className="w-full px-4 py-2 text-sm bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition"
                            >
                                Try Another Match
                            </button>
                        </>
                    ) : (
                        <div className="text-center py-12">
                            <Heart className="w-16 h-16 text-pink-300 mx-auto mb-4" />
                            <p className="text-slate-500">Enter two names to calculate love compatibility</p>
                            <p className="text-xs text-slate-400 mt-2">For entertainment purposes only!</p>
                        </div>
                    )}
                </div>
            }
        >
            <div className="space-y-6">
                <div className="text-center">
                    <Sparkles className="w-8 h-8 text-pink-500 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">Enter two names to discover compatibility</p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Your Name
                    </label>
                    <input
                        type="text"
                        value={name1}
                        onChange={(e) => { setName1(e.target.value); setCalculated(false); }}
                        placeholder="Enter first name"
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-pink-500"
                    />
                </div>

                <div className="text-center">
                    <Heart className="w-6 h-6 text-pink-400 mx-auto" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Partner's Name
                    </label>
                    <input
                        type="text"
                        value={name2}
                        onChange={(e) => { setName2(e.target.value); setCalculated(false); }}
                        placeholder="Enter second name"
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-pink-500"
                    />
                </div>

                <button
                    onClick={calculate}
                    disabled={!name1.trim() || !name2.trim()}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 disabled:from-slate-300 disabled:to-slate-400 text-white font-medium rounded-lg transition"
                >
                    <Heart className="w-5 h-5" />
                    Calculate Love
                </button>

                <p className="text-xs text-center text-slate-400">
                    This is just for fun! Real love can't be measured by an algorithm. 💕
                </p>
            </div>
        </CalculatorLayout>
    );
}
