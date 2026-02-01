/**
 * Shared React Query hooks for education data
 */

import { useQuery } from '@tanstack/react-query';
import { get } from '@/services/api';

// Types
export interface Course {
    id: number;
    title: string;
    slug: string;
    description: string;
    thumbnail?: string;
    duration: number;
    level: string;
    category: string;
    lessonsCount: number;
    enrolledCount: number;
    rating: number;
    isFree: boolean;
    price?: number;
}

export interface Lesson {
    id: number;
    title: string;
    order: number;
    duration: number;
    isCompleted?: boolean;
}

// Query keys
export const educationQueryKeys = {
    courses: (limit?: number, category?: string) => ['education', 'courses', limit, category] as const,
    course: (slug: string) => ['education', 'course', slug] as const,
    enrollments: () => ['education', 'enrollments'] as const,
};

export interface CoursesResponse {
    courses: Course[];
    total: number;
}

/**
 * Hook for courses list - cached for 2 minutes
 */
export function useCourses(limit = 20, category?: string) {
    return useQuery({
        queryKey: educationQueryKeys.courses(limit, category),
        queryFn: () => get<CoursesResponse>(`/education/courses`, { limit, ...(category && { category }) }),
        staleTime: 2 * 60 * 1000,
    });
}

/**
 * Hook for single course detail - cached for 5 minutes
 */
export function useCourseDetail(slug: string) {
    return useQuery({
        queryKey: educationQueryKeys.course(slug),
        queryFn: () => get<Course & { lessons: Lesson[] }>(`/education/courses/${slug}`),
        staleTime: 5 * 60 * 1000,
        enabled: !!slug,
    });
}

/**
 * Hook for user enrollments - cached for 1 minute
 */
export function useEnrollments() {
    return useQuery({
        queryKey: educationQueryKeys.enrollments(),
        queryFn: () => get<any[]>('/education/enrollments'),
        staleTime: 60 * 1000,
    });
}
