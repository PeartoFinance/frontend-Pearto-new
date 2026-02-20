'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Play, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import { get } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

interface EnrolledCourse {
    enrollmentId: number;
    courseId: number;
    title: string;
    slug?: string;
    thumbnailUrl?: string;
    category?: string;
    level?: string;
    progress: number;
    status: string;
    currentModule?: {
        id: number;
        title: string;
    };
}

export default function LearningProgress() {
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const [courses, setCourses] = useState<EnrolledCourse[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isAuthenticated || authLoading) {
            setLoading(false);
            return;
        }

        const fetchEnrolledCourses = async () => {
            try {
                setLoading(true);
                const response = await get<{ courses: EnrolledCourse[] }>('/education/my-courses');
                setCourses(response.courses || []);
            } catch (err) {
                console.error('Failed to fetch enrolled courses:', err);
                setCourses([]);
            } finally {
                setLoading(false);
            }
        };

        fetchEnrolledCourses();
    }, [isAuthenticated, authLoading]);

    // Don't show widget if not authenticated
    if (!isAuthenticated && !authLoading) {
        return null;
    }

    // Show loading while checking auth
    if (authLoading || loading) {
        return (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 h-full">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Continue Learning</h3>
                </div>
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="animate-spin text-emerald-500" size={20} />
                </div>
            </div>
        );
    }

    // No enrolled courses
    if (courses.length === 0) {
        return (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 h-full">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Continue Learning</h3>
                    <Link
                        href="/learn"
                        className="text-sm text-emerald-500 hover:text-emerald-600 flex items-center gap-1"
                    >
                        All Courses <ChevronRight size={14} />
                    </Link>
                </div>
                <div className="flex flex-col items-center justify-center py-8 gap-2">
                    <AlertCircle size={24} className="text-slate-400 dark:text-slate-500" />
                    <p className="text-sm text-slate-500 dark:text-slate-400">No enrolled courses yet</p>
                    <Link
                        href="/learn"
                        className="text-sm text-emerald-500 hover:text-emerald-600 font-medium"
                    >
                        Browse courses
                    </Link>
                </div>
            </div>
        );
    }

    // Show the most recent course
    const courseData = courses[0];

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 h-full">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Continue Learning</h3>
                <Link
                    href="/learn"
                    className="text-sm text-emerald-500 hover:text-emerald-600 flex items-center gap-1"
                >
                    All Courses <ChevronRight size={14} />
                </Link>
            </div>

            <div className="flex gap-4">
                {/* Thumbnail */}
                <div
                    className="w-20 h-20 rounded-xl bg-cover bg-center flex-shrink-0 border border-gray-200 dark:border-gray-700 bg-slate-200 dark:bg-slate-700"
                    style={{ backgroundImage: courseData.thumbnailUrl ? `url(${courseData.thumbnailUrl})` : undefined }}
                />

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                        {courseData.currentModule?.title || courseData.category || 'Course'}
                    </p>
                    <h4 className="font-semibold text-gray-900 dark:text-white truncate mb-3">{courseData.title}</h4>

                    {/* Progress Bar */}
                    <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-emerald-500 rounded-full transition-all"
                                style={{ width: `${courseData.progress}%` }}
                            />
                        </div>
                        <span className="text-sm font-medium text-emerald-500">{courseData.progress}%</span>
                    </div>
                </div>
            </div>

            {/* Resume Button */}
            <Link
                href={`/learn/course/${courseData.slug || courseData.courseId}`}
                className="mt-4 flex items-center justify-center gap-2 w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold transition"
            >
                <Play size={16} />
                Resume Course
            </Link>
        </div>
    );
}
