'use client';

import Link from 'next/link';
import { BookOpen, TrendingUp, ArrowRight, Users } from 'lucide-react';

export default function EducationalHubCards() {
    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Educational Hub</h3>
                <Link href="/learn" className="text-sm font-bold text-emerald-500 hover:text-emerald-600 flex items-center gap-1">
                    Browse all courses <ArrowRight className="w-4 h-4" />
                </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Course Card 1 - Using emerald only */}
                <div className="card p-6 relative overflow-hidden hover:border-emerald-500 transition-all group">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <BookOpen className="w-20 h-20 text-emerald-500" />
                    </div>
                    <div className="relative z-10">
                        <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold px-2 py-1 rounded mb-3 inline-block">Intermediate</span>
                        <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Technical Analysis 101</h4>
                        <p className="text-gray-500 dark:text-gray-400 text-xs mb-4">Module 3: Candlestick Patterns</p>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                                <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '65%' }} />
                            </div>
                            <span className="text-xs font-bold text-gray-900 dark:text-white">65%</span>
                        </div>
                        <Link href="/learn/course/technical-analysis" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm py-2 rounded-lg transition-colors inline-block text-center">
                            Resume Learning
                        </Link>
                    </div>
                </div>

                {/* Course Card 2 - Using emerald only */}
                <div className="card p-6 relative overflow-hidden hover:border-emerald-500 transition-all group">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <TrendingUp className="w-20 h-20 text-emerald-500" />
                    </div>
                    <div className="relative z-10">
                        <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold px-2 py-1 rounded mb-3 inline-block">Advanced</span>
                        <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Options Trading</h4>
                        <p className="text-gray-500 dark:text-gray-400 text-xs mb-4">Strategies for Volatility</p>
                        <div className="flex items-center gap-3 mt-8">
                            <div className="flex -space-x-2">
                                <div className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-800 bg-gray-200" />
                                <div className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-800 bg-gray-300" />
                                <div className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-800 bg-gray-400" />
                            </div>
                            <span className="text-xs font-medium text-gray-500">+2.4k learners</span>
                        </div>
                        <Link href="/learn/course/options-trading" className="mt-4 w-full border border-emerald-500 text-emerald-500 hover:bg-emerald-500 hover:text-white font-bold text-sm py-2 rounded-lg transition-colors inline-block text-center">
                            Explore Course
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
