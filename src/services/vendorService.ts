/**
 * Vendor Service
 * Fetch vendor data from backend
 */
import { get, post } from './api';

export interface Vendor {
    id: string;
    name: string;
    description?: string;
    category?: string;
    services?: string[];
    rating: number;
    reviewCount: number;
    isFeatured: boolean;
    logoUrl?: string;
    website?: string;
    email?: string;
    phone?: string;
    metadata?: Record<string, any>;
    countryCode?: string;
    createdAt?: string;
}

export interface VendorFilters {
    category?: string;
    service?: string;
    featured?: boolean;
    limit?: number;
}

/**
 * Get active vendors with optional filters
 */
export async function getVendors(filters: VendorFilters = {}): Promise<Vendor[]> {
    const response = await get<{ vendors: Vendor[] }>('/public/vendors', filters as unknown as Record<string, string | number | boolean>);
    return response.vendors || [];
}

export async function getVendor(id: string): Promise<Vendor> {
    return get<Vendor>(`/public/vendors/${id}`);
}

export async function getVendorHistory(id: string, metric?: string, days: number = 365): Promise<{ date: string; value: number; metric: string }[]> {
    const params: Record<string, string | number> = { days };
    if (metric) params.metric = metric;
    return get<{ date: string; value: number; metric: string }[]>(`/public/vendors/${id}/history`, params);
}

export async function getVendorReviews(id: string, page: number = 1, limit: number = 10): Promise<{ reviews: any[]; total: number; pages: number }> {
    return get<{ reviews: any[]; total: number; pages: number }>(`/public/vendors/${id}/reviews`, { page, limit });
}

export async function submitVendorReview(id: string, data: { rating: number; comment: string }): Promise<{ ok: boolean; id: string }> {
    return post<{ ok: boolean; id: string }>(`/public/vendors/${id}/reviews`, data);
}
