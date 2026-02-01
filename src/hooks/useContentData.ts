/**
 * Shared React Query hooks for content data with built-in caching
 * These hooks cache static content that rarely changes (FAQ, testimonials, etc.)
 */

import { useQuery } from '@tanstack/react-query';
import { get } from '@/services/api';

// Query keys for consistent cache management
export const contentQueryKeys = {
    faq: (homepage?: boolean) => ['content', 'faq', homepage] as const,
    testimonials: (limit?: number) => ['content', 'testimonials', limit] as const,
    news: (limit?: number, category?: string) => ['content', 'news', limit, category] as const,
    courses: (limit?: number) => ['content', 'courses', limit] as const,
    tools: () => ['content', 'tools'] as const,
};

// Types
interface FAQ {
    id: string;
    question: string;
    answer: string;
    category: string;
}

interface Testimonial {
    id: number;
    name: string;
    title: string;
    company: string;
    avatarUrl: string;
    content: string;
    rating: number;
    createdAt: string;
}

interface NewsItem {
    id: number;
    title: string;
    summary: string;
    image?: string;
    slug: string;
    publishedAt: string;
    category: string;
}

/**
 * Hook for FAQs - cached for 5 minutes (static content)
 */
export function useFAQ(homepage = true) {
    return useQuery({
        queryKey: contentQueryKeys.faq(homepage),
        queryFn: () => get<FAQ[]>(`/content/faq${homepage ? '?homepage=true' : ''}`),
        staleTime: 5 * 60 * 1000, // 5 minutes for static content
    });
}

/**
 * Hook for Testimonials - cached for 5 minutes
 */
export function useTestimonials(limit = 6) {
    return useQuery({
        queryKey: contentQueryKeys.testimonials(limit),
        queryFn: () => get<Testimonial[]>(`/content/testimonials?limit=${limit}`),
        staleTime: 5 * 60 * 1000,
    });
}

/**
 * Hook for News - cached for 1 minute
 */
export function useNews(limit = 10, category?: string) {
    return useQuery({
        queryKey: contentQueryKeys.news(limit, category),
        queryFn: () => get<NewsItem[]>(`/news${category ? `?category=${category}&` : '?'}limit=${limit}`),
        staleTime: 60 * 1000,
    });
}

/**
 * Hook for Tools list - cached for 5 minutes
 */
export function useTools() {
    return useQuery({
        queryKey: contentQueryKeys.tools(),
        queryFn: () => get<any[]>('/api/tools'),
        staleTime: 5 * 60 * 1000,
    });
}

interface ForexRate {
    pair: string;
    rate: number;
    change: number;
    changePercent: number;
    high: number;
    low: number;
}

/**
 * Hook for Forex rates - cached for 30s
 */
export function useForexRates(baseCurrency = 'USD') {
    return useQuery({
        queryKey: ['content', 'forex', baseCurrency],
        queryFn: () => get<ForexRate[]>('/content/forex', { base: baseCurrency }),
        staleTime: 30 * 1000,
    });
}

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
    slug?: string;
}

/**
 * Hook for Featured Articles - cached for 5 minutes
 */
export function useFeaturedArticles(limit = 5) {
    return useQuery({
        queryKey: ['content', 'featured', limit],
        queryFn: () => get<Article[]>('/articles/featured', { limit }),
        staleTime: 5 * 60 * 1000,
    });
}

// Re-export types
export type { FAQ, Testimonial, NewsItem, ForexRate };
