/**
 * OneSignal Push Notification Service for Frontend
 * Handles device registration and notification permissions
 */

// OneSignal App ID - set this in environment
const ONESIGNAL_APP_ID = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID || '';

interface OneSignalWindow extends Window {
    OneSignal?: any;
}

declare const window: OneSignalWindow;

/**
 * Initialize OneSignal SDK
 * Call this once on app load
 */
export async function initOneSignal(): Promise<boolean> {
    if (!ONESIGNAL_APP_ID) {
        console.warn('[OneSignal] App ID not configured');
        return false;
    }

    if (typeof window === 'undefined') return false;

    try {
        // Load OneSignal SDK dynamically
        if (!window.OneSignal) {
            await loadOneSignalScript();
        }

        await window.OneSignal.init({
            appId: ONESIGNAL_APP_ID,
            allowLocalhostAsSecureOrigin: true, // For development
            notifyButton: {
                enable: true,
            },
        });

        console.log('[OneSignal] Initialized successfully');
        return true;
    } catch (error) {
        console.error('[OneSignal] Init failed:', error);
        return false;
    }
}

/**
 * Load OneSignal SDK script
 */
function loadOneSignalScript(): Promise<void> {
    return new Promise((resolve, reject) => {
        if (window.OneSignal) {
            resolve();
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://cdn.onesignal.com/sdks/OneSignalSDK.js';
        script.async = true;
        script.onload = () => {
            window.OneSignal = window.OneSignal || [];
            resolve();
        };
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

/**
 * Request notification permission from user
 */
export async function requestPermission(): Promise<string> {
    if (!window.OneSignal) return 'denied';

    try {
        const permission = await window.OneSignal.Notifications.requestPermission();
        return permission ? 'granted' : 'denied';
    } catch (error) {
        console.error('[OneSignal] Permission request failed:', error);
        return 'denied';
    }
}

/**
 * Check if user has granted permission
 */
export async function hasPermission(): Promise<boolean> {
    if (!window.OneSignal) return false;
    return await window.OneSignal.Notifications.permission;
}

/**
 * Get the OneSignal Player ID (for sending targeted notifications)
 */
export async function getPlayerId(): Promise<string | null> {
    if (!window.OneSignal) return null;

    try {
        const playerId = await window.OneSignal.User.PushSubscription.id;
        return playerId || null;
    } catch (error) {
        console.error('[OneSignal] Failed to get player ID:', error);
        return null;
    }
}

/**
 * Register device with backend
 * Call this after user grants permission
 */
export async function registerDevice(userId: number): Promise<boolean> {
    const playerId = await getPlayerId();
    if (!playerId) return false;

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/devices/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
            },
            body: JSON.stringify({
                player_id: playerId,
                platform: 'web',
                device_name: navigator.userAgent,
            }),
        });

        return response.ok;
    } catch (error) {
        console.error('[OneSignal] Device registration failed:', error);
        return false;
    }
}

/**
 * Set external user ID (link OneSignal to your user)
 */
export async function setExternalUserId(userId: string): Promise<void> {
    if (!window.OneSignal) return;

    try {
        await window.OneSignal.login(userId);
    } catch (error) {
        console.error('[OneSignal] Failed to set external user ID:', error);
    }
}

/**
 * Add tags for segmentation
 */
export async function addTags(tags: Record<string, string>): Promise<void> {
    if (!window.OneSignal) return;

    try {
        await window.OneSignal.User.addTags(tags);
    } catch (error) {
        console.error('[OneSignal] Failed to add tags:', error);
    }
}

/**
 * Listen to notification events
 */
export function onNotificationReceived(callback: (event: any) => void): void {
    if (!window.OneSignal) return;

    window.OneSignal.Notifications.addEventListener('foregroundWillDisplay', callback);
}

export function onNotificationClicked(callback: (event: any) => void): void {
    if (!window.OneSignal) return;

    window.OneSignal.Notifications.addEventListener('click', callback);
}
