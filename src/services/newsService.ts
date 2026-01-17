/**
 * News API Service
 * Handles all news-related API calls
 */

import { get } from './api';

export interface NewsArticle {
    id: string | number;
    title: string;
    summary?: string;
    description?: string;
    link?: string;
    url?: string;
    image?: string;
    source?: string;
    category?: string;
    featured?: boolean;
    slug?: string;
    author?: string;
    publishedAt?: string;
    isInternal?: boolean;
    country?: string;
}

export interface NewsResponse {
    items: NewsArticle[];
    total: number;
    limit: number;
    offset: number;
    source?: string;
}

export interface ArticleDetail {
    id: string | number;
    title: string;
    summary?: string;
    full_content?: string;
    author?: string;
    image?: string;
    category?: string;
    source?: string;
    source_type?: string;
    slug?: string;
    canonical_url?: string;
    published_at?: string;
    meta_description?: string;
    country_code?: string;
}

/**
 * Get published news articles
 */
export async function getPublishedNews(options?: {
    limit?: number;
    offset?: number;
    category?: string;
}): Promise<NewsResponse> {
    const params = new URLSearchParams();
    if (options?.limit) params.set('limit', String(options.limit));
    if (options?.offset) params.set('offset', String(options.offset));
    if (options?.category) params.set('category', options.category);

    const response = await get<NewsResponse>(`/news/published?${params.toString()}`);
    return response;
}

/**
 * Get featured news articles
 */
export async function getFeaturedNews(limit: number = 5): Promise<NewsArticle[]> {
    const response = await get<NewsArticle[]>(`/news/featured?limit=${limit}`);
    return response;
}

/**
 * Search news articles
 */
export async function searchNews(query: string, limit: number = 20): Promise<{
    q: string;
    items: NewsArticle[];
    total: number;
}> {
    const response = await get<{ q: string; items: NewsArticle[]; total: number }>(
        `/news/search?q=${encodeURIComponent(query)}&limit=${limit}`
    );
    return response;
}

/**
 * Get available categories
 */
export async function getCategories(): Promise<string[]> {
    const response = await get<string[]>('/news/categories');
    return response;
}

/**
 * Get single article by slug
 */
export async function getArticleBySlug(slug: string): Promise<{ success: boolean; data?: ArticleDetail; error?: string }> {
    const response = await get<{ success: boolean; data?: ArticleDetail; error?: string }>(
        `/news/article/${slug}`
    );
    return response;
}

/**
 * Get news headlines
 */
export async function getHeadlines(options?: {
    limit?: number;
    page?: number;
    category?: string;
}): Promise<{ articles: NewsArticle[]; page: number; limit: number }> {
    const params = new URLSearchParams();
    if (options?.limit) params.set('limit', String(options.limit));
    if (options?.page) params.set('page', String(options.page));
    if (options?.category) params.set('category', options.category);

    const response = await get<{ articles: NewsArticle[]; page: number; limit: number }>(
        `/news/headlines?${params.toString()}`
    );
    return response;
}

/**
 * Get news related to a specific stock symbol
 */
export async function getNewsByStock(symbol: string, limit: number = 10): Promise<{
    symbol: string;
    items: NewsArticle[];
    total: number;
}> {
    const response = await get<{ symbol: string; items: NewsArticle[]; total: number }>(
        `/news/stock/${symbol}?limit=${limit}`
    );
    return response;
}
