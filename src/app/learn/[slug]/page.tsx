'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { Course, Instructor, CourseModule } from '@/types/education';
import { get } from '@/services/api';
import {
    ArrowLeft, Star, Users, Clock, Award, Play, CheckCircle,
    BookOpen, Lock, GraduationCap, Share2, Heart, Zap, Download
} from 'lucide-react';
import { AIWidget } from '@/components/ai';

interface CourseDetail extends Course {
    longDescription?: string;
    videoUrl?: string;
    requirements?: string[];
    whatYouLearn?: string[];
    modules?: CourseModule[];
}

export default function CourseDetailPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;

    const [course, setCourse] = useState<CourseDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'curriculum' | 'instructor'>('overview');

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const data = await get<CourseDetail>(`/education/courses/${slug}`);
                setCourse(data);
            } catch (error) {
                console.error('Failed to fetch course:', error);
            } finally {
                setLoading(false);
            }
        };

        if (slug) fetchCourse();
    }, [slug]);

    const getLevelColor = (level?: string) => {
        switch (level) {
            case 'Beginner': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
            case 'Intermediate': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
            case 'Advanced': return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
            default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen bg-slate-900">
                <Sidebar />
                <div className="flex-1 flex flex-col overflow-hidden">
                    <Header />
                    <main className="flex-1 overflow-y-auto flex items-center justify-center">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4" />
                            <p className="text-slate-400">Loading course...</p>
                        </div>
                    </main>
                </div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="flex h-screen bg-slate-900">
                <Sidebar />
                <div className="flex-1 flex flex-col overflow-hidden">
                    <Header />
                    <main className="flex-1 overflow-y-auto flex items-center justify-center">
                        <div className="text-center">
                            <GraduationCap className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold text-white mb-2">Course Not Found</h2>
                            <p className="text-slate-400 mb-4">The course you're looking for doesn't exist.</p>
                            <Link href="/learn" className="text-emerald-400 hover:text-emerald-300 flex items-center justify-center gap-2">
                                <ArrowLeft className="h-4 w-4" /> Back to Courses
                            </Link>
                        </div>
                    </main>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-slate-900">
            <Sidebar />

            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />

                <main className="flex-1 overflow-y-auto">
                    {/* Hero Section */}
                    <div className="bg-linear-to-br from-slate-800 via-slate-800 to-slate-900 border-b border-slate-700/50">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                            {/* Back button */}
                            <Link
                                href="/learn"
                                className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition group"
                            >
                                <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                                Back to Courses
                            </Link>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Course Info */}
                                <div className="lg:col-span-2 space-y-4">
                                    {/* Badges */}
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                            {course.category}
                                        </span>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getLevelColor(course.level)}`}>
                                            {course.level}
                                        </span>
                                    </div>

                                    {/* Title */}
                                    <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight">
                                        {course.title}
                                    </h1>

                                    {/* Description */}
                                    <p className="text-slate-400 leading-relaxed">
                                        {course.description}
                                    </p>

                                    {/* Stats */}
                                    <div className="flex flex-wrap items-center gap-4 text-sm">
                                        {course.rating > 0 && (
                                            <div className="flex items-center gap-1.5">
                                                <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                                                <span className="font-semibold text-white">{course.rating.toFixed(1)}</span>
                                                <span className="text-slate-500">({course.ratingCount} reviews)</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-1.5 text-slate-400">
                                            <Users className="h-4 w-4" />
                                            <span>{course.enrollmentCount.toLocaleString()} students</span>
                                        </div>
                                        {course.durationHours && (
                                            <div className="flex items-center gap-1.5 text-slate-400">
                                                <Clock className="h-4 w-4" />
                                                <span>{course.durationHours} hours</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Instructor */}
                                    {course.instructor && (
                                        <div className="flex items-center gap-3 pt-2">
                                            <div className="h-10 w-10 rounded-full bg-linear-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-semibold text-sm">
                                                {course.instructor.name.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <div>
                                                <p className="font-medium text-white text-sm">{course.instructor.name}</p>
                                                <p className="text-slate-500 text-xs">{course.instructor.title}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Course Card */}
                                <div className="lg:col-span-1">
                                    <div className="bg-slate-800/80 backdrop-blur rounded-2xl border border-slate-700/50 overflow-hidden shadow-xl">
                                        {/* Video Preview */}
                                        <div className="aspect-video bg-linear-to-br from-emerald-600 to-teal-700 flex items-center justify-center cursor-pointer group relative">
                                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition" />
                                            <div className="relative bg-white/20 backdrop-blur-sm rounded-full p-4 group-hover:scale-110 transition-transform">
                                                <Play className="h-8 w-8 text-white fill-white" />
                                            </div>
                                        </div>

                                        <div className="p-5 space-y-4">
                                            {/* Price */}
                                            <div>
                                                {course.isFree ? (
                                                    <span className="text-2xl font-bold text-emerald-400">Free</span>
                                                ) : (
                                                    <div className="flex items-baseline gap-2">
                                                        <span className="text-2xl font-bold text-white">
                                                            ${course.discountPrice || course.price}
                                                        </span>
                                                        {course.discountPrice && (
                                                            <span className="text-sm text-slate-500 line-through">${course.price}</span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {/* CTA Button */}
                                            <button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-semibold transition-all shadow-lg shadow-emerald-600/20 hover:shadow-emerald-500/30">
                                                Enroll Now
                                            </button>

                                            {/* Course Info */}
                                            <div className="space-y-3 text-sm pt-2 border-t border-slate-700/50">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-slate-400">Level</span>
                                                    <span className="font-medium text-white">{course.level}</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-slate-400">Duration</span>
                                                    <span className="font-medium text-white">{course.durationHours} hours</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-slate-400">Certificate</span>
                                                    <Award className="h-4 w-4 text-amber-400" />
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center justify-center gap-4 pt-2 border-t border-slate-700/50">
                                                <button className="p-2 text-slate-400 hover:text-rose-400 transition" title="Wishlist">
                                                    <Heart className="h-5 w-5" />
                                                </button>
                                                <button className="p-2 text-slate-400 hover:text-emerald-400 transition" title="Share">
                                                    <Share2 className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tabs & Content */}
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Main Content */}
                            <div className="lg:col-span-2">
                                {/* Tab Navigation */}
                                <div className="flex gap-1 mb-8 bg-slate-800/50 p-1 rounded-xl w-fit">
                                    {(['overview', 'curriculum', 'instructor'] as const).map(tab => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveTab(tab)}
                                            className={`px-5 py-2 rounded-lg text-sm font-medium capitalize transition-all ${activeTab === tab
                                                ? 'bg-emerald-600 text-white shadow-lg'
                                                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                                                }`}
                                        >
                                            {tab}
                                        </button>
                                    ))}
                                </div>

                                {/* Overview Tab */}
                                {activeTab === 'overview' && (
                                    <div className="space-y-8">
                                        {(course.longDescription || course.description) && (
                                            <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
                                                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                                    <BookOpen className="h-5 w-5 text-emerald-400" />
                                                    About This Course
                                                </h3>
                                                <p className="text-slate-300 leading-relaxed">
                                                    {course.longDescription || course.description}
                                                </p>
                                            </div>
                                        )}

                                        {course.whatYouLearn && course.whatYouLearn.length > 0 && (
                                            <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
                                                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                                    <Zap className="h-5 w-5 text-amber-400" />
                                                    What You'll Learn
                                                </h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    {course.whatYouLearn.map((item, index) => (
                                                        <div key={index} className="flex items-start gap-3">
                                                            <CheckCircle className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                                                            <span className="text-slate-300 text-sm">{item}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {course.requirements && course.requirements.length > 0 && (
                                            <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
                                                <h3 className="text-lg font-semibold text-white mb-4">Requirements</h3>
                                                <ul className="space-y-2">
                                                    {course.requirements.map((item, index) => (
                                                        <li key={index} className="text-slate-300 text-sm flex items-start gap-2">
                                                            <span className="text-emerald-400 mt-1">•</span>
                                                            <span>{item}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Curriculum Tab */}
                                {activeTab === 'curriculum' && (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between mb-6">
                                            <h3 className="text-lg font-semibold text-white">Course Curriculum</h3>
                                            {course.modules && (
                                                <span className="text-sm text-slate-400">{course.modules.length} modules</span>
                                            )}
                                        </div>

                                        {course.modules && course.modules.length > 0 ? (
                                            <div className="space-y-3">
                                                {course.modules.map((module, index) => (
                                                    <div
                                                        key={module.id}
                                                        className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden hover:border-emerald-500/30 transition"
                                                    >
                                                        <div className="p-4 flex items-center justify-between">
                                                            <div className="flex items-center gap-4">
                                                                <span className="bg-emerald-600 text-white w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold">
                                                                    {index + 1}
                                                                </span>
                                                                <div>
                                                                    <h4 className="font-medium text-white">{module.title}</h4>
                                                                    {module.description && (
                                                                        <p className="text-slate-400 text-sm mt-0.5">{module.description}</p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-3 text-sm text-slate-400">
                                                                {module.durationMinutes && (
                                                                    <span className="flex items-center gap-1">
                                                                        <Clock className="h-4 w-4" />
                                                                        {module.durationMinutes} min
                                                                    </span>
                                                                )}
                                                                {module.isFree ? (
                                                                    <span className="text-emerald-400 text-xs font-medium">Free</span>
                                                                ) : (
                                                                    <Lock className="h-4 w-4" />
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-8 text-center">
                                                <BookOpen className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                                                <p className="text-slate-400">Curriculum coming soon...</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Instructor Tab */}
                                {activeTab === 'instructor' && course.instructor && (
                                    <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
                                        <div className="flex items-start gap-5">
                                            <div className="h-20 w-20 rounded-2xl bg-linear-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                                                {course.instructor.name.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-xl font-semibold text-white">{course.instructor.name}</h3>
                                                <p className="text-slate-400">{course.instructor.title}</p>
                                                {course.instructor.rating && (
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                                                        <span className="text-white font-medium">{course.instructor.rating.toFixed(1)}</span>
                                                        <span className="text-slate-500 text-sm">instructor rating</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {course.instructor.bio && (
                                            <div className="mt-6 pt-6 border-t border-slate-700/50">
                                                <h4 className="font-medium text-white mb-3">About</h4>
                                                <p className="text-slate-300 leading-relaxed">{course.instructor.bio}</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Sidebar - Course Includes */}
                            <div className="lg:col-span-1">
                                <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6 sticky top-6">
                                    <h4 className="font-semibold text-white mb-5">Course Includes</h4>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 text-sm">
                                            <div className="p-2 bg-emerald-500/10 rounded-lg">
                                                <Play className="h-4 w-4 text-emerald-400" />
                                            </div>
                                            <span className="text-slate-300">{course.durationHours || '10'}+ hours of video content</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm">
                                            <div className="p-2 bg-emerald-500/10 rounded-lg">
                                                <BookOpen className="h-4 w-4 text-emerald-400" />
                                            </div>
                                            <span className="text-slate-300">{course.modules?.length || 0} modules</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm">
                                            <div className="p-2 bg-emerald-500/10 rounded-lg">
                                                <Award className="h-4 w-4 text-emerald-400" />
                                            </div>
                                            <span className="text-slate-300">Certificate of completion</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm">
                                            <div className="p-2 bg-emerald-500/10 rounded-lg">
                                                <Clock className="h-4 w-4 text-emerald-400" />
                                            </div>
                                            <span className="text-slate-300">Lifetime access</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm">
                                            <div className="p-2 bg-emerald-500/10 rounded-lg">
                                                <Download className="h-4 w-4 text-emerald-400" />
                                            </div>
                                            <span className="text-slate-300">Downloadable resources</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>

                {/* Floating AI Widget for course help */}
                <AIWidget
                    type="floating"
                    position="bottom-right"
                    pageType="course"
                    pageData={{ title: course.title, category: course.category }}
                    quickPrompts={[
                        `Explain ${course.title}`,
                        "What will I learn?",
                        "Career benefits?"
                    ]}
                />
            </div>
        </div>
    );
}
