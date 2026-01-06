'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface Course {
    title: string;
    subtitle: string;
    courses: number;
    students: number;
    description: string;
    duration: string;
    level: 'Featured' | 'Intermediate' | 'Advanced' | 'Beginner';
    gradient: string;
}

const courses: Course[] = [
    {
        title: 'Business Communication',
        subtitle: 'Professional Meetings & Presentations',
        courses: 24,
        students: 1847,
        description: 'Master business presentations, meeting facilitation, and professional communication skills',
        duration: '8 weeks',
        level: 'Intermediate',
        gradient: 'from-blue-500 to-indigo-600',
    },
    {
        title: 'Event Management',
        subtitle: 'Conferences & Large Scale Events',
        courses: 18,
        students: 1256,
        description: 'Learn event planning, conference management, and corporate event coordination',
        duration: '12 weeks',
        level: 'Advanced',
        gradient: 'from-orange-500 to-red-500',
    },
    {
        title: 'Professional Development',
        subtitle: 'Employee Training & Growth',
        courses: 36,
        students: 2341,
        description: 'Comprehensive skill development, leadership training, and career advancement programs',
        duration: '8 weeks',
        level: 'Beginner',
        gradient: 'from-emerald-500 to-teal-600',
    },
    {
        title: 'Innovation Workshops',
        subtitle: 'Creative Problem Solving',
        courses: 15,
        students: 892,
        description: 'Interactive workshops, design thinking, brainstorming techniques, and innovation methodologies',
        duration: '4 weeks',
        level: 'Intermediate',
        gradient: 'from-purple-500 to-pink-600',
    },
    {
        title: 'Employee Onboarding',
        subtitle: 'New Hire Integration',
        courses: 12,
        students: 567,
        description: 'Systematic onboarding processes, company culture integration, and new employee success programs',
        duration: '3 weeks',
        level: 'Beginner',
        gradient: 'from-teal-500 to-cyan-600',
    },
];

const levelColors: Record<string, string> = {
    Featured: 'bg-amber-500',
    Intermediate: 'bg-blue-500',
    Advanced: 'bg-orange-500',
    Beginner: 'bg-emerald-500',
};

export default function EducationalHub() {
    return (
        <section className="py-8">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Educational Hub</h2>
                <p className="text-slate-500 dark:text-slate-400">
                    Comprehensive learning and development platform for professional growth and education
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {courses.map((course) => (
                    <Link
                        key={course.title}
                        href="/learn"
                        className={`relative overflow-hidden rounded-2xl p-5 text-white bg-gradient-to-br ${course.gradient} shadow-lg transition-transform hover:-translate-y-1 hover:shadow-xl`}
                    >
                        {/* Level badges */}
                        <div className="flex gap-2 mb-3">
                            {course.level === 'Featured' && (
                                <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500 rounded">FEATURED</span>
                            )}
                            <span className={`px-2 py-0.5 text-[10px] font-medium bg-white/20 rounded`}>
                                {course.level}
                            </span>
                        </div>

                        {/* Icon */}
                        <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center mb-3">
                            <span className="text-xl">📚</span>
                        </div>

                        {/* Title */}
                        <h3 className="text-lg font-bold mb-1">{course.title}</h3>
                        <p className="text-white/80 text-xs mb-3">{course.subtitle}</p>

                        {/* Stats */}
                        <div className="flex gap-4 mb-3">
                            <div>
                                <span className="text-xl font-bold">{course.courses}</span>
                                <p className="text-[10px] text-white/70">Courses</p>
                            </div>
                            <div>
                                <span className="text-xl font-bold">{course.students.toLocaleString()}</span>
                                <p className="text-[10px] text-white/70">Students</p>
                            </div>
                        </div>

                        {/* Description */}
                        <p className="text-xs text-white/80 line-clamp-2 mb-3">{course.description}</p>

                        {/* Duration */}
                        <p className="text-[10px] text-white/60">Duration: {course.duration}</p>

                        {/* Arrow */}
                        <div className="absolute bottom-4 right-4">
                            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                                <ChevronRight size={16} />
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Stats Bar */}
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">500+</p>
                    <p className="text-sm text-slate-500">Courses Available</p>
                </div>
                <div className="text-center p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">50K+</p>
                    <p className="text-sm text-slate-500">Active Learners</p>
                </div>
                <div className="text-center p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">95%</p>
                    <p className="text-sm text-slate-500">Completion Rate</p>
                </div>
                <div className="text-center p-4 bg-emerald-500 text-white rounded-xl">
                    <p className="text-2xl font-bold">24/7</p>
                    <p className="text-sm text-emerald-100">Support Available</p>
                </div>
            </div>
        </section>
    );
}
