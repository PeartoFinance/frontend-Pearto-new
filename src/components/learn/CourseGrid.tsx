'use client';

import { Course } from '@/types/education';
import CourseCard from './CourseCard';
import { BookOpen } from 'lucide-react';

interface CourseGridProps {
    courses: Course[];
    loading?: boolean;
}

export default function CourseGrid({ courses, loading }: CourseGridProps) {
    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="animate-pulse rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                        <div className="aspect-video bg-slate-200 dark:bg-slate-700" />
                        <div className="p-4 space-y-3">
                            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/4" />
                            <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full" />
                            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (courses.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <BookOpen className="h-16 w-16 text-slate-300 dark:text-slate-600 mb-4" />
                <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    No courses found
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md">
                    Check back later for new courses, or try a different category.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {courses.map(course => (
                <CourseCard key={course.id} course={course} />
            ))}
        </div>
    );
}
