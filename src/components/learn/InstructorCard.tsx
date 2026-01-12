'use client';

import { Instructor } from '@/types/education';
import { Star, Users, BookOpen } from 'lucide-react';

interface InstructorCardProps {
    instructor: Instructor;
}

export default function InstructorCard({ instructor }: InstructorCardProps) {
    return (
        <div className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-600 transition">
            {/* Avatar */}
            <div className="flex-shrink-0">
                {instructor.avatarUrl ? (
                    <img
                        src={instructor.avatarUrl}
                        alt={instructor.name}
                        className="h-16 w-16 rounded-full object-cover border-2 border-emerald-500"
                    />
                ) : (
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
                        <span className="text-xl font-bold text-white">
                            {instructor.name.charAt(0).toUpperCase()}
                        </span>
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                    {instructor.name}
                </h3>
                {instructor.title && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
                        {instructor.title}
                    </p>
                )}
                <div className="flex items-center gap-3 mt-2 text-xs text-slate-500 dark:text-slate-400">
                    {instructor.rating && instructor.rating > 0 && (
                        <span className="flex items-center gap-1 text-amber-500">
                            <Star className="h-3.5 w-3.5 fill-current" />
                            {instructor.rating.toFixed(1)}
                        </span>
                    )}
                    {instructor.coursesCount && instructor.coursesCount > 0 && (
                        <span className="flex items-center gap-1">
                            <BookOpen className="h-3.5 w-3.5" />
                            {instructor.coursesCount} courses
                        </span>
                    )}
                    {instructor.studentsTaught && instructor.studentsTaught > 0 && (
                        <span className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" />
                            {instructor.studentsTaught.toLocaleString()} students
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
