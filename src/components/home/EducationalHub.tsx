'use client';

import Link from 'next/link';
import { ChevronRight, BookOpen, AlertCircle } from 'lucide-react';
import { useCourses } from '@/hooks/useEducationData';

interface Course {
    id: number;
    title: string;
    slug?: string;
    description?: string;
    category?: string;
    level?: 'Beginner' | 'Intermediate' | 'Advanced' | string;
    durationHours?: number;
    durationWeeks?: number;
    enrollmentCount?: number;
    thumbnailUrl?: string;
    isFree?: boolean;
    rating?: number;
    price?: number;
}

interface EducationStats {
    totalCourses: number;
    totalStudents: number;
    avgCompletionRate: number;
}


export default function EducationalHub() {
    const { data, isLoading: loading, isError: error } = useCourses(5);
    const courses = data?.courses || [];

    // Hardcoded stats for now, could catch from API if needed
    // If we want real stats, we can use data.total for totalCourses
    const stats: EducationStats = {
        totalCourses: data?.total || 500,
        totalStudents: 50000,
        avgCompletionRate: 95
    };

    const getLevelColor = (level?: string) => {
        switch (level?.toLowerCase()) {
            case 'beginner': return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400';
            case 'intermediate': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400';
            case 'advanced': return 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400';
            default: return 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400';
        }
    };

    return (
        <section>
            <div className="flex items-end justify-between mb-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Educational Hub</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                        Professional courses for growth and development
                    </p>
                </div>
                <Link href="/learn" className="hidden sm:flex items-center gap-1 text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 transition-colors">
                    Browse all <ChevronRight size={14} />
                </Link>
            </div>

            {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 animate-pulse">
                            <div className="h-4 w-16 bg-slate-200 dark:bg-slate-600 rounded mb-3" />
                            <div className="h-8 w-8 bg-slate-200 dark:bg-slate-600 rounded-lg mb-3" />
                            <div className="h-4 w-full bg-slate-200 dark:bg-slate-600 rounded mb-2" />
                            <div className="h-3 w-20 bg-slate-200 dark:bg-slate-600 rounded" />
                        </div>
                    ))}
                </div>
            ) : error && courses.length === 0 ? (
                <div className="flex items-center justify-center py-12 text-slate-500 dark:text-slate-400">
                    <AlertCircle size={20} className="mr-2" />
                    <span>Failed to load courses</span>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {courses.slice(0, 5).map((course) => (
                        <Link
                            key={course.id}
                            href={`/learn/${course.slug || course.id}`}
                            className="group bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/50 rounded-xl p-4 hover:border-emerald-500/50 transition-all relative hover:shadow-md"
                        >
                            {/* Level badge */}
                            <span className={`inline-block px-2 py-0.5 text-[10px] font-medium rounded ${getLevelColor(course.level)} mb-3`}>
                                {course.level || 'Beginner'}
                            </span>

                            {/* Icon */}
                            <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-3">
                                <BookOpen size={18} className="text-emerald-500" />
                            </div>

                            {/* Title */}
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-0.5 line-clamp-2">{course.title}</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-[11px] mb-3">{course.category || 'General'}</p>

                            {/* Stats */}
                            <div className="flex gap-3 text-[11px] text-gray-500 dark:text-gray-400">
                                <span><strong className="text-gray-900 dark:text-white">{course.duration || 10}</strong> hrs</span>
                                <span><strong className="text-gray-900 dark:text-white">{(course.enrolledCount || 0).toLocaleString()}</strong> learners</span>
                            </div>

                            {/* Arrow on hover */}
                            <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center">
                                    <ChevronRight size={14} className="text-white" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {/* Stats Bar */}
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                    { label: 'Courses Available', value: `${stats.totalCourses}+`, color: '' },
                    { label: 'Active Learners', value: `${(stats.totalStudents / 1000).toFixed(0)}K+`, color: '' },
                    { label: 'Completion Rate', value: `${stats.avgCompletionRate}%`, color: '' },
                    { label: 'Support Available', value: '24/7', color: 'bg-emerald-500 text-white border-emerald-500' },
                ].map((s) => (
                    <div key={s.label} className={`text-center p-3 rounded-xl border transition-colors ${s.color || 'bg-white dark:bg-slate-800/80 border-slate-200/80 dark:border-slate-700/50'}`}>
                        <p className={`text-xl font-bold ${s.color ? 'text-white' : 'text-gray-900 dark:text-white'}`}>{s.value}</p>
                        <p className={`text-xs mt-0.5 ${s.color ? 'text-emerald-100' : 'text-gray-500 dark:text-gray-400'}`}>{s.label}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}
