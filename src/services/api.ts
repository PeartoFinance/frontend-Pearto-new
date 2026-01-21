/**
 * apiClient.ts
 * Unified fetch wrapper with auth, error handling, and country/email headers.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.1.71:5000/api';
const USER_COUNTRY_KEY = 'user_country';

// --- Interfaces ---

interface ApiOptions extends RequestInit {
    params?: Record<string, string | number | boolean>;
}

export interface ApiError extends Error {
    status: number;
    data?: any;
}

// --- Helper Functions for Storage ---

function getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
}

function getUserCountry(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(USER_COUNTRY_KEY);
}

function getUserEmail(): string | null {
    if (typeof window === 'undefined') return null;
    try {
        const savedUser = localStorage.getItem('auth_user');
        if (savedUser) {
            const user = JSON.parse(savedUser);
            return user.email || null;
        }
    } catch {
        return null;
    }
    return null;
}

export function setUserCountry(countryCode: string): void {
    if (typeof window !== 'undefined') {
        localStorage.setItem(USER_COUNTRY_KEY, countryCode.toUpperCase());
    }
}

// --- Core Logic ---

/**
 * Creates a valid URL by merging the base with the endpoint and params.
 * Safely handles trailing/leading slashes.
 */
function createUrl(endpoint: string, params?: Record<string, string | number | boolean>): string {
    // Ensure base ends with slash and endpoint doesn't start with one for reliable joining
    const base = API_BASE.endsWith('/') ? API_BASE : `${API_BASE}/`;
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;

    try {
        const url = new URL(cleanEndpoint, base);

        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    url.searchParams.append(key, String(value));
                }
            });
        }
        return url.toString();
    } catch (error) {
        console.error('URL Error:', error);
        return `${base}${cleanEndpoint}`;
    }
}

/**
 * Main API fetch function with automatic headers and error handling
 */
export async function apiFetch<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
    const { params, ...fetchOptions } = options;
    const url = createUrl(endpoint, params);

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
    };

    // Extract storage data
    const token = getAuthToken();
    const country = getUserCountry();
    const userEmail = getUserEmail();

    // Attach identification headers if available
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (userEmail) headers['X-User-Email'] = userEmail;
    if (country) headers['X-User-Country'] = country;

    try {
        const response = await fetch(url, { ...fetchOptions, headers });

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
    } catch (error: any) {
        // Handle network/connection errors
        if (error instanceof TypeError && error.message === 'Failed to fetch') {
            const networkError = new Error('Unable to connect to API server.') as ApiError;
            networkError.status = 0;
            throw networkError;
        }
        throw error;
    }
}

// --- HTTP Method Helpers ---

export const get = <T>(endpoint: string, params?: Record<string, string | number | boolean>) =>
    apiFetch<T>(endpoint, { method: 'GET', params });

export const post = <T>(endpoint: string, data?: unknown) =>
    apiFetch<T>(endpoint, { method: 'POST', body: data ? JSON.stringify(data) : undefined });

export const put = <T>(endpoint: string, data?: unknown) =>
    apiFetch<T>(endpoint, { method: 'PUT', body: data ? JSON.stringify(data) : undefined });

export const del = <T>(endpoint: string) =>
    apiFetch<T>(endpoint, { method: 'DELETE' });

export default { get, post, put, del, apiFetch, setUserCountry };