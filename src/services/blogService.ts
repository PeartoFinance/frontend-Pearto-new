/**
 * Blog API Service
 * Handles all blog-related API calls
 */

import { get } from './api';

export interface BlogPost {
    id: string;
    title: string;
    slug: string;
    excerpt?: string;
    content?: string;
    featuredImage?: string;
    status: string;
    isFeatured: boolean;
    viewCount: number;
    tags: string[];
    categoryId?: number;
    authorId?: number;
    metaTitle?: string;
    metaDescription?: string;
    countryCode?: string;
    publishedAt?: string;
    createdAt?: string;
    category?: BlogCategory;
}

export interface BlogResponse {
    items: BlogPost[];
    total: number;
    limit: number;
    offset: number;
}

export interface BlogCategory {
    id: number;
    name: string;
    slug: string;
    icon?: string;
    color?: string;
    count: number;
}

/**
 * Get published blog posts
 */
export async function getPublishedPosts(options?: {
    limit?: number;
    page?: number;
    offset?: number;
    category?: string;
    search?: string;
}): Promise<BlogResponse> {
    const params = new URLSearchParams();
    const limit = options?.limit || 20;
    params.set('limit', String(limit));

    let offset = options?.offset || 0;
    if (options?.page) {
        offset = (options.page - 1) * limit;
    }
    params.set('offset', String(offset));

    if (options?.category) params.set('category', options.category);
    if (options?.search) params.set('search', options.search);

    return get<BlogResponse>(`/blog/published?${params.toString()}`);
}

/**
 * Get featured blog posts
 */
export async function getFeaturedPosts(limit: number = 5): Promise<BlogPost[]> {
    return get<BlogPost[]>(`/blog/featured?limit=${limit}`);
}

/**
 * Get a single blog post by slug
 */
export async function getPostBySlug(slug: string): Promise<BlogPost> {
    return get<BlogPost>(`/blog/${encodeURIComponent(slug)}`);
}

/**
 * Get blog categories with counts
 */
export async function getBlogCategories(): Promise<BlogCategory[]> {
    const response = await get<{ categories: BlogCategory[] }>('/blog/categories');
    return response.categories || [];
}
