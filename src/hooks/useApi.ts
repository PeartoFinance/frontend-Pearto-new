'use client';

import { useCallback, useMemo } from 'react';
import { useCountry } from '@/context/CountryContext';
import useSWR, { SWRConfiguration } from 'swr';
import { useAuth } from '@/context/AuthContext';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://apipearto.ashlya.com';

interface ApiOptions {
    headers?: Record<string, string>;
}

export function useApi() {
    const { country } = useCountry();
    const { token } = useAuth(); // Assume we can grab token from context if needed for standard fetch, though SWR below is better

    const buildHeaders = useCallback(
        (extra?: Record<string, string>) => {
            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
                'X-User-Country': country || 'US',
                ...extra,
            };

            // Auto inject auth token if we have it in standard requests
            if (token && !headers['Authorization']) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            return headers;
        },
        [country, token]
    );

    const get = useCallback(
        async <T = unknown>(url: string, options?: ApiOptions): Promise<T> => {
            const fullUrl = url.startsWith('http') ? url : `${API_BASE}${url}`;
            const response = await fetch(fullUrl, {
                method: 'GET',
                headers: buildHeaders(options?.headers),
            });
            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }
            return response.json();
        },
        [buildHeaders]
    );

    const post = useCallback(
        async <T = unknown>(url: string, data?: unknown, options?: ApiOptions): Promise<T> => {
            const fullUrl = url.startsWith('http') ? url : `${API_BASE}${url}`;
            const response = await fetch(fullUrl, {
                method: 'POST',
                headers: buildHeaders(options?.headers),
                body: data ? JSON.stringify(data) : undefined,
            });
            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }
            return response.json();
        },
        [buildHeaders]
    );

    const put = useCallback(
        async <T = unknown>(url: string, data?: unknown, options?: ApiOptions): Promise<T> => {
            const fullUrl = url.startsWith('http') ? url : `${API_BASE}${url}`;
            const response = await fetch(fullUrl, {
                method: 'PUT',
                headers: buildHeaders(options?.headers),
                body: data ? JSON.stringify(data) : undefined,
            });
            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }
            return response.json();
        },
        [buildHeaders]
    );

    const del = useCallback(
        async <T = unknown>(url: string, options?: ApiOptions): Promise<T> => {
            const fullUrl = url.startsWith('http') ? url : `${API_BASE}${url}`;
            const response = await fetch(fullUrl, {
                method: 'DELETE',
                headers: buildHeaders(options?.headers),
            });
            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }
            return response.json();
        },
        [buildHeaders]
    );

    return {
        get,
        post,
        put,
        delete: del,
        countryCode: country,
        buildHeaders,
    };
}

/**
 * A custom hook that wraps SWR with our API configuration.
 * It automatically injects the auth token, handles the base URL, 
 * and adds the custom country headers.
 */
export function useApiSWR<T>(
    endpoint: string | null, // Pass null to prevent fetching
    options?: SWRConfiguration
) {
    const { country } = useCountry();
    const { token } = useAuth();

    // Create a stable fetcher using useMemo so it doesn't trigger continuous SWR re-renders
    const fetcher = useMemo(() => {
        return async (url: string) => {
            const fullUrl = url.startsWith('http') ? url : `${API_BASE}${url}`;
            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
                'X-User-Country': country || 'US',
            };

            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const res = await fetch(fullUrl, {
                method: 'GET',
                headers,
            });

            if (!res.ok) {
                const error = new Error(`API Error: ${res.status}`);
                // Attach extra info to the error object if needed
                (error as any).info = await res.json().catch(() => null);
                (error as any).status = res.status;
                throw error;
            }

            return res.json() as Promise<T>;
        };
    }, [country, token]);

    return useSWR<T, any>(endpoint, fetcher, options);
}

export default useApi;
