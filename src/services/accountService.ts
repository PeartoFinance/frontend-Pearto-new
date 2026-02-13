/**
 * Account Service
 * Handles data backup/restore and account management operations
 */

// Use same API_BASE pattern as api.ts for consistency
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://apipearto.ashlya.com/api';

function getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
}

function getAuthHeaders(): HeadersInit {
    const token = getAuthToken();
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
    };
}

// ============ Backup Operations ============

/**
 * Export user data as JSON file (triggers download)
 */
export async function exportBackup(): Promise<void> {
    // Get token directly from localStorage at runtime
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

    // Validate token before making request
    if (!token) {
        throw new Error('Not authenticated. Please log in again.');
    }

    console.log('[Export] Token found:', token ? 'Yes' : 'No');

    const response = await fetch(`${API_BASE}/backup/export`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        let errorMessage = 'Failed to export data';
        try {
            const error = await response.json();
            errorMessage = error.error || errorMessage;
        } catch {
            // Response might not be JSON
        }
        throw new Error(errorMessage);
    }

    // Get filename from Content-Disposition header or generate one
    const contentDisposition = response.headers.get('Content-Disposition');
    let filename = `pearto_backup_${new Date().toISOString().split('T')[0]}.json`;
    if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^"]+)"?/);
        if (match) filename = match[1];
    }

    // Download the file
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
}

/**
 * Import user data from JSON file
 */
export async function importBackup(file: File): Promise<{ success: boolean; message: string }> {
    const token = getAuthToken();

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE}/backup/import`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
        body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Failed to import data');
    }

    return data;
}

// ============ Account Status ============

export interface AccountStatus {
    status: 'active' | 'deactivated' | 'suspended' | 'deleted';
    deactivatedAt: string | null;
    deactivationReason: string | null;
    createdAt: string | null;
}

/**
 * Get current account status
 */
export async function getAccountStatus(): Promise<AccountStatus> {
    const response = await fetch(`${API_BASE}/account/status`, {
        method: 'GET',
        headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Failed to get account status');
    }

    return data;
}

// ============ Account Management ============

/**
 * Deactivate the user's account
 */
export async function deactivateAccount(password: string, reason?: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE}/account/deactivate`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ password, reason: reason || 'User requested' }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Failed to deactivate account');
    }

    return data;
}

/**
 * Reactivate a deactivated account (doesn't require auth token)
 */
export async function reactivateAccount(email: string, password: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE}/account/reactivate`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Failed to reactivate account');
    }

    return data;
}

/**
 * Permanently delete the user's account
 */
export async function deleteAccountPermanently(password: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE}/account/delete-permanently`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ password, confirmation: 'DELETE' }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Failed to delete account');
    }

    return data;
}
