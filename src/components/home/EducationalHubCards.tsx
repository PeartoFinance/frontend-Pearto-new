'use client';

import Link from 'next/link';
import { BookOpen, TrendingUp, ArrowRight } from 'lucide-react';

export default function EducationalHubCards() {
    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Educational Hub</h3>
                <Link href="/learn" className="text-sm font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                    Browse all courses <ArrowRight className="w-4 h-4" />
                </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Course Card 1 */}
                <div className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30 transition-transform hover:-translate-y-1">
                    <div className="absolute top-0 right-0 p-4 opacity-20">
                        <BookOpen className="w-20 h-20" />
                    </div>
                    <div className="relative z-10">
                        <span className="bg-white/20 backdrop-blur-sm text-xs font-bold px-2 py-1 rounded text-white mb-3 inline-block">Intermediate</span>
                        <h4 className="text-xl font-bold mb-1">Technical Analysis 101</h4>
                        <p className="text-indigo-100 text-xs mb-4">Module 3: Candlestick Patterns</p>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="flex-1 bg-black/20 rounded-full h-1.5">
                                <div className="bg-white h-1.5 rounded-full" style={{ width: '65%' }} />
                            </div>
                            <span className="text-xs font-bold">65%</span>
                        </div>
                        <Link href="/learn/course/technical-analysis" className="w-full bg-white text-indigo-600 font-bold text-sm py-2 rounded-lg shadow-sm hover:bg-indigo-50 transition-colors inline-block text-center">
                            Resume Learning
                        </Link>
                    </div>
                </div>

                {/* Course Card 2 */}
                <div className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30 transition-transform hover:-translate-y-1">
                    <div className="absolute top-0 right-0 p-4 opacity-20">
                        <TrendingUp className="w-20 h-20" />
                    </div>
                    <div className="relative z-10">
                        <span className="bg-white/20 backdrop-blur-sm text-xs font-bold px-2 py-1 rounded text-white mb-3 inline-block">Advanced</span>
                        <h4 className="text-xl font-bold mb-1">Options Trading</h4>
                        <p className="text-emerald-100 text-xs mb-4">Strategies for Volatility</p>
                        <div className="flex items-center gap-3 mt-8">
                            <div className="flex -space-x-2">
                                <div className="w-6 h-6 rounded-full border-2 border-emerald-500 bg-slate-200" />
                                <div className="w-6 h-6 rounded-full border-2 border-emerald-500 bg-slate-300" />
                                <div className="w-6 h-6 rounded-full border-2 border-emerald-500 bg-slate-400" />
                            </div>
                            <span className="text-xs font-medium text-emerald-50">+2.4k learners</span>
                        </div>
                        <Link href="/learn/course/options-trading" className="mt-4 w-full bg-white/10 hover:bg-white/20 backdrop-blur text-white font-bold text-sm py-2 rounded-lg border border-white/30 transition-colors inline-block text-center">
                            Explore Course
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
