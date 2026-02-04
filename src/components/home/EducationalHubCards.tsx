'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookOpen, TrendingUp, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { get } from '@/services/api';

interface Course {
    id: number;
    title: string;
    slug?: string;
    description?: string;
    category?: string;
    level?: string;
    thumbnailUrl?: string;
    enrollmentCount?: number;
}

export default function EducationalHubCards() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                setLoading(true);
                const response = await get<{ courses: Course[] }>('/education/courses', { limit: 2 });
                setCourses(response.courses || []);
            } catch (err) {
                console.error('Failed to fetch courses:', err);
                setCourses([]);
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, []);

    const getLevelColor = (level?: string) => {
        switch (level?.toLowerCase()) {
            case 'beginner': return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400';
            case 'intermediate': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400';
            case 'advanced': return 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400';
            default: return 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400';
        }
    };

    if (loading) {
        return (
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Educational Hub</h3>
                    <Link href="/learn" className="text-sm font-bold text-emerald-500 hover:text-emerald-600 flex items-center gap-1">
                        Browse all courses <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="animate-spin text-emerald-500" size={20} />
                </div>
            </div>
        );
    }

    if (courses.length === 0) {
        return (
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Educational Hub</h3>
                    <Link href="/learn" className="text-sm font-bold text-emerald-500 hover:text-emerald-600 flex items-center gap-1">
                        Browse all courses <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
                <div className="flex flex-col items-center justify-center py-8 gap-2 text-slate-400">
                    <AlertCircle size={20} />
                    <span className="text-sm">No courses available</span>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Educational Hub</h3>
                <Link href="/learn" className="text-sm font-bold text-emerald-500 hover:text-emerald-600 flex items-center gap-1">
                    Browse all courses <ArrowRight className="w-4 h-4" />
                </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {courses.slice(0, 2).map((course, index) => (
                    <div key={course.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm p-6 relative overflow-hidden hover:border-emerald-500 transition-all group">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            {index === 0 ? (
                                <BookOpen className="w-20 h-20 text-emerald-500" />
                            ) : (
                                <TrendingUp className="w-20 h-20 text-emerald-500" />
                            )}
                        </div>
                        <div className="relative z-10">
                            <span className={`text-xs font-bold px-2 py-1 rounded mb-3 inline-block ${getLevelColor(course.level)}`}>
                                {course.level || 'Beginner'}
                            </span>
                            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{course.title}</h4>
                            <p className="text-gray-500 dark:text-gray-400 text-xs mb-4">{course.category || 'General'}</p>

                            {course.enrollmentCount && (
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="flex -space-x-2">
                                        <div className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-800 bg-gray-200" />
                                        <div className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-800 bg-gray-300" />
                                        <div className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-800 bg-gray-400" />
                                    </div>
                                    <span className="text-xs font-medium text-gray-500">+{course.enrollmentCount.toLocaleString()} learners</span>
                                </div>
                            )}

                            <Link
                                href={`/learn/course/${course.slug || course.id}`}
                                className="w-full border border-emerald-500 text-emerald-500 hover:bg-emerald-500 hover:text-white font-bold text-sm py-2 rounded-lg transition-colors inline-block text-center"
                            >
                                Explore Course
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
