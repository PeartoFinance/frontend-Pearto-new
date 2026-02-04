'use client';

import Link from 'next/link';
import { ChevronRight, BookOpen, Clock, Loader2, AlertCircle } from 'lucide-react';
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
        <section className="py-8">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Educational Hub</h2>
                <p className="text-gray-500 dark:text-gray-400">
                    Comprehensive learning and development platform for professional growth and education
                </p>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="animate-spin text-emerald-500" size={24} />
                    <span className="ml-2 text-slate-500">Loading courses...</span>
                </div>
            ) : error && courses.length === 0 ? (
                <div className="flex items-center justify-center py-12 text-slate-500">
                    <AlertCircle size={20} className="mr-2" />
                    <span>Failed to load courses</span>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                    {courses.slice(0, 5).map((course) => (
                        <Link
                            key={course.id}
                            href={`/learn/${course.slug || course.id}`}
                            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 hover:border-emerald-500 transition-all group relative shadow-sm hover:shadow-md"
                        >
                            {/* Level badge */}
                            <div className="flex gap-2 mb-3">
                                <span className={`px-2 py-0.5 text-[10px] font-medium rounded ${getLevelColor(course.level)}`}>
                                    {course.level || 'Beginner'}
                                </span>
                            </div>

                            {/* Icon */}
                            <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-3">
                                <BookOpen size={20} className="text-emerald-500" />
                            </div>

                            {/* Title */}
                            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">{course.title}</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-xs mb-3">{course.category || 'General'}</p>

                            {/* Stats */}
                            <div className="flex gap-4 mb-3">
                                <div>
                                    <span className="text-lg font-bold text-gray-900 dark:text-white">{course.duration || 10}</span>
                                    <p className="text-[10px] text-gray-500">Hours</p>
                                </div>
                                <div>
                                    <span className="text-lg font-bold text-gray-900 dark:text-white">{(course.enrolledCount || 0).toLocaleString()}</span>
                                    <p className="text-[10px] text-gray-500">Students</p>
                                </div>
                            </div>

                            {/* Description */}
                            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">{course.description}</p>

                            {/* Duration (Alternative display if needed, otherwise removed as redundant) */}
                            {course.lessonsCount && (
                                <div className="flex items-center gap-1 text-[10px] text-gray-500">
                                    <Clock size={10} />
                                    Lessons: {course.lessonsCount}
                                </div>
                            )}

                            {/* Arrow on hover */}
                            <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center">
                                    <ChevronRight size={16} className="text-white" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {/* Stats Bar */}
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalCourses}+</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Courses Available</p>
                </div>
                <div className="text-center p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{(stats.totalStudents / 1000).toFixed(0)}K+</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Active Learners</p>
                </div>
                <div className="text-center p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.avgCompletionRate}%</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Completion Rate</p>
                </div>
                <div className="text-center p-4 bg-emerald-500 text-white rounded-lg">
                    <p className="text-2xl font-bold">24/7</p>
                    <p className="text-sm text-emerald-100">Support Available</p>
                </div>
            </div>
        </section>
    );
}
