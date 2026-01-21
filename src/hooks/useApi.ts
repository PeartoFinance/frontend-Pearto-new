'use client';

import { useCallback } from 'react';
import { useCountry } from '@/context/CountryContext';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.pearto.com';

interface ApiOptions {
    headers?: Record<string, string>;
}

export function useApi() {
    const { country } = useCountry();

    const buildHeaders = useCallback(
        (extra?: Record<string, string>) => {
            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
                'X-User-Country': country || 'US',
                ...extra,
            };
            return headers;
        },
        [country]
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

export default useApi;
