/**
 * API Client with 403 Error Handling
 * Intercepts 403 responses and redirects to appropriate pages
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://apipearto.ashlya.com/api';

export interface ApiError {
    status: number;
    error: string;
    isAccountError?: boolean;
}

/**
 * Check if the error indicates a deactivated/deleted account
 */
function isAccountStatusError(status: number, errorMessage: string): 'deactivated' | 'deleted' | 'suspended' | null {
    if (status !== 403) return null;

    const msg = errorMessage.toLowerCase();
    if (msg.includes('deactivated')) return 'deactivated';
    if (msg.includes('deleted')) return 'deleted';
    if (msg.includes('suspended')) return 'suspended';
    return null;
}

/**
 * Handle account status errors by clearing auth and redirecting
 */
function handleAccountError(accountStatus: 'deactivated' | 'deleted' | 'suspended') {
    // Clear auth data (using correct keys)
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');

    // Redirect based on status
    if (accountStatus === 'deactivated') {
        window.location.href = '/auth/reactivate';
    } else if (accountStatus === 'deleted') {
        window.location.href = '/auth/account-deleted';
    } else if (accountStatus === 'suspended') {
        // Suspended accounts go to a contact support page
        window.location.href = '/auth/account-deleted';
    }
}

/**
 * Authenticated fetch wrapper with 403 handling
 */
export async function apiFetch(
    endpoint: string,
    options: RequestInit = {}
): Promise<Response> {
    const token = localStorage.getItem('auth_token');

    const headers: HeadersInit = {
        ...options.headers,
    };

    // Add auth header if token exists and not explicitly provided
    if (token && !('Authorization' in headers)) {
        (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    // DEBUG: Log token state
    const shortEndpoint = endpoint.split('?')[0];
    const hasAuth = 'Authorization' in headers;
    console.log(`[apiClient DEBUG] ${shortEndpoint} → token: ${token ? 'YES' : 'NO'}, auth header: ${hasAuth}`);

    // Add content-type if not provided and body exists
    if (options.body && !('Content-Type' in headers) && !(options.body instanceof FormData)) {
        (headers as Record<string, string>)['Content-Type'] = 'application/json';
    }

    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;

    const response = await fetch(url, {
        ...options,
        headers,
    });

    // Check for 401 expired token errors — only clear auth if we sent a token
    // AND the token hasn't been refreshed by a newer login since this request started
    if (response.status === 401 && token) {
        const currentToken = localStorage.getItem('auth_token');
        if (currentToken === token) {
            console.warn('[apiClient] 401 Unauthorized — clearing auth data');
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_user');
            window.dispatchEvent(new CustomEvent('auth:expired'));
        } else {
            console.log('[apiClient] 401 received but token has changed — skipping auth clear');
        }
    }

    // Check for 403 account status errors
    if (response.status === 403) {
        try {
            const clonedResponse = response.clone();
            const data = await clonedResponse.json();
            const accountStatus = isAccountStatusError(403, data.error || '');

            if (accountStatus) {
                handleAccountError(accountStatus);
                throw new Error(data.error);
            }
        } catch (e) {
            // If we can't parse JSON or it's not an account error, continue with original response
            if (e instanceof Error && e.message.includes('deactivated')) {
                throw e;
            }
        }
    }

    return response;
}

/**
 * JSON API fetch - parses response as JSON
 */
export async function apiFetchJson<T = unknown>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const response = await apiFetch(endpoint, options);

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(error.error || `Request failed with status ${response.status}`);
    }

    return response.json();
}
