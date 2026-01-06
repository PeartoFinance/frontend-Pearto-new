'use client';

import Link from 'next/link';
import { Play, ChevronRight } from 'lucide-react';

interface Course {
    title: string;
    currentModule: string;
    progress: number;
    thumbnail: string;
}

const courseData: Course = {
    title: 'Stock Market Fundamentals',
    currentModule: 'Module 4: Technical Analysis',
    progress: 65,
    thumbnail: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&auto=format&fit=crop',
};

export default function LearningProgress() {
    return (
        <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-5 text-white">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Continue Learning</h3>
                <Link
                    href="/learn"
                    className="text-sm text-white/80 hover:text-white flex items-center gap-1"
                >
                    All Courses <ChevronRight size={14} />
                </Link>
            </div>

            <div className="flex gap-4">
                {/* Thumbnail */}
                <div
                    className="w-20 h-20 rounded-xl bg-cover bg-center flex-shrink-0"
                    style={{ backgroundImage: `url(${courseData.thumbnail})` }}
                />

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <p className="text-sm text-white/80 mb-1">{courseData.currentModule}</p>
                    <h4 className="font-semibold truncate mb-3">{courseData.title}</h4>

                    {/* Progress Bar */}
                    <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-white rounded-full transition-all"
                                style={{ width: `${courseData.progress}%` }}
                            />
                        </div>
                        <span className="text-sm font-medium">{courseData.progress}%</span>
                    </div>
                </div>
            </div>

            {/* Resume Button */}
            <Link
                href="/learn/course/stock-fundamentals/module-4"
                className="mt-4 flex items-center justify-center gap-2 w-full py-3 bg-white/20 hover:bg-white/30 rounded-xl font-semibold transition"
            >
                <Play size={16} />
                Resume Course
            </Link>
        </div>
    );
}
