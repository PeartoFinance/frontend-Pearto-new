'use client';

import { useState, useEffect, useMemo } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import CourseGrid from '@/components/learn/CourseGrid';
import CategoryFilter from '@/components/learn/CategoryFilter';
import InstructorCard from '@/components/learn/InstructorCard';
import { Course, Instructor } from '@/types/education';
import { get } from '@/services/api';
import { GraduationCap, Search, BookOpen, Users, Award, TrendingUp } from 'lucide-react';

export default function LearnPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [instructors, setInstructors] = useState<Instructor[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);

    // Fetch courses
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [coursesRes, instructorsRes, categoriesRes] = await Promise.all([
                    get<{ courses: Course[] }>('/education/courses'),
                    get<{ instructors: Instructor[] }>('/education/instructors'),
                    get<{ categories: string[] }>('/education/categories')
                ]);

                if (coursesRes.courses) setCourses(coursesRes.courses);
                if (instructorsRes.instructors) setInstructors(instructorsRes.instructors);
                if (categoriesRes.categories) setCategories(categoriesRes.categories);
            } catch (error) {
                console.error('Failed to fetch courses:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Filter courses
    const filteredCourses = useMemo(() => {
        return courses.filter(course => {
            const matchesCategory = !selectedCategory || course.category === selectedCategory;
            const matchesSearch = !searchQuery ||
                course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                course.description?.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [courses, selectedCategory, searchQuery]);

    // Stats
    const stats = useMemo(() => ({
        totalCourses: courses.length,
        freeCourses: courses.filter(c => c.isFree).length,
        totalEnrollments: courses.reduce((sum, c) => sum + (c.enrollmentCount || 0), 0),
        avgRating: courses.length > 0
            ? (courses.reduce((sum, c) => sum + (c.rating || 0), 0) / courses.length).toFixed(1)
            : '0'
    }), [courses]);

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-slate-900">
            <Sidebar />

            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />

                <main className="flex-1 overflow-y-auto">
                    {/* Hero Section */}
                    <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-3 bg-white/20 rounded-xl backdrop-blur">
                                    <GraduationCap className="h-8 w-8" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold">Learn & Grow</h1>
                                    <p className="text-emerald-100">Master finance with expert-led courses</p>
                                </div>
                            </div>

                            {/* Search */}
                            <div className="relative max-w-xl">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search courses..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border-0 bg-white/10 backdrop-blur text-white placeholder-emerald-200 focus:ring-2 focus:ring-white/30 outline-none"
                                />
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                                <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                                    <div className="flex items-center gap-2 text-emerald-200 text-sm mb-1">
                                        <BookOpen className="h-4 w-4" />
                                        Courses
                                    </div>
                                    <div className="text-2xl font-bold">{stats.totalCourses}</div>
                                </div>
                                <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                                    <div className="flex items-center gap-2 text-emerald-200 text-sm mb-1">
                                        <Award className="h-4 w-4" />
                                        Free Courses
                                    </div>
                                    <div className="text-2xl font-bold">{stats.freeCourses}</div>
                                </div>
                                <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                                    <div className="flex items-center gap-2 text-emerald-200 text-sm mb-1">
                                        <Users className="h-4 w-4" />
                                        Enrollments
                                    </div>
                                    <div className="text-2xl font-bold">{stats.totalEnrollments.toLocaleString()}</div>
                                </div>
                                <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                                    <div className="flex items-center gap-2 text-emerald-200 text-sm mb-1">
                                        <TrendingUp className="h-4 w-4" />
                                        Avg Rating
                                    </div>
                                    <div className="text-2xl font-bold">{stats.avgRating} ⭐</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        {/* Category Filter */}
                        <div className="mb-8">
                            <h2 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wide">
                                Browse by Category
                            </h2>
                            <CategoryFilter
                                categories={categories}
                                selected={selectedCategory}
                                onSelect={setSelectedCategory}
                            />
                        </div>

                        {/* Courses Grid */}
                        <section className="mb-12">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                                    {selectedCategory || 'All Courses'}
                                </h2>
                                <span className="text-sm text-slate-500">
                                    {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''}
                                </span>
                            </div>
                            <CourseGrid courses={filteredCourses} loading={loading} />
                        </section>

                        {/* Featured Instructors */}
                        {instructors.length > 0 && (
                            <section>
                                <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">
                                    Featured Instructors
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {instructors.slice(0, 6).map(instructor => (
                                        <InstructorCard key={instructor.id} instructor={instructor} />
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
