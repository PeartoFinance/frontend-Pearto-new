/**
 * News & Content Service
 * Handles articles, news, and educational content API calls
 */

import { get } from './api';

// Types
export interface Article {
    id: number;
    title: string;
    summary: string;
    content?: string;
    author: string;
    imageUrl?: string;
    category: string;
    publishedAt: string;
    readTime?: number;
    source?: string;
}

export interface NewsItem {
    id: number;
    title: string;
    summary: string;
    url: string;
    source: string;
    publishedAt: string;
    imageUrl?: string;
    category?: string;
}

export interface Course {
    id: number;
    title: string;
    description: string;
    instructor: string;
    thumbnail: string;
    duration: string;
    level: 'beginner' | 'intermediate' | 'advanced';
    progress?: number;
    rating?: number;
    enrolledCount?: number;
}

// API Functions

/**
 * Get featured articles
 */
export async function getFeaturedArticles(limit = 5): Promise<Article[]> {
    return get<Article[]>('/articles/featured', { limit });
}

/**
 * Get latest news
 */
export async function getLatestNews(limit = 10): Promise<NewsItem[]> {
    return get<NewsItem[]>('/news/latest', { limit });
}

/**
 * Get news by category
 */
export async function getNewsByCategory(category: string, limit = 10): Promise<NewsItem[]> {
    return get<NewsItem[]>('/news', { category, limit });
}

/**
 * Get trending topics
 */
export async function getTrendingTopics(): Promise<string[]> {
    return get<string[]>('/news/trending');
}

/**
 * Get available courses
 */
export async function getCourses(level?: string): Promise<Course[]> {
    return get<Course[]>('/education/courses', level ? { level } : {});
}

/**
 * Get user's enrolled courses with progress
 */
export async function getEnrolledCourses(): Promise<Course[]> {
    return get<Course[]>('/education/enrolled');
}

export default {
    getFeaturedArticles,
    getLatestNews,
    getNewsByCategory,
    getTrendingTopics,
    getCourses,
    getEnrolledCourses,
};
