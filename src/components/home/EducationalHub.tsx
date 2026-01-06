'use client';

import Link from 'next/link';
import { ChevronRight, BookOpen, Users, Award, Clock } from 'lucide-react';

interface Course {
    title: string;
    subtitle: string;
    courses: number;
    students: number;
    description: string;
    duration: string;
    level: 'Beginner' | 'Intermediate' | 'Advanced';
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
    },
    {
        title: 'Event Management',
        subtitle: 'Conferences & Large Scale Events',
        courses: 18,
        students: 1256,
        description: 'Learn event planning, conference management, and corporate event coordination',
        duration: '12 weeks',
        level: 'Advanced',
    },
    {
        title: 'Professional Development',
        subtitle: 'Employee Training & Growth',
        courses: 36,
        students: 2341,
        description: 'Comprehensive skill development, leadership training, and career advancement programs',
        duration: '8 weeks',
        level: 'Beginner',
    },
    {
        title: 'Innovation Workshops',
        subtitle: 'Creative Problem Solving',
        courses: 15,
        students: 892,
        description: 'Interactive workshops, design thinking, brainstorming techniques, and innovation methodologies',
        duration: '4 weeks',
        level: 'Intermediate',
    },
    {
        title: 'Employee Onboarding',
        subtitle: 'New Hire Integration',
        courses: 12,
        students: 567,
        description: 'Systematic onboarding processes, company culture integration, and new employee success programs',
        duration: '3 weeks',
        level: 'Beginner',
    },
];

export default function EducationalHub() {
    return (
        <section className="py-8">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Educational Hub</h2>
                <p className="text-gray-500 dark:text-gray-400">
                    Comprehensive learning and development platform for professional growth and education
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {courses.map((course) => (
                    <Link
                        key={course.title}
                        href="/learn"
                        className="card p-5 hover:border-emerald-500 transition-all group"
                    >
                        {/* Level badge */}
                        <div className="flex gap-2 mb-3">
                            <span className="px-2 py-0.5 text-[10px] font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded">
                                {course.level}
                            </span>
                        </div>

                        {/* Icon */}
                        <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-3">
                            <BookOpen size={20} className="text-emerald-500" />
                        </div>

                        {/* Title */}
                        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">{course.title}</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-xs mb-3">{course.subtitle}</p>

                        {/* Stats */}
                        <div className="flex gap-4 mb-3">
                            <div>
                                <span className="text-lg font-bold text-gray-900 dark:text-white">{course.courses}</span>
                                <p className="text-[10px] text-gray-500">Courses</p>
                            </div>
                            <div>
                                <span className="text-lg font-bold text-gray-900 dark:text-white">{course.students.toLocaleString()}</span>
                                <p className="text-[10px] text-gray-500">Students</p>
                            </div>
                        </div>

                        {/* Description */}
                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">{course.description}</p>

                        {/* Duration */}
                        <div className="flex items-center gap-1 text-[10px] text-gray-500">
                            <Clock size={10} />
                            Duration: {course.duration}
                        </div>

                        {/* Arrow on hover */}
                        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center">
                                <ChevronRight size={16} className="text-white" />
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Stats Bar */}
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 card">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">500+</p>
                    <p className="text-sm text-gray-500">Courses Available</p>
                </div>
                <div className="text-center p-4 card">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">50K+</p>
                    <p className="text-sm text-gray-500">Active Learners</p>
                </div>
                <div className="text-center p-4 card">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">95%</p>
                    <p className="text-sm text-gray-500">Completion Rate</p>
                </div>
                <div className="text-center p-4 bg-emerald-500 text-white rounded-lg">
                    <p className="text-2xl font-bold">24/7</p>
                    <p className="text-sm text-emerald-100">Support Available</p>
                </div>
            </div>
        </section>
    );
}
