/**
 * Education Service
 * API calls for courses, enrollments, and learning progress
 */
import { get, post } from './api';

// ============ Types ============

export interface Course {
    id: number;
    title: string;
    slug: string;
    description: string;
    longDescription?: string;
    category: string;
    countryCode: string;
    level: string;
    durationHours: number;
    durationWeeks?: number;
    price: number;
    discountPrice?: number;
    thumbnailUrl: string;
    videoUrl?: string;
    isFree: boolean;
    enrollmentCount: number;
    rating: number;
    ratingCount: number;
    instructorId?: number;
    requirements?: string[];
    whatYouLearn?: string[];
    instructor?: Instructor;
    modules?: CourseModule[];
}

export interface Instructor {
    id: number;
    name: string;
    title?: string;
    bio?: string;
    avatarUrl?: string;
    rating?: number;
    studentsTaught?: number;
    coursesCount?: number;
}

export interface CourseModule {
    id: number;
    title: string;
    description?: string;
    durationMinutes: number;
    isFree: boolean;
    videoUrl?: string;
    orderIndex?: number;
}

export interface EnrolledCourse {
    enrollmentId: number;
    courseId: number;
    title: string;
    slug: string;
    thumbnailUrl: string;
    category: string;
    countryCode: string;
    level: string;
    progress: number;
    status: 'enrolled' | 'in_progress' | 'completed' | 'paused' | 'unenrolled';
    instructor: {
        id?: number;
        name: string;
        title?: string;
    };
    currentModule?: {
        id: number;
        title: string;
    };
    enrolledAt: string;
    lastActivityAt: string;
}

export interface MyCourseDetail {
    course: Course;
    enrollment: {
        status: string;
        progress: number;
        currentModuleId?: number;
    };
}

// ============ API Calls ============

/**
 * Get all published courses
 */
export const getCourses = async (params?: {
    category?: string;
    level?: string;
    free?: boolean;
    search?: string;
}): Promise<{ courses: Course[]; total: number }> => {
    const queryParams: Record<string, string> = {};
    if (params?.category) queryParams.category = params.category;
    if (params?.level) queryParams.level = params.level;
    if (params?.free) queryParams.free = 'true';
    if (params?.search) queryParams.search = params.search;

    return get('/education/courses', queryParams);
};

/**
 * Get course detail by slug
 */
export const getCourse = async (slug: string): Promise<Course> => {
    return get(`/education/courses/${slug}`);
};

/**
 * Get categories
 */
export const getCategories = async (): Promise<{ categories: string[] }> => {
    return get('/education/categories');
};

/**
 * Get instructors
 */
export const getInstructors = async (): Promise<{ instructors: Instructor[] }> => {
    return get('/education/instructors');
};

/**
 * Get user's enrolled courses
 */
export const getMyCourses = async (): Promise<{ courses: EnrolledCourse[]; total: number }> => {
    return get('/education/my-courses');
};

/**
 * Get enrolled course detail
 */
export const getMyCourse = async (courseId: number): Promise<MyCourseDetail> => {
    return get(`/education/my-courses/${courseId}`);
};

/**
 * Enroll in a course
 */
export const enrollCourse = async (courseId: number): Promise<{
    message: string;
    enrollmentId: number;
    courseId: number;
    status: string;
}> => {
    return post(`/education/courses/${courseId}/enroll`);
};

/**
 * Unenroll from a course
 */
export const unenrollCourse = async (courseId: number): Promise<{
    message: string;
    courseId: number;
    status: string;
}> => {
    return post(`/education/courses/${courseId}/unenroll`);
};

/**
 * Complete a module
 */
export const completeModule = async (moduleId: number): Promise<{
    message: string;
    courseId: number;
    moduleId: number;
    progress: number;
    status: string;
}> => {
    return post(`/education/modules/${moduleId}/complete`);
};

export default {
    getCourses,
    getCourse,
    getCategories,
    getInstructors,
    getMyCourses,
    getMyCourse,
    enrollCourse,
    unenrollCourse,
    completeModule,
};
