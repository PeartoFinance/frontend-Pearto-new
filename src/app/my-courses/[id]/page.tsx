'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Play, CheckCircle, Clock, BookOpen } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import VideoPlayer from '@/components/common/VideoPlayer';
import { AIWidget } from '@/components/ai';
import { useAuth } from '@/context/AuthContext';
import { getMyCourse, completeModule, unenrollCourse, type MyCourseDetail, type CourseModule } from '@/services/educationService';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function MyCourseDetailPage({ params }: PageProps) {
    const resolvedParams = use(params);
    const courseId = parseInt(resolvedParams.id);

    const router = useRouter();
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const [courseData, setCourseData] = useState<MyCourseDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedModule, setSelectedModule] = useState<CourseModule | null>(null);
    const [completing, setCompleting] = useState(false);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/login?redirect=/my-courses');
            return;
        }

        if (isAuthenticated && courseId) {
            loadCourse();
        }
    }, [isAuthenticated, authLoading, courseId, router]);

    const loadCourse = async () => {
        try {
            const data = await getMyCourse(courseId);
            setCourseData(data);
            if (data.course.modules && data.course.modules.length > 0) {
                const currentModuleId = data.enrollment.currentModuleId;
                const moduleToSelect = currentModuleId
                    ? data.course.modules.find(m => m.id === currentModuleId) || data.course.modules[0]
                    : data.course.modules[0];
                setSelectedModule(moduleToSelect);
            }
        } catch (error) {
            console.error('Failed to load course:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCompleteModule = async (moduleId: number) => {
        setCompleting(true);
        try {
            await completeModule(moduleId);
            await loadCourse();

            if (courseData?.course.modules) {
                const currentIndex = courseData.course.modules.findIndex(m => m.id === moduleId);
                if (currentIndex < courseData.course.modules.length - 1) {
                    setSelectedModule(courseData.course.modules[currentIndex + 1]);
                }
            }
        } catch (error) {
            console.error('Failed to complete module:', error);
        } finally {
            setCompleting(false);
        }
    };

    const handleUnenroll = async () => {
        if (!confirm('Are you sure you want to unenroll from this course?')) return;
        try {
            await unenrollCourse(courseId);
            router.push('/my-courses');
        } catch (error) {
            console.error('Failed to unenroll:', error);
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

    if (!courseData) {
        return (
            <div className="flex h-screen bg-slate-900">
                <Sidebar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <h2 className="text-xl text-white mb-4">Course not found</h2>
                        <button onClick={() => router.push('/my-courses')} className="text-emerald-500">
                            Back to My Courses
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const { course, enrollment } = courseData;

    return (
        <div className="flex h-screen bg-slate-900">
            <Sidebar />

            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />

                <main className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-7xl mx-auto">
                        {/* Back button */}
                        <button
                            onClick={() => router.push('/my-courses')}
                            className="flex items-center gap-2 text-slate-400 hover:text-white mb-6"
                        >
                            <ArrowLeft size={20} />
                            Back to My Courses
                        </button>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Video Player / Content Area */}
                            <div className="lg:col-span-2 space-y-4">
                                {/* Video Player */}
                                <div className="bg-slate-800 rounded-xl overflow-hidden aspect-video">
                                    <VideoPlayer
                                        url={selectedModule?.videoUrl || course.videoUrl}
                                        thumbnail={course.thumbnailUrl}
                                        title={selectedModule?.title || course.title}
                                        autoplay={false}
                                    />
                                </div>

                                {/* AI Insight Widget (Inline) */}
                                <AIWidget
                                    type="inline"
                                    pageType="course_module"
                                    title="AI Learning Assistant"
                                    description="Get help with this module, summarize the video, or ask quiz questions."
                                    quickPrompts={[
                                        "Summarize this module",
                                        "Explain key concepts",
                                        "Generate a quiz",
                                        "How do I apply this?"
                                    ]}
                                    pageData={{
                                        courseId: course.id,
                                        courseTitle: course.title,
                                        moduleTitle: selectedModule?.title || course.title,
                                        moduleDescription: selectedModule?.description || course.description,
                                        instructor: course.instructor?.name
                                    }}
                                />

                                {/* Module Info */}
                                {selectedModule && (
                                    <div className="bg-slate-800 rounded-xl p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <h2 className="text-xl font-bold text-white">{selectedModule.title}</h2>
                                                <div className="flex items-center gap-4 mt-2 text-sm text-slate-400">
                                                    <span className="flex items-center gap-1">
                                                        <Clock size={14} />
                                                        {selectedModule.durationMinutes} min
                                                    </span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleCompleteModule(selectedModule.id)}
                                                disabled={completing}
                                                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-medium rounded-lg flex items-center gap-2 disabled:opacity-50"
                                            >
                                                {completing ? (
                                                    <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                                                ) : (
                                                    <CheckCircle size={16} />
                                                )}
                                                Mark Complete
                                            </button>
                                        </div>
                                        {selectedModule.description && (
                                            <p className="text-slate-400">{selectedModule.description}</p>
                                        )}
                                    </div>
                                )}

                                {/* Course Description */}
                                <div className="bg-slate-800 rounded-xl p-6">
                                    <h3 className="text-lg font-semibold text-white mb-3">About This Course</h3>
                                    <p className="text-slate-400">{course.description}</p>
                                </div>
                            </div>

                            {/* Sidebar - Modules */}
                            <div className="space-y-4">
                                {/* Progress Card */}
                                <div className="bg-slate-800 rounded-xl p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-slate-400">Your Progress</span>
                                        <span className="text-emerald-400 font-bold">{enrollment.progress}%</span>
                                    </div>
                                    <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full transition-all"
                                            style={{ width: `${enrollment.progress}%` }}
                                        />
                                    </div>
                                    {enrollment.status === 'completed' && (
                                        <div className="mt-3 flex items-center gap-2 text-emerald-400">
                                            <CheckCircle size={18} />
                                            <span className="font-medium">Course Completed!</span>
                                        </div>
                                    )}
                                </div>

                                {/* Modules List */}
                                <div className="bg-slate-800 rounded-xl overflow-hidden">
                                    <div className="p-4 border-b border-slate-700">
                                        <h3 className="font-semibold text-white">
                                            Course Content ({course.modules?.length || 0} modules)
                                        </h3>
                                    </div>
                                    <div className="max-h-[400px] overflow-y-auto">
                                        {course.modules?.map((module, index) => {
                                            const isSelected = selectedModule?.id === module.id;
                                            const isCompleted = enrollment.currentModuleId
                                                ? module.id <= enrollment.currentModuleId
                                                : false;

                                            return (
                                                <button
                                                    key={module.id}
                                                    onClick={() => setSelectedModule(module)}
                                                    className={`w-full text-left p-4 border-b border-slate-700 last:border-0 transition ${isSelected
                                                        ? 'bg-emerald-500/10'
                                                        : 'hover:bg-slate-700/50'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isCompleted
                                                            ? 'bg-emerald-500 text-black'
                                                            : isSelected
                                                                ? 'bg-emerald-500/20 text-emerald-400 ring-2 ring-emerald-500'
                                                                : 'bg-slate-700 text-slate-400'
                                                            }`}>
                                                            {isCompleted ? (
                                                                <CheckCircle size={16} />
                                                            ) : (
                                                                <span className="text-sm font-medium">{index + 1}</span>
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className={`text-sm font-medium truncate ${isSelected ? 'text-emerald-400' : 'text-white'
                                                                }`}>
                                                                {module.title}
                                                            </p>
                                                            <p className="text-xs text-slate-500 flex items-center gap-1">
                                                                <Clock size={10} />
                                                                {module.durationMinutes} min
                                                            </p>
                                                        </div>
                                                        {isSelected && <Play size={14} className="text-emerald-400" />}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Instructor */}
                                {course.instructor && (
                                    <div className="bg-slate-800 rounded-xl p-4">
                                        <h3 className="font-semibold text-white mb-3">Instructor</h3>
                                        <div className="flex items-center gap-3">
                                            {course.instructor.avatarUrl ? (
                                                <img
                                                    src={course.instructor.avatarUrl}
                                                    alt={course.instructor.name}
                                                    className="w-12 h-12 rounded-full object-cover border-2 border-slate-600"
                                                />
                                            ) : (
                                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-lg">
                                                    {course.instructor.name.split(' ').map(n => n[0]).join('')}
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-medium text-white">{course.instructor.name}</p>
                                                {course.instructor.title && (
                                                    <p className="text-sm text-slate-400">{course.instructor.title}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Unenroll */}
                                <button
                                    onClick={handleUnenroll}
                                    className="w-full py-2 text-red-400 hover:text-red-300 text-sm"
                                >
                                    Unenroll from this course
                                </button>
                            </div>
                        </div>
                    </div>
                </main>

                {/* Floating AI Widget */}
                <AIWidget
                    type="floating"
                    position="bottom-right"
                    pageType="course_study"
                    pageData={{
                        courseId: course.id,
                        courseTitle: course.title,
                        currentModule: selectedModule?.title,
                        progress: enrollment.progress
                    }}
                />
            </div>
        </div>
    );
}
