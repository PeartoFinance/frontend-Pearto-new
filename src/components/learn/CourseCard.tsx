'use client';

import { Course } from '@/types/education';
import { Clock, Users, Star, Play, BookOpen } from 'lucide-react';
import Link from 'next/link';

interface CourseCardProps {
    course: Course;
}

export default function CourseCard({ course }: CourseCardProps) {
    const getLevelColor = (level: string) => {
        switch (level) {
            case 'Beginner': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300';
            case 'Intermediate': return 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300';
            case 'Advanced': return 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    return (
        <Link href={`/learn/${course.slug}`}>
            <div className="group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 hover:shadow-lg hover:border-emerald-300 dark:hover:border-emerald-600 transition-all duration-300">
                {/* Thumbnail */}
                <div className="relative aspect-video bg-gradient-to-br from-emerald-100 to-cyan-100 dark:from-slate-700 dark:to-slate-600 overflow-hidden">
                    {course.thumbnailUrl ? (
                        <img
                            src={course.thumbnailUrl}
                            alt={course.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <BookOpen className="h-12 w-12 text-emerald-500/50" />
                        </div>
                    )}

                    {/* Play overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="bg-emerald-500 rounded-full p-3 shadow-lg">
                            <Play className="h-6 w-6 text-white fill-white" />
                        </div>
                    </div>

                    {/* Level badge */}
                    <span className={`absolute top-3 left-3 text-xs font-medium px-2.5 py-1 rounded-full ${getLevelColor(course.level)}`}>
                        {course.level}
                    </span>

                    {/* Free badge */}
                    {course.isFree && (
                        <span className="absolute top-3 right-3 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500 text-white">
                            FREE
                        </span>
                    )}
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                    {/* Category */}
                    <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
                        {course.category}
                    </span>

                    {/* Title */}
                    <h3 className="font-semibold text-slate-900 dark:text-white line-clamp-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">
                        {course.title}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                        {course.description}
                    </p>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                        {course.durationHours && (
                            <span className="flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5" />
                                {course.durationHours}h
                            </span>
                        )}
                        <span className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" />
                            {course.enrollmentCount.toLocaleString()}
                        </span>
                        {course.rating > 0 && (
                            <span className="flex items-center gap-1 text-amber-500">
                                <Star className="h-3.5 w-3.5 fill-current" />
                                {course.rating.toFixed(1)}
                            </span>
                        )}
                    </div>

                    {/* Price */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-700">
                        {course.isFree ? (
                            <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">Free</span>
                        ) : (
                            <div className="flex items-baseline gap-2">
                                {course.discountPrice ? (
                                    <>
                                        <span className="text-lg font-bold text-slate-900 dark:text-white">
                                            ${course.discountPrice}
                                        </span>
                                        <span className="text-sm text-slate-400 line-through">
                                            ${course.price}
                                        </span>
                                    </>
                                ) : (
                                    <span className="text-lg font-bold text-slate-900 dark:text-white">
                                        ${course.price}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
}
