'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Play, Clock, Award, ChevronRight } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { useAuth } from '@/context/AuthContext';
import { getMyCourses, type EnrolledCourse } from '@/services/educationService';

export default function MyCoursesPage() {
    const router = useRouter();
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const [courses, setCourses] = useState<EnrolledCourse[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/login?redirect=/my-courses');
            return;
        }

        if (isAuthenticated) {
            loadCourses();
        }
    }, [isAuthenticated, authLoading, router]);

    const loadCourses = async () => {
        try {
            const data = await getMyCourses();
            setCourses(data.courses);
        } catch (error) {
            console.error('Failed to load courses:', error);
        } finally {
            setLoading(false);
        }
    };

    if (authLoading || loading) {
        return (
            <div className="flex h-screen bg-slate-900">
                <Sidebar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500" />
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-slate-900">
            <Sidebar />

            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />

                <main className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-7xl mx-auto">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                                    <BookOpen className="text-emerald-500" />
                                    My Courses
                                </h1>
                                <p className="text-slate-400 mt-2">Continue your learning journey</p>
                            </div>
                            <button
                                onClick={() => router.push('/learn')}
                                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-medium rounded-lg flex items-center gap-2"
                            >
                                Browse Courses <ChevronRight size={16} />
                            </button>
                        </div>

                        {/* Stats */}
                        {courses.length > 0 && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                <StatCard
                                    icon={<BookOpen className="text-emerald-500" />}
                                    label="Enrolled"
                                    value={courses.length}
                                />
                                <StatCard
                                    icon={<Play className="text-blue-500" />}
                                    label="In Progress"
                                    value={courses.filter(c => c.status === 'in_progress').length}
                                />
                                <StatCard
                                    icon={<Award className="text-yellow-500" />}
                                    label="Completed"
                                    value={courses.filter(c => c.status === 'completed').length}
                                />
                                <StatCard
                                    icon={<Clock className="text-purple-500" />}
                                    label="Avg Progress"
                                    value={`${Math.round(courses.reduce((acc, c) => acc + c.progress, 0) / courses.length || 0)}%`}
                                />
                            </div>
                        )}

                        {/* Course Grid */}
                        {courses.length === 0 ? (
                            <div className="text-center py-20 bg-slate-800 rounded-2xl border border-slate-700">
                                <BookOpen className="w-16 h-16 text-slate-500 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-white mb-2">No courses enrolled yet</h3>
                                <p className="text-slate-400 mb-6">Start learning today!</p>
                                <button
                                    onClick={() => router.push('/learn')}
                                    className="px-6 py-3 bg-emerald-500 text-black font-medium rounded-lg"
                                >
                                    Explore Courses
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {courses.map((course) => (
                                    <MyCourseCard key={course.enrollmentId} course={course} />
                                ))}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number | string }) {
    return (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-700 rounded-lg">{icon}</div>
                <div>
                    <p className="text-2xl font-bold text-white">{value}</p>
                    <p className="text-sm text-slate-400">{label}</p>
                </div>
            </div>
        </div>
    );
}

function MyCourseCard({ course }: { course: EnrolledCourse }) {
    const router = useRouter();
    const statusColors = {
        enrolled: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
        in_progress: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
        completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
        paused: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
        unenrolled: 'bg-red-500/10 text-red-400 border-red-500/30',
    };

    return (
        <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden hover:border-slate-600 transition group">
            {/* Thumbnail */}
            <div className="relative aspect-video bg-slate-700">
                {course.thumbnailUrl ? (
                    <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="w-12 h-12 text-slate-500" />
                    </div>
                )}
                {/* Progress overlay */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-600">
                    <div
                        className="h-full bg-emerald-500 transition-all"
                        style={{ width: `${course.progress}%` }}
                    />
                </div>
            </div>

            {/* Content */}
            <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-white line-clamp-2">{course.title}</h3>
                    <span className={`px-2 py-0.5 text-xs rounded border ${statusColors[course.status]}`}>
                        {course.status.replace('_', ' ')}
                    </span>
                </div>

                <p className="text-sm text-slate-400 mb-3">
                    by {course.instructor?.name || 'Unknown'}
                </p>

                {/* Progress bar */}
                <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-400">Progress</span>
                        <span className="text-emerald-400 font-medium">{course.progress}%</span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full transition-all"
                            style={{ width: `${course.progress}%` }}
                        />
                    </div>
                </div>

                {course.currentModule && (
                    <p className="text-xs text-slate-500 mb-3 truncate">
                        Next: {course.currentModule.title}
                    </p>
                )}

                <button
                    onClick={() => router.push(`/my-courses/${course.courseId}`)}
                    className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-medium rounded-lg flex items-center justify-center gap-2"
                >
                    <Play size={16} />
                    {course.progress > 0 ? 'Continue Learning' : 'Start Course'}
                </button>
            </div>
        </div>
    );
}
