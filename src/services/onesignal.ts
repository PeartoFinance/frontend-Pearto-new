/**
 * OneSignal Push Notification Service for Frontend
 * Uses the official react-onesignal npm package to avoid CDN ad-blocker issues.
 *
 * FIX for ERR_BLOCKED_BY_CLIENT: The CDN script (cdn.onesignal.com) is commonly
 * blocked by ad blockers / privacy extensions. The npm package bundles the SDK
 * locally, bypassing this issue entirely.
 */

import ReactOneSignal from 'react-onesignal';

// OneSignal App ID - set in .env.local
const ONESIGNAL_APP_ID = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID || '';

let initialized = false;
let initPromise: Promise<boolean> | null = null;

/**
 * Initialize OneSignal SDK via the npm package (avoids ad-blocker CDN blocking)
 * Call this once on app load
 */
export async function initOneSignal(): Promise<boolean> {
    if (initialized) return true;
    if (typeof window === 'undefined') return false;

    if (!ONESIGNAL_APP_ID) {
        console.warn('[OneSignal] App ID not configured — set NEXT_PUBLIC_ONESIGNAL_APP_ID');
        return false;
    }

    // Prevent duplicate init calls
    if (initPromise) return initPromise;

    initPromise = (async () => {
        try {
            await ReactOneSignal.init({
                appId: ONESIGNAL_APP_ID,
                allowLocalhostAsSecureOrigin: true,
                serviceWorkerParam: { scope: '/' },
                serviceWorkerPath: '/OneSignalSDKWorker.js',
                notifyButton: { enable: false } as any,
            });

            initialized = true;
            console.log('[OneSignal] Initialized successfully via npm package');
            return true;
        } catch (error) {
            console.error('[OneSignal] Init failed:', error);
            // Graceful degradation — don't break the app if push is blocked
            return false;
        }
    })();

    return initPromise;
}

/**
 * Request notification permission from user
 */
export async function requestPermission(): Promise<boolean> {
    if (!initialized) return false;

    try {
        await ReactOneSignal.Notifications.requestPermission();
        return ReactOneSignal.Notifications.permission === true;
    } catch (error) {
        console.error('[OneSignal] Permission request failed:', error);
        return false;
    }
}

/**
 * Check if user has granted notification permission
 */
export function hasPermission(): boolean {
    if (!initialized) return false;
    try {
        return ReactOneSignal.Notifications.permission === true;
    } catch {
        return false;
    }
}

/**
 * Get the OneSignal Push Subscription ID (replaces "Player ID" in v2)
 */
export function getSubscriptionId(): string | null {
    if (!initialized) return null;
    try {
        return ReactOneSignal.User?.PushSubscription?.id || null;
    } catch {
        return null;
    }
}

/**
 * Register the push device token with our backend
 */
export async function registerDeviceWithBackend(): Promise<boolean> {
    const subscriptionId = getSubscriptionId();
    if (!subscriptionId) {
        console.debug('[OneSignal] No subscription ID yet — user may not have granted permission');
        return false;
    }

    try {
        const token = localStorage.getItem('auth_token');
        if (!token) return false;

        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/devices/register`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    player_id: subscriptionId,
                    platform: 'web',
                    device_name: navigator.userAgent.substring(0, 200),
                }),
            }
        );
        if (response.ok) {
            console.log('[OneSignal] Device registered with backend');
        }
        return response.ok;
    } catch (error) {
        console.error('[OneSignal] Device registration failed:', error);
        return false;
    }
}

/**
 * Set external user ID so OneSignal can target by our user ID
 */
export async function setExternalUserId(userId: string): Promise<void> {
    if (!initialized) return;
    if (!userId) {
        console.warn('[OneSignal] Skpping login - invalid userId');
        return;
    }

    try {
        await ReactOneSignal.login(userId);
        console.log('[OneSignal] External user ID set:', userId);
    } catch (error) {
        console.error('[OneSignal] Failed to set external user ID:', error);
    }
}

/**
 * Clear external user ID on logout
 */
export async function clearExternalUserId(): Promise<void> {
    if (!initialized) return;

    try {
        await ReactOneSignal.logout();
    } catch (error) {
        console.error('[OneSignal] Logout failed:', error);
    }
}

/**
 * Add tags for notification segmentation
 */
export async function addTags(tags: Record<string, string>): Promise<void> {
    if (!initialized) return;

    try {
        await ReactOneSignal.User.addTags(tags);
    } catch (error) {
        console.error('[OneSignal] Failed to add tags:', error);
    }
}

/**
 * Listen to foreground notification events
 */
export function onNotificationReceived(callback: (event: any) => void): () => void {
    if (!initialized) return () => { };

    try {
        ReactOneSignal.Notifications.addEventListener('foregroundWillDisplay', callback);
        return () => {
            ReactOneSignal.Notifications.removeEventListener('foregroundWillDisplay', callback);
        };
    } catch {
        return () => { };
    }
}

/**
 * Listen to notification click events
 */
export function onNotificationClicked(callback: (event: any) => void): () => void {
    if (!initialized) return () => { };

    try {
        ReactOneSignal.Notifications.addEventListener('click', callback);
        return () => {
            ReactOneSignal.Notifications.removeEventListener('click', callback);
        };
    } catch {
        return () => { };
    }
}
