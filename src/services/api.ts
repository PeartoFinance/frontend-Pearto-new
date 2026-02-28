/**
 * apiClient.ts
 * Unified fetch wrapper with auth, error handling, and country/email headers.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://apipearto.ashlya.com/api';
const USER_COUNTRY_KEY = 'user_country';

// --- Interfaces ---

interface ApiOptions extends RequestInit {
    params?: Record<string, string | number | boolean>;
    /** Request timeout in ms. Default: 15000. Search/discovery endpoints should use ≥5000. */
    timeout?: number;
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
    const { params, timeout, ...fetchOptions } = options;
    const url = createUrl(endpoint, params);

    // Determine timeout: search/discovery endpoints get longer timeouts to avoid
    // cutting off the backend's "Discovery Lock" (which can take ~2s per the integration guide)
    const shortEndpoint = endpoint.split('?')[0];
    const isDiscovery = /search|discover/i.test(shortEndpoint);
    const timeoutMs = timeout ?? (isDiscovery ? 10000 : 15000);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
    };

    // Extract storage data
    const token = getAuthToken();
    const country = getUserCountry();
    const userEmail = getUserEmail();

    // DEBUG: Log token state for every request
    if (token) {
        console.log(`[API DEBUG] ${shortEndpoint} → token: ${token.substring(0, 15)}...${token.substring(token.length - 10)}`);
    } else {
        console.log(`[API DEBUG] ${shortEndpoint} → NO TOKEN`);
    }

    // Attach identification headers if available
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (userEmail) headers['X-User-Email'] = userEmail;
    if (country) headers['X-User-Country'] = country;

    try {
        const response = await fetch(url, { ...fetchOptions, headers, signal: controller.signal });

        if (!response.ok) {
            // Handle 401 — expired or invalid token → auto-logout
            // Only clear if the token we sent is still the current token (prevents
            // a stale 401 from clearing a freshly-issued token after re-login)
            if (response.status === 401 && token) {
                const currentToken = localStorage.getItem('auth_token');
                if (currentToken === token) {
                    console.warn('[API] 401 Unauthorized — clearing auth data');
                    localStorage.removeItem('auth_token');
                    localStorage.removeItem('auth_user');
                    // Notify AuthContext to update its React state
                    window.dispatchEvent(new CustomEvent('auth:expired'));
                } else {
                    console.log('[API] 401 received but token has changed — skipping auth clear');
                }
            }

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
        // Handle request timeout (AbortController)
        if (error.name === 'AbortError') {
            const timeoutError = new Error('Request timed out. Please try again.') as ApiError;
            timeoutError.status = 0;
            throw timeoutError;
        }
        // Handle network/connection errors
        if (error instanceof TypeError && error.message === 'Failed to fetch') {
            const networkError = new Error('Unable to connect to API server.') as ApiError;
            networkError.status = 0;
            throw networkError;
        }
        throw error;
    } finally {
        clearTimeout(timeoutId);
    }
}

// --- HTTP Method Helpers ---

export const get = <T>(endpoint: string, params?: Record<string, string | number | boolean>) =>
    apiFetch<T>(endpoint, { method: 'GET', params });

export const post = <T>(endpoint: string, data?: unknown, opts?: { timeout?: number }) =>
    apiFetch<T>(endpoint, { method: 'POST', body: data ? JSON.stringify(data) : undefined, ...opts });

export const put = <T>(endpoint: string, data?: unknown) =>
    apiFetch<T>(endpoint, { method: 'PUT', body: data ? JSON.stringify(data) : undefined });

export const del = <T>(endpoint: string) =>
    apiFetch<T>(endpoint, { method: 'DELETE' });

export default { get, post, put, del, apiFetch, setUserCountry };