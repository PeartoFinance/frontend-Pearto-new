/**
 * Base API client for PeartoFinance
 * Centralized fetch wrapper with auth, error handling, and country filtering
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const USER_COUNTRY_KEY = 'user_country';

interface ApiOptions extends RequestInit {
    params?: Record<string, string | number | boolean>;
}

interface ApiError extends Error {
    status: number;
    data?: unknown;
}

/**
 * Get auth token from localStorage
 */
function getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
}

/**
 * Get user country from localStorage
 */
function getUserCountry(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(USER_COUNTRY_KEY);
}

/**
 * Set user country preference
 */
export function setUserCountry(countryCode: string): void {
    if (typeof window !== 'undefined') {
        localStorage.setItem(USER_COUNTRY_KEY, countryCode.toUpperCase());
    }
}

/**
 * Create URL with query parameters
 */
function createUrl(endpoint: string, params?: Record<string, string | number | boolean>): string {
    const url = new URL(`${API_BASE}${endpoint}`);
    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                url.searchParams.append(key, String(value));
            }
        });
    }
    return url.toString();
}

/**
 * Main API fetch function
 */
export async function apiFetch<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
    const { params, ...fetchOptions } = options;
    const url = createUrl(endpoint, params);

    const token = getAuthToken();
    const country = getUserCountry();

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    // Add auth token if present
    if (token) {
        (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    // Add country header if present
    if (country) {
        (headers as Record<string, string>)['X-User-Country'] = country;
    }

    const response = await fetch(url, {
        ...fetchOptions,
        headers,
    });

    if (!response.ok) {
        const error = new Error('API Error') as ApiError;
        error.status = response.status;
        try {
            error.data = await response.json();
        } catch {
            error.data = await response.text();
        }
        throw error;
    }

    return response.json();
}

/**
 * GET request helper
 */
export async function get<T>(endpoint: string, params?: Record<string, string | number | boolean>): Promise<T> {
    return apiFetch<T>(endpoint, { method: 'GET', params });
}

/**
 * POST request helper
 */
export async function post<T>(endpoint: string, data?: unknown): Promise<T> {
    return apiFetch<T>(endpoint, {
        method: 'POST',
        body: data ? JSON.stringify(data) : undefined,
    });
}

/**
 * PUT request helper
 */
export async function put<T>(endpoint: string, data?: unknown): Promise<T> {
    return apiFetch<T>(endpoint, {
        method: 'PUT',
        body: data ? JSON.stringify(data) : undefined,
    });
}

/**
 * DELETE request helper
 */
export async function del<T>(endpoint: string): Promise<T> {
    return apiFetch<T>(endpoint, { method: 'DELETE' });
}

export default { get, post, put, del, apiFetch, setUserCountry };
